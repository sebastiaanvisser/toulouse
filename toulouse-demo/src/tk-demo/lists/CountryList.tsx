import { Set } from 'immutable'
import React, { Fragment, useEffect } from 'react'
import { Box, BoxProps, Unit } from 'toulouse/box'
import { Ellipses, Globe1, Reload, Rows, Search, Warning } from 'toulouse/icon'
import { sortAndGroupOn, Use, useStoredVar, useValue, useVar, Var } from 'toulouse/lib'
import { cx, Night, Ocean, Primary, px, Red, Shade, style } from 'toulouse/styling'
import {
  Balloon,
  Checkbox,
  Img,
  Input,
  Label,
  Listbox,
  Panel,
  ShortcutString,
  Tag
} from 'toulouse/widget'
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
        <Img img={Search} />
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
      <Box h>
        <Checkbox grow checked={brief}>
          Brief
        </Checkbox>
        <Tag margin palette={Shade} h>
          <Img img={Rows} />
          <Use value={filtered}>
            {items => (
              <Label>
                {items.length} of {countries.get().length}
              </Label>
            )}
          </Use>
        </Tag>
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
                tabIndex={1}
                focus={focus}
                width={Unit * 12}
                height={Unit * 20}
                outline={true}
                middle
                center
              >
                <Img img={Warning} zoom={2} fg={Red} />
                Error fetching country list.
                <Panel h small button palette={Shade} onClick={fetch}>
                  <Img img={Reload} />
                  Retry
                </Panel>
              </Panel>
            ) : (
              <Panel
                v
                elevate
                outline={hasFocus}
                // tabIndex={0}
                focus={focus}
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
    <Panel
      key={country.name}
      v
      elevate
      width={Unit * 15}
      focus={focus}
      outline={hasFocus}
      tabIndex={0}
    >
      <Use value={focus}>
        {focus => (
          <Box bg palette={focus ? Primary : Shade}>
            <Label zoom={1}>
              <b>{country.name}</b>
            </Label>
          </Box>
        )}
      </Use>

      <Box v grow sep>
        {value(
          'Captial',
          country.capitals.map(c => (
            <Fragment key={c.name}>
              <Label grow>{c.name}</Label>
              <Tag margin shadow={hasFocus} palette={hasFocus ? Primary : Shade}>
                {c.role}
              </Tag>
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
    const sorted = sortAndGroupOn(byRegion, g => g.region)
    const grouped = sorted.map(xs => ({
      region: xs[0].region,
      countries: xs.map(x => x.country)
    }))

    return (
      <Balloon
        v
        position="right"
        bias={-1}
        behavior="click"
        palette={Ocean}
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
    )
  }

  return (
    <Use value={selected.map(s => s.toArray())}>
      {cur => (
        <Tag
          margin
          button
          shrink
          attach={pick}
          className={cx(style({ maxWidth: px(150) }))}
          palette={cur.length > 0 ? Night : Shade}
        >
          <Img img={Globe1} />
          <ShortcutString char="C" event={() => props.open.toggle()}>
            {cur.length > 0 ? cur.join(', ') : placeholder}
          </ShortcutString>
          <Img img={Ellipses} />
        </Tag>
      )}
    </Use>
  )
}
