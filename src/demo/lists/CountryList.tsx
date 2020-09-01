import { Set } from 'immutable'
import React, { Fragment, useEffect } from 'react'
import { Box, BoxProps } from '../../box/Box'
import { Small } from '../../box/Small'
import { Theme } from '../../box/Themed'
import { Unit } from '../../box/Unit'
import { Attach } from '../../dyn/Attach'
import { Icons } from '../../icon/Icons'
import { groupOn, sortOn } from '../../lib/Grouping'
import { Use, useStoredVar, useValue, useVar, Var } from '../../lib/Var'
import { cx, px } from '../../styling/Classy'
import { Primary, Red, Shade } from '../../styling/Color'
import { Night } from '../../styling/Palette'
import { style } from '../../styling/Rule'
import { Balloon } from '../../widget/Balloon'
import { Icon } from '../../widget/Icon'
import { Input } from '../../widget/Input'
import { Label } from '../../widget/Label'
import { Listbox } from '../../widget/Listbox'
import { Checkbox } from '../../widget/Options'
import { Panel } from '../../widget/Panel'
import { ShortcutString } from '../../widget/ShortcutString'
import { Tag } from '../../widget/Tag'
import { Country, fetchCountries } from '../data/World'

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const mapMaybe = <A, B>(xs: A[], f: (a: A) => B | undefined): B[] =>
  xs.map(f).filter((v): v is B => v !== undefined)

export function CountryList() {
  const countries = useVar<Country[]>([])
  const error = useVar(false)

  const needle = useVar('')
  const focus = useVar(false)
  const open = useVar(false)
  const brief = useStoredVar('tk-demo.lists.brief', false)
  const selection = useVar(Set<string>())
  const regions = useVar(Set<string>())
  const hasFocus = useValue(focus)

  const fetch = () => {
    fetchCountries()
      .then(v => {
        countries.set(v)
        error.set(false)
      })
      .catch(() => error.set(true))
  }

  // eslint-disable-next-line
  useEffect(() => void fetch(), [])

  const filtered = Var.lift3(
    countries,
    regions,
    needle, //
    (countries, regions, needle) =>
      countries.filter(country => {
        if (regions.size && !country.regions.some(r => regions.has(r))) return false
        return !needle.length || country.name.match(new RegExp(escapeRegExp(needle), 'i'))
      })
  )

  const renderInput = () => {
    return (
      <Box h>
        <Icon icon={Icons.Search} />
        <Input multiline value={needle} focus={focus} />
        <Use value={countries}>
          {items => (
            <ContinentPicker
              countries={items}
              selected={regions}
              placeholder="Continent"
              open={open}
            />
          )}
        </Use>
      </Box>
    )
  }

  const renderFooter = () => {
    return (
      <Box h pad={5} spread>
        <Checkbox checked={brief}>Brief</Checkbox>
        <Use value={filtered}>
          {items => (
            <Tag margin h>
              <Icon fg={items.length > 0 ? Primary : Red} icon={Icons.Rows} />
              <Label fg={items.length > 0 ? Primary : Red}>
                {items.length} of {countries.get().length}
              </Label>
            </Tag>
          )}
        </Use>
      </Box>
    )
  }

  const renderListbox = () => {
    return (
      <Use value={filtered}>
        {items => (
          <Use value={brief}>
            {brief => (
              <Listbox<Country, string>
                multi
                required={false}
                items={items}
                selection={selection}
                renderItem={renderItem}
                identify={a => a.name}
                rowHeight={brief ? rowBrief : rowFull}
                overflow={200}
                pad={5}
                grow
              />
            )}
          </Use>
        )}
      </Use>
    )
  }

  const rowBrief = () => 40
  const rowFull = () => 100

  const editors = (selection: Set<string>) => {
    const cs = countries.get()
    const selected = mapMaybe(selection.toArray(), name => cs.find(c => c.name === name))
    return selected.map(country => <Editor key={country.name} country={country} />)
  }

  const renderItem = (
    country: Country,
    props: BoxProps,
    sel: boolean,
    _ix: number,
    mode: 'full' | 'shallow'
  ) => (
    <Box {...props} fg blunt={!sel} pad={5}>
      <Use value={brief}>
        {brief => (
          <>
            <Box h>
              <Label grow>
                <b>{country.name}</b>
                {brief && ' — ' + country.capitals.map(c => c.name).join(', ')}
              </Label>
              {mode === 'full' && (
                <Tag border margin>
                  <Label smallcaps>{country.capitals.length}</Label>
                </Tag>
              )}
            </Box>
            {brief || (
              <>
                <Label>{country.capitals.map(c => c.name).join(', ')}</Label>
                <Label>{country.regions.join(', ')}</Label>
              </>
            )}
          </>
        )}
      </Use>
    </Box>
  )

  return (
    <Box h spaced>
      <Box v>
        <Use value={error}>
          {err =>
            err ? (
              <Panel
                v
                elevate
                tabIndex={0}
                width={Unit * 12}
                height={Unit * 20}
                outline={true}
                middle
                center
              >
                <Icon icon={Icons.Warning} zoom={2} fg={Red} />
                Error fetching country list.
                <Small>
                  <Panel bg={Shade} h button onClick={fetch}>
                    <Icon icon={Icons.Reload} />
                    Retry
                  </Panel>
                </Small>
              </Panel>
            ) : (
              <Panel
                v
                elevate
                outline={hasFocus}
                width={Unit * 12}
                height={Unit * 20}
                sep
              >
                {renderInput()}
                {renderListbox()}
                {renderFooter()}
              </Panel>
            )
          }
        </Use>
      </Box>
      <Box v spaced>
        <Use value={selection}>{editors}</Use>
      </Box>
    </Box>
  )
}

