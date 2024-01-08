import { GetFunctionArgs } from 'viem'
import { SPECTRUM_ROUTER_ABI } from '../abi/SPECTRUM_ROUTER_ABI.js'

export { BytesLike, Token, DEXConfiguration, InflatedPath, CompressedPath } from './zod.js'

export enum SpectrumChainId {
  ARBITRUM = 42161,
  BASE = 8453,
  BINANCE = 56,
  FANTOM = 250,
  // MAINNET = 1,
  OPTIMISM = 10,
}

export enum ChainId {
  ARBITRUM = 42161,
  BASE = 8453,
  BINANCE = 56,
  FANTOM = 250,
  MAINNET = 1,
  OPTIMISM = 10,
}

export type NodeVolatility = 'stable' | 'volatile' | 'stable_volatile'

export type RouterErrorCode = 'EMPTY_ROUTE' | 'UNNECESSARY_REQUEST' | 'UNKNOWN_CHAIN_ID' | 'UNKNOWN_TOKEN_IN' | 'UNKNOWN_TOKEN_OUT'

// The below types ensure that any ABI changes are picked up by the compiler because
// GetFunctionArgs/ContractFunctionResult aren't actively type checking for the functionName
type NonOptionalKeys<T> = { [k in keyof T]-?: undefined extends T[k] ? never : k }[keyof T]

type _GetAmountsOutMultiArgs = GetFunctionArgs<typeof SPECTRUM_ROUTER_ABI, 'getAmountsOutMulti'>
export type GetAmountsOutMultiArgs = NonOptionalKeys<_GetAmountsOutMultiArgs> extends never ? never : _GetAmountsOutMultiArgs['args']

type _GetPoolRequestsArgs = GetFunctionArgs<typeof SPECTRUM_ROUTER_ABI, 'getPoolRequests'>
export type GetPoolRequestsArgs = NonOptionalKeys<_GetPoolRequestsArgs> extends never ? never : _GetPoolRequestsArgs['args']
