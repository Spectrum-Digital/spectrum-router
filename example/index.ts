import { createPublicClient, http } from 'viem'
import BigNumber from 'bignumber.js'
import { Token, BytesLike, NodeVolatility, SpectrumRouter, DEXRouters, Path, SpectrumPeriphery, SpectrumContract } from '../dist/src'

const RPC_URL = process.env.RPC_URL || 'https://eth.llamarpc.com'
const client = createPublicClient({ transport: http(RPC_URL) })

// We're using a basic cache implementation here, but you could use Redis or whatever you want.
const aerodromeGraphCache = new Map<BytesLike, BytesLike[]>()
const aerodromeTokensCache = new Map<BytesLike, Token>()
const aerodromeVolatilityCache = new Map<`${BytesLike}:${BytesLike}`, NodeVolatility>()

const camelotGraphCache = new Map<BytesLike, BytesLike[]>()
const camelotTokensCache = new Map<BytesLike, Token>()
const camelotVolatilityCache = new Map<`${BytesLike}:${BytesLike}`, NodeVolatility>()

// make sure these nodes are checksummed!
const weightedNodesArbitrum: BytesLike[] = [
  '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // weth
  '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // usdc
]

const weightedNodesBase: BytesLike[] = [
  '0x4200000000000000000000000000000000000006', // weth
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // usdc
  '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // usdbc
  '0xb79dd08ea68a908a97220c76d19a6aa9cbde4376', // usd+
]

// If a user is requesting the best possible route for a given tokenIn to tokenOut, we can
// get a set of results for each DEXRouter, this aggregator instance will then merge the results.
// If you're building a DEX that doesn't source its liquidity from other DEXs, you can just
// use a single router instance without setting up this aggregator.
class RouterAggregator {
  private routers: SpectrumRouter[] = []
  private aerodromeRouter: SpectrumRouter
  private camelotRouter: SpectrumRouter

  constructor() {
    // Define our routers here, it looks syntactically a bit weird, but that's
    // because our cache isn't really a cache, but a basic in-memory map.
    // You should consider using a proper cache implementation like Redis, which
    // is using async operations out of the box, so it won't look messy like this.
    this.aerodromeRouter = new SpectrumRouter({
      dexRouter: DEXRouters.BASE_AERODROME_V2,
      graphCache: {
        get: async (key: BytesLike) => aerodromeGraphCache.get(key),
        set: async (key: BytesLike, value: BytesLike[]) => void aerodromeGraphCache.set(key, value),
      },
      tokensCache: {
        get: async (key: BytesLike) => aerodromeTokensCache.get(key),
        set: async (key: BytesLike, value: Token) => void aerodromeTokensCache.set(key, value),
      },
      volatilityCache: {
        get: async (key: `${BytesLike}:${BytesLike}`) => aerodromeVolatilityCache.get(key),
        set: async (key: `${BytesLike}:${BytesLike}`, value: NodeVolatility) => void aerodromeVolatilityCache.set(key, value),
      },
    })

    this.camelotRouter = new SpectrumRouter({
      dexRouter: DEXRouters.ARBITRUM_CAMELOT,
      graphCache: {
        get: async (key: BytesLike) => camelotGraphCache.get(key),
        set: async (key: BytesLike, value: BytesLike[]) => void camelotGraphCache.set(key, value),
      },
      tokensCache: {
        get: async (key: BytesLike) => camelotTokensCache.get(key),
        set: async (key: BytesLike, value: Token) => void camelotTokensCache.set(key, value),
      },
      volatilityCache: {
        get: async (key: `${BytesLike}:${BytesLike}`) => camelotVolatilityCache.get(key),
        set: async (key: `${BytesLike}:${BytesLike}`, value: NodeVolatility) => void camelotVolatilityCache.set(key, value),
      },
    })

    // Inject routers globally
    this.routers.push(this.aerodromeRouter)
    this.routers.push(this.camelotRouter)

    // Synchronize each router
    this.synchronize()
  }

  public async getAvailablePaths(
    tokenIn: string,
    tokenOut: string,
    chainId: number,
  ): Promise<{
    paths: Path[]
    error?: string
  }> {
    return await SpectrumRouter.getAvailablePaths(
      tokenIn,
      tokenOut,
      this.routers.filter(router => router.chainId === chainId),
    )
  }

  private synchronize(): void {
    // Start synchronizing our exchange routers, and inject a set of weighted nodes.
    // Path finding will be through these nodes, so make sure you keep them up to date.
    this.synchronizeExchange(this.aerodromeRouter, weightedNodesBase)
    this.synchronizeExchange(this.camelotRouter, weightedNodesArbitrum)
  }

  private async synchronizeExchange(router: SpectrumRouter, weightedNodes: BytesLike[]): Promise<void> {
    // Add our weighted nodes
    router.addWeightedNodes(weightedNodes)

    // Add pools
    const pools = await SpectrumPeriphery.getPools(router.dexRouter)
    router.addPools(pools)
  }
}

;(async () => {
  const router = new RouterAggregator()
  const BASE_WETH: Token = { chainId: 8453, address: '0x4200000000000000000000000000000000000006', decimals: 18 }
  const BASE_USDC: Token = { chainId: 8453, address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 }

  const tokenIn = BASE_WETH
  const tokenOut = BASE_USDC

  // Get a list of routes for a given tokenIn -> tokenOut pair
  const routes = await router.getAvailablePaths(tokenIn.address, tokenOut.address, tokenIn.chainId)

  // Log any errors
  if (routes.error) {
    console.error(routes.error)
    return
  }

  // Get the most liquid route on-chain by calling getAmountsOut
  const params = SpectrumContract.getAmountsOut(tokenIn, tokenOut, new BigNumber(1).shiftedBy(tokenIn.decimals), routes.paths)
  if (params.error || !params.payload.address) {
    console.error(params.error)
    return
  }

  // Fetch the result from the chain
  const getAmountsOutResult = await client.readContract({
    address: params.payload.address,
    abi: params.payload.abi,
    functionName: params.payload.functionName,
    args: params.payload.args,
  })

  // Parse the result
  const { amountsOut, path } = params.parse('highest', getAmountsOutResult)

  // We now have the most liquid path, this way can also calculate the spot price of tokenIn!
  const priceParams = SpectrumContract.getPrice(tokenIn, tokenOut, path)
  if (priceParams.error || !priceParams.payload.address) {
    console.error(priceParams.error)
    return
  }

  const priceResult = await client.readContract({
    address: priceParams.payload.address,
    abi: priceParams.payload.abi,
    functionName: priceParams.payload.functionName,
    args: priceParams.payload.args,
  })

  // Parse the result
  const price = priceParams.parse(priceResult)

  // FYI: amounts are already formatted by their decimals!
  console.log('Most liquid path: %o', path)
  console.log('You will get ', amountsOut.toPrecision(6), tokenOut.address, 'for 1', tokenIn.address)
  console.log(`Price of 1 ${tokenIn.address}: ${price.toPrecision(6)}`)
})()
