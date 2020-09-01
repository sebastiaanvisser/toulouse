import React, { ReactNode, useState } from 'react'
import { Small } from '../../box/Small'
import { Theme } from '../../box/Themed'
import { inside, rubber } from '../../dyn/Constraint'
import {
  Manager,
  move,
  SortableContainer,
  SortableItem,
  SortState,
  useSortable
} from '../../dyn/Sortable'
import { Geom } from '../../lib/Geometry'
import { useValue } from '../../lib/Var'
import { cx, leftRadius, px, rightRadius } from '../../styling/Classy'
import { style } from '../../styling/Rule'
import { Panel } from '../../widget/Panel'
import { Tag } from '../../widget/Tag'
import { lorem } from '../Lorem'

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
      <Theme lava>
        <Small>
          <Panel style={style} v elevate>
            {items[ix].node}
          </Panel>
        </Small>
      </Theme>
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

    const constraint = (_: any, g: Geom) => rubber(inside(g.asRect), 1)

    return (
      <SortableItem dir="h" index={index} constraint={constraint}>
        <Theme lava>
          <Tag
            className={cx(itemC)}
            style={drop === 0 ? left : drop === 11 ? right : mid}
          >
            {item.node}
          </Tag>
        </Theme>
      </SortableItem>
    )
  }

  return (
    <Small>
      <SortableContainer pad spaced h elevate round ghost={ghost} manager={manager}>
        {items.map((item, index) => (
          <Item key={item.key} item={item} index={index} />
        ))}
      </SortableContainer>
    </Small>
  )
}

const itemC = style({ cursor: 'pointer' })
