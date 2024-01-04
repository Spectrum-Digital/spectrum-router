import { decodeFunctionResult, encodeFunctionData } from 'viem'

import { __FACTORY_GET_PAIR_A_B } from '../abi/__FACTORY_GET_PAIR_A_B.js'
import { __FACTORY_GET_PAIR_A_B_STABLE } from '../abi/__FACTORY_GET_PAIR_A_B_STABLE.js'
import { __FACTORY_GET_POOL_A_B_STABLE } from '../abi/__FACTORY_GET_POOL_A_B_STABLE.js'
import { __FACTORY_PAIR_FOR_A_B_STABLE } from '../abi/__FACTORY_PAIR_FOR_A_B_STABLE.js'
import { __PAIR_RESERVES_112_112_32 } from '../abi/__PAIR_RESERVES_112_112_32.js'
import { __PAIR_RESERVES_256_256_256 } from '../abi/__PAIR_RESERVES_256_256_256.js'
import { __PAIR_RESERVES_112_112_16_16 } from '../abi/__PAIR_RESERVES_112_112_16_16.js'
import { BytesLike, GetPoolRequestsArgs, Path } from '../typings/index.js'

export abstract class GetPoolRequestsHelper {
  public static generateGetPoolRequestsMultiArgs(path: Path): GetPoolRequestsArgs {
    return [
      path.map(leg => ({
        router: leg.router.address,
        factory: leg.router.factory,
        getPairCalldata: this.generateGetPairCalldata(leg),
        poolRequestCalldata: this.generatePoolRequestCalldata(leg),
      })),
    ]
  }

  public static decodeReservesResult(
    leg: Path[number],
    data: BytesLike,
  ): {
    reserve0: bigint
    reserve1: bigint
  } {
    switch (leg.router.getReserves) {
      case 'getReserves_112_112_32': {
        const [token0, token1] = decodeFunctionResult({
          abi: __PAIR_RESERVES_112_112_32,
          functionName: 'getReserves',
          data,
        })
        return { reserve0: token0, reserve1: token1 }
      }
      case 'getReserves_112_112_16_16': {
        const [token0, token1] = decodeFunctionResult({
          abi: __PAIR_RESERVES_112_112_16_16,
          functionName: 'getReserves',
          data,
        })
        return { reserve0: token0, reserve1: token1 }
      }
      case 'getReserves_256_256_256': {
        const [token0, token1] = decodeFunctionResult({
          abi: __PAIR_RESERVES_256_256_256,
          functionName: 'getReserves',
          data,
        })
        return { reserve0: token0, reserve1: token1 }
      }
    }
  }

  private static generateGetPairCalldata(leg: Path[number]): BytesLike {
    switch (leg.router.getPair) {
      case 'getPair_A_B':
        return encodeFunctionData({
          abi: __FACTORY_GET_PAIR_A_B,
          functionName: 'getPair',
          args: [leg.from.address, leg.to.address],
        })
      case 'getPair_A_B_stable':
        return encodeFunctionData({
          abi: __FACTORY_GET_PAIR_A_B_STABLE,
          functionName: 'getPair',
          args: [leg.from.address, leg.to.address, leg.stable],
        })
      case 'getPool_A_B_stable':
        return encodeFunctionData({
          abi: __FACTORY_GET_POOL_A_B_STABLE,
          functionName: 'getPool',
          args: [leg.from.address, leg.to.address, leg.stable],
        })
      case 'pairFor_A_B_stable':
        return encodeFunctionData({
          abi: __FACTORY_PAIR_FOR_A_B_STABLE,
          functionName: 'pairFor',
          args: [leg.from.address, leg.to.address, leg.stable],
        })
    }
  }

  private static generatePoolRequestCalldata(leg: Path[number]): BytesLike {
    switch (leg.router.getReserves) {
      case 'getReserves_112_112_32':
        return encodeFunctionData({
          abi: __PAIR_RESERVES_112_112_32,
          functionName: 'getReserves',
        })
      case 'getReserves_112_112_16_16':
        return encodeFunctionData({
          abi: __PAIR_RESERVES_112_112_16_16,
          functionName: 'getReserves',
        })
      case 'getReserves_256_256_256':
        return encodeFunctionData({
          abi: __PAIR_RESERVES_256_256_256,
          functionName: 'getReserves',
        })
    }
  }
}
