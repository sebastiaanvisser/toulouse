import isEqual from 'lodash.isequal'
import { DependencyList, useRef } from 'react'
import { measureAbsolute, measureRelative } from '../box/Measure'
import { useEvent, useValue } from '../lib'
import { Geom, Point, pt, Rect, rect } from '../lib/Geometry'
import { Var } from '../lib/Var'
import { className, cx } from '../styling/Css'
import { anyDirection, Constraint, Direction, free, noDirection, run } from './Constraint'

export type Stage = 'start' | 'update' | 'cancel' | 'finish' | 'idle'

export interface DragState {
  start: Rect
  origin: Point
  delta: Point
  place: Rect
  stage: Stage
  dir: Direction
  type: 'drag' | 'resize'
}

export const newDragState = () => new Var<DragState | undefined>(undefined)

export interface DragCallbacks {
  onStart: (st: DragState) => void
  onUpdate: (st: DragState) => void
  onFinish: (st: DragState) => void
  onCancel: (st: DragState) => void
  onDone: (st: DragState) => void
}

export interface DragProps extends Partial<DragCallbacks> {
  draggable?: boolean
  resizable?: boolean

  target: HTMLElement | undefined
  handle?: HTMLElement
  bg?: HTMLElement
  mode: 'abs' | 'rel'
  geom?: Var<Geom>
  state?: Var<DragState | undefined>

  delayOut?: number
  constraint?: (s: Stage) => Constraint
  hoverDir?: Var<Direction>
}

