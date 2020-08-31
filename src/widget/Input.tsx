import React, { ReactNode, useEffect, useState } from 'react'
import { Box, BoxProps } from '../box/Box'
import { SmallProps } from '../box/Small'
import { useVariantClass, VariantProps } from '../box/Variant'
import { FocusProps, useFocusableProps } from '../dyn/Focus'
import { Dimensions } from '../lib/Geometry'
import { useStateDeepEquals } from '../lib/Hooks'
import { useValue, Var } from '../lib/Var'
import { className, cx, px, Rule } from '../styling/Css'

export interface Pos {
  line: number
  column: number
}

export const zeroPos: Pos = { line: 0, column: 0 }

export interface Selection<A> {
  start: A
  end: A
}

export interface InputProps {
  value: Var<string>
  selection?: Var<Selection<number>>
  position?: Var<Selection<Pos>>
  className?: string
  placeholder?: string
  multiline?: boolean
  Primary?: ReactNode
}

type Props = InputProps & BoxProps & FocusProps & SmallProps & VariantProps

export function Input(props: Props) {
  const {
    multiline,
    className,
    Primary,
    selection,
    position,
    focus,
    placeholder,
    ...rest
  } = props

  const [elem, setElem] = useState<HTMLInputElement | HTMLTextAreaElement>()
  const [dim, setDim] = useStateDeepEquals<Dimensions | undefined>(undefined)
  const { onFocus, onBlur, ref } = useFocusableProps({ ...props, native: true }, elem)
  const value = useValue(props.value)
  const variantC = useVariantClass(props)

  useEffect(() => {
    if (selection) {
      return selection.effect(s => {
        if (elem) elem.setSelectionRange(s.start, s.end)
      })
    }
  }, [selection])

  const cardC = multiline ? multilineC : singlelineC

  const onChange = () => {
    if (!elem) return
    props.value.set(elem.value)
  }

  const snapshotSelectionAsync = () => {
    requestAnimationFrame(snapshotSelection)
  }

  const snapshotSelection = () => {
    if (!elem) return

    const start = elem.selectionStart
    const end = elem.selectionEnd
    if (start === null || end === null) return
    const sel = { start: start, end }

    if (selection) selection.set(sel)
    if (position) position.set(getPosition(sel))
  }

  const getPosition = ({ start, end }: Selection<number>): Selection<Pos> => {
    const lines = value.split('\n')

    const compute = (n: number) => {
      let chars = 0
      let line = 0
      while (line < lines.length && chars + lines[line].length < n) {
        chars += lines[line].length + 1
        line++
      }

      return { line, column: n - chars }
    }

    return {
      start: compute(start),
      end: compute(end)
    }
  }

  const shared = {
    ref: (el: HTMLInputElement & HTMLTextAreaElement) => {
      if (ref) ref(el)
      setElem(el ?? undefined)
    },
    spellCheck: false,
    placeholder: placeholder,
    className: cx(inputC, variantC, cardC),
    value: value,
    onChange,
    onKeyDown: snapshotSelectionAsync,
    onKeyUp: snapshotSelection,
    onMouseDown: snapshotSelectionAsync,
    onMouseMove: snapshotSelection,
    onMouseUp: snapshotSelection,
    onFocus,
    onBlur
  }

  const faux = (
    <Box
      dontConvertTextToLabels
      measureSize={setDim}
      className={cx(inputC, variantC, fauxC)}
    >
      {Primary || value}
      {'\uFEFF'}
    </Box>
  )

  let input: ReactNode = <input {...shared} />

  if (multiline)
    input = (
      <>
        <textarea {...shared} style={{ height: dim && px(dim.height) }} />
        {faux}
      </>
    )

  return (
    <Box {...rest} className={cx(className, containerC, !!Primary && primaryC)}>
      {input}
    </Box>
  )
}

// ----------------------------------------------------------------------------

const inputC = className('input')
const fauxC = className('faux')
const primaryC = className('Primary')
const multilineC = className('multiline')
const singlelineC = className('singleline')

const containerC = className('input-container', {
  position: 'relative',
  flexGrow: 1
})

inputC.style({
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  resize: 'none',
  margin: '0',

  border: 'none',
  outline: 'none',
  background: 'none',

  color: 'inherit',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word'
})

inputC.self('::placeholder').style({
  color: '#c0c9cc' // TODO
})

fauxC.style({
  position: 'absolute',
  top: 0,
  pointerEvents: 'none',
  visibility: 'hidden'
})

primaryC.deep(fauxC).style({
  visibility: 'visible'
})

// PrimaryC.sub(multilineC.or(singlelineC)).style({
//   ...({ '-webkit-text-fill-color': White.alpha(0.2).toString() } as any)
// })

containerC
  .not(Rule.firstChild)
  .child(inputC)
  .style({
    paddingLeft: px(0)
  })

containerC
  .not(Rule.lastChild)
  .child(inputC)
  .style({
    paddingRight: px(0)
  })
