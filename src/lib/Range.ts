export class Range_ {
  constructor(readonly from: number, readonly to: number) {
    this.from = Math.min(this.from, this.to)
    this.to = Math.max(this.from, this.to)
  }

  delta() {
    return this.to - this.from
  }

  clamp(n: number) {
    return Math.max(this.from, Math.min(n, this.to))
  }

  lerp(n: number) {
    return this.from + this.delta() * n
  }

  at(n: number) {
    return (n - this.from) / this.delta()
  }

  remap(to: Range_, n: number) {
    return to.lerp(this.at(n))
  }

  within(x: number) {
    return x >= this.from && x <= this.to
  }

  magnitude() {
    return Math.pow(10, Math.floor(Math.log(this.to - this.from) / Math.log(10)))
  }

  iterate(step = 1, inclusive = false): number[] {
    const out = []
    let i = this.from
    for (; i < this.to; i += step) out.push(i)
    if (inclusive) out.push(i)
    return out
  }

  static to = (n: number) => new Range_(-Infinity, n)
  static from = (n: number) => new Range_(n, Infinity)
  static everything = new Range_(-Infinity, Infinity)
}

export const range = (from: number, to: number) => new Range_(from, to)
