import React, {
  CSSProperties,
  MutableRefObject,
  useEffect,
  useRef,
  useState
} from 'react'
import * as ReactDOM from 'react-dom'
import { v4 as uuid } from 'uuid'
import { SmallContext, useResolvedeSmall } from '../box'
import { Box, BoxProps } from '../box/Box'
import {
  isAncestorOrSelf,
  isDetached,
  measureAbsolute,
  useAttachment
} from '../box/Measure'
import * as S from '../icon/Icons'
import { clipAsIcon, offsetAsIcon, Shape } from '../icon/Shape'
import { Dimensions, Geom, Position } from '../lib/Geometry'
import { useDebounce, useDocumentEvent, useEvent, useStateDeepEquals } from '../lib/Hooks'
import { memo1, Once } from '../lib/Memo'
import { range } from '../lib/Range'
import { useControlledVar, Value, Var } from '../lib/Var'
import { Bg, Day } from '../styling'
import { className, cx, px, style } from '../styling'
import { Icon } from './Icon'
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
  behavior?: 'hover' | 'click' | 'mousedown'
  open?: Var<boolean> | Value<boolean>
  position?: BalloonPosition
  bias?: number
  hover?: boolean
  handle?: boolean
  id?: string
  margin?: number
  timing?: Timing
  registry?: BalloonRegistry | false
  width?: number | 'target' | ((width: number) => number)
  height?: number | 'target' | ((width: number) => number)
}

export type BalloonProps = BalloonOnlyProps & Omit<BoxProps, 'width' | 'height'>

interface Context {
  target: HTMLElement
}

// ----------------------------------------------------------------------------

export function Balloon(props: BalloonProps) {
  const target = useAttachment()?.target

  return (
    <SmallContext.Provider value={false}>
      {target ? <Balloon_ {...props} target={target} /> : null}
    </SmallContext.Provider>
  )
}

export const Tooltip = (props: BalloonProps = {}) => (
  <Balloon small palette={Day} position="top" behavior="hover" {...props} h />
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
  }

  unregister(id: string) {
    this.stack = this.stack.filter(entry => entry.id !== id)
  }

  onKeyDown = (ev: KeyboardEvent) => {
    if (ev.keyCode === 27) {
      const last = this.stack.pop()
      if (last) last.close()
    }
  }
}

const GlobalReg = new BalloonRegistry()

// ----------------------------------------------------------------------------

const rendered = (shape: Once<Shape>, name: string): Once<Shape> =>
  shape.map(s => offsetAsIcon(clipAsIcon(s)).named(name))

