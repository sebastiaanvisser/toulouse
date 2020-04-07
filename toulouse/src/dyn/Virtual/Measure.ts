import { Dimensions, Geom, geom, dimensions } from '../../lib/Geometry'
import { range } from '../../lib/Range'

export interface Measurements {
  span: Dimensions
  mode: Dimensions
  cols: (number | undefined)[]
  rows: (number | undefined)[]
}

export const emptyMeasurements: Measurements = {
  span: dimensions(0, 0),
  mode: dimensions(0, 0),
  cols: [],
  rows: []
}

// ----------------------------------------------------------------------------

export function computeRegion(m: Measurements, vp: Geom): Geom {
  const { left, width } = regionLeftWidth(m, vp)
  const { top, height } = regionTopHeight(m, vp)

  return geom(left, top, width, height)
}

export const cellWidth = (m: Measurements, x: number) => m.cols[x] || m.mode.width
export const cellHeight = (m: Measurements, y: number) => m.rows[y] || m.mode.height

function regionLeftWidth(m: Measurements, vpx: Geom): { left: number; width: number } {
  let left = 0
  let width = 0
  for (let x = 0; x < vpx.left + vpx.width && left + width < m.span.width; ) {
    x += cellWidth(m, left + width)
    if (x > vpx.left) width++
    else left++
  }
  return { left, width }
}

function regionTopHeight(m: Measurements, vpx: Geom): { top: number; height: number } {
  let top = 0
  let height = 0
  for (let y = 0; y < vpx.top + vpx.height && top + height < m.span.height; ) {
    y += cellHeight(m, top + height)
    if (y > vpx.top) height++
    else top++
  }
  return { top, height }
}

export function setCellWidth(m: Measurements, i: number, s: number): Measurements {
  const { cols } = m
  const ci = cols[i]
  cols[i] = ci === undefined ? s : Math.max(ci, s)
  return {
    ...m,
    mode: dimensions(mode(sample(cols, 100)), m.mode.height)
  }
}

export function setCellHeight(m: Measurements, i: number, s: number): Measurements {
  const { rows } = m
  const ri = rows[i]
  rows[i] = ri === undefined ? s : Math.max(ri, s)
  return {
    ...m,
    mode: dimensions(m.mode.width, mode(sample(rows, 100)))
  }
}

export const viewbox = (m: Measurements, region: Geom): Geom =>
  geom(
    range(0, region.left)
      .iterate()
      .reduce((a, c) => a + cellWidth(m, c), 0),
    range(0, region.top)
      .iterate()
      .reduce((a, c) => a + cellHeight(m, c), 0),
    range(1, region.width)
      .iterate()
      .reduce((a, c) => a + cellWidth(m, region.left + c), cellWidth(m, 0)),
    range(1, region.height)
      .iterate()
      .reduce((a, c) => a + cellHeight(m, region.top + c), cellHeight(m, 0))
  )

export function scrollWidth(m: Measurements): number {
  let o = cellWidth(m, 0)
  for (let i = 1; i < m.span.width; i++) o += cellWidth(m, i)
  return o
}

export function scrollHeight(m: Measurements): number {
  let o = cellHeight(m, 0)
  for (let i = 1; i < m.span.height; i++) o += cellHeight(m, i)
  return o
}

// ----------------------------------------------------------------------------

function sample<A>(xs: A[], count = 100) {
  const out: A[] = []
  for (var i = 0; i < count; i++) out.push(xs[Math.floor(xs.length * Math.random())])
  return out
}

function mode(xs: (number | undefined)[]): number {
  if (xs.length === 0) return 0

  const counts: { [n: number]: number } = {}
  for (let o of xs) {
    if (o !== undefined) counts[o] = counts[o] === undefined ? 1 : counts[o] + 1
  }

  let max = -Infinity
  let collect: number[] = []
  for (const n in counts) {
    const c = counts[n]
    if (counts[n] > max) {
      collect = [+n]
      max = c
    } else if (counts[n] === max) {
      collect.push(+n)
    }
  }

  return Math.round(collect[0])
}
