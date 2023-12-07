import { Abi, ContractFunctionResult } from 'viem'
import { BigNumber } from 'bignumber.js'

import { BytesLike, GetAmountsOutMultiArgs, GetPoolRequestsArgs, Path, RouterErrorCode, Token } from '../typings/index.js'
import { SPECTRUM_ROUTER_ABI } from '../abi/SPECTRUM_ROUTER_ABI.js'
import { RouterAddresses } from '../config.js'
import { GetAmountsOutHelper } from '../helpers/getAmountsOut.js'
import { GetPoolRequestsHelper } from '../helpers/getPoolRequest.js'
import { AMMHelper } from '../helpers/AMM.js'

export abstract class SpectrumContract {
  /**
   * Get the amount of tokenOut received for a given amount of tokenIn.
   * @param tokenIn The token to input.
   * @param tokenOut The token to output.
   * @param amountIn The amount of tokenIn.
   * @param paths The routes to try out.
   * @returns {payload} The payload to call `getAmountsOutCandidates` in the SpectrumRouter contract.
   * @returns {parse} The function to pick the amountOut from the list of results.
   */
  public static getAmountsOut(
    tokenIn: Token,
    tokenOut: Token,
    amountIn: BigNumber | string | number,
    paths: Path[],
  ): {
    error: boolean
    errorCode: RouterErrorCode | undefined
    payload: {
      address: BytesLike | undefined
      abi: typeof SPECTRUM_ROUTER_ABI
      functionName: 'getAmountsOutMulti'
      args: GetAmountsOutMultiArgs
    }
    parse: (
      type: 'highest' | 'lowest',
      data: ContractFunctionResult<typeof SPECTRUM_ROUTER_ABI, 'getAmountsOutMulti'> | undefined,
    ) => { amountsOut: BigNumber; path: Path }
  } {
    const amount = amountIn instanceof BigNumber ? amountIn.toFixed() : amountIn === typeof 'string' ? amountIn : amountIn.toString()
    const address = this.getSpectrumRouterAddress(tokenIn.chainId)
    const addressError = address === undefined
    const routingError = tokenIn.address.toLowerCase() === tokenOut.address.toLowerCase()

    let error: RouterErrorCode | undefined
    if (addressError) {
      error = 'UNKNOWN_CHAIN_ID'
    } else if (routingError) {
      error = 'UNNECESSARY_REQUEST'
    } else if (!paths.length) {
      error = 'EMPTY_ROUTE'
    }

    // Compress the paths into legs per router.
    const compressedPaths = paths.map(GetAmountsOutHelper.compressPath)

    return {
      error: Boolean(error),
      errorCode: error,
      payload: {
        address: address,
        abi: this.getSpectrumRouterABI(),
        functionName: 'getAmountsOutMulti' as const,
        args: GetAmountsOutHelper.generateGetAmountsOutMultiArgs(compressedPaths, amount),
      },
      parse: (type: 'highest' | 'lowest', data: ContractFunctionResult<typeof SPECTRUM_ROUTER_ABI, 'getAmountsOutMulti'> | undefined) => {
        const DEFAULT_RETURN = { amountsOut: new BigNumber(0), path: [] }
        if (!data || !data.length) return DEFAULT_RETURN

        // We have to stringify the amounts in order to find the indexOf a few lines later.
        const amounts = data.map(amount => new BigNumber(amount.toString()).toFixed())
        const amountsOut = type === 'highest' ? BigNumber.max(...amounts) : BigNumber.min(...amounts)
        const index = amountsOut.isZero() ? -1 : amounts.indexOf(amountsOut.toFixed())
        const winner = index === -1 ? undefined : compressedPaths[index]

        return winner
          ? { amountsOut: amountsOut.shiftedBy(-tokenOut.decimals), path: GetAmountsOutHelper.decompressPath(winner) }
          : DEFAULT_RETURN
      },
    }
  }

