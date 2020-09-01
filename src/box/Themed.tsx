import React, { createContext, ReactNode, useContext } from 'react'
import { Arctic, byName, Palette, PaletteName } from '../styling/Palette'

export const PaletteContext = createContext<Palette>(Arctic)

export const usePalette = () => useContext(PaletteContext)

export interface ThemeProps {
  palette?: PaletteLike
  primary?: boolean
  contrast?: boolean
  children: ReactNode
}

type Foo = {
  [name in PaletteName]?: boolean
}

export function Theme(props: ThemeProps & Foo) {
  const { children, palette, contrast, primary } = props
  const base = usePalette()

  let cur: PaletteLike | undefined
  Object.values(byName).forEach(p => {
    if (props[p.name]) cur = p
  })

  if (primary) cur = base.Primary
  if (contrast) cur = base.Contrast

  return (
    <PaletteContext.Provider value={resolve(palette ?? cur, base)}>
      {children}
    </PaletteContext.Provider>
  )
}

// ----------------------------------------------------------------------------

export type PaletteLike = Palette | ((p: Palette) => Palette)

function resolve(palette: PaletteLike | undefined, base: Palette) {
  return (palette instanceof Function ? palette(base) : palette) ?? base
}
