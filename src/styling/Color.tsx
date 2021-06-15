import { Palette } from './Palette'
import { rgba, Rgba } from './Rgba'

export class Color {
  constructor(readonly f: (palette: Palette) => Rgba) {}

  map(f: (r: Rgba) => Rgba) {
    return new Color(p => f(this.f(p)))
  }

  darken(n = 0.1) {
    return this.map(c => c.darken(n))
  }

  lighten(n = 0.1) {
    return this.map(c => c.lighten(n))
  }

  alpha(a: number | ((a: number) => number)) {
    return this.map(c => c.alpha(a))
  }

  get(palette: Palette): Rgba {
    return this.f(palette)
  }

  rgba(palette: Palette): string {
    return this.get(palette).toString()
  }

  mix(b: Color, t = 0.5) {
    return new Color(p => this.f(p).mix(b.f(p), t))
  }

  brighten(n = 0.1) {
    return this.map(c => (c.avg < 128 ? c.darken(n) : c.lighten(n)))
  }

  static rgba = (r: number, g: number, b: number, a?: number) =>
    new Color(() => rgba(r, g, b, a))

  static fromHex = (hex: string) => new Color(() => Rgba.fromHex(hex))
}

export const solid = (rgba: Rgba) => new Color(() => rgba)

export const Primary = new Color(p => p.Primary().Bg)
export const Contrast = new Color(p => p.Contrast().Bg)

export const Bg = new Color(p => p.Bg)
export const Fg = new Color(p => p.Fg)
export const Dim = Fg.alpha(0.3)
export const Hovering = new Color(p => p.Hovering)
export const Shade = new Color(p => p.Shade)
export const Bright = new Color(p => (p.Fg.avg < 128 ? p.Black : p.White))

export const Black = new Color(p => p.Black)
export const White = new Color(p => p.White)
export const Yellow = new Color(p => p.Yellow)
export const Orange = new Color(p => p.Orange)
export const Red = new Color(p => p.Red)
export const Rose = new Color(p => p.Rose)
export const Magenta = new Color(p => p.Magenta)
export const Purple = new Color(p => p.Purple)
export const Indigo = new Color(p => p.Indigo)
export const Blue = new Color(p => p.Blue)
export const Cyan = new Color(p => p.Cyan)
export const Aqua = new Color(p => p.Aqua)
export const Green = new Color(p => p.Green)
export const Lime = new Color(p => p.Lime)
