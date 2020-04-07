import * as React from 'react'
import { Unit } from 'toulouse/box'
import { ChevronRight } from 'toulouse/icon'
import { Use, useValue, useVar, Var } from 'toulouse/lib'
import { Green, Primary } from 'toulouse/styling'
import { Balloon, Img, Input, Label, Panel } from 'toulouse/widget'
import { lorem } from '../Lorem'

export function EditDemo() {
  const focus = useVar(false)
  const val = useVar(lorem(3))
  const hasFocus = useValue(focus)

  const balloon = () => {
    return (
      <Balloon
        small
        palette={hasFocus ? Primary : undefined}
        bias={1}
        margin={10}
        open={new Var(true as boolean)}
        registry={false}
      >
        <Use value={val}>{v => <Label>Character count: {v.length}</Label>}</Use>
      </Balloon>
    )
  }

  return (
    <Panel h elevate tabIndex={1} outline={hasFocus} focus={focus} width={Unit * 7}>
      <Img fg={Green} img={ChevronRight} />
      <Input attach={balloon} multiline focus={focus} value={val} />
    </Panel>
  )
}
