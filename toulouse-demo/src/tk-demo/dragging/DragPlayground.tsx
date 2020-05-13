import React, { useRef, useState } from 'react'
import { Unit } from 'toulouse/box'
import * as C from 'toulouse/dyn'
import { DragState, newDragState, resizableClasses, Stage, useDrag } from 'toulouse/dyn'
import {
  Balloon,
  Bright,
  Camera,
  Contrast,
  Dialog,
  Eye,
  LowContrast,
  MapMarker,
  Nautical,
  Pattern,
  Pulse,
  Resize,
  Virtual,
  ZoomIn
} from 'toulouse/icon'
import { Geom, geom, once, pt, Range, rect, useValue, Var } from 'toulouse/lib'
import {
  Arctic,
  cx,
  Day,
  Desert,
  Fog,
  Lava,
  Night,
  Ocean,
  Palette,
  Hover,
  style
} from 'toulouse/styling'
import { IconDef, Img, Panel } from 'toulouse/widget'

const m = Unit * 4
const outer = rect(0, 0, Unit * 37, Unit * 30)
const inner = outer.shrink(m)
const bump = outer.shrink(m * 3).move(pt(Unit * 2, 0))

interface Def {
  id: number
  st: Var<DragState | undefined>
  palette: Palette
  icon: IconDef
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
      { palette: Day, icon: Pattern },
      { palette: Night, icon: LowContrast },
      { palette: Lava, icon: Contrast },
      { palette: Desert, icon: Bright },
      { palette: Ocean, icon: Eye },
      { palette: Arctic, icon: Virtual },
      { palette: Fog, icon: Dialog }
    ].map((v, id) => ({
      ...v,
      id,
      st: newDragState(),
      geom: new Var(geom(150 + 120 * id, 810, Unit * 3, Unit * 3))
    }))
  ).current

  const insiders: Def[] = useRef(
    [
      { palette: Day, icon: Balloon },
      { palette: Night, icon: Nautical },
      { palette: Lava, icon: ZoomIn },
      { palette: Desert, icon: Pulse },
      { palette: Ocean, icon: Camera },
      { palette: Arctic, icon: Resize },
      { palette: Fog, icon: MapMarker }
    ].map((v, id) => ({
      ...v,
      id,
      st: newDragState(),
      geom: new Var(geom(Unit * 4 + 120 * id, Unit * 4, Unit * 3, Unit * 3))
    }))
  ).current

  const avoidEachother = (self: number, others: Def[]): C.Constraint[] =>
    others.filter(v => v.id !== self).map(v => C.outside(v.geom.get().toRect()))

  const cIn = (stage: Stage, self: number) => {
    const { rubber } = props
    const con = C.solver(
      C.inside(inner),
      C.outside(bump),
      ...avoidEachother(self, insiders),
      C.grid(30),
      C.bounded(Range.from(30), Range.from(30))
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
      C.bounded(Range.from(30), Range.from(30))
    )
    return stage === 'update' && rubber ? C.rubber(con, 1) : con
  }

  const { draggable, resizable } = props

  return (
    <>
      <Panel abs sharp geom={inner.toGeom()} />
      <Panel abs sharp geom={bump.toGeom()} bg={Hover} />
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
    <Panel
      h
      abs
      elevate={isDragging}
      shadow={!isDragging}
      center
      middle
      z={isDragging}
      palette={palette}
      elem={setTarget}
      geom={geom}
      className={cx(resizableClasses(hd))}
    >
      <Img zoom={Math.round(Math.min(geom.width, geom.height) / 30)} img={icon} />
    </Panel>
  )
}
