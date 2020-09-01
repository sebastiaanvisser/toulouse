import { List } from 'immutable'
import * as React from 'react'
import { Box } from '../box/Box'
import { Small } from '../box/Small'
import { Theme } from '../box/Themed'
import { Unit } from '../box/Unit'
import { Attach } from '../dyn/Attach'
import { Highlight, HighlightRule } from '../dyn/Highlight'
import { Icons } from '../icon/Icons'
import { Use, useValue, useVar, Var } from '../lib/Var'
import { px } from '../styling/Classy'
import {
  Black,
  Blue,
  Bright,
  Fg,
  Green,
  Orange,
  Primary,
  Red,
  Shade,
  Yellow
} from '../styling/Color'
import { Balloon } from '../widget/Balloon'
import { Icon } from '../widget/Icon'
import { Input, InputProps } from '../widget/Input'
import { Label, Inline } from '../widget/Label'
import { Panel } from '../widget/Panel'
import { Spinner } from '../widget/Spinner'
import { Tag } from '../widget/Tag'
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
      <Demo4 />
      <Demo5 />
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
    <Theme lava>
      <Small>
        <Balloon
          position="top"
          open={Var.lift2(focus, value, (f, v) => f && v.length < 3)}
        >
          <Label>Required</Label>
        </Balloon>
      </Small>
    </Theme>
  )

  return (
    <Box h spaced grow onMouseDown={() => focus.set(true)}>
      <Panel button shadow border>
        <Icon icon={Icons.Target} />
      </Panel>
      <Panel sep grow round v elevate outline={hasFocus}>
        <Box h>
          <Icon fg={Blue} icon={Icons.Search} />
          <Input mono={mono} value={value} placeholder="Search" focus={focus} />
          <Attach attachment={balloon}>
            <Box>
              <Use value={focus}>
                {focus => (
                  <Spinner
                    speed={focus ? 500 : 1500}
                    fg={focus ? Blue : Black.lighten(0.8)}
                  />
                )}
              </Use>
            </Box>
          </Attach>
        </Box>
      </Panel>
    </Box>
  )
}

// ----------------------------------------------------------------------------

export function Demo2(props: { mono?: boolean }) {
  const { mono } = props
  const value = useVar(lorem(5))
  const focus = useVar(false)
  const hasFocus = useValue(focus)

  return (
    <Panel grow v onMouseDown={() => focus.set(true)} elevate outline={hasFocus}>
      <Box sep grow v>
        <Box h pad>
          <Label fg={Bright} smallcaps bold>
            Multi line
          </Label>
        </Box>
        <Box pad grow>
          <Input mono={mono} multiline value={value} focus={focus} />
        </Box>
      </Box>
      <Theme desert>
        <Box bg pad>
          <Use value={value}>{v => <Label>Character count: {v.length}</Label>}</Use>
        </Box>
      </Theme>
    </Panel>
  )
}

// ----------------------------------------------------------------------------

