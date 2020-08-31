import { List } from 'immutable'
import isEqual from 'lodash.isequal'
import * as React from 'react'
import { Fragment, ReactNode, useEffect, useState } from 'react'
import { Lens } from './Edit'
import { Iso } from './Iso'

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
export type Uninstaller = () => void
export type Installer = () => Uninstaller

export interface Value<A> {
  get(): A
  effect(cb: Listener<A>, run?: boolean): Uninstaller
  listenDown(cb: Listener<A>): Uninstaller
  map<B>(f: (a: A) => B): Value<B>
  lookup<B>(this: Value<{ [key: string]: B }>, key: string): Value<B | undefined>
  batch(): Value<A>
  at<B>(this: Value<List<B>>, ix: number): Value<B>
  debounce(t: number): Value<A>
  throttle(t: number): Value<A>
  total<B>(this: Value<B | undefined>): Value<B> | undefined
  or<B>(this: Value<B | undefined>, def: B): Value<B>
}

// ----------------------------------------------------------------------------

export class Var<A> implements Value<A> {
  busy = 0
  upstreams: (Listener<A> | undefined)[] = []
  downstreams: (Listener<A> | undefined)[] = []
  pending: Installer[] = []
  installed: { uninstall: Uninstaller; install: Installer }[] = []
  effects: (Listener<A> | undefined)[] = []

  constructor(private v: A, private eq = isEqual) {}

  cleanup() {
    this.installed.forEach(i => i.uninstall())
  }

  // ------------------------------------------
  // Installing side effects and connecting to other variables.

  private static trim<A>(xs: A[]) {
    let i = xs.length - 1
    while (i >= 0 && xs[i] === undefined) i--
    xs.length = i + 1
  }

  effect(cb: Listener<A>, run = false): Uninstaller {
    this.effects.push(cb)
    if (W) W.effects++
    const ix = this.effects.length - 1
    this.install()
    if (run === true) cb(this.get(), undefined)
    return () => {
      delete this.effects[ix]
      if (W) W.effects--
      Var.trim(this.effects)
      this.uninstall()
    }
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
    this.install()
    return () => {
      delete this.downstreams[ix]
      if (W) W.downstream--
      Var.trim(this.downstreams)
      this.uninstall()
    }
  }

  listenTo<B>(b: Var<B> | Value<B>, listener: (b: B, o?: B) => void, autorun = false) {
    this.pending.push(() => {
      if (autorun) listener(b.get(), undefined)
      return b.listenDown(listener)
    })
    this.install()
  }

  private install() {
    if (this.effects.length === 0 && this.downstreams.length === 0) return
    this.pending.forEach(install => {
      const uninstall = install()
      this.installed.push({ uninstall, install })
    })
    this.pending = []
  }

  private uninstall() {
    if (this.effects.length > 0 || this.downstreams.length > 0) return
    this.installed.forEach(i => {
      i.uninstall()
      this.pending.push(i.install)
    })
    this.installed = []
  }

