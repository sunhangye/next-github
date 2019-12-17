/**
 * 重写 App 组件
 */

import App, { Container } from 'next/app'
import { Provider } from 'react-redux'
import 'antd/dist/antd.css'
import WithRedux from '../lib/with-redux'

import MyContext from '../lib/my-context'

class myApp extends App {
  state = {
    context: 'value',
  }
  static async getInitialProps(ctx) {
    console.log('app init');
    
    const { Component } = ctx
    let pageProps
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }
    
    
    return {
      pageProps
    }
  }
  render() {
    // reduxStore是
    const { Component, pageProps, reduxStore } = this.props
    
    return (
      <Container>
        <MyContext.Provider value={this.state.context}>
          
          <Provider store={reduxStore}>
            <Component {...pageProps}/>
            <button onClick={() => this.setState({context: `${this.state.context}111`})} >change context</button>
          </Provider>
        </MyContext.Provider>
      </Container>
    )
  }
}

export default WithRedux(myApp)