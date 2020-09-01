import { useEffect, useRef } from 'react'
import { useDocumentEvent } from '../lib/Hooks'
import { Var } from '../lib/Var'

export const Key = (c: string) => {
  if (c.match(/\d/)) return 'Digit' + c[0]
  return 'Key' + c[0].toUpperCase()
}

// Todo, don't limit to left.
export const Ctrl = (c: string) => ['ControlLeft', Key(c)]
export const Alt = (c: string) => ['AltLeft', Key(c)]
export const Meta = (c: string) => ['MetaLeft', Key(c)]

export function useGlobalKey(combo: string[], event: () => void) {
  const down = useRef(new Var<string[]>([])).current

  useEffect(
    () =>
      down.equals(combo).effect(v => {
        if (v) event()
      }),
    [combo, event]
  )

  const handleDown = (ev: KeyboardEvent) => {
    if (combo.indexOf(ev.code) !== -1) {
      down.modify(s => s.concat(ev.code))
    }
  }

  const handleUp = (ev: KeyboardEvent) => {
    down.modify(xs => xs.filter(v => v !== ev.code))
  }

  useDocumentEvent('keydown', handleDown, [], true, true)
  useDocumentEvent('keyup', handleUp, [], true, true)

  return down
}
