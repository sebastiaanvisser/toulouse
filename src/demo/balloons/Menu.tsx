import React, { ReactNode, useEffect } from 'react'
import { Box, BoxProps } from '../../box/Box'
import { Theme } from '../../box/Themed'
import { Unit } from '../../box/Unit'
import { Attach } from '../../dyn/Attach'
import { Icons } from '../../icon/Icons'
import { useValue, useVar } from '../../lib/Var'
import { Fg, Primary } from '../../styling/Color'
import { Balloon } from '../../widget/Balloon'
import { Icon } from '../../widget/Icon'
import { Label } from '../../widget/Label'
import { Listbox } from '../../widget/Listbox'
import { Panel } from '../../widget/Panel'
import { DemoDef } from '../Demo'
import { lorem } from '../Lorem'

export function MenuDemo(props: { defs: DemoDef[] }) {
  const open = useVar(false)
  const active = useVar('tags')
  const isActive = useValue(active)

  const close = (_v: string) => window.setTimeout(() => open.set(false), 500)

  useEffect(() => active.effect(close), [])

  const { defs } = props

  const picker = () => (
    <Theme contrast>
      <Balloon
        bg
        v
        open={open}
        behavior="mousedown"
        width={t => t + 10}
        margin={0}
        handle={false}
        height={Unit * 16}
      >
        <Listbox<DemoDef, string>
          multi={false}
          required
          items={props.defs}
          selection={active}
          renderContainer={renderContainer}
          renderItem={renderItem}
          identify={identify}
          rowHeight={() => 50}
        />
      </Balloon>
    </Theme>
  )

  const identify = (d: DemoDef) => d.key

  const renderContainer = (children: ReactNode) => (
    <Box v sep>
      {children}
    </Box>
  )

  const renderItem = (def: DemoDef, props: BoxProps) => {
    return (
      <Attach attachment={() => help(def)}>
        <Box bg {...props} h pad>
          <Icon fg={Primary} icon={def.icon} />
          <Label grow>{def.label}</Label>
          <Icon fg={Fg.alpha(0.3)} icon={Icons.CaretRight} />
        </Box>
      </Attach>
    )
  }

  const help = (def: DemoDef) => {
    return (
      <Theme primary>
        <Balloon
          v
          position="right"
          bias={-1}
          behavior="hover"
          handle={false}
          margin={-10}
          width={210}
          sep
        >
          <Box h>
            <Icon icon={def.icon} />
            <Label smallcaps>{def.label}</Label>
          </Box>
          <Box>
            <Label>{lorem(4)}</Label>
          </Box>
        </Balloon>
      </Theme>
    )
  }

  const { label, icon } = defs.filter(d => d.key === isActive)[0]
  return (
    <Attach attachment={picker}>
      <Panel h button elevate debug="foo">
        <Icon fg={Primary} icon={icon} />
        <b>{label}</b>
        <Box grow />
        <Icon icon={Icons.CaretDown} />
      </Panel>
    </Attach>
  )
}
