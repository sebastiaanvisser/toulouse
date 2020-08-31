import { createContext, CSSProperties, useContext } from 'react'
import { memo1 } from '../lib/Memo'
import { Color } from '../styling/Color'
import { className, cx } from '../styling/Css'
import { Arctic, Palette } from '../styling/Palette'
import { Rgba } from '../styling/Rgba'

export const PaletteContext = createContext<Palette>(Arctic)

export const usePalette = () => useContext(PaletteContext)

export interface PalettedProps {
  palette?: Palette | ((palette: Palette) => Palette)
}

export const useResolvedPalette = ({ palette }: PalettedProps): Palette => {
  const current = useContext(PaletteContext)
  return (palette instanceof Function ? palette(current) : palette) || current
}

// ----------------------------------------------------------------------------
// Default background and foreground styling based on current theme.

export const bgC = memo1((p: Palette) =>
  className(`bg-${p.name}`).style({
    backgroundColor: p.Bg.toString()
  })
)

export const fgC = memo1((p: Palette) =>
  className(`fg-${p.name}`, {
    color: p.Fg.toString(),
    fill: p.Fg.toString()
  })
)

export function usePaletteClass(props: ColoringProps & PalettedProps): string {
  const palette = useResolvedPalette(props)
  const { fg, bg } = props

  return cx(
    bg === true && bgC.get(palette),
    (fg === true || !!props.palette) && fgC.get(palette) //
  )
}

// ----------------------------------------------------------------------------
// Custom background and foreground styling using style attribute.

export type ColorLike = Rgba | Color | Palette | boolean | undefined

export function resolveColorLike(
  c: ColorLike,
  palette: Palette,
  base: Rgba
): Rgba | undefined {
  if (c instanceof Rgba) return c
  if (c instanceof Color) return c.get(palette, base)
  if (c === true) return base
  return
}

export interface BgProps {
  bg?: ColorLike
}

export interface FgProps {
  fg?: ColorLike
}

export type ColoringProps = BgProps & FgProps

export function useColorStyle(props: ColoringProps & PalettedProps): CSSProperties {
  const palette = useResolvedPalette(props)
  const { fg, bg } = props

  const background = resolveColorLike(bg, palette, palette.Bg)?.toString()
  const color = resolveColorLike(fg, palette, palette.Fg)?.toString()
  const fill = color

  return { background, color, fill }
}
