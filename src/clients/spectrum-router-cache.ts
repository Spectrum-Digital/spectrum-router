import { BytesLike, DEXRouter, NodeVolatility, CompressedPath, Token } from '../typings/index.js'

type PathsCache = {
  get: (key: `${BytesLike}:${BytesLike}`) => Promise<CompressedPath[] | undefined>
  set: (key: `${BytesLike}:${BytesLike}`, value: CompressedPath[]) => Promise<void>
}

type GraphCache = {
  get: (key: BytesLike) => Promise<BytesLike[] | undefined>
  set: (key: BytesLike, value: BytesLike[]) => Promise<void>
}

type TokensCache = {
  get: (key: BytesLike) => Promise<Token | undefined>
  set: (key: BytesLike, value: Token) => Promise<void>
}

type VolatilityCache = {
  get: (key: `${BytesLike}:${BytesLike}`) => Promise<NodeVolatility | undefined>
  set: (key: `${BytesLike}:${BytesLike}`, value: NodeVolatility) => Promise<void>
}

type BlockheightCheckpointCache = {
  get: () => Promise<number | undefined>
  set: (value: number) => Promise<void>
}

type Pool = { token0: Token; token1: Token; stable: boolean }
type GetPoolsCallback = (startBlockNumber: number) => Promise<{ error: true } | { error: false; pools: Pool[]; latestBlockNumber: number }>

export type ISpectrumRouterCache = {
  dexRouter: DEXRouter
  getPoolsCallback: GetPoolsCallback
  pathsCache: PathsCache
  graphCache: GraphCache
  tokensCache: TokensCache
  volatilityCache: VolatilityCache
  blockheightCheckpointCache: BlockheightCheckpointCache
}

export abstract class SpectrumRouterCache {
  protected dexRouter: DEXRouter
  protected synchronizing = false

  private getPoolsCallback: GetPoolsCallback
  private paths: PathsCache
  private graph: GraphCache
  private tokens: TokensCache
  private volatility: VolatilityCache
  private blockheightCheckpoint: BlockheightCheckpointCache

  constructor(params: ISpectrumRouterCache) {
    this.dexRouter = params.dexRouter
    this.getPoolsCallback = params.getPoolsCallback
    this.paths = params.pathsCache
    this.graph = params.graphCache
    this.tokens = params.tokensCache
    this.volatility = params.volatilityCache
    this.blockheightCheckpoint = params.blockheightCheckpointCache

    // Start synchronizing
    this.__synchronize()
  }

  protected async getCachedPaths(tokenIn: BytesLike, tokenOut: BytesLike): Promise<CompressedPath[] | undefined> {
    return this.paths.get(`${tokenIn}:${tokenOut}`)
  }

  protected async getNeighbors(token: BytesLike): Promise<BytesLike[]> {
    const result = await this.graph.get(token)
    return result ?? []
  }

  protected async getToken(token: BytesLike): Promise<Token | undefined> {
    return this.tokens.get(token)
  }

  protected async getVolatility(tokenIn: BytesLike, tokenOut: BytesLike): Promise<NodeVolatility | undefined> {
    return this.volatility.get(`${tokenIn}:${tokenOut}`)
  }

  protected async getBlockheightCheckpoint(): Promise<number> {
    const result = await this.blockheightCheckpoint.get()
    return result ?? 0
  }

  protected async updateCachedPaths(tokenIn: BytesLike, tokenOut: BytesLike, paths: CompressedPath[]): Promise<void> {
    const nodes = await this.graph.get(tokenIn)

    // Only cache it if there are nodes available, this prevents us from caching during boot.
    if (!nodes || !nodes.length) return

    // Don't cache if we're synchronizing
    if (this.synchronizing) return

    // Cache the paths
    this.paths.set(`${tokenIn}:${tokenOut}`, paths)
  }

  private __synchronize(): void {
    const sync = async () => {
      // Skip if we're already synchronizing
      if (this.synchronizing) return

      // Get our startBlockNumber
      const blockheightCheckpoint = await this.getBlockheightCheckpoint()
      const startBlockNumber = blockheightCheckpoint > 0 ? blockheightCheckpoint + 1 : 0

      // Fetch the pools
      const result = await this.getPoolsCallback(startBlockNumber)

      // If we've encountered an error, then we should try again later.
      if (result.error) return

      // Add the pools to the cache
      await this.__addPools(result.pools, result.latestBlockNumber)
    }

    // Start synchronizing on boot
    void sync()

    // Start synchronizing every 5 minutes
    setInterval(() => void sync(), 5 * 60 * 1000)
  }

  private async __addPools(pools: Pool[], latestBlockNumber: number): Promise<void> {
    // Emit we're synchronizing, this will prevent the path finder from
    // storing new paths in the cache until we're done synchronizing.
    this.synchronizing = true

    // Log our synchronization
    const blockheightCheckpoint = await this.getBlockheightCheckpoint()
    console.log(
      `[SpectrumRouter]: Synchronizing ${pools.length} pools on ${this.dexRouter.name} between blocks ${blockheightCheckpoint}-${latestBlockNumber}.`,
    )

    // Add pools synchronously, because we need to tap into the cache storage.
    // If we were to do it in parallel, then our cache map would get corrupted.
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i]!

      try {
        await this.__addPool(pool.token0, pool.token1, pool.stable)
      } catch (err) {
        // Making sure we're catching any errors thrown by the cache.
        console.error(err)
      }
    }

    // Update our blockheight checkpoint
    await this.blockheightCheckpoint.set(latestBlockNumber)

    // Emit we're done synchronizing
    this.synchronizing = false
  }

  private async __addPool(token0: Token, token1: Token, stable: boolean): Promise<void> {
    // Register token0
    await this.tokens.set(token0.address, token0)

    // Register token1
    await this.tokens.set(token1.address, token1)

    // Register the volatility of the pair
    const volatility = stable ? 'stable' : 'volatile'
    let currentVolatility = await this.volatility.get(`${token0.address}:${token1.address}`)
    await this.volatility.set(`${token0.address}:${token1.address}`, currentVolatility === undefined ? volatility : 'stable_volatile')

    // Register the volatility of the pair (reversed)
    currentVolatility = await this.volatility.get(`${token1.address}:${token0.address}`)
    await this.volatility.set(`${token1.address}:${token0.address}`, currentVolatility === undefined ? volatility : 'stable_volatile')

    // Register token0 -> [token1]
    let current = (await this.graph.get(token0.address)) || []
    await this.graph.set(token0.address, [...new Set([...current, token1.address])])

    // Register token1 -> [token0]
    current = (await this.graph.get(token1.address)) || []
    await this.graph.set(token1.address, [...new Set([...current, token0.address])])
  }
}
