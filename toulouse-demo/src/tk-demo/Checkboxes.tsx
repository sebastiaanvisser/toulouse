import React from 'react'
import { useVar, Var, Use } from 'toulouse/lib'
import { Checkbox, Label, ShortcutString, Panel, Tag } from 'toulouse/widget'
import { Box, Unit } from 'toulouse/box'
import { Shade } from 'toulouse/styling'

export function Checkboxes() {
  const focus0 = useVar(false)
  const focus1 = useVar(false)
  const value0 = useVar(true)
  const value1 = useVar(false)

  const header = (
    <Box h pad>
      <Label grow>
        <b>Checkboxes example</b>
      </Label>
      <Box small margin h spaced>
        <Use value={value0}>{v => v && <Tag palette={Shade}>1</Tag>}</Use>
        <Use value={value1}>{v => v && <Tag palette={Shade}>2</Tag>}</Use>
      </Box>
    </Box>
  )

  const toggles = (
    <Box pad>
      <Checkbox checked={value0} focus={focus0} tabIndex={0}>
        <ShortcutString char="1" event={() => value0.toggle()}>
          Checkbox 1
        </ShortcutString>
      </Checkbox>
      <Checkbox checked={value1} focus={focus1} tabIndex={0}>
        <ShortcutString char="2" event={() => value1.toggle()}>
          Checkbox 2
        </ShortcutString>
      </Checkbox>
      <Checkbox disabled checked={new Var<boolean>(true)}>
        Disabled checked
      </Checkbox>
      <Checkbox disabled checked={new Var<boolean>(true)}>
        Disabled unchecked
      </Checkbox>
    </Box>
  )

  return (
    <Box v pad={Unit * 2} spaced>
      <Panel v elevate tabIndex={1} width={Unit * 10} sep>
        {header}
        {toggles}
      </Panel>
    </Box>
  )
}
