export const A = 1

// import * as React from "react"
// import { distributed, iterate } from "../../lib/Prelude"
// import { Cell, renderTable, renderTd, renderTr, GridStyles } from "./Grid"
// import { Sided } from "toulouse/lib"; import { Rc,  } from "../lib/Rc"; import { Use } from "toulouse/lib";
// import { Inspection, Panel, Unit, Virtual } from 'toulouse/old'

// const myTable = (): Cell[][] =>
//     iterate(0, 1000).map(y =>
//         iterate(0, 1000).map(x => ({
//             x,
//             y,
//             ...distributed([
//                 { weight: 200, value: { w: 1, h: 1 } },
//                 { weight: 1, value: { w: 1, h: 2 } },
//                 { weight: 1, value: { w: 2, h: 1 } },
//                 { weight: 1, value: { w: 2, h: 2 } },
//                 { weight: 1, value: { w: 3, h: 1 } },
//                 { weight: 1, value: { w: 1, h: 3 } },
//                 { weight: 1, value: { w: 3, h: 2 } },
//                 { weight: 1, value: { w: 2, h: 3 } },
//                 { weight: 1, value: { w: 3, h: 3 } }
//             ])
//         }))
//     )

// // ----------------------------------------------------------------------------

// interface Props {
//     debug: boolean
//     margin: Sided
//     block: number
//     inspect?: (i: Inspection) => void
// }

// export class VirtualDynamic extends Rc<Props> {
//     myTable = myTable()

//     render(): React.ReactNode {
//         const { tableC, cellC } = GridStyles.get()
//         const { margin, block, inspect } = this.props

//         const tableMeasure = {
//             rows: tableC
//                 .child("tbody")
//                 .child()
//                 .selector(),
//             cells: cellC.selector()
//         }

//         return (
//             <Panel rel sharp elevate width={Unit * 20} height={Unit * 20}>
//                 <Virtual<Cell>
//                     data={{ table: this.myTable }}
//                     inspect={inspect}
//                     renderContainer={renderTable}
//                     renderRow={renderTr}
//                     renderCell={renderTd}
//                     selectors={tableMeasure}
//                     defaults={{ width: 90, height: 90 }}
//                     margin={margin}
//                     block={{ width: 1, height: block }}
//                 />
//             </Panel>
//         )
//     }
// }
