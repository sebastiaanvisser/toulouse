import { Set } from 'immutable'
import isEqual from 'lodash.isequal'
import React, { MouseEvent, ReactNode, useRef } from 'react'
import { Box, BoxProps } from '../box/Box'
import { Virtual, VirtualProps } from '../dyn/Virtual'
import { Prim } from '../lib'
import { Point } from '../lib/Geometry'
import { range } from '../lib/Range'
import { useValue, Value, Var } from '../lib/Var'
import { Primary } from '../styling'
import { Unit } from '../box/Unit'

interface Many<Id> {
  multi: true
  required: false
  selection: Var<Set<Id>>
  onSelect?: (sel: Set<Id>) => void
}

interface Some<Id> {
  multi: true
  required: true
  selection: Var<Set<Id>>
  onSelect?: (sel: Set<Id>) => void
}

interface Single<Id> {
  multi: false
  required: true
  selection: Var<Id>
  onSelect?: (sel: Id) => void
}

interface Optional<Id> {
  multi: false
  required: false
  allowDeselect: boolean
  selection: Var<Id | undefined>
  onSelect?: (sel: Id | undefined) => void
}

type Cardinality<Id> = Optional<Id> | Single<Id> | Many<Id> | Some<Id>

interface ListboxProps<A, Id> {
  items: A[]
  identify: (item: A) => Id

  renderContainer?: (children: ReactNode) => ReactNode
  renderGroup?: (children: ReactNode[], selected: boolean) => ReactNode
  renderItem: (
    item: A,
    events: BoxProps,
    selected: boolean,
    ix: number,
    mode: 'shallow' | 'full',
    group: Prim
  ) => ReactNode

  rowHeight: VirtualProps<A>['rowHeight']
  overflow?: VirtualProps<A>['overflow']
  block?: VirtualProps<A>['block']
}

type Props<A, Id> = ListboxProps<A, Id> & Cardinality<Id> & BoxProps

// ----------------------------------------------------------------------------

export const Listbox = <A, Id extends number | string>(props: Props<A, Id>) => {
  const {
    identify,
    items,
    renderGroup,
    renderItem,
    renderContainer,
    selection,
    overflow,
    multi,
    required,
    block,
    rowHeight,
    ...rest
  } = props
  const lastSelected = useRef<number>()
  useValue(props.selection as Var<any>)

  const Container = ({ children }: { children: ReactNode }) =>
    renderContainer ? <>{renderContainer(children)}</> : <Box v>{children}</Box>

  const Group = (props: { children: ReactNode[]; selected: boolean }) => {
    const { children, selected } = props
    if (renderGroup) return <>{renderGroup(children, selected)}</>
    return selected ? (
      <Box bg sep clip shadow blunt palette={Primary} v z>
        {children}
      </Box>
    ) : (
      <Box sep clip v>
        {children}
      </Box>
    )
  }

  const Item = (itemProps: {
    item: A
    pos: Point
    mode: 'shallow' | 'full'
    group: Prim
  }) => {
    const { item, pos, mode, group } = itemProps
    const id = identify(item)
    const isSel = useValue(isSelected(id))

    let button = !isSel
    if (!props.multi && !props.required && props.allowDeselect) button = true
    if (props.multi) button = true

    const fwProps: BoxProps = {
      button,
      onClick: ev => onSelect(ev, id, pos.y),
      onMouseOver: ev => (ev.altKey ? onSelect(ev, id, pos.y) : undefined)
    }

    return <>{renderItem(item, fwProps, isSel, pos.y, mode, group)}</>
  }

  // ----------------------------------
  // SELECTION

  const isSelected1 = (id: Id): boolean => {
    if (props.multi) return props.selection.get().has(id)
    return props.selection.get() === id
  }

  const isSelected = (id: Id): Value<boolean> => {
    if (props.multi) return props.selection.map(sel => sel.has(id))
    return props.selection.equals(id)
  }

  const onSelect = (ev: MouseEvent, item: Id, ix: number) => {
    if (props.multi) onSelectMulti(ev, props, item, ix)
    else if (props.required) onSelectSingle(props, item)
    else onSelectOptional(props, item)
    lastSelected.current = ix
  }

  const onSelectMulti = (
    ev: MouseEvent,
    props: Many<Id> | Some<Id>,
    item: Id,
    ix: number
  ) => {
    const { selection } = props

    if (ev.metaKey)
      return selection.modify(s => (s.has(item) ? s.delete(item) : s.add(item)))

    if (ev.shiftKey && lastSelected.current !== undefined) {
      const { from, to } = range(lastSelected.current, ix)
      const toSelect = range(from, to)
        .iterate(1, true)
        .map(i => identify(items[i]))
      return selection.modify(s => s.union(toSelect))
    }

    if (required) return selection.set(Set([item]))

    return selection.modify(cur => (isEqual(cur.values(), [item]) ? Set() : Set([item])))
  }

  const onSelectSingle = (props: Single<Id>, item: Id) => {
    const { selection } = props
    selection.set(item)
    if (props.onSelect) props.onSelect(item)
  }

  const onSelectOptional = (props: Optional<Id>, item: Id) => {
    const { selection, allowDeselect } = props
    selection.modify(cur => (cur === item ? (allowDeselect ? undefined : item) : item))
    if (props.onSelect) props.onSelect(selection.get())
  }

  // ------------------------------------------------------------------------

  return (
    <Virtual<A, boolean>
      data={{ vertical: items }}
      renderContainer={cs => <Container>{cs}</Container>}
      renderGroup={(children, selected) => <Group {...{ selected, children }} />}
      group={v => isSelected1(identify(v))}
      renderRow={a => a}
      renderCell={(item, pos, _, mode, group) => (
        <Item key={identify(item)} {...{ item, pos, mode, group }} />
      )}
      rowHeight={rowHeight}
      colWidth={() => Unit}
      overflow={overflow}
      block={block}
      {...rest}
    />
  )
}
