import { createContext, useContext } from 'react'
import { className, cx } from '../styling'

export interface SmallProps {
  small?: boolean
}

export const SmallContext = createContext(false)

export const useSmall = () => useContext(SmallContext)

export const useResolvedeSmall = (props: SmallProps) => {
  const small = useContext(SmallContext)
  return props.small || small
}

export const smallC = className(`small`)

export const useSmallClass = (props: SmallProps) => {
  return cx(props.small && smallC)
}
