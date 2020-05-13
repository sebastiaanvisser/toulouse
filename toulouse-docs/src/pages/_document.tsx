import Document, {
  DocumentContext,
  DocumentProps,
  Head,
  Main,
  NextScript
} from 'next/document'
import { CssInstalled, serverSideRenderCss } from 'toulouse/styling'

interface Props extends DocumentProps {
  cssInstalled: CssInstalled
  css: string
}

export default class MyDocument extends Document<Props> {
  static async getInitialProps({ renderPage }: DocumentContext) {
    console.log('getInitialProps')
    const page = renderPage()
    const { cssInstalled, css } = serverSideRenderCss()
    return { ...page, cssInstalled, css }
  }

  constructor(props: Props) {
    super(props)
    props.__NEXT_DATA__.props.cssInstalled = props.cssInstalled
  }

  render() {
    const css = (this.props as any).css
    return (
      <html>
        <Head>
          <style id="static" dangerouslySetInnerHTML={{ __html: css }} />
        </Head>
        <body>
          <div style={{ wordBreak: 'break-all' }}>
            {JSON.stringify(this.props.__NEXT_DATA__.page)}
          </div>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
