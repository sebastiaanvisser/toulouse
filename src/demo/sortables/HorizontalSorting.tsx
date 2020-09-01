import React, { ReactNode, useState } from 'react'
import { Box } from '../../box/Box'
import { Theme } from '../../box/Themed'
import { inside, rubber } from '../../dyn/Constraint'
import {
  move,
  SortableContainer,
  SortableItem,
  SortState,
  useSortable
} from '../../dyn/Sortable'
import { Icons } from '../../icon/Icons'
import { Geom } from '../../lib/Geometry'
import { range } from '../../lib/Range'
import { Var } from '../../lib/Var'
import { Blue, Green, Indigo, Orange, Purple, Red, Yellow } from '../../styling/Color'
import { Icon } from '../../widget/Icon'
import { Panel } from '../../widget/Panel'
import { Slider } from '../../widget/Slider'
import { Spinner } from '../../widget/Spinner'

const Items: () => { key: number; node: ReactNode }[] = () =>
  [
    'First Item',
    <>
      <Icon zoom={1} fg={Green} icon={Icons.Del} />
      <Icon zoom={1} fg={Orange} icon={Icons.Add} />
    </>,
    <Theme ocean>
      <Panel grow v>
        <Icon zoom={2} icon={Icons.Pattern} bg={Yellow.alpha(0.1)} fg={Yellow} />
        <Icon zoom={2} icon={Icons.Terminal} bg={Yellow.alpha(0.1)} fg={Yellow} />
        <Box h>
          <Icon zoom={1} icon={Icons.Tag} bg={Yellow.alpha(0.1)} fg={Yellow} />
          <Icon zoom={1} icon={Icons.Lock} bg={Yellow.alpha(0.1)} fg={Yellow} />
        </Box>
        <Icon zoom={2} icon={Icons.Cubes} bg={Yellow.alpha(0.1)} fg={Yellow} />
        <Icon zoom={2} icon={Icons.Tabs} bg={Yellow.alpha(0.1)} fg={Yellow} />
      </Panel>
    </Theme>,
    'Second Item',
    <Box v>
      <Icon zoom={3} fg={Purple} icon={Icons.Nautical} />
      <Icon zoom={3} fg={Red} icon={Icons.MapMarker} />
      <Spinner zoom={3} thickness={1} speed={10000} />
    </Box>,
    'Another one',
    'And this one!',
    <Slider width={120} value={new Var(5)} limit={range(0, 10)} stick={1} tick={1} />,
    <Icon zoom={2} fg={Indigo} icon={Icons.LowContrast} />,
    <Icon zoom={3} fg={Blue} icon={Icons.Inbox} />
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
    const constraint = (_: any, g: Geom) => rubber(inside(g.asRect), 1)
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
