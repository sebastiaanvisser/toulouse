import { Sides, SidesDef } from '../lib/Geometry'
import { cx, px } from '../styling/Classy'
import { className, style } from '../styling/Rule'
import { LastChild } from '../styling/Selector'
import { SmallProps, useSmall } from './Small'
import { Smaller } from './Unit'

export interface Props {
  h?: boolean
  v?: boolean
  spaced?: boolean | number
  pad?: boolean | SidesDef
  margin?: boolean | SidesDef

  grow?: boolean | number
  shrink?: boolean

  center?: boolean
  middle?: boolean
  spread?: boolean
  end?: boolean
  wrap?: boolean

  align?: 'start' | 'center' | 'end' | 'auto'
  scroll?: true
}

// ----------------------------------------------------------------------------

export function classes(props: Props & SmallProps) {
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
    wrap,
    align,
    scroll
  } = props

  const small = useSmall() || props.small
  const m = small ? 10 - Smaller : 10

  return cx(
    h && horizontalC,
    v && verticalC,
    center && centerC,
    middle && middleC,
    shrink === true && shrinkC,
    shrink === false && noshrinkC,
    typeof grow === 'number' && growC(grow),
    grow === true && growC(1),
    pad ? paddedC(pad === true ? m : pad) : undefined,
    margin ? marginC(margin === true ? m : margin) : undefined,
    spaced ? spacedC(spaced === true ? m : spaced) : undefined,
    spread && spreadC,
    end && endC,
    wrap && wrapC,
    align === 'start' && alignStartC,
    align === 'center' && alignCenterC,
    align === 'end' && alignEndC,
    scroll === true && scrollC
  )
}

// ----------------------------------------------------------------------------

export const horizontalC = className('h')
export const verticalC = className('v')

horizontalC.style({
  display: 'flex',
  flexDirection: 'row'
})

verticalC.style({
  display: 'flex',
  flexDirection: 'column'
})

const centerC = style({ justifyContent: 'center' })
const spreadC = style({ justifyContent: 'space-between' })
const endC = style({ justifyContent: 'flex-end' })
const wrapC = style({ flexWrap: 'wrap' })
const middleC = style({ alignItems: 'center' })

const growC = (flexGrow: number) =>
  style({
    flexGrow,
    flexShrink: 'unset'
  }).name(`grow${flexGrow}`)

const shrinkC = style({ flexShrink: 'unset' }).name('shrink')
const noshrinkC = style({ flexShrink: 0 }).name('noshrink')
const alignStartC = style({ alignSelf: 'flex-start' }).name('align-start')
const alignCenterC = style({ alignSelf: 'center' }).name('align-center')
const alignEndC = style({ alignSelf: 'flex-end' }).name('align-end')

const scrollC = style({
  overflow: 'auto' //
}).name('scroll')

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

const paddedC = (pad: SidesDef) =>
  style({
    padding: new Sides(pad).render()
  }).name(`pad`)

const marginC = (margin: SidesDef) =>
  style({
    margin: new Sides(margin).render()
  }).name(`margin`)

const spacedC = (space: number) => {
  const sp = style()

  sp.self(horizontalC)
    .children.not(LastChild)
    .not('hr')
    .style({ marginRight: px(space) })

  sp.self(verticalC)
    .children.not(LastChild)
    .not('hr')
    .style({ marginBottom: px(space) })

  return sp
}
