import { List } from 'immutable'
import isEqual from 'lodash.isequal'
import * as React from 'react'
import { Edit } from './Edit'
import { Iso } from './Iso'
import { Lens } from './Lens'
import { Revive } from './Revive'

// ----------------------------------------------------------------------------

export const W =
  typeof window !== 'undefined'
    ? ((window as any).__W = {
        effects: 0,
        upstream: 0,
        downstream: 0,
        debug: () => {
          if (W)
            console.log(
              'e',
              W.effects,
              W.effects === 0 ? '[good]' : '[bad]',
              'd',
              W.downstream,
              W.downstream === 0 ? '[good]' : '[bad]',
              'u',
              W.upstream,
              '[good]'
            )
        }
      })
    : undefined

// ----------------------------------------------------------------------------

export type Listener<A> = (a: A, o?: A) => void
export type Effect<A> = (a: A, o?: A) => void | Uninstaller
export type Uninstaller = () => void
export type Installer = () => Uninstaller

export interface Value<A> {
  get(): A
  effect(cb: Effect<A>, run?: boolean): Uninstaller
  listenDown(cb: Listener<A>): Uninstaller
  map<B>(f: (a: A) => B): Value<B>
  bind<B>(f: (a: A, o?: A) => Value<B>): Value<B>
  prop<B extends Object, P extends keyof B>(this: Value<B>, p: P): Value<B[P]>
  lookup<B>(this: Value<{ [key: string]: B }>, key: string): Value<B | undefined>
  find<B>(this: Value<List<B>>, p: (b: B) => boolean): Value<B | undefined>
  at<B>(this: Value<List<B>>, ix: number): Value<B>
  batch(): Value<A>
  queue(): Value<A>
  debounce(t: number): Value<A>
  throttle(t: number): Value<A>
  total<B>(this: Value<B | undefined>): Value<B> | undefined
  or<B>(this: Value<B | undefined>, def: B): Value<B>
  unpack<T>(this: Value<T>): { [P in keyof T]: Value<T[P]> }
  unlist<T>(this: Value<List<T>>): List<Value<T>>
}

// ----------------------------------------------------------------------------

export class Var<A> implements Value<A> {
  busy = 0
  upstreams: Listener<A>[] = []
  downstreams: Listener<A>[] = []
  pending: Installer[] = []
  installed: { uninstall: Uninstaller; install: Installer }[] = []
  effects: Listener<A>[] = []

  constructor(private v: A, public eq = isEqual) {}

  dispose() {
    this.installed.forEach(i => i.uninstall())
  }

  // ------------------------------------------
  // Installing side effects and connecting to other variables.

  private static trim<A>(xs: A[]) {
    let i = xs.length - 1
    while (i >= 0 && xs[i] === undefined) i--
    xs.length = i + 1
  }

  effect(cb: Effect<A>, run = false): Uninstaller {
    let un: void | Uninstaller

    // Wrapped handler in the case of uninstallers
    const wrapped = (a: A, o?: A): void => {
      if (un) un()
      un = cb(a, o)
    }

    this.effects.push(wrapped)
    if (W) W.effects++
    const ix = this.effects.length - 1
    this.maybeInstall()

    // Possible initial run, when requested
    if (run === true) wrapped(this.get(), undefined)

    // Uninstaller
    return () => {
      if (un) un()
      delete this.effects[ix]
      if (W) W.effects--
      Var.trim(this.effects)
      this.maybeUninstall()
    }
  }

  use(): Uninstaller {
    return this.effect(() => {})
  }

  listenUp(cb: Listener<A>): Uninstaller {
    this.upstreams.push(cb)
    if (W) W.upstream++
    const ix = this.upstreams.length - 1
    return () => {
      delete this.upstreams[ix]
      if (W) W.upstream--
      Var.trim(this.upstreams)
    }
  }

  listenDown(cb: Listener<A>): Uninstaller {
    this.downstreams.push(cb)
    if (W) W.downstream++
    const ix = this.downstreams.length - 1
    this.maybeInstall()
    return () => {
      delete this.downstreams[ix]
      if (W) W.downstream--
      Var.trim(this.downstreams)
      this.maybeUninstall()
    }
  }

  listenTo(subscribe: () => Uninstaller): Uninstaller {
    this.pending.push(subscribe)
    const ix = this.pending.length - 1
    this.maybeInstall()
    return () => {
      delete this.pending[ix]
      Var.trim(this.pending)
    }
  }

  listenToVar<B>(
    b: Var<B> | Value<B>,
    listener: (b: B, o?: B) => void,
    autorun = false
  ): Uninstaller {
    return this.listenTo(() => {
      if (autorun) listener(b.get(), undefined)
      return b.listenDown(listener)
    })
  }

