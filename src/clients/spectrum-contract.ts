import { Abi, ContractFunctionResult } from 'viem'
import { BigNumber } from 'bignumber.js'

import { BytesLike, CompressedPath, GetAmountsOutReturn, GetPriceReturn, RouterErrorCode } from '../typings/index.js'
import { SPECTRUM_ROUTER_ABI } from '../abi/SPECTRUM_ROUTER_ABI.js'
import { RouterAddresses } from '../config.js'
import { GetAmountsOutHelper } from '../helpers/getAmountsOut.js'
import { GetPoolRequestsHelper } from '../helpers/getPoolRequest.js'
import { AMMHelper } from '../helpers/AMM.js'
import { Compression } from '../helpers/compression.js'

type ErrorReturn = {
  error: true
  errorCode: RouterErrorCode
}

export abstract class SpectrumContract {
  /**
   * Get the amount of tokenOut received for a given amount of tokenIn.
   * @param chainId The chainId to use.
   * @param tokenIn The token to input.
   * @param tokenOut The token to output.
   * @param amountIn The amount of tokenIn (unscaled).
   * @param paths The available paths to attempt.
   * @param maximumNumberOfHops The maximum number of hops to attempt.
   * @returns {payload} The payload to call `getAmountsOutCandidates` in the SpectrumRouter contract.
   * @returns {parse} The function to pick the amountOut from the list of results.
   */
  public static getAmountsOut(
    chainId: number,
    tokenIn: BytesLike,
    tokenOut: BytesLike,
    amountIn: BigNumber | string | number,
    paths: CompressedPath[],
  ): ErrorReturn | GetAmountsOutReturn {
    const address = this.getSpectrumRouterAddress(chainId)
    const inflated = Compression.decompressPaths(paths)
    const firstHop = inflated[0]?.[0]

    if (!firstHop) {
      return {
        error: true,
        errorCode: 'EMPTY_ROUTE',
      }
    } else if (!address) {
      return {
        error: true,
        errorCode: 'UNKNOWN_CHAIN_ID',
      }
    } else if (tokenIn.toLowerCase() === tokenOut.toLowerCase()) {
      return {
        error: true,
        errorCode: 'UNNECESSARY_REQUEST',
      }
    }

    const amountInRaw = (amountIn instanceof BigNumber ? amountIn : new BigNumber(amountIn)).shiftedBy(firstHop.from.decimals).toFixed(0)

    return {
      error: false,
      payload: {
        address: address,
        abi: this.getSpectrumRouterABI(),
        functionName: 'getAmountsOutMulti' as const,
        args: GetAmountsOutHelper.generateGetAmountsOutMultiArgs(inflated, amountInRaw),
      },
      parse: (type: 'highest' | 'lowest', data: ContractFunctionResult<typeof SPECTRUM_ROUTER_ABI, 'getAmountsOutMulti'> | undefined) => {
        const DEFAULT_RETURN = { amountsOut: new BigNumber(0), path: [], compressedPath: '' }
        if (!data || !data.length) return DEFAULT_RETURN

        // We have to stringify the amounts in order to find the indexOf a few lines later.
        const amounts = data.map(amount => new BigNumber(amount.toString()).toFixed())
        const amountsOut = type === 'highest' ? BigNumber.max(...amounts) : BigNumber.min(...amounts)
        const index = amountsOut.isZero() ? -1 : amounts.indexOf(amountsOut.toFixed())
        const winner = index === -1 ? undefined : inflated[index]

        const output = winner && winner[winner.length - 1]
        return output
          ? {
              amountsOut: amountsOut.shiftedBy(-output.to.decimals),
              path: winner,
              compressedPath: Compression.compressInflatedPath(winner),
            }
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
  public static getPrice(chainId: number, tokenIn: BytesLike, tokenOut: BytesLike, path: CompressedPath): ErrorReturn | GetPriceReturn {
    const address = this.getSpectrumRouterAddress(chainId)
    const inflated = Compression.decompressPath(path)

    if (!address) {
      return {
        error: true,
        errorCode: 'UNKNOWN_CHAIN_ID',
      }
    } else if (tokenIn.toLowerCase() === tokenOut.toLowerCase()) {
      return {
        error: true,
        errorCode: 'UNNECESSARY_REQUEST',
      }
    } else if (!inflated.length) {
      return {
        error: true,
        errorCode: 'EMPTY_ROUTE',
      }
    }

    return {
      error: false,
      payload: {
        address: address,
        abi: this.getSpectrumRouterABI(),
        functionName: 'getPoolRequests' as const,
        args: GetPoolRequestsHelper.generateGetPoolRequestsMultiArgs(inflated),
      },
      parse: (data: ContractFunctionResult<typeof SPECTRUM_ROUTER_ABI, 'getPoolRequests'> | undefined) => {
        const DEFAULT_RETURN = { price: new BigNumber(0), path: [], compressedPath: '' }
        if (!data) return DEFAULT_RETURN

        const legResults = data[0]
        const legTokens0 = data[1]

        // This should NOT be possible unless we make architectural changes to our code.
        if (inflated.length !== legResults.length || inflated.length !== legTokens0.length) {
          throw new Error('legs, legResults, legTokens0 do not match length')
        }

        // Each leg calculates the price of the `from` token in terms of the `to` token.
        // After each hop, we end up with a multiplier per hop that we ultimately need to
        // multiply together to get the final price of tokenIn in terms of tokenOut.
        const price = legResults.reduce((acc, result, index) => {
          const leg = inflated[index]! // We know this is safe because of the check above.
          const token0 = legTokens0[index]! // We know this is safe because of the check above.

          // Decode the result to extract the reserves
          const { reserve0, reserve1 } = GetPoolRequestsHelper.decodeReservesResult(leg, result)

          // Calculate the price of tokenIn in terms of tokenOut, for volatile swaps we only have to
          // depend on the reserves ratio, but for stable swaps we're computing getAmountsOut depending
          // on the output of the previous leg.
          const ratio = AMMHelper.getReservesRatio(
            leg.dexConfiguration,
            acc.shiftedBy(leg.from.decimals),
            leg.from,
            leg.to,
            token0,
            leg.stable,
            new BigNumber(reserve0.toString()),
            new BigNumber(reserve1.toString()),
          )

          if (leg.stable) {
            // The ratio is already the end result because `acc` got injected as an input
            return ratio
          } else {
            // We need to multiply the reserves ratio with the previous result.
            return acc.multipliedBy(ratio)
          }
        }, new BigNumber(1))

        return {
          price: price,
          path: Compression.decompressPath(path),
          compressedPath: path,
        }
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
