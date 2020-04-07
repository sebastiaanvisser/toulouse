import React, { ReactNode, useEffect, useState } from 'react'
import { Box, Unit } from 'toulouse/box'
import { RenderCell, Virtual } from 'toulouse/dyn'
import { Point, Prim, range, Sided } from 'toulouse/lib'
import { Primary, Shade } from 'toulouse/styling'
import { Label, Panel } from 'toulouse/widget'
import { Country, fetchCountries } from '../data/World'

interface Props {
  debug: boolean
  overflow: Sided
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
      <Box bg sep clip shadow blunt palette={Primary} v>
        {cs}
      </Box>
    ) : (
      <Box sep clip v>
        {cs}
      </Box>
    )

  return (
    <Panel rel sharp elevate width={Unit * 14} height={Unit * 20} v>
      <Box bg palette={Shade}>
        Header
      </Box>
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
      <Box bg palette={Shade}>
        Footer
      </Box>
    </Panel>
  )
}