  private maybeInstall() {
    if (this.effects.length === 0 && this.downstreams.length === 0) return
    const pending = this.pending
    this.pending = []
    pending.forEach(install => {
      const uninstall = install()
      this.installed.push({ uninstall, install })
    })
  }

  private maybeUninstall() {
    if (this.effects.length > 0 || this.downstreams.length > 0) return
    const installed = this.installed
    this.installed = []
    installed.forEach(i => {
      i.uninstall()
      this.pending.push(i.install)
    })
  }

  private propagate(v: A, o: A) {
    const all = append(
      this.upstreams,
      this.downstreams,
      this.effects //
    )
    defined(all).forEach(l => l(v, o))
  }

  // ------------------------------------------
  // Primitive get/set/modify

  get() {
    return this.v
  }

  set = (v: A) => {
    if (this.busy > 0) return
    if (this.eq(this.v, v)) return
    this.busy++
    const o = this.v
    this.v = v
    this.propagate(v, o)
    this.busy--
  }

  setting(v: A) {
    this.set(v)
    return this
  }

  modify(f: (a: A) => A) {
    this.set(f(this.get()))
  }

  modifying(f: (a: A) => A) {
    this.modify(f)
    return this
  }

  censor(f: (a: A, old: A) => A): Var<A> {
    return this.extend(
      a => a,
      (v, old) => f(v, old)
    )
  }

  // --------------------------------------------

  map<B>(f: (a: A, o?: A) => B): Value<B> {
    const b = new Var(f(this.get()))
    b.listenToVar<A>(this, (v, o) => b.set(f(v, o)))
    b.get = () => f(this.get())
    return b
  }

  extend<B>(f: (a: A) => B, g: (b: B, old: A) => A): Var<B> {
    const b = new Var(f(this.get()))
    b.listenToVar<A>(this, v => b.set(f(v)))
    b.get = () => f(this.get())
    b.listenUp((b: B) => this.modify(a => g(b, a)))
    return b
  }

  bind<B>(f: (a: A, o?: A) => Value<B>): Value<B> {
    let inner: Value<B> = f(this.get())
    let un = () => {}
    const b = new Var(inner.get())
    b.listenToVar<A>(
      this,
      (v, o) => {
        un()
        inner = f(v, o)
        un = b.listenToVar(inner, w => b.set(w))
      },
      true
    )
    b.get = () => inner.get()
    return b
  }

  zoom<T>(f: Lens<A, T>): Var<T> {
    return this.extend(
      o => f.get(o),
      (v, o) => f.set(v)(o)
    )
  }

  zoom1<T>(f: (a: A) => Edit<A, T>): Var<T> {
    return this.extend(
      o => f(o).get,
      (v, o) => f(o).set(v)
    )
  }

  iso<B>({ fw, bw }: Iso<A, B>): Var<B> {
    return this.extend(fw, bw)
  }

  // --------------------------------------------

  total<B>(this: Var<B | undefined>): Var<B> | undefined {
    const v = this.get()
    return is(v)
      ? this.extend(
          a => (is(a) ? a : v),
          a => a
        )
      : undefined
  }

  assume<B>(this: Var<B | undefined>): Var<B> {
    return this as Var<B>
  }

  or<B>(this: Var<B | undefined>, def: B): Var<B> {
    return this.extend(
      a => (is(a) ? a : def),
      a => a
    )
  }

  mapMaybe<B, C>(
    this: Value<B | undefined>,
    f: (a: B) => C | undefined
  ): Value<C | undefined> {
    return this.map(a => (is(a) ? f(a) : undefined))
  }

  partial(): Var<A | undefined> {
    return this.extend<A | undefined>(
      a => a,
      (v, o) => (is(v) ? v : o)
    )
  }

  cast<B extends A>(f: (a: A) => a is B): this is Var<B> {
    return f(this.get())
  }

  prop<B extends Object, P extends keyof B>(this: Var<B>, p: P): Var<B[P]> {
    return this.extend(
      a => a[p],
      (b, a) => {
        const o = { ...a, [p]: b }
        return 'copy' in a ? (a as any).copy(o) : o
      }
    )
  }

  by<B>(this: Var<Record<string, B>>, p: string): Var<B | undefined> {
    return this.extend(
      a => a[p] as B | undefined,
      (b, a) => {
        const { [p]: _, ...rest } = a
        return b === undefined ? rest : { ...rest, [p]: b }
      }
    )
  }

  lookup<B>(this: Var<{ [key: string]: B }>, key: string): Var<B | undefined> {
    return this.extend<B | undefined>(
      a => a[key],
      (b, a) => update(a, key, b)
    )
  }

  find<B>(this: Var<List<B>>, p: (b: B) => boolean): Var<B | undefined> {
    return this.extend(
      a => a.find(p),
      (b, a) => (b ? a.map(c => (p(c) ? b : c)) : a.filter(c => !p(c)))
    )
  }

