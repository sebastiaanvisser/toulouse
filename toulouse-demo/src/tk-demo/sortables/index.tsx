import * as React from 'react'
import { useStoredVar, useValue } from 'toulouse/lib'
import { OptionButtons, Panel } from 'toulouse/widget'
import { HorizontalSorting } from './HorizontalSorting'
import { TagSorting } from './TagSorting'
import { VerticalSorting } from './VerticalSorting'
import { Box } from 'toulouse/box'

type Demo = 'horizontal' | 'vertical' | 'tag'

export function Sortables() {
  const demoV = useStoredVar<Demo>('sortables.demo', 'vertical')
  const demo = useValue(demoV)

  const renderDemo = () => {
    switch (demo) {
      case 'horizontal':
        return <HorizontalSorting />
      case 'vertical':
        return <VerticalSorting />
      case 'tag':
        return <TagSorting />
      default:
        return demo
    }
  }

  const toolbar = () => {
    return (
      <Panel pad h sharp spaced elevate>
        <OptionButtons<Demo>
          active={demoV}
          options={[
            { id: 'vertical', label: 'Vertically' },
            { id: 'horizontal', label: 'Horizontally' },
            { id: 'tag', label: 'Tags' }
          ]}
        />
      </Panel>
    )
  }

  return (
    <Box v>
      {toolbar()}
      <Box pad={60}>{renderDemo()}</Box>
    </Box>
  )
}
