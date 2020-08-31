import * as React from 'react'
import { ReactNode } from 'react'

export interface HighlightRule {
  regexp: RegExp
  apply: (match: string) => ReactNode
  max?: number
}

// ----------------------------------------------------------------------------

export function Highlight(input: string, rules: HighlightRule[]): ReactNode {
  let out: ReactNode[] = [input]

  rules.forEach(({ regexp, apply, max }) => {
    out = out.flatMap(frag => {
      if (typeof frag === 'string')
        return fragment(frag, regexp, max).map(m =>
          'left' in m ? m.left : apply(m.right)
        )
      return [frag]
    })
  })

  return out.map((f, i) => <React.Fragment key={i}>{f}</React.Fragment>)
}

type Left<A> = { left: A }
type Right<B> = { right: B }
type Either<A, B> = Left<A> | Right<B>

function fragment(
  input: string,
  regexp: RegExp,
  max: number = Infinity
): Either<string, string>[] {
  let m: RegExpExecArray | null
  let out: Either<string, string>[] = []
  let p = 0
  while ((m = regexp.exec(input)) && out.length < max) {
    if (p !== m.index) out.push({ left: input.slice(p, m.index) })
    out.push({ right: m[0] })
    p = m.index + m[0].length
  }
  if (p < input.length) out.push({ left: input.slice(p) })
  return out
}
