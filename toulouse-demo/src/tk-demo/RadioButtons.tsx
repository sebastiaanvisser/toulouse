import * as React from 'react'
import { Box, Unit } from 'toulouse/box'
import { Use, useVar, Var } from 'toulouse/lib'
import { Shade } from 'toulouse/styling'
import { Label, Panel, RadioButton, ShortcutString, Tag } from 'toulouse/widget'

export function RadioButtons() {
  const focus0 = useVar(false)
  const focus1 = useVar(false)
  const value = useVar(true)

  const header = (
    <Box h pad>
      <Label grow>
        <b>Radio Buttons Example</b>
      </Label>
      <Tag margin palette={Shade}>
        <Label>
          <Use value={value}>{v => (v ? '1' : '2')}</Use>
        </Label>
      </Tag>
    </Box>
  )

  const toggles = (
    <Box pad>
      <RadioButton checked={value} focus={focus0} tabIndex={0}>
        <ShortcutString char="1" event={() => value.on()}>
          Option 1
        </ShortcutString>
      </RadioButton>
      <RadioButton checked={value.negation()} focus={focus1} tabIndex={0}>
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
      <Panel sep v elevate tabIndex={1} width={Unit * 10}>
        {header}
        {toggles}
      </Panel>
    </Box>
  )
}
