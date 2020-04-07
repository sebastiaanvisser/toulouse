import * as Lib from './mylib'

export interface Configuration {
  flag: boolean
}

export function startLib(config: Configuration) {
  return !config.flag ? Lib.ComputeThisThings() : -2
}
