import React, {useEffect} from 'react'
import axios from 'axios'
import Head from 'next/head'
import Nav from '../components/nav'
import Link from 'next/link'
import Router from 'next/router'
import { Button } from 'antd'
import { addAsync, renameType, addType } from '../store/store';
import { connect } from 'react-redux';
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()


const events = [
  'routeChangeStart',
  'routeChangeComplete',
  'routeChnageError',
  'beforeHistoryChange',
  'hashChangeStart',
  'hashChangeComplete'
]

function mackEvent(type) {
  return (...args) => {
    console.log(type, ...args)
  }
}

events.forEach(event => {
  Router.events.on(event, mackEvent(event))
})
/**
 * 执行顺序
 * routeChangeStart
 * beforeHistoryChange
 * routeChangeComplete
 * 
 * hash跳转
 * hashChangeStart
 * hashChangeComplete
 */
const Home = ({count, username}) => {
  const goB = () => {
    // 动态路由
    // Router.push('/test/b?id=2')
    Router.push({
      pathname: '/test/b',
      query: {
        id: 2
      }
    })
  }
  
  useEffect(() => {
    axios.get('api/user/info').then(req => console.log(req))
  }, [])

  return (
    <>
    { count }

    <a href={publicRuntimeConfig.OAUTH_URL}>去登录</a>
    <Link href="/a?id=1" as="/a/1">
      <Button>跳转到A页面</Button>
    </Link>
    <Button type="danger" onClick={goB}>跳转到B</Button>
    <Head>
      <title>Home</title>
      {/* <link rel="icon" href="/favicon.ico" /> */}
    </Head>

    <Nav />

    <div className="hero">
      <input type="text" defaultValue={username} />
      <button>do add</button>
      <p className="description">
        To get started, edit <code>pages/index.js</code> and save to reload.
      </p>

      <div className="row">
        <a href="https://nextjs.org/docs" className="card">
          <h3>Documentation &rarr;</h3>
          <p>Learn more about Next.js in the documentation.</p>
        </a>
        <a href="https://nextjs.org/learn" className="card">
          <h3>Next.js Learn &rarr;</h3>
          <p>Learn about Next.js by following an interactive tutorial!</p>
        </a>
        <a
          href="https://github.com/zeit/next.js/tree/master/examples"
          className="card"
        >
          <h3>Examples &rarr;</h3>
          <p>Find other example boilerplates on the Next.js GitHub.</p>
        </a>
      </div>
    </div>

    <style jsx>{`
      .hero {
        width: 100%;
        color: #333;
      }
      .title {
        margin: 0;
        width: 100%;
        padding-top: 80px;
        line-height: 1.15;
        font-size: 48px;
      }
      .title,
      .description {
        text-align: center;
      }
      .row {
        max-width: 880px;
        margin: 80px auto 40px;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
      }
      .card {
        padding: 18px 18px 24px;
        width: 220px;
        text-align: left;
        text-decoration: none;
        color: #434343;
        border: 1px solid #9b9b9b;
      }
      .card:hover {
        border-color: #067df7;
      }
      .card h3 {
        margin: 0;
        color: #067df7;
        font-size: 18px;
      }
      .card p {
        margin: 0;
        padding: 12px 0 0;
        font-size: 13px;
        color: #333;
      }
    `}</style>
    </>
  )
}

const mapStateToProps = (state) => ({
  count: state.count,
  username: state.username,
})

const mapDispatchToProps = (dispatch) => ({
  addCount(count) {
    dispatch(addAsync(10))
  },
  rename(name) {
    dispatch(renameType(name))
  }
});

Home.getInitialProps = async ({ reduxStore }) => {

  reduxStore.dispatch(addType(10))
  console.log('reduxStore.getState()', reduxStore.getState());
  
  return {

  }
}


export default connect(mapStateToProps, mapDispatchToProps)(Home)