// ----------------------------------------------------------------------------

interface EditorProps {
  country: Country
}

function Editor(props: EditorProps) {
  const { country } = props
  const focus = useVar(false)
  const hasFocus = useValue(focus)

  const value = (key: string, values: React.ReactNode[]) => {
    return (
      <Box h key={key} sep>
        <Label width={Unit * 4}>
          <b>{key}</b>
        </Label>
        <Box v grow>
          {values.map(value => (
            <Box h>{value}</Box>
          ))}
        </Box>
      </Box>
    )
  }

  return (
    <Panel key={country.name} v elevate width={Unit * 15} outline={hasFocus} tabIndex={0}>
      <Use value={focus}>
        {focus => (
          <Theme primary={focus}>
            <Box bg={Shade}>
              <Label>
                <b>{country.name}</b>
              </Label>
            </Box>
          </Theme>
        )}
      </Use>

      <Box v grow sep>
        {value(
          'Captial',
          country.capitals.map(c => (
            <Fragment key={c.name}>
              <Label grow>{c.name}</Label>
              <Theme primary={hasFocus}>
                <Tag bg={Shade} margin shadow={hasFocus}>
                  {c.role}
                </Tag>
              </Theme>
            </Fragment>
          ))
        )}
        {value('Region', country.regions)}
      </Box>
    </Panel>
  )
}

// ----------------------------------------------------------------------------

interface ContinentPickerProps {
  countries: Country[]
  selected: Var<Set<string>>
  placeholder: string
  open: Var<boolean>
}

type Group = {
  region: string
  countries: Country[]
}

function ContinentPicker(props: ContinentPickerProps) {
  const { placeholder, selected } = props

  const identify = (g: Group) => g.region

  const renderItem = (g: Group, props: BoxProps) => (
    <Box {...props} h>
      <Label grow>{g.region}</Label>
      <Label subtle>{g.countries.length}</Label>
    </Box>
  )

  const pick = () => {
    const { open, selected, countries } = props

    const byRegion = countries.flatMap(c =>
      c.regions.map(r => ({ region: r, country: c }))
    )
    const sorted = groupOn(
      sortOn(byRegion, g => g.region),
      g => g.region
    )
    const grouped = sorted.map(xs => ({
      region: xs[0].region,
      countries: xs.map(x => x.country)
    }))

    return (
      <Theme ocean>
        <Balloon
          v
          position="right"
          bias={-1}
          behavior="click"
          open={open}
          pad={5}
          width={Unit * 7}
        >
          <Panel>
            <Listbox<Group, string>
              multi
              required={false}
              items={grouped}
              selection={selected}
              renderItem={renderItem}
              identify={identify}
              rowHeight={() => Unit}
            />
          </Panel>
        </Balloon>
      </Theme>
    )
  }

  return (
    <Use value={selected.map(s => s.toArray())}>
      {cur => (
        <Theme palette={cur.length > 0 ? Night : undefined}>
          <Attach attachment={pick}>
            <Tag
              bg={Shade}
              margin
              button
              shrink
              className={cx(style({ maxWidth: px(150) }))}
            >
              <Icon icon={Icons.Globe1} />
              <ShortcutString char="C" event={() => props.open.toggle()}>
                {cur.length > 0 ? cur.join(', ') : placeholder}
              </ShortcutString>
              <Icon icon={Icons.Ellipses} />
            </Tag>
          </Attach>
        </Theme>
      )}
    </Use>
  )
}
