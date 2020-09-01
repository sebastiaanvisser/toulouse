import { List } from 'immutable'
import * as React from 'react'
import { Box } from '../../box/Box'
import { Theme } from '../../box/Themed'
import { Unit } from '../../box/Unit'
import { Attach } from '../../dyn/Attach'
import { Icons } from '../../icon/Icons'
import { useValue, useVar, Var } from '../../lib/Var'
import { Shade } from '../../styling/Color'
import { Arctic, Cavern, Day, Desert, Lava, Night, Ocean } from '../../styling/Palette'
import { Balloon } from '../../widget/Balloon'
import { Icon } from '../../widget/Icon'
import { Label } from '../../widget/Label'
import { Panel } from '../../widget/Panel'
import { Tag } from '../../widget/Tag'

const pick = [Ocean, Arctic, Lava, Desert, Night, Cavern, Day]

const Block = ({ open, ix }: { open: Var<boolean>; ix: number }) => {
  const tooltip = (open: Var<boolean>) => {
    return (
      <Theme palette={pick[ix] ?? Lava}>
        <Balloon position="bottom" open={open} h>
          <Icon zoom={2} icon={Icons.Nautical} />
        </Balloon>
      </Theme>
    )
  }
  const isOpen = useValue(open)
  return (
    <Attach attachment={() => tooltip(open)}>
      <Box
        h
        width={480 / 8}
        height={Unit * 2}
        // fg={isOpen ? PrimaryColor : undefined}
        center
        middle
        button
        onMouseDown={() => open.toggle()}
        onMouseOver={ev => ev.altKey && open.set(true)}
      >
        {isOpen ? (
          <Tag align="auto" bg={Shade} rounded>
            <b>{ix}</b>
          </Tag>
        ) : (
          <Label center>{ix}</Label>
        )}
      </Box>
    </Attach>
  )
}

export function ManagedDemo() {
  const allOpen = useVar(List([false, false, false, false, false, false, false, false]))

  return (
    <Box h>
      <Panel h elevate sep>
        {allOpen.unlist().map((open, ix) => (
          <Block key={ix} open={open} ix={ix} />
        ))}
      </Panel>
    </Box>
  )
}
