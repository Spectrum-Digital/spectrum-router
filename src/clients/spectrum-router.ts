import { getAddress } from 'viem'
import { BytesLike, DEXRouter, NodeVolatility, Path, Token } from '../typings'

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

type PathsCache = Map<`${BytesLike}:${BytesLike}`, Path[]> // tokenIn:tokenOut -> Path[]

type PathWithVolatilityIsNotStable = Array<Path[number] & { stable: false; volatility: NodeVolatility }>
type PathWithVolatility = Array<Path[number] & { stable: boolean; volatility: NodeVolatility }>

export class SpectrumRouter {
  public dexRouter: DEXRouter
  public chainId: number

  private graph: GraphCache
  private tokens: TokensCache
  private volatility: VolatilityCache
  private paths: PathsCache = new Map()
  private weightedNodes: BytesLike[] = [] // [weth, usdc, ...]
  private synchronizing = false

  constructor({
    dexRouter,
    graphCache,
    tokensCache,
    volatilityCache,
  }: {
    dexRouter: DEXRouter
    graphCache: GraphCache
    tokensCache: TokensCache
    volatilityCache: VolatilityCache
  }) {
    this.dexRouter = dexRouter
    this.chainId = dexRouter.chainId
    this.graph = graphCache
    this.tokens = tokensCache
    this.volatility = volatilityCache
  }

  static async getAvailablePaths(
    tokenIn: string,
    tokenOut: string,
    routers: SpectrumRouter[],
  ): Promise<{
    paths: Path[]
    error?: string
  }> {
    try {
      const checksummedTokenIn = getAddress(tokenIn)
      const checksummedTokenOut = getAddress(tokenOut)

      const paths: Path[] = []
      for (let i = 0; i < routers.length; i++) {
        const router = routers[i]!
        const candidates = await router.getAvailablePaths(checksummedTokenIn, checksummedTokenOut)
        paths.push(...candidates)
      }

      return { paths }
    } catch (err) {
      return { paths: [], error: 'Invalid addresses' }
    }
  }

