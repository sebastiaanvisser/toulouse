import * as React from 'react'
import { Box } from '../../box/Box'
import { Theme } from '../../box/Themed'
import { Unit } from '../../box/Unit'
import { Attach } from '../../dyn/Attach'
import { Icons } from '../../icon/Icons'
import { range } from '../../lib/Range'
import { Use, useStoredVar } from '../../lib/Var'
import { Fg, Hovering, Primary } from '../../styling/Color'
import { Balloon, Tooltip } from '../../widget/Balloon'
import { Icon } from '../../widget/Icon'
import { Label } from '../../widget/Label'
import { OptionButtons } from '../../widget/OptionButtons'
import { Checkbox } from '../../widget/Options'
import { Panel } from '../../widget/Panel'
import { Slider } from '../../widget/Slider'
import { Tag } from '../../widget/Tag'
import { VirtualList } from './List'

type Demo = 'list' | 'gallery' | 'table' | 'grid' | 'dynamic'

interface Settings {
  demo: Demo
  debug: boolean
  overflow: { v: number; h: number }
  block: number
}

export function Virtuals() {
  const settings = useStoredVar<Settings>('tk-demo.virtual.settings', {
    demo: 'list' as Demo,
    debug: true,
    overflow: { h: 0, v: 0 },
    block: 1
  })

  const pick = (s: Settings) => {
    const props = {
      debug: s.debug,
      overflow: s.overflow,
      block: s.block
    }

    switch (s.demo) {
      case 'list':
        return <VirtualList {...props} />
      case 'gallery':
        return <Label>gallery</Label>
      case 'table':
        return <Label>table</Label>
      case 'grid':
        return <Label>virtual</Label>
      case 'dynamic':
        return <Label>dynamic</Label>
      default:
        return <Label>not implemented yet</Label>
    }
  }

  const toolbar = () => {
    return (
      <Panel pad h sharp spaced>
        <OptionButtons<Demo>
          active={settings.prop('demo')}
          options={[
            {
              id: 'list',
              label: (
                <>
                  <Icon icon={Icons.Rows} />
                  <Label>
                    <b>List</b>
                  </Label>
                </>
              )
            },
            {
              id: 'gallery',
              label: (
                <>
                  <Icon icon={Icons.Columns} />
                  <Label>Gallery</Label>
                </>
              )
            },
            {
              id: 'table',
              label: (isActive: boolean) => (
                <>
                  <Icon fg={isActive ? true : Fg.alpha(0.3)} icon={Icons.Table} />
                  <Label>Table</Label>
                </>
              )
            },
            {
              id: 'grid',
              label: (
                <>
                  <Icon icon={Icons.Grid} />
                  <Label>Grid</Label>
                </>
              )
            },
            { id: 'dynamic', label: 'Dynamic' }
          ]}
        />
        <Attach
          attachment={() => <Tooltip position="bottom">Show viewport region</Tooltip>}
        >
          <Checkbox border checked={settings.prop('debug')}>
            Debug
          </Checkbox>
        </Attach>
        <Attach attachment={pickBlocked}>
          <Panel h button border>
            <Icon icon={Icons.Table} fg={Primary} />
            <Label>Blocked</Label>
            <Icon icon={Icons.CaretDown} />
          </Panel>
        </Attach>
        <Attach attachment={pickMargin}>
          <Panel h border button>
            <Icon icon={Icons.Margin} fg={Primary} />
            <Use value={settings.prop('overflow')}>
              {m => (
                <Label>
                  Overflow: {m.h},{m.v}
                </Label>
              )}
            </Use>
            <Icon icon={Icons.CaretDown} />
          </Panel>
        </Attach>
      </Panel>
    )
  }

  const pickBlocked = () => {
    const block = settings.prop('block')
    return (
      <Theme contrast>
        <Balloon
          h
          width={Unit * 8}
          behavior="click"
          position="bottom"
          pad={5}
          margin={15}
        >
          <Slider width={Unit * 6} value={block} limit={range(-10, 10)} step={1} />
          <Tag margin bg={Hovering} center>
            <Label>
              <Use value={block} />
            </Label>
          </Tag>
        </Balloon>
      </Theme>
    )
  }

  const pickMargin = () => {
    const overflow = settings.prop('overflow')
    const { h, v } = overflow.unpack()
    return (
      <Theme contrast>
        <Balloon
          v
          width={Unit * 9}
          behavior="click"
          position="bottom"
          pad={5}
          margin={15}
        >
          <Box h>
            <Label>h:</Label>
            <Slider
              width={Unit * 6}
              value={h}
              limit={range(-200, 200)}
              // tick={10}
              snap={[0]}
              step={1}
            />
            <Tag margin bg={Hovering} center>
              <Label>
                <Use value={overflow}>{m => m.h}</Use>
              </Label>
            </Tag>
          </Box>
          <Box h>
            <Label>v:</Label>
            <Slider
              width={Unit * 6}
              value={v}
              limit={range(-200, 200)}
              // tick={10}
              snap={[0]}
              step={1}
            />
            <Tag margin bg={Hovering} center>
              <Label>
                <Use value={overflow}>{m => m.v}</Use>
              </Label>
            </Tag>
          </Box>
        </Balloon>
      </Theme>
    )
  }

  return (
    <Box v>
      {toolbar()}
      <Box h pad={Unit} spaced>
        <Use value={settings}>{pick}</Use>
      </Box>
    </Box>
  )
}
