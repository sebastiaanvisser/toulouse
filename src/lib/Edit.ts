import { List } from 'immutable'
import { Iso } from './Iso'
import { Lens } from './Lens'

export class Edit<O, I> {
  constructor(
    readonly get: I,
    readonly set: (i: I) => O //
  ) {}

  // Getting and modifying

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

  // Zooming in

  iso<A>(iso: Iso<I, A>): Edit<O, A> {
    return new Edit<O, A>(iso.fw(this.get), k => this.set(iso.bw(k)))
  }

  zoom<A>(f: Lens<I, A>): Edit<O, A> {
    return new Edit<O, A>(f.get(this.get), k => this.set(f.set(k)(this.get)))
  }

  zoom1<A>(f: (i: I) => Edit<I, A>): Edit<O, A> {
    return this.zoom(new Lens(f))
  }

  // Object related utilities

  prop<P extends keyof I>(p: P): Edit<O, I[P]> {
    return new Edit<O, I[P]>(this.get[p], ip =>
      this.modify(i => {
        if (i[p] === ip) return i // when values are equal, don't update
        const o = { ...i, [p]: ip }
        return 'copy' in i ? (i as any).copy(o) : o
      })
    )
  }

  // Immutable list related utilities

  at<A>(this: Edit<O, List<A>>, ix: number): Edit<O, A | undefined> {
    return new Edit<O, A | undefined>(this.get.get(ix), e =>
      this.modify(i => (e ? i.set(ix, e) : i))
    )
  }

  first<A>(this: Edit<O, List<A>>): Edit<O, A | undefined> {
    return this.at(0)
  }

  last<A>(this: Edit<O, List<A>>): Edit<O, A | undefined> {
    return this.at(this.get.size - 1)
  }

  find<A>(this: Edit<O, List<A>>, pred: (b: A) => boolean): Edit<O, A> {
    return new Edit<O, A>(this.get.find(pred) as A, b =>
      this.modify(i => i.map(c => (pred(c) ? b : c)))
    )
  }

  pop<A>(this: Edit<O, List<A>>): O {
    return this.modify(xs => xs.pop())
  }

  push<A>(this: Edit<O, List<A>>, x: A): O {
    return this.modify(xs => xs.push(x))
  }

  shift<A>(this: Edit<O, List<A>>): O {
    return this.modify(xs => xs.shift())
  }

  unshift<A>(this: Edit<O, List<A>>, x: A): O {
    return this.modify(xs => xs.unshift(x))
  }

  insert<A>(this: Edit<O, List<A>>, ix: number, v: A): O {
    return this.modify(xs => xs.insert(ix, v))
  }

  delete<A>(this: Edit<O, List<A>>, ix: number): O {
    return this.modify(xs => xs.delete(ix))
  }

  slice<A>(this: Edit<O, List<A>>, begin?: number, end?: number): O {
    return this.modify(xs => xs.slice(begin, end))
  }

  concat<A>(this: Edit<O, List<A>>, other: List<A>): O {
    return this.modify(xs => xs.concat(other))
  }

  // Partial value utilities

  assume<A>(this: Edit<O, A | undefined>): Edit<O, A> {
    return this as Edit<O, A>
  }

  // Boolean related utilities

  or<A>(this: Edit<O, A | undefined>, x: A): Edit<O, A> {
    return new Edit<O, A>(this.get ?? x, this.set)
  }

  toggle(this: Edit<O, boolean>): O {
    return this.modify(b => !b)
  }

  // Numeric related utilities

  mul(this: Edit<O, number>, v: number) {
    return this.modify(c => c * v)
  }

  add(this: Edit<O, number>, v: number) {
    return this.modify(c => c + v)
  }

  // Create special edits

  static Id = <O>(o: O): Edit<O, O> => new Edit(o, o => o)

  static prop = <O, P extends keyof O>(o: O, p: P): Edit<O, O[P]> => edit(o).prop(p)
}

export const edit = <O extends P, P = O>(o: O): Edit<O, P> => Edit.Id(o) as any

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