  public async getAvailablePaths(tokenIn: BytesLike, tokenOut: BytesLike): Promise<Path[]> {
    // Exit early if we're routing to the same token
    if (tokenIn === tokenOut) return []

    // Check if we've already cached this path
    const cached = this.getCachedPaths(tokenIn, tokenOut)
    if (cached) return cached

    // Find all available paths without too much recursion
    const generator = this.findPaths(tokenIn, tokenOut, new Set())
    let availablePaths = []
    for await (const result of generator) {
      availablePaths.push(result)
    }

    // Each path starts with the tokenIn, remove them.
    availablePaths = availablePaths.map(nodes => nodes.slice(1))

    // Convert our nodes into paths
    const corruptablePaths = await Promise.all(
      availablePaths.map(async nodes => {
        const result: PathWithVolatilityIsNotStable = []

        let error = false
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i]!
          const previous = result[result.length - 1]

          // Construct the `from` and `to` fields
          const from = previous ? previous.to : tokenIn
          const to = node
          const fromToken = typeof from === 'string' ? await this.tokens.get(from) : from
          const toToken = await this.tokens.get(to)

          // Volatility will later be used to construct the stable fields.
          const volatility = await this.volatility.get(`${typeof from === 'string' ? from : from.address}:${to}`)

          // Exit early and log the error if we can't find tokens
          if (!fromToken || !toToken || !volatility) {
            error = true
            break
          }

          result.push({
            router: this.dexRouter,
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
    const cleanedPaths = corruptablePaths.flatMap(path => (path ? [path] : []))

    // Inject the appropiate volatility into the paths
    const paths = cleanedPaths.reduce((acc, path) => {
      // Detect if we need to split nodes into multiple paths
      const forkedPaths = this.detectVolatility(path)

      // Add the forks to the accumulator
      return [...acc, ...forkedPaths]
    }, [] as Path[])

    // Save the paths into cache
    void this.updateCachedPaths(tokenIn, tokenOut, paths)

    return paths
  }

  public addWeightedNodes(nodes: BytesLike[]): void {
    this.weightedNodes = [...new Set([...this.weightedNodes, ...nodes])]
  }

  public async addPools(pools: { token0: Token; token1: Token; stable: boolean }[]): Promise<void> {
    // Emit we're synchronizing, this will prevent the path finder from
    // storing new paths in the cache until we're done synchronizing.
    this.synchronizing = true

    // Add pools synchronously, because we need to tap into the cache storage.
    // If we were to do it in parallel, then our cache map would get corrupted.
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i]!
      await this.addPool(pool.token0, pool.token1, pool.stable)
    }

    this.synchronizing = false
  }

  private async addPool(token0: Token, token1: Token, stable: boolean): Promise<void> {
    // Register token0
    void (await this.tokens.set(token0.address, token0))

    // Register token1
    void (await this.tokens.set(token1.address, token1))

    // Register the volatility of the pair
    const volatility = stable ? 'stable' : 'volatile'
    let currentVolatility = await this.volatility.get(`${token0.address}:${token1.address}`)

    void (await this.volatility.set(
      `${token0.address}:${token1.address}`,
      currentVolatility === undefined ? volatility : 'stable_volatile',
    ))

    currentVolatility = await this.volatility.get(`${token1.address}:${token0.address}`)
    void (await this.volatility.set(
      `${token1.address}:${token0.address}`,
      currentVolatility === undefined ? volatility : 'stable_volatile',
    ))

    // Register token0 -> [token1]
    let current = (await this.graph.get(token0.address)) || []
    void (await this.graph.set(token0.address, [...new Set([...current, token1.address])]))

    // Register token1 -> [token0]
    current = (await this.graph.get(token1.address)) || []
    void (await this.graph.set(token1.address, [...new Set([...current, token0.address])]))
  }

  private getCachedPaths(tokenIn: BytesLike, tokenOut: BytesLike): Path[] | undefined {
    return this.paths.get(`${tokenIn}:${tokenOut}`)
  }

  private async updateCachedPaths(tokenIn: BytesLike, tokenOut: BytesLike, paths: Path[]): Promise<void> {
    const nodes = await this.graph.get(tokenIn)

    // Only cache it if there are nodes available, this prevents us from caching during boot.
    if (!nodes || !nodes.length) return

    // Don't cache if we're synchronizing
    if (this.synchronizing) return

    // Cache the paths
    this.paths.set(`${tokenIn}:${tokenOut}`, paths)
  }

  private async *findPaths(start: BytesLike, end: BytesLike, visited: Set<BytesLike>): AsyncGenerator<BytesLike[]> {
    // Check if we've reached our destination
    if (start === end) {
      return yield [...visited, end]
    }

    // Log our current position so we don't visit it again
    visited.add(start)

    // Grab adjacent nodes
    let neighbors = (await this.graph.get(start)) || []

    // Only allow weighted nodes (and the exit node) as neighbors
    neighbors = neighbors.filter(neighbor => this.weightedNodes.includes(neighbor) || neighbor === end)

    // Iterate over our neighbors
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        // We've found a new neighbor node, recurse
        yield* this.findPaths(neighbor, end, visited)
      }
    }

    visited.delete(start)
  }

  private detectVolatility(path: PathWithVolatilityIsNotStable): Path[] {
    let result: PathWithVolatility[] = [path.map(leg => ({ ...leg }))] // start with a copy of the original array

    // Check if we need to go from volatile to stable (default value is stable = false)
    for (let i = 0; i < path.length; i++) {
      const current = path[i]!
      if (current.volatility === 'stable') {
        for (let j = 0; j < result.length; j++) {
          result[j]![i]!.stable = true
        }
      }
    }

    // So far it's either stable or volatile, but not both. Now we need to fork the array if it's stable_volatile.
    // We can safely assume that the original value is volatile, so the forked version is stable.
    for (let i = 0; i < path.length; i++) {
      const current = path[i]!
      if (current.volatility === 'stable_volatile') {
        const forked = result.map(el => el.map(item => ({ ...item }))) // create a copy of the current result
        for (let j = 0; j < forked.length; j++) {
          forked[j]![i]!.stable = true
        }
        result = result.concat(forked) // add the forked arrays to the result
      }
    }

    // Remove the volatility field from the result
    return result.map(path => path.map(({ router, from, to, stable }) => ({ router, from, to, stable })))
  }
}
