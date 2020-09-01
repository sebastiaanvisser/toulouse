import * as React from 'react'
import { useState } from 'react'
import { SmallerUnit, Unit } from '../box'
import { Box, BoxProps } from '../box/Box'
import { useAttachment } from '../box/Measure'
import { useResolvedeSmall } from '../box/Small'
import * as Con from '../dyn/Constraint'
import { DragState, useDrag } from '../dyn/Drag'
import { FocusProps, useFocusableProps } from '../dyn/Focus'
import { pt } from '../lib/Geometry'
import { Range, range } from '../lib/Range'
import { useControlledVar, useValue, Var } from '../lib/Var'
import { Hover, PrimaryColor } from '../styling'
import { className, cx } from '../styling'
import { Panel } from './Panel'

export interface SliderProps extends FocusProps {
  value: Var<number>
  small?: boolean
  limit: Range
  step?: number | number[]
  stick?: number | number[]
  snap?: number | number[]
  tick?: number | number[]
  dots?: number | number[]
  attachHandle?: () => React.ReactNode
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

  const focusableProps = useFocusableProps(props)
  const small = useResolvedeSmall(props)

  return (
    <Box
      rel
      {...focusableProps}
      className={cx(className, sliderC)}
      attach={() => <Slider_ {...props} small={small} />}
      onKeyDown={onKeyDown(props)}
      height={small ? SmallerUnit : Unit}
      {...rest}
    />
  )
})

// ----------------------------------------------------------------------------

interface Context {
  small?: boolean
}

export function Slider_(props: SliderProps & Context) {
  const {
    limit,
    dots,
    tick,
    small,
    attachHandle,
    step,
    stick,
    snap,
    onStartDragging,
    onStopDragging
  } = props

  const [focus] = useControlledVar(props.focus, false)
  const attachProps = useAttachment()
  const { target, abs } = attachProps

  const [thumb, setThumb] = useState<HTMLElement>()
  const v = useValue(props.value)

  const height = () => (small === true ? SmallerUnit : Unit)
  const pad = () => (small === true ? 12 : 15)

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
          bg={Hover}
        />
        <Box
          blunt
          abs
          left={r.from - w}
          top={height() / 2 - t / 2}
          width={x === r.from ? 0 : (x === r.to ? w * 2 : w) + x - r.from}
          height={t}
          bg={PrimaryColor}
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
        bg={Hover.darken(0.05)}
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
        bg={x <= v ? PrimaryColor : Hover.darken(0.05)}
      />
    ))
  }

  const renderThumb = (value: number) => {
    const left = Math.round(limit.remap(trackRange(), value) - Thumb / 2)
    return (
      limit.within(value) && (
        <Panel
          abs
          round
          outline
          glow={focus}
          elem={setThumb}
          attach={attachHandle}
          left={left}
          top={height() / 2 - Thumb / 2}
          width={Thumb}
          height={Thumb}
        />
      )
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

  const trackRange = () => range(pad(), abs.width - pad())

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
      const pts = xpos(stick).map(x => pt(Math.round(x), height() / 2))
      return Con.solver(Con.oneOf(...pts.map(Con.fixed)))
    }

    const tr = trackRange()
    const line = Con.hline(pt(tr.from, height() / 2), tr.delta())

    if (snap) {
      const pts = xpos(snap).map(x => pt(x, height() / 2))
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

// ----------------------------------------------------------------------------

const sliderC = className('slider', { userSelect: 'none' })
