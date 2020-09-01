import * as React from 'react'
import { ReactNode } from 'react'
import { Box, BoxProps } from '../box/Box'
import { Small } from '../box/Small'
import { Theme, usePalette } from '../box/Themed'
import { Unit } from '../box/Unit'
import { Attach } from '../dyn/Attach'
import { Icons } from '../icon/Icons'
import { once } from '../lib/Memo'
import { range } from '../lib/Range'
import { Use, useStoredVar, useVar, Var } from '../lib/Var'
import { Palette, paletteByName, PaletteName } from '../styling/Palette'
import { Balloon } from '../widget/Balloon'
import { Icon } from '../widget/Icon'
import { Input } from '../widget/Input'
import { Label } from '../widget/Label'
import { Listbox } from '../widget/Listbox'
import { Checkbox } from '../widget/Options'
import { Panel } from '../widget/Panel'
import { ShortcutString } from '../widget/ShortcutString'
import { Slider } from '../widget/Slider'
import { Tag } from '../widget/Tag'
import {
  ButtonGroupH,
  ButtonGroupV,
  IconButtons,
  LargeIconButton,
  SimpleButtons
} from './Buttons'
import { lorem } from './Lorem'
import { PalettePicker } from './PalettePicker'
import { Corner, CornerPicker } from './shared/CornerPicker'

export function Panels() {
  const Fills = [{ transparent: true }, {}, { Hovering: true }, { bevel: true }]
  const Borders = [
    {},
    { border: true },
    { elevate: true },
    { shadow: true },
    { inset: true }
  ]

  const example = useStoredVar('panels-demo-example', 'Search')
  const corner = useStoredVar<Corner>('panels-demo-corner', 'auto')
  const bgName = useStoredVar<PaletteName>('panels-demo-bg', 'arctic')
  const bg = bgName.iso(paletteByName.inv())

  const setBg = useStoredVar('panels-demo-setBg', false)
  const small = useStoredVar('panels-demo-small', false)
  const pad = useStoredVar('panels-demo-pad', false)
  const button = useStoredVar('panels-demo-button', false)
  const focusable = useStoredVar('panels-demo-focusable', false)

  const ctx = usePalette()

  const curExample = example.map(name => Examples.get().filter(ex => ex.name === name)[0])

  const settings = Var.pack({
    corner,
    small,
    pad,
    button,
    focusable
  })

  const toolbar = () => {
    const st = { border: true, transparent: true }
    return (
      <Panel h pad sharp spaced elevate>
        <ExamplePicker {...st} active={example} width={8 * Unit} />
        <CornerPicker {...st} corner={corner} />
        <Checkbox checked={setBg} />
        <Use value={setBg}>
          {setBg => <PalettePicker active={bg} {...st} disabled={!setBg} width={140} />}
        </Use>
        <Checkbox checked={small}>
          <ShortcutString char="S" event={() => small.toggle()}>
            Small
          </ShortcutString>
        </Checkbox>
        <Checkbox checked={pad}>
          <ShortcutString char="P" event={() => pad.toggle()}>
            Pad
          </ShortcutString>
        </Checkbox>
        <Checkbox checked={button}>
          <ShortcutString char="B" event={() => button.toggle()}>
            Button
          </ShortcutString>
        </Checkbox>
        <Checkbox checked={focusable}>
          <ShortcutString char="F" event={() => focusable.toggle()}>
            Focus
          </ShortcutString>
        </Checkbox>
      </Panel>
    )
  }

  const board = (): ReactNode => {
    return (
      <Box v spaced>
        <Box v>
          <Use value={Var.pack({ bg, setBg })}>
            {o => (
              <Theme palette={o.setBg ? o.bg : undefined}>
                <Panel v>{grid(ctx)}</Panel>
              </Theme>
            )}
          </Use>
          <Box v>{grid(ctx)}</Box>
        </Box>
      </Box>
    )
  }

  const grid = (palette: Palette) => {
    return (
      <Use value={curExample.debounce(300)}>
        {o =>
          Borders.map((border, j) => (
            <Box h key={j}>
              {Fills.map((fill, i) => (
                <Box pad={20} key={i}>
                  {renderOne(o, palette, fill, border)}
                </Box>
              ))}
            </Box>
          ))
        }
      </Use>
    )
  }

  const renderOne = (o: Example, palette: Palette, fill: any, border: any) => {
    return (
      <Use value={settings}>
        {({ corner, small, pad, button, focusable }) => {
          const reset = {
            border: false,
            elevate: false,
            shadow: false,
            Hovering: false,
            bevel: false,
            inset: false
          }
          return (
            <Small small={small}>
              {o.render({
                ...reset,
                ...fill,
                ...border,
                ...(corner === 'auto'
                  ? {}
                  : {
                      round: corner === 'round',
                      rounded: corner === 'rounded',
                      sharp: corner === 'sharp'
                    }),
                ...(pad ? { pad: true } : {}),
                ...(button ? { button: true } : {}),
                ...(focusable ? { tabIndex: 1, focus: new Var(false) } : {}),
                palette
              })}
            </Small>
          )
        }}
      </Use>
    )
  }

  return (
    <Box v>
      {toolbar()}
      <Box pad={Unit * 2} spaced v>
        {board()}
      </Box>
    </Box>
  )
}

