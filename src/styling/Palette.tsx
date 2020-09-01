import { Iso } from '../lib/Iso'
import { DefaultColors, Rgba, rgba } from './Rgba'

export interface Palette {
  name: PaletteName

  // Palette specific colors
  Bg: Rgba
  Fg: Rgba
  Shade: Rgba
  Hovering: Rgba

  // Named colors, tweaked for palette
  Black: Rgba
  White: Rgba
  Yellow: Rgba
  Orange: Rgba
  Red: Rgba
  Rose: Rgba
  Magenta: Rgba
  Purple: Rgba
  Indigo: Rgba
  Blue: Rgba
  Cyan: Rgba
  Aqua: Rgba
  Green: Rgba
  Lime: Rgba

  // Associated palettes
  Primary: () => Palette
  Contrast: () => Palette
}

// ----------------------------------------------------------------------------

export const Arctic: Palette = {
  name: 'arctic',
  ...DefaultColors,

  Bg: Rgba.White,
  Fg: Rgba.Black.alpha(0.7),
  Hovering: rgba(241, 243, 244),
  Shade: Rgba.fromHex('#F6F8FA'),

  Primary: () => Day,
  Contrast: () => Ocean
}

export const Fog: Palette = {
  name: 'fog',
  ...DefaultColors,

  Bg: rgba(241, 243, 244),
  Fg: Rgba.Black.alpha(0.8),
  Hovering: Rgba.Black.alpha(0.05),
  Shade: Rgba.fromHex('#F6F8FA'),

  Primary: () => Night,
  Contrast: () => Night
}

export const Day: Palette = {
  name: 'day',
  ...DefaultColors,

  Bg: DefaultColors.Blue,
  Fg: Rgba.White.alpha(0.9),
  Hovering: DefaultColors.Blue.darken(0.1),
  Shade: DefaultColors.Blue.darken(0.1),

  Primary: () => Arctic,
  Contrast: () => Ocean
}

export const Night: Palette = {
  name: 'night',
  ...DefaultColors,

  Bg: rgba(20, 77, 99, 1), //DefaultColors.Indigo,
  Fg: Rgba.White.alpha(0.7),
  Hovering: rgba(20, 77, 99, 1).mix(Rgba.White, 0.07),
  Shade: rgba(20, 77, 99, 1).darken(0.1),

  Red: rgba(226, 108, 62),
  Green: Rgba.fromHex('#8BC34A'),
  Blue: rgba(56, 192, 210),

  Primary: () => Desert,
  Contrast: () => Fog
}

export const Ocean: Palette = {
  name: 'ocean',
  ...DefaultColors,

  Bg: rgba(7, 50, 64),
  Fg: Rgba.White.alpha(0.7),
  Hovering: rgba(22, 71, 86).darken(0.1),
  Shade: rgba(7, 50, 64).darken(0.1),

  Red: rgba(242, 109, 57),
  Green: Rgba.fromHex('#8BC34A'),
  Blue: Rgba.fromHex('#00bcd4'),

  Primary: () => Desert,
  Contrast: () => Arctic
}

export const Cavern: Palette = {
  name: 'cavern',
  ...DefaultColors,

  Bg: rgba(5, 35, 45),
  Fg: Rgba.White.alpha(0.7),
  Hovering: rgba(5, 35, 45).lighten(0.05),
  Shade: rgba(5, 35, 45).darken(0.2),

  Blue: Rgba.fromHex('#00bcd4'),

  Primary: () => Desert,
  Contrast: () => Arctic
}

export const Desert: Palette = {
  name: 'desert',
  ...DefaultColors,

  Bg: DefaultColors.Yellow,
  Fg: rgba(7, 50, 64),
  Hovering: DefaultColors.Yellow.darken(0.07),
  Shade: DefaultColors.Yellow.lighten(0.1),

  Primary: () => Night,
  Contrast: () => Ocean
}

export const Lava: Palette = {
  name: 'lava',
  ...DefaultColors,

  Bg: DefaultColors.Red,
  Fg: Rgba.White.alpha(0.9),
  Hovering: DefaultColors.Red.darken(0.07),
  Shade: Rgba.fromHex('#F6F8FA'),

  Primary: () => Arctic,
  Contrast: () => Ocean
}

export const Meadow: Palette = {
  name: 'meadow',
  ...DefaultColors,

  Bg: DefaultColors.Green,
  Fg: Rgba.White.alpha(0.9),
  Hovering: DefaultColors.Green.darken(0.1),
  Shade: Rgba.fromHex('#F6F8FA'),

  Primary: () => Arctic,
  Contrast: () => Ocean
}

// ----------------------------------------------------------------------------

export const byName = {
  arctic: Arctic,
  fog: Fog,
  day: Day,
  night: Night,
  ocean: Ocean,
  cavern: Cavern,
  desert: Desert,
  meadow: Meadow,
  lava: Lava
}

export type PaletteName = keyof typeof byName

export const paletteByName = new Iso<Palette, PaletteName>(
  t => t.name,
  n => byName[n]
)
