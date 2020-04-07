import React, { Fragment, ReactNode } from 'react'
import { eqOn, groupBy } from '../lib/Grouping'
import { once } from '../lib/Memo'
import { className, cx, pct, px, rule } from '../styling/Css'
import { Box, BoxProps } from '../box/Box'
import { FlexStyles } from '../box/Flexed'
import { useVariantClass, VariantProps } from '../box/Variant'
import { ImageStyle } from './Image'

export interface LabelProps {
  ellipsis?: boolean
  center?: boolean
  className?: string
  children?: ReactNode
}

type Props = LabelProps & VariantProps & BoxProps

export function Label(props: Props) {
  const { ellipsis, children, center, smallcaps, mono, subtle, ...rest } = props

  const variantC = useVariantClass(props)

  const className = cx(
    LabelStyling.get(),
    center && CenterStyling.get(),
    ellipsis && EllipsisStyling.get(),
    variantC,
    props.className
  )

  return (
    <Box dontConvertTextToLabels type="p" shrink {...rest} className={className}>
      {children}
    </Box>
  )
}

// ----------------------------------------------------------------------------

export function childrenToLabel(children: ReactNode): ReactNode {
  const elems = ['a', 'b', 'i', 'u']
  const types = ['ShortcutString']

  function isTextual(node: ReactNode) {
    if (typeof node === 'number' || typeof node === 'string') return true
    if (node instanceof Object && '$$typeof' in node) {
      const type = (node as any).type
      if (typeof type === 'string') return elems.indexOf(type) !== -1
      return types.indexOf(type.name) !== -1
    }
    return false
  }

  if (isTextual(children)) {
    return <Label>{children}</Label>
  }

  if (children instanceof Array) {
    const groups = groupBy(
      children.flat().map(node => ({ node, isTexual: isTextual(node) })),
      eqOn(({ isTexual }) => isTexual)
    )

    return groups.flatMap((group, j) => {
      const nodes = group
        .map(({ node }) => node)
        .map((node, i) => <Fragment key={i}>{node}</Fragment>)

      if (group[0].isTexual) {
        return [<Label key={j}>{nodes}</Label>]
      }
      return [<Fragment key={j}>{nodes}</Fragment>]
    })
  }

  return children
}

// ----------------------------------------------------------------------------

const LabelStyling = once(() => {
  const labelC = className('label', {
    margin: '0',
    boxSizing: 'border-box',
    overflow: 'auto'
  })

  const { horizontalC } = FlexStyles.get()
  const imgC = ImageStyle.get()

  horizontalC.child(imgC.sibling(labelC).or(labelC.sibling(imgC))).style({
    marginLeft: px(-5)
  })

  const bold = labelC.sub('b').or(labelC.sub('strong'))
  bold.style({ fontWeight: 500 })

  labelC.sub(rule('p').firstChild()).style({ marginTop: 0 })
  labelC.sub(rule('p').lastChild()).style({ marginBottom: 0 })

  labelC.sub(rule('h1').or(rule('h2'))).style({
    margin: 0,
    fontWeight: 500
  })

  return labelC
})

const CenterStyling = once(() =>
  className('center').style({
    textAlign: 'center'
  })
)

const EllipsisStyling = once(() =>
  className('ellipsis').style({
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: pct(100)
  })
)
