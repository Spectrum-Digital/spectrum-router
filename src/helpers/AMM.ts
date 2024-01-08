import { BigNumber } from 'bignumber.js'
import { Token, DEXConfiguration, BytesLike } from '../typings/index.js'

export abstract class AMMHelper {
  public static getReservesRatio(
    dex: DEXConfiguration,
    amountInRaw: BigNumber,
    tokenIn: Token,
    tokenOut: Token,
    token0: BytesLike,
    stable: boolean,
    reserve0Raw: BigNumber,
    reserve1Raw: BigNumber,
  ): BigNumber {
    const isToken0 = token0.toLowerCase() === tokenIn.address.toLowerCase()
    const token0_ = isToken0 ? tokenIn : tokenOut
    const token1_ = isToken0 ? tokenOut : tokenIn

    if (stable && dex.pair_stable_formula !== 'N/A') {
      switch (dex.pair_stable_formula) {
        case 'x3y_y3x_variant_A': {
          return this.getReservesRatioStable_Variant_A(
            dex.pair_stable_formula,
            amountInRaw,
            tokenIn,
            tokenOut,
            token0_,
            token1_,
            reserve0Raw,
            reserve1Raw,
          )
        }
        case 'x3y_y3x_variant_B': {
          return this.getReservesRatioStable_Variant_B(
            dex.pair_stable_formula,
            amountInRaw,
            tokenIn,
            tokenOut,
            token0_,
            token1_,
            reserve0Raw,
            reserve1Raw,
          )
        }
      }

      // Unreachable code due to the switch-statement, making it type-safe!
    } else {
      return this.getReservesRatioVolatile(tokenIn, tokenOut, token0_, reserve0Raw, reserve1Raw)
    }
  }

  private static getReservesRatioVolatile(
    tokenIn: Token,
    tokenOut: Token,
    token0: Token,
    reserve0Raw: BigNumber,
    reserve1Raw: BigNumber,
  ): BigNumber {
    const isToken0 = token0.address.toLowerCase() === tokenIn.address.toLowerCase()
    const reserve0 = new BigNumber(reserve0Raw.toString()).shiftedBy(isToken0 ? -tokenIn.decimals : -tokenOut.decimals)
    const reserve1 = new BigNumber(reserve1Raw.toString()).shiftedBy(isToken0 ? -tokenOut.decimals : -tokenIn.decimals)
    return isToken0 ? reserve1.div(reserve0) : reserve0.div(reserve1)
  }

  private static getReservesRatioStable_Variant_A(
    _variant: 'x3y_y3x_variant_A', // type-check
    amountInRaw: BigNumber,
    tokenIn: Token,
    tokenOut: Token,
    token0: Token,
    token1: Token,
    reserve0Raw: BigNumber,
    reserve1Raw: BigNumber,
  ): BigNumber {
    /**
     * The following DEXes adhere to this variant:
     * - Aerodrome V2 (Base) https://basescan.org/address/0xa4e46b4f701c62e14df11b48dce76a7d793cd6d7#code
     * - Velodrome V2 (Optimism) https://optimistic.etherscan.io/address/0x95885af5492195f0754be71ad1545fe81364e531#code
     **/

    function _f(x0: BigNumber, y: BigNumber): BigNumber {
      const _a = x0.times(y).div(1e18)
      const _b = x0.times(x0).div(1e18).plus(y.times(y).div(1e18))
      return _a.times(_b).div(1e18)
    }

    function _d(x0: BigNumber, y: BigNumber): BigNumber {
      const left = new BigNumber(3).times(x0).times(y).times(y).div(1e18).div(1e18)
      const right = x0.times(x0).times(x0).div(1e18).div(1e18)
      return left.plus(right)
    }

    function _k(x: BigNumber, y: BigNumber, decimals0: number, decimals1: number): BigNumber {
      const _x = x.times(1e18).div(decimals0)
      const _y = y.times(1e18).div(decimals1)
      const _a = _x.times(_y).div(1e18)
      const _b = _x.times(_x).div(1e18).plus(_y.times(_y).div(1e18))
      return _a.times(_b).div(1e18) // x3y+y3x >= k
    }

    function _get_y(x0: BigNumber, xy: BigNumber, y: BigNumber, decimals0: number, decimals1: number): BigNumber | undefined {
      for (let i = 0; i < 255; i++) {
        const k = _f(x0, y)

        if (k.lt(xy)) {
          // there are two cases where dy == 0
          // case 1: The y is converged and we find the correct answer
          // case 2: _d(x0, y) is too large compare to (xy - k) and the rounding error
          //         screwed us.
          //         In this case, we need to increase y by 1
          let dy = xy.minus(k).times(1e18).div(_d(x0, y))
          if (dy.isZero()) {
            if (k.eq(xy)) {
              // We found the correct answer. Return y
              return y
            }
            if (_k(x0, y.plus(1), decimals0, decimals1).gt(xy)) {
              // If _k(x0, y + 1) > xy, then we are close to the correct answer.
              // There's no closer answer than y + 1
              return y.plus(1)
            }
            dy = new BigNumber(1)
          }
          y = y.plus(dy)
        } else {
          let dy = k.minus(xy).times(1e18).div(_d(x0, y))
          if (dy.isZero()) {
            if (k.eq(xy) || _f(x0, y.minus(1)).lt(xy)) {
              // Likewise, if k == xy, we found the correct answer.
              // If _f(x0, y - 1) < xy, then we are close to the correct answer.
              // There's no closer answer than "y"
              // It's worth mentioning that we need to find y where f(x0, y) >= xy
              // As a result, we can't return y - 1 even it's closer to the correct answer
              return y
            }
            dy = new BigNumber(1)
          }
          y = y.minus(dy)
        }
      }

      return undefined
    }

    const decimals0 = 10 ** token0.decimals
    const decimals1 = 10 ** token1.decimals

    const xy = _k(reserve0Raw, reserve1Raw, decimals0, decimals1)
    const _reserve0 = reserve0Raw.times(1e18).div(decimals0)
    const _reserve1 = reserve1Raw.times(1e18).div(decimals1)

    const isToken0 = tokenIn.address.toLowerCase() == token0.address.toLowerCase()
    const [reserveA, reserveB] = isToken0 ? [_reserve0, _reserve1] : [_reserve1, _reserve0]
    const amountIn = isToken0 ? amountInRaw.times(1e18).div(decimals0) : amountInRaw.times(1e18).div(decimals1)

    const _y = _get_y(amountIn.plus(reserveA), xy, reserveB, decimals0, decimals1)
    const y = _y ? reserveB.minus(_y) : new BigNumber(0)

    return y
      .times(isToken0 ? decimals1 : decimals0)
      .div(1e18)
      .shiftedBy(-tokenOut.decimals)
  }

