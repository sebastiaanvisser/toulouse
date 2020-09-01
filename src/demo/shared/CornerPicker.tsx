import * as React from 'react'
import { Box, BoxProps } from '../../box/Box'
import { Unit } from '../../box/Unit'
import { Attach } from '../../dyn/Attach'
import { Icons } from '../../icon/Icons'
import { Dimensions } from '../../lib/Geometry'
import { Use, useValue, useVar, Var } from '../../lib/Var'
import { Balloon } from '../../widget/Balloon'
import { Icon } from '../../widget/Icon'
import { Label } from '../../widget/Label'
import { Listbox } from '../../widget/Listbox'
import { Panel } from '../../widget/Panel'
import { ShortcutString } from '../../widget/ShortcutString'

export type Corner = 'auto' | 'sharp' | 'blunt' | 'rounded' | 'round'

interface Item {
  key: Corner
  char?: string
  label?: string
}

interface Props {
  corner: Var<Corner>
}

export function CornerPicker(props: Props & BoxProps) {
  const { corner } = props

  const selection = useVar<Corner | 'sep'>('sep')

  const Items: ('sep' | Item)[] = [
    { key: 'auto', char: 'a', label: 'Auto' },
    'sep',
    { key: 'sharp', char: 's', label: 'Sharp' },
    { key: 'blunt', char: 'b', label: 'Blunt' },
    { key: 'rounded', char: 'o', label: 'Rounded' },
    { key: 'round', char: 'r', label: 'Round' }
  ]

  const open = useVar(false)
  const dim = useVar<Dimensions | undefined>(undefined)
  const curDim = useValue(dim)

  const line = () => {
    return (
      <>
        <Label grow>
          <Use value={corner}>{active}</Use>
        </Label>
        <Icon icon={Icons.CaretDown} />
      </>
    )
  }

  const onOpen = () => open.set(true)

  const active = (c: Corner | 'sep') => {
    if (c === 'sep') return

    const items = Items.filter((c): c is Item => c !== 'sep')
    const label = items.find(i => i.key === c)?.label
    return (
      <>
        <strong>
          <ShortcutString char="C" event={onOpen}>
            Corner:
          </ShortcutString>
        </strong>{' '}
        {label}
      </>
    )
  }

  const picker = () => {
    return (
      <Balloon
        v
        behavior="mousedown"
        open={open}
        handle={false}
        margin={0}
        width={curDim?.width ?? 200}
      >
        <Box v pad={5}>
          <Listbox<Item | 'sep', Corner | 'sep'>
            multi={false}
            rowHeight={() => Unit}
            required
            items={Items}
            identify={a => (a === 'sep' ? 'sep' : a.key)}
            selection={selection}
            onSelect={(c: Corner | 'sep') => c === 'sep' || props.corner.set(c)}
            renderItem={renderItem}
          />
        </Box>
      </Balloon>
    )
  }

  const renderItem = (item: Item | 'sep', props: BoxProps) => {
    if (item === 'sep') return <hr />
    return (
      <Panel {...props} blunt h>
        <Label key={item.key}>
          {item.char ? (
            <ShortcutString
              alt={false}
              event={() => corner.set(item.key)}
              char={item.char}
            >
              {item.label || ''}
            </ShortcutString>
          ) : (
            item.label
          )}
        </Label>
      </Panel>
    )
  }

  return (
    <Attach attachment={picker}>
      <Panel h button border width={200}>
        {line()}
      </Panel>
    </Attach>
  )
}
