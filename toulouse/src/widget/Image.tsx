import * as React from 'react'
import { Unit } from '../box/Box'
import { ClickableProps, ClickableStyling, useClickableClass } from '../box/Clickable'
import {
  ColoringProps,
  PalettedProps,
  useColorStyle,
  usePaletteClass,
  useResolvedPalette
} from '../box/Paletted'
import { SmallProps, useResolvedeSmall } from '../box/Small'
import { Blob } from '../icon/Icons'
import { layers, rect, Shape, shapeAsSvg } from '../icon/Shape'
import { memo4, Once, once } from '../lib/Memo'
import { Color } from '../styling/Color'
import { className, cx, Rule, style } from '../styling/Css'
import { FontStyles } from '../styling/Fonts'
import { Rgba } from '../styling/Rgba'

export const offsetAsIcon = (shape: Shape) => shape.d(Unit / 2, Unit / 2)
export const clipAsIcon = (shape: Shape) => rect(Unit, Unit).clip(shape)

// ----------------------------------------------------------------------------

export type IconDef = Shape | Once<Shape>

interface ImageProps {
  img: IconDef
  width?: number
  height?: number
  zoom?: number
  rotate?: number
  className?: string
}

type Props = ImageProps & ColoringProps & PalettedProps & SmallProps & ClickableProps

export const Img = React.memo((props: Props) => {
  const { img, width, height, bg, fg, rotate, className } = props

  const small = useResolvedeSmall(props)
  const palette = useResolvedPalette(props)
  const fgClass = usePaletteClass({ fg })
  const clickableClass = useClickableClass(props, false)
  const paletteStyle = useColorStyle({ fg })

  let zoom: string | number | undefined = props.zoom
  if (zoom && small) zoom = `calc(20 / 30 * ${zoom})`

  const svg = (shape: Shape) =>
    shapeAsSvg(
      width || Unit,
      height || Unit,
      shape,
      cx(
        ImageStyle.get(),
        small && !zoom && smallC.get(),
        fgClass,
        clickableClass,
        className
      ),
      { ...paletteStyle, zoom }
    )

  if (bg) {
    const bg_ = bg instanceof Color ? bg.get(palette, palette.Bg) : palette.Bg
    const fg_ = fg instanceof Color ? fg.get(palette, palette.Fg) : palette.Fg
    const shape = iconBoxMemo.get([
      img instanceof Shape ? img : img.get(),
      bg_,
      fg_,
      rotate
    ])
    return svg(shape)
  }

  const shape = (img instanceof Once ? img.get() : img).named('fg')
  return svg(rotate ? shape.rotateOn(rotate, 15, 15) : shape)
})

// ----------------------------------------------------------------------------

export const ImageStyle = once(() => {
  const { uiFontS } = FontStyles.get()
  const { clickableC, hoveringSel } = ClickableStyling.get()

  const imgC = className('icon')

  imgC.style({
    flexShrink: 0,
    strokeWidth: 0,
    ...uiFontS.props,
    fontWeight: 500
  })

  const fg = (s: Rule) => s.selfOrSub(imgC).selfOrSub('.fg')

  fg(clickableC).style({
    transition: 'transform 200ms ease-out',
    transformOrigin: '15px 15px'
  })
  fg(hoveringSel).style({ transform: 'scale(1.15)' })

  return imgC
})

const smallC = once(() => style({ zoom: `calc(20 / 30)` }))

// ----------------------------------------------------------------------------

const iconBoxMemo = memo4(
  (icon: Shape, bg: Rgba, fg: Rgba, rotate?: number) =>
    layers(
      Blob.get().scaleOn(1.5, 15, 15).fill(bg).named('bg'),
      icon
        .scaleOn(0.9, 15, 15)
        .rotateOn(rotate ?? 0, 15, 15)
        .fill(fg)
        .stroke(fg)
        .named('fg') //
    ),
  (icon, bg, fg) => `${icon.name()}-${bg}-${fg}`
)
