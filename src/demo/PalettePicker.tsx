import React, { useRef } from 'react'
import { Box, BoxProps } from '../box/Box'
import { Unit } from '../box/Unit'
import { Attach } from '../dyn/Attach'
import { Alt, useGlobalKey } from '../dyn/GlobalKey'
import { Icons } from '../icon/Icons'
import { useValue, Var } from '../lib/Var'
import { Fg } from '../styling/Color'
import { byName, Palette, paletteByName, PaletteName } from '../styling/Palette'
import { Balloon, BalloonProps } from '../widget/Balloon'
import { Icon } from '../widget/Icon'
import { Label } from '../widget/Label'
import { Listbox } from '../widget/Listbox'
import { ShortcutString } from '../widget/ShortcutString'

export interface Props extends BoxProps {
  active: Var<Palette>
  balloon?: BalloonProps
  disabled?: boolean
}

export const prettyName = (s: string) => s[0].toUpperCase() + s.slice(1)

// ----------------------------------------------------------------------------

export function PalettePicker(props: Props) {
  const { disabled, balloon, children, ...rest } = props

  // const ctx = usePalette()
  const active = useValue(props.active)

  return (
    <Attach
      attachment={() => (
        <PaletteBalloon
          {...balloon}
          bias={0}
          handle={false}
          margin={0}
          active={props.active}
        />
      )}
    >
      <Box h blunt disabled={disabled} button {...rest}>
        {children}
        <Icon rounded icon={Icons.Contrast} />
        <Label grow>{prettyName(active.name)}</Label>
        <Icon icon={Icons.ChevronDown} fg={Fg.alpha(0.2)} />
      </Box>
    </Attach>
  )
}

// ----------------------------------------------------------------------------

export function PaletteBalloon(props: BalloonProps & { active: Var<Palette> }) {
  const open = useRef(new Var(false)).current

  useGlobalKey(Alt('T'), () => open.set(true))

  const identify = (palette: Palette) => palette.name

  const renderItem = (palette: Palette, itemProps: BoxProps, sel: boolean) => {
    return (
      <Box {...itemProps} rounded={!sel} h>
        <Label grow>
          <ShortcutString char={palette.name[0]} event={() => props.active.set(palette)}>
            {prettyName(palette.name)}
          </ShortcutString>
        </Label>
        <Box>
          <Icon fg={palette.Bg} icon={Icons.Blob} />
        </Box>
      </Box>
    )
  }

  return (
    <Balloon v open={open} behavior="mousedown" width="target" {...props}>
      <Listbox<Palette, PaletteName>
        pad={5}
        multi={false}
        required
        items={Object.values(byName)}
        selection={props.active.iso(paletteByName)}
        renderItem={renderItem}
        identify={identify}
        rowHeight={() => Unit}
      />
    </Balloon>
  )
}
