import { memo1 } from '../lib/Memo'
import { cx } from '../styling/Classy'
import { Color } from '../styling/Color'
import { Palette } from '../styling/Palette'
import { Rgba } from '../styling/Rgba'
import { style } from '../styling/Rule'

// ----------------------------------------------------------------------------

export interface Props {
  bg?: ColorLike
  fg?: ColorLike
  opacity?: number
}

const bgC = memo1((c: Rgba) =>
  style({
    backgroundColor: c.toString()
  })
)

const fgC = memo1((c: Rgba) =>
  style({
    color: c.toString(),
    fill: c.toString()
  })
)

const opacityC = memo1((opacity: number) => style({ opacity }))

export function classes(props: Props, p: Palette): string {
  const { opacity } = props
  const fg = resolve(props.fg, p, p.Fg)
  const bg = resolve(props.bg, p, p.Bg)
  return cx(
    bg && bgC.get(bg),
    fg && fgC.get(fg),
    opacity !== undefined && opacityC.get(opacity) //
  )
}

// ----------------------------------------------------------------------------

type ColorLike = Rgba | Color | boolean | undefined | string

function resolve(c: ColorLike, palette: Palette, fallback: Rgba): Rgba | undefined {
  if (typeof c === 'string') return Rgba.fromHex(c)
  if (c instanceof Rgba) return c
  if (c instanceof Color) return c.get(palette)
  if (c === true) return fallback
  return
}
