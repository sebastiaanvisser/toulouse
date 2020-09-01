import React, { useEffect, useState } from 'react'
import { Box, BoxProps } from '../../box/Box'
import { ElementGeom } from '../../box/Sized'
import { Dimensions, Geom, Rect, Sides, SidesDef } from '../../lib/Geometry'
import { useDebounce, useStateDeepEquals, useWindowEvent } from '../../lib/Hooks'
import { range } from '../../lib/Range'
import { cx, pct, px } from '../../styling/Classy'
import { style } from '../../styling/Rule'
import { Data, Grid, Grouped, RenderContainer } from './Grid'
import { RenderCell, RenderRow } from './Row'

export * from './Grid'
export * from './Measure'
export * from './Row'

// ----------------------------------------------------------------------------

function computeDimensions(data: Data<{}>): Dimensions {
  if ('horizontal' in data) return new Dimensions(data.horizontal.length, 1)
  if ('vertical' in data) return new Dimensions(1, data.vertical.length)
  return new Dimensions(data.table[0]?.length ?? 0, data.table.length)
}

function managedGeom<A>(data: Data<A>, g: ElementGeom): ElementGeom {
  const manageY = !('horizontal' in data)
  const manageX = !('vertical' in data)
  return {
    left: manageX ? g.left : undefined,
    top: manageY ? g.top : undefined,
    width: manageX ? g.width : undefined,
    height: manageY ? g.height : undefined
  }
}

function computeVieport(
  scroll: Geom,
  dim: Dimensions,
  // pad: Sided | undefined,
  overflow: SidesDef | undefined
): Geom {
  const o = new Sides(overflow ?? 0).asRect

  return new Geom(
    scroll.left - o.left,
    scroll.top - o.top,
    scroll.width + (o.left + o.right),
    scroll.height + (o.top + o.bottom)
  ).clip(new Geom(0, 0, dim.width, dim.height))
}

const fitRegion = (vpx: Geom, span: Dimensions, measure: Measure, pad: Rect): Geom => {
  const { colWidth, rowHeight } = measure

  const g = { left: 0, top: 0, width: 0, height: 0 }

  let x = 0
  while (x < vpx.left + vpx.width && g.left + g.width < span.width) {
    x += colWidth(g.left + g.width)
    if (x > vpx.left) g.width++
    else g.left++
  }

  let y = pad.top
  while (y < vpx.top + vpx.height && g.top + g.height < span.height) {
    y += rowHeight(g.top + g.height)
    if (y > vpx.top) g.height++
    else g.top++
  }

  return new Geom(g.left, g.top, g.width, g.height)
}

function computeRegion<A>(
  viewport: Geom,
  data: Data<A>,
  block: SidesDef,
  measure: Measure,
  pad: Rect
) {
  const span = computeDimensions(data)
  let fit = fitRegion(viewport, span, measure, pad).asRect

  const b = new Sides(block || 1).asRect

  fit = new Rect(
    Math.floor(fit.left / b.left) * b.left,
    Math.floor(fit.top / b.top) * b.top,
    Math.ceil(fit.right / b.right) * b.right,
    Math.ceil(fit.bottom / b.bottom) * b.bottom
  )

  return fit.asGeom.clip(
    new Geom(0, 0, span.width, span.height) //
  )
}

