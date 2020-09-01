import React, { createContext, PropsWithChildren, useContext } from 'react'
import { cx } from '../styling/Classy'
import { className } from '../styling/Rule'

export const SmallContext = createContext(false)

export function Small(props: PropsWithChildren<SmallProps>) {
  const { small, children } = props
  return (
    <SmallContext.Provider value={small === undefined ? true : small}>
      {children}
    </SmallContext.Provider>
  )
}

export const useSmall = () => useContext(SmallContext)

// ----------------------------------------------------------------------------

export interface SmallProps {
  small?: boolean
}

export const smallC = className(`small`)

export const useSmallClass = ({ small }: SmallProps) => cx(small && smallC)
