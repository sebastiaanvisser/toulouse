import isEqual from 'lodash.isequal'

export type Prim = string | number | boolean | null | undefined

export type Eq<A> = (a: A, b: A) => boolean

export const eqOn = <A, B>(f: (b: A) => B): Eq<A> => (a, b) => isEqual(f(a), f(b))

// ----------------------------------------------------------------------------

export const compare = <A extends Prim>(a: A, b: A): number =>
  a > b ? 1 : a === b ? 0 : -1

export const comparing = <A>(...on: ((a: A) => any)[]) => (a: A, b: A): number =>
  on.length === 0 ? 0 : compare(on[0](a), on[0](b)) || comparing(...on.slice(1))(a, b)

// ----------------------------------------------------------------------------

export const sortOn = <A>(xs: A[], ...on: ((a: A) => Prim)[]): A[] =>
  xs.slice().sort(comparing(...on))

// ----------------------------------------------------------------------------

export function groupBy<A>(xs: A[], eq: Eq<A> = isEqual): A[][] {
  if (xs.length === 0) return []
  let cur = [xs[0]]
  const groups = [cur]
  for (var i = 1; i < xs.length; i++) {
    const x = xs[i]
    if (eq(x, xs[i - 1])) cur.push(x)
    else groups.push((cur = [x]))
  }
  return groups
}

export const groupOn = <A>(xs: A[], on: (a: A) => Prim) => groupBy(xs, eqOn(on))
