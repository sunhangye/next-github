## 前言

本文参考了慕课网 jokcy 老师的[React16.8+Next.js+Koa2 开发 Github 全栈项目](https://coding.imooc.com/class/334.html)，记录以便后续学习。🙂

## 介绍

Next.js 是一个轻量级的 React 服务端渲染应用框架。

官网：https://nextjs.org  
中文官网：https://nextjs.frontendx.cn

当使用 React 开发系统的时候，常常需要配置很多繁琐的参数，如 Webpack 配置、Router 配置和服务器配置等。如果需要做 SEO，要考虑的事情就更多了，怎么让服务端渲染和客户端渲染保持一致是一件很麻烦的事情，需要引入很多第三方库。针对这些问题，Next.js 提供了一个很好的解决方案，使开发人员可以将精力放在业务上，从繁琐的配置中解放出来。下面我们一起来从零开始搭建一个完善的 next 项目。


## 项目的初始化

首先安装 create-next-app 脚手架

```
npm i -g create-next-app
```

然后利用脚手架建立 next 项目

```
npx create-next-app next-github
cd next-github
npm run dev
```

可以看到 pages 文件夹下的 index.js

生成的目录结构很简单，我们稍微加几个内容

```
├── README.md
├── components // 非页面级共用组件
│   └── nav.js
├── package-lock.json
├── package.json
├── pages // 页面级组件 会被解析成路由
│   └── index.js
├── lib // 一些通用的js
├── static // 静态资源
│   └── favicon.ico

```

启动项目之后，默认端口启动在 3000 端口，打开 localhost:3000 后，默认访问的就是 index.js 里的内容

## 把 next 作为 Koa 的中间件使用。（可选）

如果要集成 koa 的话，可以参考这一段。  
在根目录新建 server.js 文件

```js
// server.js

const Koa = require('koa')
const Router = require('koa-router')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const PORT = 3001
// 等到pages目录编译完成后启动服务响应请求
app.prepare().then(() => {
  const server = new Koa()
  const router = new Router()

  server.use(async (ctx, next) => {
    await handle(ctx.req, ctx.res)
    ctx.respond = false
  })

  server.listen(PORT, () => {
    console.log(`koa server listening on ${PORT}`)
  })
})
```

然后把`package.json`中的`dev`命令改掉

```
scripts": {
  "dev": "node server.js",
  "build": "next build",
  "start": "next start"
}
```

`ctx.req`和`ctx.res` 是 node 原生提供的

之所以要传递 `ctx.req`和`ctx.res`，是因为 next 并不只是兼容 koa 这个框架，所以需要传递 node 原生提供的 `req` 和 `res`

## 集成 css

next 中默认不支持直接 import css 文件，它默认为我们提供了一种 css in js 的方案，所以我们要自己加入 next 的插件包进行 css 支持

```
yarn add @zeit/next-css
```

如果项目根目录下没有的话  
我们新建一个`next.config.js`  
然后加入如下代码

```js
const withCss = require('@zeit/next-css')

if (typeof require !== 'undefined') {
  require.extensions['.css'] = file => {}
}

// withCss得到的是一个next的config配置
module.exports = withCss({})
```

## 集成 ant-design

```
yarn add antd
yarn add babel-plugin-import // 按需加载插件
```

在根目录下新建`.babelrc`文件

```json
{
  "presets": ["next/babel"],
  "plugins": [
    [
      "import",
      {
        "libraryName": "antd"
      }
    ]
  ]
}
```

这个 babel 插件的作用是把

```
import { Button } from 'antd'
```

解析成

```
import Button from 'antd/lib/button'
```

这样就完成了按需引入组件

在 pages 文件夹下新建`_app.js`，这是 next 提供的让你重写 App 组件的方式，在这里我们可以引入 antd 的样式

pages/\_app.js

```js
import App from 'next/app'

import 'antd/dist/antd.css'

export default App
```

## next 中的路由

### 利用`Link`组件进行跳转

```js
import Link from 'next/link'
import { Button } from 'antd'

const LinkTest = () => (
  <div>
    <Link href="/a">
      <Button>跳转到a页面</Button>
    </Link>
  </div>
)

export default LinkTest
```

### 利用`Router`模块进行跳转

```js
import Link from 'next/link'
import Router from 'next/router'
import { Button } from 'antd'

export default () => {
  const goB = () => {
    Router.push('/b')
  }

  return (
    <>
      <Link href="/a">
        <Button>跳转到a页面</Button>
      </Link>
      <Button onClick={goB}>跳转到b页面</Button>
    </>
  )
}
```

### 动态路由

在 next 中，只能通过`query`来实现动态路由，不支持`/b/:id` 这样的定义方法

首页

```js
import Link from 'next/link'
import Router from 'next/router'
import { Button } from 'antd'

export default () => {
  const goB = () => {
    Router.push('/b?id=2')
    // 或
    Router.push({
      pathname: '/b',
      query: {
        id: 2
      }
    })
  }

  return <Button onClick={goB}>跳转到b页面</Button>
}
```

B 页面

```js
import { withRouter } from 'next/router'

const B = ({ router }) => <span>这是B页面, 参数是{router.query.id}</span>
export default withRouter(B)
```

此时跳转到 b 页面的路径是`/b?id=2`

如果真的想显示成`/b/2`这种形式的话， 也可以通过`Link`上的`as`属性来实现

```js
<Link href="/a?id=1" as="/a/1">
  <Button>跳转到a页面</Button>
</Link>
```

或在使用`Router`时

```js
Router.push(
  {
    pathname: '/b',
    query: {
      id: 2
    }
  },
  '/b/2'
)
```

但是使用这种方法，在页面刷新的时候会 404  
是因为这种别名的方法只是在前端路由跳转的时候加上的  
刷新时请求走了服务端就认不得这个路由了

### 使用 koa 可以解决这个问题

```js
// server.js

const Koa = require('koa')
const Router = require('koa-router')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const PORT = 3001
// 等到pages目录编译完成后启动服务响应请求
app.prepare().then(() => {
  const server = new Koa()
  const router = new Router()

  // start
  // 利用koa-router去把/a/1这种格式的路由
  // 代理到/a?id=1去，这样就不会404了
  router.get('/a/:id', async ctx => {
    const id = ctx.params.id
    await handle(ctx.req, ctx.res, {
      pathname: '/a',
      query: {
        id
      }
    })
    ctx.respond = false
  })
  server.use(router.routes())
  // end

  server.use(async (ctx, next) => {
    await handle(ctx.req, ctx.res)
    ctx.respond = false
  })

  server.listen(PORT, () => {
    console.log(`koa server listening on ${PORT}`)
  })
})
```

### Router 的钩子

在一次路由跳转中，先后会触发  
`routeChangeStart`  
`beforeHistoryChange`  
`routeChangeComplete`

如果有错误的话，则会触发  
`routeChangeError`

监听的方式是

```js
Router.events.on(eventName, callback)
```

## 自定义 document

- 只有在服务端渲染的时候才会被调用
- 用来修改服务端渲染的文档内容
- 一般用来配合第三方 css in js 方案使用

在 pages 下新建\_document.js，我们可以根据需求去重写。

```js
import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  // 如果要重写render 就必须按照这个结构来写
  render() {
    return (
      <Html>
        <Head>
          <title>ssh-next-github</title>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
```

## 自定义 app

next 中，pages/\_app.js 这个文件中暴露出的组件会作为一个全局的包裹组件，会被包在每一个页面组件的外层，我们可以用它来

- 固定 Layout
- 保持一些共用的状态
- 给页面传入一些自定义数据
  pages/\_app.js

给个简单的例子，先别改\_app.js 里的代码，否则接下来 getInitialProps 就获取不到数据了，这个后面再处理。

```js
import App, { Container } from 'next/app'
import 'antd/dist/antd.css'
import React from 'react'

export default class MyApp extends App {
  render() {
    // Component就是我们要包裹的页面组件
    const { Component } = this.props
    return (
      <Container>
        <Component />
      </Container>
    )
  }
}
```

## 封装 getInitialProps

`getInitialProps` 的作用非常强大，它可以帮助我们同步服务端和客户端的数据，我们应该尽量把数据获取的逻辑放在 `getInitialProps` 里，它可以：

- 在页面中获取数据
- 在 App 中获取全局数据

### 基本使用

通过 `getInitialProps` 这个静态方法返回的值 都会被当做 props 传入组件

```js
const A = ({ name }) => (
  <span>这是A页面, 通过getInitialProps获得的name是{name}</span>
)

A.getInitialProps = () => {
  return {
    name: 'ssh'
  }
}
export default A
```

但是需要注意的是，只有 pages 文件夹下的组件（页面级组件）才会调用这个方法。next 会在路由切换前去帮你调用这个方法，这个方法在服务端渲染和客户端渲染都会执行。（`刷新` 或 `前端跳转`)  
并且如果服务端渲染已经执行过了，在进行客户端渲染时就不会再帮你执行了。

