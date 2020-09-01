import * as React from 'react'
import { Box } from '../box/Box'
import { Small } from '../box/Small'
import { Theme, usePalette } from '../box/Themed'
import { Unit } from '../box/Unit'
import { Icons } from '../icon/Icons'
import { Use, useValue, useVar } from '../lib/Var'
import { Blue, Green, Hovering, Primary, Red } from '../styling/Color'
import { Arctic, Day, Desert, Lava, Ocean } from '../styling/Palette'
import { Icon } from '../widget/Icon'
import { Input } from '../widget/Input'
import { Label } from '../widget/Label'
import { Panel } from '../widget/Panel'
import { Tag, Tags } from '../widget/Tag'
import { lorem } from './Lorem'

export function TagsDemo() {
  return (
    <Box v pad={Unit * 2} spaced width={Unit * 25}>
      <Demo1 />
    </Box>
  )
}

// ----------------------------------------------------------------------------

const pair = <A, B>(a: A, b: B): [A, B] => [a, b]

export function Demo1() {
  const bg = usePalette()
  return (
    <Small>
      <Box bg h pad round spaced elevate tabIndex={0}>
        {[
          pair(Lava, 'Lorem'),
          pair(Day, 'ipsum'),
          pair(Arctic, 'amet'),
          pair(Ocean, 'consectetur adipiscing'),
          pair(Desert, 'elit')
        ].map(([p, t]) => (
          <Theme key={t} palette={p}>
            <Tag round shadow={p === bg} border={p === bg}>
              <Label smallcaps>{t}</Label>
            </Tag>
          </Theme>
        ))}
        <Tag grow bg={Hovering} />
      </Box>

      <Box bg h pad round spaced elevate tabIndex={0}>
        <Tag grow bg={Hovering} />
        {[
          pair(Lava, 'Lorem'),
          pair(Day, 'ipsum'),
          pair(Arctic, 'amet'),
          pair(Ocean, 'consectetur adipiscing'),
          pair(Desert, 'elit')
        ].map(([p, t]) => (
          <Theme palette={p}>
            <Tag shadow={p === bg} border={p === bg}>
              <Label smallcaps>{t}</Label>
            </Tag>
          </Theme>
        ))}
      </Box>

      <Box bg h pad round spaced elevate tabIndex={0}>
        <Theme lava>
          <Tag round button>
            <Icon icon={Icons.Target} />
          </Tag>
        </Theme>
        <Tag bg={Hovering} button>
          <Icon icon={Icons.Balloon} />
        </Tag>
        <Theme contrast>
          <Tag rounded>
            <Box button>
              <Icon icon={Icons.Star} fg={Primary} />
            </Box>
            <Box button>
              <Icon icon={Icons.Star} fg={Primary} />
            </Box>
            <Box button>
              <Icon icon={Icons.Star} fg={Primary} />
            </Box>
            <Box button>
              <Icon icon={Icons.StarOpen} fg={Primary} />
            </Box>
            <Box button>
              <Icon icon={Icons.StarOpen} fg={Primary} />
            </Box>
          </Tag>
        </Theme>
        <Theme meadow>
          <Tag>
            <Icon icon={Icons.Tag} />
            <Label>dolor sit amet</Label>
          </Tag>
        </Theme>
        <Theme ocean>
          <Tag>
            <Label>consectetur adipiscing</Label>
            <Icon icon={Icons.Cross} />
          </Tag>
        </Theme>
        <Theme desert>
          <Tag>
            <Box>
              <Label>elit</Label>
            </Box>
            <Box button>
              <Icon icon={Icons.Cross} />
            </Box>
          </Tag>
        </Theme>
        <Theme ocean>
          <Tag>£</Tag>
        </Theme>
        <Theme ocean>
          <Tag>
            <Icon icon={Icons.ArrowLeft} />ß
          </Tag>
        </Theme>

        <Tag grow bg={Hovering} />
      </Box>

      <Box h>
        <Theme contrast>
          <Panel pad h elevate tabIndex={0}>
            <Theme contrast>
              <Tag pad>
                <Icon button icon={Icons.Terminal} bg={Blue.alpha(0.2)} fg={Blue} />
                <Icon button icon={Icons.Dim} bg={Red.alpha(0.2)} fg={Red} />
                <Icon button icon={Icons.Bright} bg={Green.alpha(0.2)} fg={Green} />
              </Tag>
            </Theme>
          </Panel>
        </Theme>
      </Box>
      <Demo2 />
    </Small>
  )
}

export function Demo2() {
  const value = useVar(lorem(1))
  const focus = useVar(false)
  const hasFocus = useValue(focus)
  const x = useVar(0)

  const counter = () => {
    return (
      <Theme night>
        <Tag sep>
          <Box button onClick={() => x.modify(a => a - 1)}>
            <Icon icon={Icons.Minus} />
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
            <Icon icon={Icons.Plus} />
          </Box>
        </Tag>
      </Theme>
    )
  }

  return (
    <Panel
      sep
      width={Unit * 10}
      v
      elevate
      tabIndex={0}
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
            <Tags>
              {v
                .split(/\s+/)
                .filter(v => v.length > 0)
                .map((s, i) => (
                  <Theme night key={i}>
                    <Tag>
                      <Label smallcaps>{s}</Label>
                      <Box
                        button
                        onClick={() =>
                          value.modify(v => v.replace(s, '').replace(/\s+/g, ' '))
                        }
                      >
                        <Icon icon={Icons.Cross} />
                      </Box>
                    </Tag>
                  </Theme>
                ))}
            </Tags>
          )}
        </Use>
      </Box>
    </Panel>
  )
}
