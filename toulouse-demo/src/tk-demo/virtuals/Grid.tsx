export const C = 1

// import * as React from "react"
// import { replicate } from "../../lib/Prelude"
// import { Sided, Point, Dimensions, once } from "toulouse/lib"; import { Rc,  } from "../lib/Rc"; import { Use } from "toulouse/lib";
// import {
//     Inspection,
//     Panel,
//     Unit,
//     Virtual,
//     cx,
//     Label,
//     className,
//     Img,
//     Dark,
//     Box,
//     Blue,
//     Green,
//     Red,
//     Orange,
//     Yellow,
//     Teal
// } from 'toulouse/old'
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
// } from "toulouse/icon"

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
//         "1,1": <Img zoom={1} fg={Dark} img={Asterisk} />,
//         "2,1": (
//             <Box h>
//                 <Img zoom={1} fg={Blue} img={Target} />
//                 <Img zoom={1} fg={Blue} img={Target} />
//             </Box>
//         ),
//         "1,2": (
//             <Box v>
//                 <Img zoom={1} fg={Green} img={Ring} />
//                 <Img zoom={1} fg={Green} img={Ring} />
//             </Box>
//         ),
//         "2,2": <Img zoom={2} fg={Red} img={MapMarker} />,
//         "3,1": (
//             <Box h>
//                 <Img zoom={1} fg={Orange} img={ZoomOut} />
//                 <Img zoom={1} fg={Orange} img={Search} />
//                 <Img zoom={1} fg={Orange} img={ZoomIn} />
//             </Box>
//         ),
//         "1,3": (
//             <Box v>
//                 <Img zoom={1} fg={Yellow} img={Pattern} />
//                 <Img zoom={1} fg={Yellow} img={Pattern} />
//                 <Img zoom={1} fg={Yellow} img={Pattern} />
//             </Box>
//         ),
//         "2,3": (
//             <Box v>
//                 <Img zoom={2} fg={Dark} img={LowContrast} />
//                 <Box h>
//                     <Img zoom={1} fg={Dark} img={LowContrast} />
//                     <Img zoom={1} fg={Dark} img={LowContrast} />
//                 </Box>
//             </Box>
//         ),
//         "3,2": (
//             <Box h>
//                 <Img zoom={2} fg={Yellow} img={Dim} />
//                 <Box v>
//                     <Img zoom={1} fg={Yellow} img={Dim} />
//                     <Img zoom={1} fg={Yellow} img={Dim} />
//                 </Box>
//             </Box>
//         ),

//         "3,3": <Img zoom={3} fg={Teal} img={Nautical} />
//     })
// )
