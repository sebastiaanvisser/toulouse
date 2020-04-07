import { useState } from 'react'
import React from 'react'

export function Counter() {
  const [count, setCount] = useState()

  return <div onClick={() => setCount(count + 1)}>{count}</div>
}
