import { className, cx, px } from '../styling/Css'
import { smallC } from './Small'

export interface CornerProps {
  blunt?: boolean
  rounded?: boolean
  round?: boolean
  sharp?: boolean
}

const cr = (r: number) => ({ borderRadius: px(r) })

const sharpC = className('sharp', cr(0))
const bluntC = className('blunt', cr(3))
const roundedC = className('rounded', cr(8))
const roundC = className('round', cr(15))

smallC.selfOrSub(sharpC).style(cr(0))
smallC.selfOrSub(bluntC).style(cr(3))
smallC.selfOrSub(roundedC).style(cr(5))
smallC.selfOrSub(roundC).style(cr(8))

export const CornerStyles = { sharpC, bluntC, roundedC, roundC }

export function cornerClass({ rounded, round, sharp, blunt }: CornerProps) {
  return cx(
    blunt && bluntC,
    rounded && roundedC,
    round && roundC,
    sharp && sharpC //
  )
}
