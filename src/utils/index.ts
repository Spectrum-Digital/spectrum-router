import { DEXRouters } from '../config.js'
import { BytesLike, DEXRouter } from '../typings/index.js'

export function getDEXRouter(router: BytesLike): DEXRouter | undefined {
  return Object.values(DEXRouters).find(r => r.address.toLowerCase() === router.toLowerCase())
}