### 异步场景

异步场景可以通过 async await 来解决，next 会等到异步处理完毕 返回了结果后以后再去渲染页面

```js
const A = ({ name }) => (
  <span>这是A页面, 通过getInitialProps获得的name是{name}</span>
)

A.getInitialProps = async () => {
  const result = Promise.resolve({ name: 'ssh' })
  await new Promise(resolve => setTimeout(resolve, 1000))
  return result
}
export default A
```

### 在\_app.js 里获取数据

我们重写一些\_app.js 里获取数据的逻辑

```js
import App, { Container } from 'next/app'
import 'antd/dist/antd.css'
import React from 'react'

export default class MyApp extends App {
  // App组件的getInitialProps比较特殊
  // 能拿到一些额外的参数
  // Component: 被包裹的组件
  static async getInitialProps(ctx) {
    const { Component } = ctx
    let pageProps = {}

    // 拿到Component上定义的getInitialProps
    if (Component.getInitialProps) {
      // 执行拿到返回结果
      pageProps = await Component.getInitialProps(ctx)
    }

    // 返回给组件
    return {
      pageProps
    }
  }

  render() {
    const { Component, pageProps } = this.props
    return (
      <Container>
        {/* 把pageProps解构后传递给组件 */}
        <Component {...pageProps} />
      </Container>
    )
  }
}
```

## 封装通用 Layout

我们希望每个页面跳转以后，都可以有共同的头部导航栏，这就可以利用\_app.js 来做了。

在 components 文件夹下新建 Layout.jsx：

```js
import Link from 'next/link'
import { Button } from 'antd'

export default ({ children }) => (
  <header>
    <Link href="/a">
      <Button>跳转到a页面</Button>
    </Link>
    <Link href="/b">
      <Button>跳转到b页面</Button>
    </Link>
    <section className="container">{children}</section>
  </header>
)
```

