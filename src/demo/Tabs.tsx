import * as React from 'react'
import { Box } from '../box/Box'
import { Small } from '../box/Small'
import { Unit } from '../box/Unit'
import { Attach } from '../dyn/Attach'
import { Icons } from '../icon/Icons'
import { Use, Var } from '../lib/Var'
import { px } from '../styling/Classy'
import { Blue, Indigo, Red } from '../styling/Color'
import { Balloon, QuickHover } from '../widget/Balloon'
import { Icon } from '../widget/Icon'
import { Label } from '../widget/Label'
import { Checkbox } from '../widget/Options'
import { Panel } from '../widget/Panel'
import { ShortcutString } from '../widget/ShortcutString'
import { Tabs } from '../widget/Tabs'
import { lorem } from './Lorem'
import { Corner, CornerPicker } from './shared/CornerPicker'

export class TabsDemo extends React.Component {
  active = new Var('First')
  small = new Var(false)
  corner = new Var<Corner>('auto')

  settings = Var.pack({
    small: this.small,
    corner: this.corner
  })

  render(): React.ReactNode {
    return (
      <Box v>
        {this.toolbar()}
        <Box pad={Unit * 2} spaced v>
          <Box h>{this.tabs()}</Box>
        </Box>
      </Box>
    )
  }

  toolbar() {
    return (
      <Panel sep h sharp>
        <Box pad spaced h>
          <Checkbox checked={this.small}>Small</Checkbox>
          <CornerPicker corner={this.corner} />
        </Box>
      </Panel>
    )
  }

  balloon = (caption: string, info: string) => (
    <Balloon
      // theme={t => t.contrast()}
      width={200}
      behavior="hover"
      position="bottom"
      handle={false}
      timing={QuickHover}
      pad={5}
      margin={0}
    >
      <Label>
        <strong>{caption}</strong>
        <br />
        <div>{info}</div>
      </Label>
    </Balloon>
  )

  mkTab = (tab: string, shortcut: string, right?: React.ReactNode) => ({
    tab,
    label: (
      <Attach
        attachment={() =>
          this.balloon(
            tab,
            `This is the ${tab.toLowerCase()} tab with a ton of useless information`
          )
        }
      >
        <Box h width={100}>
          <Label grow>
            <ShortcutString char={shortcut} event={() => this.active.set(tab)}>
              {tab}
            </ShortcutString>
          </Label>
          {right}
        </Box>
      </Attach>
    )
  })

  tabs() {
    return (
      <Box v width={Unit * 20}>
        <Use value={this.settings}>
          {settings => (
            <Small small={settings.small}>
              <Tabs
                rounded={settings.corner === 'rounded'}
                round={settings.corner === 'round'}
                sharp={settings.corner === 'sharp'}
                active={this.active.partial()}
                tabs={[
                  this.mkTab(
                    'First',
                    'F',
                    <Small>
                      <Icon margin blunt icon={Icons.MapMarker} bg={Indigo} fg={Blue} />
                    </Small>
                  ),
                  this.mkTab('Second', 'S', <Icon icon={Icons.SmallCross} fg={Red} />),
                  this.mkTab('Third', 'T', <Icon icon={Icons.CaretDown} />),
                  { content: <Box grow /> },
                  {
                    tab: 'Plus',
                    label: (
                      <Box h>
                        <Icon icon={Icons.Plus} />
                      </Box>
                    )
                  },
                  {
                    tab: 'Configure',
                    label: (
                      <Box h>
                        <Label>Configure</Label>
                        <Icon fg={Red} icon={Icons.Settings8} />
                      </Box>
                    )
                  }
                ]}
              />
            </Small>
          )}
        </Use>
        <Panel elevate pad style={{ minHeight: px(Unit * 15) }}>
          <Use value={this.active}>{this.content}</Use>
        </Panel>
      </Box>
    )
  }

  content = (active: string) => {
    switch (active) {
      case 'First':
        return this.first()
      case 'Second':
        return this.second()
      case 'Third':
        return this.third()
      default:
        return <Label mono>{active}</Label>
    }
  }

  first() {
    return <Label>{lorem(10)}</Label>
  }

  second() {
    return <Label>{lorem(4)}</Label>
  }

  third() {
    return <Label>{lorem(8)}</Label>
  }
}
