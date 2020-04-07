export const D = 1

// import * as React from "react"
// import { iterate } from "../../lib/Prelude"
// import { AllCountries } from "../Lorem"
// import { Sided, Point, once } from "toulouse/lib"; import { Rc,  } from "../lib/Rc"; import { Use } from "toulouse/lib";
// import { Inspection, Panel, Unit, Virtual, cx, Label, className, px, Arctic } from 'toulouse/old'

// export type Cell = string | undefined

// const myTable = (): Cell[][] => {
//     const cols = iterate(0, 100)
//     const rows = iterate(0, 100)
//     const cs = AllCountries().map(c => [c.country, c.capital, c.code, c.lat, c.long, c.continent])
//     return rows.map(y => cols.map(x => cs[y % cs.length][x % 6]))
// }

// // ----------------------------------------------------------------------------

// interface Props {
//     debug: boolean
//     margin: Sided
//     block: number
//     inspect?: (i: Inspection) => void
// }

// export class VirtualTable extends Rc<Props> {
//     myTable = myTable()

//     render(): React.ReactNode {
//         const { tableC, cellC } = Styles.get()

//         const tableMeasure = {
//             rows: tableC
//                 .child("tbody")
//                 .child()
//                 .selector(),
//             cells: cellC.selector()
//         }

//         const { margin, block, inspect } = this.props
//         return (
//             <Panel rel sharp elevate width={Unit * 32} height={Unit * 28}>
//                 <Virtual<Cell>
//                     data={{ table: this.myTable }}
//                     inspect={inspect}
//                     renderContainer={renderTable}
//                     renderRow={renderTr}
//                     renderCell={renderTd}
//                     selectors={tableMeasure}
//                     defaults={{ width: 60, height: 60 }}
//                     margin={margin}
//                     block={{ width: 1, height: block }}
//                 />
//             </Panel>
//         )
//     }
// }

// // ----------------------------------------------------------------------------

// export const renderTable = (rows: React.ReactNode[]) => (
//     <table className={cx(Styles.get().tableC)}>
//         <tbody>{rows}</tbody>
//     </table>
// )

// export const renderTr = (cells: React.ReactNode[], row: number) => (
//     <tr className={cx()} key={`row-${row}`}>
//         {cells}
//     </tr>
// )

// export const renderTd = (cell: Cell, { x, y }: Point) => {
//     return (
//         <td className={cx(Styles.get().cellC)} key={`${x}-${y}`}>
//             <Label>{cell || "-"}</Label>
//         </td>
//     )
// }

// // ----------------------------------------------------------------------------

// export const Styles = once(() => {
//     const tableC = className("my-virtual").style({
//         borderCollapse: "collapse",
//         borderSpacing: 0
//     })

//     const cellC = className("my-cell").style({
//         position: "relative",
//         minWidth: px(30),
//         minHeight: px(30),
//         boxShadow: `inset 0 0 0 0.5px ${Arctic.sep}`
//     })

//     return { tableC, cellC }
// })