在\_app.js 里

```jsx
// 省略
import Layout from '../components/Layout'

export default class MyApp extends App {
  // 省略

  render() {
    const { Component, pageProps } = this.props
    return (
      <Container>
        {/* Layout包在外面 */}
        <Layout>
          {/* 把pageProps解构后传递给组件 */}
          <Component {...pageProps} />
        </Layout>
      </Container>
    )
  }
}
```

## document title 的解决方案

例如在 pages/a.js 这个页面中，我希望网页的 title 是 a，在 b 页面中我希望 title 是 b，这个功能 next 也给我们提供了方案

pages/a.js

```js
import Head from 'next/head'

const A = ({ name }) => (
  <>
    <Head>
      <title>A</title>
    </Head>
    <span>这是A页面, 通过getInitialProps获得的name是{name}</span>
  </>
)

export default A
```

## 样式的解决方案（css in js）

next 默认采用的是 styled-jsx 这个库  
https://github.com/zeit/styled-jsx

需要注意的点是：组件内部的 style 标签，只有在组件渲染后才会被加到 head 里生效，组件销毁后样式就失效。

### 组件内部样式

next 默认提供了样式的解决方案，在组件内部写的话默认的作用域就是该组件，写法如下：

```js
const A = ({ name }) => (
  <>
    <span className="link">这是A页面</span>
    <style jsx>
      {`
        .link {
          color: red;
        }
      `}
    </style>
  </>
)

export default A
)
```

我们可以看到生成的 span 标签变成了

```jsx
<span class="jsx-3081729934 link">这是A页面</span>
```

生效的 css 样式变成了

```css
.link.jsx-3081729934 {
  color: red;
}
```

通过这种方式做到了组件级别的样式隔离，并且 link 这个 class 假如在全局有定义样式的话，也一样可以得到样式。

### 全局样式

```jsx
<style jsx global>
  {`
    .link {
      color: red;
    }
  `}
</style>
```

## 样式的解决方案（styled-component）

首先安装依赖

```
yarn add styled-components babel-plugin-styled-components
```

然后我们在.babelrc 中加入 plugin

```json
{
  "presets": ["next/babel"],
  "plugins": [
    [
      "import",
      {
        "libraryName": "antd"
      }
    ],
    ["styled-components", { "ssr": true }]
  ]
}
```

在 pages/\_document.js 里加入 jsx 的支持，这里用到了 next 给我们提供的一个覆写 app 的方法，其实就是利用高阶组件。

```js
import Document, { Html, Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet()
    // 劫持原本的renderPage函数并重写
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          // 根App组件
          enhanceApp: App => props => sheet.collectStyles(<App {...props} />)
        })
      // 如果重写了getInitialProps 就要把这段逻辑重新实现
      const props = await Document.getInitialProps(ctx)
      return {
        ...props,
        styles: (
          <>
            {props.styles}
            {sheet.getStyleElement()}
          </>
        )
      }
    } finally {
      sheet.seal()
    }
  }

  // 如果要重写render 就必须按照这个结构来写
  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
```

然后在 pages/a.js 中

```js
import styled from 'styled-components'

const Title = styled.h1`
  color: yellow;
  font-size: 40px;
`
const A = ({ name }) => (
  <>
    <Title>这是A页面</Title>
  </>
)

export default A
```

## next 中的 LazyLoading

next 中默认帮我们开启了 LazyLoading，切换到对应路由才会去加载对应的 js 模块。

LazyLoading 一般分为两类

- 异步加载模块
- 异步加载组件

首先我们利用 moment 这个库演示一下异步加载模块的展示。

### 异步加载模块

我们在 a 页面中引入 moment 模块
// pages/a.js

```js
import styled from 'styled-components'
import moment from 'moment'

const Title = styled.h1`
  color: yellow;
  font-size: 40px;
`
const A = ({ name }) => {
  const time = moment(Date.now() - 60 * 1000).fromNow()
  return (
    <>
      <Title>这是A页面, 时间差是{time}</Title>
    </>
  )
}

export default A
```

这会带来一个问题，如果我们在多个页面中都引入了 moment，这个模块默认会被提取到打包后的公共的 vendor.js 里。

我们可以利用 webpack 的动态 import 语法

```js
A.getInitialProps = async ctx => {
  const moment = await import('moment')
  const timeDiff = moment.default(Date.now() - 60 * 1000).fromNow()
  return { timeDiff }
}
```

这样只有在进入了 A 页面以后，才会下载 moment 的代码。

### 异步加载组件

next 官方为我们提供了一个`dynamic`方法，使用示例：

```
import dynamic from 'next/dynamic'

const Comp = dynamic(import('../components/Comp'))

const A = ({ name, timeDiff }) => {
  return (
    <>
      <Comp />
    </>
  )
}

export default A

```

使用这种方式引入普通的 react 组件，这个组件的代码就只会在 A 页面进入后才会被下载。

## next.config.js 完整配置

next 回去读取根目录下的`next.config.js`文件，每一项都用注释标明了，可以根据自己的需求来使用。

