import React, { ReactElement, ReactNode, useState } from 'react'
import { Box, BoxProps } from '../box/Box'
import { useSmall } from '../box/Small'
import { SmallUnit, Unit } from '../box/Unit'
import { Attach, useAttachment } from '../dyn/Attach'
import * as Con from '../dyn/Constraint'
import { DragState, useDrag } from '../dyn/Drag'
import { Focusable } from '../dyn/Focus'
import { Geom, Point } from '../lib/Geometry'
import { Range_, range } from '../lib/Range'
import { useValue, useVar, Var } from '../lib/Var'
import { Fg, Hovering, Primary } from '../styling/Color'
import { Panel } from './Panel'

export interface SliderProps {
  value: Var<number>
  small?: boolean
  limit: Range_
  step?: number | number[]
  stick?: number | number[]
  snap?: number | number[]
  tick?: number | number[]
  dots?: number | number[]
  focus?: Var<boolean>
  wrapThumb?: (handle: ReactElement) => ReactNode
  onStartDragging?: () => void
  onStopDragging?: () => void
}

const Thumb = 8 // Thumb width/height

const onKeyDown = (props: SliderProps) => (ev: React.KeyboardEvent) => {
  const { value, limit, stick } = props

  const set = (v: number) => {
    value.set(v)
    ev.preventDefault()
  }

  const mod = (f: (v: number) => number) => {
    value.modify(f)
    ev.preventDefault()
  }

  if (typeof stick === 'number') {
    const d = ev.shiftKey ? stick * 2 : stick
    if (ev.key === 'ArrowLeft') mod(v => limit.clamp(v - d))
    if (ev.key === 'ArrowRight') mod(v => limit.clamp(v + d))
    if (ev.key === 'Home') set(limit.from)
    if (ev.key === 'End') set(limit.to)
    if (ev.key === '0' && limit.within(0)) set(0)
    return
  }

  const atClamped = (a: number[], ix: number): number =>
    a[Math.max(0, Math.min(ix, a.length - 1))]

  if (stick instanceof Array) {
    const d = ev.shiftKey ? 2 : 1
    if (ev.key === 'ArrowLeft') mod(v => atClamped(stick, stick.indexOf(v) - d))
    if (ev.key === 'ArrowRight') mod(v => atClamped(stick, stick.indexOf(v) + d))
    if (ev.key === 'Home') set(stick[0])
    if (ev.key === 'End') set(stick[stick.length - 1])
    if (ev.key === '0' && stick.find(n => n === 0) !== undefined) set(0)
    return
  }

  let mag = limit.magnitude() / 10
  if (ev.shiftKey) mag /= 10
  if (ev.key === '0' && limit.within(0)) set(0)
  if (ev.key === 'ArrowLeft') mod(v => limit.clamp(v - mag))
  if (ev.key === 'ArrowRight') mod(v => limit.clamp(v + mag))
  if (ev.key === 'Home') set(limit.from)
  if (ev.key === 'End') set(limit.to)
}

export const Slider = React.memo((props: SliderProps & BoxProps) => {
  const { className, ...rest } = props

  const focus = props.focus ?? useVar<boolean>(false)
  const small = useSmall()

  return (
    <Focusable focus={focus}>
      <Attach
        inside
        attachment={() => <Slider_ {...props} focus={focus} small={small} />}
      >
        <Box
          rel
          noselect
          onKeyDown={onKeyDown(props)}
          height={small ? SmallUnit : Unit}
          {...rest}
        />
      </Attach>
    </Focusable>
  )
})

// ----------------------------------------------------------------------------

interface Context {
  small?: boolean
  focus: Var<boolean>
}

