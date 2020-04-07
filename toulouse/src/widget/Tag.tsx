import * as React from 'react'
import { Box, BoxProps, CornerStyles, Smaller, SmallerUnit, Unit } from '../box'
import { once } from '../lib/Memo'
import { className, cx, leftRadius, px, rightRadius } from '../styling/Css'

export function Tag(props: BoxProps) {
  const { className, ...rest } = props
  const tagC = TagStyles.get()
  return (
    <Box
      small
      shrink
      clip
      bg
      blunt
      h
      align="start"
      className={cx(className, tagC)}
      {...rest}
    />
  )
}

export function Tags(props: BoxProps) {
  const { className, ...rest } = props
  const tagsC = TagsStyles.get()
  return <Box small pad bg spaced h className={cx(className, tagsC)} {...rest} />
}

// ----------------------------------------------------------------------------

export const TagStyles = once(() => {
  const tagC = className('tag')

  tagC.style({
    minWidth: px(SmallerUnit),
    minHeight: px(SmallerUnit)
  })

  return tagC
})

export const TagsStyles = once(() => {
  const tagsC = className('tags').style({
    flexWrap: 'wrap',
    paddingBottom: 0,
    minWidth: px(Unit),
    minHeight: px(Unit)
  })

  tagsC.child().style({
    margin: 0,
    marginBottom: px(Smaller),
    maxWidth: `calc(100% - ${px(Smaller)})`,
    wordBreak: 'break-all'
  })

  const { roundedC, roundC } = CornerStyles.get()

  tagsC
    .self(roundC)
    .child()
    .firstChild()
    .style(leftRadius(px(11)))
  tagsC
    .self(roundC)
    .child()
    .lastChild()
    .style(rightRadius(px(11)))
  tagsC
    .self(roundedC)
    .child()
    .firstChild()
    .style(leftRadius(px(5)))
  tagsC
    .self(roundedC)
    .child()
    .lastChild()
    .style(rightRadius(px(5)))

  return tagsC
})
