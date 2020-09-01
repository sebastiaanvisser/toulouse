import * as React from 'react'
import { Fragment, ReactElement, ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { Unit } from '../box/Unit'
import { LabelFont } from '../box/Variant'
import { BezierPoint, Point } from '../lib/Geometry'
import * as H from '../lib/Hash'
import { range } from '../lib/Range'
import { Rgba } from '../styling/Rgba'
import { style } from '../styling/Rule'

interface ShapeSvgProps extends React.SVGProps<SVGSVGElement> {
  shape: Shape
  width: number | string
  height: number | string
}

const shapeC = style({ display: 'block' })

export function ShapeSvg(props: ShapeSvgProps) {
  const { shape, width, height, ...rest } = props
  return (
    <svg
      className={shapeC.toString()}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      {...rest}
    >
      <g>{shape.render()}</g>
    </svg>
  )
}

const btoa =
  typeof window === 'undefined'
    ? (s: string) => new Buffer(s).toString('base64')
    : window.btoa

export const shapeAsDataUri = (width: number, height: number, shape: Shape) =>
  `url(data:image/svg+xml;base64,${btoa(
    renderToString(<ShapeSvg shape={shape} width={width} height={height} />)
  )})`

// ----------------------------------------------------------------------------

export class IconDef {
  constructor(
    readonly name: string,
    readonly shape: () => Shape //
  ) {}

  static make(name: string, shape: () => Shape) {
    return new IconDef(name, () => shape().clipAsIcon().offsetAsIcon())
  }
}

// ----------------------------------------------------------------------------

export type Def =
  | { tag: 'id' }
  | { tag: 'node'; node: ReactElement }
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

export class Shape {
  constructor(
    public def: Def,
    readonly children: Shape[] = [],
    readonly hash = H.build('Tr', H.json(def), ...children.map(c => c.hash))
  ) {}

  clones(...fs: ((s: Shape, i: number) => Shape)[]) {
    return new Shape(
      { tag: 'id' },
      fs.map((f, i) => f(this, i))
    )
  }

  clone(...fs: ((s: Shape, i: number) => Shape)[]) {
    return new Shape({ tag: 'id' }, [this, ...fs.map((f, i) => f(this, i))])
  }

  array(n: number, f: (s: Shape, i: number) => Shape) {
    return new Shape(
      { tag: 'id' },
      range(0, n)
        .iterate()
        .map((_, i) => f(this, i))
    )
  }

  tr({ x, y }: Point) {
    return this.d(x, y)
  }

  d(dx: number, dy: number) {
    return dx === 0 && dy === 0
      ? this
      : new Shape({ tag: 'translate', translate: [dx, dy] }, [this])
  }

  dx(dx: number) {
    return this.d(dx, 0)
  }

  dy(dy: number) {
    return this.d(0, dy)
  }

  rotate(rotate: number) {
    return rotate === 0 ? this : new Shape({ tag: 'rotate', rotate }, [this])
  }

  rotateOn(a: number, x: number, y: number) {
    return a === 0 ? this : this.d(-x, -y).rotate(a).d(x, y)
  }

  scale2(sx: number, sy: number) {
    return sx === 1 && sy === 1
      ? this
      : new Shape({ tag: 'scale', scale: [sx, sy] }, [this])
  }

  scale(s: number) {
    return this.scale2(s, s)
  }

  scaleOn(s: number, x: number, y: number) {
    return this.d(-x, -y).scale(s).d(x, y)
  }

  fill(fill: Rgba | string) {
    return new Shape({ tag: 'fill', fill: fill.toString() }, [this])
  }

  gradient(a: Rgba, b: Rgba, rot?: number | [Point, Point]) {
    return new Shape({ tag: 'gradient', a: a.toString(), b: b.toString(), rot }, [this])
  }

  outline(o: number) {
    return this.fill('none').width(o)
  }

  stroke(stroke: Rgba) {
    return new Shape({ tag: 'stroke', stroke: stroke.toString() }, [this])
  }

  width(strokeWidth: number) {
    return new Shape({ tag: 'strokeWidth', strokeWidth }, [this])
  }

  rounded() {
    return new Shape({ tag: 'rounded', rounded: {} }, [this])
  }

  opacity(opacity: number) {
    return new Shape({ tag: 'opacity', opacity }, [this])
  }

  clip(...clip: Shape[]) {
    return new Shape(
      { tag: 'clip', clip: Shape.layers(...clip) },
      [this],
      H.build('Tr.clip', ...clip.map(c => c.hash), this.hash)
    )
  }

  mask(...mask: Shape[]) {
    return new Shape(
      { tag: 'mask', mask: Shape.layers(...mask) },
      [this],
      H.build('Tr.clip', ...mask.map(c => c.hash), this.hash)
    )
  }

  named = (name: string) => {
    return new Shape({ tag: 'named', name }, [this])
  }

  offsetAsIcon() {
    return this.d(Unit / 2, Unit / 2)
  }

  clipAsIcon() {
    return Shape.rect(Unit, Unit).clip(this)
  }

  render(): ReactElement<any> {
    const hash = this.hash
    const tr = this.def
    const cs = this.children.map(c => c.render())

    switch (tr.tag) {
      case 'translate':
        return (
          <g key={hash} transform={`translate(${tr.translate.join(' ')})`}>
            {cs}
          </g>
        )
      case 'rotate':
        return (
          <g key={hash} transform={`rotate(${tr.rotate})`}>
            {cs}
          </g>
        )
      case 'scale':
        return (
          <g key={hash} transform={`scale(${tr.scale.join(' ')})`}>
            {cs}
          </g>
        )
      case 'fill':
        return (
          <g key={hash} fill={tr.fill}>
            {cs}
          </g>
        )
      case 'stroke':
        return (
          <g key={hash} className="JAJAJ" stroke={tr.stroke}>
            {cs}
          </g>
        )
      case 'strokeWidth':
        return (
          <g key={hash} strokeWidth={tr.strokeWidth}>
            {cs}
          </g>
        )
      case 'rounded':
        return (
          <g key={hash} strokeLinejoin="round" strokeLinecap="round">
            {cs}
          </g>
        )
      case 'opacity':
        return (
          <g key={hash} opacity={tr.opacity}>
            {cs}
          </g>
        )
      case 'mask':
        return Shape.mask(this.hash, tr.mask, false, cs)
      case 'gradient':
        return Shape.gradient(this.hash, tr.a, tr.b, tr.rot, cs)
      case 'clip':
        return Shape.mask(this.hash, tr.clip, true, cs)
      case 'id':
        return <React.Fragment key={hash}>{cs}</React.Fragment>
      case 'named':
        return (
          <g key={hash} className={tr.name}>
            {cs}
          </g>
        )
      case 'node':
        return tr.node
      default:
        return tr /* never */
    }
  }

  static mask(hash: number, mask: Shape, invert: boolean, children: ReactNode) {
    const id = `mask-${hash}`
    const bg = invert ? 'black' : 'white'
    const fg = invert ? Rgba.White : Rgba.Black
    return (
      <Fragment key={hash}>
        <defs>
          <mask id={id}>
            <rect x="-1000" y="-1000" width="2000" height="2000" fill={bg} />
            {mask.stroke(fg).fill(fg).render()}
          </mask>
        </defs>
        <g style={{ mask: `url(#${id})` }}>{children}</g>
      </Fragment>
    )
  }

  static gradient(
    hash: number,
    a: string,
    b: string,
    rot: number | [Point, Point] | undefined,
    children: ReactNode
  ) {
    const id = `gradient-${hash}`

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
      <Fragment key={hash}>
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
      </Fragment>
    )
  }

  // ----------------------------------------------------------------------------
  // Primitive shapes

  static node = (node: ReactElement, hash: number) =>
    new Shape({ tag: 'node', node }, [], hash)

  static poly(...poly: (Point | BezierPoint)[]): Shape {
    const renderC = ({ c, d, p }: BezierPoint) => `C${c.fmt()} ${d.fmt()} ${p.fmt()}`
    const ds = poly.map(pt => ('c' in pt ? renderC(pt) : pt.fmt()))
    const d = `M${ds.join(' ')} Z`
    const hash = H.build('Shape.poly', H.build(d))
    return Shape.node(<path key={hash} d={d} />, hash)
  }

  static rect(w: number, h: number, r?: number): Shape {
    const hash = H.build('Shape.rect', w, h, r)
    return Shape.node(
      <rect key={hash} x={-w / 2} y={-h / 2} width={w} height={h} rx={r} ry={r} />,
      hash
    )
  }

  static line(...poly: Point[]): Shape {
    const points = poly.flatMap(({ x, y }) => [x, y]).join(' ')
    const hash = H.build('Shape.line', points)
    return Shape.node(<polyline key={hash} fill="none" points={points} />, hash)
  }

  static text(t: string, w?: number, fontFamily?: string): Shape {
    const hash = H.build('Shape.text', t, w, fontFamily)
    return Shape.node(
      <text
        key={hash}
        className={svgTextC.className()}
        style={{ fontWeight: w, fontFamily }}
        textAnchor="middle"
        alignmentBaseline="central"
      >
        {t}
      </text>,
      hash
    ).dy(4.5)
  }

  static path(d: string): Shape {
    const hash = H.build('Shape.path', d)
    return Shape.node(<path key={hash} d={d} />, hash)
  }

  static circle(r: number): Shape {
    const hash = H.build('Shape.circle', r)
    return Shape.node(<circle key={hash} r={r} />, hash)
  }

  // ----------------------------------------------------------------------------

  static layers = (...cs: Shape[]) => new Shape({ tag: 'id' }, cs)

  static array = (n: number, f: (i: number) => Shape): Shape =>
    Shape.layers().array(n, (_, i) => f(i))

  // static mask = (s: Shape, m: Shape) => s.mask(m)

  static ngon(s: number): Shape {
    const pts: Point[] = []
    for (var a = 0; a < 360; a += 360 / s) pts.push(Point.atAngle(a))
    return Shape.poly(...pts)
  }

  static star(s: number, ra: number): Shape {
    const pts: Point[] = []
    const ds = 360 / s
    for (var a = 0; a < 360; a += ds) {
      pts.push(Point.atAngle(a))
      pts.push(Point.atAngle(a + ds / 2, ra))
    }
    return Shape.poly(...pts)
  }
}

const svgTextC = style({
  fontFamily: LabelFont,
  fontSize: '12px',
  fontWeight: 500
})
