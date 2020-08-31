import { Point, pt } from '../lib/Geometry'
import { Range, range } from '../lib/Range'
import { Rect, rect } from '../lib/Geometry'
import isEqual from 'lodash.isequal'
import { sortOn } from '../lib'

export interface Direction {
  left?: boolean
  top?: boolean
  right?: boolean
  bottom?: boolean
}

export type DirectionName = 'left' | 'top' | 'right' | 'bottom'

export const anyDirection = (d: Direction): boolean =>
  !!(d.left || d.top || d.right || d.bottom)

export const noDirection = (d: Direction): boolean => isEqual(d, {})

export const allDirections: Direction = {
  left: true,
  top: true,
  right: true,
  bottom: true
}

export const horizontally: Direction = { left: true, right: true }

export const vertically: Direction = { top: true, bottom: true }

export type Constraint = (to: Rect, dir: Direction) => Rect[] | undefined

export function run(
  constraint: Constraint,
  origin: Rect,
  to: Rect,
  direction: Direction
): Rect {
  const solved = constraint(to, direction)
  if (!solved) return to
  return solved.length ? solved[0] : origin
}

// ----------------------------------------------------------------------------

export const free: Constraint = () => undefined

export const none: Constraint = () => []

export const fixed = (p: Point): Constraint => r => {
  if (isEqual(r.centroid(), p)) return
  const hw = r.width() / 2
  const hh = r.height() / 2
  return [rect(p.x - hw, p.y - hh, p.x + hw, p.y + hh)]
}

export const snap = (p: Point, rad: number): Constraint => (r, d) => {
  const di = r.centroid().distance(p)
  if (di > rad) return
  return fixed(p)(r, d)
}

export const hline = (p: Point, w: number): Constraint => r => {
  const m = r.centroid()
  if (m.x >= p.x && m.x <= p.x + w && m.y === p.y) return
  const x = range(p.x, p.x + w).clamp(m.x)
  const hw = r.width() / 2
  const hh = r.height() / 2
  return [rect(x - hw, p.y - hh, x + hw, p.y + hh)]
}

export const grid = (n: number): Constraint => g =>
  g.left % n !== 0 || g.top % n !== 0 || g.right % n !== 0 || g.bottom % n !== 0
    ? [
        rect(
          Math.round(g.left / n) * n,
          Math.round(g.top / n) * n,
          Math.round(g.right / n) * n,
          Math.round(g.bottom / n) * n
        )
      ]
    : undefined

export const bounded = (w: Range, h: Range): Constraint => (r, d) =>
  !w.within(r.width()) || !h.within(r.height())
    ? [
        rect(
          d.right ? r.left : r.right - w.clamp(r.width()),
          d.bottom ? r.top : r.bottom - h.clamp(r.height()),
          d.left ? r.right : r.left + w.clamp(r.width()),
          d.top ? r.bottom : r.top + h.clamp(r.height())
        )
      ]
    : undefined

export const inside = (b: Rect): Constraint => (r, d) => {
  if (b.contains(r)) return

  if (anyDirection(d))
    return [
      rect(
        d.left ? Math.max(r.left, b.left) : r.left,
        d.top ? Math.max(r.top, b.top) : r.top,
        d.right ? Math.min(r.right, b.right) : r.right,
        d.bottom ? Math.min(r.bottom, b.bottom) : r.bottom
      )
    ]

  if (r.width() > b.width() || r.height() > b.height()) return []

  return [
    r.place(
      pt(
        range(b.left, b.right - r.width()).clamp(r.left),
        range(b.top, b.bottom - r.height()).clamp(r.top)
      )
    )
  ]
}

export const outside = (b: Rect): Constraint => (r, d) => {
  if (!r.intersect(b)) return

  if (anyDirection(d)) {
    const options = [
      d.left !== undefined ? r.setLeft(Math.max(r.left, b.right)) : undefined,
      d.top !== undefined ? r.setTop(Math.max(r.top, b.bottom)) : undefined,
      d.right !== undefined ? r.setRight(Math.min(r.right, b.left)) : undefined,
      d.bottom !== undefined ? r.setBottom(Math.min(r.bottom, b.top)) : undefined
    ]

    return options.filter((v): v is Rect => !!v).filter(x => x.surface() > 0)
  }

  return r.around(b)
}

export const solver = (...cons: Constraint[]): Constraint => (r, d) => {
  function run(rs: Rect[], level: number): Rect[] {
    if (level > 3) return []
    const test = rs.map(r => ({ r, alts: cons.map(con => con(r, d)) }))
    return test.flatMap(t =>
      t.alts.some(a => !!a)
        ? run(
            t.alts.filter((v): v is Rect[] => v !== undefined).flatMap(a => a),
            level + 1
          )
        : [t.r]
    )
  }

  const out = run([r], 0)
  const solved = sortOn(out, o => o.similarity(r))
  return solved.length ? [solved[0]] : []
}

export const oneOf = (...cs: Constraint[]): Constraint => (g, d) => {
  if (!cs.length) return
  const subs = cs.map(c => c(g, d))
  if (subs.some(a => !a)) return
  return subs.filter((v): v is Rect[] => v !== undefined).flatMap(a => a)
}

export const lazy = (f: () => Constraint): Constraint => (g, d) => f()(g, d)

export const compose = (...cs: Constraint[]): Constraint => (g, d) =>
  cs.reduceRight((qs, c) => qs.flatMap(q => c(q, d) || [q]), [g])

export const rubber = (c: Constraint, n = 1, dir = allDirections): Constraint => (g, d) =>
  (c(g, d) || [g]).map(to => {
    const df = to.diff(g)
    const f = (t: number, q: number) =>
      Math.round(t + Math.sign(q) * Math.pow(Math.abs(q), 1 / (1 + n)))
    return rect(
      dir.left ? f(to.left, df.left) : to.left,
      dir.top ? f(to.top, df.top) : to.top,
      dir.right ? f(to.right, df.right) : to.right,
      dir.bottom ? f(to.bottom, df.bottom) : to.bottom
    )
  })
