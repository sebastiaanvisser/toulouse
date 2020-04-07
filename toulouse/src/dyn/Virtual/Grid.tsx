import isEqual from 'lodash.isequal'
import React, { memo, ReactNode, Fragment } from 'react'
import { Geom } from '../../lib/Geometry'
import { RenderCell, RenderRow, Row } from './Row'
import { groupOn, Prim } from '../../lib/Grouping'

export type RenderContainer = (rows: ReactNode[]) => ReactNode
export type RenderGroup<G> = (rows: ReactNode[], group: G) => ReactNode

export type Data<A> =
  | { table: A[][] }
  | { vertical: A[] } //
  | { horizontal: A[] }

interface GridProps<A> {
  renderContainer: RenderContainer
  renderRow: RenderRow
  renderCell: RenderCell<A>

  colWidth: (x: number) => number
  rowHeight: (y: number) => number

  region: Geom
  data: Data<A>
  mode: 'shallow' | 'full'
}

export interface Grouped<A, G> {
  renderGroup?: RenderGroup<G>
  group?: (val: A, y: number) => G
}

export const Grid = memo(
  <A extends Object, G extends Prim = number>(props: GridProps<A> & Grouped<A, G>) => {
    const {
      renderContainer,
      renderRow,
      renderCell,
      mode,
      colWidth,
      rowHeight,
      region,
      data,
      group,
      renderGroup
    } = props
    const { left, top, width, height } = region

    const tabularize = (): A[][] => {
      if ('horizontal' in data) return [data.horizontal]
      if ('vertical' in data) return data.vertical.map(c => [c])
      if ('table' in data) return data.table
      return data
    }

    const tab = tabularize()

    if (tab.length === 0) {
      return <>{renderContainer([])}</>
    }

    const out: ReactNode[] = []

    if (group && renderGroup && 'vertical' in data) {
      const slice = data.vertical.slice(top, top + height)

      const groups = groupOn(
        slice.map((a, ix) => ({ a, gid: group(a, top + ix) })),
        g => g.gid
      )

      let y = 0
      for (let g = 0; g < groups.length; g++) {
        const rows: ReactNode[] = []
        for (let v = 0; v < groups[g].length; v++, y++) {
          rows.push(
            <Row<A>
              group={groups[g][v].gid}
              key={top + y}
              renderRow={renderRow}
              renderCell={renderCell}
              mode={mode}
              colWidth={colWidth}
              rowHeight={rowHeight}
              row={[groups[g][v].a]}
              y={top + y}
              left={left}
              width={width}
            />
          )
        }
        out.push(<Fragment key={top + y}>{renderGroup(rows, groups[g][0].gid)}</Fragment>)
      }
    } else {
      for (let y = 0; y < height && y < tab.length - top; y++) {
        out.push(
          <Row<A>
            group={undefined}
            key={top + y}
            renderRow={renderRow}
            renderCell={renderCell}
            mode={mode}
            colWidth={colWidth}
            rowHeight={rowHeight}
            row={tab[top + y]}
            y={top + y}
            left={left}
            width={width}
          />
        )
      }
    }

    return <>{renderContainer(out)}</>
  },
  (a, b) => isEqual(a.region, b.region) && a.data === b.data && a.mode === b.mode
) as <A, G = number>(props: GridProps<A> & Grouped<A, G>) => JSX.Element
