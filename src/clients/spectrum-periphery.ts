import { getAddress } from 'viem'
import { ApolloClient, InMemoryCache, type NormalizedCacheObject } from '@apollo/client'

import { BytesLike, DEXRouter, SpectrumChainId, Token } from '../typings/index.js'
import { SubgraphURL } from '../config.js'
import { PoolsQuery, PoolsResponse } from '../queries/pools.js'

type Pool = {
  address: BytesLike
  blockNumber: number
  stable: boolean
  token0: Token
  token1: Token
}

// Subgraphs are limited to a maximum of 5,000 results
const MAXIMUM_RESULTS = 5000

export abstract class SpectrumPeriphery {
  static async getPools(router: DEXRouter, blockNumber = 0, previous: Array<Pool> = []): Promise<Array<Pool>> {
    const url = this.getSubgraphURL(router.chainId)
    if (!url) return []

    // Get the next 5,000 items
    const pools = await this._getThrottledPools(router, blockNumber)

    // Check if we're below the maximum results
    if (pools.length < MAXIMUM_RESULTS) {
      return [...previous, ...pools]
    }

    // If we're at the maximum results, we need to query the next 5,000 items
    // First, remove all items equal to the last blockNumber we've queried
    const lastBlocknumber = pools[pools.length - 1]!.blockNumber
    const filtered = pools.filter(pool => pool.blockNumber < lastBlocknumber)

    // Then, query the next 5,000 items
    return await this.getPools(router, lastBlocknumber, [...previous, ...filtered])
  }

  private static async _getThrottledPools(router: DEXRouter, blockNumber: number, previous: Array<Pool> = []): Promise<Array<Pool>> {
    const client = this.getApolloClient(router.chainId)
    if (!client) return []

    if (previous.length === MAXIMUM_RESULTS) {
      return previous
    }

    // We're quering a 1,000 items at a time
    const first = 1000

    // Skip the previous items we've already queried
    const skip = previous.length

    // Get the next 1,000 items
    const response = await client.query({
      query: PoolsQuery,
      variables: {
        factory: router.factory.toLowerCase(),
        blockNumber,
        first,
        skip,
      },
    })

    // Type check the response
    const parsed = PoolsResponse.safeParse(response.data)
    if (!parsed.success) {
      console.error(parsed.error)
      return []
    }

    // Map the pools to a typed array
    const mapped: Array<Pool> = parsed.data.pools.map(pool => ({
      address: getAddress(pool.id),
      blockNumber: parseInt(pool.blockNumber),
      stable: pool.stable,
      token0: { address: getAddress(pool.token0.id), chainId: router.chainId, decimals: pool.token0.decimals },
      token1: { address: getAddress(pool.token1.id), chainId: router.chainId, decimals: pool.token1.decimals },
    }))

    // If we have exactly 1,000 items, we can query the next 1,000 too.
    if (mapped.length === first) {
      return await this._getThrottledPools(router, blockNumber, [...previous, ...mapped])
    } else {
      return [...previous, ...mapped]
    }
  }

  private static getApolloClient(chainId: number): ApolloClient<NormalizedCacheObject> | undefined {
    const isSpectrumChainId = Object.values(SpectrumChainId).includes(chainId)
    if (!isSpectrumChainId) {
      console.error(`Subgraph not available for chainId: ${chainId}`)
      return undefined
    }

    const url = this.getSubgraphURL(chainId)
    return new ApolloClient({ uri: url, cache: new InMemoryCache() })
  }

  private static getSubgraphURL(chainId: SpectrumChainId): string {
    return SubgraphURL[chainId]
  }
}
