import * as React from 'react'
import { Box, Unit } from 'toulouse/box'
import { Blue, Fg, Green, PrimaryColor, Red } from 'toulouse/styling'
import { Panel, Spinner, SpinnerType } from 'toulouse/widget'

export function SpinnerDemo() {
  const zooms = [1, 2, 3, 4, 4]
  const images: SpinnerType[] = ['tail', 'segment', 'dots']
  const colors = [Blue, Red, Green, Fg, PrimaryColor]

  const single = (img: SpinnerType, zoom: number, ix: number) => (
    <Box key={ix} v spaced>
      <Panel>
        <Spinner
          zoom={zoom}
          spinner={img}
          fg={colors[ix]}
          thickness={1 + 1 / zoom}
          speed={500 * zoom}
        />
      </Panel>
    </Box>
  )

  return (
    <Box pad={Unit * 3} v spaced={30}>
      {images.map(img => (
        <Box key={img} h spaced={30}>
          {zooms.map((zoom, ix) => single(img, zoom, ix))}
        </Box>
      ))}
    </Box>
  )
}