// ----------------------------------------------------------------------------

function HBox(props: BoxProps) {
  return <Panel sharp {...props} width={150} height={Unit} />
}

function SquareBox(props: BoxProps) {
  return <Panel sharp {...props} width={120} height={120} />
}

function Lorem(props: BoxProps) {
  return (
    <Panel sep sharp {...props} v width={220}>
      <Box pad>
        <Label>
          <strong>Lorem Ipsum</strong>
        </Label>
      </Box>
      <Box pad>{lorem(1)}</Box>
    </Panel>
  )
}

function Dropdown(props: BoxProps) {
  return (
    <Panel sep {...props} h width={160}>
      <Box grow button>
        <Label>Pick Item</Label>
      </Box>
      <Box button>
        <Icon icon={Icons.CaretDown} />
      </Box>
    </Panel>
  )
}

function Search(props: BoxProps) {
  const v = new Var('search')
  return (
    <Panel round {...props} h>
      <Icon icon={Icons.Search} />
      <Input multiline value={v} />
    </Panel>
  )
}

function Tags(props: BoxProps) {
  return (
    <Box h spaced>
      <Tag {...props}>
        <Icon icon={Icons.ChevronLeft} />
        <Label smallcaps>Left</Label>
      </Tag>
      <Tag {...props}>
        <Label smallcaps>Middle</Label>
      </Tag>
      <Tag {...props}>
        <Label smallcaps>Right</Label>
        <Icon icon={Icons.ChevronRight} />
      </Tag>
    </Box>
  )
}

function Slider_(props: BoxProps) {
  return (
    <Panel {...props} width={200}>
      <Slider value={new Var(2)} limit={range(0, 5)} tick={1} snap={1} />
    </Panel>
  )
}

interface Example {
  name: string
  render: (props: BoxProps) => ReactNode
}

const Examples = once((): Example[] => [
  { name: 'Box (h)', render: HBox },
  { name: 'Box (sq)', render: SquareBox },
  { name: 'Lorem', render: Lorem },
  { name: 'Search', render: Search },
  { name: 'Dropdown', render: Dropdown },
  { name: 'Tags', render: Tags },
  { name: 'Buttons', render: SimpleButtons },
  { name: 'Button Group (h)', render: ButtonGroupH },
  { name: 'Button Group (v)', render: ButtonGroupV },
  { name: 'Large Icon Button', render: LargeIconButton },
  { name: 'Icon Buttons', render: IconButtons },
  { name: 'Slider', render: Slider_ }
])

// ----------------------------------------------------------------------------

export interface Props extends BoxProps {
  active: Var<string>
}

export function ExamplePicker(props: Props) {
  const { active, ...rest } = props

  const open = useVar(false)
  const picker = () => (
    <Balloon
      v
      open={open}
      handle={false}
      margin={1}
      shadow
      behavior="click"
      width={Unit * 8}
    >
      <Listbox<Example, string>
        multi={false}
        required
        rowHeight={() => 60}
        items={Examples.get()}
        selection={props.active}
        renderContainer={renderContainer}
        renderItem={renderItem}
        onSelect={onSelect}
        identify={identify}
      />
    </Balloon>
  )

  const onSelect = () => setTimeout(() => open.set(false), 200)

  const identify = (example: Example) => example.name

  const renderContainer = (cs: React.ReactNode) => (
    <Box height={Unit * 14} scroll v sep>
      {cs}
    </Box>
  )

  const renderItem = (example: Example, props: BoxProps) => {
    return (
      <Box bg {...props} v pad>
        {example.render({
          shadow: true,
          bg: true,
          style: { pointerEvents: 'none' }
        })}
      </Box>
    )
  }

  return (
    <Attach attachment={picker}>
      <Panel button h {...rest}>
        <Label>
          Example: <strong>{active.get()}</strong>
        </Label>
        <Box grow />
        <Icon icon={Icons.CaretDown} />
      </Panel>
    </Attach>
  )
}
