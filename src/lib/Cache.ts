export class Cache<A> {
  readonly cache: { [key: string]: A } = {}

  get(key: string): A | undefined {
    return this.cache[key]
  }

  with(key: string, builder: () => A): A {
    const cached = this.cache[key]
    if (cached) return cached

    const obj = builder()
    this.cache[key] = obj
    return obj
  }
}
