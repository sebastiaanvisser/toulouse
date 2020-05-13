import React, { createContext, ReactNode, useContext, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Box, BoxProps } from '../box/Box'
import { getMargin, measureAbsolute } from '../box/Measure'
import { useValue } from '../lib'
import { Geom, geom, Rect } from '../lib/Geometry'
import { Var } from '../lib/Var'
import { className, cx, important, px, style } from '../styling/Css'
import { Constraint, free } from './Constraint'
import { DragCallbacks, DragState, Stage, useDrag } from './Drag'

export interface SortState {
  srcIx: number
  dragSt: DragState
  targetIx: number
  targetGeom: Geom
}

export interface Manager extends Partial<DragCallbacks> {
  el?: HTMLElement
  geom: Geom | undefined
  itemGeom: Geom[]
  itemMargin: Rect[]
  state?: SortState
  onSorted: (st: SortState) => void
}

export const initialManager = () =>
  new Var<Manager>({
    geom: undefined,
    itemGeom: [],
    itemMargin: [],
    state: undefined,
    onSorted: () => {}
  })

const Context = createContext(initialManager())

export const useSortable = (onSorted: (st: SortState) => void): Var<Manager> => {
  const manager = useRef(initialManager()).current
  manager.prop('onSorted').set(onSorted)
  return manager
}

export function move<A>(xs: A[], src: number, dest: number): A[] {
  if (src < dest) {
    const a = xs.slice(0, src)
    const b = xs.slice(src + 1, dest + 1)
    const c = xs.slice(dest + 1)
    return [...a, ...b, xs[src], ...c]
  }
  if (dest < src) {
    const a = xs.slice(0, dest)
    const b = xs.slice(dest, src)
    const c = xs.slice(src + 1)
    return [...a, xs[src], ...b, ...c]
  }
  return xs
}

// ----------------------------------------------------------------------------

interface SortableProps {
  manager: Var<Manager>
  ghost?: (ix: number, targetIx: number, geom: Geom) => ReactNode
  children?: ReactNode
}

// ----------------------------------------------------------------------------

export function SortableContainer(props: SortableProps & BoxProps) {
  const { h, manager, height, width, className, children, ...rest } = props

  const size = useValue(manager.prop('geom').map(g => g && (h ? g.width : g.height)))
  const animate = useValue(
    manager.map(m => m.state?.dragSt.stage).map(s => s === 'update' || s === 'cancel')
  )

  const container = (
    <Box
      h={h}
      className={cx(className, containerC, animate && animateC)}
      height={h ? height : size}
      width={h ? size : width}
      elem={props.manager.edit().prop('el').set}
      {...rest}
    >
      {children}
    </Box>
  )

  return (
    <Context.Provider value={manager}>
      {container}
      <Ghost {...props} manager={manager} />
    </Context.Provider>
  )
}

// ----------------------------------------------------------------------------

function Ghost(props: SortableProps & { h?: boolean; manager: Var<Manager> }) {
  const st = useValue(props.manager.prop('state'))

  if (!st) return null

  const { h, children, ghost } = props
  const { dragSt, targetIx, srcIx } = st
  const { stage, start, place } = dragSt

  if (stage === 'idle') return null

  const from = start.toGeom()
  const { left, top, bottom, right } = st.targetGeom.toRect()

  let g = place.toGeom()

  if (stage === 'cancel') g = start.toGeom()
  if (stage === 'finish')
    g = geom(
      h ? (targetIx <= srcIx ? left : right - g.width) : from.left,
      h ? from.top : targetIx <= srcIx ? top : bottom - g.height,
      from.width,
      from.height
    )

  return ReactDOM.createPortal(
    <Box className={cx(ghostC, stage)} abs geom={g}>
      {ghost ? ghost(st.srcIx, st.targetIx, g) : (children as any)[st.srcIx]}
    </Box>,
    document.getElementById('overlay') as HTMLElement
  )
}

// ----------------------------------------------------------------------------

const computeTransform = (dir: 'h' | 'v', index: number) => (
  manager: Manager
): string | undefined => {
  const { state } = manager

  if (!state) return

  const { targetIx, srcIx, dragSt } = state
  const { place } = dragSt

  const m = manager.itemMargin[srcIx]

  if (dragSt.stage !== 'idle')
    if (index < srcIx ? targetIx <= index : targetIx < index)
      return dir === 'v'
        ? `translate3d(0,${px(place.height() + (m.top + m.bottom))},0)`
        : `translate3d(${px(place.width() + (m.left + m.right))},0,0)`
}

