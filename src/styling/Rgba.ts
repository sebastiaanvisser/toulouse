import { AssertionError } from 'assert'

const mix = (a: number, b: number, c = 0.5) => a * (1 - c) + b * c

const fmt = Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3
})

export class Rgba {
  constructor(public r: number, public g: number, public b: number, public a: number) {}

  toString() {
    const r = Math.round(this.r)
    const g = Math.round(this.g)
    const b = Math.round(this.b)
    const a = this.a
    return `rgba(${[r, g, b, a].map(n => fmt.format(n)).join()})`
  }

  alpha(a: number | ((a: number) => number)) {
    return rgba(this.r, this.g, this.b, a instanceof Function ? a(this.a) : a)
  }

  mix({ r, g, b, a }: Rgba, c = 0.5) {
    return rgba(
      mix(this.r, r, c),
      mix(this.g, g, c),
      mix(this.b, b, c),
      mix(this.a, a, c) //
    )
  }

  lighten(c = 0.5) {
    return this.mix(Rgba.White, c)
  }

  darken(c = 0.5) {
    return this.mix(Rgba.Black, c)
  }

  static fromHex(hex: string): Rgba {
    if (!hex.match(/^#?([a-fA-F0-9]{3,4}){1,2}$/))
      throw new AssertionError({ message: 'Rgba.fromHex: invalid hex string' })

    hex = hex.replace(/^#/, '')

    const p = (i: number, c: number) => parseInt(hex.slice(i, i + c), 16)

    if (hex.length <= 4) {
      const r = p(0, 1) * 17
      const g = p(1, 1) * 17
      const b = p(2, 1) * 17
      const a = hex.length === 4 ? p(3, 1) / 15 : 1
      return rgba(r, g, b, a)
    } else {
      const r = p(0, 2)
      const g = p(2, 2)
      const b = p(4, 2)
      const a = hex.length === 8 ? p(6, 2) / 255 : 1
      return rgba(r, g, b, a)
    }
  }

  static Black = new Rgba(0, 0, 0, 1)
  static White = new Rgba(255, 255, 255, 1)
  static Transparent = new Rgba(0, 0, 0, 0)
}

export const rgba = (r: number, g: number, b: number, a: number = 1) =>
  new Rgba(r, g, b, a)

// ----------------------------------------------------------------------------
