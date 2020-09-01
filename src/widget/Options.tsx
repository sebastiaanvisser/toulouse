import React, { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { Box, BoxProps } from '../box/Box'
import { usePalette } from '../box/Themed'
import { Focusable } from '../dyn/Focus'
import { gshape, Icons } from '../icon/Icons'
import * as S from '../icon/Shape'
import { Shape } from '../icon/Shape'
import * as H from '../lib/Hash'
import { useControlledVar, useValue, useVar, Var } from '../lib/Var'
import { cx } from '../styling/Classy'
import { Palette } from '../styling/Palette'
import { Rgba } from '../styling/Rgba'
import { style } from '../styling/Rule'
import { Icon } from '../widget/Icon'

interface CheckboxProps extends BoxProps {
  checked?: Var<boolean>
  disabled?: boolean
  focus?: Var<boolean>
}

type RadioProps = CheckboxProps

interface Options {
  palette: Palette
  isChecked: boolean
  hasFocus: boolean
  enabled: boolean
}

function hashOptions(options: Options) {
  const { palette, isChecked, hasFocus, enabled } = options
  return H.build(palette.name, isChecked, hasFocus, enabled)
}

// ----------------------------------------------------------------------------

interface ToggleProps extends BoxProps {
  toggle: (b: boolean) => boolean
  checked?: Var<boolean>
  label?: string
  focus?: Var<boolean>
  image: (options: Options) => S.IconDef
}

export function Toggle(props: ToggleProps) {
  const { disabled } = props
  const { children, image, onClick, ...rest } = props

  const focus = props.focus ?? useVar<boolean>(false)
  const hasFocus = useValue(focus)

  const [isChecked, setChecked] = useControlledVar(props.checked, false)

  const palette = usePalette()

  const handleClick = (ev: MouseEvent<HTMLDivElement>) => {
    const { onClick, toggle } = props
    setChecked(toggle(isChecked))
    if (onClick) onClick(ev)
  }

  const handleKeyDown = (ev: KeyboardEvent<HTMLDivElement>) => {
    const { toggle } = props
    if (ev.keyCode === 13 || ev.keyCode === 32) {
      setChecked(toggle(isChecked))
    }
  }

  const renderDisabled = () => (
    <Box h className={cx(checkboxC)} {...rest}>
      <Icon icon={image({ palette, isChecked, hasFocus, enabled: false })} />
      {children}
    </Box>
  )

  const renderEnabled = () => (
    <Focusable focus={focus}>
      <Box
        h
        blunt
        button
        rounded
        cx={checkboxC}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <Icon icon={image({ palette, isChecked, hasFocus, enabled: true })} />
        {children}
      </Box>
    </Focusable>
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

const checkboxImage = (options: Options) =>
  new S.IconDef(`checkbox-${hashOptions(options)}`, () => checkboxImage_(options))

const checkboxImage_ = (options: Options) => {
  const { palette, isChecked, hasFocus, enabled } = options

  const bg = palette.Bg
  const prim = palette.Primary().Bg
  const sep = palette.Hovering

  const f = () =>
    gshape(8, 8, 6.5, 6.5)
      .scale(1.1)
      .width(2)
      .stroke(prim.alpha(0.4))
      .fill(bg)
      .offsetAsIcon()

  const on = (c: Rgba) =>
    Shape.layers(Icons.Blob.shape().fill(c), Icons.Tick.shape().fill(bg))
  const off = () => gshape(8, 8, 6.5, 6.5).fill(bg).width(1.5).stroke(sep).offsetAsIcon()

  if (enabled) {
    if (isChecked) return Shape.layers(hasFocus ? f() : Shape.layers(), on(prim))
    else return hasFocus ? f() : off()
  } else return isChecked ? on(sep) : off()
}

const radioImage = (options: Options) =>
  new S.IconDef(`radio-${hashOptions(options)}`, () => radioImage_(options))

const radioImage_ = (options: Options) => {
  const { palette, isChecked, hasFocus, enabled } = options

  const bg = palette.Bg
  const prim = palette.Primary().Bg
  const sep = palette.Hovering

  const f = () =>
    Shape.circle(8).scale(1.1).width(2).stroke(prim.alpha(0.4)).fill(bg).offsetAsIcon()

  const on = (c: Rgba) =>
    Shape.layers(
      Icons.Circle.shape().fill(c),
      Icons.Circle.shape().scaleOn(0.3, 15, 15).fill(bg)
    )

  const off = () => Shape.circle(8).fill(bg).width(1.5).stroke(sep).offsetAsIcon()

  if (enabled) {
    if (isChecked) return Shape.layers(hasFocus ? f() : Shape.layers(), on(prim))
    else return hasFocus ? f() : off()
  } else return isChecked ? on(sep) : off()
}

// ----------------------------------------------------------------------------

const checkboxC = style()
checkboxC.focus.style({ outline: 'none' })
