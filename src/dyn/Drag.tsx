import isEqual from 'lodash.isequal'
import { DependencyList, useRef } from 'react'
import { Geom, Point, Rect } from '../lib/Geometry'
import { useEvent } from '../lib/Hooks'
import { useValue, Var } from '../lib/Var'
import { cx } from '../styling/Classy'
import { style } from '../styling/Rule'
import { measureAbsolute, measureRelative } from './Attach'
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

  // ------------------------------------------------------------------------
  // Event handlers

  const onBgDown = (ev: { clientX: number; clientY: number }) => {
    if (!target || !draggable) return

    const abs = measureAbsolute(target)
    const measured = mode === 'rel' ? measureRelative(target) : abs
    const start = measured.asRect
    const origin = abs.asRect.centroid

    const initial: DragState = {
      start,
      origin,
      delta: new Point(0, 0),
      place: start,
      dir: {},
      stage: 'start',
      type: 'drag'
    }

    state.set(initial)
    if (onStart) onStart(initial)

    onMouseMove(ev)

    if (typeof window !== 'undefined') {
      window.document.body.style.userSelect = 'none'
    }
  }

  const onMouseDown = (ev: { clientX: number; clientY: number }) => {
    if (!target || (!draggable && !resizable)) return

    const origin = new Point(ev.clientX, ev.clientY)
    const abs = measureAbsolute(target).asRect
    const start = mode === 'rel' ? measureRelative(target).asRect : abs
    const dir = resizable ? inResizeBorder(origin, abs) : {}

    if (!draggable && noDirection(dir)) return

    const type = resizable && anyDirection(dir) ? 'resize' : 'drag'

    const initial: DragState = {
      start,
      origin,
      delta: new Point(0, 0),
      place: start,
      dir,
      type,
      stage: 'start'
    }

    state.set(initial)
    if (onStart) onStart(initial)

    if (typeof window !== 'undefined') {
      window.document.body.style.userSelect = 'none'
    }
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
    const abs = measureAbsolute(target).asRect
    const dir = inResizeBorder(new Point(ev.clientX, ev.clientY), abs)
    hoverDir.set(dir)
  }

  const onTargetOut = (_ev: {}) => {
    if (hoverDir) hoverDir.set({})
  }

  const onMouseMove = (ev: { clientX: number; clientY: number }) => {
    state.modify(st => {
      if (!st) return
      return update(
        { ...st, stage: 'update' },
        new Point(ev.clientX, ev.clientY) //
      )
    })
  }

  const onMouseUp = (ev: { clientX: number; clientY: number }) => {
    state.modify(st => {
      if (!st) return
      st = { ...st, stage: 'finish' }
      const updated = update(st, new Point(ev.clientX, ev.clientY))
      if (onFinish) onFinish(updated)

      if (!isEqual(st.delta, new Point(0, 0))) window.setTimeout(done, delayOut || 0)
      else requestAnimationFrame(() => done())

      return updated
    })
  }

  const onKeyDown = (ev: KeyboardEvent) => {
    if (ev.code !== 'Escape') return

    state.modify(st => {
      if (!st) return
      st = { ...st, stage: 'cancel' }
      const updated = update(st, st.origin)
      if (onCancel) onCancel(updated)
      return updated
    })

    ev.preventDefault()
    window.setTimeout(done, delayOut || 0)
  }

  const done = () => {
    state.total()?.prop('stage').set('idle')

    if (typeof window !== 'undefined') {
      window.document.body.style.userSelect = 'auto'
    }

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
      const to = new Rect(
        dir.left ? Math.min(right, left + d.x) : left,
        dir.top ? Math.min(bottom, top + d.y) : top,
        dir.right ? Math.max(left, right + d.x) : right,
        dir.bottom ? Math.max(top, bottom + d.y) : bottom
      )

      place = run(con(stage), start, to, dir)
    }

    const updated = { ...st, delta: d, place }

    if (geom) geom.set(place.asGeom)
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

  if (typeof window !== 'undefined') {
    useEvent(document.body, 'mouseup', onMouseUp, isBusy, [isBusy])
    useEvent(document.body, 'mousemove', onMouseMove, isBusy, [isBusy])
    useEvent(document.body, 'keydown', onKeyDown, isBusy, [isBusy])
  }

  return state
}

// ----------------------------------------------------------------------------

const leftC = style({ cursor: 'w-resize' })
const topC = style({ cursor: 'n-resize' })
const rightC = style({ cursor: 'e-resize' })
const bottomC = style({ cursor: 's-resize' })

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
