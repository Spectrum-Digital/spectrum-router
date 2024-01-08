import groupBy from 'lodash/groupBy.js'
import { BytesLike, NodeVolatility, CompressedPath, InflatedPath, DEXConfiguration, Token } from '../typings/index.js'
import { Compression } from '../helpers/compression.js'
import { parallelizeVolatility } from '../helpers/parallelization.js'
import {
  BlockheightCheckpointCacheController,
  GraphCacheController,
  PathsCacheController,
  TokensCacheController,
  VolatilityCacheController,
} from '../controllers/cache-controllers.js'
import { FIVE_MINUTES_MS } from '../utils/index.js'

type PathWithVolatilityIsNotStable = Array<InflatedPath[number] & { stable: false; volatility: NodeVolatility }>
type Pool = { token0: Token; token1: Token; stable: boolean; blockNumber: number }
type GetPoolsCallback = (startBlockNumber: number) => Promise<{ error: true } | { error: false; pools: Pool[]; latestBlockNumber: number }>

type ISpectrumRouter = {
  dexConfiguration: DEXConfiguration
  getPoolsCallback: GetPoolsCallback
  getPoolsCallbackTimeoutMS?: number
  weightedNodes: BytesLike[]
  redisURL: string
  redisPrefix: string
  verbose?: boolean
}

export class SpectrumRouter {
  /**
   * The underlying DEXConfiguration.
   */
  public readonly dexConfiguration: DEXConfiguration

  /**
   * The chainId of this specific router.
   */
  public readonly chainId: number

  /**
   * A unique set of nodes that take precedence when traversing the graph.
   */
  public readonly weightedNodes: BytesLike[]

  /**
   * A cache of paths between two tokens.
   */
  private readonly _pathsCache: PathsCacheController

  /**
   * A cache of our Directed Weighted Graph.
   */
  private readonly _graphCache: GraphCacheController

  /**
   * A cache of tokens known to the factory within DEXConfiguration.
   */
  private readonly _tokensCache: TokensCacheController

  /**
   * A cache of volatility between two tokens (stable vs volatile).
   */
  private readonly _volatilityCache: VolatilityCacheController

  /**
   * A cache of the blockheight checkpoint.
   */
  private readonly _blockheightCheckpointCache: BlockheightCheckpointCacheController

  /**
   * State indicating whether or not we're currently synchronizing.
   */
  private _synchronizing = false

  /**
   * State indicating whether or not we're currently initializing.
   */
  private _initializing = false

  /**
   * A callback to get the latest pools from the factory within DEXConfiguration.
   */
  private readonly _getPoolsCallback: GetPoolsCallback

  /**
   * Polling interval for the getPoolsCallback.
   * @default 5 minutes
   */
  private readonly _getPoolsCallbackTimeoutMS: number

  /**
   * Whether or not to log verbose output.
   */
  private readonly _verbosity: boolean

  constructor(params: ISpectrumRouter) {
    this.dexConfiguration = params.dexConfiguration
    this.chainId = params.dexConfiguration.chainId
    this.weightedNodes = params.weightedNodes
    this._pathsCache = new PathsCacheController(params)
    this._graphCache = new GraphCacheController(params)
    this._tokensCache = new TokensCacheController(params)
    this._volatilityCache = new VolatilityCacheController(params)
    this._blockheightCheckpointCache = new BlockheightCheckpointCacheController(params)
    this._getPoolsCallback = params.getPoolsCallback
    this._getPoolsCallbackTimeoutMS = params.getPoolsCallbackTimeoutMS ?? FIVE_MINUTES_MS
    this._verbosity = params.verbose === undefined ? true : params.verbose

    // Initialize our system
    this.__initialize()
  }

  private async __initialize(): Promise<void> {
    this._initializing = true
    await this.__synchronize()
    this._initializing = false
  }

