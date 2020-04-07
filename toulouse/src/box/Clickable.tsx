import { memo1, once } from '../lib/Memo'
import { Bg, Palette, Hover } from '../styling'
import { className, cx } from '../styling/Css'
import { PalettedProps, useResolvedPalette } from './Paletted'

export interface ClickableProps {
  button?: boolean
  disabled?: boolean
}

export function useClickableClass(props: ClickableProps & PalettedProps, bg = true) {
  const palette = useResolvedPalette(props)
  const { button, disabled } = props
  const { clickableC, disabledC } = ClickableStyling.get()
  return cx(
    button && bg && hoverBgC.get(palette),
    button && clickableC,
    disabled && disabledC //
  )
}

// ----------------------------------------------------------------------------

export const hoverBgC = memo1((p: Palette) => {
  const hoverC = className(`bg-hover-${p.name}`)

  const { clickableC, hoveringSel, activeSel } = ClickableStyling.get()

  hoverC.self(clickableC).style({
    transition: 'background 200ms ease'
  })

  hoverC.self(hoveringSel).style({
    backgroundColor: p.Hover.toString()
  })

  hoverC.self(activeSel).style({
    backgroundColor: Hover.mix(Bg).rgba(p)
  })

  return hoverC
})

export const ClickableStyling = once(() => {
  const clickableC = className('clickable')
  const disabledC = className('disabled')

  clickableC.style({
    userSelect: 'none',
    cursor: 'pointer'
  })

  disabledC.style({
    pointerEvents: 'none',
    userSelect: 'none',
    cursor: 'auto'
  })

  disabledC.child().style({
    opacity: 0.35
  })

  const hoveringSel = clickableC.hover().not(s => s.active())
  const activeSel = clickableC.active()

  return {
    clickableC,
    disabledC,
    hoveringSel,
    activeSel
  }
})
