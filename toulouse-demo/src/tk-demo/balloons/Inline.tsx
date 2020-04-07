import React, { useState } from 'react'
import { Unit } from 'toulouse/box'
import { Cross, Help, Search, Tick } from 'toulouse/icon'
import { once, Use, useValue, useVar } from 'toulouse/lib'
import {
  Contrast,
  cx,
  Cyan,
  Green,
  Orange,
  Primary,
  PrimaryColor,
  Shade,
  style
} from 'toulouse/styling'
import { Balloon, Img, Input, Label, Panel, Tag } from 'toulouse/widget'
import { lorem } from '../Lorem'

export function InlineDemo() {
  const [casei, setCasei] = useState(true)
  const needle = useVar('us')
  const focus = useVar(false)
  const hasFocus = useValue(focus)

  const content = (needle: string, c: boolean) => {
    const { PrimaryC } = Styles.get()
    const casei = (s: string) => (c ? s.toLowerCase() : s)
    needle = casei(needle)
    return lorem(8)
      .split(/\s+/g)
      .map((s, i) => (
        <React.Fragment key={i}>
          {casei(s).indexOf(needle) !== -1 ? (
            <Panel
              inline
              blunt
              button
              palette={Primary}
              className={cx(PrimaryC)}
              attach={balloon(s)}
            >
              <>{s}</>
            </Panel>
          ) : (
            s
          )}{' '}
        </React.Fragment>
      ))
  }

  const help = () => {
    return (
      <Balloon small position="top" bias={-1} open={focus} palette={Primary}>
        <Label smallcaps>Search fragments</Label>
      </Balloon>
    )
  }

  const balloon = (s: string) => () => {
    return (
      <Balloon palette={Contrast} rounded h behavior="click" position="top" pad={5}>
        <Panel button>
          <Img img={Cross} fg={Orange} />
        </Panel>
        <Panel button>
          <Img img={Tick} fg={Cyan} />
        </Panel>
        <Label smallcaps>{s}</Label>
        <Panel button>
          <Img img={Help} fg={Green} />
        </Panel>
      </Balloon>
    )
  }

  return (
    <Panel elevate width={Unit * 16} pad v spaced outline={hasFocus}>
      <Panel h inset border attach={help}>
        <Img img={Search} fg={PrimaryColor} />
        <Input value={needle} focus={focus} />
        <Tag
          button
          margin
          palette={casei ? Shade : Primary}
          onClick={() => setCasei(!casei)}
        >
          {casei || <Img img={Tick} />}
          <Label>Match case</Label>
        </Tag>
      </Panel>
      <Panel pad>
        <Label>
          <Use value={needle}>{n => content(n, casei)}</Use>
        </Label>
      </Panel>
    </Panel>
  )
}

// ----------------------------------------------------------------------------

const Styles = once(() => {
  return { PrimaryC: style({ padding: '0 4px' }) }
})
