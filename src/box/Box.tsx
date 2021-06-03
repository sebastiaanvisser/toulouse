import React, { createElement, CSSProperties, ReactHTML, ReactNode } from 'react'
import { Classy, cx } from '../styling/Classy'
import { style } from '../styling/Rule'
import { childrenToLabel, LabelProps } from '../widget/Label'
import * as Sep from '../widget/Sep'
import * as Border from './Border'
import * as Clickable from './Clickable'
import * as Colors from './Colors'
import * as Corner from './Corner'
import * as Flexed from './Flexed'
import * as Sized from './Sized'
import { usePalette } from './Themed'
import { VariantProps } from './Variant'

export interface EventProps<E> {
  onClick?: React.MouseEventHandler<E>
  onDoubleClick?: React.MouseEventHandler<E>
  onMouseDown?: React.MouseEventHandler<E>
  onMouseUp?: React.MouseEventHandler<E>
  onMouseOver?: React.MouseEventHandler<E>
  onMouseOut?: React.MouseEventHandler<E>
  onMouseMove?: React.MouseEventHandler<E>
  onMouseEnter?: React.MouseEventHandler<E>
  onMouseLeave?: React.MouseEventHandler<E>
  onScroll?: React.UIEventHandler<E>
  onWheel?: React.WheelEventHandler<E>
  onWheelCapture?: React.WheelEventHandler<E>
  onKeyDown?: React.KeyboardEventHandler<E>
  onKeyUp?: React.KeyboardEventHandler<E>
  onKeyPress?: React.KeyboardEventHandler<E>
  onFocus?: React.FocusEventHandler<E>
  onBlur?: React.FocusEventHandler<E>
  onDrag?: React.DragEventHandler<E>
  onDragEnd?: React.DragEventHandler<E>
  onDragEnter?: React.DragEventHandler<E>
  onDragExit?: React.DragEventHandler<E>
  onDragLeave?: React.DragEventHandler<E>
  onDragOver?: React.DragEventHandler<E>
  onDragStart?: React.DragEventHandler<E>
  onDrop?: React.DragEventHandler<E>
}

export interface DivProps extends EventProps<HTMLDivElement> {
  className?: string
  style?: CSSProperties
  tabIndex?: number
  children?: ReactNode
}

export interface BoxProps
  extends DivProps,
    Clickable.Props,
    Colors.Props,
    Sized.Props,
    Flexed.Props,
    Corner.Props,
    Border.Props,
    Sep.Props,
    LabelProps,
    VariantProps {
  cx?: Classy
  dontConvertTextToLabels?: true
  inline?: boolean
  type?: keyof ReactHTML
  elem?: (el: HTMLElement) => void
  attach?: (() => ReactNode) | ReactNode
  debug?: string
}

// ----------------------------------------------------------------------------

export function Box(props: BoxProps) {
  const {
    dontConvertTextToLabels,
    inline,
    type = inline ? 'span' : 'div',
    tabIndex,
    elem,

    onClick,
    onDoubleClick,
    onMouseDown,
    onMouseUp,
    onMouseOver,
    onMouseOut,
    onMouseMove,
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
    onDrag,
    onDragEnd,
    onDragEnter,
    onDragExit,
    onDragLeave,
    onDragOver,
    onDragStart,
    onDrop
  } = props

  // Label props
  const { ellipsis, justify, smallcaps, mono, subtle } = props

  const palette = usePalette()

  const className = cx(
    boxC,
    Sized.classes(props),
    Flexed.classes(props),
    Corner.classes(props),
    Clickable.classes(props, palette),
    Border.classes(props, palette),
    Sep.classes(props, palette),
    Colors.classes(props, palette),
    props.cx,
    props.className
  )

  const style: React.CSSProperties = {
    ...Sized.styling(props),
    ...props.style
  }

  const children =
    dontConvertTextToLabels !== true
      ? childrenToLabel(props.children, { justify, ellipsis, smallcaps, mono, subtle })
      : props.children

  const ref = elem ? (el: HTMLElement | null) => el && elem(el) : undefined

  const primProps = {
    tabIndex,
    onClick,
    onDoubleClick,
    onMouseDown,
    onMouseUp,
    onMouseOver,
    onMouseOut,
    onMouseMove,
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
    onDrag,
    onDragEnd,
    onDragEnter,
    onDragExit,
    onDragLeave,
    onDragOver,
    onDragStart,
    onDrop,
    style,
    className,
    children,
    ref
  }

  return createElement(type, primProps)
}

// ----------------------------------------------------------------------------

const boxC = style({ boxSizing: 'border-box' }).name('box')
boxC.self(':focus').style({ outline: 'none' })
