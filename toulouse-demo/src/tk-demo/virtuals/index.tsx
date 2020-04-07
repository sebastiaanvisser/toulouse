import * as React from 'react'
import { Box, Unit } from 'toulouse/box'
import { CaretDown, Columns, Grid, Margin, Rows, Table } from 'toulouse/icon'
import { range, Use, useStoredVar } from 'toulouse/lib'
import { Alpha, Contrast, Hover, PrimaryColor, Shade } from 'toulouse/styling'
import {
  Balloon,
  Checkbox,
  Img,
  Label,
  OptionButtons,
  Panel,
  Slider,
  Tag,
  Tooltip
} from 'toulouse/widget'
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
                  <Img img={Rows} />
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
                  <Img img={Columns} />
                  <Label>Gallery</Label>
                </>
              )
            },
            {
              id: 'table',
              label: (isActive: boolean) => (
                <>
                  <Img fg={isActive ? true : Alpha(0.3)} img={Table} />
                  <Label>Table</Label>
                </>
              )
            },
            {
              id: 'grid',
              label: (
                <>
                  <Img img={Grid} />
                  <Label>Grid</Label>
                </>
              )
            },
            { id: 'dynamic', label: 'Dynamic' }
          ]}
        />
        <Checkbox
          attach={() => <Tooltip position="bottom">Show viewport region</Tooltip>}
          checked={settings.prop('debug')}
        >
          Debug
        </Checkbox>
        <Panel h button palette={Shade} attach={pickBlocked}>
          <Img img={Table} fg={PrimaryColor} />
          <Label>Blocked</Label>
          <Img img={CaretDown} />
        </Panel>
        <Panel h button palette={Shade} attach={pickMargin}>
          <Img img={Margin} fg={PrimaryColor} />
          <Use value={settings.prop('overflow')}>
            {m => (
              <Label>
                Overflow: {m.h},{m.v}
              </Label>
            )}
          </Use>
          <Img img={CaretDown} />
        </Panel>
      </Panel>
    )
  }

  const pickBlocked = () => {
    const block = settings.prop('block')
    return (
      <Balloon
        h
        palette={Contrast}
        width={Unit * 8}
        behavior="click"
        position="bottom"
        pad={5}
        margin={15}
      >
        <Slider width={Unit * 6} value={block} limit={range(-10, 10)} step={1} />
        <Tag margin bg={Hover} center>
          <Label>
            <Use value={block} />
          </Label>
        </Tag>
      </Balloon>
    )
  }

  const pickMargin = () => {
    const overflow = settings.prop('overflow')
    const { h, v } = overflow.unpack()
    return (
      <Balloon
        v
        palette={Contrast}
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
          <Tag margin bg={Hover} center>
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
          <Tag margin bg={Hover} center>
            <Label>
              <Use value={overflow}>{m => m.v}</Use>
            </Label>
          </Tag>
        </Box>
      </Balloon>
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
