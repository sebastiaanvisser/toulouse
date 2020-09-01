import * as React from 'react'
import { Box, BoxProps } from '../box/Box'
import { usePalette } from '../box/Themed'
import { Shape, shapeAsDataUri } from '../icon/Shape'
import { memo1 } from '../lib/Memo'
import { cx } from '../styling/Classy'
import { Palette } from '../styling/Palette'
import { Rgba } from '../styling/Rgba'
import { style } from '../styling/Rule'

interface Props extends BoxProps {
  grid?: boolean
}

export function Backdrop(props: Props) {
  const { className, grid, ...rest } = props
  const palette = usePalette()
  const gridC = BackdropStyles.get(palette)
  return <Box scroll rel bg className={cx(className, grid && gridC)} {...rest} />
}

// ----------------------------------------------------------------------------

export const BackdropStyles = memo1((p: Palette) =>
  style({
    backgroundImage: gridImg(o => p.Fg.alpha(o)),
    backgroundSize: '60px 60px'
  })
)

function gridImg(clr: (opacity: number) => Rgba) {
  const line = (n: number, d: number, o: number) =>
    Shape.rect(1, 60)
      .dy(30)
      .array(n, (s, i) => s.dx(i * d))
      .clone(s => s.rotate(90).dx(60))
      .fill(clr(o))

  return shapeAsDataUri(
    60,
    60,
    Shape.layers(
      line(7, 10, 0.02),
      line(3, 30, 0.03),
      line(3, 60, 0.04) //
    )
  )
}
