import React, {
  createElement,
  CSSProperties,
  forwardRef,
  ReactHTML,
  ReactNode,
  Ref,
  useLayoutEffect
} from 'react'
import {
  useDebounce,
  useForwardedRef,
  useStateDeepEquals,
  useWindowEvent
} from '../lib/Hooks'
import { className, cx, useCssInstalled } from '../styling/Css'
import { childrenToLabel } from '../widget/Label'
import { SepProps, useSepClass } from '../widget/Sep'
import { BorderProps, useBorderClass } from './Border'
import { ClickableProps, useClickableClass } from './Clickable'
import { cornerClass, CornerProps } from './Corner'
import { flexClass, FlexProps } from './Flexed'
import { AttachCtx, AttachProps, measure, MeasureProps } from './Measure'
import {
  ColoringProps,
  PaletteContext,
  PalettedProps,
  useColorStyle,
  usePaletteClass,
  useResolvedPalette
} from './Paletted'
import { sizedClass, SizedProps, sizedStyle } from './Sized'
import { SmallContext, SmallProps } from './Small'
import { FocusProps, useFocusableProps } from '../dyn'

export const Unit = 30
export const Smaller = 5
export const SmallerUnit = Unit - 2 * Smaller
export const SmallerRatio = SmallerUnit / Unit

export interface DivProps {
  className?: string
  style?: CSSProperties
  tabIndex?: number
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  onDoubleClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  onMouseDown?: (event: React.MouseEvent<HTMLDivElement>) => void
  onMouseUp?: (event: React.MouseEvent<HTMLDivElement>) => void
  onMouseOver?: (event: React.MouseEvent<HTMLDivElement>) => void
  onMouseOut?: (event: React.MouseEvent<HTMLDivElement>) => void
  onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void
  onKeyUp?: (event: React.KeyboardEvent<HTMLDivElement>) => void
  onKeyPress?: (event: React.KeyboardEvent<HTMLDivElement>) => void
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void
  onWheel?: React.WheelEventHandler<HTMLDivElement>
  onWheelCapture?: React.WheelEventHandler<HTMLDivElement>
  ref?: Ref<HTMLDivElement | undefined>
  children?: ReactNode
}

// ThemedProps, // MeasureProps, // ClickableProps,
export interface BoxProps
  extends DivProps,
    ClickableProps,
    PalettedProps,
    ColoringProps,
    SizedProps,
    FlexProps,
    CornerProps,
    FocusProps,
    SmallProps,
    BorderProps,
    SepProps,
    MeasureProps {
  dontConvertTextToLabels?: true
  inline?: boolean
  type?: keyof ReactHTML
  elem?: (div: HTMLElement) => void
  attach?: (() => ReactNode) | ReactNode
  debug?: string
}

export const Box = forwardRef((props: BoxProps, ref: Ref<HTMLElement | undefined>) => {
  const { elem, attach, measureSize, measureAbs, measureRel } = props

  if (elem || attach || measureAbs || measureRel || measureSize)
    return <MeasuringBox {...props} ref={ref} />
  else {
    return <BaseBox {...props} ref={ref} />
  }
})

// ----------------------------------------------------------------------------

export const MeasuringBox = forwardRef(
  (props: BoxProps, fw: Ref<HTMLElement | undefined>) => {
    const [attachProps, setAttachProps] = useStateDeepEquals<AttachProps | undefined>(
      undefined
    )
    const { elem, attach, measureSize, measureAbs, measureRel, children, ...rest } = props
    const ref = useForwardedRef(fw, undefined)

    const measureIt = () => {
      if (ref.current) {
        measure(props, ref.current, attach ? setAttachProps : undefined)
        if (elem) elem(ref.current)
      }
    }
    const [measureItDebounce] = useDebounce(measureIt, 100)

    useCssInstalled(measureIt)
    useLayoutEffect(measureIt)

    useWindowEvent('resize', measureItDebounce)

    return (
      <BaseBox {...rest} ref={ref}>
        {children}
        {attach && attachProps && (
          <AttachCtx.Provider value={attachProps}>
            {attach instanceof Function ? attach() : attach}
          </AttachCtx.Provider>
        )}
      </BaseBox>
    )
  }
)

// ----------------------------------------------------------------------------

const BaseBox = forwardRef((props: BoxProps, ref: Ref<HTMLElement | undefined>) => {
  const {
    dontConvertTextToLabels,
    inline,
    type = inline ? 'span' : 'div',
    tabIndex,
    onClick,
    onDoubleClick,
    onMouseDown,
    onMouseUp,
    onMouseOver,
    onMouseOut,
    onMouseEnter,
    onMouseLeave,
    onKeyDown,
    onKeyUp,
    onKeyPress,
    onScroll,
    onFocus,
    onBlur,
    onWheel,
    onWheelCapture
  } = props

  const palette = useResolvedPalette(props)
  const paletteClass = usePaletteClass(props)
  const borderClass = useBorderClass(props)
  const sepClass = useSepClass(props)
  const clickableClass = useClickableClass(props)
  const focusableProps = useFocusableProps(props)

  const className = cx(
    sizedClass(props),
    flexClass(props),
    cornerClass(props),
    clickableClass,
    borderClass,
    sepClass,
    boxC,
    paletteClass,
    focusableProps.className,
    props.className
  )

  const paletteStyle = useColorStyle(props)

  const style: React.CSSProperties = {
    ...sizedStyle(props),
    ...paletteStyle,
    ...props.style
  }

  const children =
    dontConvertTextToLabels !== true ? childrenToLabel(props.children) : props.children

  const primProps = {
    tabIndex,
    onClick,
    onDoubleClick,
    onMouseDown,
    onMouseUp,
    onMouseOver,
    onMouseOut,
    onMouseEnter,
    onMouseLeave,
    onKeyDown,
    onKeyUp,
    onKeyPress,
    onScroll,
    onFocus,
    onBlur,
    onWheel,
    onWheelCapture,
    style,
    className,
    children,
    ref,
    ...{
      onBlur: focusableProps.onBlur,
      onFocus: focusableProps.onFocus //
    }
  }

  let element = createElement(type, primProps)

  if (props.palette)
    element = <PaletteContext.Provider value={palette}>{element}</PaletteContext.Provider>

  if (props.small)
    element = <SmallContext.Provider value={true}>{element}</SmallContext.Provider>

  return element
})

// ----------------------------------------------------------------------------

const boxC = className('box')
boxC.style({ boxSizing: 'border-box' })

boxC.self(':focus').style({ outline: 'none' })
