import { useEffect } from 'react'
import { Var } from '../lib/Var'
import { Rule } from './Selector'

// --------------------------------------------------------------------------------

export interface Collectable {
  id: number | undefined
  used: boolean
  scoped: boolean
  print(): string | undefined
}

export interface InstallLog {
  counter: number
  server: number
}

export interface CssRegister {
  config: { enableSSR: boolean }
  collected: Collectable[]
  log: InstallLog
}

export const CssRegister: CssRegister = {
  config: { enableSSR: true },
  collected: [],
  log: {
    counter: 0,
    server: 0
  }
}

export function collect(rule: Collectable) {
  CssRegister.collected.push(rule)
  if (typeof window !== 'undefined') eventuallyInstallInBrowser()
}

// --------------------------------------------------------------------------------

export function serverSideRenderCss(
  path: string
): {
  global?: string
  scoped?: string
  log?: InstallLog
} {
  if (!CssRegister.config.enableSSR) return {}

  const { collected, log } = CssRegister

  const globalRules = collected.filter(r => !r.scoped && r.used)
  const scopedRules = collected.filter(r => r.scoped && r.used)

  const global = printStylesheet(globalRules)
  const scoped = printStylesheet(scopedRules)
  log.server = collected.length

  console.log(
    '[Css.serverSideRenderCss]',
    `path=${path}`,
    `collected=${collected.length}`,
    `global=${globalRules.length}`,
    `scoped=${scopedRules.length}`,
    `counter=${CssRegister.log.counter}`
  )

  // Clear all usage IDs to indicate we're about to start a new round of
  // collecting and using rules.
  collected.forEach(r => (r.id = undefined))
  CssRegister.log.counter = 0

  return { scoped, global, log }
}

// --------------------------------------------------------------------------------

function clientSetup() {
  const nextData = (window as any).__NEXT_DATA__
  const log = nextData?.props.log as InstallLog | undefined
  if (log) {
    const { server, counter } = log
    CssRegister.log = { counter: 0, server }
    console.log(`Using prerendered CSS: ${counter} class names, ${server} rules`)
  }
}

if (typeof window !== 'undefined') {
  ;(window as any).CssRegister = CssRegister
  clientSetup()
}

export function useNextJsPageTransition() {
  const fixCSs = () => {
    const els = document.getElementsByTagName('style')
    for (let el of els as HTMLCollectionOf<HTMLStyleElement>) {
      const type =
        el.getAttribute('data-global') &&
        el.getAttribute('data-page') !== document.location.pathname.toString()
          ? 'disbaled-text/css'
          : 'text/css'
      el.setAttribute('type', type)
    }
  }
  useEffect(() => {
    fixCSs()
    return fixCSs
  }, [])
}

const InstallTrigger = new Var(0)

export const useCssInstalled = (callback: (count: number) => void) =>
  useEffect(() => InstallTrigger.debounce().effect(callback), [])

export const useGlobalStyle = (rule: Rule) => {
  rule.use()
}

let frameId = -1
function eventuallyInstallInBrowser() {
  cancelAnimationFrame(frameId)
  frameId = window.requestAnimationFrame(installStyleSheetInClient)
}

function installStyleSheetInClient() {
  const { collected } = CssRegister
  const index = InstallTrigger.get()

  const used = collected.filter(r => r.used)
  const unused = collected.filter(r => !r.used)
  const scoped = used.filter(r => r.scoped)
  const global = used.filter(r => !r.scoped)

  const timer = `installing ${used.length} used rule(s) and leaving ${unused.length} rule(s) untouched [${index}]`
  console.time(timer)

  const install = (rules: Collectable[], global: boolean) => {
    if (rules.length === 0) return
    const css = printStylesheet(rules)
    const head = document.head || document.getElementsByTagName('head')[0]
    const styleTag = document.createElement('style')
    styleTag.type = 'text/css'
    styleTag.setAttribute('data-page', document.location.pathname.toString())
    if (!global) styleTag.setAttribute('data-scoped', 'true')
    if (global) styleTag.setAttribute('data-global', 'true')
    styleTag.appendChild(document.createTextNode(css))
    head.appendChild(styleTag)
  }

  install(global, true)
  install(scoped, false)

  CssRegister.collected = unused

  console.timeEnd(timer)

  InstallTrigger.modify(c => c + 1)
}

// ----------------------------------------------------------------------------
// Printing to CSS

function printStylesheet(sheet: Collectable[]): string {
  const rules = sheet.flatMap(r => {
    const x = r.print()
    return x ? [x] : []
  })
  const header = `/* ${rules.length} rule${rules.length == 1 ? '' : 's'} */\n\n`
  return header + rules.join('\n\n')
}