  private propagate(v: A, o: A) {
    const all = append(
      this.upstreams,
      this.downstreams,
      this.effects
      //
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

  modify(f: (a: A) => A) {
    this.set(f(this.get()))
  }

  censor(f: (a: A, old: A) => A): Var<A> {
    return this.zoom(
      a => a,
      (v, old) => f(v, old)
    )
  }

  // ------------------------------------------

  val(): Value<A> {
    return this.map(a => a)
  }

  map<B>(f: (a: A, o?: A) => B): Value<B> {
    const b = new Var(f(this.get()))
    b.listenTo<A>(this, (v, o) => b.set(f(v, o)))
    b.get = () => f(this.get())
    return b
  }

  zoom<B>(f: (a: A) => B, g: (b: B, old: A) => A): Var<B> {
    const b = new Var(f(this.get()))
    b.listenTo<A>(this, v => b.set(f(v)))
    b.get = () => f(this.get())
    b.listenUp((b: B) => this.modify(a => g(b, a)))
    return b
  }

  edit<T>(f: Lens<A, T>): Var<T> {
    return this.zoom(
      o => f(o).get(),
      (v, o) => f(o).set(v)
    )
  }

  iso<B>({ fw, bw }: Iso<A, B>): Var<B> {
    return this.zoom(fw, bw)
  }

  // ------------------------------------------

  total<B>(this: Var<B | undefined>): Var<B> | undefined {
    const v = this.get()
    return is(v)
      ? this.zoom(
          a => (is(a) ? a : v),
          a => a
        )
      : undefined
  }

  assume<B>(this: Var<B | undefined>): Var<B> {
    return this as Var<B>
  }

  or<B>(this: Var<B | undefined>, def: B): Var<B> {
    return this.zoom(
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
    return this.zoom<A | undefined>(
      a => a,
      (v, o) => (is(v) ? v : o)
    )
  }

  prop<P extends keyof A>(p: P): Var<A[P]> {
    return this.zoom(
      a => a[p],
      (b, a) => ({ ...a, [p]: b })
    )
  }

  lookup<B>(this: Var<{ [key: string]: B }>, key: string): Var<B | undefined> {
    return this.zoom<B | undefined>(
      a => a[key],
      (b, a) => update(a, key, b)
    )
  }

  find<B>(this: Var<List<B>>, p: (b: B) => boolean): Var<B | undefined> {
    return this.zoom(
      a => a.find(p),
      (b, a) => (b ? a.map(c => (p(c) ? b : c)) : a.filter(c => !p(c)))
    )
  }

  at<B>(this: Var<List<B>>, ix: number, fallback?: B): Var<B> {
    return this.zoom<B>(
      xs => xs.get(ix) ?? (fallback as B),
      (x, xs) => xs.set(ix, x)
    )
  }

  findA<B>(this: Var<B[]>, p: (b: B) => boolean): Var<B | undefined> {
    return this.zoom(
      a => a.find(p),
      (b, a) => (b ? a.map(c => (p(c) ? b : c)) : a.filter(c => !p(c)))
    )
  }

  atA<B>(this: Var<B[]>, ix: number): Var<B> {
    return this.zoom<B>(
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
    return this.zoom(
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
      out[key].listenTo(this, v => out[key].set(v[key]))
      out[key].listenUp(v => this.prop(key).set(v))
    }

    return out
  }

  unlist<T>(this: Var<List<T>>): List<Var<T>> {
    return this.get().map((_, ix) => this.at(ix))
  }

  localStorage(key: string, rehydrate: (a: A) => A = a => a): Uninstaller {
    try {
      const val = window.localStorage.getItem(key)
      if (val !== null) {
        const parsed = JSON.parse(val)
        this.set(rehydrate(parsed))
      }
    } catch (e) {}
    return this.effect(v => window.localStorage.setItem(key, JSON.stringify(v)))
  }

  batch(): Value<A> {
    var o = new Var(this.get())
    let x = -1
    o.listenTo(this, v => {
      window.cancelAnimationFrame(x)
      x = window.requestAnimationFrame(() => o.set(v))
    })
    return o
  }

  debounce(t: number = 0): Value<A> {
    var o = new Var(this.get())
    let x = -1
    o.listenTo(
      this,
      v => {
        window.clearTimeout(x)
        x = window.setTimeout(() => o.set(v), t)
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

    o.listenTo(this, v => {
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
      out.listenTo(obj[p], () => out.set(snapshot()))
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

  static list<A>(xs: Var<A>[], bidirectional = false): Var<A[]> {
    const snapshot = () => xs.map(o => o.get())

    const out = new Var(snapshot())
    out.get = snapshot

    xs.forEach(x => out.listenTo(x, () => out.set(snapshot())))

    if (bidirectional)
      out.listenUp(ts =>
        xs.forEach((x, ix) => {
          if (x instanceof Var) x.set(ts[ix])
        })
      )

    return out
  }

  // ----------------------------------------------------------------------------

  static lift2 = <A, B, Z>(
    a: Value<A>,
    b: Value<B>,
    f: (a: A, b: B, oa?: A, ob?: B) => Z
  ): Value<Z> => Var.pack({ a, b }).map(({ a, b }, o) => f(a, b, o && o.a, o && o.b))

  static lift3 = <A, B, C, Z>(
    a: Var<A>,
    b: Var<B>,
    c: Var<C>,
    f: (a: A, b: B, c: C) => Z
  ): Value<Z> => Var.pack({ a, b, c }).map(({ a, b, c }) => f(a, b, c))

  static lift4 = <A, B, C, D, Z>(
    a: Var<A>,
    b: Var<B>,
    c: Var<C>,
    d: Var<D>,
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
  const [, set] = useState<A>(v.get())
  useEffect(() => v.effect(set, true), [])
  return v.get()
}

export function useVar<A>(v: A): Var<A> {
  const ref = React.useRef<Var<A>>()
  if (!ref.current) {
    ref.current = new Var(v)
  }
  return ref.current
}

export function useStoredVar<A>(
  key: string,
  v: A,
  rehydrate: (a: A) => A = a => a
): Var<A> {
  const w = useVar(v)
  useEffect(() => w.localStorage(key, rehydrate), [])
  return w
}

export function useControlledVar<A>(
  v: Var<A> | Value<A> | undefined,
  def: A
): [A, (a: A) => void] {
  const [get, set_] = useState(v ? v.get() : def)

  useEffect(() => {
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
  children?: (a: A) => ReactNode | undefined
}

export function Use<A>(props: UseProps<A>) {
  const { value, children } = props
  const v = useValue(value)
  return React.createElement(Fragment, { children: children ? children(v) : v })
}
