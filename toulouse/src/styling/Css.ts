import React, { useEffect, CSSProperties } from 'react'
import { pt } from '../lib/Geometry'
import { Rgba } from './Rgba'
import { Var } from '../lib'

export interface EmptySelector {
  empty: {}
}

export interface SiblingSelector {
  sibling: Selector[]
}

export interface ClassSelector {
  class: string
}

export interface OrSelector {
  or: Selector[]
}

export interface SelfSelector {
  self: Selector[]
}

export interface ChildSelector {
  child: Selector[]
}

export interface SubSelector {
  sub: Selector[]
}

export type Selector =
  | string
  | EmptySelector
  | ClassSelector
  | OrSelector
  | SelfSelector
  | ChildSelector
  | SubSelector
  | SiblingSelector

const toSel = (x: Rule | Selector): Selector => (x instanceof Rule ? x.sel : x)

export class Rule<S extends Selector = Selector> {
  public props: React.CSSProperties = {}

  constructor(public sel: S) {
    pushRule(this)
  }

  selector = () => printSelector(this.sel)

  style(props: React.CSSProperties): Rule<S> {
    this.props = { ...this.props, ...props }
    return this
  }

  or = (...xs: (Rule | Selector)[]): Rule<Selector> =>
    new Rule({
      or: [this.sel, ...xs.map(toSel)]
    })

  self = (...xs: (Rule | Selector)[]): Rule<Selector> =>
    new Rule({
      self: [this.sel, ...xs.map(toSel)]
    })

  child = (...xs: (Rule | Selector)[]): Rule<Selector> =>
    new Rule({
      child: [this.sel, ...(xs.length === 0 ? ['*'] : xs.map(toSel))]
    })

  sub = (...xs: (Rule | Selector)[]): Rule<Selector> =>
    new Rule({
      sub: [this.sel, ...(xs.length === 0 ? ['*'] : xs.map(toSel))]
    })

  sibling = (...xs: (Rule | Selector)[]): Rule<Selector> =>
    new Rule({
      sibling: [this.sel, ...(xs.length === 0 ? ['*'] : xs.map(toSel))]
    })

  // Shortcuts

  selfOrChild = (...xs: (Rule | Selector)[]) => this.self(...xs).or(this.child(...xs))
  selfOrSub = (...xs: (Rule | Selector)[]) => this.self(...xs).or(this.sub(...xs))
  hover = () => this.self(':hover')
  active = () => this.self(':active')
  firstChild = () => this.self(':first-child')
  lastChild = () => this.self(':last-child')
  focus = () => this.self(':focus')
  before = () => this.self('::before')
  after = () => this.self('::after')

  not = (neg: Rule | ((r: Rule) => Rule)): Rule<Selector> => {
    if (neg instanceof Function) {
      return this.self(`:not(${printSelector(neg(new Rule({ empty: {} })).sel)})`)
    } else {
      return this.self(`:not(${printSelector(neg.sel)})`)
    }
  }

  tail = () => this.not(s => s.firstChild())
  init = () => this.not(s => s.lastChild())

  static or = (...xs: (Rule | Selector)[]) =>
    new Rule({
      or: xs.map(toSel)
    })
}

export class ClassName extends Rule<{ class: string }> {
  toString() {
    return this.sel.class
  }
}

// ----------------------------------------------------------------------------
// Collecting

let Counter = 0

export function className(prefix: string = 'c', obj?: React.CSSProperties) {
  const c = new ClassName({ class: `${prefix}-${Counter++}` })
  return obj ? c.style(obj) : c
}

export const style = (obj: React.CSSProperties): ClassName => className().style(obj)

export const rule = (x: Rule | Selector, ...xs: (Rule | Selector)[]) =>
  (x instanceof Rule ? x : new Rule<Selector>(x)).or(...xs)

export const px = (p: number) => `${p}px`
export const pct = (p: number) => `${p}%`
export const commas = (...xs: string[]) => xs.join()

// ----------------------------------------------------------------------------
// Installing

interface CSS {
  installed: {
    rules: Rule[]
    keyframes: Keyframe[]
  }
  pending: {
    rules: Rule[]
    keyframes: Keyframe[] //
  }
}

const CSS: CSS = ((window as any).__CSS = {
  installed: { rules: [], keyframes: [] },
  pending: { rules: [], keyframes: [] }
})

function pushRule(sheet: Rule) {
  CSS.pending.rules.push(sheet)
  install()
}

function pushKeyframe(keyframe: Keyframe) {
  CSS.pending.keyframes.push(keyframe)
  install()
}

const InstallCount = new Var(0)

let frameId = -1
function install() {
  cancelAnimationFrame(frameId)
  frameId = window.requestAnimationFrame(() => {
    const { rules, keyframes } = CSS.pending
    CSS.pending.rules = []
    CSS.pending.keyframes = []
    CSS.installed.rules = CSS.installed.rules.concat(rules)
    CSS.installed.keyframes = CSS.installed.keyframes.concat(keyframes)
    installStyleSheet(rules, keyframes, InstallCount.get())
    InstallCount.modify(c => c + 1)
  })
}

export const useCssInstalled = (callback: (count: number) => void) =>
  useEffect(() => InstallCount.debounce().effect(callback), [])

function installStyleSheet(rules: Rule[], keyframes: Keyframe[], index: number) {
  const timer = `installing ${rules.length} style rule${
    rules.length === 1 ? '' : 's'
  } [${index}]`
  console.time(timer)

  const head = document.head || document.getElementsByTagName('head')[0]
  const styleTag = document.createElement('style')
  styleTag.type = 'text/css'
  head.appendChild(styleTag)

  const css1 = printSheet(rules)
  const css2 = printKeyframes(keyframes)
  const css = `${css1}\n\n${css2}`
  styleTag.innerText = css
  window.localStorage.setItem(`stylesheet_${index}`, css)

  console.timeEnd(timer)
}

