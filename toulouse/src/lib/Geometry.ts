import { Iso } from './Var'
import { range } from './Range'

export class Point {
  constructor(
    readonly x: number,
    readonly y: number //
  ) {}

  add(o: Point) {
    return pt(this.x + o.x, this.y + o.y)
  }

  sub(o: Point) {
    return pt(this.x - o.x, this.y - o.y)
  }

  distance(o: Point) {
    return Math.sqrt(Math.pow(o.x - this.x, 2) + Math.pow(o.y - this.y, 2))
  }

  inside(r: Rect): boolean {
    return (
      this.x >= r.left &&
      this.x <= r.right &&
      this.y >= r.top && //
      this.y <= r.bottom
    )
  }

  static atAngle = (deg: number, r = 1) =>
    pt(r * Math.cos((deg / 180) * Math.PI), -r * Math.sin((deg / 180) * Math.PI))
}

export const pt = (x: number, y: number) => new Point(x, y)

// ----------------------------------------------------------------------------

export class Position {
  constructor(
    readonly left: number,
    readonly top: number //
  ) {}
}

// ----------------------------------------------------------------------------

export class BezierPoint {
  constructor(
    readonly c: Point,
    readonly d: Point,
    readonly p: Point //
  ) {}
}

export const bz = (c: Point, d: Point, p: Point) => new BezierPoint(c, d, p)

// ----------------------------------------------------------------------------

export class Rect {
  constructor(
    readonly left: number,
    readonly top: number,
    readonly right: number,
    readonly bottom: number
  ) {}

  toGeom() {
    return geom(
      this.left,
      this.top,
      this.right - this.left,
      this.bottom - this.top //
    )
  }

  width() {
    return this.right - this.left
  }

  height() {
    return this.bottom - this.top
  }

  setLeft(left: number) {
    return rect(left, this.top, this.right, this.bottom)
  }

  setTop(top: number) {
    return rect(this.left, top, this.right, this.bottom)
  }

  setRight(right: number) {
    return rect(this.left, this.top, right, this.bottom)
  }

  setBottom(bottom: number) {
    return rect(this.left, this.top, this.right, bottom)
  }

  centroid(): Point {
    return pt((this.left + this.right) / 2, (this.top + this.bottom) / 2)
  }

  place(at: Point): Rect {
    return rect(at.x, at.y, at.x + this.width(), at.y + this.height())
  }

  move(p: Point): Rect {
    return rect(this.left + p.x, this.top + p.y, this.right + p.x, this.bottom + p.y)
  }

  horizontal() {
    return range(this.left, this.right)
  }

  vertical() {
    return range(this.top, this.bottom)
  }

  contains(b: Rect): boolean {
    const hor = this.horizontal()
    const ver = this.vertical()
    const x = hor.within(b.left) && hor.within(b.right)
    const y = ver.within(b.top) && ver.within(b.bottom)
    return x && y
  }

  surface() {
    return this.width() * this.height()
  }

  shrink(m: number): Rect {
    return rect(this.left + m, this.top + m, this.right - m, this.bottom - m)
  }

  grow(m: number): Rect {
    return rect(this.left - m, this.top - m, this.right + m, this.bottom + m)
  }

  clip(c: Rect): Rect {
    return rect(
      Math.max(this.left, c.left),
      Math.max(this.top, c.top),
      Math.min(this.right, c.right),
      Math.min(this.bottom, c.bottom)
    )
  }

  topLeft(): Point {
    return pt(this.left, this.top)
  }

  topRight(): Point {
    return pt(this.right, this.top)
  }

  bottomLeft(): Point {
    return pt(this.left, this.bottom)
  }

  bottomRight(): Point {
    return pt(this.right, this.bottom)
  }

  intersect(b: Rect): Rect | undefined {
    const c = rect(
      Math.max(this.left, b.left),
      Math.max(this.top, b.top),
      Math.min(this.right, b.right),
      Math.min(this.bottom, b.bottom)
    )
    return c.right - c.left <= 0 || c.bottom - c.top <= 0 ? undefined : c
  }

  atLeft(g: Rect): Rect {
    return rect(g.left - this.width(), this.top, g.left, this.bottom)
  }

  atTop(g: Rect): Rect {
    return rect(this.left, g.top - this.height(), this.right, g.top)
  }

  atRight(g: Rect): Rect {
    return rect(g.right, this.top, g.right + this.width(), this.bottom)
  }

  atBottom(g: Rect): Rect {
    return rect(this.left, g.bottom, this.right, g.bottom + this.height())
  }

  // Move to constraint?
  around(a: Rect): Rect[] {
    return [
      this.atLeft(a),
      this.atTop(a),
      this.atRight(a),
      this.atBottom(a) //
    ]
  }

  similarity(b: Rect) {
    const d0 = this.topLeft().distance(b.topLeft())
    const d1 = this.topRight().distance(b.topRight())
    const d2 = this.bottomLeft().distance(b.bottomLeft())
    const d3 = this.bottomRight().distance(b.bottomRight())
    return (d0 + d1 + d2 + d3) / 4
  }

