import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { Box, BoxProps } from '../box/Box'
import { SmallProps } from '../box/Small'
import { usePalette } from '../box/Themed'
import { Unit } from '../box/Unit'
import { useVariantClass, VariantProps } from '../box/Variant'
import { measureAbsolute } from '../dyn/Attach'
import { useFocus } from '../dyn/Focus'
import { Dimensions } from '../lib/Geometry'
import { memo1 } from '../lib/Memo'
import { useValue, useVar, Var } from '../lib/Var'
import { cx, px } from '../styling/Classy'
import { Rgba } from '../styling/Rgba'
import { style } from '../styling/Rule'
import { FirstChild, LastChild } from '../styling/Selector'

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
  flexible?: boolean
  autoselect?: boolean
  autofocus?: boolean
  highlight?: ReactNode
  onGeom?: () => void
  focus?: Var<boolean>
}

type Props = InputProps & BoxProps & SmallProps & VariantProps

export function Input(props: Props) {
  const {
    multiline,
    className,
    highlight,
    selection,
    position,
    focus,
    flexible,
    autoselect,
    autofocus,
    placeholder,
    onGeom,
    ...rest
  } = props

  const isFirst = useRef(true)
  const [fauxElem, setFauxElem] = useState<HTMLElement>()
  const [elem, setElem] = useState<HTMLInputElement | HTMLTextAreaElement>()
  const fauxDimVar = useVar<Dimensions | undefined>(undefined)
  const fauxDim = useValue(fauxDimVar)

  if (focus) useFocus(elem, focus)

  const value = useValue(props.value)
  const variantC = useVariantClass(props)
  const palette = usePalette()

  useEffect(() => {
    if (autoselect && elem) {
      setTimeout(() => elem.select())
    }
  }, [autoselect, elem])

  useEffect(() => {
    if (autofocus && elem) {
      setTimeout(() => elem.focus())
    }
  }, [autofocus, elem])

  useEffect(() => {
    if (selection) {
      return selection.effect(s => {
        elem?.setSelectionRange(s.start, s.end)
      })
    }
  }, [selection])

  const inputRef = (el: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (el) setElem(el)
  }

  const onChange = () => {
    if (!elem) return
    props.value.set(elem.value)
    if (onGeom) requestAnimationFrame(onGeom)
  }

  useEffect(() => {
    if (fauxElem) {
      const measure = () => {
        fauxDimVar.set(measureAbsolute(fauxElem).dimensions)
        isFirst.current = false
      }
      if (isFirst.current) {
        requestAnimationFrame(measure)
      } else measure()
    }
  })

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

  const multiFaux = (
    <Box
      elem={setFauxElem}
      dontConvertTextToLabels
      className={cx(inputC, variantC, fauxC)} //
    >
      {highlight || value}
      {'\uFEFF'}
    </Box>
  )

  const singleFaux = (
    <Box
      elem={setFauxElem}
      dontConvertTextToLabels
      style={{ width: 'fit-content' }}
      className={cx(inputC, variantC, singleFauxC)}
    >
      {highlight || value || placeholder}
    </Box>
  )

  const inputProps = {
    ref: inputRef,
    spellCheck: false,
    placeholder: placeholder,
    className: cx(inputC, variantC, placeholderC.get(palette.Fg.alpha(0.2))),
    value: value,
    onChange,
    onKeyDown: snapshotSelectionAsync,
    onKeyUp: snapshotSelection,
    onMouseDown: snapshotSelectionAsync,
    onMouseMove: snapshotSelection,
    onMouseUp: snapshotSelection
  }
  let input: ReactNode = (
    <>
      <input
        {...inputProps}
        style={{ flexGrow: 1, width: fauxDim && px(Math.ceil(fauxDim.width)) }}
      />
      {flexible && singleFaux}
    </>
  )

  if (multiline)
    input = (
      <>
        <textarea
          {...inputProps}
          style={{ flexGrow: 1, height: fauxDim && px(fauxDim.height) }}
        />
        {multiFaux}
      </>
    )

  return (
    <Box fg {...rest} h className={cx(className, containerC, !!highlight && primaryC)}>
      {input}
    </Box>
  )
}

// ----------------------------------------------------------------------------

const containerC = style({
  position: 'relative',
  flexShrink: 0,
  flexGrow: 1
}).name('container')

const inputC = style({
  display: 'block',
  // width: '100%',
  boxSizing: 'border-box',
  resize: 'none',
  margin: '0',

  border: 'none',
  outline: 'none',
  background: 'none',

  color: 'inherit',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word'
}).name('input')

containerC
  .not(FirstChild)
  .child(inputC)
  .style({
    paddingLeft: px(0)
  })

containerC
  .not(LastChild)
  .child(inputC)
  .style({
    paddingRight: px(0)
  })

// Because we might start measuring on startup, we need to make sure this style
// is already available. Input faux measuring might result in an infinite loop
// when these rules are not installed on time.

inputC.self('::placeholder').style({})

const placeholderC = memo1((color: Rgba) => {
  const phC = style().name('placeholder')
  phC.self('::placeholder').style({
    color: color.toString()
  })
  return phC
})

const fauxC = style({
  position: 'absolute',
  top: 0,
  pointerEvents: 'none',
  visibility: 'hidden'
}).name('faux')

const singleFauxC = style({
  position: 'absolute',
  top: 0,
  whiteSpace: 'pre',
  width: 'fit-content',
  height: px(Unit),
  pointerEvents: 'none',
  visibility: 'hidden'
  // background: 'red'
})

const primaryC = style()
primaryC.deep(fauxC).style({
  visibility: 'visible'
})
