import * as React from 'react'
import { ReactElement, ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { Unit } from '../box/Unit'
import { BezierPoint, Point } from '../lib/Geometry'
import { range } from '../lib/Range'
import { cx } from '../styling'
import { Rgba } from '../styling/Rgba'

export const offsetAsIcon = (shape: Shape) => shape.d(Unit / 2, Unit / 2)

export const clipAsIcon = (shape: Shape) => rect(Unit, Unit).clip(shape)

export function shapeAsSvg(
  width: number,
  height: number,
  shape: Shape,
  props: React.SVGProps<SVGSVGElement> = {}
) {
  const { style, className, ...rest } = props
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{ ...style, display: 'block' }}
      className={cx(className)}
      width={width}
      height={height}
      {...rest}
    >
      {shape.render()}
    </svg>
  )
}

const btoa =
  typeof window === 'undefined'
    ? (s: string) => new Buffer(s).toString('base64')
    : window.btoa

export const shapeAsDataUri = (width: number, height: number, shape: Shape) =>
  `url(data:image/svg+xml;base64,${btoa(
    renderToString(shapeAsSvg(width, height, shape))
  )})`

export type Tr =
  | { tag: 'id' }
  | { tag: 'translate'; translate: [number, number] }
  | { tag: 'rotate'; rotate: number }
  | { tag: 'scale'; scale: [number, number] }
  | { tag: 'fill'; fill: string }
  | { tag: 'gradient'; a: string; b: string; rot?: number | [Point, Point] }
  | { tag: 'stroke'; stroke: string }
  | { tag: 'strokeWidth'; strokeWidth: number }
  | { tag: 'opacity'; opacity: number }
  | { tag: 'clip'; clip: Shape }
  | { tag: 'mask'; mask: Shape }
  | { tag: 'rounded'; rounded: {} }
  | { tag: 'named'; name: string }

export const Counter = { ref: 0 }

export class Shape {
  _name?: string
  children: ReactElement<any>[]

  constructor(public trans: Tr, ...children: (ReactElement<any> | Shape)[]) {
    this.children = children.map((v, ix) => (
      <React.Fragment key={ix}>{v instanceof Shape ? v.render() : v}</React.Fragment>
    ))
  }

  extend = (tr: Tr) => new Shape(tr, this.render())
  clones = (...fs: ((s: Shape, i: number) => Shape)[]) =>
    new Shape({ tag: 'id' }, ...fs.map((f, i) => f(this, i)))
  clone = (...fs: ((s: Shape, i: number) => Shape)[]) =>
    new Shape({ tag: 'id' }, this, ...fs.map((f, i) => f(this, i)))
  array = (n: number, f: (s: Shape, i: number) => Shape) =>
    new Shape(
      { tag: 'id' },
      ...range(0, n)
        .iterate()
        .map((_, i) => f(this, i))
    )

  // Modifiers
  d = (dx: number, dy: number) => this.extend({ tag: 'translate', translate: [dx, dy] })
  dx = (dx: number) => this.d(dx, 0)
  dy = (dy: number) => this.d(0, dy)
  tr = (p: Point) => this.d(p.x, p.y)
  rotate = (rotate: number) => this.extend({ tag: 'rotate', rotate })
  rotateOn = (a: number, x: number, y: number) => this.d(-x, -y).rotate(a).d(x, y)
  scale2 = (sx: number, sy: number) => this.extend({ tag: 'scale', scale: [sx, sy] })
  scale = (s: number) => this.scale2(s, s)
  scaleOn = (s: number, x: number, y: number) => this.d(-x, -y).scale(s).d(x, y)
  fill = (fill: Rgba | string) => this.extend({ tag: 'fill', fill: fill.toString() })
  gradient = (a: Rgba, b: Rgba, rot?: number | [Point, Point]) =>
    this.extend({ tag: 'gradient', a: a.toString(), b: b.toString(), rot })
  outline = (o: number) => this.fill('none').width(o)
  stroke = (stroke: Rgba) => this.extend({ tag: 'stroke', stroke: stroke.toString() })
  width = (strokeWidth: number) => this.extend({ tag: 'strokeWidth', strokeWidth })
  rounded = () => this.extend({ tag: 'rounded', rounded: {} })
  opacity = (opacity: number) => this.extend({ tag: 'opacity', opacity })
  clip = (...clip: Shape[]) => this.extend({ tag: 'clip', clip: layers(...clip) })
  mask = (...mask: Shape[]) => this.extend({ tag: 'mask', mask: layers(...mask) })

  name(): string {
    if (!this._name) this._name = `n${Counter.ref++}`
    return this._name
  }

  named = (name: string) => {
    const named = this.extend({ tag: 'named', name })
    named._name = name
    return named
  }

