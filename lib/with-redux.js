/**
 * 将app功能一层层剥落拆分出来写到不同的Hoc，便于后期维护
 * 将传入的形参组件处理后再次放到TestHocComp属性中return出去
 * 已知的属性直接赋值出来， 其他的通过解构也取出来放到新的TestHocComp中
 * 
 * 通过Hoc将reacy-redux集成到next,同时兼容内容其他参数注入
 */

import createStore from '../store/store.js';
import React from 'react'
const isServer = typeof window === 'undefined'
const __NEXT_REDUX_STROE__ = '__NEXT_REDUX_STROE__'

const getOrCreateStore = (initialState) => {

  if (isServer) {
    return createStore(initialState)
  }
  if (!window[__NEXT_REDUX_STROE__]) {
    window[__NEXT_REDUX_STROE__] = createStore(initialState)
  }
  return window[__NEXT_REDUX_STROE__]
}

export default (Comp) => {
  class WithReduxApp extends React.Component {
    constructor(props) {
      super(props)
      this.reduxStore = getOrCreateStore(props.initialReduxState)
    }

    render() {
      const { Component, pageProps, ...rest } = this.props

      // 当页面getInitialProps初始化增加数据
      if (pageProps) {
        pageProps.widhtReduxTest = '123'
      }

      return <Comp
                Component={ Component }
                pageProps = { pageProps}
                { ...rest }
                reduxStore = { this.reduxStore }
                />
    }
  }
  /**
   * getInitialProps执行完 里面定义的变量即销毁，return的数据会以String返回到页面上
   */
  WithReduxApp.getInitialProps = async (ctx) => {
    let reduxStore
    if (isServer) {
      // req 只有在服务端渲染才存在
      const {ctx: { req } } = ctx
      const { session } = req
    if (session && session.userInfo) {
      reduxStore = getOrCreateStore({
        user: session.userInfo
      })
    } else {
      reduxStore = getOrCreateStore()
    }
    }

    ctx.reduxStore = reduxStore
    let appProps = {}
    if (typeof Comp.getInitialProps === 'function') {
      appProps = await Comp.getInitialProps(ctx)
    }
    console.log(reduxStore.getState());
    
    return {
      ...appProps,
      initialReduxState: reduxStore.getState()
    }
  }
  return WithReduxApp
};