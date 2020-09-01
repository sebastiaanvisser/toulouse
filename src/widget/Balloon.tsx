import React, {
  CSSProperties,
  MutableRefObject,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import * as ReactDOM from 'react-dom'
import { v4 as uuid } from 'uuid'
import { Box, BoxProps } from '../box/Box'
import { Small, useSmall } from '../box/Small'
import { Theme } from '../box/Themed'
import { SmallerRatio } from '../box/Unit'
import {
  isAncestorOrSelf,
  isDetached,
  measureAbsolute,
  measureDimensions,
  useAttachment
} from '../dyn/Attach'
import * as Icons from '../icon/Icons'
import * as S from '../icon/Shape'
import { Dimensions, Geom, Position, Sides, SidesDef } from '../lib/Geometry'
import { useDebounce, useDocumentEvent, useEvent, useStateDeepEquals } from '../lib/Hooks'
import { memo2 } from '../lib/Memo'
import { range } from '../lib/Range'
import { useControlledVar, Value, Var } from '../lib/Var'
import { cx, px, pct } from '../styling/Classy'
import { Bg } from '../styling/Color'
import { style, className } from '../styling/Rule'
import { Icon } from '../widget/Icon'
import { Panel } from './Panel'

export type BalloonPosition = 'left' | 'top' | 'right' | 'bottom'

export interface Timing {
  debounceIn: number
  debounceOut: number
  durationIn: number
  durationOut: number
}

export const DefaultTiming: Timing = {
  debounceIn: 100,
  debounceOut: 200,
  durationIn: 150,
  durationOut: 150
}

export const QuickHover: Timing = {
  debounceIn: 0,
  debounceOut: 0,
  durationIn: 50,
  durationOut: 50
}

export const SlowReveal: Timing = {
  debounceIn: 500,
  debounceOut: 200,
  durationIn: 250,
  durationOut: 100
}

export const ReallySlow: Timing = {
  debounceIn: 2000,
  debounceOut: 2000,
  durationIn: 2000,
  durationOut: 2000
}

interface BalloonOnlyProps {
  behavior?: 'hover' | 'click' | 'mousedown' | 'mouseup'
  open?: Var<boolean> | Value<boolean>
  position?: BalloonPosition
  bias?: number
  hover?: boolean
  handle?: boolean | ReactNode
  id?: string
  margin?: SidesDef
  timing?: Timing
  registry?: BalloonRegistry | false
  width?: number | 'target' | ((width: number) => number)
  height?: number | 'target' | ((width: number) => number)
  transitions?: ('opacity' | 'transform')[]
}

export type BalloonProps = BalloonOnlyProps & Omit<BoxProps, 'width' | 'height'>

interface Context {
  target: HTMLElement
}

// ----------------------------------------------------------------------------

export function Balloon(props: BalloonProps) {
  const target = useAttachment()?.target

  const stop: React.EventHandler<any> = ev => ev.stopPropagation()

  return ReactDOM.createPortal(
    <div
      onMouseDown={stop}
      onMouseUp={stop}
      onClick={stop}
      onKeyDown={stop}
      onKeyPress={stop}
      onKeyUp={stop}
    >
      {target ? <Balloon_ {...props} target={target} /> : null}
    </div>,
    document.getElementById('overlay') as HTMLElement
  )
}

export const Tooltip = (props: BalloonProps = {}) => (
  <Theme primary>
    <Small>
      <Balloon position="top" behavior="hover" h {...props} />
    </Small>
  </Theme>
)

// ----------------------------------------------------------------------------

interface RegEntry {
  id: string
  ref: MutableRefObject<HTMLElement | undefined>
  close: () => void
}

export class BalloonRegistry {
  stack: RegEntry[] = []

  constructor() {
    if (typeof window !== 'undefined')
      document.addEventListener('keydown', this.onKeyDown, true)
  }

  top(): RegEntry | undefined {
    return this.stack[this.stack.length - 1]
  }

  register(
    id: string,
    ref: MutableRefObject<HTMLElement | undefined>,
    close: () => void
  ) {
    this.stack.push({ id, ref, close })
    return this.stack.length
  }

  unregister(id: string) {
    this.stack = this.stack.filter(entry => entry.id !== id)
  }

  private onKeyDown = (ev: KeyboardEvent) => {
    if (this.stack.length > 0 && ev.key === 'Escape') {
      this.close()
      ev.preventDefault()
      ev.stopPropagation()
    }
  }

  close = () => {
    this.stack.pop()?.close()
  }

  closeAll() {
    let cur
    do {
      cur = this.stack.pop()
      cur?.close()
    } while (cur)
  }
}

export const Balloons = new BalloonRegistry()

// ----------------------------------------------------------------------------

// const rendered = (shape: Shape, name: string): Once<Shape> =>
//   shape.map(s => s.clipAsIcon().offsetAsIcon().named(name))

const balloonHandle = S.IconDef.make('balloon-handle', Icons.handle)
const balloonHandleSmall = S.IconDef.make('balloon-handle-small', () =>
  Icons.handle().scale(SmallerRatio)
)

// ----------------------------------------------------------------------------

export function Balloon_(props: BalloonProps & Context) {
  const {
    timing = DefaultTiming,
    position,
    behavior,
    children,
    geom,
    target,
    open,
    bias,
    margin,
    width,
    height,
    registry = Balloons,
    transitions = ['opacity', 'transform'],
    ...rest
  } = props

  const [z, setZ] = useState(0)
  const [id] = useState(uuid)
  const [isVisible, setVisible] = useState(false)
  const [size, setSize] = useStateDeepEquals<Dimensions | undefined>(undefined)
  const [isOpen, setOpen] = useControlledVar(open, false)
  const elem = useRef<HTMLElement | undefined>()
  const small = useSmall()

  // ----------------------------------

  const { debounceIn, debounceOut, durationOut } = timing

  const openBalloon = useCallback(() => setOpen(true), [])
  const closeBalloon = useCallback(() => setOpen(false), [])
  const toggleBalloon = useCallback(() => setOpen(!isOpen), [])

  const [startHover, hoverRef] = useDebounce(() => {
    if (!isOpen) {
      setOpen(true)
      setVisible(false)
    }
  }, debounceIn)

  const [stopHover] = useDebounce(() => setOpen(false), debounceOut, hoverRef)

  const documentMouseDown = (ev: Event) => {
    // Not yet in open state.
    const evTarget = ev.target as HTMLElement
    if (!isOpen || !elem.current) return

    // Only close when we're the top box.
    // if (registry instanceof BalloonRegistry) {
    //   if (registry.top()?.ref !== elem) return
    // }

    // Allow interaction with the top balloon.
    if (registry instanceof BalloonRegistry) {
      const elem = registry.top()?.ref.current
      if (elem && isAncestorOrSelf(evTarget, elem)) return
    }

    // Don't close when clicking the current balloon.
    if (isAncestorOrSelf(evTarget, elem.current)) return

    // Don't close when clicking the target.
    if (isAncestorOrSelf(evTarget, target)) return

    // Return when we're detached.
    if (isDetached(evTarget)) return

    setOpen(false)
  }

  // ----------------------------------

  useEvent(target, 'click', toggleBalloon, behavior === 'click', [behavior, isOpen])
  useEvent(target, 'mousedown', toggleBalloon, behavior === 'mousedown', [
    behavior,
    isOpen
  ])
  useEvent(target, 'mouseup', openBalloon, behavior === 'mouseup', [behavior, isOpen])
  useEvent(target, 'mousedown', closeBalloon, behavior === 'mouseup', [behavior, isOpen])

  useDocumentEvent(
    'mousedown',
    documentMouseDown,
    [isOpen, target, behavior],
    isOpen && (behavior === 'click' || behavior === 'mousedown' || behavior === 'mouseup')
  )

  useEvent(target, 'mouseenter', startHover, behavior === 'hover', [isOpen])
  useEvent(target, 'mouseleave', stopHover, behavior === 'hover', [isOpen])

  const [show, visRef] = useDebounce(() => setVisible(true))
  const [hide] = useDebounce(() => setVisible(false), durationOut, visRef)

  useEffect(() => {
    const showing = isOpen && !isVisible
    const hiding = !isOpen && isVisible
    if (showing) show()
    if (hiding) hide()
    if (showing && registry) {
      setZ(registry.register(id, elem, () => setOpen(false)))
    }
    if (hiding && registry) registry.unregister(id)
  }, [isOpen, isVisible])

  // ----------------------------------

  if (!isOpen && !isVisible) return <></>

  const { leftC, rightC, topC, bottomC } = PositionStyles.get([small, bias || 0])
  const { transitionC, outC } = TransitionStyles.get([timing, transitions])

  const className = cx(
    transitionC,
    isOpen && !isVisible && outC,
    !isOpen && isVisible && outC,
    position === 'left' && leftC,
    position === 'right' && rightC,
    position === 'top' && topC,
    position === 'bottom' && bottomC,
    !position && bottomC
  )

  const dim = measureAbsolute(target)
  const pos = computePosition(props, size, dim, small)
  const hover = behavior === 'hover'

  const computedWidth =
    width === 'target' ? dim.width : width instanceof Function ? width(dim.width) : width

  const computedHeight =
    height === 'target'
      ? dim.height
      : height instanceof Function
      ? height(dim.height)
      : height

  const onElem = (target: HTMLElement) => {
    elem.current = target
    setSize(measureDimensions(target))
  }

  return (
    <Box
      abs
      fg
      {...pos}
      elem={onElem}
      z={1000 + z}
      onClick={ev => ev.stopPropagation()}
      style={{ visibility: size ? undefined : 'hidden' }}
      className={className}
      onMouseEnter={hover ? () => setTimeout(startHover) : undefined}
      onMouseLeave={hover ? stopHover : undefined}
    >
      {(props.handle === true || props.handle === undefined) && size ? (
        <Handle {...props} dim={size} />
      ) : (
        props.handle
      )}
      <Panel width={computedWidth} height={computedHeight} elevate {...rest}>
        {children}
      </Panel>
    </Box>
  )
}

function computePosition(
  props: BalloonOnlyProps & Context,
  size: Dimensions | undefined,
  dim: Geom,
  small: boolean
): Partial<Position> {
  if (!size) return {}

  const { margin, bias, position } = props
  const b = bias || 0
  const pos = position || 'bottom'
  const defaultM = small ? 5 : 10
  const m = new Sides(margin ?? defaultM).asRect

  if (pos === 'left' || pos === 'right') {
    const dy = ((dim.height - size.height) / 2) * b
    const top = Math.round(dim.top + dim.height / 2 - size.height / 2 + dy)
    const left = Math.round(
      pos === 'left' ? dim.left - size.width - m.left : dim.left + dim.width + m.right
    )
    return { left, top }
  }

  if (pos === 'top' || pos === 'bottom') {
    const dx = ((dim.width - size.width) / 2) * b
    const left = Math.round(dim.left + dim.width / 2 - size.width / 2 + dx)
    const top = Math.round(
      pos === 'top' ? dim.top - size.height - m.top : dim.top + dim.height + m.bottom
    )
    return { left, top }
  }

  return pos
}

function Handle(props: BalloonProps & { dim: Dimensions }) {
  const small = useSmall()
  const { position, bias = 0, dim } = props
  const { width, height } = dim
  const { handleC } = PositionStyles.get([small, bias])

  const handle = small ? 20 : 30

  const isV = position === 'left' || position === 'right'
  const isH = !isV

  let left =
    width > handle
      ? range(0, width - handle).clamp(
          width / 2 + (bias * (width - handle)) / 2 - handle / 2
        )
      : width / 2 - handle / 2

  const top =
    height > handle
      ? range(0, height - handle).clamp(
          height / 2 + (bias * (height - handle)) / 2 - handle / 2
        )
      : height / 2 - handle / 2

  const style: CSSProperties = {
    left: isH ? px(left) : undefined,
    top: isV ? px(top) : undefined
  }

  return (
    <Box abs noevents className={cx(handleC)} style={style}>
      <Icon fg={Bg} icon={small ? balloonHandleSmall : balloonHandle} />
    </Box>
  )
}

// ----------------------------------------------------------------------------

const PositionStyles = memo2((small: boolean, bias: number) => {
  const o = pct((bias + 1) * 50)
  const leftC = style({ transformOrigin: `100% ${o}` })
  const rightC = style({ transformOrigin: `0% ${o}` })
  const topC = style({ transformOrigin: `${o} 100%` })
  const bottomC = style({ transformOrigin: `${o} 0%` })

  // ------------------------------------

  const handleC = className('balloon-handle').disamb(bias)

  const offset = small ? -10 : -15
  leftC.child(handleC).style({ right: px(offset), transform: 'rotate(90deg)' })
  rightC.child(handleC).style({ left: px(offset), transform: 'rotate(270deg)' })
  topC.child(handleC).style({ bottom: px(offset), transform: 'rotate(180deg)' })
  bottomC.child(handleC).style({ top: px(offset), transform: 'rotate(0deg)' })

  return {
    handleC,
    leftC,
    rightC,
    topC,
    bottomC
  }
})

const TransitionStyles = memo2(
  (timing: Timing, transitions: ('transform' | 'opacity')[]) => {
    const { durationIn, durationOut } = timing
    const trIn = `${durationIn}ms ease-in`
    const trOut = `${durationOut}ms ease-in`

    const opacity = transitions.indexOf('opacity') !== -1
    const transform = transitions.indexOf('transform') !== -1

    const transitionC = style({
      transition: transitions.map(tr => `${tr} ${trIn}`).join(),
      opacity: opacity ? 1 : undefined,
      transform: transform ? 'scale(1) translate(0,0)' : undefined
    }).name('balloon')

    const inC = style({
      opacity: opacity ? 0 : undefined,
      transition: transitions.map(tr => `${tr} ${trOut}`).join(),
      transform: transform ? 'scale(0.8)' : undefined
    }).name('in')

    const outC = style({
      opacity: opacity ? 0 : undefined,
      transition: transitions.map(tr => `${tr} ${trOut}`).join(),
      transform: transform ? 'scale(0.8)' : undefined
    }).name('out')

    return {
      transitionC,
      inC,
      outC
    }
  }
)

function preloadCss() {
  ;[true, false].forEach(small =>
    [-1, 0, 1].map(bias => {
      const { handleC, leftC, rightC, topC, bottomC } = PositionStyles.get([small, bias])
      handleC.use()
      leftC.use()
      rightC.use()
      topC.use()
      bottomC.use()
    })
  )
  ;[DefaultTiming, ReallySlow].map(timing => {
    const { transitionC, inC, outC } = TransitionStyles.get([
      timing,
      ['opacity', 'transform']
    ])

    transitionC.use()
    inC.use()
    outC.use()
  })
}

preloadCss()
