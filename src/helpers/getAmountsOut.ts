import { encodeFunctionData } from 'viem'

import { __ROUTER_ADDRESS_MAP } from '../abi/__ROUTER_ADDRESS_MAP.js'
import { __ROUTER_FROM_TO_STABLE } from '../abi/__ROUTER_FROM_TO_STABLE.js'
import { __ROUTER_FROM_TO_STABLE_FACTORY } from '../abi/__ROUTER_FROM_TO_STABLE_FACTORY.js'
import { BytesLike, GetAmountsOutMultiArgs, InflatedPath } from '../typings/index.js'
import { InflatedPathLeg } from '../typings/zod.js'

export abstract class GetAmountsOutHelper {
  public static generateGetAmountsOutMultiArgs(paths: InflatedPath[], amountIn: string): GetAmountsOutMultiArgs {
    return [
      paths.map(path =>
        path.map(leg => {
          const calldata = this.getCalldata(leg, amountIn)
          return { router: leg.dexConfiguration.router_address, data: calldata }
        }),
      ),
    ]
  }

  private static getCalldata(leg: InflatedPathLeg, amountIn: string): BytesLike {
    switch (leg.dexConfiguration.router_getAmountsOut) {
      case 'address[]':
        return this.getAddressMapCalldata(leg, amountIn)
      case 'from_to_stable':
        return this.getFromToStableCalldata(leg, amountIn)
      case 'from_to_stable_factory':
        return this.getFromToStableFactoryCalldata(leg, amountIn)
    }
  }

  private static getAddressMapCalldata(leg: InflatedPathLeg, amountIn: string): BytesLike {
    return encodeFunctionData({
      abi: __ROUTER_ADDRESS_MAP,
      functionName: 'getAmountsOut',
      args: [BigInt(amountIn), [leg.from.address, leg.to.address]],
    })
  }

  private static getFromToStableCalldata(leg: InflatedPathLeg, amountIn: string): BytesLike {
    return encodeFunctionData({
      abi: __ROUTER_FROM_TO_STABLE,
      functionName: 'getAmountsOut',
      args: [BigInt(amountIn), [{ from: leg.from.address, to: leg.to.address, stable: leg.stable }]],
    })
  }

  private static getFromToStableFactoryCalldata(leg: InflatedPathLeg, amountIn: string): BytesLike {
    return encodeFunctionData({
      abi: __ROUTER_FROM_TO_STABLE_FACTORY,
      functionName: 'getAmountsOut',
      args: [
        BigInt(amountIn),
        [{ from: leg.from.address, to: leg.to.address, stable: leg.stable, factory: leg.dexConfiguration.factory_address }],
      ],
    })
  }
}
