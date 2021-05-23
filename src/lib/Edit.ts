import { List } from 'immutable'
import { Iso } from './Iso'
import { Lens } from './Lens'

export class Edit<O, I> {
  constructor(
    readonly get: I,
    readonly set: (i: I) => O //
  ) {}

  setting(i: I): Edit<O, O> {
    return Edit.Id(this.set(i))
  }

  modify(f: (v: I) => I): O {
    return this.set(f(this.get))
  }

  modifying(f: (v: I) => I): Edit<O, O> {
    return Edit.Id(this.modify(f))
  }

  modifyWith<A>(f: (v: I) => [I, A]): [O, A] {
    const [i, a] = f(this.get)
    return [this.set(i), a]
  }

  iso<K>(iso: Iso<I, K>): Edit<O, K> {
    return editor<O, K>(iso.fw(this.get), k => this.set(iso.bw(k)))
  }

  zoom<K>(f: Lens<I, K>): Edit<O, K> {
    return editor<O, K>(f.get(this.get), k => this.set(f.set(k)(this.get)))
  }

  zoom1<K>(f: (i: I) => Edit<I, K>): Edit<O, K> {
    return this.zoom(new Lens(f))
  }

  prop<P extends keyof I>(p: P): Edit<O, I[P]> {
    return editor<O, I[P]>(this.get[p], ip =>
      this.modify(i => {
        const o = { ...i, [p]: ip }
        return 'copy' in i ? (i as any).copy(o) : o
      })
    )
  }

  at<E>(this: Edit<O, List<E>>, ix: number): Edit<O, E | undefined> {
    return editor<O, E | undefined>(this.get.get(ix), e =>
      this.modify(i => (e ? i.set(ix, e) : i))
    )
  }

  first<E>(this: Edit<O, List<E>>): Edit<O, E | undefined> {
    return this.at(0)
  }

  last<E>(this: Edit<O, List<E>>): Edit<O, E | undefined> {
    return this.at(this.get.size - 1)
  }

  find<B>(this: Edit<O, List<B>>, pred: (b: B) => boolean): Edit<O, B> {
    return editor<O, B>(this.get.find(pred) as B, b =>
      this.modify(i => i.map(c => (pred(c) ? b : c)))
    )
  }

  pop<B>(this: Edit<O, List<B>>): O {
    return this.modify(xs => xs.pop())
  }

  push<B>(this: Edit<O, List<B>>, x: B): O {
    return this.modify(xs => xs.push(x))
  }

  assume<X>(this: Edit<O, X | undefined>): Edit<O, X> {
    return this as Edit<O, X>
  }

  or<X>(this: Edit<O, X | undefined>, x: X): Edit<O, X> {
    return editor<O, X>(this.get ?? x, this.set)
  }

  toggle(this: Edit<O, boolean>): O {
    return this.modify(b => !b)
  }

  mul(this: Edit<O, number>, v: number) {
    return this.modify(c => c * v)
  }

  add(this: Edit<O, number>, v: number) {
    return this.modify(c => c + v)
  }

  static packL = <O, U>(
    obj: { [P in keyof U]: (f: Edit<O, O>) => Edit<O, U[P]> }
  ): Lens<O, U> =>
    new Lens(o => {
      const id = Edit.Id(o)
      const out = {} as U
      for (let p in obj) out[p] = obj[p](id).get
      return editor<O, U>(out, u => {
        for (let p in obj) o = obj[p](Edit.Id(o)).set(u[p])
        return o
      })
    })

  static Id = <O>(o: O): Edit<O, O> => editor(o, o => o)

  static prop = <O, P extends keyof O>(o: O, p: P): Edit<O, O[P]> => edit(o).prop(p)
}

export const edit = <O extends P, P = O>(o: O): Edit<O, P> => Edit.Id(o) as any

export const editor = <O, I>(get: I, set: (i: I) => O) => new Edit(get, set)

// ----------------------------------------------------------------------------

export class Modify<O, I> {
  constructor(
    readonly modify: (f: (v: I) => I) => O //
  ) {}

  set(v: I): O {
    return this.modify(() => v)
  }

  prop<P extends keyof I>(p: P): Modify<O, I[P]> {
    return new Modify<O, I[P]>(f => this.modify(i => ({ ...i, [p]: f(i[p]) })))
  }

  static Id = <O>(o: O): Modify<O, O> => new Modify(f => f(o))
}