  /**
   * Get a token's spot price as per the state of the reserves across hops.
   * @param tokenIn The token to input.
   * @param tokenOut The token to output.
   * @param path The most liquid route to follow.
   * @returns {payload} The payload to call `getPoolRequests` in the SpectrumRouter contract.
   * @returns {parse} The function to pick the price from the list of results.
   */
  public static getPrice(
    tokenIn: Token,
    tokenOut: Token,
    path: Path,
  ): {
    error: boolean
    errorCode: RouterErrorCode | undefined
    payload: {
      address: BytesLike | undefined
      abi: typeof SPECTRUM_ROUTER_ABI
      functionName: 'getPoolRequests'
      args: GetPoolRequestsArgs
    }
    parse: (data: ContractFunctionResult<typeof SPECTRUM_ROUTER_ABI, 'getPoolRequests'> | undefined) => BigNumber
  } {
    const address = this.getSpectrumRouterAddress(tokenIn.chainId)
    const addressError = address === undefined
    const routingError = tokenIn.address.toLowerCase() === tokenOut.address.toLowerCase()

    let error: RouterErrorCode | undefined
    if (addressError) {
      error = 'UNKNOWN_CHAIN_ID'
    } else if (routingError) {
      error = 'UNNECESSARY_REQUEST'
    } else if (!path.length) {
      error = 'EMPTY_ROUTE'
    }

    return {
      error: Boolean(error),
      errorCode: error,
      payload: {
        address: address,
        abi: this.getSpectrumRouterABI(),
        functionName: 'getPoolRequests' as const,
        args: GetPoolRequestsHelper.generateGetPoolRequestsMultiArgs(path),
      },
      parse: (data: ContractFunctionResult<typeof SPECTRUM_ROUTER_ABI, 'getPoolRequests'> | undefined) => {
        if (!data) return new BigNumber(0)

        const legResults = data[0]
        const legTokens0 = data[1]

        // This should NOT be possible unless we make architectural changes to our code.
        if (path.length !== legResults.length || path.length !== legTokens0.length) {
          throw new Error('legs, legResults, legTokens0 do not match length')
        }

        const calculateRatio = (leg: Path[number], token0: BytesLike, _reserve0: bigint, _reserve1: bigint): BigNumber => {
          const isToken0 = token0.toLowerCase() === leg.from.address.toLowerCase()
          if (leg.stable) {
            const price = AMMHelper.getAmountOutStableOnly(
              new BigNumber(1).shiftedBy(leg.from.decimals),
              leg.from,
              isToken0 ? leg.from : leg.to,
              isToken0 ? leg.to : leg.from,
              new BigNumber(_reserve0.toString()),
              new BigNumber(_reserve1.toString()),
            )
            return new BigNumber(price).shiftedBy(-leg.to.decimals)
          } else {
            const reserve0 = new BigNumber(_reserve0.toString()).shiftedBy(isToken0 ? -leg.from.decimals : -leg.to.decimals)
            const reserve1 = new BigNumber(_reserve1.toString()).shiftedBy(isToken0 ? -leg.to.decimals : -leg.from.decimals)
            return isToken0 ? reserve1.div(reserve0) : reserve0.div(reserve1)
          }
        }

        // Each leg calculates the price of the `from` token in terms of the `to` token.
        // After each hop, we end up with a multiplier per hop that we ultimately need to
        // multiply together to get the final price of tokenIn in terms of tokenOut.
        const multipliers = legResults.map((result, index) => {
          const leg = path[index]! // We know this is safe because of the check above.
          const token0 = legTokens0[index]! // We know this is safe because of the check above.

          const { reserve0, reserve1 } = GetPoolRequestsHelper.decodeReservesResult(leg, result)
          return calculateRatio(leg, token0, reserve0, reserve1)
        })

        return multipliers.reduce((acc, multiplier) => acc.multipliedBy(multiplier), new BigNumber(1))
      },
    }
  }

  private static getSpectrumRouterAddress(chainId: number | undefined): BytesLike | undefined {
    return chainId ? RouterAddresses[chainId] : undefined
  }

  private static getSpectrumRouterABI() {
    return SPECTRUM_ROUTER_ABI satisfies Abi
  }
}
