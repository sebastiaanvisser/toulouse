import isEqual from 'lodash.isequal'
import * as React from 'react'
import { Box, Unit } from 'toulouse/box'
import { Virtual } from 'toulouse/dyn'
import { Tag } from 'toulouse/icon'
import { memo1, Point, range, Use, Var, pt } from 'toulouse/lib'
import { Arctic, className, cx, Palette, pct, px, rule, style } from 'toulouse/styling'
import { Img, Label, SlowReveal, Tooltip } from 'toulouse/widget'
import { fetchCountries } from '../tk-demo/data/World'

export type Cell = string | undefined

// ----------------------------------------------------------------------------

export class Tabular extends React.Component {
  selection = new Var<Point[]>([])
  table = new Var<Cell[][]>([], (a, b) => a === b)

  componentWillMount() {
    fetchCountries().then(countries => {
      const cols = range(0, 400).iterate()
      const rows = range(0, 200).iterate()
      const cs = countries.map(c => [
        c.name,
        c.regions[0],
        c.capitals[0] ? c.capitals[0].name : '-',
        c.capitals[0] ? c.capitals[0].role : '-'
        //
      ])
      // const table = rows.map(y => cols.map(x => `${x},${y} ${cs[y % cs.length][x % 4]}`))
      const table = rows.map(y => cols.map(x => cs[y % cs.length][x % 4]))
      this.table.set(table)
    })

    rule('html, body, #container').style({
      width: pct(100),
      height: pct(100),
      position: 'relative',
      margin: 0
    })
  }

  colWidth = (col: number) => {
    if (col % 4 === 0) return Unit * 6
    if (col % 4 === 1) return Unit * 5
    if (col % 4 === 2) return Unit * 7
    if (col % 4 === 3) return Unit * 3
    return Unit * 6
  }

  rowHeight = (row: number) => {
    if (row % 5 === 3) return Unit * 3
    if (row % 7 === 6) return Unit * 6
    return Unit
  }

  render(): React.ReactNode {
    return (
      <Box rel style={{ height: pct(100) }}>
        <Box bg palette={Arctic} rel grow abs fit={Unit}>
          <Use value={this.table}>{this.withTable}</Use>
        </Box>
      </Box>
    )
  }

  withTable = (table: Cell[][]) => (
    <Virtual<Cell>
      data={{ table }}
      renderContainer={this.renderTable}
      renderRow={this.renderTr}
      renderCell={this.renderTd}
      colWidth={this.colWidth}
      rowHeight={this.rowHeight}
      overflow={{ h: Unit * 6, v: Unit * 8 }}
      block={{ h: 1, v: 1 }}
    />
  )

  renderTable = (rows: React.ReactNode[]) => (
    <table className={cx(Styles.get(Arctic).tableC)}>
      <tbody>{rows}</tbody>
    </table>
  )

  renderTr = (cells: React.ReactNode[], y: number) => {
    return <tr key={`row-${y}`}>{cells}</tr>
  }

  renderTd = (cell: Cell, pt: Point, _: {}, mode: 'shallow' | 'full') =>
    mode === 'shallow' ? this.renderTdShallow(cell, pt) : this.renderTdFull(cell, pt)

  renderTdShallow = (cell: Cell, { x, y }: Point) => {
    const width = this.colWidth(x)
    const height = this.rowHeight(y)
    const style = { width: px(width), height: px(height) }
    const { cellC, shallowC } = Styles.get(Arctic)

    return (
      <td className={cx(cellC, shallowC)} key={`${x}|${y}`} style={style}>
        <Label ellipsis={height <= Unit}>{cell || '-'}</Label>
      </td>
    )
  }

  renderTdFull = (cell: Cell, { x, y }: Point) => {
    const width = this.colWidth(x)
    const height = this.rowHeight(y)
    const style = { width: px(width), height: px(height) }
    const { cellC, selectedC } = Styles.get(Arctic)

    return (
      <Use value={this.selection.map(s => s.find(p => isEqual(p, pt(x, y))))}>
        {sel => (
          <Box
            type="td"
            attach={() => (
              <Tooltip bias={1} timing={SlowReveal}>
                <Box
                  button
                  onClick={() =>
                    this.table
                      .at(y)
                      .at(x)
                      .modify(x => (x ? x.toUpperCase() : x))
                  }
                >
                  <Img img={Tag} />
                </Box>
                <Label>{cell}</Label>
              </Tooltip>
            )}
            className={cx(cellC, sel && selectedC)}
            key={`${x}-${y}`}
            style={style}
            onClick={() => this.selection.modify(s => s.concat([pt(x, y)]))}
          >
            <Label ellipsis={height <= Unit}>{cell || '-'}</Label>
          </Box>
        )}
      </Use>
    )
  }
}

// ----------------------------------------------------------------------------

const Styles = memo1((p: Palette) => {
  const containerC = className('container').style({
    height: pct(100)
  })

  const tableC = className('my-virtual').style({
    borderCollapse: 'collapse',
    borderSpacing: 0
  })

  const cellC = className('my-cell').style({
    display: 'inline-block',
    position: 'relative',
    minWidth: px(30),
    minHeight: px(30),
    boxSizing: 'border-box',
    boxShadow: `inset 0 0 0 0.5px ${Arctic.Hover}`
  })

  const shallowC = style({
    // backgroundColor: `${arctic.panel.Hover.alpha(1)}`
  })

  const selectedC = className('selected').style({
    backgroundColor: p.Blue.alpha(0.05).toString(),
    boxShadow: [
      `0 0 0 1px ${p.Blue.toString()}`,
      `inset 0 0 0 1px ${p.Blue.toString()}` //
    ].join(),
    zIndex: 1
  })

  return { cellC, shallowC, tableC, containerC, selectedC }
})
