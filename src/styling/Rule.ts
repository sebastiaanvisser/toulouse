import { CSSProperties } from 'react'
import * as H from '../lib/Hash'
import { collectGlobal, collectScoped } from './Css'
import {
  ClassSelector,
  GeneratedSelector,
  OrSelector,
  Selector,
  SelectorLike
} from './Selector'

export class Rule {
  constructor(readonly selector: Selector, readonly props: Properties) {
    if (selector.scoped()) collectScoped(this)
    else collectGlobal(this)
  }

  get hash() {
    return H.build('Rule', this.selector.hash, H.json(this.props))
  }

  print(): string | undefined {
    const sel = this.selector.print()
    const props = this.props.print()
    if (sel && props) return `${sel} ${props}`
  }

  used() {
    return this.selector.used()
  }
}

// ----------------------------------------------------------------------------

export const className = (name: string) => new ClassSelector(name)

export const style = (css: CSSProperties = {}): GeneratedSelector =>
  new GeneratedSelector({ [H.json(css)]: true }).style(css).name('c')

export const rule = (...xs: SelectorLike[]) => new OrSelector(xs.map(Selector.like))

// ----------------------------------------------------------------------------

export class Properties {
  constructor(
    readonly css: CSSProperties,
    readonly hash = H.build('Properties', H.json(css))
  ) {}

  print() {
    let out = []
    for (let key in this.css) {
      out.push(Properties.print1(key, (this.css as any)[key]))
    }
    return out.length > 0 ? `{\n${out.join('\n')}\n}` : undefined
  }

  static print1(key: string, value: string): string {
    return `  ${Properties.toSnakeCase(key)}: ${value};`
  }

  static toSnakeCase(input: string) {
    if (input[0] === '-') return input
    return input
      .replace(/[A-Z]/g, v => '-' + v.toLowerCase())
      .replace(/^[-]*/, '')
      .replace(/[-]*$/, '')
  }
}
