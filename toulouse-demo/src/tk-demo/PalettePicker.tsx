import React, { useRef } from 'react'
import { Box, BoxProps, Unit, usePalette } from 'toulouse/box'
import { Alt, useGlobalKey } from 'toulouse/dyn'
import { Blob, ChevronDown } from 'toulouse/icon'
import { useValue, Var } from 'toulouse/lib'
import { Alpha, Bg, Hover, Palette, paletteByName, Palettes } from 'toulouse/styling'
import {
  Balloon,
  BalloonProps,
  Img,
  Label,
  Listbox,
  ShortcutString
} from 'toulouse/widget'

// ----------------------------------------------------------------------------

export interface Props extends BoxProps {
  active: Var<Palette>
  balloon?: BalloonProps
  disabled?: boolean
}

export function PalettePicker(props: Props) {
  const { disabled, balloon, children, ...rest } = props

  const ctx = usePalette()
  const open = useRef(new Var(false)).current
  const active = useValue(props.active)

  useGlobalKey(Alt('T'), () => open.set(true))

  const Picker = () => (
    <Balloon
      v
      open={open}
      bias={0}
      handle={false}
      behavior="mousedown"
      margin={0}
      width="target"
      {...balloon}
    >
      <Listbox<Palette, string>
        pad={5}
        multi={false}
        required
        items={Palettes}
        selection={props.active.iso(paletteByName)}
        renderItem={renderItem}
        identify={identify}
        rowHeight={() => Unit}
      />
    </Balloon>
  )

  const identify = (palette: Palette) => palette.name

  const renderItem = (palette: Palette, itemProps: BoxProps, sel: boolean) => {
    return (
      <Box {...itemProps} rounded={!sel} h>
        <Label grow>
          <ShortcutString char={palette.name[0]} event={() => props.active.set(palette)}>
            {palette.name}
          </ShortcutString>
        </Label>
        <Box palette={palette}>
          <Img
            fg={Bg}
            bg={
              sel
                ? palette === ctx.Primary()
                  ? Hover
                  : undefined
                : palette === ctx
                ? Hover
                : undefined
            }
            img={Blob}
          />
        </Box>
      </Box>
    )
  }

  return (
    <Box h blunt disabled={disabled} button attach={Picker} {...rest}>
      {children}
      <Box palette={active}>
        <Img fg={Bg} bg={active === ctx ? Hover : undefined} img={Blob} />
      </Box>
      <Label grow>{active.name}</Label>
      <Img img={ChevronDown} fg={Alpha(0.2)} />
    </Box>
  )
}
