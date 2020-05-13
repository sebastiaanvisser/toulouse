import React, { CSSProperties, useEffect } from 'react'
import { Rgba } from './Rgba'
import { pt } from '../lib/Geometry'
import { Var } from '../lib/Var'

// --------------------------------------------------------------------------------

export interface Stylesheet {
  rules: Rule[]
  keyframes: Keyframe[]
}

export interface CssInstalled {
  nameCounter: number
  server: number
  skipped: number
  client: number
}

export interface CssRegister {
  pending: Stylesheet
  installed: CssInstalled
}

export const CssRegister: CssRegister = {
  pending: {
    rules: [],
    keyframes: []
  },
  installed: {
    nameCounter: 0,
    server: 0,
    skipped: 0,
    client: 0
  }
}

// --------------------------------------------------------------------------------
// SETUP

if (typeof window !== 'undefined') {
  const nextData = (window as any).__NEXT_DATA__

  const { server, nameCounter } = nextData.props.cssInstalled

  CssRegister.installed = {
    nameCounter: 0,
    server,
    skipped: 0,
    client: 0
  }

  console.log(`Using prerendered CSS: ${nameCounter} class names, ${server} rules`)
}

// --------------------------------------------------------------------------------

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

const toSelector = (x: Rule | Selector): Selector => (x instanceof Rule ? x.sel : x)

export class Rule<S extends Selector = Selector> {
  public props: CSSProperties = {}

  constructor(public sel: S) {
    pushRule(this)
  }

  selector = () => printSelector(this.sel)

  style(props: CSSProperties): this {
    this.props = { ...this.props, ...props }
    return this
  }

  or = (...xs: (Rule | Selector)[]): Rule<Selector> =>
    new Rule({
      or: [this.sel, ...xs.map(toSelector)]
    })

  self = (...xs: (Rule | Selector)[]): Rule<Selector> =>
    new Rule({
      self: [this.sel, ...xs.map(toSelector)]
    })

  child = (...xs: (Rule | Selector)[]): Rule<Selector> =>
    new Rule({
      child: [this.sel, ...(xs.length === 0 ? ['*'] : xs.map(toSelector))]
    })

  sub = (...xs: (Rule | Selector)[]): Rule<Selector> =>
    new Rule({
      sub: [this.sel, ...(xs.length === 0 ? ['*'] : xs.map(toSelector))]
    })

  sibling = (...xs: (Rule | Selector)[]): Rule<Selector> =>
    new Rule({
      sibling: [this.sel, ...(xs.length === 0 ? ['*'] : xs.map(toSelector))]
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

  // TODO: test
  not = (neg: Rule | ((r: Rule) => Rule)): Rule<Selector> => {
    if (neg instanceof Function) {
      return this.self(`:not(${printSelector(neg(new Rule({ empty: {} })).sel)})`)
    } else {
      return this.self(`:not(${printSelector(neg.sel)})`)
    }
  }

  tail = () => this.not(s => s.firstChild())
  init = () => this.not(s => s.lastChild())

  static or = (...xs: (Rule | Selector)[]) => new Rule({ or: xs.map(toSelector) })
}

export class ClassName extends Rule<{ class: string }> {
  toString() {
    return this.sel.class
  }

  name(className: string) {
    this.sel.class = className
    return this
  }
}

// ----------------------------------------------------------------------------
// Collecting

export function className(prefix: string = 'c', obj?: React.CSSProperties) {
  const c = new ClassName({ class: `${prefix}-${CssRegister.installed.nameCounter++}` })
  return obj ? c.style(obj) : c
}

export const style = (obj: React.CSSProperties): ClassName => className().style(obj)

export const rule = (...xs: (Rule | Selector)[]) => Rule.or(...xs)

export const px = (p: number) => `${p}px`
export const pct = (p: number) => `${p}%`
export const commas = (...xs: string[]) => xs.join()

// ----------------------------------------------------------------------------

const keyframeName = (prefix: string = 'kf') =>
  `${prefix}-${CssRegister.installed.nameCounter++}`

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

// ----------------------------------------------------------------------------
// Installing

function pushRule(rule: Rule) {
  CssRegister.pending.rules.push(rule)
  if (typeof window !== 'undefined') installInBrowser()
}

function pushKeyframe(keyframe: Keyframe) {
  CssRegister.pending.keyframes.push(keyframe)
  if (typeof window !== 'undefined') installInBrowser()
}

// Server side rendering

export function serverSideRenderCss(): {
  css: string
  cssInstalled: CssInstalled
} {
  const sheet = CssRegister.pending
  const css = printStylesheet(sheet).join('\n\n')

  CssRegister.installed.server = sheet.rules.length + sheet.keyframes.length
  const cssInstalled = CssRegister.installed

  return { css, cssInstalled }
}

const InstallTrigger = new Var(0)

export const useCssInstalled = (callback: (count: number) => void) =>
  useEffect(() => InstallTrigger.debounce().effect(callback), [])

let frameId = -1
function installInBrowser() {
  cancelAnimationFrame(frameId)
  frameId = window.requestAnimationFrame(() => {
    installStyleSheet(CssRegister.pending, InstallTrigger.get())
    CssRegister.pending.rules = []
    CssRegister.pending.keyframes = []
    InstallTrigger.modify(c => c + 1)
  })
}

function installStyleSheet(sheet: Stylesheet, index: number) {
  const { rules, keyframes } = sheet

  const { server, skipped } = CssRegister.installed
  const pending = rules.length + keyframes.length
  const skipping = Math.min(pending, server - skipped)
  const installing = pending - skipping

  CssRegister.installed.skipped += skipping
  CssRegister.installed.client += installing

  const timer = `skipping ${skipping} and installing ${installing} style rule(s) [${index}]`
  console.time(timer)

  if (installing === 0) {
    console.timeEnd(timer)
    return
  }

  const css = printStylesheet(sheet).join('\n\n')

  const head = document.head || document.getElementsByTagName('head')[0]
  const styleTag = document.createElement('style')
  styleTag.type = 'text/css'
  head.appendChild(styleTag)

  styleTag.innerText = css
  window.localStorage.setItem(`stylesheet_${index}`, css)

  console.timeEnd(timer)
}

// ----------------------------------------------------------------------------
// Printing to CSS

function printStylesheet(sheet: Stylesheet): string[] {
  const { rules, keyframes } = sheet
  return printRules(rules).concat(printKeyframes(keyframes))
}

function printRules(sheet: Rule[]): string[] {
  return sheet.map(printRule)
}

function printRule(rule: Rule): string {
  const sel = rule.selector()
  const props = printProperties(rule.props)
  return `${sel} ${props}`
}

function printProperties(props: CSSProperties) {
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

function printProperty(key: string, value: string): string {
  return `  ${toSnakeCase(key)}: ${value};`
}

function toSnakeCase(input: string) {
  if (input[0] === '-') return input
  return input
    .replace(/[A-Z]/g, v => '-' + v.toLowerCase())
    .replace(/^[-]*/, '')
    .replace(/[-]*$/, '')
}

function printKeyframes(keyframes: Keyframe[]): string[] {
  return keyframes.map(({ name, frames }) => {
    const perFrame = Object.entries(frames).map(
      ([percentage, props]) => `${percentage}% ${printProperties(props)}`
    )
    return `@keyframes ${name} {\n${perFrame.join('\n')}\n}`
  })
}

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
