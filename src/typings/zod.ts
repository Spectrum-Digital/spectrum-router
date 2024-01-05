import { z } from 'zod'

const BytesLike = z.custom<`0x${string}`>(val => (typeof val === 'string' ? /^0x/i.test(val) : false))
export type BytesLike = z.infer<typeof BytesLike>

const DEXRouter = z.object({
  name: z.string(),
  chainId: z.number(),
  address: BytesLike,
  factory: BytesLike,
  getAmountsOut: z.union([z.literal('address[]'), z.literal('from_to_stable'), z.literal('from_to_stable_factory')]),
  getPair: z.union([
    z.literal('getPair_A_B'),
    z.literal('getPair_A_B_stable'),
    z.literal('pairFor_A_B_stable'),
    z.literal('getPool_A_B_stable'),
  ]),
  getReserves: z.union([z.literal('getReserves_112_112_32'), z.literal('getReserves_112_112_16_16'), z.literal('getReserves_256_256_256')]),
})
export type DEXRouter = z.infer<typeof DEXRouter>

const Token = z.object({
  address: BytesLike,
  decimals: z.number(),
})
export type Token = z.infer<typeof Token>

const InflatedPathLeg = z.object({ router: DEXRouter, from: Token, to: Token, stable: z.boolean() })
const InflatedPath = z.array(InflatedPathLeg)

/**
 * InflatedPathLeg describes a leg in a given path with the most details possible.
 */
export type InflatedPathLeg = z.infer<typeof InflatedPathLeg>

/**
 * InflatedPath is a collection of InflatedPathLegs in sequence.
 */
export type InflatedPath = z.infer<typeof InflatedPath>

/**
 * CompressedPathLeg is a compressed version of the legs within InflatedPath.
 * It adheres to the following schema: router-from:decimals-to:decimals-stable
 */
export type CompressedPathLeg = `${BytesLike}-${BytesLike}:${number}-${BytesLike}:${number}-${boolean}`

/**
 * CompressedPath is a collection of CompressedPathLegs in sequence.
 * It seperates each path with a `|` character.
 */
export type CompressedPath = string