  at<B>(this: Var<List<B>>, ix: number, fallback?: B): Var<B> {
    return this.extend<B>(
      xs => xs.get(ix) ?? (fallback as B),
      (x, xs) => xs.set(ix, x)
    )
  }

  first<B>(this: Var<List<B>>): Var<B | undefined> {
    return this.extend(
      xs => xs.first(),
      (x, xs) => (x !== undefined ? xs.shift().unshift(x) : xs)
    )
  }

  last<B>(this: Var<List<B>>): Var<B | undefined> {
    return this.extend(
      xs => xs.last(),
      (x, xs) => (x !== undefined ? xs.pop().push(x) : xs)
    )
  }

  findA<B>(this: Var<B[]>, p: (b: B) => boolean): Var<B | undefined> {
    return this.extend(
      a => a.find(p),
      (b, a) => (b ? a.map(c => (p(c) ? b : c)) : a.filter(c => !p(c)))
    )
  }

  atA<B>(this: Var<B[]>, ix: number): Var<B> {
    return this.extend<B>(
      xs => xs[ix],
      (x, xs) => [...xs.slice(0, ix), x, ...xs.slice(ix + 1)]
    )
  }

  push<B>(this: Var<List<B>>, x: B): void {
    this.modify(xs => xs.push(x))
  }

  pop<B>(this: Var<List<B>>): void {
    this.modify(xs => xs.pop())
  }

  toggle(this: Var<boolean>): void {
    this.modify(v => !v)
  }

  negation(this: Var<boolean>): Var<boolean> {
    return this.extend(
      b => !b,
      b => !b
    )
  }

  on(this: Var<boolean>): void {
    this.set(true)
  }

  off(this: Var<boolean>): void {
    this.set(false)
  }

  equals(a: A, eq = isEqual): Value<boolean> {
    return this.map(b => eq(a, b))
  }

  unpack<T>(this: Var<T>): { [P in keyof T]: Var<T[P]> } {
    const out = {} as { [P in keyof T]: Var<T[P]> }

    const t = this.get()
    for (let key in t) {
      out[key] = new Var(t[key])
      out[key].listenToVar(this, v => out[key].set(v[key]))
      out[key].listenUp(v => this.prop(key).set(v))
    }

    return out
  }

  unlist<T>(this: Var<List<T>>): List<Var<T>> {
    return this.get().map((_, ix) => this.at(ix))
  }

  localStorage(key: string, revive: Revive<A>): Uninstaller {
    try {
      const val = window.localStorage.getItem(key)
      if (val !== null) {
        const parsed = JSON.parse(val)
        this.set(revive(parsed))
      }
    } catch (e) {}
    return this.effect(v => window.localStorage.setItem(key, JSON.stringify(v)))
  }

  batch(): Value<A> {
    var o = new Var(this.get())
    let x = -1
    o.listenToVar(this, v => {
      window.cancelAnimationFrame(x)
      x = window.requestAnimationFrame(() => o.set(v))
    })
    return o
  }

  queue(): Value<A> {
    var o = new Var(this.get())
    let queued = false
    o.listenToVar(this, v => {
      if (!queued) {
        queued = true
        window.queueMicrotask(() => {
          o.set(v)
          queued = false
        })
      }
    })
    return o
  }

  debounce(t: number = 0): Value<A> {
    var o = new Var(this.get())
    let x = -1
    o.listenToVar(
      this,
      v => {
        window.clearTimeout(x)
        x = window.setTimeout(() => o.set(v), t)
      },
      true // run on install
    )
    return o
  }

  delay(): Value<A> {
    var o = new Var(this.get())
    let bucket = () => {}
    o.listenToVar(
      this,
      v => {
        bucket = () => o.set(v)
        window.queueMicrotask(() => {
          bucket()
          bucket = () => {}
        })
      },
      true // run on install
    )
    return o
  }

  throttle(t: number): Value<A> {
    var o = new Var(this.get())
    let x = -1
    let wait = false
    let pending = false
    let last: A

    const set = (v: A) => {
      o.set(v)
      wait = true
      pending = false
      window.clearTimeout(x)
      x = window.setTimeout(() => {
        if (pending) set(last)
        else {
          wait = false
          pending = false
        }
      }, t)
    }

    o.listenToVar(this, v => {
      if (wait) {
        last = v
        pending = true
      } else set(v)
    })
    return o
  }

  static pack<T>(
    obj: { [P in keyof T]: Var<T[P]> | Value<T[P]> },
    bidirectional = false
  ): Var<T> {
    function snapshot() {
      const res: T = {} as T
      for (var p in obj) res[p] = obj[p].get()
      return res
    }

    const out = new Var(snapshot())
    out.get = snapshot

    for (var p in obj) {
      out.listenToVar(obj[p], () => out.set(snapshot()))
    }

    if (bidirectional)
      out.listenUp(t => {
        for (var p in t) {
          const v = obj[p]
          if (v instanceof Var) v.set(t[p])
        }
      })

    return out
  }

