import * as React from 'react'
import { Box, BoxProps } from '../box'

export const Button = (props: BoxProps) => (
  <Box clip rounded border button h align="start" {...props} />
)