```js
const withCss = require('@zeit/next-css')

const configs = {
  // 输出目录
  distDir: 'dest',
  // 是否每个路由生成Etag
  generateEtags: true,
  // 本地开发时对页面内容的缓存
  onDemandEntries: {
    // 内容在内存中缓存的时长(ms)
    maxInactiveAge: 25 * 1000,
    // 同时缓存的页面数
    pagesBufferLength: 2
  },
  // 在pages目录下会被当做页面解析的后缀
  pageExtensions: ['jsx', 'js'],
  // 配置buildId
  generateBuildId: async () => {
    if (process.env.YOUR_BUILD_ID) {
      return process.env.YOUR_BUILD_ID
    }

    // 返回null默认的 unique id
    return null
  },
  // 手动修改webpack配置
  webpack(config, options) {
    return config
  },
  // 手动修改webpackDevMiddleware配置
  webpackDevMiddleware(config) {
    return config
  },
  // 可以在页面上通过process.env.customkey 获取 value
  env: {
    customkey: 'value'
  },
  // 下面两个要通过 'next/config' 来读取
  // 可以在页面上通过引入 import getConfig from 'next/config'来读取

  // 只有在服务端渲染时才会获取的配置
  serverRuntimeConfig: {
    mySecret: 'secret',
    secondSecret: process.env.SECOND_SECRET
  },
  // 在服务端渲染和客户端渲染都可获取的配置
  publicRuntimeConfig: {
    staticFolder: '/static'
  }
}

if (typeof require !== 'undefined') {
  require.extensions['.css'] = file => {}
}

// withCss得到的是一个nextjs的config配置
module.exports = withCss(configs)
```

## ssr 流程

