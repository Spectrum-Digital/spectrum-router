import { encodeFunctionData } from 'viem'

import { __ROUTER_ADDRESS_MAP } from '../abi/__ROUTER_ADDRESS_MAP.js'
import { __ROUTER_FROM_TO_STABLE } from '../abi/__ROUTER_FROM_TO_STABLE.js'
import { __ROUTER_FROM_TO_STABLE_FACTORY } from '../abi/__ROUTER_FROM_TO_STABLE_FACTORY.js'
import { BytesLike, DEXRouter, GetAmountsOutMultiArgs, Path, Token } from '../typings/index.js'

type CompressedPath = {
  router: DEXRouter
  legs: {
    factory: BytesLike
    from: Token
    to: Token
    stable: boolean
  }[]
}

export abstract class GetAmountsOutHelper {
  public static compressPath(path: Path): CompressedPath[] {
    return path.reduce((acc, leg) => {
      const _lastPath = acc[acc.length - 1]
      const lastPath: CompressedPath = _lastPath ? _lastPath : { router: leg.router, legs: [] }

      if (lastPath.router.address === leg.router.address) {
        lastPath.legs.push({ from: leg.from, to: leg.to, stable: leg.stable, factory: leg.router.factory })
        if (!acc.length) {
          acc[0] = lastPath
        } else {
          acc[acc.length - 1] = lastPath
        }
      } else {
        acc[acc.length] = lastPath
      }
      return acc
    }, [] as CompressedPath[])
  }

  public static decompressPath(paths: CompressedPath[]): Path {
    return paths.reduce((acc, compressed) => {
      const path = compressed.legs.map(leg => ({
        router: compressed.router,
        from: leg.from,
        to: leg.to,
        stable: leg.stable,
      }))
      acc.push(...path)
      return acc
    }, [] as Path)
  }

  public static generateGetAmountsOutMultiArgs(paths: CompressedPath[][], amountIn: string): GetAmountsOutMultiArgs {
    return [
      paths.map(path =>
        path.map(compressed => {
          const calldata = this.getCalldata(compressed, amountIn)
          return { router: compressed.router.address, data: calldata }
        }),
      ),
    ]
  }

  private static getCalldata(compressed: CompressedPath, amountIn: string): BytesLike {
    switch (compressed.router.getAmountsOut) {
      case 'address[]':
        return this.getAddressMapCalldata(compressed, amountIn)
      case 'from_to_stable':
        return this.getFromToStableCalldata(compressed, amountIn)
      case 'from_to_stable_factory':
        return this.getFromToStableFactoryCalldata(compressed, amountIn)
    }
  }

  private static getAddressMapCalldata(compressed: CompressedPath, amountIn: string): BytesLike {
    const first = compressed.legs[0]
    if (!first) return '0x'

    return encodeFunctionData({
      abi: __ROUTER_ADDRESS_MAP,
      functionName: 'getAmountsOut',
      args: [BigInt(amountIn), [first.from.address, ...compressed.legs.map(leg => leg.to.address)]],
    })
  }

  private static getFromToStableCalldata(compressed: CompressedPath, amountIn: string): BytesLike {
    return encodeFunctionData({
      abi: __ROUTER_FROM_TO_STABLE,
      functionName: 'getAmountsOut',
      args: [BigInt(amountIn), compressed.legs.map(leg => ({ from: leg.from.address, to: leg.to.address, stable: leg.stable }))],
    })
  }

  private static getFromToStableFactoryCalldata(compressed: CompressedPath, amountIn: string): BytesLike {
    return encodeFunctionData({
      abi: __ROUTER_FROM_TO_STABLE_FACTORY,
      functionName: 'getAmountsOut',
      args: [
        BigInt(amountIn),
        compressed.legs.map(leg => ({
          from: leg.from.address,
          to: leg.to.address,
          stable: leg.stable,
          factory: leg.factory,
        })),
      ],
    })
  }
}
