import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { Box } from 'toulouse/box'
import { ArrowRight, Terminal } from 'toulouse/icon'
import { Arctic, className, Fg, Green, Lava, Ocean, Yellow } from 'toulouse/styling'
import { Img, Label } from 'toulouse/widget'

const IndexPage = () => {
  const [a, setA] = useState(true)
  const [b, setB] = useState(true)
  return (
    <>
      <Head>
        <title>Hoi0åªßº∂ª</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Link href="/split">
        <a>SPLIT</a>
      </Link>
      <Box v spaced>
        <Box
          bg
          button
          onClick={() => setA(!a)}
          palette={a ? Ocean : Lava}
          margin
          h
          width={200}
          blunt
          shadow
        >
          <Img fg={Yellow} img={Terminal} />
          <Label grow>Open Terminal</Label>
          <Img fg={Fg.alpha(0.3)} img={ArrowRight} />
        </Box>
        <Box
          bg
          button
          onClick={() => setB(!b)}
          palette={b ? Ocean : Arctic}
          margin
          h
          width={200}
          blunt
          border
          inset
        >
          <Img fg={Green} img={Terminal} />
          <Label grow>Open Terminal</Label>
          <Img fg={Fg.alpha(0.3)} img={ArrowRight} />
        </Box>
      </Box>
    </>
  )
}

export default IndexPage

const mainC = className('main', {
  background: 'green',
  outline: 'solid 4px purple'
})

const subC = className('sub', {
  background: 'red',
  outline: 'solid 4px purple'
})

mainC.or(subC).style({
  outline: 'solid 4px purple'
})
