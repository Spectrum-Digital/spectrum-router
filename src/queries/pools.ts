import { gql } from '@apollo/client'
import { z } from 'zod'

export const PoolsQuery = gql(`
  query Pools($factory: String!, $blockNumber: BigInt!, $first: Int!, $skip: Int!) {
    pools(
      where: { factory: $factory, blockNumber_gte: $blockNumber }
      first: $first
      skip: $skip
      orderBy: blockNumber
      orderDirection: asc
    ) {
      blockNumber
      id
      stable
      token0 {
        id
        decimals
      }
      token1 {
        id
        decimals
      }
    }
  }
`)

export const PoolsResponse = z.object({
  pools: z.array(
    z.object({
      blockNumber: z.string(),
      id: z.string(),
      stable: z.boolean(),
      token0: z.object({
        id: z.string(),
        decimals: z.number(),
      }),
      token1: z.object({
        id: z.string(),
        decimals: z.number(),
      }),
    }),
  ),
})