function computeSortState(
  index: number,
  dir: 'h' | 'v',
  manager: Manager,
  dragSt: DragState
): SortState {
  const { itemGeom } = manager
  const { left, top, bottom, right } = dragSt.place
  const srcIx = index

  for (let i = 0; i < srcIx; i++) {
    const g = itemGeom[i]
    const v = dir === 'v' && g.top + g.height / 2 >= top
    const h = dir === 'h' && g.left + g.width / 2 >= left
    if (v || h) return { dragSt, srcIx, targetIx: i, targetGeom: g }
  }

  for (let i = itemGeom.length - 1; i > srcIx; i--) {
    const g = itemGeom[i]
    const v = dir === 'v' && g.top + g.height / 2 <= bottom
    const h = dir === 'h' && g.left + g.width / 2 <= right
    if (v || h) return { dragSt, srcIx, targetIx: i, targetGeom: g }
  }

  return { dragSt, srcIx, targetIx: srcIx, targetGeom: itemGeom[srcIx] }
}

function measure(manager: Var<Manager>) {
  const { el } = manager.get()
  if (!el) return

  const geom = measureAbsolute(el)
  const itemGeom: Geom[] = []
  const itemMargin: Rect[] = []

  for (let child of el.children) {
    itemGeom.push(measureAbsolute(child as HTMLElement))
    itemMargin.push(getMargin(child as HTMLElement))
  }

  manager.modify(m => ({ ...m, geom, itemGeom, itemMargin }))
}

// ----------------------------------------------------------------------------

interface SortableItemProps extends BoxProps {
  index: number
  margin?: number
  dir: 'h' | 'v'
  constraint?: (stage: Stage, geom: Geom, items: Geom[]) => Constraint
}

export function SortableItem(props: SortableItemProps) {
  const manager = useContext(Context)
  const [ref, setRef] = useState<HTMLElement>()

  const { index, dir, style, constraint, children } = props

  const enabled = () => {
    const st = manager.get().state
    return st ? st.dragSt.stage === 'idle' : true
  }

  const constraint1 = () => {
    const { state, geom, itemGeom } = manager.get()
    const stage = state ? state.dragSt.stage : 'idle'
    return constraint && geom ? constraint(stage, geom, itemGeom) : free
  }

  const onStart = (st: DragState) => {
    measure(manager)
    onUpdate(st)
  }

  const onDone = (st: DragState) => {
    onUpdate(st)
    const { onSorted, state } = manager.get()
    if (state) onSorted(state)
  }

  const onUpdate = (dragSt: DragState) => {
    const sortState = computeSortState(index, dir, manager.get(), dragSt)
    manager.prop('state').set(sortState)
  }

  useDrag(
    {
      mode: 'abs',
      draggable: enabled(),
      target: ref,
      delayOut: 200,
      constraint: constraint1,
      onStart,
      onUpdate,
      onCancel: onUpdate,
      onFinish: onUpdate,
      onDone
    },
    [index]
  )

  const hide = useValue(
    manager.prop('state').mapMaybe(st => st.srcIx === index && st.dragSt.stage !== 'idle')
  )

  const transform = useValue(manager.map(x => computeTransform(dir, index)(x)))

  return (
    <Box
      {...props}
      ref={el => setRef(el ?? undefined)}
      style={{ ...style, transform }}
      className={cx(hide && hideC)}
    >
      {children}
    </Box>
  )
}

// ----------------------------------------------------------------------------

const containerC = className('container', {
  userSelect: 'none'
})

const animateC = className()

animateC.child().style({
  transition: 'transform 200ms ease'
})

const hideC = style({
  position: 'absolute',
  pointerEvents: 'none',
  width: important(0),
  height: important(0),
  minWidth: important(0),
  minHeight: important(0),
  margin: important(0),
  opacity: 0,
  zoom: 0
})

const ghostC = className('ghostC')

ghostC
  .not(x => x.self('.update'))
  .style({
    margin: important(0),
    transition: ['left 200ms ease', 'top 200ms ease'].join()
  })
