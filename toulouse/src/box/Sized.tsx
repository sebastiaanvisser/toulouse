import * as React from 'react'
import { Geom } from '../lib/Geometry'
import { memo1, once } from '../lib/Memo'
import { className, cx, px } from '../styling/Css'

export interface ElementGeom {
  left?: number
  top?: number
  right?: number
  bottom?: number
  width?: number
  height?: number
}

export const geomStyling = (geom: ElementGeom): React.CSSProperties => ({
  left: geom.left && px(geom.left),
  top: geom.top && px(geom.top),
  width: geom.width && px(geom.width),
  height: geom.height && px(geom.height),
  right: geom.right && px(geom.right),
  bottom: geom.bottom && px(geom.bottom)
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

  if (geom && !(geom instanceof Geom)) debugger

  let g: ElementGeom = geom?.toJson() ?? {}

  if (left !== undefined) g = { ...g, left }
  if (top !== undefined) g = { ...g, top }
  if (width !== undefined) g = { ...g, width }
  if (height !== undefined) g = { ...g, height }
  if (bottom !== undefined) g = { ...g, bottom }
  if (right !== undefined) g = { ...g, right }

  return {
    left: g.left && px(g.left),
    top: g.top && px(g.top),
    width: g.width && px(g.width),
    height: g.height && px(g.height),
    right: g.right && px(g.right),
    bottom: g.bottom && px(g.bottom),
    zoom
  }
}

export function sizedClass({ abs, rel, fit, z, clip }: SizedProps) {
  const { absC, relC } = Styles.get()
  return cx(
    abs && absC,
    rel && relC,
    clip && clipC.get(),
    z !== undefined && z !== false && zIndexC.get(z === true ? 1 : z),
    typeof fit === 'number' ? fitC.get(fit) : fit === true ? fitC.get(0) : undefined
  )
}

// ----------------------------------------------------------------------------

const clipC = once(() =>
  className(`clip`).style({
    overflow: 'hidden'
  })
)

const zIndexC = memo1((z: number) =>
  className(`z${z}`).style({
    zIndex: z
  })
)

const fitC = memo1((m: number) =>
  className(`fit${m}`).style({
    position: 'absolute',
    left: px(m),
    top: px(m),
    right: px(m),
    bottom: px(m)
  })
)

const Styles = once(() => {
  const absC = className('abs').style({ position: 'absolute' })
  const relC = className('rel').style({ position: 'relative' })
  return { absC, relC }
})
