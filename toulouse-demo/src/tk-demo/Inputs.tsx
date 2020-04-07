import * as React from 'react'
import { Box, Unit } from 'toulouse/box'
import { Highlight, PrimaryRule } from 'toulouse/dyn'
import {
  CaretRight,
  ChevronRight,
  Cross,
  Dot,
  Search,
  Target,
  TextInput,
  Warning
} from 'toulouse/icon'
import { memo1, Use, useValue, useVar, Var } from 'toulouse/lib'
import {
  Arctic,
  Black,
  Blue,
  Contrast,
  cx,
  Desert,
  Fg,
  Green,
  Hover,
  Indigo,
  Lava,
  Palette,
  px,
  Red,
  style,
  Yellow
} from 'toulouse/styling'
import {
  Balloon,
  Img,
  Input,
  InputProps,
  Label,
  Panel,
  Spinner,
  Tag
} from 'toulouse/widget'
import { lorem } from './Lorem'

export function Inputs() {
  return (
    <Box v pad={Unit * 2} spaced width={Unit * 24}>
      <Box spaced h>
        <Demo1 />
        <Demo1 mono />
      </Box>
      <Box spaced h>
        <Demo2 />
        <Demo2 mono />
      </Box>
      <Demo3 />
      <Demo4 />
      <Demo4 />
      <Demo4 />
      <Demo5 zoom={1} />
      <Demo5 zoom={1.5} />
    </Box>
  )
}

// ----------------------------------------------------------------------------

export function Demo1(props: { mono?: boolean }) {
  const { mono } = props

  const value = useVar('')
  const focus = useVar(false)
  const hasFocus = useValue(focus)

  const balloon = () => (
    <Balloon
      position="top"
      open={Var.lift2(focus, value, (f, v) => f && v.length < 3)}
      palette={Lava}
    >
      <Label>Required</Label>
    </Balloon>
  )

  return (
    <>
      <Panel button shadow border onClick={() => focus.set(true)}>
        <Img img={Target} />
      </Panel>
      <Panel sep grow round v elevate tabIndex={1} focus={focus} outline={hasFocus}>
        <Box h>
          <Img fg={Blue} img={Search} />
          <Input mono={mono} value={value} placeholder="Search" focus={focus} />
          <Box attach={balloon}>
            <Use value={focus}>
              {focus => (
                <Spinner
                  speed={focus ? 500 : 1500}
                  fg={focus ? Blue : Black.lighten(0.8)}
                />
              )}
            </Use>
          </Box>
        </Box>
      </Panel>
    </>
  )
}

// ----------------------------------------------------------------------------

export function Demo2(props: { mono?: boolean }) {
  const { mono } = props
  const value = useVar(lorem(5))
  const focus = useVar(false)
  const hasFocus = useValue(focus)

  return (
    <Panel grow v focus={focus} tabIndex={0} elevate outline={hasFocus}>
      <Box sep grow v>
        <Box h pad>
          <Label>
            <b>Multi line</b>
          </Label>
        </Box>
        <Box pad grow>
          <Input mono={mono} multiline value={value} focus={focus} />
        </Box>
      </Box>
      <Box bg pad palette={Desert}>
        <Use value={value}>{v => <Label>Character count: {v.length}</Label>}</Use>
      </Box>
    </Panel>
  )
}

// ----------------------------------------------------------------------------

