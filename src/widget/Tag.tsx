import * as React from 'react'
import { BoxProps, Box } from '../box/Box'
import { roundC, roundedC } from '../box/Corner'
import { Small } from '../box/Small'
import { SmallUnit, Unit, Smaller } from '../box/Unit'
import { cx, px, leftRadius, rightRadius } from '../styling/Classy'
import { style } from '../styling/Rule'

export function Tag(props: BoxProps) {
  const { className, ...rest } = props
  return (
    <Small>
      <Box
        shrink
        clip
        bg
        blunt
        h
        align="start"
        className={cx(className, tagC)}
        {...rest}
      />
    </Small>
  )
}

export function Tags(props: BoxProps) {
  const { className, ...rest } = props
  return (
    <Small>
      <Box pad bg spaced h className={cx(className, tagsC)} {...rest} />
    </Small>
  )
}

// ----------------------------------------------------------------------------

const tagC = style({
  minWidth: px(SmallUnit),
  minHeight: px(SmallUnit)
}).name('Tag')

const tagsC = style({
  flexWrap: 'wrap',
  paddingBottom: 0,
  minWidth: px(Unit),
  minHeight: px(Unit)
}).name('tags')

tagsC.children.style({
  margin: 0,
  marginBottom: px(Smaller),
  maxWidth: `calc(100% - ${px(Smaller)})`,
  wordBreak: 'break-all'
})

tagsC.self(roundC).children.firstChild.style(leftRadius(px(11)))
tagsC.self(roundC).children.lastChild.style(rightRadius(px(11)))
tagsC.self(roundedC).children.firstChild.style(leftRadius(px(5)))
tagsC.self(roundedC).children.lastChild.style(rightRadius(px(5)))
