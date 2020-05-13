export function flatMap<A, B>(this: A[], f: (a: A, i: number) => B[]): B[] {
  return ([] as B[]).concat(...this.map(f))
}

export function flat<A>(this: A[][]): A[] {
  return ([] as A[]).concat(...this)
}

if (!('flatMap' in Array.prototype)) {
  ;(Array.prototype as any).flatMap = flatMap
  ;(Array.prototype as any).flat = flat
}

declare global {
  interface Array<T> {
    flatMap<B>(f: (a: T, i: number) => B[]): B[]
    flat<Q>(this: Q[][]): Q[]
  }
}
