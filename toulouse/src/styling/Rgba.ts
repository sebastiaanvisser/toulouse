const mix = (a: number, b: number, c = 0.5) => a * (1 - c) + b * c

const fmt = Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3
})

export class Rgba {
  constructor(public r: number, public g: number, public b: number, public a: number) {}

  toString() {
    const { r, b, g, a } = this
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
      mix(this.a, a, c)
      //
    )
  }

  lighten(c = 0.5) {
    return this.mix(Rgba.White, c)
  }

  darken(c = 0.5) {
    return this.mix(Rgba.Black, c)
  }

  static Black = new Rgba(0, 0, 0, 1)
  static White = new Rgba(255, 255, 255, 1)
  static Transparent = new Rgba(0, 0, 0, 0)
}

export const rgba = (r: number, g: number, b: number, a: number = 1) =>
  new Rgba(r, g, b, a)

// ----------------------------------------------------------------------------
