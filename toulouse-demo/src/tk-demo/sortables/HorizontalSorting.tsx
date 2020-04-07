import React, { ReactNode, useState } from 'react'
import { Box } from 'toulouse/box'
import {
  inside,
  move,
  rubber,
  SortableContainer,
  SortableItem,
  SortState,
  useSortable
} from 'toulouse/dyn'
import {
  Add,
  Del,
  Inbox,
  Lock,
  LowContrast,
  MapMarker,
  Module,
  Nautical,
  Pattern,
  Tabs,
  Tag,
  Terminal
} from 'toulouse/icon'
import { Geom, range, Var } from 'toulouse/lib'
import { Blue, Green, Indigo, Ocean, Purple, Red, Yellow, Orange } from 'toulouse/styling'
import { Img, Panel, Slider, Spinner } from 'toulouse/widget'

const Items: () => { key: number; node: ReactNode }[] = () =>
  [
    'First Item',
    <>
      <Img zoom={1} fg={Green} img={Del} />
      <Img zoom={1} fg={Orange} img={Add} />
    </>,
    <Panel grow palette={Ocean} v>
      <Img zoom={2} img={Pattern} bg={Yellow.alpha(0.1)} fg={Yellow} />
      <Img zoom={2} img={Terminal} bg={Yellow.alpha(0.1)} fg={Yellow} />
      <Box h>
        <Img zoom={1} img={Tag} bg={Yellow.alpha(0.1)} fg={Yellow} />
        <Img zoom={1} img={Lock} bg={Yellow.alpha(0.1)} fg={Yellow} />
      </Box>
      <Img zoom={2} img={Module} bg={Yellow.alpha(0.1)} fg={Yellow} />
      <Img zoom={2} img={Tabs} bg={Yellow.alpha(0.1)} fg={Yellow} />
    </Panel>,
    'Second Item',
    <Box v>
      <Img zoom={3} fg={Purple} img={Nautical} />
      <Img zoom={3} fg={Red} img={MapMarker} />
      <Spinner zoom={3} thickness={1} speed={10000} />
    </Box>,
    'Another one',
    'And this one!',
    <Slider width={120} value={new Var(5)} limit={range(0, 10)} stick={1} tick={1} />,
    <Img zoom={2} fg={Indigo} img={LowContrast} />,
    <Img zoom={3} fg={Blue} img={Inbox} />
  ].map((node, key) => ({ node, key }))

export function HorizontalSorting() {
  const onSorted = (st: SortState) => {
    setItems(move(items, st.srcIx, st.targetIx))
  }

  const manager = useSortable(onSorted)

  const [items, setItems] = useState(Items())

  const ghost = (index: number) => (
    <Panel spread elevate fit v>
      {items[index].node}
    </Panel>
  )

  const Item = (props: { item: { key: number; node: ReactNode }; index: number }) => {
    const { item, index } = props
    const constraint = (_: any, g: Geom) => rubber(inside(g.toRect()), 1)
    return (
      <SortableItem v index={index} dir="h" margin={10} constraint={constraint}>
        <Panel grow spread v>
          {item.node}
        </Panel>
      </SortableItem>
    )
  }

  return (
    <SortableContainer h border pad spaced ghost={ghost} manager={manager}>
      {items.map((item, index) => (
        <Item key={item.key} item={item} index={index} />
      ))}
    </SortableContainer>
  )
}
