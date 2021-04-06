import { List } from 'immutable'
import { Edit } from './Edit'

export class Lens<O, I> {
  constructor(readonly f: (o: O) => Edit<O, I>) {}

  edit(o: O): Edit<O, I> {
    return this.f(o)
  }

  get get(): (o: O) => I {
    return (o: O) => this.f(o).get
  }

  set(i: I): (o: O) => O {
    return (o: O) => this.f(o).set(i)
  }

  modify(f: (i: I) => I): (o: O) => O {
    return (o: O) => this.f(o).modify(f)
  }

  map<J>(g: (e: Edit<O, I>) => Edit<O, J>) {
    return new Lens<O, J>(o => g(this.f(o)))
  }

  zoom<J>(lens: Lens<I, J>) {
    return this.map(e => e.zoom(lens))
  }

  zoom1<J>(f: (i: I) => Edit<I, J>) {
    return this.map(e => e.zoom(new Lens(f)))
  }

  prop<P extends keyof I>(p: P) {
    return this.map(e => e.prop(p))
  }

  at<E>(this: Lens<O, List<E>>, ix: number): Lens<O, E | undefined> {
    return this.map(e => e.at(ix))
  }

  assume<X>(this: Lens<O, X | undefined>): Lens<O, X> {
    return this.map(e => e.assume())
  }

  first<E>(this: Lens<O, List<E>>): Lens<O, E | undefined> {
    return this.map(e => e.at(0))
  }

  last<E>(this: Lens<O, List<E>>): Lens<O, E | undefined> {
    return this.map(e => e.last())
  }

  find<B>(this: Lens<O, List<B>>, pred: (b: B) => boolean): Lens<O, B> {
    return this.map(e => e.find(pred))
  }

  static id = <O>() => new Lens<O, O>(o => Edit.Id(o))

  static prop = <O, P extends keyof O>(p: P) => Lens.id<O>().prop(p)

  static at = <E>(ix: number) => Lens.id<List<E>>().at(ix)

  static assume = <O>() => Lens.id<O | undefined>().assume()

  static first = <E>() => Lens.id<List<E>>().first()

  static last = <E>() => Lens.id<List<E>>().last()

  static find = <E>(pred: (b: E) => boolean) => Lens.id<List<E>>().find(pred)
}

export const lens = <A>() => Lens.id<A>()
