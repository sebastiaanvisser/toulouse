import { Palette } from './Palette'
import { Rgba, rgba } from './Rgba'

export class Color {
  constructor(readonly f: (color: Rgba, palette: Palette) => Rgba) {}

  private map(f: (color: Rgba, palette: Palette) => Rgba) {
    return new Color((c, p) => f(this.f(c, p), p))
  }

  compose(c: Color) {
    return this.map(c.f)
  }

  darken(n = 0.1) {
    return this.map(c => c.darken(n))
  }

  lighten(n = 0.1) {
    return this.map(c => c.lighten(n))
  }

  alpha(n: number) {
    return this.map(c => c.alpha(n))
  }

  mix(other: Color, t = 0.5) {
    return Color.mix(this, other, t)
  }

  get(palette: Palette, base = Rgba.Transparent): Rgba {
    return this.f(base, palette)
  }

  rgba(palette: Palette, base = Rgba.Transparent): string {
    return this.get(palette, base).toString()
  }

  static mix(a: Color, b: Color, t = 0.5) {
    return new Color((c, p) => a.f(c, p).mix(b.f(c, p), t))
  }

  static Id = new Color(c => c)
  static solid = (c: Rgba) => new Color(() => c)
  static themed = (f: (t: Palette) => Rgba) => new Color((_, t) => f(t))
  static rgba = (r: number, g: number, b: number, a = 1) => Color.solid(rgba(r, g, b, a))
}

// ----------------------------------------------------------------------------

export const Darken = (n = 0.1) => Color.Id.darken(n)
export const Lighten = (n = 0.1) => Color.Id.lighten(n)
export const Alpha = (n: number) => Color.Id.alpha(n)

export const ShadeColor = Color.themed(p => p.Shade().Bg)
export const PrimaryColor = Color.themed(p => p.Primary().Bg)
export const ContrastColor = Color.themed(p => p.Contrast().Bg)

export const Bg = Color.themed(t => t.Bg)
export const Fg = Color.themed(t => t.Fg)
export const Hover = Color.themed(t => t.Hover)

export const Black = Color.themed(t => t.Black)
export const White = Color.themed(t => t.White)
export const Yellow = Color.themed(t => t.Yellow)
export const Orange = Color.themed(t => t.Orange)
export const Red = Color.themed(t => t.Red)
export const Rose = Color.themed(t => t.Rose)
export const Magenta = Color.themed(t => t.Magenta)
export const Purple = Color.themed(t => t.Purple)
export const Indigo = Color.themed(t => t.Indigo)
export const Blue = Color.themed(t => t.Blue)
export const Cyan = Color.themed(t => t.Cyan)
export const Aqua = Color.themed(t => t.Aqua)
export const Green = Color.themed(t => t.Green)
export const Lime = Color.themed(t => t.Lime)
