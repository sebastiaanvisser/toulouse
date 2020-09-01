import * as React from 'react'
import { Box } from '../box/Box'
import { Small } from '../box/Small'
import { Theme } from '../box/Themed'
import { SmallUnit, Unit } from '../box/Unit'
import { Attach } from '../dyn/Attach'
import { Focusable } from '../dyn/Focus'
import { Icons } from '../icon/Icons'
import { useValue, useVar } from '../lib/Var'
import {
  Aqua,
  Bg,
  Black,
  Blue,
  Color,
  Cyan,
  Fg,
  Green,
  Indigo,
  Lime,
  Magenta,
  Orange,
  Purple,
  Red,
  Rose,
  White,
  Yellow
} from '../styling/Color'
import { Balloon } from '../widget/Balloon'
import { Icon } from '../widget/Icon'
import { Label } from '../widget/Label'
import { Panel } from '../widget/Panel'

const SinglePanel = (props: { bg: Color; name: string }) => {
  const focus = useVar(false)
  const hasFocus = useValue(focus)

  const { bg, name } = props
  return (
    <Attach
      attachment={() =>
        hasFocus && (
          <Small>
            <Theme primary>
              <Balloon
                position="top"
                open={focus}
                handle={false}
                elevate={false}
                shadow={false}
                transitions={[]}
                margin={-SmallUnit / 2 + 1}
              >
                {name}
              </Balloon>
            </Theme>
          </Small>
        )
      }
    >
      <Focusable focus={focus}>
        <Panel
          tabIndex={0}
          outline={hasFocus}
          key={name}
          shadow={!hasFocus}
          elevate={hasFocus}
        >
          <Icon fg={bg} zoom={3} icon={Icons.Blob} />
        </Panel>
      </Focusable>
    </Attach>
  )
}

export function Colors() {
  const blank = <Box bg={Fg.alpha(0.02)} blunt width={Unit * 3} height={Unit * 3} />

  return (
    <Box v pad={Unit * 2} spaced>
      <Box h spaced>
        <Label width={60}>b/W</Label>
        <SinglePanel bg={Black} name="black" />
        <SinglePanel bg={White} name="white" />
        {blank}
        {blank}
      </Box>
      <Box h spaced>
        <Label width={60}>fg/bg</Label>
        <SinglePanel bg={Fg} name="fg" />
        <SinglePanel bg={Bg} name="bg" />
        {blank}
        {blank}
      </Box>
      <Box h spaced>
        <Label width={60}>Colors</Label>
        <Box v spaced>
          <Box h spaced middle>
            <SinglePanel bg={Orange} name="orange" />
            <SinglePanel bg={Red} name="red" />
            <SinglePanel bg={Rose} name="rose" />
            <SinglePanel bg={Magenta} name="magenta" />
          </Box>
          <Box h spaced middle>
            <SinglePanel bg={Yellow} name="yellow" />
            {blank}
            {blank}
            <SinglePanel bg={Purple} name="purple" />
          </Box>
          <Box h spaced middle>
            <SinglePanel bg={Lime} name="lime" />
            {blank}
            {blank}
            <SinglePanel bg={Indigo} name="indigo" />
          </Box>
          <Box h spaced middle>
            <SinglePanel bg={Green} name="green" />
            <SinglePanel bg={Aqua} name="aqua" />
            <SinglePanel bg={Cyan} name="cyan" />
            <SinglePanel bg={Blue} name="blue  " />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
