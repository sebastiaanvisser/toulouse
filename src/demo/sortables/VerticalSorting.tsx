import React, { useState } from 'react'
import { Box } from '../../box/Box'
import { Theme } from '../../box/Themed'
import { Unit } from '../../box/Unit'
import {
  move,
  SortableContainer,
  SortableItem,
  SortState,
  useSortable
} from '../../dyn/Sortable'
import { Icons } from '../../icon/Icons'
import { range } from '../../lib/Range'
import { Hovering, Shade } from '../../styling/Color'
import { Icon } from '../../widget/Icon'
import { Panel } from '../../widget/Panel'
import { Tag } from '../../widget/Tag'

function height(i: number) {
  if (i === 4) return Unit * 3
  if (i >= 15 && i <= 18) return Unit * 2
  if (i >= 60 && i <= 70) return Unit * 4
  return undefined
}

export function VerticalSorting() {
  const onSorted = (st: SortState) => {
    setNumbers(move(numbers, st.srcIx, st.targetIx))
  }

  const manager = useSortable(onSorted)

  const [numbers, setNumbers] = useState(range(0, 10).iterate())

  const ghost = (ix: number) => (
    <Panel spread elevate fit h height={height(numbers[ix])}>
      <Icon icon={Icons.ChevronLeft} />
      <Theme primary>
        <Tag margin>{numbers[ix]}</Tag>
      </Theme>
      <Icon icon={Icons.ChevronRight} />
    </Panel>
  )

  const Item = (props: { item: number; index: number }) => {
    const { item, index } = props
    return (
      <SortableItem index={index} dir="v">
        <Box>
          <Box bg spread h height={height(item)}>
            <Icon icon={Icons.ChevronLeft} />
            <Tag margin bg={Shade}>
              {item}
            </Tag>
            <Icon icon={Icons.ChevronRight} />
          </Box>
        </Box>
      </SortableItem>
    )
  }

  return (
    <Box h>
      <SortableContainer
        v
        sep
        ghost={ghost}
        manager={manager}
        elevate
        blunt
        clip
        bg={Hovering}
        width={Unit * 6}
      >
        {numbers.map((item, index) => (
          <Item key={item} item={item} index={index} />
        ))}
      </SortableContainer>
    </Box>
  )
}
