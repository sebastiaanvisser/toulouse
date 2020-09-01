import * as React from 'react'
import { pieSlice } from '../icon/Icons'
import * as S from '../icon/Shape'
import { Shape } from '../icon/Shape'
import { Point } from '../lib/Geometry'
import { memo1 } from '../lib/Memo'
import { cx } from '../styling/Classy'
import { keyframes } from '../styling/Keyframes'
import { Rgba } from '../styling/Rgba'
import { style } from '../styling/Rule'
import { Icon, IconProps } from '../widget/Icon'

export type SpinnerType = 'tail' | 'segment' | 'dots'

interface Props {
  thickness?: number
  speed?: number
  spinner?: SpinnerType
}

export function Spinner(props: Props & Omit<IconProps, 'icon'>) {
  const { speed, thickness, spinner, ...rest } = props
  const img = byType[spinner ?? 'tail'](thickness ?? 2 / (props.zoom ?? 1))
  return <Icon className={cx(spinningC.get(speed))} icon={img} {...rest} />
}

// ----------------------------------------------------------------------------

const tailImg = (w: number) =>
  S.IconDef.make(`Spinner.tailImg.${w}`, () => {
    const xs = 7
    const s = 360 / xs
    const r = 8

    const sin = (deg: number) => Math.sin((deg / 180) * Math.PI)

    return Shape.layers(
      Shape.circle(r + w / 2)
        .mask(Shape.circle(r - w / 2))
        .mask(
          Shape.array(xs, d =>
            Shape.layers(
              Shape.circle(r + w)
                .gradient(
                  Rgba.Black.alpha((d * 1) / xs),
                  Rgba.Black.alpha(((d + 1) * 1) / xs),
                  [new Point(0, r * sin(-s / 2)), new Point(0, r * sin(s / 2))]
                )
                .clip(pieSlice(-(s / 2), s / 2 + 0.1, 30))
                .rotate((d * 360) / xs)
            ).rotate(s / 2)
          ).width(0)
        ),

      Shape.circle(w / 2).dx(r)
    ).scale2(1, -1)
  })

const segmentImg = (w: number) =>
  S.IconDef.make(`Spinner.segment.${w}`, () => {
    const r = 8
    const d = 60
    const ring = Shape.circle(r + w / 2).mask(Shape.circle(r - w / 2))
    return Shape.layers(
      ring.opacity(0.1), //
      ring.clip(pieSlice(-d, d, 30)),
      Shape.circle(w / 2).tr(Point.atAngle(-d, r)),
      Shape.circle(w / 2).tr(Point.atAngle(d, r))
    )
      .rotate(d)
      .scale2(1, -1)
  })

const dotsImg = () =>
  S.IconDef.make(`Spinner.dots`, () => {
    const r = 8
    const c = 16
    return Shape.array(c, i =>
      Shape.circle(i / 16)
        .dx(r)
        .rotate((i * 360) / c)
    )
  })

const byType = {
  tail: tailImg,
  segment: segmentImg,
  dots: dotsImg
}

// ----------------------------------------------------------------------------

const spinningC = memo1((speed: number = 500) =>
  style({
    animation: `${rotate360} ${speed}ms linear infinite`
  }).name('spinner')
)

export const rotate360 = keyframes(
  {
    0: { transform: 'rotate(0deg)' },
    100: { transform: 'rotate(360deg)' }
  },
  'rotate360'
)
