import * as React from 'react'
import { Box, BoxProps } from '../box/Box'
import { Focusable } from '../dyn/Focus'
import { useVar1 } from '../lib/Var'
import { Blue } from '../styling/Color'

export const Button = (props: BoxProps) => {
  const [focus, hasFocus] = useVar1(false)
  return (
    <Focusable focus={focus}>
      <Box
        h
        fg
        clip
        border
        rounded
        button
        outline={hasFocus ? Blue : undefined}
        // type="button"
        align="start"
        tabIndex={0}
        {...props}
      />
    </Focusable>
  )
}
