import * as React from 'react'
import { ReactNode } from 'react'
import { Box, Unit } from 'toulouse/box'
import { StarOpen } from 'toulouse/icon'
import { range, Use, useVar, Var } from 'toulouse/lib'
import { cx, Desert, Hover, Lava, Night, Primary, Shade, style } from 'toulouse/styling'
import {
  Balloon,
  Img,
  Label,
  Panel,
  rotate360,
  Slider,
  SliderProps,
  Tag,
  Tooltip
} from 'toulouse/widget'

const fmt = (n: number) =>
  Intl.NumberFormat('en-IN', {
    minimumFractionDigits: n,
    maximumFractionDigits: n
  })

export class Sliders extends React.Component {
  value0 = new Var(115)
  value0_inv = this.value0.zoom(
    v => 220 - v,
    v => 220 - v
  )
  value1 = new Var(115)

  focus0 = new Var(false)
  focus1 = new Var(false)
  focus2 = new Var(false)
  focus3 = new Var(false)
  focus4 = new Var(false)
  focus5 = new Var(false)
  focus6 = new Var(false)

  render(): ReactNode {
    return true ? this.renderMany() : this.renderJustOne()
  }

  renderJustOne() {
    return (
      <Box v pad={Unit * 2} spaced width={Unit * 18}>
        <Panel v elevate sep>
          <Box h pad>
            <Label grow>
              <b>Slider example</b>
            </Label>
            <Tag palette={Desert}>
              <Label>
                <b>
                  <Use value={this.value0}>{v => fmt(1).format(v)}</Use>
                </b>
              </Label>
            </Tag>
          </Box>
          <Box pad>
            <Panel rounded bg={Hover}>
              <Slider
                focus={this.focus0}
                value={this.value0}
                tabIndex={1}
                limit={range(100, 120)}
                tick={5}
              />
            </Panel>
          </Box>
        </Panel>
      </Box>
    )
  }

  renderMany() {
    const f0 = Var.list([
      this.focus0,
      this.focus1,
      this.focus2,
      this.focus3,
      this.focus4,
      this.focus5
    ]).map(xs => xs.some(a => a))

    return (
      <Box v pad={Unit * 2} spaced width={Unit * 18}>
        <Panel v elevate focus={f0} sep>
          <Box h pad>
            <Label grow>
              <b>Slider example</b>
            </Label>
            <Tag palette={Desert}>
              <Label>
                <b>
                  <Use value={this.value0}>{v => fmt(1).format(v)}</Use>
                </b>
              </Label>
            </Tag>
          </Box>
          <Box pad>
            <Panel rounded>
              <Slider
                focus={this.focus0}
                value={this.value0}
                tabIndex={1}
                limit={range(100, 120)}
                tick={5}
              />
            </Panel>
          </Box>
          <Box pad>
            <Panel rounded>
              <Slider
                focus={this.focus1}
                value={this.value0_inv}
                limit={range(100, 120)}
                tabIndex={1}
                stick={1}
                tick={1}
              />
            </Panel>
          </Box>
          <Box h sep>
            <Box grow focus={this.focus2}>
              <Slider
                focus={this.focus2}
                value={this.value0}
                tabIndex={1}
                limit={range(80, 130)}
                tick={[100, 110, 120]}
                snap={[100, 110, 120]}
              />
            </Box>
            <Box>
              <Img
                img={StarOpen}
                className={cx(
                  style({
                    animation: `${rotate360.get()} 100000ms linear infinite`
                  })
                )}
              />
            </Box>
            <Box grow focus={this.focus3}>
              <Slider
                focus={this.focus3}
                value={this.value0}
                tabIndex={1}
                limit={range(90, 140)}
                tick={[100, 110, 120]}
                snap={[100, 110, 120]}
              />
            </Box>
          </Box>
          <Box sep h>
            <Box grow focus={this.focus4}>
              <Slider
                focus={this.focus4}
                tabIndex={1}
                value={this.value0_inv}
                limit={range(60, 130)}
                dots={[100, 110, 120]}
                snap={[100, 110, 120]}
              />
            </Box>
            <Box>
              <Label>Inverse values</Label>
            </Box>
            <Box grow focus={this.focus5}>
              <Slider
                focus={this.focus5}
                tabIndex={1}
                value={this.value0_inv}
                limit={range(70, 160)}
                dots={[100, 110, 120]}
                snap={[100, 110, 120]}
              />
            </Box>
          </Box>
        </Panel>
        <Panel v elevate tabIndex={1} sep>
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
        <Panel v elevate tabIndex={0} focus={this.focus6}>
          <Box h>
            <Label grow>
              <b>Small slider</b>
            </Label>
            <Tag margin palette={Desert}>
              <Label>
                <b>
                  <Use value={this.value1}>{v => fmt(1).format(v)}</Use>
                </b>
              </Label>
            </Tag>
          </Box>
          <Box>
            <Panel small bg={Hover}>
              <Slider
                focus={this.focus6}
                tabIndex={1}
                value={this.value1}
                limit={range(100, 120)}
                tick={5}
              />
            </Panel>
          </Box>
        </Panel>
        <Label>
          <p>Todo:</p>
          <ul>
            <li>Range sliders</li>
            <li>Axis labels</li>
            <li>Shift drag to slow down</li>
            <li>Keyboard shortcuts</li>
            <li>Vertical sliders</li>
          </ul>
        </Label>
      </Box>
    )
  }
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
      <Balloon h small center margin={10} palette={palette} position="top" open={focus}>
        <Label>{format(v)}</Label>
      </Balloon>
    )
  }

  return (
    <Box
      h
      sep
      // focus={focus}
    >
      <Box grow pad>
        <Slider
          {...props}
          tabIndex={0}
          value={value}
          attachHandle={() => balloon()}
          focus={focus}
        />
      </Box>
      <Box width={60} h center middle>
        <Use value={focus}>
          {f => (
            <Tag
              button
              align="auto"
              palette={f ? Primary : Shade}
              attach={() => <Tooltip position="right">reset</Tooltip>}
              onMouseDown={reset}
            >
              <Label>
                <Use value={value}>{format}</Use>
              </Label>
            </Tag>
          )}
        </Use>
      </Box>
    </Box>
  )
}