  static list<A>(xs: List<Var<A>>, bidirectional = false): Var<List<A>> {
    const snapshot = () => xs.map(o => o.get())

    const out = new Var(snapshot())
    out.get = snapshot

    xs.forEach(x => out.listenToVar(x, () => out.set(snapshot())))

    if (bidirectional)
      out.listenUp(ts =>
        xs.forEach((x, ix) => {
          if (x instanceof Var) x.set(ts.get(ix) as A)
        })
      )

    return out
  }

  static partial<A>(v?: A) {
    return new Var<A | undefined>(v)
  }

  // ----------------------------------------------------------------------------

  static lift2 = <A, B, Z>(
    a: Value<A>,
    b: Value<B>,
    f: (a: A, b: B, oa?: A, ob?: B) => Z
  ): Value<Z> => Var.pack({ a, b }).map(({ a, b }, o) => f(a, b, o && o.a, o && o.b))

  static lift3 = <A, B, C, Z>(
    a: Value<A>,
    b: Value<B>,
    c: Value<C>,
    f: (a: A, b: B, c: C) => Z
  ): Value<Z> => Var.pack({ a, b, c }).map(({ a, b, c }) => f(a, b, c))

  static lift4 = <A, B, C, D, Z>(
    a: Value<A>,
    b: Value<B>,
    c: Value<C>,
    d: Value<D>,
    f: (a: A, b: B, c: C, d: D) => Z
  ): Value<Z> => Var.pack({ a, b, c, d }).map(({ a, b, c, d }) => f(a, b, c, d))
}

// ----------------------------------------------------------------------------

const is = <A>(v: A | undefined | null): v is A => v !== undefined && v !== null

const defined = <A>(xs: (A | undefined)[]): A[] => xs.filter(is)

const append = <A>(...xs: A[][]) => ([] as A[]).concat(...xs)

function omit<A>(map: { [k: string]: A }, k: string): { [k: string]: A } {
  const { [k]: _, ...rest } = map
  return rest
}

const update = <A>(
  map: { [k: string]: A },
  k: string,
  v: A | undefined
): { [k: string]: A } => (v === undefined ? omit(map, k) : { ...map, [k]: v })

// ----------------------------------------------------------------------------
// React hooks

export function useValue<A>(v: Value<A>): A {
  const [, set] = React.useState<A>(v.get())
  React.useEffect(() => v.effect(set, true), [v])
  return v.get()
}

export function useMaybeValue<A>(v: Value<A> | undefined): A | undefined {
  const [, set] = React.useState<A | undefined>(v?.get())
  React.useEffect(() => v?.effect(set, true), [v])
  return v?.get()
}

export function useVar<A>(v: A, eq: (a: A, b: A) => boolean = isEqual): Var<A> {
  const ref = React.useRef<Var<A>>()
  if (!ref.current) {
    ref.current = new Var(v, eq)
  }
  return ref.current
}

export function useVar1<A>(v: A, eq: (a: A, b: A) => boolean = isEqual): [Var<A>, A] {
  const ref = useVar(v, eq)
  const snapshot = useValue(ref)
  return [ref, snapshot]
}

export function useStoredVar<A>(key: string, v: A, revive: (a: A) => A = a => a): Var<A> {
  const w = useVar(v)
  React.useEffect(() => w.localStorage(key, revive), [])
  return w
}

export function useControlledVar<A>(
  v: Var<A> | Value<A> | undefined,
  def: A
): [A, (a: A) => void] {
  const [get, set_] = React.useState(v ? v.get() : def)

  React.useEffect(() => {
    if (v) return v.effect(set_, true)
  }, [v])

  const set = (a: A) => {
    if (v instanceof Var) v.set(a)
    set_(a)
  }

  return [get, set]
}

// ----------------------------------------------------------------------------

export interface UseProps<A> {
  value: Var<A> | Value<A>
  children?: (a: A) => React.ReactNode | undefined
}

export interface UseMaybeProps<A> {
  maybe: Var<A | undefined> | Value<A | undefined>
  children?: (a: A) => React.ReactNode | undefined
}

export function Use<A>(props: UseProps<A> | UseMaybeProps<A>) {
  const { children } = props

  if ('value' in props) {
    const v = useValue(props.value)
    return React.createElement(React.Fragment, { children: children ? children(v) : v })
  } else {
    const v = useValue(props.maybe)
    return React.createElement(React.Fragment, {
      children: v ? (children ? children(v) : v) : undefined
    })
  }
}
