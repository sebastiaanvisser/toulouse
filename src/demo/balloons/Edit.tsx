import * as React from 'react'
import { Small } from '../../box/Small'
import { Theme } from '../../box/Themed'
import { Attach } from '../../dyn/Attach'
import { Icons } from '../../icon/Icons'
import { Use, useValue, useVar, Var } from '../../lib/Var'
import { Green } from '../../styling/Color'
import { Day, Night } from '../../styling/Palette'
import { Balloon } from '../../widget/Balloon'
import { Icon } from '../../widget/Icon'
import { Input } from '../../widget/Input'
import { Label } from '../../widget/Label'
import { Panel } from '../../widget/Panel'
import { lorem } from '../Lorem'

export function EditDemo() {
  const focus = useVar(false)
  const val = useVar(lorem(3))
  const hasFocus = useValue(focus)

  const balloon = () => (
    <Small>
      <Theme palette={hasFocus ? Day : Night}>
        <Small>
          <Balloon bias={1} margin={10} open={new Var(true as boolean)} registry={false}>
            <Use value={val}>{v => <Label>Character count: {v.length}</Label>}</Use>
          </Balloon>
        </Small>
      </Theme>
    </Small>
  )

  return (
    <Panel h elevate outline={hasFocus}>
      <Icon fg={Green} icon={Icons.ChevronRight} />
      <Attach attachment={balloon}>
        <Input multiline focus={focus} value={val} />
      </Attach>
    </Panel>
  )
}
