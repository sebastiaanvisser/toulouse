import { Sided } from '../lib/Geometry'
import { memo1 } from '../lib/Memo'
import { className, cx, px, Rule } from '../styling'
import { SmallProps, useSmall } from './Small'
import { Smaller } from './Unit'

export interface FlexProps {
  h?: boolean
  v?: boolean
  spaced?: boolean | number
  pad?: boolean | Sided
  margin?: boolean | Sided

  grow?: boolean
  shrink?: boolean

  center?: boolean
  middle?: boolean
  spread?: boolean
  end?: boolean

  align?: 'start' | 'center' | 'end' | 'auto'
  scroll?: true
}

// ----------------------------------------------------------------------------

export function flexClass(props: FlexProps & SmallProps) {
  const {
    h,
    v,
    pad,
    margin,
    center,
    shrink,
    grow,
    middle,
    spaced,
    spread,
    end,
    align,
    scroll
  } = props

  const {
    horizontalC,
    verticalC,
    centerC,
    middleC,
    shrinkC,
    noshrinkC,
    growC,
    spreadC,
    endC,
    alignStartC,
    alignCenterC,
    alignEndC,
    scrollC
  } = FlexStyles

  const small = useSmall() || props.small
  const m = small ? 10 - Smaller : 10

  return cx(
    h && horizontalC,
    v && verticalC,
    center && centerC,
    middle && middleC,
    shrink === true && shrinkC,
    shrink === false && noshrinkC,
    grow && growC,
    pad ? paddedC.get(pad === true ? m : pad) : undefined,
    margin ? marginC.get(margin === true ? m : margin) : undefined,
    spaced ? spacedC.get(spaced === true ? m : spaced) : undefined,
    spread && spreadC,
    end && endC,
    align === 'start' && alignStartC,
    align === 'center' && alignCenterC,
    align === 'end' && alignEndC,
    scroll === true && scrollC
  )
}

// ----------------------------------------------------------------------------

const horizontalC = className('h', {
  display: 'flex',
  flexDirection: 'row'
})

const verticalC = className('v', {
  display: 'flex',
  flexDirection: 'column'
})

const centerC = className('center', { justifyContent: 'center' })
const spreadC = className('spread', { justifyContent: 'space-between' })
const endC = className('spread', { justifyContent: 'flex-end' })
const middleC = className('middle', { alignItems: 'center' })

const growC = className('grow', {
  flexGrow: 1,
  flexShrink: 'unset'
})

const shrinkC = className('shrink', { flexShrink: 'unset' })
const noshrinkC = className('noshrink', { flexShrink: 0 })

const alignStartC = className('align-start', { alignSelf: 'flex-start' })
const alignCenterC = className('align-center', { alignSelf: 'center' })
const alignEndC = className('align-end', { alignSelf: 'flex-end' })

const scrollC = className('scroll', { overflow: 'auto' })

verticalC.child('hr').style({
  backgroundColor: '#d6dfe2',
  height: px(1),
  width: 'calc(100% - 10px)',
  border: 'none',
  margin: 0,
  marginTop: px(7),
  marginBottom: px(7)
})

horizontalC.child('hr').style({
  backgroundColor: '#d6dfe2',
  width: px(1),
  height: 'calc(100%)',
  border: 'none',
  margin: 0,
  marginLeft: px(7),
  marginRight: px(7)
})

export const FlexStyles = {
  horizontalC,
  verticalC,
  centerC,
  middleC,
  shrinkC,
  noshrinkC,
  growC,
  spreadC,
  endC,
  alignStartC,
  alignCenterC,
  alignEndC,
  scrollC
}

const renderSided = (s: Sided) => {
  if (typeof s === 'number') return px(s)
  if ('h' in s && 'v' in s) return [s.v, s.h].map(px).join(' ')
  if ('h' in s) return [0, s.h].map(px).join(' ')
  if ('v' in s) return [s.v, 0].map(px).join(' ')
  return [s.top, s.right, s.bottom, s.left].map(px).join(' ')
}

const paddedC = memo1((pad: Sided) =>
  className(`pad`, {
    padding: renderSided(pad)
  })
)

const marginC = memo1((margin: Sided) =>
  className(`margin`, {
    margin: renderSided(margin)
  })
)

const spacedC = memo1((sp: number) => {
  const { horizontalC, verticalC } = FlexStyles

  const spacedC = className(`spaced${sp}`)

  spacedC
    .self(horizontalC)
    .children.not(Rule.lastChild)
    .not('hr')
    .style({ marginRight: px(sp) })

  spacedC
    .self(verticalC)
    .children.not(Rule.lastChild)
    .not('hr')
    .style({ marginBottom: px(sp) })

  return spacedC
})
