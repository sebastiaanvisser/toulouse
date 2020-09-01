import * as React from 'react'
import { ReactNode } from 'react'
import { Box, BoxProps } from '../box/Box'
import { Theme } from '../box/Themed'
import { groupBy } from '../lib/Grouping'
import { useValue, Var } from '../lib/Var'
import { Bg } from '../styling/Color'

export type Option<A> = { id: A; label: ReactNode | ((isActive: boolean) => ReactNode) }

interface Props<A> {
  active: Var<A>
  options: Option<A>[]
}

function Option<A>(props: { active: Var<A>; option: Option<A> }) {
  const { active, option } = props
  const { id, label } = option
  const isActive = useValue(active) === id
  return (
    <Theme primary={isActive}>
      <Box
        h
        pad={{ h: 5 }}
        button={!isActive}
        blunt
        bg={isActive}
        shadow={isActive}
        onClick={() => active.set(id)}
        onMouseOver={ev => (ev.altKey ? active.set(id) : undefined)}
      >
        {label instanceof Function ? label(isActive) : label}
      </Box>
    </Theme>
  )
}

export function OptionButtons<A extends string | number>(props: Props<A> & BoxProps) {
  const { active, options, ...rest } = props
  const isActive = useValue(active)
  const groups = groupBy(options, (a, b) => (isActive === a.id) == (isActive === b.id))
  // sep={g[0].id !== isActive}>
  return (
    <Box bg blunt border h outline={Bg} {...rest}>
      {groups.map((g, ix) => (
        <Box key={ix} h>
          {g.map(option => (
            <Option active={active} key={option.id} option={option} />
          ))}
        </Box>
      ))}
    </Box>
  )
}