  private static getReservesRatioStable_Variant_B(
    _variant: 'x3y_y3x_variant_B', // type-check
    amountInRaw: BigNumber,
    tokenIn: Token,
    tokenOut: Token,
    token0: Token,
    token1: Token,
    reserve0Raw: BigNumber,
    reserve1Raw: BigNumber,
  ): BigNumber {
    /**
     * The following DEXes adhere to this variant:
     * - Camelot (Arbitrum) https://arbiscan.io/address/0x6EcCab422D763aC031210895C81787E87B43A652#code
     * - Ramses (Arbitrum) https://arbiscan.io/address/0x64209162e6abcbb5726eb4353ef551c76db0c340#code
     * - Equalizer V2 (Fantom) https://ftmscan.com/address/0x8db550677053f2ca3d3bf677cb4e06cc10511958#code
     * - Equalizer V3 (Base) https://basescan.org/address/0xd7627edf607c49f525212fc09d650a91a9b222e1#code
     **/

    function _f(x0: BigNumber, y: BigNumber): BigNumber {
      const a = x0.times(y.times(y.div(1e18)).times(y.div(1e18))).div(1e18)
      const b = y.times(x0.times(x0.div(1e18)).times(x0.div(1e18))).div(1e18)
      return a.plus(b)
    }

    function _d(x0: BigNumber, y: BigNumber): BigNumber {
      const left = new BigNumber(3).times(x0).times(y).times(y).div(1e18).div(1e18)
      const right = x0.times(x0).times(x0).div(1e18).div(1e18)
      return left.plus(right)
    }

    function _k(x: BigNumber, y: BigNumber, decimals0: number, decimals1: number): BigNumber {
      const _x = x.times(1e18).div(decimals0)
      const _y = y.times(1e18).div(decimals1)
      const _a = _x.times(_y).div(1e18)
      const _b = _x.times(_x).div(1e18).plus(_y.times(_y).div(1e18))
      return _a.times(_b).div(1e18) // x3y+y3x >= k
    }

    function _get_y(x0: BigNumber, xy: BigNumber, y: BigNumber): BigNumber | undefined {
      for (let i = 0; i < 255; i++) {
        const y_prev = y
        const k = _f(x0, y)

        if (k.lt(xy)) {
          const dy = xy.minus(k).times(1e18).div(_d(x0, y))
          y = y.plus(dy)
        } else {
          const dy = k.minus(xy).times(1e18).div(_d(x0, y))
          y = y.minus(dy)
        }
        if (y.gt(y_prev)) {
          if (y.minus(y_prev).lte(1)) {
            return y
          }
        } else {
          if (y_prev.minus(y).lte(1)) {
            return y
          }
        }
      }
      return y
    }

    const decimals0 = 10 ** token0.decimals
    const decimals1 = 10 ** token1.decimals

    const xy = _k(reserve0Raw, reserve1Raw, decimals0, decimals1)
    const _reserve0 = reserve0Raw.times(1e18).div(decimals0)
    const _reserve1 = reserve1Raw.times(1e18).div(decimals1)

    const isToken0 = tokenIn.address.toLowerCase() == token0.address.toLowerCase()
    const [reserveA, reserveB] = isToken0 ? [_reserve0, _reserve1] : [_reserve1, _reserve0]
    const amountIn = isToken0 ? amountInRaw.times(1e18).div(decimals0) : amountInRaw.times(1e18).div(decimals1)

    const _y = _get_y(amountIn.plus(reserveA), xy, reserveB)
    const y = _y ? reserveB.minus(_y) : new BigNumber(0)

    return y
      .times(isToken0 ? decimals1 : decimals0)
      .div(1e18)
      .shiftedBy(-tokenOut.decimals)
  }
}
