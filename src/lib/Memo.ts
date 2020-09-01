export class Memo<A, B> {
  ran = false
  map: Record<string, B> = {}

  constructor(
    private fun: (arg: A) => B,
    private on: (arg: A) => any = a => a //
  ) {}

  get(arg: A): B {
    const key = JSON.stringify(this.on(arg))

    const existing = this.map[key]
    if (existing) return existing

    const val = this.fun(arg)
    this.map[key] = val

    return val
  }
}

export class Once<A> {
  memo: Memo<{}, A>

  constructor(fun: () => A) {
    this.memo = new Memo(fun, () => 'const')
  }

  get(): A {
    return this.memo.get({})
  }

  map<B>(f: (a: A) => B): Once<B> {
    return new Once(() => f(this.get()))
  }
}

export const once = <B>(fun: () => B): Once<B> => new Once(fun)

export const memo1 = <A, B>(
  fun: (arg: A) => B,
  on?: (arg: A) => any //
): Memo<A, B> => new Memo(fun, on)

export const memo2 = <A, B, C>(
  fun: (a: A, b: B) => C,
  on?: (a: A, b: B) => any //
) =>
  memo1<[A, B], C>(
    t => fun(t[0], t[1]),
    on && (([a, b]) => on(a, b)) //
  )

export const memo3 = <A, B, C, D>(
  fun: (a: A, b: B, c: C) => D,
  on?: (a: A, b: B, c: C) => any
) =>
  memo1<[A, B, C], D>(
    t => fun(t[0], t[1], t[2]),
    on && (([a, b, c]) => on(a, b, c)) //
  )

export const memo4 = <A, B, C, D, E>(
  fun: (a: A, b: B, c: C, d: D) => E,
  on?: (a: A, b: B, c: C, d: D) => any
) =>
  memo1<[A, B, C, D], E>(
    t => fun(t[0], t[1], t[2], t[3]),
    on && (([a, b, c, d]) => on(a, b, c, d))
  )
