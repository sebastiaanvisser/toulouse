import React, { FC, useEffect } from 'react'
import { Box, Unit } from 'toulouse/box'
import {
  Bright,
  CaretLeft,
  CaretRight,
  ChevronLeft,
  ChevronRight,
  CodeEditor,
  Cross,
  Eye,
  Plus,
  Search,
  Tag,
  Tick
} from 'toulouse/icon'
import { once, useValue, useVar } from 'toulouse/lib'
import {
  Arctic,
  Blue,
  Color,
  Green,
  Hover,
  Indigo,
  Lime,
  Ocean,
  PrimaryColor,
  Red,
  rule,
  White
} from 'toulouse/styling'
import { Img, Input, Label, Panel, Sep } from 'toulouse/widget'

rule('body', 'html').style({
  position: 'relative',
  height: '100%',
  margin: '0',
  padding: '0'
})

export const Documentation: FC = () => {
  const input = useVar(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus eu blandit massa. Nunc dapibus at magna a rhoncus. Duis lobortis magna augue, quis varius purus sodales nec. Nunc tincidunt risus diam, eget sollicitudin velit suscipit in.'
  )
  const input2 = useVar('ipsum')
  const focus = useVar([false, false, false, false, false, false])

  const f0 = useValue(focus.at(0))
  const foo = (
    <Box v pad={Unit} spaced={Unit}>
      <Box h spaced={Unit} bg={Hover} pad>
        <Box v spaced>
          <Box bg h sharp inset border outline={f0}>
            <Img fg={PrimaryColor} img={Search} />
            <Input value={input} focus={focus.at(0)} multiline />
          </Box>
          <Box bg h blunt inset border>
            <Img fg={PrimaryColor} img={Search} />
            <Input value={input} multiline />
          </Box>
          <Box bg h rounded inset border>
            <Img fg={PrimaryColor} img={Search} />
            <Input value={input} multiline />
          </Box>
          <Box bg h round inset border>
            <Img fg={PrimaryColor} img={Search} />
            <Input value={input} multiline />
          </Box>
        </Box>
        <Box v spaced>
          <Box button h zoom={2} rounded bg align="start">
            <Img bg={PrimaryColor.alpha(0.1)} fg={PrimaryColor} img={Bright} />
            Click Here
          </Box>
          <Box button h rounded bg align="start">
            <Img bg={Red} fg={White} img={Eye} rotate={45} />
            <Sep />
            Click Here
            <Img bg={Red} fg={White} img={Eye} rotate={45} />
          </Box>
          <Box button h rounded bg align="start">
            Click Here
            <Img fg={Indigo} img={Tick} />
          </Box>
          <Box button h rounded bg shadow align="start">
            Click Here
            <Img fg={Green} img={Plus} />
          </Box>
          <Box button h rounded bg border align="start">
            Click Here
            <Img fg={Red} img={Cross} />
          </Box>
          <Box button h rounded bg border shadow align="start">
            Click Here
            <Img fg={Red} img={Cross} />
          </Box>
        </Box>
        <Box h blunt bg shadow align="start">
          <Box pad>
            <Img img={CodeEditor} zoom={2} fg={Lime} bg={Green} />
          </Box>
          <Sep />
          <Box v>
            Blalalala
            <Sep />
            <Box h>
              Bliep
              <Sep />
              <Box v>
                <Box bg button>
                  <Label>
                    <b>Sebastiaan Visser</b>
                  </Label>
                </Box>
                <Sep />
                <Label subtle>Software Engineer</Label>
              </Box>
            </Box>
            <Sep />
            <Box h>
              A
              <Sep />
              B
              <Sep />
              C
              <Sep />D
            </Box>
          </Box>
        </Box>
        <Box rounded pad bg elevate>
          Hoi
        </Box>
        <Box round pad bg inset>
          Hoi
        </Box>
        <Box blunt pad bg outline>
          Hoi
        </Box>
      </Box>
      <Box h spaced={Unit}>
        <Box v spaced>
          <Box h blunt center border shadow>
            <Sep />
            <Label>Lorem</Label>
            <Sep />
            <Label mono>Ipsum</Label>
            <Sep />
            <Label smallcaps>Dolor</Label>
            <Sep />
          </Box>
          <Box blunt shadow>
            <Box pad small h blunt spaced>
              <Panel bg={Blue} fg={White} shadow>
                <Label>Lorem</Label>
              </Panel>
              <Panel bg={Red} fg={White} shadow>
                <Input mono value={input2} width={90} multiline />
              </Panel>
              <Panel bg={Indigo} fg={White} shadow>
                <Label smallcaps>Lorem</Label>
              </Panel>
              <Panel h bg={Blue} fg={White} shadow>
                <Img img={Plus} />
                <Img img={Tag} />
                <Img img={Search} />
                <Img img={Eye} />
              </Panel>
            </Box>
          </Box>
          <Box h rounded bg={Hover} align="start">
            <Img fg={PrimaryColor} img={CaretLeft} />
            Click Here
            <Sep />
            Or There
            <Sep />
            Or Even There
            <Img fg={Color.rgba(7, 50, 65, 1.0)} img={CaretRight} />
          </Box>
          <Box bg h sharp inset border>
            <Img fg={PrimaryColor} img={Search} />
            <Input value={input} />
          </Box>
          <Box small bg h blunt inset border>
            <Img fg={PrimaryColor} img={Search} />
            <Input value={input} multiline />
            <Box button>
              <Img fg={Red} img={Cross} />
            </Box>
          </Box>
          <Box bg h rounded inset border>
            <Img fg={PrimaryColor} img={Search} />
            <Input value={input} multiline />
          </Box>
          <Box bg h round inset border>
            <Img fg={PrimaryColor} img={Search} />
            <Input value={input} multiline />
          </Box>
          <Panel bg={Indigo} elevate>
            <Panel small bg h>
              <Img img={ChevronRight} />
              <Input mono value={input} multiline />
              <Sep />
              <Img img={ChevronLeft} />
            </Panel>
          </Panel>
        </Box>
        <Box v spaced>
          <Box button h zoom={2} rounded bg align="start">
            <Img bg={PrimaryColor.alpha(0.1)} fg={PrimaryColor} img={Bright} />
            Click Here
          </Box>
          <Box button h rounded bg align="start">
            <Img bg={Red} fg={White} img={Eye} rotate={45} />
            <Sep />
            Click Here
            <Img bg={Red} fg={White} img={Eye} rotate={45} />
          </Box>
          <Box button h rounded bg align="start">
            Click Here
            <Img fg={Indigo} img={Tick} />
          </Box>
          <Box button h rounded bg shadow align="start">
            Click Here
            <Img fg={Green} img={Plus} />
          </Box>
          <Box button h rounded bg border align="start">
            Click Here
            <Img fg={Red} img={Cross} />
          </Box>
        </Box>

        <Box blunt pad bg shadow border>
          Hoi
        </Box>
        <Box rounded pad bg elevate border>
          Hoi
        </Box>
        <Box round pad bg inset border>
          Hoi
        </Box>
        <Box blunt pad bg outline border>
          Hoi
        </Box>
      </Box>
      <Box h spaced={Unit}>
        <Box sharp pad bg border outline>
          Hoi
        </Box>
        <Box blunt pad bg shadow outline>
          Hoi
        </Box>
        <Box rounded pad bg elevate outline>
          Hoi
        </Box>
        <Box round pad bg inset outline>
          Hoi
        </Box>
        <Box blunt pad bg outline>
          Hoi
        </Box>
      </Box>
      <Box h spaced={Unit}>
        <Box sharp pad bg border inset>
          Hoi
        </Box>
        <Box blunt pad bg shadow inset fg={Red}>
          <Label>Hoi</Label>
        </Box>
        <Box rounded pad bg elevate inset>
          Hoi
        </Box>
        <Box round pad bg inset>
          Hoi
        </Box>
        <Box blunt pad bg outline={Green} inset>
          Hoi
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box palette={Ocean} pad>
      <Box palette={Arctic}>{foo}</Box>
      <Panel>{foo}</Panel>
    </Box>
  )
}
