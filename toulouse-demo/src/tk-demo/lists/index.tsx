import * as React from 'react'
import { useStoredVar, useValue } from 'toulouse/lib'
import { Box, Unit } from 'toulouse/box'
import { px } from 'toulouse/styling'
import { Label, Panel, OptionButtons } from 'toulouse/widget'
import { CountryList } from './CountryList'
import { MenuList } from './Menu'

type Demo = 'panel' | 'menu'

export function Lists() {
  const demoVar = useStoredVar<Demo>('tk-demo.lists.demo', 'panel')
  const demo = useValue(demoVar)

  const todo = () => {
    return (
      <Label style={{ marginTop: px(100) }}>
        <p>
          <b>Todo:</b>
        </p>
        <ul>
          <li>Shadowy scroll indicators</li>
          <li>Active light gray cursor</li>
          <li>Arrow keys enter/space for selection</li>
          <li>Menu list with rounded items nice nice</li>
          <li>Item groups</li>
          <li>Sticky item group headers</li>
          <li>Interaction within item</li>
          <li>Stable selection position</li>
        </ul>
      </Label>
    )
  }

  const pick = () => {
    switch (demo) {
      case 'panel':
        return <CountryList />
      case 'menu':
        return <MenuList />
      default:
        return
    }
  }

  const toolbar = () => {
    return (
      <Panel pad h sharp spaced>
        <OptionButtons<Demo>
          active={demoVar}
          options={[
            { id: 'panel', label: 'Panel' },
            { id: 'menu', label: 'Menu' } //
          ]}
        />
      </Panel>
    )
  }

  return (
    <Box v>
      {toolbar()}
      <Box pad={Unit * 2}>
        {pick()}
        {todo()}
      </Box>
    </Box>
  )
}