  diff(b: Rect): Rect {
    return rect(
      b.left - this.left,
      b.top - this.top,
      b.right - this.right,
      b.bottom - this.bottom
    )
  }

  static fromJson(json: any) {
    const { left, top, right, bottom } = json
    return rect(left, top, right, bottom)
  }

  toJson() {
    const { left, top, right, bottom } = this
    return { left, top, right, bottom }
  }
}

export const rect = (left: number, top: number, right: number, bottom: number) =>
  new Rect(left, top, right, bottom)

// ----------------------------------------------------------------------------

export class Geom {
  constructor(
    readonly left: number,
    readonly top: number,
    readonly width: number,
    readonly height: number
  ) {}

  toRect() {
    return rect(
      this.left,
      this.top,
      this.left + this.width,
      this.top + this.height //
    )
  }

  right() {
    return this.left + this.width
  }

  bottom() {
    return this.top + this.height
  }

  clip(c: Geom): Geom {
    return this.toRect().clip(c.toRect()).toGeom()
  }

  static fromJson(json: any) {
    const { left, top, width, height } = json
    return geom(left, top, width, height)
  }

  toJson() {
    const { left, top, width, height } = this
    return { left, top, width, height }
  }
}

export const geom = (left: number, top: number, width: number, height: number) =>
  new Geom(left, top, width, height)

export const GeomVsRect = new Iso<Rect, Geom>(
  r => r.toGeom(),
  g => g.toRect()
)

// ----------------------------------------------------------------------------

export type Sided =
  | number
  | { h: number; v: number }
  | { h: number }
  | { v: number }
  | Rect

export function sidedAsRect(s: Sided): Rect {
  if (typeof s === 'number') return rect(s, s, s, s)
  if ('h' in s && 'v' in s) return rect(s.h, s.v, s.h, s.v)
  if ('h' in s) return rect(s.h, 0, s.h, 0)
  if ('v' in s) return rect(0, s.v, 0, s.v)
  return s
}

// ----------------------------------------------------------------------------

export class Dimensions {
  constructor(
    readonly width: number,
    readonly height: number //
  ) {}
}

export const dimensions = (width: number, height: number) => new Dimensions(width, height)

// ----------------------------------------------------------------------------
// Creation and conversion

// ----------------------------------------------------------------------------

// export const placeRect = (r: Rect, p: Point): Rect =>
//   rect(p.x, p.y, p.x + width(r), p.y + height(r))

// export const fromPoints = (topLeft: Point, bottomRight: Point) =>
//   rect(topLeft.x, topLeft.y, bottomRight.x, bottomRight.y)

// export const shrink = (m: number, g: Rect): Rect =>
//   rect(g.left + m, g.top + m, g.right - m, g.bottom - m)

// export const grow = (m: number, g: Rect): Rect =>
//   rect(g.left - m, g.top - m, g.right + m, g.bottom + m)

// export const topLeft = (g: Rect): Point => pt(g.left, g.top)
// export const topRight = (g: Rect): Point => pt(g.right, g.top)
// export const bottomLeft = (g: Rect): Point => pt(g.left, g.bottom)
// export const bottomRight = (g: Rect): Point => pt(g.right, g.bottom)

// export const similarity = (a: Rect, bottom: Rect) =>
//   (distance(topLeft(a), topLeft(bottom)) +
//     distance(topRight(a), topRight(bottom)) +
//     distance(bottomLeft(a), bottomLeft(bottom)) +
//     distance(bottomRight(a), bottomRight(bottom))) /
//   4

// export const round = (r: Rect) =>
//   rect(
//     Math.round(r.left),
//     Math.round(r.top),
//     Math.round(r.right),
//     Math.round(r.bottom) //
//   )

// export const snap = (n: number, s: number) => Math.round(n / s) * s

// export const snapRect = (r: Rect, s: number) =>
//   rect(
//     snap(r.left, s),
//     snap(r.top, s),
//     snap(r.right, s),
//     snap(r.bottom, s) //
//   )

// export const atLeft = (g: Rect, at: Rect): Rect => ({
//   ...g,
//   left: at.left - width(g),
//   right: at.left
// })

// export const atTop = (g: Rect, at: Rect): Rect => ({
//   ...g,
//   top: at.top - height(g),
//   bottom: at.top
// })

// export const atRight = (g: Rect, at: Rect): Rect => ({
//   ...g,
//   left: at.right,
//   right: at.right + width(g)
// })

// export const atBottom = (g: Rect, at: Rect): Rect => ({
//   ...g,
//   top: at.bottom,
//   bottom: at.bottom + height(g)
// })

// export function boundingBox(...gs: Rect[]): Rect {
//   const left = Math.min(...gs.map(g => g.left))
//   const top = Math.min(...gs.map(g => g.top))
//   const right = Math.max(...gs.map(g => g.right))
//   const bottom = Math.max(...gs.map(g => g.bottom))
//   return rect(left, top, right, bottom)
// }

// // ----------------------------------------------------------------------------

// export const moveGeom = (g: Geom, p: Point): Geom =>
//   geom(g.left + p.x, g.top + p.y, g.width, g.height)
