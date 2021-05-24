import { px } from '../styling/Classy'
import { Edit } from './Edit'
import { Iso } from './Iso'
import { range } from './Range'

const fmt = (n: number, d = 100000) => Math.round(n * d) / d

export class Point {
  constructor(
    readonly x: number,
    readonly y: number //
  ) {}

  add(o: Point) {
    return new Point(this.x + o.x, this.y + o.y)
  }

  sub(o: Point) {
    return new Point(this.x - o.x, this.y - o.y)
  }

  distance(o: Point) {
    return Math.sqrt(Math.pow(o.x - this.x, 2) + Math.pow(o.y - this.y, 2))
  }

  fmt(): string {
    return `${fmt(this.x)},${fmt(this.y)}`
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
    new Point(
      r * Math.cos((deg / 180) * Math.PI),
      -r * Math.sin((deg / 180) * Math.PI) //
    )
}

// ----------------------------------------------------------------------------

export class BezierPoint {
  constructor(
    readonly c: Point,
    readonly d: Point,
    readonly p: Point //
  ) {}
}

// export const bz = (c: Point, d: Point, p: Point) => new BezierPoint(c, d, p)

// ----------------------------------------------------------------------------

export class Position {
  constructor(
    readonly left: number,
    readonly top: number //
  ) {}

  get asPoint() {
    return new Point(this.left, this.top)
  }

  add(pos: { left: number; top: number }) {
    return new Position(
      this.left + pos.left,
      this.top + pos.top //
    )
  }

  dx(x: number) {
    return new Position(this.left + x, this.top)
  }

  dy(y: number) {
    return new Position(this.left, this.top + y)
  }

  clamp(g: Geom) {
    return new Position(
      g.horizontally.clamp(this.left),
      g.vertically.clamp(this.top) //
    )
  }

  get negate() {
    return new Position(-this.left, -this.top)
  }

  static origin = new Position(0, 0)

  static combine = (topLeft: Position, bottomRight: Position) =>
    new Rect(topLeft.left, topLeft.top, bottomRight.left, bottomRight.top)

  static Left = (p: Position) => new Edit(p.left, left => new Position(left, p.top))
  static Top = (p: Position) => new Edit(p.top, top => new Position(p.left, top))
}

// ----------------------------------------------------------------------------

export class Rect {
  constructor(
    readonly left: number,
    readonly top: number,
    readonly right: number,
    readonly bottom: number
  ) {}

  get asGeom() {
    return new Geom(
      this.left,
      this.top,
      this.right - this.left,
      this.bottom - this.top //
    )
  }

  get normalized() {
    return new Rect(
      Math.min(this.left, this.right),
      Math.min(this.top, this.bottom),
      Math.max(this.left, this.right),
      Math.max(this.top, this.bottom)
    )
  }

  get width() {
    return this.right - this.left
  }

  get height() {
    return this.bottom - this.top
  }

  setLeft(left: number) {
    return new Rect(left, this.top, this.right, this.bottom)
  }

  setTop(top: number) {
    return new Rect(this.left, top, this.right, this.bottom)
  }

  setRight(right: number) {
    return new Rect(this.left, this.top, right, this.bottom)
  }

  setBottom(bottom: number) {
    return new Rect(this.left, this.top, this.right, bottom)
  }

  get centroid(): Point {
    return new Point((this.left + this.right) / 2, (this.top + this.bottom) / 2)
  }

  add(r: Rect) {
    return new Rect(
      this.left + r.left,
      this.top + r.top,
      this.right + r.right,
      this.bottom + r.bottom //
    )
  }

  place(at: Point): Rect {
    return new Rect(at.x, at.y, at.x + this.width, at.y + this.height)
  }

  move(p: Point): Rect {
    return new Rect(this.left + p.x, this.top + p.y, this.right + p.x, this.bottom + p.y)
  }

  get horizontal() {
    return range(this.left, this.right)
  }

  get vertical() {
    return range(this.top, this.bottom)
  }

  contains(b: Rect): boolean {
    const hor = this.horizontal
    const ver = this.vertical
    const x = hor.within(b.left) && hor.within(b.right)
    const y = ver.within(b.top) && ver.within(b.bottom)
    return x && y
  }

  get surface() {
    return this.width * this.height
  }

