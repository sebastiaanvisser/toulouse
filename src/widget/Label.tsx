import React, { Fragment, ReactNode } from 'react'
import { Box, BoxProps } from '../box/Box'
import { horizontalC } from '../box/Flexed'
import { useVariantClass, VariantProps } from '../box/Variant'
import { eqOn, groupBy } from '../lib/Grouping'
import { cx, px, pct } from '../styling/Classy'
import { style, rule } from '../styling/Rule'
import { ShortcutString } from './ShortcutString'

type Justify = 'left' | 'center' | 'right'

export interface LabelProps {
  ellipsis?: boolean
  justify?: Justify
  className?: string
  children?: ReactNode
}

export function Label(props: BoxProps) {
  const { ellipsis, children, justify, smallcaps, mono, subtle, ...rest } = props

  const variantC = useVariantClass(props)

  const className = cx(
    labelC,
    justify === 'center' && centerC,
    justify === 'right' && rightC,
    ellipsis && ellipsisC,
    variantC,
    props.className
  )

  return (
    <Box dontConvertTextToLabels fg type="p" shrink {...rest} className={className}>
      {children}
    </Box>
  )
}

export function Inline(props: BoxProps) {
  return <Box dontConvertTextToLabels type="span" {...props} />
}

// ----------------------------------------------------------------------------

export function childrenToLabel(
  children: ReactNode,
  props: LabelProps & VariantProps
): ReactNode {
  const elems = ['a', 'b', 'i', 'u']
  const types = [ShortcutString, Inline]

  function isTextual(node: ReactNode) {
    if (typeof node === 'number' || typeof node === 'string') return true
    if (node instanceof Object && '$$typeof' in node) {
      const type = (node as any).type
      if (typeof type === 'string') return elems.indexOf(type) !== -1
      return types.indexOf(type) !== -1
    }
    return false
  }

  if (isTextual(children)) {
    return <Label {...props}>{children}</Label>
  }

  if (children instanceof Array) {
    const groups = groupBy(
      children.flat().map(node => ({ node, isTexual: isTextual(node) })),
      eqOn(({ isTexual }) => isTexual)
    )

    return groups.flatMap((group, j) => {
      const nodes = group
        .map(({ node }) => node)
        .map((node, i) => <Fragment key={i}>{node}</Fragment>) // wrong!

      if (group[0].isTexual) {
        return [
          <Label key={j} {...props}>
            {nodes}
          </Label>
        ]
      }
      return [<Fragment key={j}>{nodes}</Fragment>]
    })
  }

  return children
}

// ----------------------------------------------------------------------------

const labelC = style({
  margin: '0',
  boxSizing: 'border-box',
  overflow: 'auto'
})

horizontalC
  .child(labelC)
  .sibling(labelC)
  .style({
    marginLeft: px(-15)
  })

const bold = labelC.deep('b').or(labelC.deep('strong'))
bold.style({ fontWeight: 500 })

labelC.deep(rule('p').firstChild).style({ marginTop: 0 })
labelC.deep(rule('p').lastChild).style({ marginBottom: 0 })

labelC.deep(rule('h1').or(rule('h2'))).style({
  margin: 0,
  fontWeight: 500
})

const centerC = style({ textAlign: 'center' }).name('left')
const rightC = style({ textAlign: 'right' }).name('right')

const ellipsisC = style({
  display: 'block',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  width: pct(100)
}).name('ellipsis')
