import React, { useEffect, useRef, useState } from 'react'
import { Box, BoxProps } from 'toulouse/box'
import { Ctrl, useGlobalKey } from 'toulouse/dyn'
import {
  ArrowRight,
  Balloon,
  Button,
  Checkbox as CheckboxIcon,
  ChevronRight,
  Dot,
  Dots,
  Empty,
  Frame,
  Hamburger,
  LowContrast,
  Pattern,
  Progress,
  RadioButton,
  Resize,
  Rows,
  Sliders as SlidersIcon,
  Sortable,
  Table,
  Tabs,
  Tag as TagIcon,
  Target,
  TextInput,
  Virtual
} from 'toulouse/icon'
import { once, Use, useStoredVar, useValue, useVar, W } from 'toulouse/lib'
import { Alpha, paletteByName, PrimaryColor, rule, Fg } from 'toulouse/styling'
import {
  Backdrop,
  Checkbox,
  IconDef,
  Img,
  Label,
  Listbox,
  ShortcutString
} from 'toulouse/widget'
import { Balloons } from './balloons/Balloons'
import { Buttons } from './Buttons'
import { Checkboxes } from './Checkboxes'
import { Colors } from './Colors'
import { Dragging } from './dragging'
import { Icons } from './Icons'
import { Inputs } from './Inputs'
import { Lists } from './lists'
import { PalettePicker } from './PalettePicker'
import { Panels } from './Panels'
import { SpinnerDemo } from './progress/Spinner'
import { RadioButtons } from './RadioButtons'
import { Sliders } from './Sliders'
import { Sortables } from './sortables'
import { TabsDemo } from './Tabs'
import { Tags } from './Tags'
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
  icon: IconDef
  demo?: () => React.ReactNode
}

const GlobalCSS = once(() =>
  rule('body', 'html').style({
    position: 'relative',
    height: '100%',
    margin: '0',
    padding: '0'
  })
)

export function Tk() {
  const [v, setV] = useState(true)

  useEffect(() => void GlobalCSS.get(), [])

  const destruct = () => {
    setV(false)
    window.setTimeout(() => W.debug())
  }

  return v ? <TkDemo destruct={destruct} /> : <></>
}

function TkDemo(props: { destruct: () => void }) {
  useGlobalKey(Ctrl('L'), () => console.clear())

  const Demos = useRef<DemoDef[]>([
    {
      key: 'colors',
      label: 'Colors',
      icon: LowContrast,
      demo: () => <Colors />
    },
    {
      key: 'panels',
      label: 'Panels',
      icon: Frame,
      demo: () => <Panels />
    },
    {
      key: 'buttons',
      label: 'Buttons',
      icon: Button,
      demo: () => <Buttons />
    },
    {
      key: 'balloons',
      label: 'Baloons',
      icon: Balloon,
      demo: () => <Balloons defs={Demos} />
    },
    {
      key: 'dragging',
      label: 'Dragging',
      icon: Resize,
      demo: () => <Use value={bg}>{bg => <Dragging bg={bg} />}</Use>
    },
    { key: 'icons', label: 'Icons', icon: Dots, demo: () => <Icons /> },
    {
      key: 'inputs',
      label: 'Inputs',
      icon: TextInput,
      demo: () => <Inputs />
    },
    {
      key: 'sliders',
      label: 'Sliders',
      icon: SlidersIcon,
      demo: () => <Sliders />
    },
    {
      key: 'virtual',
      label: 'Virtual',
      icon: Virtual,
      demo: () => <Virtuals />
    },
    { key: 'tags', label: 'Tags', icon: TagIcon, demo: () => <Tags /> },
    {
      key: 'progress',
      label: 'Progress',
      icon: Progress,
      demo: () => <SpinnerDemo />
    },
    {
      key: 'checkboxes',
      label: 'Checkboxes',
      icon: CheckboxIcon,
      demo: () => <Checkboxes />
    },
    {
      key: 'radios',
      label: 'Radio buttons',
      icon: RadioButton,
      demo: () => <RadioButtons />
    },
    { key: 'lists', label: 'Lists', icon: Rows, demo: () => <Lists /> },
    { key: 'tabs', label: 'Tabs', icon: Tabs, demo: () => <TabsDemo /> },
    {
      key: 'sortable',
      label: 'Sortable',
      icon: Sortable,
      demo: () => <Sortables />
    },
    { key: 'Primarys', label: 'Primarys', icon: Dot },
    { key: 'paging', label: 'Paging', icon: Hamburger },
    { key: 'patterns', label: 'Patterns', icon: Pattern },
    { key: 'attention', label: 'Attention', icon: Target },
    { key: 'tables', label: 'Tables', icon: Table }
  ]).current

  const bg = useVar<HTMLElement | undefined>(undefined)
  const grid = useStoredVar('demo.grid', true)
  const activeVar = useStoredVar<ActiveDemo | undefined>('demo.active', undefined)
  const paletteName = useStoredVar('demo.theme', 'Arctic')
  const paletteVar = paletteName.iso(paletteByName.inv())
  const palette = useValue(paletteVar)
  const active = useValue(activeVar.debounce(1))
  const demo = Demos.find(d => d.key === active)

  const menu = () => (
    <Box bg sep sharp v width={8 * 30}>
      <Box pad>
        <PalettePicker active={paletteVar} rounded />
      </Box>
      <Box h center onDoubleClick={props.destruct}>
        <Img zoom={3} fg={PrimaryColor} img={demo ? demo.icon : Empty} />
      </Box>
      <Listbox<DemoDef, ActiveDemo>
        items={Demos}
        multi={false}
        allowDeselect={false}
        required={false}
        selection={activeVar}
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

  const identify = (a: DemoDef) => a.key

  const renderItem = (def: DemoDef, props: BoxProps, sel: boolean) => {
    const active = !!def.demo
    return (
      <Box {...props} rounded={!sel} h pad disabled={!def.demo}>
        <Img fg={sel ? undefined : PrimaryColor} img={def.icon} />
        <Label grow>{def.label}</Label>
        {active && (
          <Img fg={sel ? Fg : Alpha(0.1)} img={sel ? ArrowRight : ChevronRight} />
        )}
      </Box>
    )
  }

  const renderDemo = () => (
    <Box grow style={{ overflow: 'auto' }}>
      {demo && demo.demo ? demo.demo() : null}
    </Box>
  )

  return (
    <Box fit h palette={palette}>
      {!window.location.search.match(/no-menu/) && menu()}
      <Use value={grid}>
        {grid => (
          <Backdrop elem={bg.set} grid={grid} grow scroll>
            {renderDemo()}
          </Backdrop>
        )}
      </Use>
    </Box>
  )
}
