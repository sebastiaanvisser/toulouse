import * as React from 'react'
import { Box } from '../../box/Box'
import { Unit } from '../../box/Unit'
import { DefaultTiming, QuickHover, ReallySlow, SlowReveal } from '../../widget/Balloon'
import { DemoDef } from '../Demo'
import { EditDemo } from './Edit'
import { HoverDemo } from './Hover'
import { InlineDemo } from './Inline'
import { ManagedDemo } from './Managed'
import { MenuDemo } from './Menu'
import { PositionDemo } from './Position'

export const Balloons = ({ defs }: { defs: DemoDef[] }) => (
  <Box pad={Unit * 2}>
    <Box v spaced>
      <Box h spaced style={{ alignItems: 'start' }}>
        <HoverDemo timing={QuickHover} />
        <HoverDemo timing={DefaultTiming} />
        <HoverDemo timing={SlowReveal} />
        <HoverDemo timing={ReallySlow} />
      </Box>
      <Box width={360} v spaced={Unit * 2}>
        <EditDemo />
        <MenuDemo defs={defs} />
      </Box>
      <ManagedDemo />
      <InlineDemo />
      <PositionDemo />
    </Box>
  </Box>
)