const balloonHandle = rendered(S.handle, 'balloon-handle')
const balloonHandleSmall = rendered(
  S.handle.map(s => s.scale(2 / 3)),
  'balloon-handle-small'
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
    palette,
    margin,
    width,
    height,
    registry = GlobalReg,
    ...rest
  } = props

  const [id] = useState(uuid)
  const [isVisible, setVisible] = useState(false)
  const [size, setSize] = useStateDeepEquals<Dimensions | undefined>(undefined)
  const [isOpen, setOpen] = useControlledVar(open, false)
  const elem = useRef<HTMLElement | undefined>()
  const small = useResolvedeSmall(props)

  // ----------------------------------

  const { debounceIn, debounceOut, durationOut } = timing

  const targetClick = () => setOpen(!isOpen)

  const [startHover, hoverRef] = useDebounce(() => {
    if (!isOpen) {
      setOpen(true)
      setVisible(false)
    }
  }, debounceIn)

  const [stopHover] = useDebounce(() => setOpen(false), debounceOut, hoverRef)

  const documentMouseDown = (ev: Event) => {
    const evTarget = ev.target as HTMLElement
    if (!isOpen || !elem.current) return

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

  useEvent(target, 'click', targetClick, behavior === 'click', [behavior, isOpen])
  useEvent(target, 'mousedown', targetClick, behavior === 'mousedown', [behavior, isOpen])

  useDocumentEvent(
    'mousedown',
    documentMouseDown,
    [isOpen, target, behavior],
    isOpen && (behavior === 'click' || behavior === 'mousedown')
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
    if (showing && registry) registry.register(id, elem, () => setOpen(false))
    if (hiding && registry) registry.unregister(id)
  }, [isOpen, isVisible])

  // ----------------------------------

  if (!isOpen && !isVisible) return <></>

  const styles = Styles.get(timing)
  const { balloonC, balloonPanelC, outC, leftC, rightC, topC, bottomC } = styles

  const className = cx(
    balloonC,
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

  return ReactDOM.createPortal(
    <Box
      abs
      fg
      palette={palette}
      {...pos}
      elem={el => (elem.current = el)}
      measureSize={setSize}
      onClick={ev => ev.stopPropagation()}
      style={{ visibility: size ? undefined : 'hidden' }}
      className={className}
      onMouseEnter={hover ? () => setTimeout(startHover) : undefined}
      onMouseLeave={hover ? stopHover : undefined}
    >
      {props.handle !== false && size && <Handle {...props} dim={size} />}
      <Panel
        width={computedWidth}
        height={computedHeight}
        elevate
        {...rest}
        className={cx(balloonPanelC, props.className)}
      >
        {children}
      </Panel>
    </Box>,
    document.getElementById('overlay') as HTMLElement
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
  const m = margin === undefined ? defaultM : margin

  if (pos === 'left' || pos === 'right') {
    const dy = ((dim.height - size.height) / 2) * b
    const top = Math.round(dim.top + dim.height / 2 - size.height / 2 + dy)
    const left = Math.round(
      pos === 'left' ? dim.left - size.width - m : dim.left + dim.width + m
    )
    return { left, top }
  }

  if (pos === 'top' || pos === 'bottom') {
    const dx = ((dim.width - size.width) / 2) * b
    const left = Math.round(dim.left + dim.width / 2 - size.width / 2 + dx)
    const top = Math.round(
      pos === 'top' ? dim.top - size.height - m : dim.top + dim.height + m
    )
    return { left, top }
  }

  return pos
}

function Handle(props: BalloonProps & { dim: Dimensions }) {
  const small = useResolvedeSmall(props)
  const { position, bias = 0, timing, dim } = props
  const { width, height } = dim
  const { handleC } = Styles.get(timing || DefaultTiming)

  const handle = 30

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
    <div className={cx(handleC)} style={style}>
      <Icon fg={Bg} icon={small ? balloonHandleSmall : balloonHandle} />
    </div>
  )
}

// ----------------------------------------------------------------------------

const Styles = memo1((timing: Timing) => {
  const { durationIn, durationOut } = timing
  const trIn = `${durationIn}ms ease-in`
  const trOut = `${durationOut}ms ease-in`

  const balloonC = className('balloon', {
    transition: [`opacity ${trIn}`, `transform ${trIn}`].join(),
    opacity: 1,
    transform: 'scale(1) translate(0,0)',
    zIndex: 1000
  })

  const inC = className('in', {
    opacity: 0,
    transition: [`opacity ${trOut}`, `transform ${trOut}`].join(),
    transform: 'scale(0.8)'
  })

  const outC = className('out', {
    opacity: 0,
    transition: [`opacity ${trOut}`, `transform ${trOut}`].join(),
    transform: 'scale(0.8)'
  })

  const balloonPanelC = className()

  // ------------------------------------

  const leftC = style({ transformOrigin: '100% 50%' })
  const rightC = style({ transformOrigin: '0% 50%' })
  const topC = style({ transformOrigin: '50% 100%' })
  const bottomC = style({ transformOrigin: '50% 0%' })

  // ------------------------------------

  const handleC = className('handle', {
    position: 'absolute',
    pointerEvents: 'none'
  })

  const offset = -15
  leftC.child(handleC).style({ right: px(offset), transform: 'rotate(90deg)' })
  rightC.child(handleC).style({ left: px(offset), transform: 'rotate(270deg)' })
  topC.child(handleC).style({ bottom: px(offset), transform: 'rotate(180deg)' })
  bottomC.child(handleC).style({ top: px(offset), transform: 'rotate(0deg)' })

  return {
    handleC,
    balloonC,
    balloonPanelC,
    inC,
    outC,
    leftC,
    rightC,
    topC,
    bottomC
  }
})
