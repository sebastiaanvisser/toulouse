import React, { useEffect, useRef, useState } from 'react'
import { Box } from '../../box/Box'
import { Small } from '../../box/Small'
import { Theme } from '../../box/Themed'
import { Unit } from '../../box/Unit'
import * as C from '../../dyn/Constraint'
import { Stage, useDrag } from '../../dyn/Drag'
import { Geom, Point } from '../../lib/Geometry'
import { range } from '../../lib/Range'
import { Use, useValue, Var } from '../../lib/Var'
import { cx, pct } from '../../styling/Classy'
import { Hovering, Indigo, Red } from '../../styling/Color'
import { style } from '../../styling/Rule'
import { Label } from '../../widget/Label'
import { OptionButtons } from '../../widget/OptionButtons'
import { Checkbox } from '../../widget/Options'
import { Panel } from '../../widget/Panel'
import { Slider } from '../../widget/Slider'
import { Tag } from '../../widget/Tag'

interface Props {
  bg?: HTMLElement
  settings: Var<Settings>
}

interface Settings {
  target: Geom
  visible: boolean
  frame1: boolean
  frame2: boolean
  bar1: boolean
  bar2: boolean
  stick: boolean
  snap: boolean
  lines: boolean
  grid: number
  rubber: boolean
  rubberN: number
}

export function DragConstraints(props: Props) {
  const Obstacles = useRef({
    frame1: new Geom(60 * 4, 120, 60 * 8, 60 * 7),
    frame2: new Geom(780, 60 * 2, 60 * 3, 60 * 5),
    bar1: new Geom(60 * 6, 60 * 7, 60 * 3, 60 * 3),
    bar2: new Geom(60 * 10, 60 * 3, 60 * 4, 60 * 7),
    sticks: [
      new Point(60 * 5, 60 * 5),
      new Point(60 * 5, 60 * 12),
      new Point(60 * 10, 60 * 10),
      new Point(60 * 15, 60 * 8),
      ...range(3, 12)
        .iterate()
        .map(y => new Point(60 * 15, 60 * y))
    ],
    snaps: [
      ...range(2, 12)
        .iterate()
        .map(x => ({ p: new Point(60 * x, 60 * 8), s: 20 })),
      { p: new Point(60 * 7, 60 * 3), s: 40 },
      { p: new Point(60 * 9, 60 * 3), s: 40 },
      { p: new Point(60 * 7, 60 * 5), s: 40 },
      { p: new Point(60 * 9, 60 * 5), s: 40 }
    ],
    lines: [
      { start: new Point(60 * 2, 60 * 8), width: 60 * 9 },
      { start: new Point(60 * 7, 60 * 3), width: 60 * 2 },
      { start: new Point(60 * 7, 60 * 5), width: 60 * 2 },
      { start: new Point(60 * 7, 60 * 3), height: 60 * 2 },
      { start: new Point(60 * 9, 60 * 3), height: 60 * 2 }
    ]
  }).current

  const [target, setTarget] = useState<HTMLElement>()

  const { bg, settings } = props

  const st = useValue(settings)

  useDrag(
    {
      bg,
      target,
      mode: 'rel',
      draggable: true,
      geom: settings.prop('target'),
      constraint
    },
    []
  )

  function constraint(stage: Stage) {
    const st = Obstacles
    const {
      frame1,
      frame2,
      bar1,
      bar2,
      grid,
      stick,
      snap,
      lines,
      rubber,
      rubberN
    } = settings.get()

    const pick =
      frame1 || frame2 || lines || stick
        ? C.oneOf(
            frame1 ? C.inside(st.frame1.asRect) : C.none,
            frame2 ? C.inside(st.frame2.asRect) : C.none,
            lines
              ? C.oneOf(
                  ...st.lines.map(l =>
                    l.width !== undefined
                      ? C.hline(l.start, l.width)
                      : C.vline(l.start, l.height)
                  )
                )
              : C.none,
            stick ? C.oneOf(...st.sticks.map(C.fixed)) : C.none
          )
        : C.free

    const con = C.solver(
      g => (g.top < 50 ? [] : undefined),
      pick,
      ...(snap ? st.snaps.map(({ p, s }) => C.snap(p, s)) : []),
      bar1 ? C.outside(st.bar1.asRect) : C.free,
      bar2 ? C.outside(st.bar2.asRect) : C.free,
      grid > 0 ? C.grid(grid) : C.free
    )

    return stage === 'update' && rubber ? C.rubber(con, rubberN) : con
  }

  const obstacles = () => {
    const { frame1, frame2, bar1, bar2, stick, snap, lines } = st
    const os = Obstacles
    return (
      <>
        {frame1 && <Box border inset bg abs sharp geom={os.frame1} />}
        {frame2 && <Box border inset bg abs sharp geom={os.frame2} />}
        {bar1 && <Panel abs sharp geom={os.bar1} bg={Indigo} />}
        {bar2 && <Panel abs sharp geom={os.bar2} bg={Indigo} />}
        {lines &&
          os.lines.map((l, i) => (
            <Panel
              key={'l' + i}
              abs
              geom={
                l.width !== undefined
                  ? new Geom(l.start.x - 2, l.start.y - 2, l.width + 4, 4)
                  : new Geom(l.start.x - 2, l.start.y - 2, 4, l.height + 4)
              }
              className={cx(lineC)}
            />
          ))}
        {stick &&
          os.sticks.map((p, i) => (
            <Theme night>
              <Panel
                key={'s' + i}
                abs
                round
                geom={new Geom(p.x - 5, p.y - 5, 10, 10)}
                className={cx(allowSmallC)}
              />
            </Theme>
          ))}
        {snap &&
          os.snaps.map(({ p, s }, i) => (
            <React.Fragment key={'m' + i}>
              <Panel
                bg={Red.alpha(0.05)}
                abs
                sharp
                geom={new Geom(p.x - s, p.y - s, s * 2, s * 2)}
                style={{ borderRadius: pct(50) }}
                className={cx(allowSmallC)}
              />
              <Theme lava>
                <Panel
                  abs
                  round
                  geom={new Geom(p.x - 5, p.y - 5, 10, 10)}
                  className={cx(allowSmallC)}
                />
              </Theme>
            </React.Fragment>
          ))}
      </>
    )
  }

  return (
    <>
      {st.visible && obstacles()}
      <Theme primary>
        <Panel abs sharp elem={setTarget} geom={st.target} className={cx(allowSmallC)} />
      </Theme>
    </>
  )
}

