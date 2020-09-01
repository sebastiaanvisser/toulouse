import { memo1 } from '../lib/Memo'
import { Bg, className, cx, Hover, Palette, Rule } from '../styling'
import { PalettedProps, useResolvedPalette } from './Paletted'

export interface ClickableProps {
  button?: boolean
  disabled?: boolean
  clickthrough?: boolean
  noselect?: boolean
}

export function useClickableClass(props: ClickableProps & PalettedProps, bg = true) {
  const palette = useResolvedPalette(props)
  const { button, clickthrough, noselect, disabled } = props
  return cx(
    button && bg && hoverBgC.get(palette),
    button && clickableC,
    clickthrough && clickthroughC,
    noselect && noselectC,
    disabled && disabledC //
  )
}

// ----------------------------------------------------------------------------

const clickableC = className('clickable')
const clickthroughC = className('clickthrough')
const noselectC = className('noselect')
const disabledC = className('disabled')
const hoveringSel = clickableC.hover.not(Rule.active)
const activeSel = clickableC.active

export const ClickableStyling = {
  clickableC,
  disabledC,
  hoveringSel,
  activeSel
}

clickableC.style({
  userSelect: 'none',
  cursor: 'pointer'
})

noselectC.style({ userSelect: 'none' })

clickthroughC.style({
  pointerEvents: 'none !important' as any
})

clickthroughC.children.style({ pointerEvents: 'auto' })

disabledC.style({
  pointerEvents: 'none',
  userSelect: 'none',
  cursor: 'auto'
})

disabledC.children.style({
  opacity: 0.35
})

export const hoverBgC = memo1((p: Palette) => {
  const hoverC = className(`bg-hover-${p.name}`)

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
