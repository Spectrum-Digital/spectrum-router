import { InflatedPath, NodeVolatility } from '../typings'

type PathWithVolatilityIsNotStable = Array<InflatedPath[number] & { stable: false; volatility: NodeVolatility }>
type PathWithVolatility = Array<InflatedPath[number] & { stable: boolean; volatility: NodeVolatility }>

export function parallelizeVolatility(path: PathWithVolatilityIsNotStable): InflatedPath[] {
  let result: PathWithVolatility[] = [path.map(leg => ({ ...leg }))] // start with a copy of the original array

  // Check if we need to go from volatile to stable (default value is stable = false)
  for (let i = 0; i < path.length; i++) {
    const current = path[i]!
    if (current.volatility === 'stable') {
      for (let j = 0; j < result.length; j++) {
        result[j]![i]!.stable = true
      }
    }
  }

  // So far it's either stable or volatile, but not both. Now we need to fork the array if it's stable_volatile.
  // We can safely assume that the original value is volatile, so the forked version is stable.
  for (let i = 0; i < path.length; i++) {
    const current = path[i]!
    if (current.volatility === 'stable_volatile') {
      const forked = result.map(el => el.map(item => ({ ...item }))) // create a copy of the current result
      for (let j = 0; j < forked.length; j++) {
        forked[j]![i]!.stable = true
      }
      result = result.concat(forked) // add the forked arrays to the result
    }
  }

  // Remove the volatility field from the result
  return result.map(path => path.map(({ dexConfiguration, from, to, stable }) => ({ dexConfiguration, from, to, stable })))
}
