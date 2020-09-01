import { memo1, pt } from '../lib'
import { Color, Hover, Palette, Rgba } from '../styling'
import { className, cx, insetShadow, px } from '../styling'
import { PalettedProps, useResolvedPalette } from './Paletted'

export interface BorderProps {
  glow?: boolean | Color
  outline?: boolean | Color
  border?: boolean
  elevate?: boolean
  shadow?: boolean
  inset?: boolean
}

export function useBorderClass(props: BorderProps & PalettedProps) {
  const palette = useResolvedPalette(props)
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
  (props: BorderProps & { palette: Palette }) => {
    const { glow, outline, border, shadow, elevate, inset, palette } = props
    const { Black, Primary } = palette
    const prim = Primary().Bg

    const shadows: string[] = []

    if (inset) shadows.push(insetShadow(Black.alpha(0.05), 2, 0, pt(1, 1)))

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

    if (border) shadows.push(boxShadow(Hover.get(palette), 0, 1))

    if (outline) {
      const color = outline instanceof Color ? outline.get(palette, prim) : prim
      shadows.push(boxShadow(color, 0, 2))
    }

    if (glow) {
      const color =
        glow instanceof Color ? glow.get(palette, prim.alpha(0.3)) : prim.alpha(0.3)
      shadows.push(boxShadow(color, 0, 4))
    }

    return className('border', {
      transition: 'box-shadow 150ms ease',
      boxShadow: shadows.join()
    })
  },
  props => ({ ...props, palette: props.palette.name })
)
