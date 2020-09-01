import * as React from 'react'
import { Box, BoxProps } from '../box/Box'
import { Small } from '../box/Small'
import { Theme } from '../box/Themed'
import { Unit } from '../box/Unit'
import { Icons } from '../icon/Icons'
import { useValue, useVar } from '../lib/Var'
import { Green, Primary, Red } from '../styling/Color'
import { Button } from '../widget/Button'
import { Icon } from '../widget/Icon'
import { Label } from '../widget/Label'
import { Panel } from '../widget/Panel'
import { Tabs } from '../widget/Tabs'

export function Buttons() {
  const active = useVar('Large')
  const isActive = useValue(active)

  const group = (props: BoxProps) => {
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
          <Theme arctic>
            <Button bg border={false} {...props}>
              Arctic
            </Button>
          </Theme>
          <Theme fog>
            <Button bg border={false} {...props}>
              Fog
            </Button>
          </Theme>
          <Theme day>
            <Button bg border={false} {...props}>
              Day
            </Button>
          </Theme>
          <Theme night>
            <Button bg border={false} {...props}>
              Night
            </Button>
          </Theme>
          <Theme ocean>
            <Button bg border={false} {...props}>
              Ocean
            </Button>
          </Theme>
          <Theme desert>
            <Button bg border={false} {...props}>
              Desert
            </Button>
          </Theme>
          <Theme lava>
            <Button bg border={false} {...props}>
              Lava
            </Button>
          </Theme>
        </Box>
      </Box>
    )
  }

  const set = (props: BoxProps) => {
    return (
      <>
        {group(props)}
        {group({ ...props, shadow: true, blunt: true, rounded: false })}
      </>
    )
  }

  return (
    <Box h pad={Unit * 2}>
      <Box v>
        <Tabs
          active={active.partial()}
          tabs={[
            { tab: 'Large', label: 'Large' },
            { tab: 'Small', label: 'Small' }
          ]}
        />
        <Panel elevate pad={Unit} v>
          {isActive === 'Small' ? <Small>{set({})}</Small> : set({})}
        </Panel>
      </Box>
    </Box>
  )
}

export function SimpleButtons(props: BoxProps = {}) {
  return (
    <Box h spaced>
      <Button {...props}>Ok</Button>
      <Button {...props}>Cancel</Button>
      <Button {...props}>
        <Icon fg={Red} icon={Icons.Cross} />
      </Button>
    </Box>
  )
}

export function DropdownButton(props: BoxProps = {}) {
  return (
    <Button {...props}>
      <Icon fg={Green} icon={Icons.Eye} />
      <Label>Videos</Label>
      <Icon icon={Icons.CaretDown} />
    </Button>
  )
}

export function ButtonGroupH(props: BoxProps = {}) {
  return (
    <Box clip border sep round h {...props}>
      <Box button>
        <Icon fg={Primary} icon={Icons.ChevronLeft} />
      </Box>
      <Box button>
        <Label>Left</Label>
      </Box>
      <Box button>
        <Label>Right</Label>
      </Box>
      <Box button>
        <Icon fg={Primary} icon={Icons.ChevronRight} />
      </Box>
    </Box>
  )
}

export function ButtonGroupV(props: BoxProps = {}) {
  return (
    <Box clip rounded align="start" border v sep {...props}>
      <Box h button>
        <Icon icon={Icons.ArrowUp} />
        North
      </Box>
      <Box h button>
        <Icon icon={Icons.ArrowRight} />
        East
      </Box>
      <Box h button>
        <Icon icon={Icons.ArrowDown} />
        South
      </Box>
      <Box h button>
        <Icon icon={Icons.ArrowLeft} />
        West
      </Box>
    </Box>
  )
}

export function LargeIconButton(props: BoxProps = {}) {
  return (
    <Button sharp {...props}>
      <Icon zoom={2} icon={Icons.Camera} />
    </Button>
  )
}

export function IconButtons(props: BoxProps = {}) {
  return (
    <Box h spaced>
      <Button {...props}>
        <Icon icon={Icons.ZoomOut} />
      </Button>
      <Button {...props}>
        <Icon icon={Icons.Target} />
      </Button>
      <Button {...props}>
        <Icon icon={Icons.ZoomIn} />
      </Button>
      <Button {...props}>
        <Icon icon={Icons.Bright} />
      </Button>
      <Button {...props}>
        <Icon icon={Icons.Dim} />
      </Button>
    </Box>
  )
}
