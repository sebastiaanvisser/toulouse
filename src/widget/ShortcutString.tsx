import React from 'react'
import { useGlobalKey, Alt, Key } from '../dyn/GlobalKey'
import { Highlight } from '../dyn/Highlight'
import { useValue } from '../lib/Var'

interface ShortcutStringProps {
  char: string
  alt?: boolean
  event: () => void
  children: string
}

export function ShortcutString(props: ShortcutStringProps) {
  const { event, char, children, alt } = props
  const combo = alt === false ? [Key(char)] : Alt(char)
  const down = useValue(useGlobalKey(combo, event))

  const highlighted = () => {
    const { children, char } = props
    return Highlight(children, [
      {
        regexp: new RegExp(`(${char[0]})`, 'gi'),
        apply: s => <u>{s}</u>,
        max: 1
      }
    ])
  }

  return <>{down[0] === 'AltLeft' ? highlighted() : children}</>
}