  margin(m: number): Rect {
    return new Rect(this.left - m, this.top - m, this.right + m, this.bottom + m)
  }

  clip(c: Rect): Rect {
    return new Rect(
      Math.max(this.left, c.left),
      Math.max(this.top, c.top),
      Math.min(this.right, c.right),
      Math.min(this.bottom, c.bottom)
    )
  }

  get topLeft(): Position {
    return new Position(this.left, this.top)
  }

  get topRight(): Position {
    return new Position(this.right, this.top)
  }

  get bottomLeft(): Position {
    return new Position(this.left, this.bottom)
  }

  get bottomRight(): Position {
    return new Position(this.right, this.bottom)
  }

  get asSides(): Sides {
    const { left, top, right, bottom } = this
    if (left === 0 && top === 0 && right === 0 && bottom === 0)
      return new Sides(undefined)
    if (left === top && left === right && left === bottom) return new Sides(left)
    if (left === right && top === 0 && bottom === 0) return new Sides({ h: left })
    if (top === bottom && left === 0 && right === 0) return new Sides({ v: top })
    if (left === right && top === bottom) return new Sides({ h: left, v: top })
    return new Sides(this)
  }

  intersect(b: Rect): Rect | undefined {
    const c = new Rect(
      Math.max(this.left, b.left),
      Math.max(this.top, b.top),
      Math.min(this.right, b.right),
      Math.min(this.bottom, b.bottom)
    )
    return c.right - c.left <= 0 || c.bottom - c.top <= 0 ? undefined : c
  }

  atLeft(g: Rect): Rect {
    return new Rect(g.left - this.width, this.top, g.left, this.bottom)
  }

  atTop(g: Rect): Rect {
    return new Rect(this.left, g.top - this.height, this.right, g.top)
  }

  atRight(g: Rect): Rect {
    return new Rect(g.right, this.top, g.right + this.width, this.bottom)
  }

  atBottom(g: Rect): Rect {
    return new Rect(this.left, g.bottom, this.right, g.bottom + this.height)
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
    const d0 = this.topLeft.asPoint.distance(b.topLeft.asPoint)
    const d1 = this.topRight.asPoint.distance(b.topRight.asPoint)
    const d2 = this.bottomLeft.asPoint.distance(b.bottomLeft.asPoint)
    const d3 = this.bottomRight.asPoint.distance(b.bottomRight.asPoint)
    return (d0 + d1 + d2 + d3) / 4
  }

  diff(b: Rect): Rect {
    return new Rect(
      b.left - this.left,
      b.top - this.top,
      b.right - this.right,
      b.bottom - this.bottom
    )
  }
  toJson() {
    const { left, top, right, bottom } = this
    return { left, top, right, bottom }
  }

  static fromJson(json: any) {
    const { left, top, right, bottom } = json
    return new Rect(left, top, right, bottom)
  }

  static zero = new Rect(0, 0, 0, 0)

  static left = (x: number) => new Rect(x, 0, 0, 0)
  static top = (y: number) => new Rect(0, y, 0, 0)
  static right = (x: number) => new Rect(0, 0, x, 0)
  static bottom = (y: number) => new Rect(0, 0, 0, y)
}

// ----------------------------------------------------------------------------

export class Interval {
  constructor(
    readonly from: number,
    readonly to: number //
  ) {}

  get normalized() {
    return new Interval(Math.min(this.from, this.to), Math.max(this.from, this.to))
  }

  get span() {
    return new Span(this.from, this.to - this.from)
  }
}

// ----------------------------------------------------------------------------

export class Span {
  constructor(
    readonly start: number,
    readonly size: number //
  ) {}

  get end() {
    return this.start + this.size
  }

  get enum(): number[] {
    const out: number[] = []
    const { start, end } = this
    for (let x = start; x < end; x++) out.push(x)
    return out
  }

  iterate<A>(f: (n: number, ix: number) => A): A[] {
    return this.enum.map(f)
  }

  clamp(n: number) {
    return Math.min(Math.max(this.start, n), this.end - 1)
  }

  d(d: number) {
    return new Span(this.start + d, this.size)
  }

  grow(d: number) {
    return new Span(this.start, this.size + d)
  }

  contains(i: number) {
    return i >= this.start && i < this.end
  }

  intersect(that: Span) {
    const start = Math.max(this.start, that.start)
    const end = Math.min(this.end, that.end)
    return new Span(start, end - start)
  }

