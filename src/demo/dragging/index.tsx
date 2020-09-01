import * as React from 'react'
import { Box } from '../../box/Box'
import { Unit } from '../../box/Unit'
import { Attach } from '../../dyn/Attach'
import { Icons } from '../../icon/Icons'
import { Geom } from '../../lib/Geometry'
import { Use, useStoredVar } from '../../lib/Var'
import { Balloon } from '../../widget/Balloon'
import { Icon } from '../../widget/Icon'
import { Label } from '../../widget/Label'
import { OptionButtons } from '../../widget/OptionButtons'
import { Checkbox } from '../../widget/Options'
import { Panel } from '../../widget/Panel'
import { DragConstraints, DragSettings } from './DragConstraints'
import { DragPlayground } from './DragPlayground'

type Demo = 'playground' | 'constraints'

interface Props {
  bg?: HTMLElement
}

export function Dragging(props: Props) {
  const demo = useStoredVar<Demo>('drag-demo-demo', 'constraints')

  const playgroundSettings = useStoredVar('drag-demo-playground-settings', {
    rubber: true,
    draggable: true,
    resizable: true
  })

  const constraintsSettings = useStoredVar(
    'drag-demo-example-settings',
    {
      target: new Geom(240, 120, 60, 60),
      visible: true,
      frame1: false,
      frame2: false,
      bar1: false,
      bar2: false,
      stick: false,
      snap: false,
      lines: false,
      grid: 0,
      rubber: false,
      rubberN: 1
    },
    json => ({ ...json, target: Geom.fromJson(json.target) })
  )

  const { bg } = props

  const toolbar = () => {
    return (
      <Panel h sharp sep>
        <Box h pad>
          <OptionButtons<Demo>
            active={demo}
            options={[
              { id: 'constraints', label: 'Constraints' },
              { id: 'playground', label: 'Playground' }
            ]}
          />
        </Box>
        <Use value={demo}>
          {demo => (demo === 'playground' ? playgroundTools() : constraintsTools())}
        </Use>
      </Panel>
    )
  }

  const playgroundTools = () => {
    const rubber = playgroundSettings.prop('rubber')
    const draggable = playgroundSettings.prop('draggable')
    const resizable = playgroundSettings.prop('resizable')
    return (
      <>
        <Box h pad>
          <Checkbox rounded checked={rubber}>
            Rubber
          </Checkbox>
          <Checkbox rounded checked={draggable}>
            Draggable
          </Checkbox>
          <Checkbox rounded checked={resizable}>
            Resizable
          </Checkbox>
        </Box>
        <Box grow />
        <Box pad>
          <Panel h button border shadow rounded>
            <Icon icon={Icons.Reset} />
            <Label>Reset</Label>
          </Panel>
        </Box>
      </>
    )
  }

  const constraintsTools = () => {
    return (
      <Attach attachment={settingsBalloon}>
        <Box h pad>
          <Box h border button>
            <Icon icon={Icons.Settings6} />
            <Label>Settings</Label>
            <Icon icon={Icons.CaretDown} />
          </Box>
        </Box>
      </Attach>
    )
  }

  const settingsBalloon = () => {
    return (
      // <Theme contrast>
      <Balloon behavior="click" margin={20} pad>
        <DragSettings settings={constraintsSettings} />
      </Balloon>
      // </Theme>
    )
  }

  const pick = (demo: Demo) => {
    switch (demo) {
      case 'constraints':
        return <DragConstraints bg={bg} settings={constraintsSettings} />
      case 'playground':
        return (
          <Use value={playgroundSettings}>
            {settings => <DragPlayground {...settings} />}
          </Use>
        )
      default:
        return
    }
  }

  return (
    <Box v>
      {toolbar()}
      <Box h pad={Unit * 2} spaced>
        <Use value={demo}>{pick}</Use>
      </Box>
    </Box>
  )
}