next 帮我们解决了 getInitialProps 在客户端和服务端同步的问题，
![ssr渲染流程](https://user-gold-cdn.xitu.io/2019/8/19/16ca8dc70d421934?w=1290&h=1280&f=png&s=383356)

next 会把服务端渲染时候得到的数据通过**NEXT_DATA**这个 key 注入到 html 页面中去。

>Next.js 在做服务器端渲染的时候，页面对应的 React 组件的 getInitialProps 函数被调用，异步结果就是“脱水”数据的重要部分，除了传给页面 React 组件完成渲染，还放在内嵌 script 的 __NEXT_DATA__ 中，这样，在浏览器端渲染的时候，是不会去调用 getInitialProps 的，直接通过 __NEXT_DATA__ 中的“脱水”数据来启动页面 React 组件的渲染。
这样一来，如果 getInitialProps 中有调用 API 的异步操作，只在服务器端做一次，浏览器端就不用做了。
那么，getInitialProps 什么时候会在浏览器端调用呢？
当在单页应用中做页面切换的时候，比如从 Home 页切换到 Product 页，这时候完全和服务器端没关系，只能靠浏览器端自己了，Product页面的 getInitialProps 函数就会在浏览器端被调用，得到的数据用来开启页面的 React 原生生命周期过程。 
参考来源：https://blog.csdn.net/gwdgwd123/article/details/85030708

比如我们之前举例的 a 页面中，大概是这样的格式

```js
script id="__NEXT_DATA__" type="application/json">
      {
        "dataManager":"[]",
        "props":
          {
            "pageProps":{"timeDiff":"a minute ago"}
          },
        "page":"/a",
        "query":{},
        "buildId":"development",
        "dynamicBuildId":false,
        "dynamicIds":["./components/Comp.jsx"]
      }
      </script>
```

## 引入 redux （客户端普通写法）

`yarn add redux`

在根目录下新建 store/store.js 文件

// store.js

```js
import { createStore, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'

const initialState = {
  count: 0
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'add':
      return {
        count: state.count + 1
      }
      break

    default:
      return state
  }
}

// 这里暴露出的是创建store的工厂方法
// 每次渲染都需要重新创建一个store实例
// 防止服务端一直复用旧实例 无法和客户端状态同步
export default function initializeStore() {
  const store = createStore(reducer, initialState, applyMiddleware(ReduxThunk))
  return store
}
```

## 引入 react-redux

`yarn add react-redux`  
然后在\_app.js 中用这个库提供的 Provider 包裹在组件的外层 并且传入你定义的 store

```js
import { Provider } from 'react-redux'
import initializeStore from '../store/store'

...
render() {
    const { Component, pageProps } = this.props
    return (
      <Container>
        <Layout>
          <Provider store={initializeStore()}>
            {/* 把pageProps解构后传递给组件 */}
            <Component {...pageProps} />
          </Provider>
        </Layout>
      </Container>
    )
  }

```

在组件内部

```js
import { connect } from 'react-redux'

const Index = ({ count, add }) => {
  return (
    <>
      <span>首页 state的count是{count}</span>
      <button onClick={add}>增加</button>
    </>
  )
}

function mapStateToProps(state) {
  const { count } = state
  return {
    count
  }
}

function mapDispatchToProps(dispatch) {
  return {
    add() {
      dispatch({ type: 'add' })
    }
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Index)
```

## 利用 hoc 集成 redux 和 next

在上面 `引入 redux （客户端普通写法）` 介绍中，我们简单的和平常一样去引入了 store，但是这种方式在我们使用 next 做服务端渲染的时候有个很严重的问题，假如我们在 Index 组件的 getInitialProps 中这样写

```js
Index.getInitialProps = async ({ reduxStore }) => {
  store.dispatch({ type: 'add' })
  return {}
}
```

进入 index 页面以后就会报一个错误

```
Text content did not match. Server: "1" Client: "0"
```

并且你每次刷新 这个 Server 后面的值都会加 1，这意味着如果多个浏览器同时访问，`store`里的`count`就会一直递增，这是很严重的 bug。

这段报错的意思就是服务端的状态和客户端的状态不一致了，服务端拿到的`count`是 1，但是客户端的`count`却是 0，其实根本原因就是服务端解析了 `store.js` 文件以后拿到的 `store`和客户端拿到的 `store` 状态不一致，其实在同构项目中，服务端和客户端会持有各自不同的 `store`，并且在服务端启动了的生命周期中 `store` 是保持同一份引用的，所以我们必须想办法让两者状态统一，并且和单页应用中每次刷新以后`store`重新初始化这个行为要一致。在服务端解析过拿到 `store` 以后，直接让客户端用服务端解析的值来初始化 `store。`

总结一下，我们的目标有：

- 每次请求服务端的时候（页面初次进入，页面刷新），store 重新创建。
- 前端路由跳转的时候，store 复用之前创建好的。
- 这种判断不能写在每个组件的 getInitialProps 里，想办法抽象出来。

所以我们决定利用`hoc`来实现这个逻辑复用。

首先我们改造一下 store/store.js，不再直接暴露出 store 对象，而是暴露一个创建 store 的方法，并且允许传入初始状态来进行初始化。

```js
import { createStore, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'

const initialState = {
  count: 0
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'add':
      return {
        count: state.count + 1
      }
      break

    default:
      return state
  }
}

export default function initializeStore(state) {
  const store = createStore(
    reducer,
    Object.assign({}, initialState, state),
    applyMiddleware(ReduxThunk)
  )
  return store
}
```

在 lib 目录下新建 with-redux-app.js，我们决定用这个 hoc 来包裹\_app.js 里导出的组件，每次加载 app 都要通过我们这个 hoc。

```js
import React from 'react'
import initializeStore from '../store/store'

const isServer = typeof window === 'undefined'
const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__'

function getOrCreateStore(initialState) {
  if (isServer) {
    // 服务端每次执行都重新创建一个store
    return initializeStore(initialState)
  }
  // 在客户端执行这个方法的时候 优先返回window上已有的store
  // 而不能每次执行都重新创建一个store 否则状态就无限重置了
  if (!window[__NEXT_REDUX_STORE__]) {
    window[__NEXT_REDUX_STORE__] = initializeStore(initialState)
  }
  return window[__NEXT_REDUX_STORE__]
}

export default Comp => {
  class withReduxApp extends React.Component {
    constructor(props) {
      super(props)
      // getInitialProps创建了store 这里为什么又重新创建一次？
      // 因为服务端执行了getInitialProps之后 返回给客户端的是序列化后的字符串
      // redux里有很多方法 不适合序列化存储
      // 所以选择在getInitialProps返回initialReduxState初始的状态
      // 再在这里通过initialReduxState去创建一个完整的store
      this.reduxStore = getOrCreateStore(props.initialReduxState)
    }

    render() {
      const { Component, pageProps, ...rest } = this.props
      return (
        <Comp
          {...rest}
          Component={Component}
          pageProps={pageProps}
          reduxStore={this.reduxStore}
        />
      )
    }
  }

  // 这个其实是_app.js的getInitialProps
  // 在服务端渲染和客户端路由跳转时会被执行
  // 所以非常适合做redux-store的初始化
  withReduxApp.getInitialProps = async ctx => {
    const reduxStore = getOrCreateStore()
    ctx.reduxStore = reduxStore

    let appProps = {}
    if (typeof Comp.getInitialProps === 'function') {
      appProps = await Comp.getInitialProps(ctx)
    }

    return {
      ...appProps,
      initialReduxState: reduxStore.getState()
    }
  }

  return withReduxApp
}
```

在\_app.js 中引入 hoc

```js
import App, { Container } from 'next/app'
import 'antd/dist/antd.css'
import React from 'react'
import { Provider } from 'react-redux'
import Layout from '../components/Layout'
import initializeStore from '../store/store'
import withRedux from '../lib/with-redux-app'
class MyApp extends App {
  // App组件的getInitialProps比较特殊
  // 能拿到一些额外的参数
  // Component: 被包裹的组件
  static async getInitialProps(ctx) {
    const { Component } = ctx
    let pageProps = {}

    // 拿到Component上定义的getInitialProps
    if (Component.getInitialProps) {
      // 执行拿到返回结果`
      pageProps = await Component.getInitialProps(ctx)
    }

    // 返回给组件
    return {
      pageProps
    }
  }

  render() {
    const { Component, pageProps, reduxStore } = this.props
    return (
      <Container>
        <Layout>
          <Provider store={reduxStore}>
            {/* 把pageProps解构后传递给组件 */}
            <Component {...pageProps} />
          </Provider>
        </Layout>
      </Container>
    )
  }
}

export default withRedux(MyApp)
```

这样，我们就实现了在 next 中集成 redux。

## github Oauth 认证

![流程图](https://wx1.sinaimg.cn/mw690/a9326b05ly1gazj3k4ml0j212a0lgjus.jpg)

接下来接入 github 第三方登录

### 新建 github applications

首先进入 github 的新建 app 页面
https://github.com/settings/applications/new

这里的 Homepage URL 可以暂时填写本地开发的 url
然后 Authorization callback URL 先填写本地开发的 url + /auth (如 localhost:3001/auth)

新建成功后，进入的页面就可以看到`Client ID`和
`Client Secret`

在项目根目录下新建 config.js

```js
module.exports = {
  github: {
    client_id: '你的client_id',
    client_secret: '你的client_secret'
  }
}
```

可以在
https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/
查看 Oauth 认证的说明。

### Oauth 请求

#### 跳转字段

`client_id`: application 的 id  
`redirect_uri`: 注册时填写的 Authorization callback URL  
`scope`: 允许访问的权限  
`allow_signup`: 是否允许用户注册  

可以通过在浏览器中访问
`https://github.com/login/oauth/authorize?client_id=你的client_id` 加上上述字段来尝试。

