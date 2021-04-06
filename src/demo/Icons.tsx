import * as React from 'react'
import { Box } from '../box/Box'
import { Small } from '../box/Small'
import { Theme } from '../box/Themed'
import { Unit } from '../box/Unit'
import { Attach } from '../dyn/Attach'
import { Icons } from '../icon/Icons'
import * as S from '../icon/Shape'
import { range } from '../lib/Range'
import { Use, useStoredVar, useVar, useVar1, Value, Var } from '../lib/Var'
import { Shade } from '../styling/Color'
import { Balloon } from '../widget/Balloon'
import { Icon } from '../widget/Icon'
import { Label } from '../widget/Label'
import { Checkbox } from '../widget/Options'
import { Panel } from '../widget/Panel'
import { ShortcutString } from '../widget/ShortcutString'
import { Slider } from '../widget/Slider'
import { Tag } from '../widget/Tag'

function segments<A>(xs: A[], c: number): A[][] {
  return xs.length <= c ? [xs] : [xs.slice(0, c)].concat(segments(xs.slice(c), c))
}

export function IconsDemo() {
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

  const [zoomFocus, hasZoomFocus] = useVar1(false)
  const gridFocus = useVar(false)
  const padFocus = useVar(false)
  const [widthFocus, hasWidthFocus] = useVar1(false)

  const segmented: Value<[string, S.IconDef][][]> = segments1.map(s =>
    segments(Object.entries(Icons), s)
  )

  const toolbar = () => {
    return (
      <Panel h sharp pad spaced>
        <Panel border h shadow={hasZoomFocus}>
          <Icon icon={Icons.ZoomIn} />
          <ShortcutString char="Z" event={() => zoomFocus.set(true)}>
            Zoom
          </ShortcutString>
          <Slider
            width={Unit * 5}
            value={zoom}
            tabIndex={0}
            focus={zoomFocus}
            limit={range(0, 8)}
            step={[22 / 30, 1, 2, 3, 4, 5, 6, 7, 8]}
            stick={[22 / 30, 1, 2, 3, 4, 5, 6, 7, 8]}
            tick={[22 / 30, 1, 2, 3, 4, 5, 6, 7, 8]}
          />
          <Tag bg={Shade} width={60} center margin>
            <Label h>
              <Use value={zoom}>{z => (z >= 1 ? z : '2/3')}</Use>
            </Label>
            <Small>
              <Icon icon={Icons.Cross} />
            </Small>
          </Tag>
        </Panel>
        <Checkbox tabIndex={0} focus={padFocus} checked={pad}>
          <ShortcutString
            char="P"
            event={() => {
              padFocus.set(true)
              pad.toggle()
            }}
          >
            Pad
          </ShortcutString>
        </Checkbox>
        <Checkbox tabIndex={0} focus={gridFocus} checked={grid}>
          <ShortcutString
            char="G"
            event={() => {
              gridFocus.set(true)
              grid.toggle()
            }}
          >
            Grid
          </ShortcutString>
        </Checkbox>
        <Panel h border shadow={hasWidthFocus}>
          <ShortcutString char="W" event={() => widthFocus.set(true)}>
            Width
          </ShortcutString>
          <Slider
            width={Unit * 5}
            tabIndex={0}
            focus={widthFocus}
            value={segments1}
            limit={range(2, 16)}
            step={1}
            stick={1}
            tick={1}
          />
          <Tag bg={Shade} width={30} center margin>
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
                    icon={kv[1]}
                    zoom={zoom}
                    pad={pad}
                    position={i >= icons.length / 2 ? 'top' : 'bottom'}
                    active={active.extend(
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
  position: 'top' | 'bottom'
  icon: S.IconDef
  zoom: number
  pad: boolean
  active: Var<boolean>
  grid: Var<boolean>
}

export function IconsBox(props: IconsBoxProps) {
  const { icon, position, zoom, pad, active, grid, id } = props

  const popover = (isActive: boolean) => {
    return (
      <Theme desert>
        <Balloon
          open={new Var(isActive)}
          position={position}
          rounded
          elevate
          v
          id={id}
          sep
        >
          <Box>
            <Use value={grid}>{g => g && <Box abs>{gridImg()}</Box>}</Use>
            <Icon zoom={6} icon={icon} />
          </Box>
          <Box h center pad>
            <Theme primary>
              <Tag>
                <Label smallcaps>{id}</Label>
              </Tag>
            </Theme>
          </Box>
        </Balloon>
      </Theme>
    )
  }

  return (
    <Use value={active}>
      {isActive => (
        <Theme primary={isActive}>
          <Attach attachment={() => popover(isActive)}>
            <Box
              h
              bg
              center
              middle
              button={!isActive}
              pad={pad ? 15 : undefined}
              onMouseDown={() => active.toggle()}
              onMouseOver={ev => (ev.altKey ? active.set(true) : undefined)}
            >
              <Icon zoom={zoom} icon={icon} />
            </Box>
          </Attach>
        </Theme>
      )}
    </Use>
  )
}

// ----------------------------------------------------------------------------

const gridImg = () => (
  <S.ShapeSvg
    width={180}
    height={180}
    shape={S.Shape.layers(
      S.Shape.rect(1, 180)
        .dy(90)
        .array(5 * 6 - 1, (s, i) => s.dx(6 + i * 6))
        .clone(s => s.rotate(90).dx(180))
        .opacity(0.05),
      S.Shape.rect(1, 180)
        .dy(90)
        .array(5, (s, i) => s.dx(30 + i * 30))
        .clone(s => s.rotate(90).dx(180))
        .opacity(0.1)
    )}
  />
)
