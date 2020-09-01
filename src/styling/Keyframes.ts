import { CSSProperties } from 'react'
import { Collectable, CssRegister, collect } from './Css'
import { printProperties } from './Selector'

export type Frames = { [pct: number]: CSSProperties }

export class Keyframes implements Collectable {
  id: number | undefined

  constructor(
    readonly prefix: string,
    readonly frames: Frames //
  ) {}

  print(): string | undefined {
    if (this.id === undefined) return

    const perFrame = Object.entries(this.frames).map(
      ([percentage, props]) => `${percentage}% ${printProperties(props)}`
    )

    return `@keyframes ${this.prefix}-${this.id} {\n${perFrame.join('\n')}\n}`
  }

  get used() {
    return this.id !== undefined
  }

  get scoped() {
    return true
  }

  use(): string {
    if (this.id == undefined) {
      this.id = CssRegister.log.counter
      CssRegister.log.counter++
    }
    return `${this.prefix}-${this.id}`
  }

  toString() {
    return this.use()
  }
}

export function keyframes(frames: Frames, prefix = 'kf'): Keyframes {
  const keyframes = new Keyframes(prefix, frames)
  collect(keyframes)
  return keyframes
}
