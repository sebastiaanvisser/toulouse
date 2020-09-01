import { FocusEvent, RefCallback, useState, useEffect } from 'react'
import { Value, Var, useControlledVar } from '../lib/Var'
import { className, cx } from '../styling'
import { BoxProps } from '../box/Box'

export interface FocusProps {
  focus?: Var<boolean> | Value<boolean>
  native?: boolean
}

interface FocusableAspects {
  onFocus: (ev: FocusEvent<HTMLElement>) => void
  onBlur: (ev: FocusEvent<HTMLElement>) => void
  className: string
  ref: RefCallback<HTMLElement>
  tabIndex?: number
}

// ----------------------------------------------------------------------------

export function useFocusableProps(
  props: FocusProps & BoxProps,
  provided?: HTMLElement
): Partial<FocusableAspects> {
  const { focus, native, tabIndex } = props

  if (!focus) return {}

  const [element, setElement] = useState<HTMLElement | undefined>()
  const [hasFocus, setFocus] = useControlledVar(focus, false)
  const managed = tabIndex !== undefined || native

  useEffect(() => {
    return props.focus?.effect(hasFocus => {
      if (managed && hasFocus) {
        ;(provided ?? element)?.focus()
      }
    })
  }, [focus, native, element])

  const onFocus = (ev: FocusEvent<HTMLElement>) => {
    if (!managed) return
    if (props.onFocus) props.onFocus(ev as any)
    setFocus(true)
  }

  const onBlur = (ev: FocusEvent<HTMLElement>) => {
    if (!managed) return
    if (props.onBlur) props.onBlur(ev as any)
    setFocus(false)
  }

  const className = cx(props.className, hasFocus && focusC)

  const ref: RefCallback<HTMLElement> = (el: HTMLElement) => {
    if (!provided) setElement(el || undefined)
  }

  return {
    onFocus,
    onBlur,
    className,
    tabIndex,
    ref
  }
}

export const focusC = className('focus')
