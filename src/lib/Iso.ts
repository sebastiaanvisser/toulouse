export class Iso<A, B> {
  constructor(
    readonly fw: (a: A) => B,
    readonly bw: (b: B) => A //
  ) {}

  inv(): Iso<B, A> {
    return new Iso(this.bw, this.fw)
  }
}

export const iso = <A, B>(fw: (a: A) => B, bw: (b: B) => A) => new Iso(fw, bw)
