import React, { ReactNode } from 'react'
import { useEffect } from 'react'
import { Var } from '../lib/Var'
import { Keyframes } from './Keyframes'
import { Rule } from './Rule'

// --------------------------------------------------------------------------------

export type InstallLog = { [hash: number]: true }

export interface CssRegister {
  installed: InstallLog
  global: Rule[]
  scoped: Rule[]
  keyframes: Keyframes[]
}

export const CssRegister: CssRegister = {
  installed: {},
  global: [],
  scoped: [],
  keyframes: []
}

export function collectGlobal(rule: Rule) {
  CssRegister.global.push(rule)
  eventuallyInstallInBrowser()
}

export function collectScoped(rule: Rule) {
  CssRegister.scoped.push(rule)
  eventuallyInstallInBrowser()
}

export function collectKeyframes(kfs: Keyframes) {
  CssRegister.keyframes.push(kfs)
  eventuallyInstallInBrowser()
}

// --------------------------------------------------------------------------------

export interface ServerSideRendered {
  installed: InstallLog
  styleTags: ReactNode[]
}

export function serverSideRenderCss(path: string): ServerSideRendered {
  // Pick only the style tags that are used
  const global = CssRegister.global.filter(r => r.selector.used())
  const scoped = CssRegister.scoped.filter(r => r.selector.used())
  const keyframes = CssRegister.keyframes.filter(r => r.used())

  global.forEach(r => r.selector.unuse())
  scoped.forEach(r => r.selector.unuse())

  console.log(
    '[Css.serverSideRenderCss]',
    `path=${path}`,
    `global=${global.length}`,
    `scoped=${scoped.length}`,
    `keyframes=${keyframes.length}`
  )

  // console.log(path, '=================================================================')
  // Object.values(scoped)
  //   .map(scoped => scoped.selector.print())
  //   .filter(s => s.match(/sep/))
  //   .sort()
  //   .forEach(r => console.log('INSTALL', path, r))
  // console.log(path, '-----------------------------------------------------------------')

  // Log all installed rules and keyframes, for client-side reuse
  const installed: InstallLog = {}
  global.forEach(r => (installed[r.hash] = true))
  scoped.forEach(r => (installed[r.hash] = true))
  keyframes.forEach(r => (installed[r.hash] = true))

  // Render to CSS
  const globalCss = printStylesheet(global)
  const scopedCss = printStylesheet(scoped)
  const keyframesCss = printKeyframes(keyframes)

  // CssRegister.scoped = []
  // CssRegister.global = []
  // CssRegister.keyframes = []

  // Render as style tags
  const styleTags: ReactNode[] = []

  if (globalCss)
    styleTags.push(
      <style
        key="global"
        type="text/css"
        data-server-generated={true}
        data-global
        data-page={path}
        dangerouslySetInnerHTML={{ __html: globalCss }}
      />
    )

  if (scopedCss)
    styleTags.push(
      <style
        key="scoped"
        type="text/css"
        data-server-generated={true}
        data-scoped
        data-page={path}
        dangerouslySetInnerHTML={{ __html: scopedCss }}
      />
    )

  if (keyframesCss)
    styleTags.push(
      <style
        key="keyframes"
        type="text/css"
        data-server-generated={true}
        data-keyframes
        data-page={path}
        dangerouslySetInnerHTML={{ __html: keyframesCss }}
      />
    )

  return {
    installed,
    styleTags
  }
}

// --------------------------------------------------------------------------------

function clientSetup() {
  ;(window as any).CssRegister = CssRegister

  const nextData = (window as any).__NEXT_DATA__
  const log = nextData?.props.installed
  CssRegister.installed = log ?? {}
  console.log(`Using prerendered CSS: ${Object.keys(CssRegister.installed).length} rules`)
}

if (typeof window !== 'undefined') {
  clientSetup()
}

export function useNextJsPageTransition() {
  const fixGlobalCss = () => {
    const path = document.location.pathname.toString()
    const els = document.getElementsByTagName('style')
    for (let el of els as HTMLCollectionOf<HTMLStyleElement>) {
      const type =
        el.getAttribute('data-global') && el.getAttribute('data-page') !== path
          ? 'disbaled-text/css'
          : 'text/css'
      el.setAttribute('type', type)
    }
  }
  useEffect(fixGlobalCss, [])
}

const InstallTrigger = new Var(0)

export const useCssInstalled = (callback: (count: number) => void) =>
  useEffect(() => InstallTrigger.effect(callback), [])

let frameId = -1
export function eventuallyInstallInBrowser() {
  if (typeof window !== 'undefined') {
    // installStyleSheetInClient()
    cancelAnimationFrame(frameId)
    frameId = window.requestAnimationFrame(installStyleSheetInClient)
  }
}

export function installStyleSheetInClient() {
  const eligble = (r: Rule | Keyframes) => !CssRegister.installed[r.hash] && r.used()

  const global = CssRegister.global.filter(eligble)
  const scoped = CssRegister.scoped.filter(eligble)
  const frames = CssRegister.keyframes.filter(eligble)

  if (global.length === 0 && scoped.length === 0 && frames.length === 0) return

  const timer = `installing CSS global=${global.length} scoped=${scoped.length} keyframes=${frames.length}`
  console.time(timer)

  const install = (css: string, type: string) => {
    if (!css) return
    const head = document.head || document.getElementsByTagName('head')[0]
    const styleTag = document.createElement('style')
    styleTag.type = 'text/css'
    styleTag.setAttribute('data-page', document.location.pathname.toString())
    styleTag.setAttribute('data-client-installed', 'true')
    styleTag.setAttribute(`data-${type}`, 'true')
    styleTag.appendChild(document.createTextNode(css))
    head.appendChild(styleTag)
  }

  install(printStylesheet(global), 'global')
  install(printStylesheet(scoped), 'scoped')
  install(printKeyframes(frames), 'keyframe')

  global.forEach(r => (CssRegister.installed[r.hash] = true))
  scoped.forEach(r => (CssRegister.installed[r.hash] = true))
  frames.forEach(r => (CssRegister.installed[r.hash] = true))

  // CssRegister.global = []
  // CssRegister.scoped = []
  // CssRegister.keyframes = []

  console.timeEnd(timer)

  InstallTrigger.modify(c => c + 1)
}

// ----------------------------------------------------------------------------
// Printing to CSS

const printStylesheet = (sheet: Rule[]) =>
  sheet
    .map(r => r.print())
    .filter((a): a is string => !!a)
    .join('\n\n')

const printKeyframes = (keyframes: Keyframes[]) =>
  keyframes
    .map(r => r.print())
    .filter((a): a is string => !!a)
    .join('\n\n')
