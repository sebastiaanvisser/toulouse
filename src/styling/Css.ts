import { CSSProperties, useEffect } from 'react'
import { pt } from '../lib/Geometry'
import { Var } from '../lib/Var'
import { Rgba } from './Rgba'

// --------------------------------------------------------------------------------

interface Collectable {
  id: number | undefined
  used: boolean
  scoped: boolean
  print(): string | undefined
}

export interface InstallLog {
  counter: number
  server: number
}

export interface CssRegister {
  config: { enableSSR: boolean }
  collected: Collectable[]
  log: InstallLog
}

export const CssRegister: CssRegister = {
  config: { enableSSR: true },
  collected: [],
  log: {
    counter: 0,
    server: 0
  }
}

// --------------------------------------------------------------------------------
// SETUP

function clientSetup() {
  const nextData = (window as any).__NEXT_DATA__
  const log = nextData?.props.log as InstallLog | undefined
  if (log) {
    const { server, counter } = log
    CssRegister.log = { counter: 0, server }
    console.log(`Using prerendered CSS: ${counter} class names, ${server} rules`)
  }
}

if (typeof window !== 'undefined') {
  ;(window as any).CssRegister = CssRegister
  clientSetup()
}

// --------------------------------------------------------------------------------

export interface EmptySelector {
  empty: {}
}

export interface ElementSelector {
  elem: string
}

export interface PrimSelector {
  prim: string
}

export interface SiblingSelector {
  sibling: Rule[]
}

export interface ClassSelector {
  className: string
}

export interface GeneratedSelector {
  prefix: string
}

export interface NotSelector {
  not: Rule
}

export interface OrSelector {
  or: Rule[]
}

export interface SelfSelector {
  self: Rule[]
}

export interface ChildSelector {
  child: Rule[]
}

export interface SubSelector {
  sub: Rule[]
}

export type Selector =
  | EmptySelector
  | PrimSelector
  | ElementSelector
  | ClassSelector
  | GeneratedSelector
  | NotSelector
  | OrSelector
  | SelfSelector
  | ChildSelector
  | SubSelector
  | SiblingSelector

type SelectorLike = Rule | Selector | string

export class Rule implements Collectable {
  props: CSSProperties = {}
  id: number | undefined

  constructor(readonly sel: Selector) {}

  explode(): Rule[] {
    const { sel } = this
    if ('empty' in sel) return [this]
    if ('elem' in sel) return [this]
    if ('prim' in sel) return [this]
    if ('className' in sel) return [this]
    if ('prefix' in sel) return [this]
    if ('not' in sel) return sel.not.explode().map(Rule.not)
    if ('or' in sel) return sel.or.flatMap(s => s.explode())
    if ('self' in sel) return cartesionN(...sel.self.map(s => s.explode())).map(Rule.self)
    if ('child' in sel)
      return cartesionN(...sel.child.map(s => s.explode())).map(Rule.child)
    if ('sub' in sel) return cartesionN(...sel.sub.map(s => s.explode())).map(Rule.sub)
    if ('sibling' in sel)
      return cartesionN(...sel.sibling.map(s => s.explode())).map(Rule.sibling)
    return sel
  }

  selector(): string | undefined {
    const exploded = this.explode()
    if (exploded.length === 0) return
    const normalized = exploded.length === 1 ? exploded[0] : Rule.or(exploded)
    return normalized.printSelector()
  }

  printSelector(): string {
    const { sel } = this
    if ('empty' in sel) return ''
    if ('prim' in sel) return sel.prim
    if ('elem' in sel) return sel.elem
    if ('className' in sel) return '.' + sel.className
    if ('prefix' in sel) return '.' + sel.prefix + '-' + (this?.id ?? '')
    if ('not' in sel) return `:not(${sel.not.printSelector()})`
    if ('or' in sel) return sel.or.map(s => s.printSelector()).join(',\n')
    if ('self' in sel) return sel.self.map(s => s.printSelector()).join('')
    if ('child' in sel) return sel.child.map(s => s.printSelector()).join(' > ')
    if ('sub' in sel) return sel.sub.map(s => s.printSelector()).join(' ')
    if ('sibling' in sel) return sel.sibling.map(s => s.printSelector()).join(' + ')
    return sel /* : never */
  }

  get used(): boolean {
    return this.scoped ? !this.unused : this.id !== undefined
  }

