import React, { Fragment, ReactNode } from 'react'
import { Box, BoxProps } from '../box/Box'
import { usePalette, useResolvedPalette } from '../box/Paletted'
import { Unit } from '../box/Unit'
import { kappa } from '../icon/Icons'
import { poly, shapeAsDataUri } from '../icon/Shape'
import { bz, pt } from '../lib/Geometry'
import { memo1, memo2 } from '../lib/Memo'
import { useValue, Var } from '../lib/Var'
import { Bg, Palette } from '../styling'
import { className, cx, px, Rule } from '../styling/Css'

interface TabDef<A> {
  tab: A
  label: ReactNode
  props?: BoxProps
}

type Def<A> = TabDef<A> | { content: ReactNode } | undefined | null | false

interface TabsProps<A> extends BoxProps {
  active: Var<A>
  tabs: Def<A>[]
}

function Tab<A extends string | number>(props: {
  def: TabDef<A>
  bg: Palette
  fg: Palette
  isActive: boolean
  boxProps: BoxProps
  setActive: () => void
  corner: Rule
}) {
  const { def, bg, fg, isActive, boxProps, setActive, corner } = props
  return (
    <Box
      rel
      key={def.tab}
      palette={isActive ? fg : undefined}
      className={cx(tabC, tabSepC.get(bg), cornerC.get(fg), isActive && activeC, corner)}
    >
      <Box
        button={!isActive}
        bg={isActive ? Bg : undefined}
        onMouseDown={setActive}
        onMouseOver={ev => (ev.altKey ? setActive() : undefined)}
        {...boxProps}
        {...def.props}
      >
        {def.label}
      </Box>
    </Box>
  )
}

function cornerClass<A>(props: TabsProps<A>) {
  const { round, rounded, sharp } = props
  if (rounded) return roundedC
  if (round) return roundC
  if (sharp) return sharpC
  return bluntC
}

export function Tabs<A extends string | number>(props: TabsProps<A>) {
  const { active, tabs, children, ...rest } = props

  const bg = usePalette()
  const isActive = useValue(active)
  const fg = useResolvedPalette(props)
  const corner = cornerClass(props)

  const definition = (
    def: Def<A>,
    i: number,
    ac: A,
    bg: Palette,
    fg: Palette,
    panelProps: BoxProps
  ) => {
    if (!def) return

    if ('tab' in def)
      return (
        <Tab
          def={def}
          fg={fg}
          bg={bg}
          key={def.tab}
          isActive={def.tab === ac}
          setActive={() => props.active.set(def.tab)}
          boxProps={panelProps}
          corner={corner}
        />
      )

    if ('content' in def) {
      return <Fragment key={i}>{def.content}</Fragment>
    }
  }

  return (
    <Box h className={cx(tabsC)} {...rest}>
      {tabs.map((def, i) => definition(def, i, isActive, bg, fg, rest))}
    </Box>
  )
}

const circleCut = memo2((n: number, s: number) =>
  poly(
    pt(0, 0),
    pt(n, 0),
    bz(pt(n * kappa, 0), pt(0, n * kappa), pt(0, n)),
    pt(0, n) //
  )
    .d(-n / 2, -n / 2)
    .scale2(s, -1)
    .d(n / 2, n / 2)
)

// ----------------------------------------------------------------------------

const tabsC = className('tabs', { zIndex: 1 })
const tabC = className('tab')
const activeC = className('active')
const sharpC = className('sharp')
const bluntC = className('blunt')
const roundedC = className('rounded')
const roundC = className('round')

tabsC.style({
  alignItems: 'flex-end'
})

tabC.children.style({
  borderBottomLeftRadius: '0 !important',
  borderBottomRightRadius: '0 !important'
})

// tabC.child(smallC).style({
//   margin: 0
// })

activeC.style({ zIndex: 2 })

tabC.firstChild.style({ marginLeft: px(Unit) })
tabC.lastChild.style({ marginRight: px(Unit) })

activeC.before.or(activeC.after).style({
  content: '""',
  position: 'absolute',
  bottom: 0
})

const corners = [
  { c: bluntC, n: 3 },
  { c: roundedC, n: 8 },
  { c: roundC, n: 15 }
  //
]

const cornerC = memo1(
  (t: Palette) => {
    const d = className(`tab-corner-${t.name}`)
    corners.forEach(({ c, n }) => {
      const tab = d.self(activeC).self(c)

      tab.before.style({
        left: px(-n),
        backgroundImage: shapeAsDataUri(n, n, circleCut.get([n, -1]).fill(t.Bg)),
        width: px(n),
        height: px(n)
      })

      tab.after.style({
        right: px(-n),
        backgroundImage: shapeAsDataUri(n, n, circleCut.get([n, 1]).fill(t.Bg)),
        width: px(n),
        height: px(n)
      })
    })
    return d
  },
  t => t.name
)

const tabSepC = memo1(
  (palette: Palette) => {
    const c = className(`tab-sep-${palette.name}`)
    c.not(activeC)
      .not(Rule.hover)
      .sibling(tabC)
      .not(activeC)
      .not(Rule.hover)
      .before.style({
        content: '""',
        position: 'absolute',
        top: px(6),
        bottom: px(6),
        left: px(-1),
        width: px(2),
        background: palette.Hover.darken(0.2).toString() // separatorGradient('left', palette.Hover)
      })
    return c
  },
  t => t.name
)