#### 请求 token

`client_id`：同上  
`client_secret`: 注册后获得的 Client Secret  
`code`：用户同意认证后，跳转到填写的 Authorization callback URL 后，参数中可以获得这个 code， **这个code只能使用一次。**  
接口地址(post)： `https://github.com/login/oauth/access_token`

#### 获取用户信息
`https://api.github.com/user` 需要在header中添加Authorization字段，值为`token 请求到的token`。


### 维持OAuth之前的页面访问地址

在跳转登录前记录当前url放到链接参数发送`prepare-auth?url=${router.asPath}`,存到session中。当登录成功跳转回来访问当前url
  > tips: 使用withRouter获取router

### Oauth Code 保证安全的策略

- 一次性 code，利用 code 请求过一次 token 后，这个 code 就会失效。
- id + secret 认证
- redirect_uri 如果和 github 配置里填写的不同，会直接报错。

作为接入方，只要我们保证 secret 不被泄露，redirect_uri 填写正确，就可以保证用户账户的安全。

## cookie和session
用`koa-session`这个库来处理session,
```
yarn add koa-seassion
```

### 基础使用
server.js
```js
const Koa = require('koa')
const Router = require('koa-router')
const next = require('next')
const session = require('koa-session')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const PORT = 3001

// 等到pages目录编译完成后启动服务响应请求
app.prepare().then(() => {
  const server = new Koa()
  const router = new Router()

    // 用于给session加密
  server.keys = ['ssh develop github app']
  const sessionConfig = {
    // 设置到浏览器的cookie里的key
    key: 'sid',
  }
  server.use(session(sessionConfig, server))

  server.use(async (ctx, next) => {
      console.log(`session is ${JSON.stringify(ctx.session)}`)
      next()
  })

  router.get('/set/user', async (ctx) => {
    ctx.session.user = {
      name: 'ssh',
      age: 18
    }
    ctx.body = 'set session successd'
  })

  server.use(router.routes())

  server.use(async (ctx, next) => {
    await handle(ctx.req, ctx.res)
    ctx.respond = false
  })

  server.listen(PORT, () => {
    console.log(`koa server listening on ${PORT}`)
  })
})
```
这时候访问/set/user，就可以在node端控制台打印出session了。  

koa-session做了类似于这样的事情，利用cookie来存储session id，这样就能在下一次访问接口找到对应的session信息。
```js
server.use((ctx, next) => {
  if (ctx.cookies.get('sid')) {
    ctx.session = {}
  }

  // 先等待后面的中间件处理
  await next()

  ctx.cookies.set(xxxx)
})
```

### 利用redis存储信息

因为`koa-session`这个库允许我们自定义一个store用来存取session，所以我们要新建一个session存储的类，提供`get`、`set`、`destory`方法即可。
新建server文件夹，新建server/session-store.js文件
```js
// 加上前缀
function getRedisSessionId(sessionId) {
  return `ssid:${sessionId}`
}

export default class RedisSessionStore {
  constructor(client) {
    // node.js的redis-client
    this.client = client
  }

  // 获取redis中存储的session数据
  async get(sessionId) {
    console.log('get sessionId: ', sessionId);
    const id = getRedisSessionId(sessionId)
    // 对应命令行操作redis的get指令，获取value
    const data = await this.client.get(id)
    if (!data) {
      return null
    }
    try {
      const result = JSON.parse(data)
      return result
    } catch (err) {
      console.error(err)
    }
  }

  // 在redis中存储session数据
  async set(sessionId, session, ttl /** 过期时间 */) {
    console.log('set sessionId: ', sessionId);
    const id = getRedisSessionId(sessionId)
    let ttlSecond
    if (typeof ttl === 'number') {
      // 毫秒转秒
      ttlSecond = Math.ceil(ttl / 1000)
    }

    try {
      const sessionStr = JSON.stringify(session)
      // 根据是否有过期时间 调用不同的api
      if (ttl) {
        // set with expire
        await this.client.setex(id, ttlSecond, sessionStr)
      } else {
        await this.client.set(id, sessionStr)
      }
    } catch (error) {
      console.error('error: ', error);
    }
  }

  // 从resid中删除某个session
  // 在koa中 设置ctx.session = null时，会调用这个方法
  async destroy(sessionId) {
    console.log('destroy sessionId: ', sessionId);
    const id = getRedisSessionId(sessionId)
    await this.client.del(id)
  }
}

```

