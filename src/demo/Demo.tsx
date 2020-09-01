import React, { useState } from 'react'
import { Box, BoxProps } from '../box/Box'
import { Theme } from '../box/Themed'
import { Ctrl, useGlobalKey } from '../dyn/GlobalKey'
import { Icons } from '../icon/Icons'
import { useStoredVar, useValue, Var, W } from '../lib/Var'
import { Fg, Primary } from '../styling/Color'
import { Palette, paletteByName, PaletteName } from '../styling/Palette'
import { Icon } from '../widget/Icon'
import { Label } from '../widget/Label'
import { Listbox } from '../widget/Listbox'
import { Checkbox } from '../widget/Options'
import { ShortcutString } from '../widget/ShortcutString'
import { Backdrop } from './Backdrop'
import { Balloons } from './balloons/Balloons'
import { Buttons } from './Buttons'
import { Checkboxes } from './Checkboxes'
import { Colors } from './Colors'
import { Dragging } from './dragging'
import { IconsDemo } from './Icons'
import { Inputs } from './Inputs'
import { Lists } from './lists'
import { PalettePicker } from './PalettePicker'
import { Panels } from './Panels'
import { SpinnerDemo } from './progress/Spinner'
import { RadioButtons } from './RadioButtons'
import { Sliders } from './Sliders'
import { Sortables } from './sortables'
import { TabsDemo } from './Tabs'
import { TagsDemo } from './Tags'
import { Virtuals } from './virtuals'

type ActiveDemo =
  | 'attention'
  | 'balloons'
  | 'buttons'
  | 'checkboxes'
  | 'colors'
  | 'dialog'
  | 'dragging'
  | 'graph_box'
  | 'Primarys'
  | 'icons'
  | 'inputs'
  | 'lists'
  | 'paging'
  | 'patterns'
  | 'progress'
  | 'radios'
  | 'sliders'
  | 'sortable'
  | 'tables'
  | 'tabs'
  | 'tags'
  | 'panels'
  | 'themes'
  | 'virtual'

export type DemoDef = {
  key: ActiveDemo
  label: string
  icon: any
  demo?: (bg: HTMLElement | undefined) => React.ReactNode
}

// rule('body', 'html').style({
//   position: 'relative',
//   height: '100%',
//   margin: '0',
//   padding: '0'
// })

interface Props {
  demo: Var<ActiveDemo | undefined>
}

export function Tk(_: Props) {
  const [v, setV] = useState(true)

  const destruct = () => {
    setV(false)
    window.setTimeout(() => {
      if (W) W.debug()
    })
  }

  return v ? <TkDemo demo={_.demo} destruct={destruct} /> : <></>
}

const Demos: DemoDef[] = [
  {
    key: 'colors',
    label: 'Colors',
    icon: Icons.LowContrast,
    demo: () => <Colors />
  },
  {
    key: 'panels',
    label: 'Panels',
    icon: Icons.Frame,
    demo: () => <Panels />
  },
  {
    key: 'buttons',
    label: 'Buttons',
    icon: Icons.Button,
    demo: () => <Buttons />
  },
  {
    key: 'balloons',
    label: 'Baloons',
    icon: Icons.Balloon,
    demo: () => <Balloons defs={Demos} />
  },
  {
    key: 'dragging',
    label: 'Dragging',
    icon: Icons.Resize,
    demo: bg => <Dragging bg={bg} />
  },
  { key: 'icons', label: 'Icons', icon: Icons.Dots, demo: () => <IconsDemo /> },
  {
    key: 'inputs',
    label: 'Inputs',
    icon: Icons.TextInput,
    demo: () => <Inputs />
  },
  {
    key: 'sliders',
    label: 'Sliders',
    icon: Icons.Sliders,
    demo: () => <Sliders />
  },
  {
    key: 'virtual',
    label: 'Virtual',
    icon: Icons.Virtual,
    demo: () => <Virtuals />
  },
  { key: 'tags', label: 'Tags', icon: Icons.Tag, demo: () => <TagsDemo /> },
  {
    key: 'progress',
    label: 'Progress',
    icon: Icons.Progress,
    demo: () => <SpinnerDemo />
  },
  {
    key: 'checkboxes',
    label: 'Checkboxes',
    icon: Icons.Checkbox,
    demo: () => <Checkboxes />
  },
  {
    key: 'radios',
    label: 'Radio buttons',
    icon: Icons.RadioButton,
    demo: () => <RadioButtons />
  },
  { key: 'lists', label: 'Lists', icon: Icons.Rows, demo: () => <Lists /> },
  { key: 'tabs', label: 'Tabs', icon: Icons.Tabs, demo: () => <TabsDemo /> },
  {
    key: 'sortable',
    label: 'Sortable',
    icon: Icons.Sortable,
    demo: () => <Sortables />
  },
  { key: 'Primarys', label: 'Primarys', icon: Icons.Dot },
  { key: 'paging', label: 'Paging', icon: Icons.Hamburger },
  { key: 'patterns', label: 'Patterns', icon: Icons.Pattern },
  { key: 'attention', label: 'Attention', icon: Icons.Target },
  { key: 'tables', label: 'Tables', icon: Icons.Table }
]

