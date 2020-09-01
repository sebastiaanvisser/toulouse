import React, { useRef, useState } from 'react'
import { Box } from '../../box/Box'
import { Small } from '../../box/Small'
import { Theme } from '../../box/Themed'
import { Unit } from '../../box/Unit'
import { Attach, useGeom } from '../../dyn/Attach'
import {
  bounded,
  Direction,
  free,
  grid,
  inside,
  rubber,
  solver
} from '../../dyn/Constraint'
import { resizableClasses, Stage, useDrag } from '../../dyn/Drag'
import { Icons } from '../../icon/Icons'
import { Geom, Rect } from '../../lib/Geometry'
import { range, Range_ } from '../../lib/Range'
import { Use, useVar, Var } from '../../lib/Var'
import { Fg, Primary } from '../../styling/Color'
import { Balloon, BalloonPosition } from '../../widget/Balloon'
import { Icon } from '../../widget/Icon'
import { Label } from '../../widget/Label'
import { Checkbox, RadioOptions } from '../../widget/Options'
import { Panel } from '../../widget/Panel'
import { Slider } from '../../widget/Slider'

const fmt2 = Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export function PositionDemo() {
  const hoverDir = useRef(new Var<Direction>({})).current

  const target = useVar(new Geom(120, 60, 240, 120))
  const zoom = useRef(new Var(1.5)).current
  const count = useRef(new Var(3)).current
  const bias = useRef(new Var(1)).current
  const vertically = useRef(new Var(false)).current
  const position = useRef(new Var<BalloonPosition>('top')).current
  const small = useRef(new Var(false)).current
  const margin = useRef(new Var(10)).current
  const handle = useRef(new Var(true)).current

  const [containerElem, setContainerElem] = useState<HTMLElement>()
  const [elem, setElem] = useState<HTMLElement>()
  const container = useGeom(containerElem)

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
      inside(r.margin(-20)),
      grid(10),
      bounded(Range_.from(Unit * 3), Range_.from(Unit * 3)) //
    )
    return stage === 'update' ? rubber(con, 1) : con
  }

  const box = (o: { geom: Geom; classes: string }) => (
    <Attach attachment={balloon}>
      <Panel
        v
        abs
        elevate
        center
        middle
        geom={o.geom}
        className={o.classes}
        elem={setElem}
      >
        <Icon icon={Icons.Resize} zoom={2} />
      </Panel>
    </Attach>
  )

  const toolbox = () => {
    return (
      <Theme contrast>
        <Balloon
          v
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
      </Theme>
    )
  }

  const balloon = () => {
    const list = [
      Icons.Target,
      Icons.Tag,
      Icons.Dim,
      Icons.Sliders,
      Icons.Pulse,
      Icons.LowContrast,
      Icons.Dialog
    ]
    return (
      <Use value={settings}>
        {({ vertically, position, bias, small, count, zoom, margin, handle }) => (
          <Theme contrast>
            <Small small={small}>
              <Balloon
                pad={zoom * 5}
                rounded
                v={vertically}
                h={!vertically}
                key={position}
                open={new Var(true as boolean)}
                position={position}
                bias={bias}
                margin={margin}
                handle={handle}
                registry={false}
                sep
              >
                {list.slice(0, count).map((x, i) => (
                  <Icon
                    key={i}
                    rounded
                    rotate={45}
                    button
                    fg={Primary}
                    zoom={zoom}
                    icon={x}
                  />
                ))}
              </Balloon>
            </Small>
          </Theme>
        )}
      </Use>
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
      constraint: stage => {
        const d = container.get() ?? Rect.zero
        return containerElem ? con(stage, new Rect(0, 0, d.width, d.height)) : free
      }
    },
    []
  )

  return (
    <Box
      rel
      h
      center
      width={Unit * 16}
      blunt
      inset
      bg={Fg.alpha(0.1)}
      elem={setContainerElem}
    >
      <Attach attachment={toolbox}>
        <Box abs right={10} top={10} button>
          <Icon icon={Icons.Sliders} />
        </Box>
      </Attach>
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
