import { CSSProperties } from 'react'
import * as H from '../lib/Hash'
import { Properties, Rule } from './Rule'

export type SelectorLike = Selector | string | Rule

export abstract class Selector {
  _used: boolean = false

  abstract hash: number
  abstract _print(): string
  abstract explode(): Selector[]
  abstract scoped(): boolean
  abstract dig: Selector[]

  style(css: CSSProperties): this {
    const props = new Properties(css)

    this.traverse(sel => {
      if (sel instanceof GeneratedSelector && !sel.used()) {
        sel.update(this.hash, props.hash)
      }
    })

    new Rule(this, props)
    return this
  }

  print() {
    return this.normalize()._print()
  }

  use() {
    this._used = true
  }

  unuse() {
    this._used = false
    this.dig.forEach(sel => sel.unuse())
  }

  used(): boolean {
    return this._used || this.dig.some(sel => sel.used())
  }

  traverse(f: (sel: Selector) => void) {
    f(this)
    this.dig.forEach(sel => sel.traverse(f))
  }

  normalize() {
    return Or(...this.explode())
  }

  or(x: SelectorLike, ...xs: SelectorLike[]) {
    return Or(this, x, ...xs)
  }

  self(x: SelectorLike): Selector {
    return Self(this, x)
  }

  child(x: SelectorLike) {
    return Child(this, x)
  }

  get children(): Selector {
    return Child(this, Any)
  }

  deep(x: SelectorLike) {
    return Deep(this, x)
  }

  get anyDeep(): Selector {
    return Deep(this, Any)
  }

  sibling(x: SelectorLike): Selector {
    return Sibling(this, x)
  }

  get siblings(): Selector {
    return Sibling(this, Any)
  }

  // // Shortcuts

  selfOrChild(x: SelectorLike): Selector {
    return this.self(x).or(this.child(x))
  }

  selfOrSub(x: SelectorLike): Selector {
    return this.self(x).or(this.deep(x))
  }

  get hover(): Selector {
    return this.self(':hover')
  }

  get active() {
    return this.self(':active')
  }

  get firstChild() {
    return this.self(':first-child')
  }

  get lastChild() {
    return this.self(':last-child')
  }

  get focus() {
    return this.self(':focus')
  }

  get before() {
    return this.self('::before')
  }

  get after() {
    return this.self('::after')
  }

  not(sel: SelectorLike): Selector {
    return this.self(Not(sel))
  }

  get tail() {
    return this.not(Empty.firstChild)
  }

  get init() {
    return this.not(Empty.lastChild)
  }

  static like(sel: SelectorLike): Selector {
    if (sel instanceof Selector) return sel
    if (sel instanceof Rule) return sel.selector
    return new PrimSelector(sel)
  }
}

// ----------------------------------------------------------------------------

export class EmptySelector extends Selector {
  constructor(readonly hash = H.build('empty')) {
    super()
  }

  explode() {
    return [this]
  }

  _print() {
    return ''
  }

  scoped() {
    return false
  }

  get dig() {
    return []
  }
}

// ----------------------------------------------------------------------------

export class PrimSelector extends Selector {
  constructor(
    readonly prim_: string,
    readonly hash = H.build('prim', prim_) //
  ) {
    super()
  }

  explode() {
    return [this]
  }

  _print() {
    return this.prim_
  }

  scoped() {
    return false
  }

  get dig() {
    return []
  }
}

// ----------------------------------------------------------------------------

export class ClassSelector extends Selector {
  constructor(public _name: string) {
    super()
  }

  get hash() {
    return H.build('class', this._name)
  }

  explode() {
    return [this]
  }

  _print() {
    return `.${this.className()}`
  }

  scoped() {
    return true
  }

  disamb(v: string | number | boolean | undefined) {
    this._name += `-${v?.toString()}`
    return this
  }

  className() {
    this.use()
    return `${this._name}`
  }

  get dig() {
    return []
  }
}

export class GeneratedSelector extends ClassSelector {
  constructor(
    readonly deps: { [hash: number]: true } = {} // hash
  ) {
    super('c')
  }

  get hash() {
    return H.build('class', this._name, ...Object.keys(this.deps))
  }

  update(...hashes: number[]) {
    hashes.forEach(hash => (this.deps[hash] = true))
    return this
  }

  name(name: string) {
    this._name = name
    return this
  }

  className() {
    this.use()
    return `${this._name}-${this.hash}`
  }
}

// ----------------------------------------------------------------------------

export class NotSelector extends Selector {
  constructor(
    readonly _not: Selector,
    readonly hash = H.build('not', _not.hash) //
  ) {
    super()
  }

