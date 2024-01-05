import { SpectrumRouter } from './clients/spectrum-router.js'
import { SpectrumContract } from './clients/spectrum-contract.js'
import { DEXRouters } from './config.js'

export * from './typings/index.js'
export { InflatedPath as Path } from './typings/index.js' // vendors will use Path instead of InflatedPath
export { SpectrumRouter, SpectrumContract, DEXRouters }
