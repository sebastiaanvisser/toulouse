import * as React from 'react'
import { Box } from '../../box/Box'
import { Theme } from '../../box/Themed'
import { Attach } from '../../dyn/Attach'
import { Icons } from '../../icon/Icons'
import { Balloon, BalloonPosition, Timing } from '../../widget/Balloon'
import { Icon } from '../../widget/Icon'
import { Label } from '../../widget/Label'
import { Panel } from '../../widget/Panel'

export function HoverDemo(props: { timing: Timing }) {
  const { timing } = props

  const options: [number, string, BalloonPosition][] = [
    [1, '1x', 'top'],
    [2, '2x', 'left'],
    [3, '3x', 'right'],
    [4, '4x', 'bottom']
  ]

  const tooltip = (p: BalloonPosition) => {
    return (
      <Theme ocean>
        <Balloon h timing={timing} position={p} behavior="hover">
          <Icon icon={Icons.ZoomIn} />
          <Label>Zoom</Label>
        </Balloon>
      </Theme>
    )
  }

  return (
    <Box h>
      <Panel v sep elevate width={60}>
        {options.map(([key, label, pos]) => (
          <Attach key={key} attachment={() => tooltip(pos)}>
            <Box button pad>
              <Label center>{label}</Label>
            </Box>
          </Attach>
        ))}
      </Panel>
    </Box>
  )
}
