import * as React from 'react'
import { Box, BoxProps } from '../box/Box'
import { useResolvedPalette } from '../box/Paletted'
import { layers, rect, shapeAsDataUri } from '../icon/Shape'
import { memo1 } from '../lib/Memo'
import { Palette } from '../styling'
import { className, cx, pct } from '../styling/Css'
import { Rgba } from '../styling/Rgba'

interface Props extends BoxProps {
  grid?: boolean
}

export function Backdrop(props: Props) {
  const { className, grid, ...rest } = props
  const palette = useResolvedPalette(props)
  const { backdropC, gridC } = BackdropStyles.get(palette)
  return <Box rel className={cx(className, backdropC, grid && gridC)} {...rest} />
}

// ----------------------------------------------------------------------------

export const BackdropStyles = memo1((palette: Palette) => {
  const backdropC = className('backdrop')
  const gridC = className('backdrop-grid')

  backdropC.style({
    backgroundColor: palette.Hover.toString()
  })

  gridC.style({
    backgroundImage: gridImg(o => palette.Fg.alpha(o)),
    backgroundSize: '60px 60px',
    height: pct(100)
  })

  return { backdropC, gridC }
})

function gridImg(clr: (opacity: number) => Rgba) {
  const line = (n: number, d: number, o: number) =>
    rect(1, 60)
      .dy(30)
      .array(n, (s, i) => s.dx(i * d))
      .clone(s => s.rotate(90).dx(60))
      .fill(clr(o))

  return shapeAsDataUri(
    60,
    60,
    layers(
      line(7, 10, 0.02),
      line(3, 30, 0.03),
      line(3, 60, 0.04)
      //
    )
  )
}
