export const C = 1

// import * as React from "react"
// import { replicate } from "../../lib/Prelude"
// import { Sided, Point, Dimensions, once } from "../../lib"; import { Rc,  } from "../lib/Rc"; import { Use } from "../../lib";
// import {
//     Inspection,
//     Panel,
//     Unit,
//     Virtual,
//     cx,
//     Label,
//     className,
//     Icon,
//     Dark,
//     Box,
//     Blue,
//     Green,
//     Red,
//     Orange,
//     Yellow,
//     Teal
// } from '../../old'
// import {
//     Asterisk,
//     Target,
//     Ring,
//     MapMarker,
//     ZoomOut,
//     Search,
//     ZoomIn,
//     Pattern,
//     LowContrast,
//     Dim,
//     Nautical
// } from "../../icon"

// export type Cell = { w: number; h: number; x: number; y: number }

// const myTable = (): Cell[][] => {
//     const cols = replicate(40, () => 1 + Math.floor(Math.random() * 2.5))
//     const rows = replicate(40, () => 1 + Math.floor(Math.random() * 2.5))
//     return rows.map((row, y) => cols.map((col, x) => ({ w: col, h: row, x, y })))
// }

// // ----------------------------------------------------------------------------

// interface Props {
//     debug: boolean
//     margin: Sided
//     block: number
//     inspect?: (i: Inspection) => void
// }

// export class VirtualGrid extends Rc<Props> {
//     myTable = myTable()

//     render(): React.ReactNode {
//         const { margin, block, inspect } = this.props
//         const { tableC, cellC } = GridStyles.get()

//         const tableMeasure = {
//             rows: tableC
//                 .child("tbody")
//                 .children
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
//     <table className={cx(GridStyles.get().tableC)}>
//         <tbody>{rows}</tbody>
//     </table>
// )

// export const renderTr = (cells: React.ReactNode[], row: number) => (
//     <tr className={cx()} key={`row-${row}`}>
//         {cells}
//     </tr>
// )

// export const renderTd = (d: Cell, pos: Point, { width, height }: Partial<Dimensions>) => {
//     const w = width ? Math.max(width, d.w * Unit) : d.w * Unit
//     const h = height ? Math.max(height, d.h * Unit) : d.h * Unit
//     return (
//         <td
//             className={cx(GridStyles.get().cellC)}
//             key={`cell-${pos.x}-${pos.y}`}
//             style={{
//                 width: w,
//                 height: h,
//                 maxWidth: w,
//                 maxHeight: h,
//                 minWidth: w,
//                 minHeight: h
//             }}
//         >
//             {false ? (
//                 <Label subtle>
//                     {d.x},{d.y}
//                 </Label>
//             ) : (
//                 icons.get()[`${d.w},${d.h}`]
//             )}
//         </td>
//     )
// }

// // ----------------------------------------------------------------------------

// export const GridStyles = once(() => {
//     const tableC = className("my-virtual").style({
//         borderCollapse: "collapse",
//         borderSpacing: 0,
//         transform: "translate3d(0, 0, 0)",
//         tableLayout: "fixed"
//     })

//     const cellC = className("my-cell").style({
//         position: "relative",
//         boxSizing: "border-box",
//         verticalAlign: "top",
//         padding: 0,
//         overflow: "hidden"
//     })

//     return { tableC, cellC }
// })

// // ----------------------------------------------------------------------------
// // List of icon fillings by cell dimensions

// export const icons = once(
//     (): { [coord: string]: React.ReactNode } => ({
//         "1,1": <Icon zoom={1} fg={Dark} icon={Asterisk} />,
//         "2,1": (
//             <Box h>
//                 <Icon zoom={1} fg={Blue} icon={Target} />
//                 <Icon zoom={1} fg={Blue} icon={Target} />
//             </Box>
//         ),
//         "1,2": (
//             <Box v>
//                 <Icon zoom={1} fg={Green} icon={Ring} />
//                 <Icon zoom={1} fg={Green} icon={Ring} />
//             </Box>
//         ),
//         "2,2": <Icon zoom={2} fg={Red} icon={MapMarker} />,
//         "3,1": (
//             <Box h>
//                 <Icon zoom={1} fg={Orange} icon={ZoomOut} />
//                 <Icon zoom={1} fg={Orange} icon={Search} />
//                 <Icon zoom={1} fg={Orange} icon={ZoomIn} />
//             </Box>
//         ),
//         "1,3": (
//             <Box v>
//                 <Icon zoom={1} fg={Yellow} icon={Pattern} />
//                 <Icon zoom={1} fg={Yellow} icon={Pattern} />
//                 <Icon zoom={1} fg={Yellow} icon={Pattern} />
//             </Box>
//         ),
//         "2,3": (
//             <Box v>
//                 <Icon zoom={2} fg={Dark} icon={LowContrast} />
//                 <Box h>
//                     <Icon zoom={1} fg={Dark} icon={LowContrast} />
//                     <Icon zoom={1} fg={Dark} icon={LowContrast} />
//                 </Box>
//             </Box>
//         ),
//         "3,2": (
//             <Box h>
//                 <Icon zoom={2} fg={Yellow} icon={Dim} />
//                 <Box v>
//                     <Icon zoom={1} fg={Yellow} icon={Dim} />
//                     <Icon zoom={1} fg={Yellow} icon={Dim} />
//                 </Box>
//             </Box>
//         ),

//         "3,3": <Icon zoom={3} fg={Teal} icon={Nautical} />
//     })
// )
