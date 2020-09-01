import * as React from 'react'
import { useMemo } from 'react'
import { Box } from '../box/Box'
import { Small } from '../box/Small'
import { Theme } from '../box/Themed'
import { Unit } from '../box/Unit'
import { Attach } from '../dyn/Attach'
import { Icons } from '../icon/Icons'
import { range } from '../lib/Range'
import { Use, useVar } from '../lib/Var'
import { cx } from '../styling/Classy'
import { Shade } from '../styling/Color'
import { Desert, Lava, Night } from '../styling/Palette'
import { style } from '../styling/Rule'
import { Balloon, Tooltip } from '../widget/Balloon'
import { Icon } from '../widget/Icon'
import { Label } from '../widget/Label'
import { Panel } from '../widget/Panel'
import { Slider, SliderProps } from '../widget/Slider'
import { rotate360, Spinner } from '../widget/Spinner'
import { Tag } from '../widget/Tag'

const fmt = (n: number) =>
  Intl.NumberFormat('en-IN', {
    minimumFractionDigits: n,
    maximumFractionDigits: n
  })

export function Sliders() {
  const value0 = useVar(115)

  const value0_inv = useMemo(
    () =>
      value0.zoom(
        v => 220 - v,
        v => 220 - v
      ),
    []
  )

  const value1 = useVar(115)

  // focus0 = new Var(false)
  // focus1 = new Var(false)
  // focus2 = new Var(false)
  // focus3 = new Var(false)
  // focus4 = new Var(false)
  // focus5 = new Var(false)
  // focus6 = new Var(false)

  // const f0 = Var.list(
  //   List([focus0, focus1, focus2, focus3, focus4, focus5])
  // ).map(xs => xs.some(a => a))

  return (
    <Box v pad={Unit * 2} spaced width={Unit * 18}>
      <Panel v elevate>
        <Box h pad bg={Shade}>
          <Label grow>
            <b>Slider example</b>
          </Label>
          <Theme desert>
            <Tag align="center">
              <Label>
                <b>
                  <Use value={value0}>{v => fmt(1).format(v)}</Use>
                </b>
              </Label>
            </Tag>
          </Theme>
        </Box>
        <Box v sep>
          <Box pad>
            <Panel rounded>
              <Slider value={value0} tabIndex={0} limit={range(100, 120)} tick={5} />
            </Panel>
          </Box>
          <Box pad>
            <Panel rounded>
              <Slider
                value={value0_inv}
                limit={range(100, 120)}
                tabIndex={0}
                stick={1}
                tick={1}
              />
            </Panel>
          </Box>
          <Box h sep>
            <Box grow>
              <Slider
                value={value0}
                tabIndex={0}
                limit={range(80, 130)}
                tick={[100, 110, 120]}
                snap={[100, 110, 120]}
              />
            </Box>
            <Box>
              <Icon
                icon={Icons.StarOpen}
                className={cx(
                  style({
                    animation: `${rotate360} 100000ms linear infinite`
                  })
                )}
              />
            </Box>
            <Box grow>
              <Slider
                value={value0}
                tabIndex={0}
                limit={range(90, 140)}
                tick={[100, 110, 120]}
                snap={[100, 110, 120]}
              />
            </Box>
          </Box>
          <Box sep h>
            <Box grow>
              <Slider
                tabIndex={0}
                value={value0_inv}
                limit={range(60, 130)}
                dots={[100, 110, 120]}
                snap={[100, 110, 120]}
              />
            </Box>
            <Box>
              <Label>Inverse values</Label>
            </Box>
            <Box grow>
              <Slider
                tabIndex={0}
                value={value0_inv}
                limit={range(70, 160)}
                dots={[100, 110, 120]}
                snap={[100, 110, 120]}
              />
            </Box>
          </Box>
        </Box>
      </Panel>
      <Panel v elevate sep>
        <OneSlider
          limit={range(100, 300)}
          step={0.1}
          snap={40}
          tick={40}
          format={v => Math.round(v).toString()}
        />
        <OneSlider
          limit={range(0, 200)}
          step={1}
          stick={5}
          dots={20}
          format={v => Math.round(v).toString()}
          initial={40}
        />
        <OneSlider
          limit={range(-1, 1)}
          step={0.01}
          snap={[-1, -0.9, -0.1, 0, 0.1, 0.9, 1]}
          tick={[-1, -0.9, -0.1, 0, 0.1, 0.9, 1]}
          format={v => fmt(2).format(v)}
        />
        <OneSlider
          limit={range(-1, 1)}
          step={0.1}
          stick={[-1, -0.9, -0.1, 0, 0.1, 0.9, 1]}
          tick={[-1, -0.9, -0.1, 0, 0.1, 0.9, 1]}
          format={v => fmt(1).format(v)}
          initial={0.9}
        />
      </Panel>
      <Panel sep v elevate>
        <Box h>
          <Label grow>
            <b>Small slider</b>
          </Label>
          <Theme desert>
            <Tag margin>
              <Label>
                <b>
                  <Use value={value1}>{v => fmt(1).format(v)}</Use>
                </b>
              </Label>
            </Tag>
          </Theme>
        </Box>
        <Box bg>
          <Small>
            <Slider tabIndex={0} value={value1} limit={range(100, 120)} />
          </Small>
        </Box>
      </Panel>
      {/* <Label>
          <p>Todo:</p>
          <ul>
            <li>Range sliders</li>
            <li>Axis labels</li>
            <li>Shift drag to slow down</li>
            <li>Keyboard shortcuts</li>
            <li>Vertical sliders</li>
          </ul>
        </Label> */}
    </Box>
  )
}

// ----------------------------------------------------------------------------

type OneProps = Pick<
  SliderProps,
  'limit' | 'step' | 'stick' | 'snap' | 'tick' | 'dots'
> & {
  format: (n: number) => string
  initial?: number
}

function OneSlider(props: OneProps) {
  const { format, initial, limit } = props

  const value = useVar(initial === undefined ? limit.from : initial)
  const focus = useVar(false)

  const reset = (ev: React.MouseEvent<unknown>) => {
    value.set(limit.lerp(0.5))
    focus.set(true)
    ev.preventDefault()
    ev.stopPropagation()
  }

  const balloon = () => {
    const v = value.get()
    const palette = v < 0 ? Lava : v > 0 ? Night : Desert
    return (
      <Theme palette={palette}>
        <Small>
          <Balloon h center margin={10} position="top" open={focus}>
            <Spinner />
            <Label>{format(v)}</Label>
          </Balloon>
        </Small>
      </Theme>
    )
  }

  return (
    <Box h sep>
      <Box grow pad>
        <Slider
          {...props}
          tabIndex={0}
          value={value}
          wrapThumb={thumb => <Attach attachment={balloon}>{thumb}</Attach>}
          focus={focus}
        />
      </Box>
      <Box width={60} h center middle>
        <Use value={focus}>
          {f => (
            <Attach attachment={() => <Tooltip position="right">reset</Tooltip>}>
              <Tag button bg={Shade} shadow={f} align="auto" onMouseDown={reset}>
                <Label>
                  <Use value={value}>{format}</Use>
                </Label>
              </Tag>
            </Attach>
          )}
        </Use>
      </Box>
    </Box>
  )
}