// ----------------------------------------------------------------------------
// Printing to CSS

function printSheet(sheet: Rule[]) {
  return sheet
    .map(printRule)
    .filter(v => v.length)
    .join('\n\n')
}

const printRule = (rule: Rule) => `${rule.selector()} ${printProperties(rule.props)}`

function printProperties(props: React.CSSProperties) {
  let out = []
  for (let key in props) {
    out.push(printProperty(key, (props as any)[key]))
  }
  return `{\n${out.join('\n')}\n}`
}

export function printSelector(sel: Selector): string {
  return printSelector1(normalizeSelector(sel))
}

function printSelector1(s: Selector): string {
  if (typeof s === 'string') return s
  if ('empty' in s) return ''
  if ('class' in s) return '.' + s.class
  if ('or' in s) return s.or.map(printSelector1).join(',\n')
  if ('self' in s) return s.self.map(printSelector1).join('')
  if ('child' in s) return s.child.map(printSelector1).join(' > ')
  if ('sub' in s) return s.sub.map(printSelector1).join(' ')
  if ('sibling' in s) return s.sibling.map(printSelector1).join(' + ')
  return s
}

function printProperty(key: string, value: string) {
  return `  ${toSnakeCase(key)}: ${value};`
}

// ----------------------------------------------------------------------------

function normalizeSelector(s: Selector): Selector {
  const xs = liftOr(s)
  if (xs.length === 1) return xs[0]
  return { or: xs }
}

function liftOr(s: Selector): Selector[] {
  if (typeof s === 'string') return [s]
  if ('empty' in s) return [s]
  if ('class' in s) return [s]
  if ('or' in s) return s.or.flatMap(liftOr)
  if ('self' in s) return cartesionN(...s.self.map(liftOr)).map(xs => ({ self: xs }))
  if ('child' in s) return cartesionN(...s.child.map(liftOr)).map(xs => ({ child: xs }))
  if ('sub' in s) return cartesionN(...s.sub.map(liftOr)).map(xs => ({ sub: xs }))
  if ('sibling' in s)
    return cartesionN(...s.sibling.map(liftOr)).map(xs => ({ sibling: xs }))
  return s
}

const cartesionN = <A>(...xs: A[][]): A[][] =>
  xs.length === 1
    ? xs[0].map(x => [x])
    : cartesion((x, y) => [x].concat(y), xs[0], cartesionN(...xs.slice(1)))

const cartesion = <A, B, C>(f: (x: A, y: B) => C, xs: A[], ys: B[]): C[] =>
  xs.flatMap(x => ys.map(y => f(x, y)))

// ----------------------------------------------------------------------------
// Parsing selectors

// function parseSelector(input: string): Selector {
//     const preprocess = input.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')')
//     const parts = preprocess.split(/,/).map(trim)

//     if (parts.length === 1) {
//         const children = parts[0].split(/>/).map(trim)
//         if (children.length === 1) {
//             const descs = children[0].split(/\s+/).map(trim)
//             if (descs.length === 1) return parsePart(descs[0])
//             else return { desc: descs.map(parseSelector) }
//         } else return { child: children.map(parseSelector) }
//     }
//     return { or: parts.map(parseSelector) }
// }

// function trim(s: string) {
//     return s.replace(/(^\s*)|(\s*$)/g, '')
// }

// ----------------------------------------------------------------------------
// Utils

function toSnakeCase(input: string) {
  if (input[0] === '-') return input
  return input
    .replace(/[A-Z]/g, v => '-' + v.toLowerCase())
    .replace(/^[-]*/, '')
    .replace(/[-]*$/, '')
}

export type Classy1 = string | string[] | boolean | ClassName | undefined
export type Classy = string | Classy1[] | boolean | ClassName | undefined

export const cx = (...classes: Classy[]): string =>
  classes
    .flatMap(c => {
      if (c === undefined) return []
      if (typeof c === 'boolean') return []
      if (typeof c === 'string') return c.length > 0 ? [c] : []
      if (c instanceof Array) return [cx(...c)]
      if (c instanceof ClassName) return [c.sel.class]
      return c
    })
    .join(' ')

export const important = (s: string | number) => `${s} !important`

export const boxShadow = (clr: Rgba, blur: number, spread = 0, d = pt(0, 0)) =>
  [px(d.x), px(d.y), px(blur), px(spread), clr.toString()].join(' ')

export const insetShadow = (c: Rgba, blur: number, spread = 0, d = pt(0, 0)) =>
  `inset ${boxShadow(c, blur, spread, d)}`

export const leftRadius = (r: string): CSSProperties => ({
  borderTopLeftRadius: r,
  borderBottomLeftRadius: r
})

export const rightRadius = (r: string): CSSProperties => ({
  borderTopRightRadius: r,
  borderBottomRightRadius: r
})

// ----------------------------------------------------------------------------

const keyframeName = (prefix: string = 'kf') => `${prefix}-${Counter++}`

type Frames = { [pct: number]: React.CSSProperties }

interface Keyframe {
  name: string
  frames: Frames
}

export function keyframes(frames: Frames): string {
  const name = keyframeName()
  pushKeyframe({ name, frames })
  return name
}

export function printKeyframes(keyframes: Keyframe[]): string {
  return keyframes
    .map(({ name, frames }) => {
      const perFrame = Object.entries(frames).map(
        ([percentage, props]) => `${percentage}% ${printProperties(props)}`
      )
      return `@keyframes ${name} {\n${perFrame.join('\n')}\n}`
    })
    .join('\n\n')
}
