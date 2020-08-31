import React, { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { Box, BoxProps } from '../box/Box'
import { useResolvedPalette } from '../box/Paletted'
import { FocusProps, useFocusableProps } from '../dyn/Focus'
import { Blob, Circle, gshape, Tick } from '../icon/Icons'
import { circleShape, layers, Shape, offsetAsIcon } from '../icon/Shape'
import { Memo, memo1 } from '../lib/Memo'
import { useValue, Var } from '../lib/Var'
import { Palette } from '../styling'
import { className, cx } from '../styling/Css'
import { Rgba } from '../styling/Rgba'
import { Icon } from './Icon'

interface CheckboxProps extends BoxProps, FocusProps {
  checked: Var<boolean>
  disabled?: boolean
}

type RadioProps = CheckboxProps

interface Options {
  palette: Palette
  isChecked: boolean
  hasFocus: boolean
  enabled: boolean
}

// ----------------------------------------------------------------------------

interface ToggleProps extends BoxProps, FocusProps {
  toggle: (b: boolean) => boolean
  checked: Var<boolean>
  label?: string
  image: Memo<Options, Shape>
}

export function Toggle(props: ToggleProps) {
  const { disabled, checked, focus } = props
  const { children, image, onClick, ref, ...rest } = props
  const focusableProps = useFocusableProps(props)

  const palette = useResolvedPalette(props)
  const isChecked = useValue(checked)
  const hasFocus = focus ? useValue(focus) : false

  const handleClick = (ev: MouseEvent<HTMLDivElement>) => {
    const { onClick, toggle } = props
    checked.modify(toggle)
    if (onClick) onClick(ev)
  }

  const handleKeyDown = (ev: KeyboardEvent<HTMLDivElement>) => {
    const { toggle } = props
    if (ev.keyCode === 13 || ev.keyCode === 32) {
      checked.modify(toggle)
    }
  }

  const renderDisabled = () => (
    <Box h className={cx(checkboxC)} {...rest}>
      <Icon icon={image.get({ palette, isChecked, hasFocus, enabled: false })} />
      {children}
    </Box>
  )

  const renderEnabled = () => (
    <Box
      h
      blunt
      button
      rounded
      className={cx(checkboxC)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...focusableProps}
      {...rest}
    >
      <Icon icon={image.get({ palette, isChecked, hasFocus, enabled: true })} />
      {children}
    </Box>
  )

  return disabled ? renderDisabled() : renderEnabled()
}

// ----------------------------------------------------------------------------

export const Checkbox = (props: CheckboxProps) => (
  <Toggle {...props} toggle={v => !v} image={checkboxImage} />
)

export const RadioButton = (props: RadioProps) => (
  <Toggle {...props} toggle={() => true} image={radioImage} />
)

// ----------------------------------------------------------------------------

interface RadioOptionsProps<A> {
  values: { key: A; label: ReactNode; props?: RadioProps }[]
  value: Var<A>
}

export function RadioOptions<A extends string>(props: RadioOptionsProps<A>) {
  const { values, value } = props

  const is = (key: A) =>
    value.zoom(
      k => k === key,
      (k, o) => (k ? key : o)
    )

  return (
    <>
      {values.map(({ key, props, label }) => (
        <RadioButton key={key} checked={is(key)} {...props}>
          {label}
        </RadioButton>
      ))}
    </>
  )
}

// ----------------------------------------------------------------------------

const checkboxImage = memo1(
  (options: Options) => {
    const { palette, isChecked, hasFocus, enabled } = options

    const bg = palette.Bg
    const prim = palette.Primary().Bg
    const sep = palette.Hover

    const f = () =>
      offsetAsIcon(
        gshape(8, 8, 6.5, 6.5).scale(1.1).width(2).stroke(prim.alpha(0.4)).fill(bg)
      )

    const on = (c: Rgba) => layers(Blob.get().fill(c), Tick.get().fill(bg))
    const off = () => offsetAsIcon(gshape(8, 8, 6.5, 6.5).fill(bg).width(1.5).stroke(sep))

    if (enabled) {
      if (isChecked) return layers(hasFocus ? f() : <></>, on(prim))
      else return hasFocus ? f() : off()
    } else return isChecked ? on(sep) : off()
  },
  o => `${o.palette.name}-${o.isChecked}-${o.enabled}-${o.hasFocus}`
)

const radioImage = memo1(
  (options: Options) => {
    const { palette, isChecked, hasFocus, enabled } = options

    const bg = palette.Bg
    const prim = palette.Primary().Bg
    const sep = palette.Hover

    const f = () =>
      offsetAsIcon(circleShape(8).scale(1.1).width(2).stroke(prim.alpha(0.4)).fill(bg))

    const on = (c: Rgba) =>
      layers(Circle.get().fill(c), Circle.get().scaleOn(0.3, 15, 15).fill(bg))

    const off = () => offsetAsIcon(circleShape(8).fill(bg).width(1.5).stroke(sep))

    if (enabled) {
      if (isChecked) return layers(hasFocus ? f() : <></>, on(prim))
      else return hasFocus ? f() : off()
    } else return isChecked ? on(sep) : off()
  },
  o => `${o.palette.name}-${o.isChecked}-${o.enabled}-${o.hasFocus}`
)

// ----------------------------------------------------------------------------

const checkboxC = className('checkbox')
checkboxC.focus.style({ outline: 'none' })
