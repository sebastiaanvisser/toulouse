import { CSSProperties, memo } from 'react'
import { EventProps, FlexStyles } from '../box'
import { ClickableProps, ClickableStyling, useClickableClass } from '../box/Clickable'
import {
  ColoringProps,
  PalettedProps,
  resolveColorLike,
  useResolvedPalette
} from '../box/Paletted'
import { SmallProps, useResolvedeSmall } from '../box/Small'
import { Unit } from '../box/Unit'
import { Icons } from '../icon/Icons'
import { layers, Shape, shapeAsSvg } from '../icon/Shape'
import { memo1, memo3, Once } from '../lib/Memo'
import { className, cx, px, Rule } from '../styling/Css'
import { Palette } from '../styling/Palette'
import { Rgba } from '../styling/Rgba'
import { labelC } from './Label'

export type IconDef = Shape | Once<Shape>

interface ImageProps {
  icon: IconDef
  width?: number
  height?: number
  zoom?: number
  rotate?: number
  className?: string
  bgShape?: Once<Shape>
  inline?: boolean
}

type Props = ImageProps &
  ColoringProps &
  PalettedProps &
  SmallProps &
  ClickableProps &
  EventProps<SVGElement>

export const Icon = memo((props: Props) => {
  const {
    icon,
    bgShape = Icons.Blob,
    width,
    height,
    bg: _bg,
    fg: _fg,
    inline,
    rotate,
    className,
    button,
    zoom,
    ...rest
  } = props

  const small = useResolvedeSmall(props)
  const palette = useResolvedPalette(props)
  const clickableClass = useClickableClass(props, false)

  const bg = resolveColorLike(props.bg, palette, palette.Bg)
  const fg = resolveColorLike(props.fg, palette, palette.Fg) // ?? palette.Fg

  const shape = renderShape.get([get(icon), get(bgShape), rotate])

  return shapeAsSvg(Unit, Unit, shape, {
    ...rest,
    className: cx(
      Style.get({ palette, small, zoom, inline, button, rotate, bg, fg }),
      clickableClass,
      className
    )
  })
})

const get = (icon: Shape | Once<Shape>) => (icon instanceof Shape ? icon : icon.get())

// ----------------------------------------------------------------------------

const renderShape = memo3(
  (icon: Shape, bgShape: Shape, rotate?: number) => {
    return layers(
      bgShape.scaleOn(1.5, 15, 15).named('bg'),
      icon
        .scaleOn(0.9, 15, 15)
        .rotateOn(rotate ?? 0, 15, 15)
        .named('fg') //
    )
  },
  (icon, bg, rotate) => `${icon.name()}-${bg.name()}-${rotate}`
)

// ----------------------------------------------------------------------------

// TODO: reuse from label?

const svgFont: CSSProperties = {
  fontFamily: "'Ubuntu', 'Open Sans', 'Helvetica', sans-serif",
  fontSize: px(13),
  lineHeight: px(20)
}

const Style = memo1(
  (props: {
    palette: Palette
    small?: boolean
    zoom?: number
    inline?: boolean
    button?: boolean
    rotate?: number
    bg?: Rgba
    fg?: Rgba
  }) => {
    const {
      small = false,
      zoom = 1,
      inline = false,
      button = false,
      bg,
      fg,
      rotate,
      palette
    } = props

    const iconC = className('icon')

    const fgEl = (s: Rule) => s.selfOrSub(iconC).selfOrSub('.fg')
    const bgEl = (s: Rule) => s.selfOrSub(iconC).selfOrSub('.bg')

    iconC.style({
      ...svgFont,
      fontWeight: 500,
      alignSelf: 'center',
      flexShrink: 0,
      strokeWidth: 0,
      zoom
    })

    if (small)
      iconC.style({
        zoom: `calc(${20 * zoom} / 30)`
      })

    if (rotate !== undefined)
      iconC.deep('.fg').anyDeep.style({
        transition: 'transform 500ms cubic-bezier(0.87, 0, 0.13, 1)'
      })

    const { horizontalC } = FlexStyles

    if (inline)
      horizontalC.child(iconC).style({
        margin: small ? '0 -15px 0 -15px' : '0 -10px 0 -10px'
      })
    else {
      horizontalC.child(iconC.sibling(labelC)).style({
        margin: small ? '0 0 0 -5px' : '0 0 0 -10px'
      })
      horizontalC.child(labelC.sibling(iconC)).style({
        margin: small ? '0 0 0 -7.5px' : '0 0 0 -10px'
      })
    }

    const { clickableC, hoveringSel, activeSel } = ClickableStyling

    fgEl(clickableC).style({
      transition: 'transform 200ms ease',
      transformOrigin: 'center center'
    })

    fgEl(hoveringSel).style({
      transform: 'scale(1.15)'
    })

    const bgC = resolveColorLike(props.bg, palette, palette.Bg)?.toString()
    const fgC = resolveColorLike(props.fg, palette, palette.Fg)?.toString()

    iconC.deep('.fg').style({ fill: fgC })
    iconC.deep('.bg').style({ fill: bgC ?? 'transparent' })

    if (button) {
      bgEl(clickableC).style({
        transition: 'fill 200ms ease'
      })

      bgEl(hoveringSel).style({
        fill: (bg ?? fg?.alpha(0.1))?.toString()
      })

      bgEl(activeSel).style({
        fill: (bg ?? fg?.alpha(0.05))?.toString()
      })
    }

    return iconC
  },
  ({ palette, ...rest }) => JSON.stringify([palette.name, rest])
)
