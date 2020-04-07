import React, { ReactElement } from 'react'
import * as ReactDOM from 'react-dom'
import { Explore } from './explore'
import { Tk } from './tk-demo/Demo'
import { Tabular } from './explore/tabular'
import { Documentation } from './docs'
import { SplitTest } from './docs/SplitTest'

const path = window.location.pathname.split('/').filter(v => v.length > 0)

const routes: Record<string, ReactElement> = {
  tk: <Tk />,
  table: <Tabular />,
  explore: <Explore />,
  doc: <Documentation />,
  split: <SplitTest />
}

const route = routes[path[0]] || <Tk />
const container = document.getElementById('container')
ReactDOM.render(route, container)
