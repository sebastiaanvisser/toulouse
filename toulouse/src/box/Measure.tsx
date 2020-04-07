import React, { createContext, ReactNode, useContext } from 'react'
import { Dimensions, Geom, Rect, rect, geom, dimensions } from '../lib/Geometry'

export interface MeasureProps {
  measureSize?: (m: Dimensions) => void
  measureAbs?: (m: Geom) => void
  measureRel?: (m: Geom) => void
}

// ----------------------------------------------------------------------------

export type AttachProps = { target: HTMLElement; abs: Geom }

export const AttachCtx = createContext<AttachProps>({
  target: window.document.documentElement,
  abs: geom(0, 0, 0, 0)
})

export function Attaching({ children }: { children: (ap: AttachProps) => ReactNode }) {
  return <AttachCtx.Consumer>{children}</AttachCtx.Consumer>
}

export const useAttachment = () => useContext(AttachCtx)

// ----------------------------------------------------------------------------

export function measure(
  props: MeasureProps,
  el: HTMLElement,
  attachProps?: (p: AttachProps) => void
) {
  const { measureSize, measureAbs, measureRel } = props

  if (measureSize) measureSize(measureDimensions(el))
  if (measureRel) measureRel(measureRelative(el))
  if (measureAbs || attachProps) {
    const abs = measureAbsolute(el)
    if (measureAbs) measureAbs(abs)
    if (attachProps) attachProps({ target: el, abs })
  }
}

export const measureDimensions = (el: HTMLElement): Dimensions =>
  dimensions(el.offsetWidth, el.offsetHeight)

export const measureRelative = (el: HTMLElement): Geom =>
  geom(el.offsetLeft, el.offsetTop, el.offsetWidth, el.offsetHeight)

export function measureAbsolute(el: HTMLElement): Geom {
  const zoom = parseFloat(el.style.zoom || '1')
  let left = el.offsetLeft * zoom
  let top = el.offsetTop * zoom
  let width = el.offsetWidth * zoom
  let height = el.offsetHeight * zoom

  let cur: HTMLElement = el
  while (cur instanceof HTMLElement && cur !== document.body) {
    const op = cur.offsetParent as HTMLElement

    // Collect all the zoom styles between us and the offset parent.
    let p: HTMLElement | null = cur.parentElement
    let zoom = 1
    while (p) {
      zoom *= parseFloat(p.style.zoom || '1')
      if (p === op) break
      p = p.parentElement
    }

    left *= zoom
    top *= zoom
    width *= zoom
    height *= zoom

    left += op.offsetLeft - op.scrollLeft
    top += op.offsetTop - op.scrollTop

    cur = op
  }

  return geom(left, top, width, height)
}

// ----------------------------------------------------------------------------

export function isAncestorOrSelf(el: HTMLElement, of: HTMLElement) {
  let cur: Element | null = el as Element
  while (cur) {
    if (cur === of) return true
    cur = cur.parentElement
  }
  return false
}

export function isDetached(el: HTMLElement) {
  let cur: Element | null = el as Element
  while (cur) {
    if (!cur.parentElement) {
      return cur !== document.documentElement
    }
    cur = cur.parentElement
  }
  return false
}

// ----------------------------------------------------------------------------

export function getMargin(el: HTMLElement): Rect {
  const style = window.getComputedStyle(el).margin
  return parseFourSided(style || '')
}

function parseFourSided(str: string): Rect {
  const parts = str
    .split(/\s+/)
    .map(x => parseInt(x))
    .filter(x => !isNaN(x))

  switch (parts.length) {
    case 1:
      return rect(parts[0], parts[0], parts[0], parts[0])
    case 2:
      return rect(parts[1], parts[0], parts[1], parts[0])
    case 3:
      return rect(parts[2], parts[0], parts[2], parts[1])
    case 4:
      return rect(parts[3], parts[0], parts[1], parts[2])
    default:
      return rect(0, 0, 0, 0)
  }
}
