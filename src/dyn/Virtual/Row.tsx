import React, { memo, ReactNode, useRef } from 'react'
import { Point, Dimensions } from '../../lib/Geometry'
import { Prim } from '../../lib/Grouping'

export type RenderRow = (cells: ReactNode[], row: number) => ReactNode

export type RenderCell<A> = (
  value: A,
  pos: Point,
  dim: Partial<Dimensions>,
  mode: 'shallow' | 'full',
  group: Prim
) => ReactNode

export interface RowProps<A> {
  renderRow: RenderRow
  renderCell: RenderCell<A>

  group: Prim
  colWidth: (x: number) => number
  rowHeight: (y: number) => number

  row: A[]
  y: number
  mode: 'shallow' | 'full'
  left: number
  width: number
}

export const Row = memo(
  (props: RowProps<unknown>) => {
    const {
      renderRow,
      renderCell,
      colWidth,
      rowHeight,
      mode,
      group,
      row,
      left,
      width,
      y
    } = props
    const slice = row.slice(left, left + width)
    const cells = slice.map((a, x) => (
      <Cell
        key={left + x}
        group={group}
        renderCell={renderCell}
        colWidth={colWidth}
        rowHeight={rowHeight}
        payload={a}
        x={left + x}
        y={y}
        mode={mode}
      />
    ))
    return <>{renderRow(cells, y)}</>
  },
  (a, b) =>
    a.row === b.row &&
    a.y === b.y &&
    a.left === b.left &&
    a.width === b.width &&
    a.mode === b.mode
) as <A>(props: RowProps<A>) => JSX.Element

// ----------------------------------------------------------------------------

export interface CellProps<A> {
  renderCell: RenderCell<A>
  group: Prim

  colWidth: (x: number) => number
  rowHeight: (y: number) => number

  payload: A
  x: number
  y: number
  mode: 'shallow' | 'full'
}

export const Cell = memo(
  (props: CellProps<unknown>) => {
    const { payload, group, renderCell, colWidth, rowHeight, x, y } = props
    const lastMode = useRef('shallow')

    const mode = lastMode.current === 'full' ? 'full' : props.mode
    lastMode.current = mode

    const dim = new Dimensions(colWidth(x), rowHeight(y))
    return <>{renderCell(payload, new Point(x, y), dim, mode, group)}</>
  },
  (a, b) =>
    a.payload === b.payload &&
    a.group === b.group &&
    a.x === b.x &&
    a.y === b.y &&
    a.mode === b.mode
) as <A>(props: CellProps<A>) => JSX.Element
