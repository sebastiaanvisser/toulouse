import React, { useRef, useState } from 'react'
import { Box, Unit } from 'toulouse/box'
import {
  bounded,
  Direction,
  grid,
  inside,
  resizableClasses,
  rubber,
  solver,
  Stage,
  useDrag
} from 'toulouse/dyn'
import {
  Dialog,
  Dim,
  LowContrast,
  Pulse,
  Resize,
  Sliders,
  Tag,
  Target
} from 'toulouse/icon'
import { geom, Geom, Range, range, rect, Rect, Use, Var } from 'toulouse/lib'
import { Contrast, Fg } from 'toulouse/styling'
import {
  Balloon,
  BalloonPosition,
  Checkbox,
  Img,
  Label,
  Panel,
  RadioOptions,
  Slider
} from 'toulouse/widget'

const fmt2 = Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export function PositionDemo() {
  const hoverDir = useRef(new Var<Direction>({})).current

  const target = useRef(new Var(geom(120, 60, 240, 120))).current
  const container = useRef(new Var(rect(0, 0, 0, 0))).current
  const zoom = useRef(new Var(1.5)).current
  const count = useRef(new Var(3)).current
  const bias = useRef(new Var(1)).current
  const vertically = useRef(new Var(false)).current
  const position = useRef(new Var<BalloonPosition>('top')).current
  const small = useRef(new Var(false)).current
  const margin = useRef(new Var(10)).current
  const handle = useRef(new Var(true)).current

  const [elem, setElem] = useState<HTMLElement>()

  const settings = useRef(
    Var.pack({
      bias,
      count,
      zoom,
      vertically,
      position,
      small,
      margin,
      handle
    })
  ).current

  const con = (stage: Stage, r: Rect) => {
    let con = solver(
      inside(r.shrink(20)),
      grid(10),
      bounded(Range.from(Unit * 3), Range.from(Unit * 3)) //
    )
    return stage === 'update' ? rubber(con, 1) : con
  }

  const box = (o: { geom: Geom; classes: string }) => (
    <Panel
      v
      abs
      elevate
      center
      middle
      geom={o.geom}
      className={o.classes}
      elem={setElem}
      attach={balloon}
    >
      <Img img={Resize} zoom={2} />
    </Panel>
  )

  const toolbox = () => {
    return (
      <Balloon
        v
        palette={Contrast}
        behavior="click"
        position="right"
        bias={0.2}
        margin={20}
        width={Unit * 8}
        sep
      >
        <Box v>
          <Label smallcaps>Position</Label>
          <RadioOptions<BalloonPosition>
            values={[
              { key: 'left', label: 'Left' },
              { key: 'top', label: 'Top' },
              { key: 'right', label: 'Right' },
              { key: 'bottom', label: 'Bottom' }
            ]}
            value={position}
          />
        </Box>
        <Box v>
          <Box h>
            <Label smallcaps grow>
              Margin
            </Label>
            <Use value={margin}>{margin => <Label subtle>{margin}</Label>}</Use>
          </Box>
          <Slider value={margin} limit={range(-100, 100)} snap={[0]} step={5} />
        </Box>
        <Box v>
          <Box h>
            <Label smallcaps grow>
              Position
            </Label>
            <Use value={bias}>{bias => <Label subtle>{fmt2.format(bias)}</Label>}</Use>
          </Box>
          <Slider
            value={bias}
            limit={range(-1.6, 1.6)}
            snap={[-1, 0, 1]}
            tick={[-1, 0, 1]}
            step={0.01}
          />
        </Box>
        <Box v>
          <Box h>
            <Label smallcaps grow>
              Icons
            </Label>
            <Use value={count}>{count => <Label subtle>{count}</Label>}</Use>
          </Box>
          <Slider value={count} limit={range(1, 8)} dots={1} step={1} />
        </Box>
        <Box v>
          <Box h>
            <Label smallcaps grow>
              Icon zoom
            </Label>
            <Use value={zoom}>{zoom => <Label subtle>{zoom}</Label>}</Use>
          </Box>
          <Slider value={zoom} limit={range(1, 4)} dots={1} step={0.5} />
        </Box>
        <Box>
          <Checkbox checked={handle}>Handle</Checkbox>
          <Checkbox checked={vertically}>Vertically</Checkbox>
          <Checkbox checked={small}>Small</Checkbox>
        </Box>
      </Balloon>
    )
  }

  useDrag(
    {
      target: elem,
      mode: 'rel',
      draggable: true,
      resizable: true,
      geom: target,
      hoverDir,
      constraint: stage => con(stage, container.get())
    },
    []
  )

  const balloon = () => {
    const list = [Target, Tag, Dim, Sliders, Pulse, LowContrast, Dialog]
    return (
      <Use value={settings}>
        {({ vertically, position, bias, small, count, zoom, margin, handle }) => (
          <Balloon
            v={vertically}
            h={!vertically}
            key={position}
            open={new Var(true as boolean)}
            position={position}
            bias={bias}
            margin={margin}
            palette={Contrast}
            small={small}
            handle={handle}
            registry={false}
            sep
          >
            {list.slice(0, count).map((x, i) => (
              <Box key={i} button>
                <Img zoom={zoom} img={x} />
              </Box>
            ))}
          </Balloon>
        )}
      </Use>
    )
  }

  return (
    <Box
      rel
      h
      center
      width={Unit * 16}
      blunt
      inset
      bg={Fg.alpha(0.1)}
      measureSize={d => container.set(rect(0, 0, d.width, d.height))}
    >
      <Box abs right={10} top={10} button attach={toolbox}>
        <Img img={Sliders} />
      </Box>
      <Box v center height={Unit * 8}>
        <Use
          value={Var.pack({
            geom: target,
            classes: hoverDir.map(resizableClasses)
          })}
        >
          {box}
        </Use>
      </Box>
    </Box>
  )
}
