import * as React from 'react'
import { Box, Unit } from 'toulouse/box'
import { DefaultTiming, QuickHover, ReallySlow, SlowReveal } from 'toulouse/widget'
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
        <EditDemo />
      </Box>
      <MenuDemo defs={defs} />
      <ManagedDemo />
      <InlineDemo />
      <PositionDemo />
    </Box>
  </Box>
)
