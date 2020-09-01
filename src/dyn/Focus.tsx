import { cloneElement, ReactElement, useEffect, useState } from 'react'
import { useEvent } from '../lib/Hooks'
import { Var } from '../lib/Var'

export function useFocus(elem: HTMLElement | undefined, focus: Var<boolean>) {
  useEvent(elem, 'focus', () => focus.set(true))
  useEvent(elem, 'blur', () => focus.set(false))

  useEffect(
    () =>
      focus.batch().effect(f => {
        if (f) elem?.focus()
        else elem?.blur()
      }),
    [elem]
  )
}

// ----------------------------------------------------------------------------

interface Props {
  focus: Var<boolean>
  elem?: (el: HTMLElement) => void
  children: ReactElement
}

export function Focusable(props: Props) {
  const { children, focus, elem: fwElem } = props
  const { elem: bwElem } = children.props

  const [elem, setElem] = useState<HTMLElement>()

  useFocus(elem, focus)

  const onElem = (el: HTMLElement) => {
    if (el) setElem(el)
    if (fwElem) fwElem(el)
    if (bwElem) bwElem(el)
  }

  return cloneElement(children, { elem: onElem })
}
