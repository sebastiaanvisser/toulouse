import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useEffect
} from 'react'
import { Dimensions, Geom, Rect } from '../lib/Geometry'
import { useWindowEvent } from '../lib/Hooks'
import { Use, useVar, Var } from '../lib/Var'
import { useCssInstalled } from '../styling/Css'

// ----------------------------------------------------------------------------

export interface AttachProps {
  target: HTMLElement
  geom: Geom
}

export const AttachCtx = createContext<AttachProps>({} as any)

export const useAttachment = () => useContext(AttachCtx)

// ----------------------------------------------------------------------------

interface Props {
  attachment: () => ReactNode
  inside?: boolean
  children: ReactElement
  elem?: (el: HTMLElement) => void
}

export function Attach(props: Props) {
  const { children, attachment: node, inside, elem: fwElem } = props

  const target = useVar<HTMLElement | undefined>(undefined, (a, b) => a === b)
  const geom = useVar<Geom | undefined>(undefined)

  const measure = () => {
    const el = target.get()
    if (el) geom.set(measureAbsolute(el))
  }

  useWindowEvent('resize', measure, undefined, [target])

  const elem = (el: HTMLElement) => {
    if (el) target.set(el)
    if (children.props.elem) children.props.elem(el)
    if (fwElem) fwElem(el)
    measure()
  }

  useCssInstalled(measure)

  const attachment = (
    <Use value={Var.pack({ target, geom })}>
      {({ target, geom }) =>
        target &&
        geom && <AttachCtx.Provider value={{ target, geom }}>{node()}</AttachCtx.Provider>
      }
    </Use>
  )

  if (inside) {
    return (
      <>
        {React.cloneElement(children, { elem, onGeom: measure, children: [attachment] })}
      </>
    )
  }

  return (
    <>
      {React.cloneElement(children, { elem, onGeom: measure })}
      {attachment}
    </>
  )
}

// ----------------------------------------------------------------------------

export function useGeom(el?: HTMLElement) {
  const geom = useVar<Geom | undefined>(undefined)

  const measure = () => {
    if (el) geom.set(measureAbsolute(el))
  }

  useEffect(measure, [el])
  useWindowEvent('resize', measure, undefined, [el])
  useCssInstalled(measure)

  return geom
}

// ----------------------------------------------------------------------------
// Measure helpers

export const measureDimensions = (el: HTMLElement): Dimensions =>
  new Dimensions(el.offsetWidth, el.offsetHeight)

export const measureRelative = (el: HTMLElement): Geom =>
  new Geom(el.offsetLeft, el.offsetTop, el.offsetWidth, el.offsetHeight)

export function measureAbsolute(el: HTMLElement): Geom {
  const zoom = parseFloat(el.style.zoom || '1')
  let left = el.offsetLeft * zoom
  let top = el.offsetTop * zoom
  let width = el.offsetWidth * zoom
  let height = el.offsetHeight * zoom

  let cur: HTMLElement = el
  while (cur instanceof HTMLElement && cur !== document.body) {
    const op = cur.offsetParent as HTMLElement

    if (!op) break

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

  return new Geom(left, top, width, height)
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
  const pts = str
    .split(/\s+/)
    .map(x => parseInt(x))
    .filter(x => !isNaN(x))

  switch (pts.length) {
    case 1:
      return new Rect(pts[0], pts[0], pts[0], pts[0])
    case 2:
      return new Rect(pts[1], pts[0], pts[1], pts[0])
    case 3:
      return new Rect(pts[2], pts[0], pts[2], pts[1])
    case 4:
      return new Rect(pts[3], pts[0], pts[1], pts[2])
    default:
      return new Rect(0, 0, 0, 0)
  }
}
