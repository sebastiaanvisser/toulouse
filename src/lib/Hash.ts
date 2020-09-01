import { List } from 'immutable'
import { h32 } from 'xxhashjs'

export type Hash = number

type Prim = string | number | boolean | undefined

const prim = (v: Prim): Hash =>
  h32(0xa3aff03d)
    .update(v?.toString() ?? 'undefined')
    .digest()
    .toNumber()

export const build = (...values: Prim[]) =>
  values.length === 1 ? prim(values[0]) : prim(JSON.stringify(values))

export const json = (obj: any) => prim(JSON.stringify(obj))

export const list = <A>(item: (a: A) => Hash) => (x: List<A>): Hash => build(...x.map(item))

export const array = <A>(item: (a: A) => Hash) => (x: A[]): Hash => build(...x.map(item))

export const optional = <A>(item: (a: A) => Hash) => (x: A | undefined): Hash =>
  x === undefined ? prim(undefined) : item(x)

export const pair = <A, B>(
  f: (a: A) => Hash,
  g: (b: B) => Hash, //
) => ([a, b]: [A, B]): Hash => build(f(a), g(b))
