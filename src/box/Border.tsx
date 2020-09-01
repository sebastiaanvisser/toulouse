import { Point } from '../lib/Geometry'
import { memo1 } from '../lib/Memo'
import { cx, insetShadow, px } from '../styling/Classy'
import { Color, Hovering } from '../styling/Color'
import { Palette } from '../styling/Palette'
import { Rgba } from '../styling/Rgba'
import { style } from '../styling/Rule'

export interface Props {
  glow?: boolean | Color
  outline?: boolean | Color
  border?: boolean
  elevate?: boolean
  shadow?: boolean
  inset?: boolean
}

export function classes(props: Props, palette: Palette) {
  const { glow, outline, border, shadow, elevate, inset } = props
  const hasBorderProp = !!(glow || outline || border || shadow || elevate || inset)

  return cx(
    hasBorderProp &&
      BorderStyles.get({ glow, outline, border, shadow, elevate, inset, palette })
  )
}

const boxShadow = (clr: Rgba, blur: number, spread = 0, x = 0, y = 0) =>
  [px(x), px(y), px(blur), px(spread), clr.toString()].join(' ')

const BorderStyles = memo1(
  (props: Props & { palette: Palette }) => {
    const { glow, outline, border, shadow, elevate, inset, palette } = props
    const { Black } = palette
    const prim = palette.Primary().Bg

    const shadows: string[] = []

    if (inset) shadows.push(insetShadow(Black.alpha(0.05), 2, 0, new Point(1, 1)))

    if (shadow)
      shadows.push(
        boxShadow(Black.alpha(0.1), 10, 0, 0, 2),
        boxShadow(Black.alpha(0.05), 5, 0, 0, 2)
      )

    if (elevate)
      shadows.push(
        boxShadow(Black.alpha(0.2), 30, 0, 0, 10),
        boxShadow(Black.alpha(0.1), 5, 0, 0, 2)
      )

    if (border) shadows.push(boxShadow(Hovering.get(palette), 0, 1))

    if (outline) {
      const color = outline instanceof Color ? outline.get(palette) : prim
      shadows.push(boxShadow(color, 0, 2))
    }

    if (glow) {
      const color = glow instanceof Color ? glow.get(palette) : prim.alpha(0.3)
      shadows.push(boxShadow(color, 0, 4))
    }

    return style({
      // transition: 'box-shadow 150ms ease',
      boxShadow: shadows.join()
    }).name('border')
  },
  props => ({ ...props, palette: props.palette.name })
)
