import { once } from '../lib'
import { className, cx, px } from '../styling/Css'

export interface CornerProps {
  blunt?: boolean
  rounded?: boolean
  round?: boolean
  sharp?: boolean
}

export const CornerStyles = once(() => {
  const cr = (r: number) => ({ borderRadius: px(r) })

  const sharpC = className('sharp', cr(0))
  const bluntC = className('blunt', cr(3))
  const roundedC = className('rounded', cr(8))
  const roundC = className('round', cr(15))

  return { sharpC, bluntC, roundedC, roundC }
})

export function cornerClass({ rounded, round, sharp, blunt }: CornerProps) {
  const { bluntC, roundedC, roundC, sharpC } = CornerStyles.get()

  return cx(
    blunt && bluntC,
    rounded && roundedC,
    round && roundC,
    sharp && sharpC //
  )
}