  private async __synchronize(): Promise<void> {
    const sync = async () => {
      // Skip if we're already synchronizing
      if (this._synchronizing) return

      // Get our startBlockNumber
      const blockheightCheckpoint = await this.__getBlockheightCheckpoint()
      const startBlockNumber = blockheightCheckpoint > 0 ? blockheightCheckpoint + 1 : 0

      // Fetch the pools
      const result = await this._getPoolsCallback(startBlockNumber)

      // If we've encountered an error, then we should try again later.
      if (result.error) return

      // Add the pools to the cache
      await this.__addPools(result.pools, result.latestBlockNumber)
    }

    // Start synchronizing on boot
    await sync()

    // Synchronize every interval
    setInterval(() => void sync(), this._getPoolsCallbackTimeoutMS)
  }

  /* -----------------------------*
   * STATIC MEMBERS - PATHFINDING *
   * -----------------------------*/

  /**
   * Get a list of available paths between two tokens within a given set of routers.
   * @param tokenIn The token to input.
   * @param tokenOut The token to output.
   * @param routers The routers to search for paths through.
   * @returns A list of available paths in a compressed format.
   */
  static async getAvailablePaths(tokenIn: BytesLike, tokenOut: BytesLike, routers: SpectrumRouter[]): Promise<CompressedPath[]> {
    const paths: CompressedPath[] = []
    for (let i = 0; i < routers.length; i++) {
      const router = routers[i]!
      const candidates = await router.getAvailablePaths(tokenIn, tokenOut)
      paths.push(...candidates)
    }
    return paths
  }

  /* -----------------------------*
   * PUBLIC MEMBERS - PATHFINDING *
   * -----------------------------*/

  /**
   * Get a list of available paths between two tokens for this router.
   * @param tokenIn The token to input.
   * @param tokenOut  The token to output.
   * @returns A list of available paths in a compressed format.
   */
  public async getAvailablePaths(tokenIn: BytesLike, tokenOut: BytesLike): Promise<CompressedPath[]> {
    // Exit early if we're routing to the same token
    if (tokenIn === tokenOut) return []

    // Check if we've already cached this path
    const cached = await this.__getCachedPaths(tokenIn, tokenOut)
    if (cached.length) return cached

    // Find all available paths
    const inflatedPaths = await this.__getAvailablePaths(tokenIn, tokenOut)

    // Compress the paths
    const compressed = Compression.compressInflatedPaths(inflatedPaths)

    // Spot duplicates and remove them
    const deduped = [...new Set(compressed)]

    // Exit early if we have no paths
    if (!deduped.length) return []

    // Save the paths into cache
    await this.__updateCachedPaths(tokenIn, tokenOut, deduped)

    // Return the compressed paths
    return compressed
  }

  /* ------------------------------------*
   * PRIVATE MEMBERS - PATHFINDING - GET *
   * ------------------------------------*/