这样就实现了一个精简版的session store， 然后在server.js中引入自定义store，并且利用`ioredis`这个库实例化一个node可用的redis client传入给自定义store
```js
const Koa = require('koa')
const Router = require('koa-router')
const next = require('next')
const session = require('koa-session')
const Redis = require('ioredis')
const RedisSessionStore = require('./server/session-store')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
// 实例化一个redisClient
const redisClient = new Redis()
const PORT = 3001
// 等到pages目录编译完成后启动服务响应请求
app.prepare().then(() => {
  const server = new Koa()
  const router = new Router()

  // 用于给session加密
  server.keys = ['ssh develop github app']
  const sessionConfig = {
    // 设置到浏览器的cookie里的key
    key: 'sid',
    // 将自定义存储逻辑传给koa-session
    store: new RedisSessionStore(redisClient),
  }
  server.use(session(sessionConfig, server))

  router.get('/a/:id', async (ctx) => {
    const { id } = ctx.params
    await handle(ctx.req, ctx.res, {
      pathname: '/a',
      query: {
        id,
      },
    })
    ctx.respond = false
  })

  router.get('/set/user', async (ctx) => {
    // 如果session里没有用户信息
    ctx.session.user = {
      name: 'ssh',
      age: 18,
    }
    ctx.body = 'set session successd'
  })

  server.use(router.routes())

  server.use(async (ctx, next) => {
    await handle(ctx.req, ctx.res)
    ctx.respond = false
  })

  server.listen(PORT, () => {
    console.log(`koa server listening on ${PORT}`)
  })
})

```

重启服务后 访问`/set/user`接口，然后在命令行里输入`redis-client`，通过`keys *` 就可以看到我们自定义的ssid开头的session id了。通过`get ssid:xxx` 就可以看到我们在代码中存入的用户信息。

## Github Oauth接入
在页面中某个入口引入a标签，href指向`https://github.com/login/oauth/authorize?client_id=你的client_id`，登陆成功后，github会帮你回跳到你填写的callback地址，并且在query参数中带上`code`这个字段，现在来编写获取到code以后的流程。  

首先引入axios作为请求库
`yarn add axios`

把请求token的url放在config.js中
```js
module.exports = {
  github: {
    request_token_url: 'https://github.com/login/oauth/access_token',
    // ...省略
  },
}
```
新建`server/auth.js`
```js
// 处理github返回的auth code
const axios = require('axios')
const config = require('../config')

const { client_id, client_secret, request_token_url } = config.github

module.exports = (server) => {
  server.use(async (ctx, next) => {
    if (ctx.path === '/auth') {
      const { code } = ctx.query
      if (code) {
        // 获取Oauth鉴权信息
        const result = await axios({
          method: 'POST',
          url: request_token_url,
          data: {
            client_id,
            client_secret,
            code,
          },
          headers: {
            Accept: 'application/json',
          },
        })

        // github 可能会在status是200的情况下返回error信息
        if (result.status === 200 && (result.data && !result.data.error)) {
          ctx.session.githubAuth = result.data
        
          const { access_token, token_type } = result.data
          // 获取用户信息
          const { data: userInfo } = await axios({
            method: 'GET',
            url: 'https://api.github.com/user',
            headers: {
              Authorization: `${token_type} ${access_token}`,
            },
          })

          ctx.session.userInfo = userInfo
          // 重定向到首页
          ctx.redirect('/')
        } else {
          ctx.body = `request token failed ${result.data && result.data.error}`
        }
      } else {
        ctx.body = 'code not exist'
      }
    } else {
      await next()
    }
  })
}
```

这一整套流程下来，我们就获取到token和userInfo，并且都保存在session里了

然后在server.js里引入
```js
const Koa = require('koa')
const Router = require('koa-router')
const next = require('next')
const session = require('koa-session')
const Redis = require('ioredis')
const koaBody = require('koa-body')
const auth = require('./server/auth')
const api = require('./server/api')
const RedisSessionStore = require('./server/session-store')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
// 实例化一个redisClient
const redisClient = new Redis()
const PORT = 3001
// 等到pages目录编译完成后启动服务响应请求
app.prepare().then(() => {
  const server = new Koa()
  const router = new Router()

  // 用于给session加密
  server.keys = ['ssh develop github app']
  // 解析post请求的内容
  server.use(koaBody())

  const sessionConfig = {
    // 设置到浏览器的cookie里的key
    key: 'sid',
    // 将自定义存储逻辑传给koa-session
    store: new RedisSessionStore(redisClient),
  }
  server.use(session(sessionConfig, server))

  // 处理github Oauth登录
  auth(server)
  // 处理github请求代理
  api(server)

  router.get('/a/:id', async (ctx) => {
    const { id } = ctx.params
    await handle(ctx.req, ctx.res, {
      pathname: '/a',
      query: {
        id,
      },
    })
    ctx.respond = false
  })

  router.get('/api/user/info', async (ctx) => {
    const { userInfo } = ctx.session
    if (userInfo) {
      ctx.body = userInfo
      // 设置头部 返回json
      ctx.set('Content-Type', 'application/json')
    } else {
      ctx.status = 401
      ctx.body = 'Need Login'
    }
  })

  server.use(router.routes())

  server.use(async (ctx) => {
    // req里获取session
    ctx.req.session = ctx.session
    await handle(ctx.req, ctx.res)
    ctx.respond = false
  })

  server.listen(PORT, () => {
    console.log(`koa server listening on ${PORT}`)
  })
})
```

jokcy老师在项目中用的LRU缓存策略，我封装成了更共用的一个工具，可以对所有页面的getInitialProps进行包裹。  

