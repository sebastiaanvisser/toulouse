import * as React from 'react'
import { Box, BoxProps, Unit } from 'toulouse/box'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bright,
  Camera,
  CaretDown,
  ChevronLeft,
  ChevronRight,
  Cross,
  Dim,
  Eye,
  Target,
  ZoomIn,
  ZoomOut
} from 'toulouse/icon'
import { Use, Var } from 'toulouse/lib'
import {
  Arctic,
  Day,
  Desert,
  Fog,
  Green,
  Lava,
  Night,
  Ocean,
  Primary,
  PrimaryColor,
  Red,
  Shade
} from 'toulouse/styling'
import { Button, Img, Label, Panel, Sep, Tabs } from 'toulouse/widget'

export class Buttons extends React.PureComponent {
  active = new Var('Large')

  render() {
    return (
      <Box h pad={Unit * 2}>
        <Box v>
          <Tabs
            active={this.active}
            tabs={[
              { tab: 'Large', label: 'Large' },
              { tab: 'Small', label: 'Small', props: { small: true } }
            ]}
          />
          <Panel elevate pad={Unit} v>
            <Use value={this.active}>{this.content}</Use>
          </Panel>
        </Box>
      </Box>
    )
  }

  content = (active: string) => {
    return this.set(
      active === 'Small' ? { small: true, rounded: false, blunt: true } : {}
    )
  }

  set(props: BoxProps) {
    return (
      <>
        {this.group(props)}
        <Sep />
        {this.group({ ...props, shadow: true, blunt: true, rounded: false })}
        <Sep />
        {this.group({ ...props, border: false, bg: true, palette: Shade })}
        <Sep />
        {this.group({ ...props, border: false, bg: true, palette: Primary })}
      </>
    )
  }

  group(props: BoxProps) {
    return (
      <Box v pad={Unit} spaced>
        <Box h spaced>
          <SimpleButtons {...props} />
          <ButtonGroupV {...props} />
          <Box v spaced>
            <IconButtons {...props} />
            <DropdownButton {...props} />
          </Box>
          <Box v spaced>
            <ButtonGroupH {...props} />
            <LargeIconButton {...props} />
          </Box>
        </Box>
        <Box h spaced>
          <Button bg border={false} palette={Arctic} {...props}>
            Arctic
          </Button>
          <Button bg border={false} palette={Fog} {...props}>
            Fog
          </Button>
          <Button bg border={false} palette={Day} {...props}>
            Sky
          </Button>
          <Button bg border={false} palette={Night} {...props}>
            Night
          </Button>
          <Button bg border={false} palette={Ocean} {...props}>
            Ocean
          </Button>
          <Button bg border={false} palette={Desert} {...props}>
            Desert
          </Button>
          <Button bg border={false} palette={Lava} {...props}>
            Lava
          </Button>
        </Box>
      </Box>
    )
  }
}

export function SimpleButtons(props: BoxProps = {}) {
  return (
    <Box h spaced>
      <Button {...props}>Ok</Button>
      <Button {...props}>Cancel</Button>
      <Button {...props}>
        <Img fg={Red} img={Cross} />
      </Button>
    </Box>
  )
}

export function DropdownButton(props: BoxProps = {}) {
  return (
    <Button {...props}>
      <Img fg={Green} img={Eye} />
      <Label>Videos</Label>
      <Img img={CaretDown} />
    </Button>
  )
}

export function ButtonGroupH(props: BoxProps = {}) {
  return (
    <Box clip border sep round h {...props}>
      <Box button>
        <Img fg={PrimaryColor} img={ChevronLeft} />
      </Box>
      <Box button>
        <Label>Left</Label>
      </Box>
      <Box button>
        <Label>Right</Label>
      </Box>
      <Box button>
        <Img fg={PrimaryColor} img={ChevronRight} />
      </Box>
    </Box>
  )
}

export function ButtonGroupV(props: BoxProps = {}) {
  return (
    <Box clip rounded align="start" border v sep {...props}>
      <Box h button>
        <Img img={ArrowUp} />
        North
      </Box>
      <Box h button>
        <Img img={ArrowRight} />
        East
      </Box>
      <Box h button>
        <Img img={ArrowDown} />
        South
      </Box>
      <Box h button>
        <Img img={ArrowLeft} />
        West
      </Box>
    </Box>
  )
}

export function LargeIconButton(props: BoxProps = {}) {
  return (
    <Button sharp {...props}>
      <Img zoom={2} img={Camera} />
    </Button>
  )
}

export function IconButtons(props: BoxProps = {}) {
  return (
    <Box h spaced>
      <Button {...props}>
        <Img img={ZoomOut} />
      </Button>
      <Button {...props}>
        <Img img={Target} />
      </Button>
      <Button {...props}>
        <Img img={ZoomIn} />
      </Button>
      <Button {...props}>
        <Img img={Bright} />
      </Button>
      <Button {...props}>
        <Img img={Dim} />
      </Button>
    </Box>
  )
}