  /**
   * Compute all available paths between two tokens for this router.
   * @param tokenIn The token to input.
   * @param tokenOut The token to output.
   * @returns A list of available paths without compression.
   */
  private async __getAvailablePaths(tokenIn: BytesLike, tokenOut: BytesLike): Promise<InflatedPath[]> {
    // Find all available paths without too much recursion using weighted nodes.
    const generator = this.__traverseWeightedGraph(tokenIn, tokenOut, new Set())
    let availablePaths: Array<BytesLike[]> = []
    for await (const result of generator) {
      availablePaths.push(result)
    }

    // Each path starts with the tokenIn, remove them.
    availablePaths = availablePaths.map(nodes => nodes.slice(1))

    // Convert our nodes into paths
    const pathsWithPotentialErrors = await Promise.all(
      availablePaths.map(async nodes => {
        const result: PathWithVolatilityIsNotStable = []

        let error = false
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i]!
          const previous = result[result.length - 1]

          // Construct the `from` and `to` fields
          const from = previous ? previous.to : tokenIn
          const to = node
          const fromToken = typeof from === 'string' ? await this.__getToken(from) : from
          const toToken = await this.__getToken(to)

          // Volatility will later be used to construct the stable fields.
          const volatility = await this.__getVolatility(typeof from === 'string' ? from : from.address, to)

          // Exit early and log the error if we can't find tokens
          if (!fromToken || !toToken || !volatility) {
            error = true
            break
          }

          result.push({
            dexConfiguration: this.dexConfiguration,
            from: fromToken,
            to: toToken,
            stable: false,
            volatility: volatility,
          })
        }

        // This shouldn't happen.
        return error ? null : result
      }),
    )

    // Remove any paths that errored
    const cleanedPaths = pathsWithPotentialErrors.flatMap(path => (path ? [path] : []))

    // Inject the appropiate volatility into the paths
    const paths = cleanedPaths.reduce((acc, path) => {
      // Detect if we need to split nodes into multiple paths
      const forkedPaths = parallelizeVolatility(path)

      // Add the forks to the accumulator
      return [...acc, ...forkedPaths]
    }, [] as InflatedPath[])

    return paths
  }

  /**
   * Traverse a Directed Weighted Graph to find all available paths between two tokens.
   * @param start The token to start from.
   * @param end The token to end at.
   * @param visited A set of visited nodes, subjected to recursion.
   * @returns A generator that yields all available paths.
   */
  private async *__traverseWeightedGraph(start: BytesLike, end: BytesLike, visited: Set<BytesLike>): AsyncGenerator<BytesLike[]> {
    // Check if we've reached our destination
    if (start === end) {
      return yield [...visited, end]
    }

    // Log our current position so we don't visit it again
    visited.add(start)

    // Grab adjacent nodes
    let neighbors = await this.__getNeighbors(start)

    // Only allow weighted nodes (and the exit node) as neighbors
    neighbors = neighbors.filter(neighbor => this.weightedNodes.includes(neighbor) || neighbor === end)

    // Iterate over our neighbors
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        // We've found a new neighbor node, recurse
        yield* this.__traverseWeightedGraph(neighbor, end, visited)
      }
    }

    visited.delete(start)
  }

  /* --------------------------------------*
   * PRIVATE MEMBERS - CACHING LAYER - GET *
   * --------------------------------------*/

  /**
   * Get a list of available paths between two tokens from the cache.
   * @param tokenIn The token to input.
   * @param tokenOut The token to output.
   * @returns A list of available paths in a compressed format.
   */
  private async __getCachedPaths(tokenIn: BytesLike, tokenOut: BytesLike): Promise<CompressedPath[]> {
    return this._pathsCache.get(`${tokenIn}:${tokenOut}`)
  }

  /**
   * Get a list of nodes that are directly connected to our token.
   * @param token The token to get neighbors for.
   * @returns A list of neighbors.
   */
  private async __getNeighbors(token: BytesLike): Promise<BytesLike[]> {
    return this._graphCache.get(token)
  }

  /**
   * Get a token from the cache.
   * @param token The address of the token.
   * @returns The token.
   */
  private async __getToken(token: BytesLike): Promise<Token | undefined> {
    return this._tokensCache.get(token)
  }

  /**
   * Get the volatility of a set of tokens (a pair).
   * @param tokenA Address of an arbitrary token.
   * @param tokenB Address of an arbitrary token.
   * @returns The volatility of the pair (stable vs volatile).
   */
  private async __getVolatility(tokenA: BytesLike, tokenB: BytesLike): Promise<NodeVolatility | undefined> {
    return this._volatilityCache.get(`${tokenA}:${tokenB}`)
  }

  /**
   * Get the last synchronized blockNumber in our system.
   * @returns The blockheight checkpoint.
   */
  private async __getBlockheightCheckpoint(): Promise<number> {
    return this._blockheightCheckpointCache.get()
  }

  /* --------------------------------------*
   * PRIVATE MEMBERS - CACHING LAYER - SET *
   * --------------------------------------*/

  /**
   * Update the cache with a list of available paths between two tokens.
   * @param tokenIn Address of the input token.
   * @param tokenOut Address of the output token.
   * @param paths A list of available paths in compressed format.
   */
  private async __updateCachedPaths(tokenIn: BytesLike, tokenOut: BytesLike, paths: CompressedPath[]): Promise<void> {
    // Don't cache if we're synchronizing and/or initializing
    if (this._synchronizing || this._initializing) return

    // Store our paths into cache
    await this._pathsCache.set(`${tokenIn}:${tokenOut}`, paths)

    // TODO: store a reverse lookup of the paths
  }

  /**
   * Add a list of pools to our cache.
   * @param pools The pools to add.
   * @param latestBlockNumber The highest blockNumber recorded in the new set of pools.
   */
  private async __addPools(_pools: Pool[], latestBlockNumber: number): Promise<void> {
    // Emit we're synchronizing, this will prevent the path finder from
    // storing new paths in the cache until we're done synchronizing.
    this._synchronizing = true

    // Log our synchronization
    const blockheightCheckpoint = await this.__getBlockheightCheckpoint()
    if (this._verbosity) {
      console.log(
        `[SpectrumRouter]: Attempting to synchronize ${_pools.length} pools on ${this.dexConfiguration.name} between blocks ${blockheightCheckpoint}-${latestBlockNumber}.`,
      )
    }

    // Sort our pools from lowest to highest blockNumber
    const pools = _pools.sort((a, b) => a.blockNumber - b.blockNumber)

    // Chunk the pools into groups of 100 items so we don't overload our cache.
    // This is a bit of a hack, but it's the best we can do for now. Note: it
    // has to take into account the blockNumbers in case we get interrupted
    // while synchronizing. This assumes the first key in the group is the lowest.
    const groupedByBlockNumber = groupBy(pools, pool => pool.blockNumber)

    const chunks = Object.values(groupedByBlockNumber).reduce((acc, group) => {
      const lastChunk = acc[acc.length - 1]

      // Don't chunk the first iteration for type safety purposes.
      if (!lastChunk) {
        return [[...group]]
      }

      // This means we're on 2nd+ iteration, so we need to check if
      // we need to create a new chunk or add to the last chunk.
      if (lastChunk.length + group.length > 100) {
        return [...acc, [...group]]
      } else {
        lastChunk.push(...group)
        acc[acc.length - 1] = lastChunk
        return acc
      }
    }, [] as Pool[][])

    // Add pools synchronously, because we need to tap into the cache storage.
    // If we were to do it in parallel, then our cache map would get corrupted.
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]!

      // Add each pool in the chunk to our cache
      let highestBlockNumber = 0
      for (let k = 0; k < chunk.length; k++) {
        const pool = chunk[k]!
        await this.__addPool(pool.token0, pool.token1, pool.stable)
        highestBlockNumber = pool.blockNumber
      }

      // Update our blockheight checkpoint
      await this._blockheightCheckpointCache.set(highestBlockNumber)

      // Log our synchronization
      if (this._verbosity) {
        console.log(`[SpectrumRouter]: Synchronized ${chunk.length} pools on ${this.dexConfiguration.name}.`)
      }
    }

    // Emit we're done synchronizing
    this._synchronizing = false
  }

  /**
   * Add a pool to our cache.
   * @param token0 The first token in the pair.
   * @param token1 The second token in the pair.
   * @param stable Whether or not the pair is stable.
   */
  public async __addPool(token0: Token, token1: Token, stable: boolean): Promise<void> {
    try {
      // Store token0 in our cache
      await this._tokensCache.set(token0.address, token0)

      // Store token1 in our cache
      await this._tokensCache.set(token1.address, token1)

      // Define the volatility of the pair
      const volatility = stable ? 'stable' : 'volatile'

      // Store the volatility in our cache for direction A -> B
      let currentVolatility = await this.__getVolatility(token0.address, token1.address)
      await this._volatilityCache.set(`${token0.address}:${token1.address}`, !currentVolatility ? volatility : 'stable_volatile')

      // Now store the volatility in our cache for direction B -> A
      currentVolatility = await this.__getVolatility(token1.address, token0.address)
      await this._volatilityCache.set(`${token1.address}:${token0.address}`, !currentVolatility ? volatility : 'stable_volatile')

      // Reference the relationship between token0 and token1 in our Directed Weighted Graph.
      let current = await this.__getNeighbors(token0.address)
      await this._graphCache.set(token0.address, [...new Set([...current, token1.address])])

      // Reference the relationship between token1 and token0 in our Directed Weighted Graph.
      current = await this.__getNeighbors(token1.address)
      await this._graphCache.set(token1.address, [...new Set([...current, token0.address])])
    } catch (err) {
      console.error(err)
    }
  }
}