  private get unused(): boolean {
    const { sel } = this
    if (this.id !== undefined) return false

    if ('empty' in sel) return false
    if ('prim' in sel) return false
    if ('elem' in sel) return false
    if ('className' in sel) return false
    if ('prefix' in sel) return this.id === undefined
    if ('not' in sel) return sel.not.unused
    if ('or' in sel) return sel.or.some(s => s.unused)
    if ('self' in sel) return sel.self.some(s => s.unused)
    if ('child' in sel) return sel.child.some(s => s.unused)
    if ('sub' in sel) return sel.sub.some(s => s.unused)
    if ('sibling' in sel) return sel.sibling.some(s => s.unused)
    return sel /* : never */
  }

  get scoped(): boolean {
    const { sel } = this
    if ('empty' in sel) return false
    if ('prim' in sel) return false
    if ('elem' in sel) return false
    if ('className' in sel) true
    if ('prefix' in sel) true
    if ('not' in sel) return sel.not.scoped
    if ('or' in sel) return sel.or.every(s => s.scoped)
    if ('self' in sel) return sel.self.some(s => s.scoped)
    if ('child' in sel) return sel.child.some(s => s.scoped)
    if ('sub' in sel) return sel.sub.some(s => s.scoped)
    if ('sibling' in sel) return sel.sibling.some(s => s.scoped)
    return true
  }

  print(): string | undefined {
    const sel = this.selector()
    if (!sel) return
    const props = printProperties(this.props)
    if (!props) return
    return [sel, props].join(' ')
  }

  useClassName() {
    const id = this.use()
    return 'prefix' in this.sel ? `${this.sel.prefix}-${id}` : '?'
  }

  use() {
    return (this.id = this.id ?? CssRegister.log.counter++)
  }

  toString() {
    return this.useClassName()
  }

  style(props: CSSProperties): this {
    this.props = { ...this.props, ...props }
    collect(this)
    return this
  }

  global(prefix = 'global') {
    return this.self(Rule.prefix(prefix))
  }

  or(x: SelectorLike, ...xs: SelectorLike[]) {
    return Rule.or([this, x, ...xs])
  }

  self(x: SelectorLike) {
    return Rule.self([this, x])
  }

  child(x: SelectorLike) {
    return Rule.child([this, x])
  }

  get children() {
    return Rule.child([this, Rule.any])
  }

  deep(x: SelectorLike) {
    return Rule.sub([this, x])
  }

  get anyDeep() {
    return Rule.sub([this, Rule.any])
  }

  sibling(x: SelectorLike): Rule {
    return Rule.sibling([this, x])
  }

  get siblings() {
    return Rule.sibling([this, Rule.any])
  }

  // Shortcuts

  selfOrChild(x: SelectorLike) {
    return this.self(x).or(this.child(x))
  }

  selfOrSub(x: SelectorLike) {
    return this.self(x).or(this.deep(x))
  }

