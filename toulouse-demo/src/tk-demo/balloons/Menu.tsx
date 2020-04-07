import React, { ReactNode, useEffect } from 'react'
import { Box, Unit, BoxProps } from 'toulouse/box'
import { CaretDown, CaretRight } from 'toulouse/icon'
import { useValue, useVar } from 'toulouse/lib'
import { Contrast, Fg, Primary, PrimaryColor } from 'toulouse/styling'
import { Balloon, Img, Label, Listbox, Panel } from 'toulouse/widget'
import { DemoDef } from '../Demo'
import { lorem } from '../Lorem'

export function MenuDemo(props: { defs: DemoDef[] }) {
  const open = useVar(false)
  const active = useVar('tags')
  const isActive = useValue(active)

  const close = (_v: string) => window.setTimeout(() => open.set(false), 500)

  // eslint-disable-next-line
  useEffect(() => active.effect(close), [])

  const { defs } = props

  const picker = () => (
    <Balloon
      bg
      v
      palette={Contrast}
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
  )

  const identify = (d: DemoDef) => d.key

  const renderContainer = (children: ReactNode) => (
    <Box v sep>
      {children}
    </Box>
  )

  const renderItem = (def: DemoDef, props: BoxProps) => {
    return (
      <Box bg {...props} h pad attach={help(def)}>
        <Img fg={PrimaryColor} img={def.icon} />
        <Label grow>{def.label}</Label>
        <Img fg={Fg.alpha(0.3)} img={CaretRight} />
      </Box>
    )
  }

  const help = (def: DemoDef) => () => {
    return (
      <Balloon
        v
        palette={Primary}
        position="right"
        bias={-1}
        behavior="hover"
        handle={false}
        margin={-10}
        width={210}
        sep
      >
        <Box h>
          <Img img={def.icon} />
          <Label smallcaps>{def.label}</Label>
        </Box>
        <Box>
          <Label>{lorem(4)}</Label>
        </Box>
      </Balloon>
    )
  }

  const { label, icon } = defs.filter(d => d.key === isActive)[0]
  return (
    <Panel h button elevate attach={picker} width={Unit * 10} debug="foo">
      <Img fg={PrimaryColor} img={icon} />
      <b>{label}</b>
      <Box grow />
      <Img img={CaretDown} />
    </Panel>
  )
}
