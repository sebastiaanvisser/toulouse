import { createContext, CSSProperties, useContext } from 'react'
import { memo1 } from '../lib/Memo'
import { Color } from '../styling/Color'
import { className, cx } from '../styling/Css'
import { Arctic, Palette } from '../styling/Palette'

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

export const bgC = memo1((p: Palette) => {
  const name = className(`bg-${p.name}`)

  name.style({
    backgroundColor: p.Bg.toString()
  })

  return name
})

export const fgC = memo1((p: Palette) =>
  className(`fg-${p.name}`).style({
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

export interface BgProps {
  bg?: Color | Palette | boolean
}

export interface FgProps {
  fg?: Color | Palette | boolean
}

export type ColoringProps = BgProps & FgProps

export function useColorStyle(props: ColoringProps & PalettedProps): CSSProperties {
  const palette = useResolvedPalette(props)
  const { fg, bg } = props

  const background = bg instanceof Color ? bg.rgba(palette, palette.Bg) : undefined
  //  bg instanceof Function
  //     ? bg(palette).Bg.toString()
  // :

  const color = fg instanceof Color ? fg.rgba(palette, palette.Fg) : undefined
  // : fg instanceof Function
  // ? fg(palette).Bg.toString()

  const fill = color

  return { background, color, fill }
}
