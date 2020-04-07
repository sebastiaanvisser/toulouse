import * as React from 'react'
import { Box, Unit } from 'toulouse/box'
import {
  Icons as IconNames,
  layers,
  rect,
  Shape,
  shapeAsSvg,
  ZoomIn
} from 'toulouse/icon'
import { Once, once, range, Use, useStoredVar, Value, Var } from 'toulouse/lib'
import { Desert, Primary, Shade } from 'toulouse/styling'
import {
  Balloon,
  Checkbox,
  Img,
  Label,
  Panel,
  ShortcutString,
  Slider,
  Tag
} from 'toulouse/widget'

function segments<A>(xs: A[], c: number): A[][] {
  return xs.length <= c ? [xs] : [xs.slice(0, c)].concat(segments(xs.slice(c), c))
}

export function Icons() {
  const settings = useStoredVar('icon-demo-settings', {
    active: undefined as string | undefined,
    zoom: 1,
    pad: true,
    grid: true,
    segments: 8
  })

  const active = settings.prop('active')
  const zoom = settings.prop('zoom')
  const pad = settings.prop('pad')
  const grid = settings.prop('grid')
  const segments1 = settings.prop('segments')

  const focus = useStoredVar('icon-demo-focus', {
    slider0: false,
    slider1: false,
    check0: false,
    check1: false
  })

  const segmented: Value<[string, Once<Shape>][][]> = segments1.map(s =>
    segments(Object.entries(IconNames), s)
  )

  const toolbar = () => {
    return (
      <Panel h sharp pad spaced>
        <Panel border h tabIndex={0} focus={focus.prop('slider0')}>
          <Img img={ZoomIn} />
          <ShortcutString char="Z" event={() => focus.prop('slider0').set(true)}>
            Zoom
          </ShortcutString>
          <Slider
            width={Unit * 5}
            value={zoom}
            tabIndex={1}
            focus={focus.prop('slider0')}
            limit={range(0, 8)}
            step={[22 / 30, 1, 2, 3, 4, 5, 6, 7, 8]}
            stick={[22 / 30, 1, 2, 3, 4, 5, 6, 7, 8]}
            tick={[22 / 30, 1, 2, 3, 4, 5, 6, 7, 8]}
          />
          <Tag palette={Shade} width={60} center margin>
            <Label h>
              <Use value={zoom}>{z => (z >= 1 ? z : '2/3')}</Use>
              {' \u2A09'}
            </Label>
          </Tag>
        </Panel>
        <Checkbox native tabIndex={1} checked={pad} focus={focus.prop('check0')}>
          <ShortcutString
            char="P"
            event={() => {
              focus.prop('check0').set(true)
              pad.toggle()
            }}
          >
            Pad
          </ShortcutString>
        </Checkbox>
        <Checkbox native tabIndex={1} checked={grid} focus={focus.prop('check1')}>
          <ShortcutString
            char="G"
            event={() => {
              focus.prop('check1').set(true)
              grid.toggle()
            }}
          >
            Grid
          </ShortcutString>
        </Checkbox>
        <Panel h border tabIndex={0} focus={focus.prop('slider1')}>
          <ShortcutString char="W" event={() => focus.prop('slider1').set(true)}>
            Width
          </ShortcutString>
          <Slider
            width={Unit * 5}
            focus={focus.prop('slider1')}
            tabIndex={1}
            value={segments1}
            limit={range(2, 16)}
            step={1}
            stick={1}
            tick={1}
          />
          <Tag palette={Shade} width={30} center margin>
            <Label>
              <Use value={segments1}>{a => a}</Use>
            </Label>
          </Tag>
        </Panel>
      </Panel>
    )
  }

  const board = (zoom: number, pad: boolean) => {
    return (
      <Panel v sep elevate>
        <Use value={segmented.debounce(200)}>
          {icons =>
            icons.map((line, i) => (
              <Box sep key={i} h>
                {line.map(kv => (
                  <IconsBox
                    key={kv[0]}
                    id={kv[0]}
                    img={kv[1]}
                    zoom={zoom}
                    pad={pad}
                    active={active.zoom(
                      a => a === kv[0],
                      (x, _o) => (x ? kv[0] : undefined)
                    )}
                    grid={grid}
                  />
                ))}
              </Box>
            ))
          }
        </Use>
      </Panel>
    )
  }

  return (
    <Box v>
      {toolbar()}
      <Box pad={Unit * 2} spaced v>
        <Box h>
          <Use value={zoom.debounce(200)}>
            {z => <Use value={pad}>{p => board(z, p)}</Use>}
          </Use>
        </Box>
      </Box>
    </Box>
  )
}

// ----------------------------------------------------------------------------

interface IconsBoxProps {
  id: string
  img: Once<Shape>
  zoom: number
  pad: boolean
  active: Var<boolean>
  grid: Var<boolean>
}

export function IconsBox(props: IconsBoxProps) {
  const { img: icon, zoom, pad, active, grid, id } = props

  const popover = () => {
    return (
      <Balloon palette={Desert} behavior="click" rounded elevate v id={id} sep>
        <Box>
          <Use value={grid}>{g => g && <Box abs>{gridImg.get()}</Box>}</Use>
          <Img zoom={6} img={icon} />
        </Box>
        <Box h center pad>
          <Tag palette={Primary}>
            <Label smallcaps>{id}</Label>
          </Tag>
        </Box>
      </Balloon>
    )
  }

  return (
    <Use value={active}>
      {isActive => (
        <Box
          h
          center
          middle
          palette={isActive ? Primary : undefined}
          button={!isActive}
          pad={pad ? 15 : undefined}
          attach={popover}
          // onMouseDown={() => active.toggle()}
          // onMouseOver={ev => (ev.altKey ? active.set(true) : undefined)}
        >
          <Img zoom={zoom} img={icon} />
        </Box>
      )}
    </Use>
  )
}

// ----------------------------------------------------------------------------

const gridImg = once(() =>
  shapeAsSvg(
    180,
    180,
    layers(
      rect(1, 180)
        .dy(90)
        .array(5 * 6 - 1, (s, i) => s.dx(6 + i * 6))
        .clone(s => s.rotate(90).dx(180))
        .opacity(0.05),
      rect(1, 180)
        .dy(90)
        .array(5, (s, i) => s.dx(30 + i * 30))
        .clone(s => s.rotate(90).dx(180))
        .opacity(0.1)
    )
  )
)
