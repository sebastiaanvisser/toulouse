import React, { CSSProperties } from 'react'
import { memo1 } from '../lib'
import { FlexStyles } from '../box/Flexed'
import { usePalette, useResolvedPalette, PalettedProps } from '../box/Paletted'
import { ClickableStyling } from '../box/Clickable'
import { cx, Palette, className, px } from '../styling'

export function Sep() {
  const palette = usePalette()
  return <div className={cx(Style.get(palette))} />
}

const Style = memo1(
  (p: Palette) => {
    const sepC = className('sep', {
      background: p.Hover.toString(),
      zIndex: 1
    })

    const { horizontalC, verticalC } = FlexStyles.get()

    horizontalC.child(sepC).style({
      width: px(1),
      marginLeft: px(-0.5),
      marginRight: px(-0.5)
    })

    verticalC.child(sepC).style({
      height: px(1),
      marginTop: px(-0.5),
      marginBottom: px(-0.5)
    })

    return sepC
  },
  p => p.name
)

// ----------------------------------------------------------------------------

export interface SepProps {
  sep?: boolean
}

export function useSepClass(props: SepProps & PalettedProps) {
  const palette = useResolvedPalette(props)
  const { sep } = props
  return cx(sep && SepStyle.get(palette))
}

const SepStyle = memo1((p: Palette) => {
  const { horizontalC, verticalC } = FlexStyles.get()
  const { clickableC } = ClickableStyling.get()
  const sepC = className('sep')

  sepC.child().style({ position: 'relative' })

  const shared: CSSProperties = {
    transition: 'opacity 150ms ease',
    position: 'absolute',
    content: '""',
    backgroundColor: p.Hover.toString(),
    zIndex: 1,
    top: 0,
    left: 0
  }

  sepC
    .child()
    .not(x => x.firstChild())
    .before()
    .style(shared)

  sepC
    .self(verticalC)
    .child()
    .not(x => x.firstChild())
    .before()
    .style({ right: 0, height: px(1) })

  sepC
    .self(horizontalC)
    .child()
    .not(x => x.firstChild())
    .before()
    .style({ bottom: 0, width: px(1) })

  const hovering = sepC.child().self(clickableC.hover())
  hovering.sibling().before().style({ opacity: 0 })
  hovering.before().style({ opacity: 0 })

  return sepC
})
