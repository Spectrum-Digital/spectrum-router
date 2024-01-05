import { getAddress } from 'viem'
import { CompressedPath, InflatedPath } from '../typings'
import { getDEXRouter } from '../utils'
import { CompressedPathLeg, InflatedPathLeg } from '../typings/zod'

export abstract class Compression {
  public static compressInflatedPaths(paths: InflatedPath[]): CompressedPath[] {
    return paths.map(path => this.compressInflatedPath(path))
  }

  public static compressInflatedPath(path: InflatedPath): CompressedPath {
    return path.map(leg => this.__compressInflatedPathLeg(leg)).join('|')
  }

  private static __compressInflatedPathLeg(leg: InflatedPathLeg): CompressedPathLeg {
    return `${leg.router.address}-${leg.from.address}:${leg.from.decimals}-${leg.to.address}:${leg.to.decimals}-${leg.stable}`
  }

  public static decompressPaths(paths: CompressedPath[]): InflatedPath[] {
    return paths.map(path => this.decompressPath(path))
  }

  public static decompressPath(path: CompressedPath): InflatedPath {
    const result = path.split('|').reduce(
      (acc, leg) => {
        const decompressed = this.__decompressPathLeg(leg)
        if (!decompressed) {
          acc.error = true
        } else {
          acc.path.push(decompressed)
        }
        return acc
      },
      { error: false, path: [] } as { error: boolean; path: InflatedPath },
    )

    return result.error ? [] : result.path
  }

  private static __decompressPathLeg(leg: string): InflatedPathLeg | undefined {
    // router-from:decimals-to:decimals-stable
    const [_router, _from, _to, _stable] = leg.split('-')
    if (!_router || !_from || !_to || !_stable) return undefined

    const [fromAddress, fromDecimals] = _from.split(':')
    const [toAddress, toDecimals] = _to.split(':')
    if (!fromAddress || !fromDecimals || !toAddress || !toDecimals) return undefined

    const routerAddress = getAddress(_router)
    const router = getDEXRouter(routerAddress)
    if (!router) return undefined

    const from = getAddress(fromAddress)
    const to = getAddress(toAddress)
    const stable = _stable === 'true'

    return { router, from: { address: from, decimals: Number(fromDecimals) }, to: { address: to, decimals: Number(toDecimals) }, stable }
  }
}
