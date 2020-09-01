import { CSSProperties } from 'react'
import * as H from '../lib/Hash'
import { collectKeyframes } from './Css'
import { Properties } from './Rule'

export type Frames = { [pct: number]: CSSProperties }

export class Keyframes {
  _used = false

  constructor(
    readonly prefix: string,
    readonly frames: Frames, //
    readonly hash = H.build('Keyframe', prefix, H.json(frames))
  ) {}

  print(): string | undefined {
    const perFrame = Object.entries(this.frames).map(
      ([percentage, props]) => `${percentage}% ${new Properties(props).print()}`
    )

    return `@keyframes ${this.name()} {\n${perFrame.join('\n')}\n}`
  }

  name(): string {
    return `${this.prefix}-${this.hash}`
  }

  use() {
    this._used = true
  }

  used() {
    return this._used
  }

  toString() {
    this.use()
    return this.name()
  }
}

export function keyframes(frames: Frames, prefix = 'kf'): Keyframes {
  const keyframes = new Keyframes(prefix, frames)
  collectKeyframes(keyframes)
  return keyframes
}