  render(): ReactElement<any> {
    const tr = this.trans
    const cs = this.children

    switch (tr.tag) {
      case 'translate':
        return <g transform={`translate(${tr.translate.join(' ')})`}>{cs}</g>
      case 'rotate':
        return <g transform={`rotate(${tr.rotate})`}>{cs}</g>
      case 'scale':
        return <g transform={`scale(${tr.scale.join(' ')})`}>{cs}</g>
      case 'fill':
        return <g fill={tr.fill}>{cs}</g>
      case 'stroke':
        return <g stroke={tr.stroke}>{cs}</g>
      case 'strokeWidth':
        return <g strokeWidth={tr.strokeWidth}>{cs}</g>
      case 'rounded':
        return (
          <g strokeLinejoin="round" strokeLinecap="round">
            {cs}
          </g>
        )
      case 'opacity':
        return <g opacity={tr.opacity}>{this.children}</g>
      case 'mask':
        return Shape.mask(tr.mask, false, this.children)
      case 'gradient':
        return Shape.gradient(tr.a, tr.b, tr.rot, this.children)
      case 'clip':
        return Shape.mask(tr.clip, true, this.children)
      case 'id':
        return <>{this.children}</>
      case 'named':
        return <g className={tr.name}>{this.children}</g>
      default:
        return tr
    }
  }

  static mask(mask: Shape, invert: boolean, children: ReactNode) {
    const id = `mask-${Counter.ref++}`
    const bg = invert ? 'black' : 'white'
    const fg = invert ? Rgba.White : Rgba.Black
    return (
      <>
        <defs>
          <mask id={id}>
            <rect x="-1000" y="-1000" width="2000" height="2000" fill={bg} />
            {mask.stroke(fg).fill(fg).render()}
          </mask>
        </defs>
        <g style={{ mask: `url(#${id})` }}>{children}</g>
      </>
    )
  }

  static gradient(
    a: string,
    b: string,
    rot: number | [Point, Point] | undefined,
    children: ReactNode
  ) {
    const id = `gradient-${Counter.ref++}`

    const pos =
      rot instanceof Array
        ? {
            x1: rot[0].x,
            y1: rot[0].y,
            x2: rot[1].x,
            y2: rot[1].y
          }
        : {}

    return (
      <>
        <defs>
          <linearGradient
            id={id}
            gradientTransform={typeof rot === 'number' ? `rotate(${rot})` : undefined}
            gradientUnits="userSpaceOnUse"
            {...pos}
          >
            <stop offset="0%" stopColor={a} />
            <stop offset="100%" stopColor={b} />
          </linearGradient>
        </defs>
        <g style={{ fill: `url(#${id})` }}>{children}</g>
      </>
    )
  }
}

export const layers = (...cs: (ReactElement<any> | Shape)[]) =>
  new Shape({ tag: 'id' }, ...cs)

export const array = (n: number, f: (i: number) => Shape): Shape =>
  layers().array(n, (_, i) => f(i))

export const mask = (s: Shape, m: Shape) => s.mask(m)

// ----------------------------------------------------------------------------

export function poly(...poly: (Point | BezierPoint)[]): Shape {
  const renderC = ({ c, d, p }: BezierPoint) =>
    `C${c.x},${c.y} ${d.x},${d.y} ${p.x},${p.y}`
  const renderP = ({ x, y }: Point) => `${x},${y}`
  const d = poly.map(pt => ('c' in pt ? renderC(pt) : renderP(pt)))
  return layers(<path d={`M${d.join(' ')} Z`} />)
}

export const rect = (w: number, h: number, r?: number): Shape =>
  layers(<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={r} ry={r} />)

export const line = (...poly: Point[]): Shape =>
  layers(<polyline fill="none" points={poly.flatMap(({ x, y }) => [x, y]).join(' ')} />)

export const path = (d: string): Shape => layers(<path d={d} />)

export const circleShape = (r: number): Shape => layers(<circle r={r} />)

export const text = (t: string, w?: number, fontFamily?: string): Shape =>
  layers(
    <text
      style={{ fontWeight: w, fontFamily }}
      textAnchor="middle"
      alignmentBaseline="central"
    >
      {t}
    </text>
  )

export function ngon(s: number): Shape {
  const pts: Point[] = []
  for (var a = 0; a < 360; a += 360 / s) pts.push(Point.atAngle(a))
  return poly(...pts)
}

export function starShape(s: number, ra: number): Shape {
  const pts: Point[] = []
  const ds = 360 / s
  for (var a = 0; a < 360; a += ds) {
    pts.push(Point.atAngle(a))
    pts.push(Point.atAngle(a + ds / 2, ra))
  }
  return poly(...pts)
}
