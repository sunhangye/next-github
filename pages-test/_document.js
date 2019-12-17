import Document, { Html, Head, Main, NextScript} from 'next/document'
import { ServerStyleSheet } from 'styled-components'

function withLog(Comp) {
  return (props) => {
    // console.log(props)
    /**
     * Component
     * router
     * pageProps: {name: ''}
     */
    return <Comp {...props} />
    
  }
}

class MyDocument extends Document {

  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage
    try {
      // 劫持原本的renderPage函数并重写
      ctx.renderPage = () => originalRenderPage({
        // 根文件 把style挂载到APP
        enhanceApp: App => props => sheet.collectStyles(<App {...props} />),
        //enhanceComponent: Component => withLog(Component)
      })
      // 如果重写了getInitialProps 就要把这段逻辑重新实现
      const initialProps = await Document.getInitialProps(ctx)

      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        )
      }
    } finally {
      sheet.seal()
    }
    
  }

  render() {
    return (
      <Html>
        <Head>
          <style>{`.test { color: red }`}</style>
        </Head>
        <body className="test">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument