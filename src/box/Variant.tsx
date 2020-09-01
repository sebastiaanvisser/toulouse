import { cx, px } from '../styling/Classy'
import { style } from '../styling/Rule'
import { smallC, SmallProps, useSmall } from './Small'

export interface VariantProps {
  smallcaps?: boolean
  mono?: boolean
  subtle?: boolean
  bold?: boolean
}

export function useVariantClass(props: VariantProps & SmallProps) {
  const { mono, smallcaps, subtle, bold } = props

  const small = useSmall() || props.small || false
  const regular = !mono && !smallcaps

  return cx(
    small && smallC,
    regular && regularC,
    mono && monoC,
    smallcaps && smallcapsC,
    subtle && subtleC,
    bold && boldC
  )
}

// ----------------------------------------------------------------------------

export const LabelFont = "'Ubuntu', 'Open Sans', 'Helvetica', sans-serif"
export const MonoFont = "'Ubuntu Mono', 'Courier', monospace"
export const SmallcapsFont = LabelFont

const regularC = style({
  fontFamily: LabelFont,
  fontSize: px(13),
  lineHeight: px(20),
  padding: '5px 10px'
}).name('regular')

regularC.self(smallC).style({
  fontSize: px(11),
  lineHeight: px(14),
  padding: '3px 8px'
})

const monoC = style({
  fontFamily: MonoFont,
  fontSize: px(13),
  lineHeight: px(15),
  whiteSpace: 'pre-wrap',
  padding: '7.5px 10px'
}).name('mono')

monoC.self(smallC).style({
  fontSize: px(12),
  lineHeight: px(13),
  padding: '3px 8px'
})

const smallcapsC = style({
  fontFamily: SmallcapsFont,
  textTransform: 'uppercase',
  fontWeight: 500,
  fontSize: px(11),
  letterSpacing: px(0.5),
  padding: '9px 10px'
}).name('smallcaps')

smallcapsC.self(smallC).style({
  fontSize: px(10),
  padding: '4.5px 8px 3.5px 8px'
})

const subtleC = style({
  fontFamily: LabelFont,
  fontSize: px(11),
  lineHeight: px(14),
  padding: '8px 10px',
  opacity: 0.5
}).name('subtle')

subtleC.self(smallC).style({
  fontSize: px(10),
  padding: '4px 8px 2px 8px'
})

const boldC = style({
  fontWeight: 500
})
