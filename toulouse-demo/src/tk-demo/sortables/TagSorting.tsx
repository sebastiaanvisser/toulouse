import React, { ReactNode, useState } from 'react'
import { leftRadius, rightRadius } from 'toulouse/styling'
import {
  inside,
  Manager,
  rubber,
  SortableContainer,
  SortableItem,
  SortState,
  move,
  useSortable
} from 'toulouse/dyn'
import { Geom, useValue } from 'toulouse/lib'
import { lorem } from '../Lorem'
import { cx, style, px, Lava } from 'toulouse/styling'
import { Panel, Tag } from 'toulouse/widget'

const Items = lorem(2)
  .split(/\s+/g)
  .map((node, key) => ({ node, key }))

export function TagSorting() {
  const onSorted = (st: SortState) => {
    setItems(move(items, st.srcIx, st.targetIx))
  }

  const manager = useSortable(onSorted)

  const [items, setItems] = useState(Items)

  const ghost = (ix: number, targetIx: number, _g: Geom) => {
    const style =
      targetIx === 0
        ? leftRadius(px(11))
        : targetIx === items.length - 1
        ? rightRadius(px(11))
        : {}

    return (
      <Panel style={style} palette={Lava} small v elevate>
        {items[ix].node}
      </Panel>
    )
  }

  const Item = (props: { item: { key: number; node: ReactNode }; index: number }) => {
    const { item, index } = props

    const expectedEndPosition = (ix: number) => ({ state }: Manager) => {
      if (!state || state.dragSt.stage === 'idle') return ix
      const { srcIx, targetIx } = state
      if (ix <= targetIx && ix >= srcIx) return ix - 1
      if (ix >= targetIx && ix <= srcIx) return ix + 1
      return ix
    }

    const left = {
      borderRadius: px(3),
      borderTopLeftRadius: px(11),
      borderBottomLeftRadius: px(11)
    }

    const mid = {
      borderTopLeftRadius: px(3),
      borderBottomLeftRadius: px(3),
      borderTopRightRadius: px(3),
      borderBottomRightRadius: px(3)
    }

    const right = {
      borderRadius: px(3),
      borderTopRightRadius: px(11),
      borderBottomRightRadius: px(11)
    }

    const drop = useValue(manager.map(expectedEndPosition(index)))

    const constraint = (_: any, g: Geom) => rubber(inside(g.toRect()), 1)

    return (
      <SortableItem dir="h" index={index} constraint={constraint}>
        <Tag
          small
          className={cx(itemC)}
          palette={Lava}
          style={drop === 0 ? left : drop === 11 ? right : mid}
        >
          {item.node}
        </Tag>
      </SortableItem>
    )
  }

  return (
    <SortableContainer small pad spaced h elevate round ghost={ghost} manager={manager}>
      {items.map((item, index) => (
        <Item key={item.key} item={item} index={index} />
      ))}
    </SortableContainer>
  )
}

const itemC = style({ cursor: 'pointer' })
