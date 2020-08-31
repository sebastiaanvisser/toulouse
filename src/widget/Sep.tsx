import React, { CSSProperties } from 'react'
import { ClickableStyling } from '../box/Clickable'
import { FlexStyles } from '../box/Flexed'
import { PalettedProps, usePalette, useResolvedPalette } from '../box/Paletted'
import { memo1 } from '../lib/Memo'
import { className, cx, Palette, px, Rule } from '../styling'

// ----------------------------------------------------------------------------
// Standalone separator element.

export interface SepProps {
  dashed?: boolean | number
  size?: number
  pad?: number
}

export function Sep(props: SepProps) {
  const { dashed, size, pad } = props
  const palette = usePalette()
  return <div className={cx(Style.get({ palette, dashed, size, pad }))} />
}

const Style = memo1(
  (props: { palette: Palette } & SepProps) => {
    const { palette, dashed = false, size = 1, pad = 0 } = props
    const { horizontalC, verticalC } = FlexStyles

    const sepC = className('sep')
    sepC.style({ zIndex: 1 })

    if (dashed) {
      const dash = typeof dashed === 'number' ? dashed : 5
      const clr = palette.Hover
      const d1 = px(dash)
      const d2 = px(2 * dash)

      const gradient = (angle: number) =>
        `repeating-linear-gradient(${angle}deg, ${clr}, ${clr} ${d1}, transparent ${d1}, transparent ${d2} )`

      horizontalC.child(sepC).style({ background: gradient(180) })
      verticalC.child(sepC).style({ background: gradient(90) })
    } else {
      sepC.style({
        backgroundColor: palette.Hover.toString()
      })
    }

    horizontalC.child(sepC).style({
      width: px(size),
      margin: [px(pad), px(-size / 2), px(pad), px(-size / 2)].join(' ')
    })

    verticalC.child(sepC).style({
      height: px(size),
      margin: [px(-size / 2), px(pad), px(-size / 2), px(pad)].join(' ')
    })

    return sepC
  },
  o => `${o.palette.name}-${o.dashed}-${o.size}-${o.pad}`
)

// ----------------------------------------------------------------------------
// Separating multiple children in a box.

export interface SeparatedProps {
  sep?: boolean
}

export function useSepClass(props: SeparatedProps & PalettedProps) {
  const palette = useResolvedPalette(props)
  const { sep } = props
  return cx(sep && SepStyle.get(palette))
}

const SepStyle = memo1(
  (p: Palette) => {
    const { horizontalC, verticalC } = FlexStyles
    const { clickableC } = ClickableStyling
    const sepC = className('sep')

    sepC.children.style({ position: 'relative' })

    const shared: CSSProperties = {
      transition: 'opacity 150ms ease',
      position: 'absolute',
      content: '""',
      backgroundColor: p.Hover.toString(),
      zIndex: 1,
      top: 0,
      left: 0
    }

    sepC.children.not(Rule.firstChild).before.style(shared)

    sepC
      .self(verticalC)
      .children.not(Rule.firstChild)
      .before.style({ right: 0, height: px(1) })

    sepC
      .self(horizontalC)
      .children.not(Rule.firstChild)
      .before.style({ bottom: 0, width: px(1) })

    const hovering = sepC.children.self(clickableC.hover)
    hovering.siblings.before.style({ opacity: 0 })
    hovering.before.style({ opacity: 0 })

    return sepC
  },
  p => p.name
)
