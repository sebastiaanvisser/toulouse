import React, { ReactNode, useEffect, useState } from 'react'
import { Box } from '../../box/Box'
import { Theme } from '../../box/Themed'
import { Unit } from '../../box/Unit'
import { RenderCell, Virtual } from '../../dyn/Virtual'
import { Point, SidesDef } from '../../lib/Geometry'
import { Prim } from '../../lib/Grouping'
import { range } from '../../lib/Range'
import { Shade } from '../../styling/Color'
import { Label } from '../../widget/Label'
import { Panel } from '../../widget/Panel'
import { Country, fetchCountries } from '../data/World'

interface Props {
  debug: boolean
  overflow: SidesDef
  block: number
}

export function VirtualList(props: Props) {
  const { overflow, block, debug } = props

  const [countries, setCountries] = useState<Country[]>([])
  const [, setError] = useState(false)

  const list = countries.flatMap(country => [country.name])

  const fetch = () => {
    fetchCountries()
      .then(v => {
        setCountries(
          range(0, 256)
            .iterate()
            .flatMap(() => v)
        )
        setError(false)
      })
      .catch(() => setError(true))
  }

  useEffect(fetch, [])

  const renderList = (items: React.ReactNode[]) => <Box v>{items}</Box>

  const renderItem = (d: string, pos: Point, _d: any, _m: any, group: Prim) => (
    <Box pad={5} h key={pos.y} bg={group === true}>
      <Label grow>{d}</Label>
      <Label subtle>{pos.y}</Label>
    </Box>
  )

  const renderGroup = (cs: ReactNode[], sel: boolean) =>
    sel ? (
      <Theme primary>
        <Box bg sep clip shadow blunt v>
          {cs}
        </Box>
      </Theme>
    ) : (
      <Box sep clip v>
        {cs}
      </Box>
    )

  return (
    <Panel rel sharp elevate width={Unit * 14} height={Unit * 20} v>
      <Theme>
        <Box bg={Shade}>Header</Box>
      </Theme>
      <Box grow height={400}>
        <Virtual<string, boolean>
          data={{ vertical: list }}
          renderContainer={renderList}
          renderGroup={renderGroup}
          renderRow={a => a}
          renderCell={renderItem as RenderCell<string>}
          rowHeight={() => 40}
          group={(_v, y) => (y % 20 > 4 && y % 20 < 10 ? true : false)}
          colWidth={() => Unit}
          overflow={overflow}
          block={{ h: 1, v: block }}
          debugOverlay={debug}
          pad={5}
        />
      </Box>
      <Box bg={Shade}>Footer</Box>
    </Panel>
  )
}
