/**
 * 重写 App 组件
 */

import App, { Container } from 'next/app'
import { Provider } from 'react-redux'
import 'antd/dist/antd.css'
import WithRedux from '../lib/with-redux'
import Layout from '../components/Layout'
import PageLoaing from '../components/PageLoaing'
import Router from 'next/router'
import Link from 'next/link'
import axios from 'axios'

class MyApp extends App {
  state = {
    context: 'value',
    isLoading: false
  }
  showLoading =() => {
    this.setState({
      isLoading: true
    })
  }
  hideLoading =() => {
    this.setState({
      isLoading: false
    })
  }

  componentDidMount() {
    Router.events.on('routeChangeStart', this.showLoading)
    Router.events.on('routeChangeComplete', this.hideLoading)
    Router.events.on('routeChangeError', this.hideLoading)
  }
  componentWillUnmount() {
    Router.events.off('routeChangeStart', this.showLoading)
    Router.events.off('routeChangeComplete', this.hideLoading)
    Router.events.off('routeChangeError', this.hideLoading)
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
    const { Component, pageProps, reduxStore } = this.props
    
    return (
      <Container>
        <Provider store={reduxStore}>
          {this.state.isLoading && <PageLoaing />}
          <Layout>
            <Component {...pageProps}/>

                

          </Layout>
          
          
        </Provider>
      </Container>
    )
  }
}

export default WithRedux(MyApp)