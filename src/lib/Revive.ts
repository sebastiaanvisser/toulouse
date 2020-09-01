import { List } from 'immutable'

export type Revive<A> = (json: /* possibly */ any) => A

export function reviveList<A>(reviveA: Revive<A>): Revive<List<A>> {
  return json => List(((json as unknown) as A[]).map(reviveA))
}

export function reviveRecord<A>(reviveA: Revive<A>): Revive<Record<string, A>> {
  return json => {
    const out: Record<string, A> = {}
    for (let prop in json) out[prop] = reviveA(json[prop])
    return out
  }
}

export function reviveMaybe<A>(reviveA: Revive<A>): Revive<A | undefined> {
  return json => {
    return json === null || json === undefined ? undefined : reviveA(json)
  }
}
