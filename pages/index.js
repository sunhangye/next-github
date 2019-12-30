import { useEffect } from 'react'
import Link from 'next/link';
import { Button, Icon, Tabs } from 'antd'
import Router, { withRouter } from 'next/router'
import axios from 'axios'
import { request } from '../lib/api'
import getConfig from 'next/config'
import { connect } from 'react-redux'
import Repo from '../components/Repo'
import LRU from 'lru-cache'

const { publicRuntimeConfig } = getConfig()

/**
 * 使用lru - cache 在浏览器渲染判断到有数据就放到cache中， 超过maxAge不调用则销毁重新请求。否则一直使用一直缓存
 */
const cache = new LRU({
  maxAge: 1000 * 10
})

/**
 * 服务端渲染后变量为公共变量，任何用户都会公用，所以要改成只有浏览器渲染才会缓存数据
 */
let cacheUserRepos
let cacheUserStaredRepos
const isServer = typeof window === 'undefined'
function Index({ userRepos,userStaredRepos, user, router }) {

  useEffect(() => {
    if (!isServer) {
      cache.set('userRepos', userRepos)
      cache.set('userStaredRepos', userStaredRepos)
    }
  }, [userRepos, userStaredRepos])
  const tabKey = router.query.key || '1'
  if (!user || !user.id) {
    return (
      <div className="root">
        <p>亲，您还没有登录哦</p>
        <Button type="primary" href={publicRuntimeConfig.OAUTH_URL}>点击登录</Button>
        <style jsx>{`
          .root {
            height: 400px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
        `}</style>
      </div>
    )
  }
  const { avatar_url, login, name, bio, email } = user

  const handleTabChange = (activeKey) => {

    Router.push(`/?key=${activeKey}`)
  }
  return (
    <div className="root">
      <div className="user-info">
        <img src={avatar_url} alt="" className="avatar" />
        <span className="login">{login}</span>
        <span className="name">{name}</span>
        <span className="bio">{bio}</span>
        <p className="email">
          <Icon type="mail" className="icon-email" />
          <a href={`mailto:${email}`}>{email}</a>
        </p>
      </div>
      <div className="user-repos">
        <Tabs activeKey={tabKey} onChange={handleTabChange} animated={true}>
          <Tabs.TabPane tab="你的仓库" key="1">
            {
              userRepos.map(repo => (
                <Repo key={repo.id} repo={repo} />
                )
              )
            }
          </Tabs.TabPane>
          <Tabs.TabPane tab="你关注的仓库" key="2">
            {
              userStaredRepos.map(repo => (
                <Repo key={repo.id} repo={repo} />
                )
              )
            }
          </Tabs.TabPane>
        </Tabs>
        
      </div>
      <style jsx>{`
        .root {
            display: flex;
            align-items: flex-start;
            padding: 20px;
          }

          .user-info {
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            width: 200px;
            margin-right: 40px;
          }

          .login {
            font-weight: 800;
            font-size: 20px;
            margin-top: 20px;
          }

          .name {
            font-size: 16px;
            color: #777;
          }

          .bio {
            margin-top: 20px;
            color: #333;
          }

          .avatar {
            width: 100%;
            border-radius: 5px;
          }

          .user-repos {
            flex: 1;
          }

          :global(.icon-email) {
            margin-right: 10px;
          }
      `}</style>
    </div>
  )
}
Index.getInitialProps = async ({ ctx, reduxStore }) => {

  const { user } = reduxStore.getState()
  if (!user || !user.id) {
    return {}
  }
  if (!isServer) {
    if (cache.get('userRepos') && cache.get('userStaredRepos')) {
      return {
        userRepos: cache.get('userRepos'),
        userStaredRepos: cache.get('userStaredRepos')
      }
    }
  }

  const { data: userRepos } = await request(
    {
      url: '/user/repos',
    },
    ctx.req,
    ctx.res
  )
  const { data: userStaredRepos } = await request(
    {
      url: '/user/starred',
    },
    ctx.req,
    ctx.res
  )

  return {
    userRepos,
    userStaredRepos
  }

}

const mapStateToProps = (state) => ({
  user: state.user
})

export default withRouter(connect(mapStateToProps)(Index))