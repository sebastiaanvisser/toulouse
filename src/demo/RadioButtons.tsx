import * as React from 'react'
import { Box } from '../box/Box'
import { Unit } from '../box/Unit'
import { Use, useVar, Var } from '../lib/Var'
import { Shade } from '../styling/Color'
import { Label } from '../widget/Label'
import { RadioButton } from '../widget/Options'
import { Panel } from '../widget/Panel'
import { ShortcutString } from '../widget/ShortcutString'
import { Tag } from '../widget/Tag'

export function RadioButtons() {
  const value = useVar(true)

  const header = (
    <Box h pad>
      <Label grow>
        <b>Radio Buttons Example</b>
      </Label>
      <Tag margin bg={Shade}>
        <Label>
          <Use value={value}>{v => (v ? '1' : '2')}</Use>
        </Label>
      </Tag>
    </Box>
  )

  const toggles = (
    <Box pad>
      <RadioButton checked={value} tabIndex={0}>
        <ShortcutString char="1" event={() => value.on()}>
          Option 1
        </ShortcutString>
      </RadioButton>
      <RadioButton checked={value.negation()} tabIndex={0}>
        <ShortcutString char="2" event={() => value.off()}>
          Option 2
        </ShortcutString>
      </RadioButton>
      <RadioButton disabled checked={new Var<boolean>(true)}>
        Disabled option
      </RadioButton>
      <RadioButton disabled checked={new Var<boolean>(true)}>
        Disabled option
      </RadioButton>
    </Box>
  )

  return (
    <Box v pad={Unit * 2} spaced>
      <Panel sep v elevate tabIndex={0} width={Unit * 10}>
        {header}
        {toggles}
      </Panel>
    </Box>
  )
}
