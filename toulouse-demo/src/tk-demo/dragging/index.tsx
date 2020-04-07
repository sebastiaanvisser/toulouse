import * as React from 'react'
import { Box, Unit } from 'toulouse/box'
import { CaretDown, Reset, Settings6 } from 'toulouse/icon'
import { geom, Use, useStoredVar, Geom } from 'toulouse/lib'
import { Balloon, Checkbox, Img, Label, OptionButtons, Panel } from 'toulouse/widget'
import { DragExamples, DragSettings } from './DragExamples'
import { DragPlayground } from './DragPlayground'

type Demo = 'playground' | 'examples'

interface Props {
  bg?: HTMLElement
}

export function Dragging(props: Props) {
  const demo = useStoredVar<Demo>('drag-demo-demo', 'examples')

  const playgroundSettings = useStoredVar('drag-demo-playground-settings', {
    rubber: true,
    draggable: true,
    resizable: true
  })

  const exampleSettings = useStoredVar(
    'drag-demo-example-settings',
    {
      target: geom(240, 120, 60, 60),
      visible: true,
      frame1: false,
      frame2: false,
      bar1: false,
      bar2: false,
      stick: false,
      snap: false,
      lines: false,
      grid: 0,
      rubber: false
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
              { id: 'examples', label: 'Examples' },
              { id: 'playground', label: 'Playground' }
            ]}
          />
        </Box>
        <Use value={demo}>
          {demo => (demo === 'playground' ? playgroundTools() : examplesTools())}
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
            <Img img={Reset} />
            <Label>Reset</Label>
          </Panel>
        </Box>
      </>
    )
  }

  const examplesTools = () => {
    return (
      <Box h pad>
        <Box h border button attach={settingsBalloon}>
          <Img img={Settings6} />
          <Label>Settings</Label>
          <Img img={CaretDown} />
        </Box>
      </Box>
    )
  }

  const settingsBalloon = () => {
    return (
      <Balloon behavior="click" margin={20}>
        <DragSettings settings={exampleSettings} />
      </Balloon>
    )
  }

  const pick = (demo: Demo) => {
    switch (demo) {
      case 'examples':
        return <DragExamples bg={bg} settings={exampleSettings} />
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