lib/utils/client-cache.js
```js
import { useEffect } from 'react'
import LRU from 'lru-cache'

const isServer = typeof window === 'undefined'
const DEFAULT_CACHE_KEY = 'cache'
export default function initClientCache({ lruConfig = {}, genCacheKeyStrate } = {}) {
  // 默认10分钟缓存
  const {
    maxAge = 1000 * 60 * 10,
    ...restConfig
  } = lruConfig || {}

  const lruCache = new LRU({
    maxAge,
    ...restConfig,
  })

  function getCacheKey(context) {
    return genCacheKeyStrate ? genCacheKeyStrate(context) : DEFAULT_CACHE_KEY
  }

  function cache(fn) {
    // 服务端不能保留缓存 会在多个用户之间共享
    if (isServer) {
      return fn
    }

    return async (...args) => {
      const key = getCacheKey(...args)
      const cached = lruCache.get(key)
      if (cached) {
        return cached
      }
      const result = await fn(...args)
      lruCache.set(key, result)
      return result
    }
  }

  function setCache(key, cachedData) {
    lruCache.set(key, cachedData)
  }

  // 允许客户端外部手动设置缓存数据
  function useCache(key, cachedData) {
    useEffect(() => {
      if (!isServer) {
        setCache(key, cachedData)
      }
    }, [])
  }

  return {
    cache,
    useCache,
    setCache,
  }
}
```

使用示例：
```js
/**
*  使用示例
*  关键点在于cache和useCache的使用
**/

import { Button, Icon, Tabs } from 'antd'
import getConfig from 'next/config'
import Router, { withRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { request } from '../lib/api'
import initCache from '../lib/client-cache'
import Repo from '../components/Repo'

const { publicRuntimeConfig } = getConfig()

const { cache, useCache } = initCache()

const Index = ({ userRepos, starred, router }) => {
  useCache('cache', {
    userRepos,
    starred,
  })
  
  return (
    <div className="root">
      <div className="user-repos">
            {userRepos.map((repo) => (
              <Repo key={repo.id} repo={repo} />
            ))}
      </div>
    </div>
  )
}

Index.getInitialProps = cache(async ({ ctx, reduxStore }) => {
  const { user } = reduxStore.getState()
  if (!user || !user.id) {
    return {}
  }

  const { data: userRepos } = await request(
    {
      url: '/user/repos',
    },
    ctx.req,
    ctx.res,
  )

  const { data: starred } = await request(
    {
      url: '/user/starred',
    },
    ctx.req,
    ctx.res,
  )
  return {
    userRepos,
    starred,
  }
})

export default withRouter(Index)
```
原理就是去LRU缓存中找有没有这个key的缓存值，key的生成策略可以自定义，比如在搜索页面就可以根据query中各个参数的值拼接成类似于`ssh-nextgithub`这样的key，下次再去搜索用户名为`ssh`下的`nextgithub`这个项目的时候，就会直接返回缓存中的结果。  

之所以要使用useCache，是因为首先这个缓存并不会在服务端执行，但是初次打开页面getInitialProps会在服务端执行结果。
客户端渲染组件的时候能通过服务端在window注入的值拿到这个返回值，但是这个时候缓存中是没有这个值的。
所以我们要手动利用useCache设置一下缓存值，这样下次进行客户端跳转的时候就可以利用服务端渲染时执行的getInitialProps的返回值了。


https://blog.csdn.net/weixin_33737134/article/details/91438412
https://juejin.im/post/5d5a54f0e51d4561af16dd19#heading-5

Hooks 让函数组件具有类组件的能力

单向数据流状态管理工具
redux-thunk

Math.round() 根据“round”的字面意思“附近、周围”，可以猜测该函数是求一个附近的整数，即四舍五入
Math.ceil() 根据“ceil”的字面意思“天花板”去理解 往上取整
Math.floor()：根据“floor”的字面意思“地板”去理解 往下取整

### nextjs集成react-redux

```
WithReduxApp.getInitialProps = async (ctx) => {
  ...
  // 将reduxStore赋值到ctx
  ctx.reduxStore = reduxStore

  ...
}
```

### Hooks 让函数组件具有类组件的能力

### 使用koa-body处理post请求
```server/index
  const KoaBody = require('koa-body')
  server.use(KoaBody())
```
然后我们就可以使用`ctx.request.body`获取到请求参数

### 缓存数据
```
let cacheUserRepo;
Index.getInitialProps = () => {
  ...
  cacheUserRepo = userRepo
}
```

### HOC 高阶组件注意事项

```
export default (Comp) => {
  const Child = ({router, ...rest}) => {
    return (
      <>
        <div>Header</div>
        <div><Comp { ...rest } /></div>
        <div>Footer</div>
      </>
    )
  }
  Child.getInitialProps = aysnc (context) => {
    const { ctx, router } = context
    // 调取公共数据方法
    ...
    // 注意事项
    let compProps = {}
    if (typeof Comp.getInitialProps === 'function') {
      compProps = await Comp.getInitialProps(context)
    }
    return {
      commonData,
      ...compProps
    }
  }
  return withRouter(Child)
}
```
* 判断子组件有getInitialProps，有则将完整的context传参获取到的数据通过解构赋值到容器组件props
* 将容器组件props数据传到<Comp {...rest}>

### 处理详情页readme 
1、base64_to_utf8
  const content = decodeURLComponent(escape(atob(str)))
2、处理markdown数据
  ```
  // 样式
  import 'github-markdown-css'
  import 'MarkdownIt' from 'markdown-it'
  const md = new MarkdownIt({html: true, linkify: true})
  const html md.render(content)
  
  <div className="markdown-body">
    <div dangerouslySetInnerHtml={{_html: html}} />
  </div>
  ```
  抽取markdown组件，使用memo如果props没变化则不重新渲染,使用useMemo(() => {}, [content])

### 导出静态页面

使用`npm run build`之后使用`npm run export`