export function Demo4Line(
  props: {
    label: string
    anyFocus: boolean
    focus: Var<boolean>
    validate?: (s: string) => boolean
  } & Omit<InputProps, 'value'>
) {
  const { label, focus, anyFocus, validate = (_v: string) => true, ...rest } = props

  const value = useVar('')
  const hasFocus = useValue(focus)
  const v = useValue(value)

  const helpBalloon = () => {
    return (
      <Balloon position="top" behavior="hover">
        <Label>
          E-mail address <br />
          must be
          <br />
          an e-mail address
        </Label>
      </Balloon>
    )
  }

  return (
    <Box grow tabIndex={1} focus={focus} bg={hasFocus ? Hover : undefined}>
      <Box h>
        <Img fg={hasFocus ? Blue : Fg.alpha(0.1)} img={hasFocus ? CaretRight : Dot} />
        <Label width={80}>
          <b>{label}</b>
        </Label>
        <Input value={value} focus={focus} {...rest} />
        <Box small spaced pad h>
          {!validate(v) &&
            (anyFocus ? (
              <Tag palette={Lava} attach={helpBalloon}>
                <Label>Invalid</Label>
              </Tag>
            ) : (
              <Img img={Warning} fg={Fg.alpha(0.1)} />
            ))}
          {v.length > 0 && (
            <Tag button onClick={() => value.set('')}>
              <Img fg={Red} img={Cross} />
            </Tag>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export function Demo4() {
  const focus = new Var([false, false, false])
  // const f = useValue(focus.map(f => f.some(v => v))) TODO: using this instead of Use breaks :(
  return (
    <Use value={focus.map(f => f.some(v => v))}>
      {anyFocus => (
        <Box>
          <Panel zoom={1.5} v sep elevate tabIndex={1} outline={anyFocus}>
            <Demo4Line
              anyFocus={anyFocus}
              focus={focus.at(0)}
              label="E-mail"
              validate={v => !!v.match(/^.+@.+\..+$/)}
            />
            <Demo4Line anyFocus={anyFocus} focus={focus.at(1)} label="Username" />
            <Demo4Line anyFocus={anyFocus} focus={focus.at(2)} label="Password" />
            <Demo4Line anyFocus={anyFocus} focus={focus.at(3)} label="Note" multiline />
          </Panel>
        </Box>
      )}
    </Use>
  )
}

// ----------------------------------------------------------------------------

export class Demo5 extends React.PureComponent<{ zoom: number }> {
  value = new Var(
    `export interface Rect {
    left: number
    top: number
    right: number
    bottom: number
}` as string
  )
  sel = new Var({ start: 0, end: 0 })
  focus = new Var(false)

  render(): React.ReactNode {
    const { zoom } = this.props

    return (
      <Panel
        v
        sep
        palette={Contrast}
        elevate
        tabIndex={1}
        //focus={this.focus}
      >
        <Box h style={{ zoom }}>
          <Img fg={Green} img={ChevronRight} />
          <Input
            multiline
            mono
            value={this.value}
            placeholder="code"
            focus={this.focus}
            selection={this.sel}
          />
          <Box button className="foo123" onClick={this.click} attach={this.balloon}>
            <Img fg={Yellow} img={TextInput} />
          </Box>
        </Box>
      </Panel>
    )
  }

  click = () => this.sel.set({ start: 0, end: this.value.get().length })

  balloon = () => {
    return (
      <Use value={this.sel}>
        {({ start, end }) => (
          <Balloon small position="top" open={this.focus} bg={Indigo}>
            <Label>
              Selection: {start},{end}
            </Label>
          </Balloon>
        )}
      </Use>
    )
  }
}

// ----------------------------------------------------------------------------

export class Demo3 extends React.Component {
  value = new Var(
    `connect
  :: (Foldable f, Functor g, Functor f)
  => (a -> Path)
  -> (a -> f a)
  -> (b -> Path)
  -> ((b -> c) :~> (g b -> (K [a] * g) c))
  -> a -> b -> c
connect p0 l0 p1 l1 a = go 0
  where m = mapping p0 l0 a
        x = "connect"
        go n b = let ann = [] \`fromMaybe\` lookup (p1 b) m
                  in modifyP l1 (P (K ann) . fmap go) b`
  )

  syntax = ((): PrimaryRule[] => {
    const { keywordC, symbolC, literalC, ctorC } = Styles.get(Arctic)

    return [
      {
        regexp: /(".*"|'.*'|\b[0-9]+\b)/g,
        apply: s => <span className={cx(literalC)}>{s}</span>
      },
      {
        regexp: /\b(let|in|where)\b/g,
        apply: s => <span className={cx(keywordC)}>{s}</span>
      },
      {
        regexp: /\b([A-Z][a-zA-Z0-9_']*\b)/g,
        apply: s => <span className={cx(ctorC)}>{s}</span>
      },
      {
        regexp: /(`[a-zA-Z0-9_']+`)/g,
        apply: s => <span className={cx(symbolC)}>{s}</span>
      },
      {
        regexp: /[-~>():{}[\]=,.]/g,
        apply: s => <span className={cx(symbolC)}>{s}</span>
      }
    ]
  })()

  render(): React.ReactNode {
    return (
      <Panel
        palette={Contrast}
        elevate
        style={{ minHeight: px(240), maxHeight: px(320), overflowY: 'auto' }}
      >
        <Use value={this.value}>
          {v => (
            <Input
              multiline
              mono
              value={this.value}
              placeholder="code"
              Primary={Highlight(v, this.syntax)}
            />
          )}
        </Use>
      </Panel>
    )
  }
}

const Styles = memo1((p: Palette) => {
  const keywordC = style({ color: p.Blue.toString() })
  const symbolC = style({ color: p.Yellow.toString() })
  const literalC = style({ color: p.Orange.toString() })
  const ctorC = style({ color: 'white' })
  return { keywordC, symbolC, literalC, ctorC }
})
