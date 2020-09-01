import { px, cx } from '../styling/Classy'
import { className } from '../styling/Rule'
import { smallC } from './Small'

export interface Props {
  blunt?: boolean
  rounded?: boolean
  round?: boolean
  sharp?: boolean
}

const cr = (r: number) => ({ borderRadius: px(r) })

export const sharpC = className('sharp').style(cr(0))
export const bluntC = className('blunt').style(cr(3))
export const roundedC = className('rounded').style(cr(8))
export const roundC = className('round').style(cr(15))

smallC.selfOrSub(sharpC).style(cr(0))
smallC.selfOrSub(bluntC).style(cr(2))
smallC.selfOrSub(roundedC).style(cr(6))
smallC.selfOrSub(roundC).style(cr(10))

export function classes({ rounded, round, sharp, blunt }: Props) {
  return cx(
    blunt && bluntC,
    rounded && roundedC,
    round && roundC,
    sharp && sharpC //
  )
}
