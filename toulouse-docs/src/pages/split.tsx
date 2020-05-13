import React, { FC, useState } from 'react'
import { Box, BoxProps, Unit } from 'toulouse/box'
import { Cross, Dot, Pulse, Shape, Tag, Tick, ChevronRight } from 'toulouse/icon'
import { Once } from 'toulouse/lib'
import {
  Arctic,
  Contrast,
  Fg,
  Fog,
  Hover,
  Ocean,
  Primary,
  PrimaryColor,
  rule,
  Shade
} from 'toulouse/styling'
import { Img, Label, Panel, Spinner } from 'toulouse/widget'
import Link from 'next/link'

rule('body', 'html').style({
  position: 'relative',
  height: '100%',
  margin: '0',
  padding: '0'
})

const Line = (
  props: {
    icon: Once<Shape>
    region: string
    count: string
  } & BoxProps
) => {
  const { icon, region, count, ...rest } = props
  const [isLoading, setIsLoading] = useState(false)
  const handleClick = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2500)
  }
  return (
    <Box
      button
      h
      onClick={handleClick}
      onMouseOver={ev => {
        if (ev.altKey) handleClick()
      }}
      {...rest}
    >
      <Img img={icon} fg={icon === Dot ? Fg.alpha(0.1) : undefined} />
      <Label grow>{region}</Label>
      {isLoading ? <Spinner fg={PrimaryColor} /> : <Label subtle>{count}</Label>}
    </Box>
  )
}

const SplitTest: FC = () => {
  const Foo = (props: BoxProps) => (
    <Panel v width={240} pad={5} {...props}>
      <Box v sep>
        <Line icon={Dot} region="Africa" count="59" rounded />
        <Line icon={Dot} region="Americas" count="27" rounded />
      </Box>
      <Panel small palette={Contrast} fg z v shadow sep>
        <Line icon={Pulse} region="Asia" count="54" />
        <Line icon={Tag} region="Atlantic Ocean" count="3" />
      </Panel>
      <Box v sep>
        <Line icon={Dot} region="Central America" count="8" rounded />
        <Line icon={Dot} region="Eastern Africa" count="20" rounded />
      </Box>
      <Panel palette={Primary} fg z v shadow sep clip>
        <Line icon={Tick} region="Europe" count="57" />
        <Line icon={Tick} region="European Union" count="28" />
        <Line icon={Tick} region="Middle Africa" count="9" />
        <Line icon={Tick} region="Middle East" count="14" />
        <Line icon={Tick} region="Northern Africa" count="8" />
      </Panel>
      <Box v sep>
        <Line icon={Dot} region="Northern America" count="5" rounded />
        <Line icon={Dot} region="Oceania" count="24" rounded />
        <Line icon={Dot} region="South America" count="14" rounded />
        <Line icon={Dot} region="Northern America" count="5" rounded />
        <Line icon={Dot} region="Oceania" count="24" rounded />
        <Line icon={Dot} region="South America" count="14" rounded />
      </Box>
      <Panel palette={Shade} fg v sep clip>
        <Line icon={Cross} region="Southern Africa" count="5" />
        <Line icon={Tick} region="The Caribbean" count="30" />
        <Line icon={Tick} region="Western Africa" count="17" />
      </Panel>
    </Panel>
  )

  return (
    <Box v>
      <Box h margin palette={Shade} bg blunt>
        <Img img={ChevronRight} />
        <Label>
          <Link href="/">
            <a>index</a>
          </Link>
        </Label>
      </Box>
      <Box h>
        <Panel shrink={false} pad={Unit * 2} h center bg={Hover}>
          <Foo palette={Arctic} rounded elevate />
        </Panel>
        <Panel shrink={false} pad={Unit * 2} h center bg={Hover.alpha(0.25)}>
          <Foo palette={Ocean} rounded elevate />
        </Panel>
        <Panel shrink={false} pad={Unit * 2} h center>
          <Foo palette={Fog} rounded />
        </Panel>
      </Box>
    </Box>
  )
}

export default SplitTest
