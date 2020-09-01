import React, {
  createElement,
  CSSProperties,
  forwardRef,
  ReactHTML,
  ReactNode,
  Ref,
  useLayoutEffect
} from 'react'
import { FocusProps, useFocusableProps } from '../dyn'
import {
  useDebounce,
  useForwardedRef,
  useStateDeepEquals,
  useWindowEvent
} from '../lib/Hooks'
import { className, cx, useCssInstalled } from '../styling'
import { childrenToLabel, LabelProps } from '../widget/Label'
import { SeparatedProps, useSepClass } from '../widget/Sep'
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
import { SmallContext, SmallProps, useSmallClass } from './Small'
import { VariantProps } from './Variant'

export interface EventProps<E> {
  onClick?: (event: React.MouseEvent<E>) => void
  onDoubleClick?: (event: React.MouseEvent<E>) => void
  onMouseDown?: (event: React.MouseEvent<E>) => void
  onMouseUp?: (event: React.MouseEvent<E>) => void
  onMouseOver?: (event: React.MouseEvent<E>) => void
  onMouseOut?: (event: React.MouseEvent<E>) => void
  onMouseEnter?: (event: React.MouseEvent<E>) => void
  onMouseLeave?: (event: React.MouseEvent<E>) => void
  onKeyDown?: (event: React.KeyboardEvent<E>) => void
  onKeyUp?: (event: React.KeyboardEvent<E>) => void
  onKeyPress?: (event: React.KeyboardEvent<E>) => void
  onScroll?: (event: React.UIEvent<E>) => void
  onFocus?: (event: React.FocusEvent<E>) => void
  onBlur?: (event: React.FocusEvent<E>) => void
  onWheel?: React.WheelEventHandler<E>
  onWheelCapture?: React.WheelEventHandler<E>
}

export interface DivProps extends EventProps<HTMLDivElement> {
  className?: string
  style?: CSSProperties
  tabIndex?: number
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
    SeparatedProps,
    MeasureProps,
    LabelProps,
    VariantProps {
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
    if (typeof window !== 'undefined') {
      useLayoutEffect(measureIt)
    }

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

  // Label props
  const { ellipsis, justify, smallcaps, mono, subtle } = props

  const palette = useResolvedPalette(props)
  const paletteC = usePaletteClass(props)
  const borderC = useBorderClass(props)
  const sepC = useSepClass(props)
  const clickableC = useClickableClass(props)
  const smallC = useSmallClass(props)
  const focusableProps = useFocusableProps(props)

  const className = cx(
    sizedClass(props),
    flexClass(props),
    cornerClass(props),
    clickableC,
    borderC,
    sepC,
    boxC,
    smallC,
    paletteC,
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
    dontConvertTextToLabels !== true
      ? childrenToLabel(props.children, { justify, ellipsis, smallcaps, mono, subtle })
      : props.children

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
