// import Comp from '../components/comp'
import Head from 'next/head'
import { withRouter } from 'next/router';
import router from 'next/dist/client/router';
import Link from 'next/link';
import styled from 'styled-components'
import store from '../store/store'
import dynamic from 'next/dynamic'
import { connect } from 'react-redux'
const Comp = dynamic(import('../components/comp'))
const Title = styled.h1`
  color: red;
  font-size: 18px;
`

const A = ({router, name, timeDiff}) => (
  <>
  <Head>
    <title>这是A页面title</title>
    <meta name="keywords" content="优惠末班车12.25-12.31，,精选好课1元秒杀，视频课程7折，专题折上8折，微职位暖心大奖任你抽！" />
    <meta name="description" content="天气这么冷，元旦就躲被窝里好好学习吧~" />
  </Head>
  <Title>This is Title {timeDiff}</Title>
  <Comp >Component A页面</Comp><br />
  <Link href="#hello"><a className="test">this is a page{router.query.id} {name} </a></Link>
  <style jsx>{`
    a {
      color: pink;
    }
  `}</style>
  </>

)

/**
 * 只要请求到数据才会跳转显示页面
 */
A.getInitialProps = async () => {
  // 异步加载模块
  const moment = await import('moment')
  const promise = new Promise(resolve => {
    setTimeout(() => {
      resolve({
        name: 'sunhangye',
        timeDiff: moment.default(Date.now() - 60 * 1000).fromNow()
      })
    }, 2000)
  })
  return await promise
}

export default withRouter(A)
