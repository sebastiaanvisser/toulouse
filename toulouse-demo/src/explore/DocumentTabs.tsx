import * as React from 'react'
import { Box, Unit } from 'toulouse/box'
import {
  AddOpen,
  Alert,
  ArrowRight,
  Camera,
  CaretDown,
  CaretRight,
  Ellipses,
  Empty,
  Eye,
  Globe,
  LowContrast,
  MapMarker,
  Nautical,
  Pulse,
  Scissors,
  Settings8,
  Warning,
  ZoomIn
} from 'toulouse/icon'
import { Use, Var } from 'toulouse/lib'
import {
  Blue,
  Contrast,
  Cyan,
  Fog,
  Indigo,
  Lava,
  Magenta,
  Orange,
  PrimaryColor,
  Purple,
  Red,
  White,
  Yellow
} from 'toulouse/styling'
import { Balloon, IconDef, Img, Label, Panel, Tabs, Tag, Tooltip } from 'toulouse/widget'

export interface Document {
  name: string
  icon: IconDef
}

interface Props {
  documents: Var<Document[]>
  active: Var<string>
}

export function DocumentTabs(props: Props) {
  const { documents, active } = props

  const renderTab = (doc: Document) => {
    return {
      tab: doc.name,
      label: (
        <Use value={active.map(a => a === doc.name)}>
          {isActive => (
            <Box h pad={{ v: 0, h: 5 }}>
              <Img img={doc.icon} fg={PrimaryColor} />
              <Label>{doc.name}</Label>
              <Img img={isActive ? CaretDown : Empty} />
            </Box>
          )}
        </Use>
      )
    }
  }

  const renderAddDocument = () => {
    return (
      <Panel fg={Indigo} h round button attach={picker}>
        <Img img={AddOpen} />
        <Label fg={Indigo}>Add document</Label>
      </Panel>
    )
  }

  const picker = () => {
    return (
      <Balloon sep v rounded position="bottom" behavior="click">
        <Box pad={5}>
          <Panel rounded button h>
            <Img fg={PrimaryColor} img={Scissors} />
            <Label grow>Cut to clipboard</Label>
            <Img img={Alert} bg={Red} fg={Yellow} />
          </Panel>
          <Panel rounded button h>
            <Img fg={PrimaryColor} img={Nautical} /> Directional help
          </Panel>
          <Panel palette={Lava} rounded button h>
            <Img fg={PrimaryColor} img={LowContrast} />
            <Label grow>Low contrast</Label>
            <Tag
              margin
              attach={() => <Tooltip position="top">Something is wrong</Tooltip>}
            >
              <Img img={Warning} fg={Orange} />
            </Tag>
          </Panel>
          <Panel rounded button h>
            <Img fg={PrimaryColor} img={ZoomIn} />
            <Label grow>Zoom In</Label>
            <Tag margin palette={Fog}>
              2.3x
            </Tag>
          </Panel>
          <Panel rounded button h>
            <Img fg={PrimaryColor} img={Eye} />
            <Label grow>Configure visibility</Label>
            <Tag margin shadow palette={Contrast}>
              inv
            </Tag>
          </Panel>
        </Box>
        <Box pad={5} palette={Contrast}>
          <Panel rounded button h>
            <Img img={MapMarker} bg={White} fg={Red} />
            <Label grow>Plot on a map</Label>
            <Img img={ArrowRight} />
          </Panel>
          <Panel rounded button h>
            <Img img={Camera} bg={Blue} fg={White} />
            <Label grow>Add Img</Label>
            <Img img={CaretRight} />
          </Panel>
          <Panel rounded button h>
            <Img img={Pulse} bg={Magenta.lighten(0.9)} fg={Magenta} />
            <Label grow>Timeline overview</Label>
            <Img img={Ellipses} />
          </Panel>
          <Panel rounded button h>
            <Img img={Globe} bg={Indigo} fg={Cyan} />
            <Label grow>Configure the entire world</Label>
            <Img img={Settings8} bg={Purple} fg={White} />
          </Panel>
        </Box>
      </Balloon>
    )
  }

  return (
    <Use value={documents}>
      {docs => (
        <Tabs<string>
          active={active}
          tabs={[
            { content: <Box grow /> },
            ...docs.map(renderTab),
            { content: <Box width={Unit} /> },
            { content: renderAddDocument() },
            { content: <Box grow /> }
          ]}
        />
      )}
    </Use>
  )
}
