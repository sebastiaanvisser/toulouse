import * as React from 'react'
import { ReactNode } from 'react'
import { usePalette } from '../box'
import { Box, BoxProps } from '../box/Box'
import { groupBy } from '../lib'
import { useValue, Var } from '../lib/Var'
import { Bg, Palette, Shade } from '../styling'

export type Option<A> = { id: A; label: ReactNode | ((isActive: boolean) => ReactNode) }

interface Props<A> {
  active: Var<A>
  options: Option<A>[]
}

function Option<A>(props: { active: Var<A>; activePalette: Palette; option: Option<A> }) {
  const { active, option, activePalette } = props
  const { id, label } = option
  const isActive = useValue(active) === id
  return (
    <Box
      pad={{ h: 5 }}
      button={!isActive}
      blunt
      h
      bg={isActive}
      shadow={isActive}
      palette={isActive ? activePalette : undefined}
      onClick={() => active.set(id)}
      onMouseOver={ev => (ev.altKey ? active.set(id) : undefined)}
    >
      {label instanceof Function ? label(isActive) : label}
    </Box>
  )
}

export function OptionButtons<A extends string | number>(props: Props<A> & BoxProps) {
  const { active, options, ...rest } = props
  const isActive = useValue(active)
  const groups = groupBy(options, (a, b) => (isActive === a.id) == (isActive === b.id))
  const palette = usePalette().Primary()
  return (
    <Box bg blunt palette={Shade} h outline={Bg} {...rest}>
      {groups.map((g, ix) => (
        <Box key={ix} h sep={g[0].id !== isActive}>
          {g.map(option => (
            <Option
              activePalette={palette}
              active={active}
              key={option.id}
              option={option}
            />
          ))}
        </Box>
      ))}
    </Box>
  )
}
