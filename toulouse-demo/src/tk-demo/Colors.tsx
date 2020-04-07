import * as React from 'react'
import { Box, Unit } from 'toulouse/box'
import { Blob } from 'toulouse/icon'
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
} from 'toulouse/styling'
import { Img, Label, Panel, SlowReveal, Tooltip } from 'toulouse/widget'

export function Colors() {
  const panel = (bg: Color, name: string) => {
    const tip = () => (
      <Tooltip margin={-2} timing={SlowReveal}>
        {name}
      </Tooltip>
    )
    return (
      <Panel key={name} shadow fg={bg} attach={tip}>
        <Img zoom={3} img={Blob} />
      </Panel>
    )
  }

  const blank = <Box bg={Fg.alpha(0.02)} blunt width={Unit * 3} height={Unit * 3} />

  return (
    <Box v pad={Unit * 2} spaced>
      <Box h spaced>
        <Label width={60}>b/W</Label>
        {panel(Black, 'black')}
        {panel(White, 'white')}
        {blank}
        {blank}
      </Box>
      <Box h spaced>
        <Label width={60}>fg/bg</Label>
        {panel(Fg, 'foreground')}
        {panel(Bg, 'background')}
        {blank}
        {blank}
      </Box>
      <Box h spaced>
        <Label width={60}>Colors</Label>
        <Box v spaced>
          <Box h spaced middle>
            {panel(Orange, 'orange')}
            {panel(Red, 'red')}
            {panel(Rose, 'rose')}
            {panel(Magenta, 'magenta')}
          </Box>
          <Box h spaced middle>
            {panel(Yellow, 'yellow')}
            {blank}
            {blank}
            {panel(Purple, 'purple')}
          </Box>
          <Box h spaced middle>
            {panel(Lime, 'lime')}
            {blank}
            {blank}
            {panel(Indigo, 'indigo')}
          </Box>
          <Box h spaced middle>
            {panel(Green, 'green')}
            {panel(Aqua, 'aqua')}
            {panel(Cyan, 'cyan')}
            {panel(Blue, 'blue  ')}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
