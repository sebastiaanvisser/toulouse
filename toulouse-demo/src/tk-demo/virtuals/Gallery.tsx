export const B = 1

// import * as React from "react"
// import { Sided, Point, once } from "toulouse/lib"; import { Rc,  } from "../lib/Rc"; import { Use } from "toulouse/lib";
// import {
//     Inspection,
//     Panel,
//     Ocean,
//     Unit,
//     Virtual,
//     IconDef,
//     Balloon,
//     Label,
//     Split,
//     cx,
//     Img,
//     className
// } from 'toulouse/old'
// import { Icons } from "toulouse/icon"
// import { id } from "../../lib/Prelude"
// // ----------------------------------------------------------------------------

// interface Props {
//     debug: boolean
//     margin: Sided
//     block: number
//     inspect?: (i: Inspection) => void
// }

// export class VirtualGallery extends Rc<Props> {
//     render(): React.ReactNode {
//         const { listC } = Styles.get()
//         const { margin, block, inspect } = this.props
//         return (
//             <Panel rel theme={Ocean} sharp elevate width={Unit * 30} height={Unit * 4}>
//                 <Virtual<[string, IconDef]>
//                     data={{ horizontal: Object.entries(Icons) }}
//                     inspect={inspect}
//                     renderContainer={renderIconList}
//                     renderRow={id}
//                     renderCell={renderIcon}
//                     selectors={{ rows: listC.child().selector() }}
//                     defaults={{ width: 120, height: 120 }}
//                     margin={margin}
//                     block={{ width: 1, height: block }}
//                 />
//             </Panel>
//         )
//     }
// }

// // ----------------------------------------------------------------------------

// const renderIconList = (items: React.ReactNode[]) => (
//     <Panel h sharp>
//         {items}
//     </Panel>
// )

// function renderIcon(kv: [string, IconDef], pos: Point) {
//     const balloon = () => {
//         return (
//             <Balloon theme={Ocean} behavior="hover" position="bottom">
//                 <Label>{kv[0]}</Label>
//             </Balloon>
//         )
//     }
//     return (
//         <Split className={cx(Styles.get().itemC)} key={pos.x} attach={balloon}>
//             <Img zoom={4} img={kv[1]} />
//         </Split>
//     )
// }

// // ----------------------------------------------------------------------------

// const Styles = once(() => {
//     return {
//         listC: className(),
//         itemC: className()
//     }
// })
