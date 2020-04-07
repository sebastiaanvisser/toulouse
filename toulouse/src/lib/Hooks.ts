import isEqual from 'lodash.isequal'
import { DependencyList, MutableRefObject, Ref, useEffect, useRef, useState } from 'react'

// ----------------------------------------------------------------------------
// Events

export function useEvent<E extends HTMLElement, K extends keyof HTMLElementEventMap>(
  el: E | undefined,
  type: K,
  listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  cond?: boolean,
  deps: DependencyList = [],
  options?: boolean | AddEventListenerOptions
): void {
  useEffect(() => {
    if (el && cond !== false) {
      el.addEventListener(type, listener, options)
      return () => el.removeEventListener(type, listener)
    }
  }, deps)
}

export function useDocumentEvent<K extends keyof DocumentEventMap>(
  type: K,
  listener: (this: Document, ev: DocumentEventMap[K]) => any,
  deps: DependencyList | undefined,
  cond?: boolean,
  options?: boolean | AddEventListenerOptions
) {
  useEffect(() => {
    if (cond !== false) {
      document.addEventListener(type, listener, options)
      return () => document.removeEventListener(type, listener)
    }
  }, deps)
}

export function useWindowEvent<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  cond?: boolean,
  deps: DependencyList = [],
  options?: boolean | AddEventListenerOptions
) {
  useEffect(() => {
    if (cond !== false) {
      window.addEventListener(type, listener, options)
      return () => window.removeEventListener(type, listener)
    }
  }, deps)
}

// ----------------------------------------------------------------------------
// State

export function useStateDeepEquals<A>(initial: A, eq = isEqual): [A, (a: A) => void] {
  const [get, set_] = useState(initial)
  const set = (a: A) => {
    if (!eq(get, a)) set_(a)
  }
  return [get, set]
}

export function useControlled<A>(
  get: A | undefined,
  set: ((a: A) => void) | undefined,
  def: A
): [A, (a: A) => void] {
  const [get_, set_] = useState(def)
  return [get ?? get_, set ?? set_]
}

// ----------------------------------------------------------------------------
// Refs

export function useForwardedRef<A>(fw: Ref<A>, init: A) {
  const ref = useRef<A>(init)

  useEffect(() => {
    if (!fw) return

    if (typeof fw === 'function') {
      fw(ref.current)
    } else {
      const mut = fw as MutableRefObject<A>
      mut.current = ref.current
    }
  }, [fw])

  return ref
}

// ----------------------------------------------------------------------------
// Debounce

export function useDebounce(
  handler: () => void,
  timeout = 0,
  reuseRef?: MutableRefObject<number>
): [() => void, MutableRefObject<number>] {
  const ref = reuseRef || useRef<number>(-1)
  return [
    () => {
      window.clearTimeout(ref.current)
      ref.current = window.setTimeout(handler, timeout)
    },
    ref
  ]
}
