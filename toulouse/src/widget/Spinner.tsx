import * as React from 'react'
import { SmallerUnit, useResolvedeSmall } from '../box'
import { Box, BoxProps, Unit } from '../box/Box'
import { pieSlice } from '../icon/Icons'
import { array, circleShape, layers } from '../icon/Shape'
import { Point, pt } from '../lib/Geometry'
import { memo1 } from '../lib/Memo'
import { Rgba } from '../styling'
import { className, cx, keyframes } from '../styling/Css'
import { Img } from '../widget'

export type SpinnerType = 'tail' | 'segment' | 'dots'

interface Props {
  thickness?: number
  speed?: number
  spinner?: SpinnerType
}

export function Spinner(props: Props & BoxProps) {
  const { speed, thickness, spinner, ...rest } = props
  const small = useResolvedeSmall(props)
  const unit = small ? SmallerUnit : Unit
  const img = byType[spinner ?? 'tail'].get(thickness || 2)
  return (
    <Box width={unit} height={unit} {...rest}>
      <Img className={cx(spinnerC.get(speed))} img={img} width={Unit} height={Unit} />
    </Box>
  )
}

// ----------------------------------------------------------------------------

const tailImg = memo1((w: number) => {
  const xs = 3
  const s = 360 / xs
  const r = 8

  const sin = (deg: number) => Math.sin((deg / 180) * Math.PI)

  return layers(
    circleShape(r + w / 2)
      .mask(circleShape(r - w / 2))
      .mask(
        array(xs, d =>
          layers(
            circleShape(r + w)
              .gradient(
                Rgba.Black.alpha((d * 1) / xs),
                Rgba.Black.alpha(((d + 1) * 1) / xs),
                [pt(0, r * sin(-s / 2)), pt(0, r * sin(s / 2))]
              )
              .clip(pieSlice(-(s / 2), s / 2 + 0.1, 30))
              .rotate((d * 360) / xs)
          ).rotate(s / 2)
        )
      ),
    circleShape(w / 2).dx(r)
  )
    .scale2(1, -1)
    .d(15, 15)
})

const segmentImg = memo1((w: number) => {
  const r = 8
  const d = 60

  const ring = circleShape(r + w / 2).mask(circleShape(r - w / 2))

  return layers(
    ring.opacity(0.1), //
    ring.clip(pieSlice(-d, d, 30)),
    circleShape(w / 2).tr(Point.atAngle(-d, r)),
    circleShape(w / 2).tr(Point.atAngle(d, r))
  )
    .rotate(d)
    .scale2(1, -1)
    .d(15, 15)
})

const dotsImg = memo1((_w: number) => {
  const r = 8
  const c = 16
  return array(c, i =>
    circleShape(i / 16)
      .dx(r)
      .rotate((i * 360) / c)
  ).d(15, 15)
})

const byType = {
  tail: tailImg,
  segment: segmentImg,
  dots: dotsImg
}

// ----------------------------------------------------------------------------

const spinnerC = memo1((speed: number = 500) =>
  className('spinner', {
    animation: `${rotate360} ${speed}ms linear infinite`
  })
)

export const rotate360 = keyframes({
  0: { transform: 'rotate(0deg)' },
  100: { transform: 'rotate(360deg)' }
})
