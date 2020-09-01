import React, { useState } from 'react'
import { Small } from '../../box/Small'
import { Theme } from '../../box/Themed'
import { Unit } from '../../box/Unit'
import { Attach } from '../../dyn/Attach'
import { Icons } from '../../icon/Icons'
import { Use, useValue, useVar } from '../../lib/Var'
import { Cyan, Green, Orange, Primary, Shade } from '../../styling/Color'
import { Arctic } from '../../styling/Palette'
import { Balloon } from '../../widget/Balloon'
import { Icon } from '../../widget/Icon'
import { Input } from '../../widget/Input'
import { Label, Inline } from '../../widget/Label'
import { Panel } from '../../widget/Panel'
import { Tag } from '../../widget/Tag'
import { lorem } from '../Lorem'

export function InlineDemo() {
  const [casei, setCasei] = useState(true)
  const needle = useVar('us')
  const focus = useVar(false)
  const hasFocus = useValue(focus)

  const content = (needle: string, c: boolean) => {
    const casei = (s: string) => (c ? s.toLowerCase() : s)
    needle = casei(needle)
    return lorem(8)
      .split(/\s+/g)
      .map((s, i) => (
        <React.Fragment key={i}>
          {casei(s).indexOf(needle) !== -1 ? (
            <Theme primary>
              <Attach attachment={balloon(s)}>
                <Inline
                  bg
                  fg
                  inline
                  blunt
                  button
                  style={{ boxShadow: `0 0 0 1px ${Arctic.Blue}` }}
                >
                  <>{s}</>
                </Inline>
              </Attach>
            </Theme>
          ) : (
            s
          )}{' '}
        </React.Fragment>
      ))
  }

  const help = () => {
    return (
      <Small>
        <Theme primary>
          <Balloon position="top" bias={-1} open={focus}>
            <Label smallcaps>Search fragments</Label>
          </Balloon>
        </Theme>
      </Small>
    )
  }

  const balloon = (s: string) => () => {
    return (
      <Theme contrast>
        <Balloon rounded h behavior="click" position="top" pad={5}>
          <Icon rounded button icon={Icons.Cross} fg={Orange} />
          <Icon rounded button icon={Icons.Tick} fg={Cyan} />
          <Label smallcaps>{s}</Label>
          <Icon rounded button icon={Icons.Help} fg={Green} />
        </Balloon>
      </Theme>
    )
  }

  return (
    <Panel elevate width={Unit * 16} pad v spaced outline={hasFocus}>
      <Attach attachment={help}>
        <Panel h inset border>
          <Icon icon={Icons.Search} fg={Primary} />
          <Input value={needle} focus={focus} />
          <Theme primary={!casei}>
            <Tag button bg={Shade} margin onClick={() => setCasei(!casei)}>
              {casei || <Icon icon={Icons.Tick} />}
              <Label>Match case</Label>
            </Tag>
          </Theme>
        </Panel>
      </Attach>
      <Panel pad>
        <Label>
          <Use value={needle}>{n => content(n, casei)}</Use>
        </Label>
      </Panel>
    </Panel>
  )
}
