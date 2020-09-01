import React, { ReactNode } from 'react'
import { Box, BoxProps } from '../box/Box'
import { clickableC } from '../box/Clickable'
import { useSmall } from '../box/Small'
import { Unit } from '../box/Unit'
import * as S from '../icon/Shape'
import { ShapeSvg } from '../icon/Shape'
import { Cache } from '../lib/Cache'
import { className, style } from '../styling/Rule'
import { Active, Any, Hover_ } from '../styling/Selector'

const cache = new Cache<ReactNode>()

// ----------------------------------------------------------------------------

export interface IconProps extends BoxProps {
  icon: S.IconDef
  zoom?: number
  rotate?: number
}

export function Icon(props: IconProps) {
  const { icon, zoom = 1, rotate = 0, ...rest } = props

  const small = useSmall()

  const zoom1 = small ? (zoom * 2) / 3 : zoom

  const size = Unit * zoom1

  let svg = cache.with(`${icon.name}-${zoom1}-${rotate}`, () => (
    <ShapeSvg
      shape={icon.shape()}
      width={size}
      height={size}
      className={transC(zoom1, rotate).className()}
    />
  ))

  return (
    <Box fg {...rest} width={size} height={size} cx={iconC}>
      {svg}
    </Box>
  )
}

// ----------------------------------------------------------------------------

export const iconC = className('icon')

iconC.style({
  flexShrink: 0,
  alignSelf: 'flex-start',
  strokeWidth: 0
})

Any.self(clickableC)
  .selfOrSub(iconC)
  .child('svg')
  .style({ transition: 'transform 150ms ease' })

Any.self(clickableC)
  .self(Hover_)
  .not(Active)
  .selfOrSub(iconC)
  .child('svg')
  .style({ transform: 'scale(1.15)' })

Any.self(clickableC)
  .self(Active)
  .selfOrSub(iconC)
  .child('svg')
  .style({ transform: 'scale(0.95)' })

const transC = (zoom: number, rotate: number) => {
  const st = style()
  st.child('g').style({
    transform: [
      `scale(${zoom})`,
      `translate(15px, 15px)`,
      `rotate(${rotate}deg)`,
      `translate(-15px, -15px)`
    ].join(' ')
  })
  return st
}