export function Slider_(props: SliderProps & Context) {
  const {
    limit,
    dots,
    tick,
    small,
    wrapThumb: wrapHandle = h => h,
    step,
    stick,
    snap,
    onStartDragging,
    onStopDragging
  } = props

  const { target, geom } = useAttachment()
  const hasFocus = useValue(props.focus)

  const [thumb, setThumb] = useState<HTMLElement>()
  const v = useValue(props.value)

  const height = () => (small === true ? SmallUnit : Unit)
  const pad = () => (small === true ? 12 : 15)

  const shade = Fg.alpha(0.05)

  const renderTrack = (value: number) => {
    const r = trackRange()
    const x = r.clamp(limit.remap(r, value))

    const w = dots ? 0 : 3
    const t = dots ? 2 : 4
    return (
      <>
        <Box
          blunt
          abs
          left={r.from - w}
          top={height() / 2 - t / 2}
          width={r.delta() + w * 2}
          height={t}
          bg={shade}
        />
        <Box
          blunt
          abs
          left={r.from - w}
          top={height() / 2 - t / 2}
          width={x === r.from ? 0 : (x === r.to ? w * 2 : w) + x - r.from}
          height={t}
          bg={Primary}
        />
      </>
    )
  }

  const renderTicks = () => {
    if (!tick) return

    const w = 2
    return xpos(tick).map(x => (
      <Box
        abs
        blunt
        key={x}
        left={x - w / 2}
        top={height() / 2 + (small === true ? 3 : 5)}
        width={w}
        height={5}
        bg={Hovering.darken(0.05)}
      />
    ))
  }

  const renderDots = (value: number) => {
    if (!dots) return

    const d = 4
    const v = limit.remap(trackRange(), value)

    return xpos(dots).map(x => (
      <Box
        abs
        round
        key={x}
        left={x - d / 2}
        top={height() / 2 - d / 2}
        width={d}
        height={d}
        bg={x <= v ? Primary : Hovering.darken(0.05)}
      />
    ))
  }

  const renderThumb = (value: number) => {
    if (limit.delta() === 0) return <></>
    const left = Math.round(limit.remap(trackRange(), value) - Thumb / 2)
    return wrapHandle(
      <Panel
        abs
        round
        style={{ visibility: limit.within(value) ? undefined : 'hidden' }}
        outline
        glow={hasFocus}
        elem={setThumb}
        geom={new Geom(left, height() / 2 - Thumb / 2, Thumb, Thumb)}
      />
    )
  }

  const onUpdate = (st: DragState) => {
    const r = st.place
    const x = (r.left + r.right) / 2
    const v = trackRange().remap(limit, x)
    const vR = round(v)
    props.value.set(vR)
  }

  // ------------------------------------------------------------------------

  const trackRange = () => range(pad(), geom.width - pad())

  const round = (x: number): number => {
    if (typeof step === 'number') return Math.round(x / step) * step

    if (step instanceof Array) {
      for (let i = 0; i <= step.length - 1; i++) {
        const low = step[i]
        const up = step[i + 1]
        if (x >= low && x <= up) return x - low < up - x ? low : up
      }
      return step[step.length - 1]
    }

    return x
  }

  const xpos = (steps: number[] | number) => {
    const list = steps instanceof Array ? steps : limit.iterate(steps, true)
    return list.map(x => limit.remap(trackRange(), x))
  }

  const constraint = () => {
    if (stick) {
      const pts = xpos(stick).map(x => new Point(Math.round(x), height() / 2))
      return Con.solver(Con.oneOf(...pts.map(Con.fixed)))
    }

    const tr = trackRange()
    const line = Con.hline(new Point(tr.from, height() / 2), tr.delta())

    if (snap) {
      const pts = xpos(snap).map(x => new Point(x, height() / 2))
      return Con.compose(...pts.map(p => Con.snap(p, 10)), line)
    }

    return line
  }

  useDrag(
    {
      bg: target,
      target: thumb,
      mode: 'rel',
      draggable: true,
      onUpdate,
      onStart: onStartDragging,
      onFinish: onStopDragging,
      onCancel: onStopDragging,
      constraint
    },
    [onUpdate]
  )

  return (
    <>
      {renderTicks()}
      {renderTrack(v)}
      {renderDots(v)}
      {renderThumb(v)}
    </>
  )
}