function snapshotElem(elem: HTMLElement) {
  const dim = new Dimensions(
    elem.scrollWidth,
    elem.scrollHeight //
  )

  const scroll = new Geom(
    elem.scrollLeft,
    elem.scrollTop,
    elem.offsetWidth,
    elem.offsetHeight //
  )

  return { dim, scroll }
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

function regionGeometry(region: Geom, measure: Measure): Geom {
  const { colWidth, rowHeight } = measure
  const { left, top, right, bottom } = region.asRect
  return new Geom(
    sum(range(0, left).iterate().map(colWidth)),
    sum(range(0, top).iterate().map(rowHeight)),
    sum(range(left, right).iterate().map(colWidth)),
    sum(range(top, bottom).iterate().map(rowHeight))
  )
}

function worldDimensions<A>(data: Data<A>, measure: Measure): ElementGeom {
  const { colWidth, rowHeight } = measure
  const { width, height } = computeDimensions(data)
  const colWidths = range(0, width).iterate().map(colWidth)
  const rowHeights = range(0, height).iterate().map(rowHeight)
  return managedGeom(data, new Dimensions(sum(colWidths), sum(rowHeights)))
}

// ----------------------------------------------------------------------------

interface Measure {
  colWidth: (x: number) => number
  rowHeight: (y: number) => number
}

export interface VirtualProps<A> extends Measure {
  renderContainer: RenderContainer
  renderRow: RenderRow
  renderCell: RenderCell<A>

  trigger?: any
  data: Data<A>
  overflow?: SidesDef // in pixels
  block?: SidesDef // in cells
  debugOverlay?: boolean
}

type Props<A, G> = VirtualProps<A> & Grouped<A, G> & BoxProps

// TODO:
// [ ] Scrolling up into unknown territory should preserve scroll position
// [ ] Allow keeping active rows/column stable in scroll pos
// [ ] Allow resizing elements
// [ ] Nested scrollbox demo?

export function Virtual<A, G = number>(props: Props<A, G>) {
  const [elem, setElem] = useState<HTMLElement>()
  const [mode, setMode] = useState<'shallow' | 'full'>('full')
  const [dim, setDim] = useStateDeepEquals(new Dimensions(0, 0))
  const [scroll, setScroll] = useStateDeepEquals(new Geom(0, 0, 0, 0))

  const {
    data,
    debugOverlay,
    block,
    overflow,
    renderContainer,
    renderGroup,
    renderRow,
    renderCell,
    colWidth,
    rowHeight,
    group,
    ...rest
  } = props

  const pad = new Sides(props.pad ? (props.pad === true ? 10 : props.pad) : 0).asRect
  const viewport = computeVieport(scroll, dim, overflow)
  const region = computeRegion(viewport, data, block, { colWidth, rowHeight }, pad)

  const snapshot = () => {
    if (!elem) return
    const { dim, scroll } = snapshotElem(elem)
    setDim(dim)
    setScroll(scroll)
  }

  useEffect(snapshot)

  const [fullMode] = useDebounce(() => setMode('full'), 300)

  const update = () => {
    setMode('shallow')
    snapshot()
    fullMode()
  }

  useWindowEvent('resize', update)

  const width = 'vertical' in data ? '100%' : undefined
  const height = 'horizontal' in data ? '100%' : undefined
  const regionDim = regionGeometry(region, props)
  const worldDim = worldDimensions(data, props)
  const regionGeom = managedGeom(data, regionDim.toJson())

  return (
    <Box rel elem={setElem} className={cx(virtualC)} onScroll={update} {...rest}>
      <Box rel {...worldDim}>
        <Box abs {...regionGeom} style={{ width, height }}>
          <Grid<A, G>
            data={data}
            region={region}
            renderContainer={renderContainer}
            renderRow={renderRow}
            renderCell={renderCell}
            mode={mode}
            colWidth={colWidth}
            rowHeight={rowHeight}
            renderGroup={renderGroup}
            group={group}
          />
        </Box>
      </Box>
      {debugOverlay && <Box abs className={cx(debugC)} {...viewport} />}
    </Box>
  )
}

// ----------------------------------------------------------------------------

const virtualC = style({
  transform: 'translate3d(0, 0, 0)',
  width: pct(100),
  height: pct(100),
  minHeight: px(30),
  overflow: 'auto',
  flex: '1 1 auto'
}).name('virtual')

const debugC = style({
  boxShadow: 'inset 0 0 0 1px red, 0 0 0 1px green',
  pointerEvents: 'none'
})
