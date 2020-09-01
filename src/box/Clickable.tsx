import { memo1 } from '../lib/Memo'
import { cx } from '../styling/Classy'
import { Bg, Hovering } from '../styling/Color'
import { Palette } from '../styling/Palette'
import { className, style } from '../styling/Rule'
import { Active } from '../styling/Selector'

export interface Props {
  button?: boolean
  disabled?: boolean
  clickthrough?: boolean
  noselect?: boolean
  noevents?: boolean
}

export function classes(props: Props, palette: Palette) {
  const { button, clickthrough, noselect, disabled } = props
  return cx(
    button && clickableC,
    button && hoverBgC.get(palette),
    clickthrough && clickthroughC,
    noselect && noselectC,
    noselect && noeventsC,
    disabled && disabledC //
  )
}

// ----------------------------------------------------------------------------

export const clickableC = className('clickable')
const clickthroughC = style().name('clickthrough')
const hoveringSel = clickableC.hover.not(Active)
const activeSel = clickableC.active
const noselectC = style().name('noselect')
const noeventsC = style().name('noselect')
const disabledC = style().name('disabled')

clickableC.style({
  userSelect: 'none',
  cursor: 'pointer'
})

noselectC.style({ userSelect: 'none' })
noeventsC.style({ userSelect: 'none' })

clickthroughC.style({
  pointerEvents: 'none !important' as any
})

clickthroughC.children.style({ pointerEvents: 'auto' })

disabledC.style({
  pointerEvents: 'none',
  userSelect: 'none',
  cursor: 'not-allowed'
})

disabledC.children.style({
  opacity: 0.35
})

const hoverBgC = memo1((p: Palette) => {
  const hoverC = style()

  hoverC.self(hoveringSel).style({
    transition: 'background 200ms ease',
    backgroundColor: p.Hovering.toString()
  })

  hoverC.self(activeSel).style({
    transition: 'background 200ms ease',
    backgroundColor: Hovering.mix(Bg).rgba(p)
  })

  return hoverC
})
