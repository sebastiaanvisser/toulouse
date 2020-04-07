import * as React from 'react'
import { Box, Unit } from 'toulouse/box'
import { CaretDown, MapMarker, Plus, Settings8, SmallCross } from 'toulouse/icon'
import { Use, Var } from 'toulouse/lib'
import { Blue, Indigo, px, Red } from 'toulouse/styling'
import {
  Balloon,
  Checkbox,
  Img,
  Label,
  Panel,
  QuickHover,
  ShortcutString,
  Tabs
} from 'toulouse/widget'
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

  balloon = (caption: string, info: string) => () => (
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
      <Box h width={100}>
        <Label grow>
          <ShortcutString char={shortcut} event={() => this.active.set(tab)}>
            {tab}
          </ShortcutString>
        </Label>
        {right}
      </Box>
    ),
    props: {
      attach: this.balloon(
        tab,
        `This is the ${tab.toLowerCase()} tab with a ton of useless information`
      )
    }
  })

  tabs() {
    return (
      <Box v width={Unit * 20}>
        <Use value={this.settings}>
          {settings => (
            <Tabs
              small={settings.small}
              rounded={settings.corner === 'rounded'}
              round={settings.corner === 'round'}
              sharp={settings.corner === 'sharp'}
              active={this.active}
              tabs={[
                this.mkTab(
                  'First',
                  'F',
                  <Box small pad>
                    <Img img={MapMarker} bg={Indigo} fg={Blue} />
                  </Box>
                ),
                this.mkTab('Second', 'S', <Img img={SmallCross} fg={Red} />),
                this.mkTab('Third', 'T', <Img img={CaretDown} />),
                { content: <Box grow /> },
                {
                  tab: 'Plus',
                  label: (
                    <Box h>
                      <Img img={Plus} />
                    </Box>
                  )
                },
                {
                  tab: 'Configure',
                  label: (
                    <Box h>
                      <Label>Configure</Label>
                      <Img fg={Red} img={Settings8} />
                    </Box>
                  )
                }
              ]}
            />
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