function TkDemo(props: { demo: Var<ActiveDemo | undefined>; destruct: () => void }) {
  useGlobalKey(Ctrl('L'), () => console.clear())
  useGlobalKey(Ctrl('R'), () => {
    localStorage.clear()
    window.location = window.location
  })

  const [bg, setBg] = useState<HTMLElement>()
  const grid = useStoredVar('demo.grid', true)
  const paletteName = useStoredVar<PaletteName>('demo.theme', 'arctic')
  const paletteVar = paletteName.iso(paletteByName.inv())
  const palette = useValue(paletteVar)
  const active = useValue(props.demo.debounce(1))
  const demo = Demos.find(d => d.key === active)
  const useGrid = useValue(grid)

  return (
    <Theme palette={palette}>
      <Box fit h sep>
        <Menu
          destruct={props.destruct}
          active={props.demo}
          palette={paletteVar}
          grid={grid}
        />
        <Backdrop elem={setBg} grid={useGrid} grow>
          {demo && demo.demo ? demo.demo(bg) : null}
        </Backdrop>
      </Box>
    </Theme>
  )
}

interface MenuProps {
  destruct: () => void
  active: Var<ActiveDemo | undefined>
  palette: Var<Palette>
  grid: Var<boolean>
}

function Menu(props: MenuProps) {
  const { active, palette, grid } = props
  const curActive = useValue(active.debounce(1))

  const identify = (a: DemoDef) => a.key
  const demo = Demos.find(d => d.key === curActive)

  const renderItem = (def: DemoDef, props: BoxProps, sel: boolean) => {
    const active = !!def.demo
    return (
      <Box {...props} rounded={!sel} h pad disabled={!def.demo}>
        <Icon fg={sel ? undefined : Primary} icon={def.icon} />
        <Label grow>{def.label}</Label>
        {active && (
          <Icon
            fg={sel ? Fg : Fg.alpha(0.1)}
            icon={sel ? Icons.ArrowRight : Icons.ChevronRight}
          />
        )}
      </Box>
    )
  }

  return (
    <Box bg sep sharp v width={8 * 30}>
      <Box pad>
        <PalettePicker active={palette} rounded />
      </Box>
      <Box h center onDoubleClick={props.destruct}>
        <Icon zoom={3} fg={Primary} icon={demo ? demo.icon : Icons.Empty} />
      </Box>
      <Listbox<DemoDef, ActiveDemo>
        items={Demos}
        multi={false}
        allowDeselect={false}
        required={false}
        selection={active}
        renderItem={renderItem}
        identify={identify}
        rowHeight={() => 50}
        pad={5}
        grow
      />
      <Box h pad>
        <Checkbox checked={grid}>
          <ShortcutString char="G" event={() => grid.toggle()}>
            Grid
          </ShortcutString>
        </Checkbox>
      </Box>
    </Box>
  )
}