export function Demo4Line(
  props: {
    label: string

    focus: Var<boolean>
    validate?: (s: string) => boolean
  } & Omit<InputProps, 'value'>
) {
  const { label, focus, validate = (_v: string) => true, ...rest } = props

  const value = useVar('')
  const hasFocus = useValue(focus)
  const v = useValue(value)

  const helpBalloon = () => {
    return (
      <Small>
        <Balloon bias={1} position="bottom" behavior="hover" width={120}>
          <Label>E-mail address must be an e-mail address</Label>
        </Balloon>
      </Small>
    )
  }

  return (
    <Box grow bg={hasFocus ? Shade : undefined} onMouseDown={() => focus.set(true)}>
      <Box h>
        <Icon
          fg={hasFocus ? Primary : Fg.alpha(0.1)}
          icon={hasFocus ? Icons.CaretRight : Icons.Dot}
        />
        <Label width={80} fg={hasFocus ? Bright : Fg}>
          <b>{label}</b>
        </Label>
        <Input value={value} focus={focus} {...rest} />
        <Box spaced h>
          {!validate(v) &&
            (hasFocus ? (
              <Theme lava>
                <Attach attachment={helpBalloon}>
                  <Tag margin>
                    <Label>Invalid</Label>
                  </Tag>
                </Attach>
              </Theme>
            ) : (
              <Icon icon={Icons.Email} fg={Red} />
            ))}
          {v.length > 0 && (
            <Tag margin button onClick={() => value.set('')}>
              <Icon fg={Red} icon={Icons.Cross} />
            </Tag>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export function Demo4() {
  const focus = new Var(List([false, false, false, false]))
  // const f = useValue(focus.map(f => f.some(v => v))) TODO: using this instead of Use breaks :(
  return (
    <Use value={focus.map(f => f.some(v => v))}>
      {anyFocus => (
        <Box>
          <Panel v sep elevate tabIndex={0} outline={anyFocus}>
            <Demo4Line
              focus={focus.at(0)}
              label="E-mail"
              validate={v => !!v.match(/^.+@.+\..+$/)}
            />
            <Demo4Line focus={focus.at(1)} label="Username" />
            <Demo4Line focus={focus.at(2)} label="Password" />
            <Demo4Line focus={focus.at(3)} label="Note" multiline />
            <Demo3 focus={focus.at(4)} />
          </Panel>
        </Box>
      )}
    </Use>
  )
}

// ----------------------------------------------------------------------------

export class Demo5 extends React.PureComponent {
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
    return (
      <Theme contrast>
        <Panel
          v
          sep
          elevate
          tabIndex={0}
          //focus={this.focus}
        >
          <Box h>
            <Icon fg={Green} icon={Icons.ChevronRight} />
            <Input
              mono
              multiline
              value={this.value}
              placeholder="code"
              focus={this.focus}
              selection={this.sel}
            />
            <Attach attachment={this.balloon}>
              <Box button className="foo123" onClick={this.click}>
                <Icon fg={Yellow} icon={Icons.TextInput} />
              </Box>
            </Attach>
          </Box>
        </Panel>
      </Theme>
    )
  }

  click = () => this.sel.set({ start: 0, end: this.value.get().length })

  balloon = () => {
    return (
      <Use value={this.sel}>
        {({ start, end }) => (
          <Theme night>
            <Small>
              <Balloon position="top" open={this.focus}>
                <Label>
                  Selection: {start},{end}
                </Label>
              </Balloon>
            </Small>
          </Theme>
        )}
      </Use>
    )
  }
}

// ----------------------------------------------------------------------------

export function Demo3(props: { focus: Var<boolean> }) {
  const { focus } = props
  const hasFocus = useValue(focus)

  const value = useVar(
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

  const curValue = useValue(value)

  const syntax: HighlightRule[] = [
    {
      regexp: /(".*"|'.*'|\b[0-9]+\b)/g,
      apply: s => <Inline fg={Orange}>{s}</Inline>
    },
    {
      regexp: /\b(let|in|where)\b/g,
      apply: s => <Inline fg={Blue}>{s}</Inline>
    },
    {
      regexp: /\b([A-Z][a-zA-Z0-9_']*\b)/g,
      apply: s => <Inline fg={Bright}>{s}</Inline>
    },
    {
      regexp: /(`[a-zA-Z0-9_']+`)/g,
      apply: s => <Inline fg={Primary}>{s}</Inline>
    },
    {
      regexp: /[-~>():{}[\]=,.]/g,
      apply: s => <Inline fg={Primary}>{s}</Inline>
    }
  ]

  return (
    <Theme contrast>
      <Box
        h
        bg
        clip
        onMouseDown={() => focus.set(true)}
        elevate
        style={{ maxHeight: px(320), overflowY: 'auto' }}
      >
        {hasFocus ? (
          <Icon fg={Primary} icon={Icons.CaretRight} />
        ) : (
          <Icon fg={Fg.alpha(0.1)} icon={Icons.Dot} />
        )}
        <Label width={80}>
          <b>Code</b>
        </Label>
        <Input
          multiline
          mono
          focus={focus}
          value={value}
          placeholder="code"
          highlight={Highlight(curValue, syntax)}
        />
      </Box>
    </Theme>
  )
}
