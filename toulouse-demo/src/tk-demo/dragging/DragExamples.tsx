import React, { useEffect, useRef, useState } from 'react'
import { Box } from 'toulouse/box'
import * as C from 'toulouse/dyn'
import { Stage, useDrag } from 'toulouse/dyn'
import { Geom, geom, once, pt, range, Use, useValue, Var } from 'toulouse/lib'
import { cx, Fog, Primary, Indigo, Lava, Night, pct, Red, style } from 'toulouse/styling'
import { Checkbox, Label, OptionButtons, Panel, Slider, Tag } from 'toulouse/widget'

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
}

export function DragExamples(props: Props) {
  const Obstacles = useRef({
    frame1: geom(60 * 4, 120, 60 * 8, 60 * 7),
    frame2: geom(780, 60 * 2, 60 * 3, 60 * 5),
    bar1: geom(60 * 6, 60 * 7, 60 * 3, 60 * 3),
    bar2: geom(60 * 10, 60 * 3, 60 * 4, 60 * 7),
    sticks: [
      pt(60 * 5, 60 * 5),
      pt(60 * 5, 60 * 12),
      pt(60 * 10, 60 * 10),
      pt(60 * 15, 60 * 8),
      ...range(3, 12)
        .iterate()
        .map(y => pt(60 * 15, 60 * y))
    ],
    snaps: [
      ...range(2, 12)
        .iterate()
        .map(x => ({ p: pt(60 * x, 60 * 8), s: 20 })),
      { p: pt(60 * 7, 60 * 3), s: 40 },
      { p: pt(60 * 9, 60 * 3), s: 40 },
      { p: pt(60 * 7, 60 * 5), s: 40 },
      { p: pt(60 * 9, 60 * 5), s: 40 }
    ],
    lines: [
      { start: pt(60 * 2, 60 * 8), width: 60 * 9 },
      { start: pt(60 * 7, 60 * 3), width: 60 * 2 },
      { start: pt(60 * 7, 60 * 5), width: 60 * 2 }
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
      rubber
    } = settings.get()

    const pick =
      frame1 || frame2 || lines || stick
        ? C.oneOf(
            frame1 ? C.inside(st.frame1.toRect()) : C.none,
            frame2 ? C.inside(st.frame2.toRect()) : C.none,
            lines ? C.oneOf(...st.lines.map(l => C.hline(l.start, l.width))) : C.none,
            stick ? C.oneOf(...st.sticks.map(C.fixed)) : C.none
          )
        : C.free

    const con = C.solver(
      g => (g.top < 50 ? [] : undefined),
      pick,
      ...(snap ? st.snaps.map(({ p, s }) => C.snap(p, s)) : []),
      bar1 ? C.outside(st.bar1.toRect()) : C.free,
      bar2 ? C.outside(st.bar2.toRect()) : C.free,
      grid > 0 ? C.grid(grid) : C.free
    )

    return stage === 'update' && rubber ? C.rubber(con, 0.5) : con
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
              geom={geom(l.start.x, l.start.y - 2, l.width, 4)}
              className={cx(lineC)}
            />
          ))}
        {stick &&
          os.sticks.map((p, i) => (
            <Panel
              key={'s' + i}
              palette={Night}
              abs
              round
              geom={geom(p.x - 5, p.y - 5, 10, 10)}
              className={cx(allowSmallC)}
            />
          ))}
        {snap &&
          os.snaps.map(({ p, s }, i) => (
            <React.Fragment key={'m' + i}>
              <Panel
                bg={Red.alpha(0.05)}
                abs
                sharp
                geom={geom(p.x - s, p.y - s, s * 2, s * 2)}
                style={{ borderRadius: pct(50) }}
                className={cx(allowSmallC)}
              />
              <Panel
                palette={Lava}
                abs
                round
                geom={geom(p.x - 5, p.y - 5, 10, 10)}
                className={cx(allowSmallC)}
              />
            </React.Fragment>
          ))}
      </>
    )
  }

  return (
    <>
      {st.visible && obstacles()}
      <Panel
        abs
        sharp
        elem={setTarget}
        geom={st.target}
        palette={Primary}
        className={cx(allowSmallC)}
      />
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
    <Box v sep>
      <Box pad>
        <OptionButtons<number> small active={size} options={opts} />
      </Box>
      <Box>
        <Checkbox checked={settings.prop('visible')}>Visible</Checkbox>
      </Box>
      <Box>
        <Checkbox checked={settings.prop('frame1')}>Left frame</Checkbox>
        <Checkbox checked={settings.prop('frame2')}>Right frame</Checkbox>
        <Checkbox checked={settings.prop('bar1')}>Left obstacle</Checkbox>
        <Checkbox checked={settings.prop('bar2')}>Right obstacle</Checkbox>
        <Checkbox checked={settings.prop('stick')}>Stick to Points</Checkbox>
        <Checkbox checked={settings.prop('snap')}>Snap to Points</Checkbox>
        <Checkbox checked={settings.prop('lines')}>Lines</Checkbox>
        <Checkbox checked={settings.prop('rubber')}>Rubber band</Checkbox>
      </Box>
      <Box v>
        <Box h>
          <Label grow>Grid</Label>
          <Tag palette={Fog}>
            <Use value={settings.prop('grid')}>
              {g => <Label smallcaps>{g ? <>{g} px</> : <>off</>}</Label>}
            </Use>
          </Tag>
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
