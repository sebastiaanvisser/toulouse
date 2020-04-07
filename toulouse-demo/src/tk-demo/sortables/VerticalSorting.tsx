import React, { useState } from 'react'
import { Box, Unit } from 'toulouse/box'
import { ChevronLeft, ChevronRight } from 'toulouse/icon'
import { range } from 'toulouse/lib'
import {
  SortState,
  useSortable,
  move,
  SortableItem,
  SortableContainer
} from 'toulouse/dyn'
import { Img, Panel, Tag } from 'toulouse/widget'
import { Hover, Primary } from 'toulouse/styling'

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
      <Img img={ChevronLeft} />
      <Tag margin palette={Primary}>
        {numbers[ix]}
      </Tag>
      <Img img={ChevronRight} />
    </Panel>
  )

  const Item = (props: { item: number; index: number }) => {
    const { item, index } = props
    return (
      <SortableItem index={index} dir="v">
        <Box>
          <Box bg spread h height={height(item)}>
            <Img img={ChevronLeft} />
            <Tag margin palette={Primary}>
              {item}
            </Tag>
            <Img img={ChevronRight} />
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
        bg={Hover}
        width={Unit * 6}
      >
        {numbers.map((item, index) => (
          <Item key={item} item={item} index={index} />
        ))}
      </SortableContainer>
    </Box>
  )
}
