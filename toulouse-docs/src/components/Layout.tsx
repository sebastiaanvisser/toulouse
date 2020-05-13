import Head from 'next/head'
import React, { ReactNode } from 'react'

type Props = {
  title: string
  stylesheet?: string
  children?: ReactNode
}

export function Layout(props: Props) {
  const { title, stylesheet, children } = props
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <style>{stylesheet}</style>
      </Head>
      {children}
    </>
  )
}
