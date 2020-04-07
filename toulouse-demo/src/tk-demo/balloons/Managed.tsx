import * as React from 'react'
import { Box, Unit } from 'toulouse/box'
import { Nautical } from 'toulouse/icon'
import { useValue, useVar, Var } from 'toulouse/lib'
import { Lava, PrimaryColor } from 'toulouse/styling'
import { Balloon, Img, Label, Panel } from 'toulouse/widget'

export function ManagedDemo() {
  const allOpen = useVar([false, false, false, false, false, false, false, false])

  const Block = ({ open, ix }: { open: Var<boolean>; ix: number }) => {
    const isOpen = useValue(open)
    return (
      <Box
        v
        width={480 / allOpen.get().length}
        height={Unit * 2}
        fg={isOpen ? PrimaryColor : undefined}
        center
        button
        attach={tooltip(open)}
        onMouseDown={() => open.toggle()}
        onMouseOver={ev => ev.altKey && open.set(true)}
      >
        <Label center>{isOpen ? <b>{ix}</b> : ix}</Label>
      </Box>
    )
  }

  const tooltip = (open: Var<boolean>) => () => {
    return (
      <Balloon position="bottom" palette={Lava} open={open} h>
        <Img zoom={2} img={Nautical} />
      </Balloon>
    )
  }

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