  static combine(h: Span, v: Span): Geom {
    return new Geom(h.start, v.start, h.size, v.size)
  }
}

// ----------------------------------------------------------------------------

export class Geom {
  constructor(
    readonly left: number,
    readonly top: number,
    readonly width: number,
    readonly height: number
  ) {}

  get asRect() {
    return new Rect(
      this.left,
      this.top,
      this.left + this.width,
      this.top + this.height //
    )
  }

  get right() {
    return this.left + this.width
  }

  get bottom() {
    return this.top + this.height
  }

  contains(p: Position) {
    return (
      p.left >= this.left &&
      p.top >= this.top &&
      p.left < this.right &&
      p.top < this.bottom
    )
  }

  add(pos: Position) {
    return new Geom(
      this.left + pos.left,
      this.top + pos.top,
      this.width,
      this.height //
    )
  }

  dx(x: number) {
    return new Geom(this.left + x, this.top, this.width, this.height)
  }

  dy(y: number) {
    return new Geom(this.left, this.top + y, this.width, this.height)
  }

  grow(width: number, height: number) {
    return new Geom(
      this.left,
      this.top,
      this.width + width,
      this.height + height //
    )
  }

  sub(pos: Position) {
    return this.add(pos.negate)
  }

  intersect(b: Geom): Geom | undefined {
    return this.asRect.intersect(b.asRect)?.asGeom
  }

  get horizontally() {
    return new Span(this.left, this.width)
  }

  get vertically() {
    return new Span(this.top, this.height)
  }

  mapHorizontally(f: (span: Span) => Span): Geom {
    return Span.combine(f(this.horizontally), this.vertically)
  }

  mapVertically(f: (span: Span) => Span): Geom {
    return Span.combine(this.horizontally, f(this.vertically))
  }

  get topLeft(): Position {
    return new Position(this.left, this.top)
  }

  get topRight(): Position {
    return new Position(this.right, this.top)
  }

  get bottomLeft(): Position {
    return new Position(this.left, this.bottom)
  }

  get bottomRight(): Position {
    return new Position(this.right, this.bottom)
  }

  clip(c: Geom): Geom {
    return this.asRect.clip(c.asRect).asGeom
  }

  get dimensions() {
    return new Dimensions(this.width, this.height)
  }

  static fromJson(json: any) {
    const { left, top, width, height } = json
    return new Geom(left, top, width, height)
  }

  toJson() {
    const { left, top, width, height } = this
    return { left, top, width, height }
  }
}

export const GeomVsRect = new Iso<Rect, Geom>(
  r => r.asGeom,
  g => g.asRect
)

// ----------------------------------------------------------------------------

export type SidesDef =
  | undefined
  | number
  | true
  | { h: number }
  | { v: number }
  | { h: number; v: number }
  | Rect

export class Sides {
  constructor(readonly def: SidesDef) {}

  copy(sides: Sides) {
    return new Sides(sides.def)
  }

  get asRect(): Rect {
    const d = this.def
    if (!d) return new Rect(0, 0, 0, 0)
    if (d === true) return new Rect(10, 10, 10, 10)
    if (typeof d === 'number') return new Rect(d, d, d, d)
    if ('h' in d && 'v' in d) return new Rect(d.h, d.v, d.h, d.v)
    if ('h' in d) return new Rect(d.h, 0, d.h, 0)
    if ('v' in d) return new Rect(0, d.v, 0, d.v)
    return d
  }

  add(s: Sides): Sides {
    return this.asRect.add(s.asRect).asSides
  }

  render(): string | undefined {
    const d = this.def
    if (!d) return
    if (d === true) return px(10)
    if (typeof d === 'number') return px(d)
    if ('h' in d && 'v' in d) return [d.v, d.h].map(px).join(' ')
    if ('h' in d) return [0, d.h].map(px).join(' ')
    if ('v' in d) return [d.v, 0].map(px).join(' ')
    return [d.top, d.right, d.bottom, d.left].map(px).join(' ')
  }
}

// ----------------------------------------------------------------------------

export class Dimensions {
  constructor(
    readonly width: number,
    readonly height: number //
  ) {}

  at(p: Position): Geom {
    return new Geom(p.left, p.top, this.width, this.height)
  }
}