  get hover() {
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

  not(sel: SelectorLike): Rule {
    return this.self(Rule.not(sel))
  }

  get tail() {
    return this.not(Rule.empty.firstChild)
  }

  get init() {
    return this.not(Rule.empty.lastChild)
  }

  static toRule(x: SelectorLike): Rule {
    if (typeof x === 'string')
      return x.toLowerCase().match(/^[a-z]+$/)
        ? new Rule({ elem: x })
        : new Rule({ prim: x })
    if ('sel' in x) return x
    return new Rule(x)
  }

  static empty = new Rule({ empty: {} })
  static prim = (prim: string) => new Rule({ prim })
  static elem = (elem: string) => new Rule({ elem })
  static not = (x: SelectorLike) => new Rule({ not: Rule.toRule(x) })
  static prefix = (prefix: string) => new Rule({ prefix })
  static or = (xs: SelectorLike[]) => new Rule({ or: xs.map(Rule.toRule) })
  static self = (xs: SelectorLike[]) => new Rule({ self: xs.map(Rule.toRule) })
  static child = (xs: SelectorLike[]) => new Rule({ child: xs.map(Rule.toRule) })
  static sub = (xs: SelectorLike[]) => new Rule({ sub: xs.map(Rule.toRule) })
  static sibling = (xs: SelectorLike[]) => new Rule({ sibling: xs.map(Rule.toRule) })

  static any = Rule.elem('*')
  static hover = Rule.prim(':hover')
  static active = Rule.prim(':active')
  static firstChild = Rule.prim(':first-child')
  static lastChild = Rule.prim(':last-child')
  static focus = Rule.prim(':focus')
  static before = Rule.prim('::before')
  static after = Rule.prim('::after')
}

// ----------------------------------------------------------------------------

export const className = (prefix: string = 'c', props: CSSProperties = {}): Rule => {
  return Rule.prefix(prefix).style(props)
}

export const style = (props: CSSProperties): Rule => className('c', props)
export const rule = (...xs: SelectorLike[]) => Rule.or(xs)

// ----------------------------------------------------------------------------

type Frames = { [pct: number]: CSSProperties }

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
    this.id = this.id ?? CssRegister.log.counter++
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

// ----------------------------------------------------------------------------
// Collecting and installing

function collect(rule: Collectable) {
  CssRegister.collected.push(rule)
  if (typeof window !== 'undefined') installInBrowser()
}

// Server side rendering

export function serverSideRenderCss(): {
  global?: string
  scoped?: string
  log?: InstallLog
} {
  if (!CssRegister.config.enableSSR) return {}

  const { collected, log } = CssRegister

  const global = printStylesheet(collected.filter(r => !r.scoped && r.used))
  const scoped = printStylesheet(collected.filter(r => r.scoped && r.used))
  const unused = collected.length - global.length - scoped.length
  log.server = collected.length

  console.log(
    '[serverSideRenderCss]',
    `global=${global.length}`,
    `scoped=${scoped.length}`,
    `unused=${unused}`
  )

  // Clear all usage IDs to indicate we're about to start a new round of
  // collecting and using rules.
  collected.forEach(r => (r.id = undefined))

  return { scoped, global, log }
}

export const useGlobalStyle = (rule: Rule) => {
  rule.use()
}

export function useNextJsPageTransition() {
  const fixCSs = () => {
    const els = document.getElementsByTagName('style')
    for (let el of els as HTMLCollectionOf<HTMLStyleElement>) {
      const type =
        el.getAttribute('data-global') &&
        el.getAttribute('data-page') !== document.location.pathname.toString()
          ? 'disbaled-text/css'
          : 'text/css'
      el.setAttribute('type', type)
    }
  }
  useEffect(() => {
    fixCSs()
    return fixCSs
  }, [])
}

const InstallTrigger = new Var(0)

export const useCssInstalled = (callback: (count: number) => void) =>
  useEffect(() => InstallTrigger.debounce().effect(callback), [])

let frameId = -1
function installInBrowser() {
  cancelAnimationFrame(frameId)
  frameId = window.requestAnimationFrame(installStyleSheet)
}

function installStyleSheet() {
  const { collected } = CssRegister
  const index = InstallTrigger.get()

  const used = collected.filter(r => r.used)
  const unused = collected.filter(r => !r.used)
  const scoped = used.filter(r => r.scoped)
  const global = used.filter(r => !r.scoped)

  const timer = `installing ${used.length} used rule(s) and leaving ${unused.length} rule(s) untouched [${index}]`
  console.time(timer)

  const install = (rules: Collectable[], global: boolean) => {
    if (rules.length === 0) return
    const css = printStylesheet(rules)
    const head = document.head || document.getElementsByTagName('head')[0]
    const styleTag = document.createElement('style')
    styleTag.type = 'text/css'
    styleTag.setAttribute('data-page', document.location.pathname.toString())
    if (!global) styleTag.setAttribute('data-scoped', 'true')
    if (global) styleTag.setAttribute('data-global', 'true')
    styleTag.appendChild(document.createTextNode(css))
    head.appendChild(styleTag)
  }

  install(global, true)
  install(scoped, false)

  CssRegister.collected = unused

  console.timeEnd(timer)

  InstallTrigger.modify(c => c + 1)
}

// ----------------------------------------------------------------------------
// Printing to CSS

function printStylesheet(sheet: Collectable[]): string {
  return sheet
    .flatMap(r => {
      const x = r.print()
      return x ? [x] : []
    })
    .join('\n\n')
}

function printProperties(props: CSSProperties) {
  let out = []
  for (let key in props) {
    out.push(printProperty(key, (props as any)[key]))
  }
  return out.length > 0 ? `{\n${out.join('\n')}\n}` : undefined
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

const cartesionN = <A>(...xs: A[][]): A[][] =>
  xs.length === 1
    ? xs[0].map(x => [x])
    : cartesion((x, y) => [x].concat(y), xs[0], cartesionN(...xs.slice(1)))

const cartesion = <A, B, C>(f: (x: A, y: B) => C, xs: A[], ys: B[]): C[] =>
  xs.flatMap(x => ys.map(y => f(x, y)))

// ----------------------------------------------------------------------------
// Utils

export const px = (p: number) => `${p}px`
export const pct = (p: number) => `${p}%`
export const commas = (...xs: string[]) => xs.join()

export type Classy1 = string | string[] | boolean | Rule | undefined
export type Classy = string | Classy1[] | boolean | Rule | undefined

export const cx = (...classes: Classy[]): string =>
  classes
    .flatMap(c => {
      if (c === undefined) return []
      if (typeof c === 'boolean') return []
      if (typeof c === 'string') return c.length > 0 ? [c] : []
      if (c instanceof Array) return [cx(...c)]
      if (c instanceof Rule) return [c.useClassName()]
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