// ----------------------------------------------------------------------------

export function DragSettings({ settings }: { settings: Var<Settings> }) {
  const size = useRef(new Var(60)).current

  useEffect(() => void size.set(settings.get().target.width), [settings, size])

  useEffect(
    () =>
      size.effect(v => {
        const g = settings.prop('target')
        g.prop('width').set(v)
        g.prop('height').set(v)
      }),
    [settings, size]
  )

  const opts = [
    { id: 4, label: <Label smallcaps>xxs</Label> },
    { id: 10, label: <Label smallcaps>xs</Label> },
    { id: 20, label: <Label smallcaps>s</Label> },
    { id: 30, label: <Label smallcaps>l</Label> },
    { id: 60, label: <Label smallcaps>xl</Label> },
    { id: 90, label: <Label smallcaps>xxl</Label> }
  ]

  return (
    <Box v spaced>
      <Small>
        <Small>
          <OptionButtons<number> active={size} options={opts} />
        </Small>
      </Small>
      <Box v>
        <Checkbox checked={settings.prop('visible')}>Visible</Checkbox>
        <Checkbox checked={settings.prop('frame1')}>Left frame</Checkbox>
        <Checkbox checked={settings.prop('frame2')}>Right frame</Checkbox>
        <Checkbox checked={settings.prop('bar1')}>Left obstacle</Checkbox>
        <Checkbox checked={settings.prop('bar2')}>Right obstacle</Checkbox>
        <Checkbox checked={settings.prop('stick')}>Stick to Points</Checkbox>
        <Checkbox checked={settings.prop('snap')}>Snap to Points</Checkbox>
        <Checkbox checked={settings.prop('lines')}>Lines</Checkbox>
        <Box h>
          <Checkbox grow checked={settings.prop('rubber')}>
            Rubber band
          </Checkbox>
          <Slider
            small
            margin
            width={Unit * 3}
            value={settings.prop('rubberN')}
            dots={1}
            limit={range(0.1, 4)}
          />
        </Box>
      </Box>
      <Box v bg={Hovering} rounded>
        <Box h>
          <Label grow>Grid</Label>
          <Theme night>
            <Tag margin>
              <Use value={settings.prop('grid')}>
                {g => (
                  <Label fg smallcaps>
                    {g ? <>{g} px</> : <>off</>}
                  </Label>
                )}
              </Use>
            </Tag>
          </Theme>
        </Box>
        <Slider
          value={settings.prop('grid')}
          limit={range(0, 60)}
          step={10}
          stick={10}
          dots={10}
        />
      </Box>
    </Box>
  )
}

// ----------------------------------------------------------------------------

const lineC = style({
  minWidth: 'auto',
  minHeight: 'auto'
})

const allowSmallC = style({
  minWidth: 'auto',
  minHeight: 'auto'
})
