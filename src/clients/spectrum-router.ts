import { getAddress } from 'viem'
import { BytesLike, NodeVolatility, CompressedPath, InflatedPath } from '../typings/index.js'
import { ISpectrumRouterCache, SpectrumRouterCache } from './spectrum-router-cache.js'
import { Compression } from '../helpers/compression.js'

type PathWithVolatilityIsNotStable = Array<InflatedPath[number] & { stable: false; volatility: NodeVolatility }>
type PathWithVolatility = Array<InflatedPath[number] & { stable: boolean; volatility: NodeVolatility }>

type ISpectrumRouter = ISpectrumRouterCache & {
  weightedNodes: BytesLike[]
}

export class SpectrumRouter extends SpectrumRouterCache {
  public chainId: number
  private weightedNodes: BytesLike[]

  constructor(params: ISpectrumRouter) {
    super(params)
    this.chainId = params.dexRouter.chainId
    this.weightedNodes = params.weightedNodes
  }

  static async getAvailablePaths(
    tokenIn: string,
    tokenOut: string,
    routers: SpectrumRouter[],
  ): Promise<{
    paths: CompressedPath[]
    error?: string
  }> {
    try {
      const checksummedTokenIn = getAddress(tokenIn)
      const checksummedTokenOut = getAddress(tokenOut)

      const paths: CompressedPath[] = []
      for (let i = 0; i < routers.length; i++) {
        const router = routers[i]!
        const candidates = await router.getAvailablePaths(checksummedTokenIn, checksummedTokenOut)
        paths.push(...candidates)
      }

      return { paths }
    } catch (err) {
      console.error(err)
      return { paths: [], error: 'Invalid addresses' }
    }
  }

  public async getAvailablePaths(tokenIn: BytesLike, tokenOut: BytesLike): Promise<CompressedPath[]> {
    // Exit early if we're routing to the same token
    if (tokenIn === tokenOut) return []

    // Check if we've already cached this path
    const cached = await this.getCachedPaths(tokenIn, tokenOut)
    if (cached) return cached

    // Find all available paths
    const inflatedPaths = await this.__findAvailablePaths(tokenIn, tokenOut)

    // Compress the paths
    const compressed = Compression.compressInflatedPaths(inflatedPaths)

    // Save the paths into cache
    await this.updateCachedPaths(tokenIn, tokenOut, compressed)

    // Return the compressed paths
    return compressed
  }

  private async __findAvailablePaths(tokenIn: BytesLike, tokenOut: BytesLike): Promise<InflatedPath[]> {
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
          const fromToken = typeof from === 'string' ? await this.getToken(from) : from
          const toToken = await this.getToken(to)

          // Volatility will later be used to construct the stable fields.
          const volatility = await this.getVolatility(typeof from === 'string' ? from : from.address, to)

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
    const cleanedPaths = pathsWithPotentialErrors.flatMap(path => (path ? [path] : []))

    // Inject the appropiate volatility into the paths
    const paths = cleanedPaths.reduce((acc, path) => {
      // Detect if we need to split nodes into multiple paths
      const forkedPaths = this.__detectVolatility(path)

      // Add the forks to the accumulator
      return [...acc, ...forkedPaths]
    }, [] as InflatedPath[])

    return paths
  }

  private async *__traverseWeightedGraph(start: BytesLike, end: BytesLike, visited: Set<BytesLike>): AsyncGenerator<BytesLike[]> {
    // Check if we've reached our destination
    if (start === end) {
      return yield [...visited, end]
    }

    // Log our current position so we don't visit it again
    visited.add(start)

    // Grab adjacent nodes
    let neighbors = await this.getNeighbors(start)

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

  private __detectVolatility(path: PathWithVolatilityIsNotStable): InflatedPath[] {
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
