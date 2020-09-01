import React, { CSSProperties } from 'react'
import { clickableC } from '../box/Clickable'
import { horizontalC, verticalC } from '../box/Flexed'
import { usePalette } from '../box/Themed'
import { memo1 } from '../lib/Memo'
import { cx, px } from '../styling/Classy'
import { Palette } from '../styling/Palette'
import { className } from '../styling/Rule'
import { FirstChild } from '../styling/Selector'

// ----------------------------------------------------------------------------
// Standalone separator element.

export interface SepProps {
  dashed?: boolean | number
  size?: number
  pad?: number | true
}

export function Sep(props: SepProps) {
  const { dashed, size, pad } = props
  const palette = usePalette()
  return <div className={cx(Style.get({ palette, dashed, size, pad }))} />
}

const Style = memo1(
  (props: { palette: Palette } & SepProps) => {
    const { palette, dashed = false, size = 1 } = props

    const pad = props.pad === true ? 10 : props.pad === undefined ? 0 : props.pad

    const sepC = className(`sep-${palette.name}`)
    sepC.style({ zIndex: 1 })

    if (dashed) {
      const dash = typeof dashed === 'number' ? dashed : 5
      const clr = palette.Hovering
      const d1 = px(dash)
      const d2 = px(2 * dash)

      const gradient = (angle: number) =>
        `repeating-linear-gradient(${angle}deg, ${clr}, ${clr} ${d1}, transparent ${d1}, transparent ${d2} )`

      horizontalC.child(sepC).style({ background: gradient(180) })
      verticalC.child(sepC).style({ background: gradient(90) })
    } else {
      sepC.style({
        backgroundColor: palette.Hovering.toString()
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

export interface Props {
  sep?: boolean
}

export function classes(props: Props, palette: Palette) {
  const { sep } = props
  return cx(sep && SepStyle.get(palette))
}

const SepStyle = memo1(
  (p: Palette) => {
    const sepC = className(`sep-${p.name}`)

    sepC.children.style({ position: 'relative' })

    const shared: CSSProperties = {
      position: 'absolute',
      content: '""',
      backgroundColor: p.Hovering.toString(),
      zIndex: 1,
      top: 0,
      left: 0
    }

    sepC.children.not(FirstChild).before.style(shared)

    sepC
      .self(verticalC)
      .children.not(FirstChild)
      .before.style({ right: 0, height: px(1) })

    sepC
      .self(horizontalC)
      .children.not(FirstChild)
      .before.style({ bottom: 0, width: px(1) })

    const hovering = sepC.children.self(clickableC.hover)
    hovering.siblings.before.style({ opacity: 0 })
    hovering.before.style({ opacity: 0 })

    return sepC
  },
  p => p.name
)