  explode() {
    return this._not.explode().map(Not)
  }

  _print() {
    return `:not(${this._not._print()})`
  }

  scoped() {
    return this._not.scoped()
  }

  get dig() {
    return [this._not]
  }
}

// ----------------------------------------------------------------------------

export class OrSelector extends Selector {
  constructor(
    readonly _or: Selector[],
    readonly hash = H.build('or', ..._or.map(r => r.hash))
  ) {
    super()
  }

  explode() {
    return this._or.flatMap(s => s.explode())
  }

  _print() {
    return this._or.map(s => s._print()).join(',\n')
  }

  scoped() {
    return this._or.every(s => s.scoped())
  }

  get dig() {
    return this._or
  }
}

// ----------------------------------------------------------------------------

export class SiblingSelector extends Selector {
  constructor(
    readonly _sibling: Selector[],
    readonly hash = H.build('sibling', ..._sibling.map(r => r.hash))
  ) {
    super()
  }

  explode() {
    return cartesionN(...this._sibling.map(s => s.explode())).map(xs => Sibling(...xs))
  }

  _print() {
    return this._sibling.map(s => s._print()).join(' + ')
  }

  scoped() {
    return this._sibling.some(s => s.scoped())
  }

  get dig() {
    return this._sibling
  }
}

// ----------------------------------------------------------------------------

export class SelfSelector extends Selector {
  constructor(
    readonly _self: Selector[],
    readonly hash = H.build('self', ..._self.map(r => r.hash))
  ) {
    super()
  }

  explode() {
    return cartesionN(...this._self.map(s => s.explode())).map(xs => Self(...xs))
  }

  _print() {
    return this._self.map(s => s._print()).join('')
  }

  scoped() {
    return this._self.some(s => s.scoped())
  }

  get dig() {
    return this._self
  }
}

// ----------------------------------------------------------------------------

export class ChildSelector extends Selector {
  constructor(
    readonly _child: Selector[],
    readonly hash = H.build('child', ..._child.map(r => r.hash))
  ) {
    super()
  }

  explode() {
    return cartesionN(...this._child.map(s => s.explode())).map(xs => Child(...xs))
  }

  _print() {
    return this._child.map(s => s._print()).join(' > ')
  }

  scoped() {
    return this._child.some(s => s.scoped())
  }

  get dig() {
    return this._child
  }
}

// ----------------------------------------------------------------------------

export class DeepSelector extends Selector {
  constructor(
    readonly _deep: Selector[],
    readonly hash = H.build('deep', ..._deep.map(r => r.hash))
  ) {
    super()
  }

  explode() {
    return cartesionN(...this._deep.map(s => s.explode())).map(xs => Deep(...xs))
  }

  _print() {
    return this._deep.map(s => s._print()).join(' ')
  }

  scoped() {
    return this._deep.some(s => s.scoped())
  }

  get dig() {
    return this._deep
  }
}

// ----------------------------------------------------------------------------

const Empty = new EmptySelector()
const Not = (x: SelectorLike) => new NotSelector(Selector.like(x))
const Or = (...xs: SelectorLike[]) => new OrSelector(xs.map(Selector.like))
const Self = (...xs: SelectorLike[]) => new SelfSelector(xs.map(Selector.like))
const Child = (...xs: SelectorLike[]) => new ChildSelector(xs.map(Selector.like))
const Deep = (...xs: SelectorLike[]) => new DeepSelector(xs.map(Selector.like))
const Sibling = (...xs: SelectorLike[]) => new SiblingSelector(xs.map(Selector.like))

// ----------------------------------------------------------------------------
// Constructors

export const Prim = (prim: string) => new PrimSelector(prim)
export const Id = (id: string) => new PrimSelector(`#${id}`)
export const Class = (name: string) => new PrimSelector(`.${name}`)
export const Any = Prim(`*`)
export const Hover_ = Prim(':hover')
export const Active = Prim(':active')
export const FirstChild = Prim(':first-child')
export const LastChild = Prim(':last-child')
export const Focus = Prim(':focus')
export const Before = Prim('::before')
export const After = Prim('::after')

// ----------------------------------------------------------------------------

// Helpers

const cartesionN = <A>(...xs: A[][]): A[][] =>
  xs.length === 1
    ? xs[0].map(x => [x])
    : cartesion((x, y) => [x].concat(y), xs[0], cartesionN(...xs.slice(1)))

const cartesion = <A, B, C>(f: (x: A, y: B) => C, xs: A[], ys: B[]): C[] =>
  xs.flatMap(x => ys.map(y => f(x, y)))
