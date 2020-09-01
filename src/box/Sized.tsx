import { CSSProperties } from 'react'
import { Geom } from '../lib/Geometry'
import { px, cx } from '../styling/Classy'
import { style } from '../styling/Rule'

export interface ElementGeom {
  left?: number | string
  top?: number | string
  right?: number | string
  bottom?: number | string
  width?: number | string
  height?: number | string
}

export const geomStyling = (geom: ElementGeom): React.CSSProperties => ({
  left: numeric(geom.left),
  top: numeric(geom.top),
  width: numeric(geom.width),
  height: numeric(geom.height),
  right: numeric(geom.right),
  bottom: numeric(geom.bottom)
})

// ----------------------------------------------------------------------------

export interface Props extends ElementGeom {
  geom?: Geom
  fit?: boolean | number
  abs?: boolean
  rel?: boolean
  clip?: boolean
  z?: boolean | number
}

// ----------------------------------------------------------------------------

const numeric = (v: number | string | undefined): string | undefined =>
  typeof v === 'number' ? px(v) : v

export function styling(props: Props): CSSProperties {
  const { left, top, width, height, right, bottom, geom } = props
  return {
    left: numeric(left ?? geom?.left),
    top: numeric(top ?? geom?.top),
    right: numeric(right ?? geom?.right),
    bottom: numeric(bottom ?? geom?.bottom),
    width: numeric(width ?? geom?.width),
    height: numeric(height ?? geom?.height)
  }
}

export function classes(props: Props) {
  const { abs, rel, fit, z, clip } = props
  return cx(
    abs && absC,
    rel && relC,
    clip && clipC,
    z !== undefined && z !== false && zIndexC(z === true ? 1 : z),
    typeof fit === 'number' ? fitC(fit) : fit === true ? fitC(0) : undefined
  )
}

// ----------------------------------------------------------------------------

const clipC = style({ overflow: 'hidden' })
const zIndexC = (zIndex: number) => style({ zIndex })

const fitC = (m: number) =>
  style({
    position: 'absolute',
    left: px(m),
    top: px(m),
    right: px(m),
    bottom: px(m)
  })

const absC = style({ position: 'absolute' }).name('abs')
const relC = style({ position: 'relative' }).name('rel')
