import { DEXConfigurations } from '../config.js'
import { BytesLike, DEXConfiguration } from '../typings/index.js'

export const FIVE_MINUTES_MS = 5 * 60 * 1000

export function getDEXConfiguration(router: BytesLike): DEXConfiguration | undefined {
  return Object.values(DEXConfigurations).find(r => r.router_address.toLowerCase() === router.toLowerCase())
}