export function useDrag(props: DragProps, deps: DependencyList = []) {
  const {
    bg,
    delayOut,
    constraint,
    geom,
    hoverDir,
    target,
    resizable,
    mode,
    draggable,
    onStart,
    onCancel,
    onDone,
    onUpdate,
    onFinish
  } = props

  const state = useRef(props.state ?? new Var<DragState | undefined>(undefined)).current
  const isBusy = useValue(state.map(s => s !== undefined && s.stage !== 'idle'))

  const handle = props.handle ?? target
  const edit = state.edit().total()

  // ------------------------------------------------------------------------
  // Event handlers

  const onBgDown = (ev: { clientX: number; clientY: number }) => {
    if (!target || !draggable) return

    const abs = measureAbsolute(target)
    const measured = mode === 'rel' ? measureRelative(target) : abs
    const start = measured.toRect()
    const origin = abs.toRect().centroid()

    const initial: DragState = {
      start,
      origin,
      delta: pt(0, 0),
      place: start,
      dir: {},
      stage: 'start',
      type: 'drag'
    }

    state.set(initial)
    if (onStart) onStart(initial)

    onMouseMove(ev)

    window.document.body.style.userSelect = 'none'
  }

  const onMouseDown = (ev: { clientX: number; clientY: number }) => {
    if (!target || (!draggable && !resizable)) return

    const origin = pt(ev.clientX, ev.clientY)
    const abs = measureAbsolute(target).toRect()
    const start = mode === 'rel' ? measureRelative(target).toRect() : abs
    const dir = resizable ? inResizeBorder(origin, abs) : {}

    if (!draggable && noDirection(dir)) return

    const type = resizable && anyDirection(dir) ? 'resize' : 'drag'

    const initial: DragState = {
      start,
      origin,
      delta: pt(0, 0),
      place: start,
      dir,
      type,
      stage: 'start'
    }

    state.set(initial)
    if (onStart) onStart(initial)

    window.document.body.style.userSelect = 'none'
  }

  const inResizeBorder = (p: Point, abs: Rect): Direction => {
    const { x, y } = p

    var m = 10
    const ins = p.inside(abs)
    if (!ins) return {}

    let dir: Direction = {}
    if (Math.abs(abs.left - x) <= m) dir.left = true
    if (Math.abs(abs.right - x) <= m) dir.right = true
    if (Math.abs(abs.top - y) <= m) dir.top = true
    if (Math.abs(abs.bottom - y) <= m) dir.bottom = true

    return dir
  }

  const onTargetMove = (ev: { clientX: number; clientY: number }) => {
    if (!target || !hoverDir || !resizable) return
    const abs = measureAbsolute(target).toRect()
    const dir = inResizeBorder(pt(ev.clientX, ev.clientY), abs)
    hoverDir.set(dir)
  }

  const onTargetOut = (_ev: {}) => {
    if (hoverDir) hoverDir.set({})
  }

  const onMouseMove = (ev: { clientX: number; clientY: number }) => {
    if (state.get()?.stage !== 'finish')
      state
        .edit()
        .total()
        .modify(st =>
          update(
            { ...st, stage: 'update' },
            pt(ev.clientX, ev.clientY) //
          )
        )
  }

  const onMouseUp = (ev: { clientX: number; clientY: number }) => {
    edit.modify(st => {
      st = { ...st, stage: 'finish' }
      const updated = update(st, pt(ev.clientX, ev.clientY))
      if (onFinish) onFinish(updated)

      if (!isEqual(st.delta, pt(0, 0))) window.setTimeout(done, delayOut || 0)
      else requestAnimationFrame(() => done())

      return updated
    })
  }

  const onKeyDown = (ev: KeyboardEvent) => {
    if (ev.code !== 'Escape') return

    edit.modify(st => {
      st = { ...st, stage: 'cancel' }
      const updated = update(st, st.origin)
      if (onCancel) onCancel(updated)
      return updated
    })

    ev.preventDefault()
    window.setTimeout(done, delayOut || 0)
  }

  const done = () => {
    edit.prop('stage').set('idle')
    window.document.body.style.userSelect = 'auto'

    const st = state.get()
    if (st && onDone) onDone(st)
  }

  // ------------------------------------------------------------------------

  const update = (st: DragState, p: Point): DragState => {
    const { dir, start, origin, stage } = st
    const con = constraint || (() => free)
    const d = p.sub(origin)

    let place: Rect = st.place

    if (st.type === 'drag') {
      const to = start.move(d)
      place = run(con(stage), start, to, dir)
    } else if (!noDirection(dir)) {
      const { left, right, top, bottom } = start
      const to = rect(
        dir.left ? Math.min(right, left + d.x) : left,
        dir.top ? Math.min(bottom, top + d.y) : top,
        dir.right ? Math.max(left, right + d.x) : right,
        dir.bottom ? Math.max(top, bottom + d.y) : bottom
      )

      place = run(con(stage), start, to, dir)
    }

    const updated = { ...st, delta: d, place }

    if (geom) geom.set(place.toGeom())
    if (onUpdate) onUpdate(updated)

    return updated
  }

  useEvent(handle, 'mousedown', onMouseDown, true, [
    ...deps,
    draggable,
    resizable,
    handle
  ])
  useEvent(bg, 'mousedown', onBgDown, !!bg, [...deps, draggable, resizable, handle, bg])
  useEvent(handle, 'mousemove', onTargetMove, !!hoverDir, [...deps, handle])
  useEvent(handle, 'mouseout', onTargetOut, !!hoverDir, [...deps, handle])

  const { body } = document
  useEvent(body, 'mouseup', onMouseUp, isBusy, [isBusy])
  useEvent(body, 'mousemove', onMouseMove, isBusy, [isBusy])
  useEvent(body, 'keydown', onKeyDown, isBusy, [isBusy])

  return state
}

// ----------------------------------------------------------------------------

const leftC = className('left')
const topC = className('top')
const rightC = className('right')
const bottomC = className('bottom')

leftC.style({ cursor: 'w-resize' })
topC.style({ cursor: 'n-resize' })
rightC.style({ cursor: 'e-resize' })
bottomC.style({ cursor: 's-resize' })

topC.self(leftC).style({ cursor: 'nw-resize' })
topC.self(rightC).style({ cursor: 'ne-resize' })
bottomC.self(leftC).style({ cursor: 'sw-resize' })
bottomC.self(rightC).style({ cursor: 'se-resize' })

export function resizableClasses(dir: Direction): string {
  return cx(
    dir.left && leftC,
    dir.top && topC,
    dir.right && rightC,
    dir.bottom && bottomC //
  )
}
