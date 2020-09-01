import * as React from 'react'
import { Box } from '../../box/Box'
import { Unit } from '../../box/Unit'
import { Blue, Fg, Green, Primary, Red } from '../../styling/Color'
import { Panel } from '../../widget/Panel'
import { Spinner, SpinnerType } from '../../widget/Spinner'

export function SpinnerDemo() {
  const zooms = [1, 2, 3, 4, 4]
  const images: SpinnerType[] = ['tail', 'segment', 'dots']
  const colors = [Blue, Red, Green, Fg, Primary]

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
