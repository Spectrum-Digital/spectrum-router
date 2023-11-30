import BigNumber from 'bignumber.js'
import { Token } from '../typings'

export abstract class AMMHelper {
  public static getAmountOutStableOnly(
    amountInRaw: BigNumber,
    tokenIn: Token,
    token0: Token,
    token1: Token,
    _reserve0Raw: BigNumber,
    _reserve1Raw: BigNumber,
  ): BigNumber {
    const decimals0 = 10 ** token0.decimals
    const decimals1 = 10 ** token1.decimals

    const xy = _k(_reserve0Raw, _reserve1Raw, decimals0, decimals1)
    const _reserve0 = _reserve0Raw.times(1e18).div(decimals0)
    const _reserve1 = _reserve1Raw.times(1e18).div(decimals1)

    const isToken0 = tokenIn.address.toLowerCase() == token0.address.toLowerCase()
    const [reserveA, reserveB] = isToken0 ? [_reserve0, _reserve1] : [_reserve1, _reserve0]
    const amountIn = isToken0 ? amountInRaw.times(1e18).div(decimals0) : amountInRaw.times(1e18).div(decimals1)

    const _y = _get_y(amountIn.plus(reserveA), xy, reserveB, decimals0, decimals1)
    const y = _y ? reserveB.minus(_y) : new BigNumber(0)
    return y.times(isToken0 ? decimals1 : decimals0).div(1e18)
  }
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
