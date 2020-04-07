import * as React from 'react'
import { ZoomIn } from 'toulouse/icon'
import { Contrast } from 'toulouse/styling'
import { Balloon, BalloonPosition, Label, Timing, Img, Panel } from 'toulouse/widget'
import { Box } from 'toulouse/box'

export function HoverDemo(props: { timing: Timing }) {
  const { timing } = props

  const options: [number, string, BalloonPosition][] = [
    [1, '1x', 'top'],
    [2, '2x', 'left'],
    [3, '3x', 'right'],
    [4, '4x', 'bottom']
  ]

  const tooltip = (p: BalloonPosition) => () => {
    return (
      <Balloon palette={Contrast} h timing={timing} position={p} behavior="hover">
        <Img img={ZoomIn} />
        <Label>Zoom</Label>
      </Balloon>
    )
  }

  return (
    <Box h>
      <Panel v sep elevate width={60}>
        {options.map(([key, label, pos]) => (
          <Box button pad key={key} attach={tooltip(pos)}>
            <Label center>{label}</Label>
          </Box>
        ))}
      </Panel>
    </Box>
  )
}
