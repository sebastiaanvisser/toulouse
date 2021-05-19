import React, { Fragment, ReactNode } from 'react'
import { Box, BoxProps } from '../box/Box'
import { bluntC, roundC, roundedC, sharpC } from '../box/Corner'
import { Theme, usePalette } from '../box/Themed'
import { Unit } from '../box/Unit'
import { kappa } from '../icon/Icons'
import { Shape, shapeAsDataUri } from '../icon/Shape'
import { BezierPoint, Point, Rect } from '../lib/Geometry'
import { memo1, memo2, memo3 } from '../lib/Memo'
import { useValue, Var } from '../lib/Var'
import { cx, px } from '../styling/Classy'
import { Bg, Fg } from '../styling/Color'
import { Palette } from '../styling/Palette'
import { className, style } from '../styling/Rule'
import { ClassSelector, Hover_ } from '../styling/Selector'

export interface TabDef<A> {
  tab: A
  label: ReactNode
  props?: BoxProps
}

export interface TabProps {
  joiner?: boolean
}

export type Def<A> = TabDef<A> | { content: ReactNode } | undefined | null | false

function Tab<A extends string | number>(
  props: {
    def: TabDef<A>
    bgPalette: Palette
    fgPalette: Palette
    isActive: boolean
    setActive: () => void
    corner: ClassSelector
  } & BoxProps &
    TabProps
) {
  const { def, bgPalette, fgPalette, isActive, setActive, corner, joiner, ...rest } =
    props

  return (
    <Theme palette={isActive ? fgPalette : undefined}>
      <Box
        rel
        key={def.tab}
        className={cx(
          tabC,
          tabSepC.get(bgPalette),
          isActive && tabCornerC.get([fgPalette, true, true]),
          isActive && activeC,
          corner
        )}
      >
        <Box
          // clip
          button={!isActive}
          bg={isActive ? true : undefined}
          onMouseDown={setActive}
          onMouseOver={ev => (ev.altKey ? setActive() : undefined)}
          {...rest}
          {...def.props}
          blunt
          fg={Fg}
        >
          {def.label}
          {joiner && <Box abs bg={Bg} {...new Rect(-10, 30, -10, -10)} />}
        </Box>
      </Box>
    </Theme>
  )
}

interface TabsProps<A> extends BoxProps {
  active: Var<A | undefined>
  tabs: Def<A>[]
  tabProps?: (active: boolean) => BoxProps & TabProps
  bgPalette?: Palette
  onSwitch?: (tab: A) => void
}

function cornerClass<A>(props: TabsProps<A>) {
  const { round, rounded, sharp } = props
  if (rounded) return roundedC
  if (round) return roundC
  if (sharp) return sharpC
  return bluntC
}

export function Tabs<A extends string | number>(props: TabsProps<A>) {
  const {
    active,
    tabs,
    children,
    bgPalette,
    onSwitch,
    tabProps = () => {},
    ...rest
  } = props

  const fgPalette = usePalette()
  const curActive = useValue(active)
  const corner = cornerClass(props)

  const definition = (def: Def<A>, i: number) => {
    if (!def) return

    if ('tab' in def) {
      const isActive = def.tab === curActive
      return (
        <Theme palette={isActive ? fgPalette : bgPalette}>
          <Tab
            def={def}
            bgPalette={bgPalette ?? fgPalette}
            fgPalette={fgPalette}
            key={def.tab}
            isActive={isActive}
            setActive={() => {
              props.active.set(def.tab)
              if (onSwitch) onSwitch(def.tab)
            }}
            corner={corner}
            {...tabProps(isActive)}
          />
        </Theme>
      )
    }

    if ('content' in def) {
      return <Fragment key={i}>{def.content}</Fragment>
    }
  }

  return (
    <Box h z className={cx(tabsC)} {...rest}>
      {tabs.map((def, i) => definition(def, i))}
    </Box>
  )
}

const circleCut = memo2((n: number, s: number) =>
  Shape.poly(
    new Point(0, 0),
    new Point(n, 0),
    new BezierPoint(
      new Point(n * kappa, 0),
      new Point(0, n * kappa),
      new Point(0, n) //
    ),
    new Point(0, n) //
  )
    .d(-n / 2, -n / 2)
    .scale2(s, -1)
    .d(n / 2, n / 2)
)

// ----------------------------------------------------------------------------

const tabsC = style({
  alignItems: 'flex-end'
}).name('tabs')

const tabC = style().name('tab')

tabC.children.style({
  borderBottomLeftRadius: '0 !important',
  borderBottomRightRadius: '0 !important'
})

// tabC.child(smallC).style({
//   margin: 0
// })

const activeC = className('active-tab').style({ zIndex: 2 })

tabC.firstChild.style({ marginLeft: px(Unit) })
tabC.lastChild.style({ marginRight: px(Unit) })

const tabCorners = [
  { c: sharpC, n: 0 },
  { c: bluntC, n: 3 },
  { c: roundedC, n: 8 },
  { c: roundC, n: 15 }
]

const tabCornerC = memo3(
  (t: Palette, left: boolean, right: boolean) => {
    const d = style()

    d.style({
      borderBottomLeftRadius: '0 !important',
      borderBottomRightRadius: '0 !important' //
    })

    tabCorners.forEach(({ c, n }) => {
      const tab = d.self(c)

      if (left)
        tab.before.style({
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: px(-n),
          backgroundImage: shapeAsDataUri(n, n, circleCut.get([n, -1]).fill(t.Bg)),
          width: px(n),
          height: px(n)
        })

      if (right)
        tab.after.style({
          content: '""',
          position: 'absolute',
          bottom: 0,
          right: px(-n),
          backgroundImage: shapeAsDataUri(n, n, circleCut.get([n, 1]).fill(t.Bg)),
          width: px(n),
          height: px(n)
        })
    })
    return d
  },
  (p, b, c) => [p.name, b, c]
)

const tabSepC = memo1(
  (palette: Palette) => {
    const c = style()
    c.not(activeC)
      .not(Hover_)
      .sibling(tabC)
      .not(activeC)
      .not(Hover_)
      .before.style({
        content: '""',
        position: 'absolute',
        top: px(6),
        bottom: px(6),
        left: px(-1),
        width: px(2),
        background: palette.Hovering.toString() // separatorGradient('left', palette.Hovering)
      })
    return c
  },
  t => t.name
)
