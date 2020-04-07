import * as React from 'react'
import { Box, Unit } from 'toulouse/box'
import {
  ArrowLeft,
  Balloon as BalloonIcon,
  Bright,
  ChevronRight,
  Cross,
  Dim,
  Eye,
  Minus,
  Plus,
  Star,
  StarOpen,
  Tag as TagIcon,
  Terminal
} from 'toulouse/icon'
import { Use, useValue, useVar } from 'toulouse/lib'
import {
  Blue,
  Contrast,
  Day,
  Desert,
  Green,
  Lava,
  Night,
  Ocean,
  Red,
  Hover,
  Yellow
} from 'toulouse/styling'
import * as T from 'toulouse/widget'
import { Img, Input, Label, Panel, Tag } from 'toulouse/widget'
import { lorem } from './Lorem'

export function Tags() {
  return (
    <Box v pad={Unit * 2} spaced width={Unit * 25}>
      <Demo1 />
    </Box>
  )
}

// ----------------------------------------------------------------------------

export function Demo1() {
  return (
    <>
      <T.Tags round elevate tabIndex={1}>
        <Tag palette={Lava}>
          <Label smallcaps>Lorem</Label>
        </Tag>
        <Tag palette={Day}>
          <Label smallcaps>ipsum</Label>
        </Tag>
        <Tag palette={Lava}>
          <Label>dolor sit amet</Label>
        </Tag>
        <Tag palette={Ocean}>
          <Label>consectetur adipiscing</Label>
        </Tag>
        <Tag palette={Desert}>
          <Label>elit</Label>
        </Tag>
        <Tag grow bg={Hover} />
      </T.Tags>
      <T.Tags rounded elevate tabIndex={1}>
        <Tag grow bg={Hover} />
        <Tag palette={Lava}>
          <Label>Lorem</Label>
        </Tag>
        <Tag palette={Day}>
          <Label>ipsum</Label>
        </Tag>
        <Tag palette={Desert}>
          <Label>dolor sit amet</Label>
        </Tag>
        <Tag palette={Ocean}>
          <Label>consectetur adipiscing</Label>
        </Tag>
        <Tag palette={Desert}>
          <Label>elit</Label>
        </Tag>
      </T.Tags>
      <T.Tags elevate tabIndex={1}>
        <Tag palette={Lava} button>
          <Img img={Eye} />
        </Tag>
        <Tag bg={Hover} button>
          <Img img={BalloonIcon} />
        </Tag>
        <Tag palette={Ocean}>
          <Box button>
            <Img img={Star} fg={Yellow} />
          </Box>
          <Box button>
            <Img img={Star} fg={Yellow} />
          </Box>
          <Box button>
            <Img img={Star} fg={Yellow} />
          </Box>
          <Box button>
            <Img img={StarOpen} fg={Yellow} />
          </Box>
          <Box button>
            <Img img={StarOpen} fg={Yellow} />
          </Box>
        </Tag>
        <Tag bg={Green}>
          <Img img={TagIcon} />
          <Label>dolor sit amet</Label>
        </Tag>
        <Tag palette={Ocean}>
          <Label>consectetur adipiscing</Label>
          <Img img={Cross} />
        </Tag>
        <Tag palette={Desert}>
          <Box>
            <Label>elit</Label>
          </Box>
          <Box button>
            <Img img={Cross} />
          </Box>
        </Tag>
        <Tag palette={Ocean}>
          <Img img={ChevronRight} />
        </Tag>
        <Tag palette={Ocean}>
          <Img img={ArrowLeft} />ß
        </Tag>

        <Tag grow bg={Hover} />
      </T.Tags>
      <Box h>
        <Panel pad h palette={Contrast} elevate tabIndex={1}>
          <Tag border>
            <Img img={Terminal} bg={Blue.alpha(0.2)} fg={Blue} />
            <Img img={Dim} bg={Red.alpha(0.2)} fg={Red} />
            <Img img={Bright} bg={Green.alpha(0.2)} fg={Green} />
            {/* <Img img={iconBox(Contrast, Blue.alpha(0.2), Blue)} />
            <Img img={iconBox(Terminal, Dark.alpha(0.2), Dark)} />
            <Img img={iconBox(Dim, Red.alpha(0.2), Red)} />
            <Img img={iconBox(Bright, Green.alpha(0.2), Green)} />
            <Img img={iconBox(Progress, Purple.alpha(0.2), Purple)} />
            <Img img={iconBox(ZoomIn, Teal.alpha(0.2), Teal)} /> */}
          </Tag>
        </Panel>
      </Box>
      <Demo2 />
    </>
  )
}

export function Demo2() {
  const value = useVar(lorem(1))
  const focus = useVar(false)
  const hasFocus = useValue(focus)
  const x = useVar(0)

  const counter = () => {
    return (
      <Tag palette={Night}>
        <Box button onClick={() => x.modify(a => a - 1)}>
          <Img img={Minus} />
        </Box>
        <Box>
          <Label>
            <Use value={x}>
              {v => (
                <span>
                  <b>Count:</b> {v}
                </span>
              )}
            </Use>
          </Label>
        </Box>
        <Box button onClick={() => x.modify(a => a + 1)}>
          <Img img={Plus} />
        </Box>
      </Tag>
    )
  }

  return (
    <Panel
      sep
      width={Unit * 10}
      v
      elevate
      tabIndex={1}
      outline={hasFocus}
      glow={hasFocus}
    >
      <Box h pad>
        <Label grow>
          <b>Multi line</b>
        </Label>
        {counter()}
      </Box>
      <Box pad grow>
        <Input multiline value={value} focus={focus} />
      </Box>
      <Box>
        <Use value={value}>
          {v => (
            <T.Tags>
              {v
                .split(/\s+/)
                .filter(v => v.length > 0)
                .map((s, i) => (
                  <Tag palette={Night} key={i}>
                    <Label smallcaps>{s}</Label>
                    <Box
                      button
                      onClick={() =>
                        value.modify(v => v.replace(s, '').replace(/\s+/g, ' '))
                      }
                    >
                      <Img img={Cross} />
                    </Box>
                  </Tag>
                ))}
            </T.Tags>
          )}
        </Use>
      </Box>
    </Panel>
  )
}
