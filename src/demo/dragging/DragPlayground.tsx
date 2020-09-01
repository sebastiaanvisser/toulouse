import React, { useRef, useState } from 'react'
import { Theme } from '../../box/Themed'
import { Unit } from '../../box/Unit'
import * as C from '../../dyn/Constraint'
import { DragState, newDragState, resizableClasses, Stage, useDrag } from '../../dyn/Drag'
import { Icons } from '../../icon/Icons'
import { Geom, Point, Rect } from '../../lib/Geometry'
import { Range_ } from '../../lib/Range'
import { useValue, Var } from '../../lib/Var'
import { cx } from '../../styling/Classy'
import { Hovering, Primary } from '../../styling/Color'
import {
  Arctic,
  Day,
  Desert,
  Fog,
  Lava,
  Night,
  Ocean,
  Palette
} from '../../styling/Palette'
import { Icon } from '../../widget/Icon'
import { Panel } from '../../widget/Panel'

const m = Unit * 4
const outer = new Rect(0, 0, Unit * 37, Unit * 30)
const inner = outer.margin(-m)
const bump = outer.margin(-m * 3).move(new Point(Unit * 2, 0))

interface Def {
  id: number
  st: Var<DragState | undefined>
  palette: Palette
  icon: any
  geom: Var<Geom>
}

interface Props {
  rubber: boolean
  draggable: boolean
  resizable: boolean
}

export function DragPlayground(props: Props) {
  const outsiders: Def[] = useRef(
    [
      { palette: Day, icon: Icons.Pattern },
      { palette: Night, icon: Icons.LowContrast },
      { palette: Lava, icon: Icons.Contrast },
      { palette: Desert, icon: Icons.Bright },
      { palette: Ocean, icon: Icons.Eye },
      { palette: Arctic, icon: Icons.Virtual },
      { palette: Fog, icon: Icons.Dialog }
    ].map((v, id) => ({
      ...v,
      id,
      st: newDragState(),
      geom: new Var(new Geom(150 + 120 * id, 810, Unit * 3, Unit * 3))
    }))
  ).current

  const insiders: Def[] = useRef(
    [
      { palette: Day, icon: Icons.Balloon },
      { palette: Night, icon: Icons.Nautical },
      { palette: Lava, icon: Icons.ZoomIn },
      { palette: Desert, icon: Icons.Pulse },
      { palette: Ocean, icon: Icons.Camera },
      { palette: Arctic, icon: Icons.Resize },
      { palette: Fog, icon: Icons.MapMarker }
    ].map((v, id) => ({
      ...v,
      id,
      st: newDragState(),
      geom: new Var(new Geom(Unit * 4 + 120 * id, Unit * 4, Unit * 3, Unit * 3))
    }))
  ).current

  const avoidEachother = (self: number, others: Def[]): C.Constraint[] =>
    others.filter(v => v.id !== self).map(v => C.outside(v.geom.get().asRect))

  const cIn = (stage: Stage, self: number) => {
    const { rubber } = props
    const con = C.solver(
      C.inside(inner),
      C.outside(bump),
      ...avoidEachother(self, insiders),
      C.grid(30),
      C.bounded(Range_.from(30), Range_.from(30))
    )
    return stage === 'update' && rubber ? C.rubber(con, 1) : con
  }

  const cOut = (stage: Stage, self: number) => {
    const { rubber } = props
    const con = C.solver(
      C.inside(outer),
      C.outside(inner),
      ...avoidEachother(self, outsiders),
      C.grid(30),
      C.bounded(Range_.from(30), Range_.from(30))
    )
    return stage === 'update' && rubber ? C.rubber(con, 1) : con
  }

  const { draggable, resizable } = props

  return (
    <>
      <Panel abs sharp geom={inner.asGeom} />
      <Panel abs sharp geom={bump.asGeom} bg={Hovering} />
      {outsiders.map(box => (
        <Block
          key={box.id}
          box={box}
          constraint={stage => cOut(stage, box.id)}
          draggable={draggable}
          resizable={resizable}
        />
      ))}
      {insiders.map(box => (
        <Block
          key={box.id}
          box={box}
          constraint={stage => cIn(stage, box.id)}
          draggable={draggable}
          resizable={resizable}
        />
      ))}
    </>
  )
}

interface BlockProps {
  box: Def
  constraint: (stage: Stage) => C.Constraint
  draggable: boolean
  resizable: boolean
}

function Block(props: BlockProps) {
  const { box, constraint, draggable, resizable } = props
  const { palette, icon, st } = box

  const [target, setTarget] = useState<HTMLElement>()
  const hoverDir = useRef<Var<C.Direction>>(new Var({})).current
  const hd = useValue(hoverDir)
  const geom = useValue(box.geom)
  const isDragging = useValue(st.map(s => s && s.stage !== 'idle'))

  useDrag(
    {
      target,
      mode: 'rel',
      draggable: draggable,
      resizable: resizable,
      state: st,
      geom: box.geom,
      constraint: constraint,
      hoverDir: hoverDir
    },
    []
  )

  return (
    <Theme palette={palette}>
      <Panel
        h
        abs
        elevate={isDragging}
        shadow={!isDragging}
        center
        middle
        z={isDragging}
        elem={setTarget}
        geom={geom}
        className={cx(resizableClasses(hd))}
      >
        <Icon
          fg={Primary}
          zoom={Math.round(Math.min(geom.width, geom.height) / 30)}
          icon={icon}
        />
      </Panel>
    </Theme>
  )
}
