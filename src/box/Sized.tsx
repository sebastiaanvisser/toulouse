import * as React from 'react'
import { Geom } from '../lib/Geometry'
import { memo1 } from '../lib/Memo'
import { className, cx, px } from '../styling/Css'

const resolve = (v: number | string | undefined): string | undefined => {
  return typeof v === 'number' ? px(v) : v
}

export interface ElementGeom {
  left?: number | string
  top?: number | string
  right?: number | string
  bottom?: number | string
  width?: number | string
  height?: number | string
}

export const geomStyling = (geom: ElementGeom): React.CSSProperties => ({
  left: resolve(geom.left),
  top: resolve(geom.top),
  width: resolve(geom.width),
  height: resolve(geom.height),
  right: resolve(geom.right),
  bottom: resolve(geom.bottom)
})

// ----------------------------------------------------------------------------

export interface SizedProps extends ElementGeom {
  geom?: Geom
  fit?: boolean | number
  abs?: boolean
  rel?: boolean
  zoom?: number
  z?: boolean | number
  clip?: boolean
}

// ----------------------------------------------------------------------------

export function sizedStyle(props: SizedProps): React.CSSProperties {
  const { left, top, width, height, right, bottom, geom, zoom } = props

  let g: ElementGeom = geom?.toJson() ?? {}

  if (left !== undefined) g = { ...g, left }
  if (top !== undefined) g = { ...g, top }
  if (width !== undefined) g = { ...g, width }
  if (height !== undefined) g = { ...g, height }
  if (bottom !== undefined) g = { ...g, bottom }
  if (right !== undefined) g = { ...g, right }

  return {
    left: resolve(g.left),
    top: resolve(g.top),
    width: resolve(g.width),
    height: resolve(g.height),
    right: resolve(g.right),
    bottom: resolve(g.bottom),
    zoom
  }
}

export function sizedClass({ abs, rel, fit, z, clip }: SizedProps) {
  return cx(
    abs && absC,
    rel && relC,
    clip && clipC,
    z !== undefined && z !== false && zIndexC.get(z === true ? 1 : z),
    typeof fit === 'number' ? fitC.get(fit) : fit === true ? fitC.get(0) : undefined
  )
}

// ----------------------------------------------------------------------------

const clipC = className(`clip`, {
  overflow: 'hidden'
})

const zIndexC = memo1((z: number) =>
  className(`z${z}`, {
    zIndex: z
  })
)

const fitC = memo1((m: number) =>
  className(`fit${m}`, {
    position: 'absolute',
    left: px(m),
    top: px(m),
    right: px(m),
    bottom: px(m)
  })
)

const absC = className('abs', { position: 'absolute' })
const relC = className('rel', { position: 'relative' })
