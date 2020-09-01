import { CSSProperties } from 'react'
import { pt } from '../lib/Geometry'
import { Rgba } from './Rgba'
import { Rule } from './Selector'

export const px = (p: number) => `${p}px`
export const pct = (p: number) => `${p}%`
export const commas = (...xs: string[]) => xs.join()

export type Classy1 = string | string[] | boolean | Rule | undefined
export type Classy = string | Classy1[] | boolean | Rule | undefined

export const cx = (...classes: Classy[]): string =>
  classes
    .flatMap(c => {
      if (c === undefined) return []
      if (typeof c === 'boolean') return []
      if (typeof c === 'string') return c.length > 0 ? [c] : []
      if (c instanceof Array) return [cx(...c)]
      if (c instanceof Rule) return [c.useClassName()]
      return c
    })
    .join(' ')

export const important = (s: string | number) => `${s} !important`

export const boxShadow = (clr: Rgba, blur: number, spread = 0, d = pt(0, 0)) =>
  [px(d.x), px(d.y), px(blur), px(spread), clr.toString()].join(' ')

export const insetShadow = (c: Rgba, blur: number, spread = 0, d = pt(0, 0)) =>
  `inset ${boxShadow(c, blur, spread, d)}`

export const leftRadius = (r: string): CSSProperties => ({
  borderTopLeftRadius: r,
  borderBottomLeftRadius: r
})

export const rightRadius = (r: string): CSSProperties => ({
  borderTopRightRadius: r,
  borderBottomRightRadius: r
})
