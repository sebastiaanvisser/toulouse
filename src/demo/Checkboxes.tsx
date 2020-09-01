import { List } from 'immutable'
import React from 'react'
import { Box } from '../box/Box'
import { Small } from '../box/Small'
import { Unit } from '../box/Unit'
import { Use, useVar1, Var } from '../lib/Var'
import { Shade } from '../styling/Color'
import { Label } from '../widget/Label'
import { Checkbox } from '../widget/Options'
import { Panel } from '../widget/Panel'
import { ShortcutString } from '../widget/ShortcutString'
import { Tag } from '../widget/Tag'

export function Checkboxes() {
  const [values] = useVar1(List([true, false, true, false]))

  const header = (
    <Box h pad>
      <Label grow>
        <b>Checkboxes example</b>
      </Label>
      <Small>
        <Box margin h spaced>
          {values.unlist().map((v, i) => (
            <Use key={i} value={v}>
              {v => v && <Tag bg={Shade}>{i}</Tag>}
            </Use>
          ))}
        </Box>
      </Small>
    </Box>
  )

  const toggles = (
    <Box pad>
      {values.unlist().map((v, i) => (
        <Checkbox key={i} checked={v} tabIndex={0}>
          <ShortcutString char="1" event={() => v.toggle()}>
            {`Checkbox ${i}`}
          </ShortcutString>
        </Checkbox>
      ))}
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
      <Panel v elevate tabIndex={0} width={Unit * 10} sep>
        {header}
        {toggles}
      </Panel>
    </Box>
  )
}
