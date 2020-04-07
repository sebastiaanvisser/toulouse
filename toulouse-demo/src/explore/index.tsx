import React, { useEffect } from 'react'
import { Box, usePalette } from 'toulouse/box'
import { Bright, Camera, Grid, MapMarker, Pulse, Rows, Table, Trash } from 'toulouse/icon'
import { once, Use, useVar, Var } from 'toulouse/lib'
import { Arctic, cx, Ocean, Palettes, pct, rule } from 'toulouse/styling'
import { BackdropStyles } from 'toulouse/widget'
import { Document, DocumentTabs } from './DocumentTabs'
import { Tabular } from './tabular'
import { useGlobalKey, Alt } from 'toulouse/dyn'

const ExampleDocuments: Document[] = [
  { name: 'Table', icon: Table },
  { name: 'Map', icon: MapMarker },
  { name: 'List', icon: Rows },
  { name: 'Grid', icon: Grid },
  { name: 'Pulse', icon: Pulse },
  { name: 'Camera', icon: Camera },
  { name: 'Bright', icon: Bright },
  { name: 'Trash', icon: Trash }
]

// ----------------------------------------------------------------------------

const GlobalCSS = once(() =>
  rule('body', 'html').style({
    position: 'relative',
    height: '100%',
    margin: '0',
    padding: '0'
  })
)

export function Explore() {
  const fgPalette = usePalette()
  const { backdropC, gridC } = BackdropStyles.get(fgPalette)

  const exampleDocuments = useVar(ExampleDocuments)
  const activeDocumentTab = useVar(ExampleDocuments[0].name)
  const palette = useVar(Ocean)
  const grid = useVar(false)

  useEffect(() => void GlobalCSS.get(), [])

  const nextTheme = () =>
    palette.modify(
      cur =>
        Palettes[(Palettes.findIndex(t => t.name === cur.name) + 1) % Palettes.length]
    )

  const toggleGrid = () => grid.toggle()

  useGlobalKey(Alt('T'), nextTheme)
  useGlobalKey(Alt('G'), toggleGrid)

  return (
    <Use value={Var.pack({ grid, palette })}>
      {({ grid, palette }) => (
        <Box
          v
          rel
          palette={palette}
          className={cx(backdropC, grid && gridC)}
          style={{ height: pct(100) }}
        >
          <Box height={20} />
          <DocumentTabs documents={exampleDocuments} active={activeDocumentTab} />
          <Box bg grow palette={Arctic} elevate sharp height={200}>
            <Tabular />
          </Box>
        </Box>
      )}
    </Use>
  )
}
