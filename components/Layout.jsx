import { Button, Layout, Icon, Input, Avatar, Tooltip, Dropdown, Menu, } from 'antd'
import {useState, useCallback} from 'react'
import { connect } from 'react-redux'
import Link from 'next/link'
import { withRouter } from 'next/router';
const { Header, Content, Footer } = Layout

import CenterContainer from './CenterContainer'

import { OAUTH_URL } from '../config'

import { logout } from '../store/store';

const AppLayout = ({ children, user, logout, router }) => {
  const [search, setSearch] = useState('')
  const handleSearchChange = useCallback((event) => {
    setSearch(event.target.value)
  }, [search])
  const handleLogout = useCallback(() => logout(), [logout])
  const UserDropDown = (
    <Menu>
      <Menu.Item>
        <Button type="link" onClick={handleLogout}>登出</Button>
      </Menu.Item>
    </Menu>
  )

  return (
    <Layout>
      <Header>
        <CenterContainer renderer={<div className="header-inner" />}>
          <div className="header-left">
            <div className="logo">
              <Link href="/">
                <a>
                  <Icon type="github" className="icon-github" />
                </a>
              </Link>
            </div>
            <div>
              <Input.Search
                placeholder="搜索仓库"
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className="header-right">
            <div className="user">
              {
                user.id ? (
                  <Dropdown overlay={UserDropDown} placement="bottomCenter">
                    <a href={user.html_url} target="_blank">
                      <Avatar size={40} src={user.avatar_url} />
                    </a>
                  </Dropdown>
                ) : (
                    <Tooltip placement="bottom" title="点击进行登录">
                      <a href={`/prepare-auth?url=${router.asPath}`}>
                        <Avatar size={40} icon="user" />
                      </a>
                    </Tooltip>
                )
              }
            </div>
          </div>
        </CenterContainer>
      </Header>
      <Content>
        {children}
      </Content>
      <Footer className="footer">
        Develop Github
      </Footer>
      <style jsx global>{`
        #__next {
          height: 100%;
        }
        .ant-layout {
          height: 100%;
        }
        .ant-layout-header{
          padding-left: 0;
          padding-right: 0;
        }
      `}</style>
      <style jsx>{`
        :global(.flex-box) {
          display: flex;
        }
        .header-inner {
          display: flex;
          justify-content: space-between;
        }
        .header-left {
          display: flex;
          justify-content: flex-start;
        }
        :global(.icon-github) {
          display: block;
          padding-top: 10px;
          margin-right: 20px;
          color: #fff;
          font-size: 40px;
        }
        :global(.footer) {
          text-align: center;
        }
        
      `}</style>
    </Layout>
  )
}
const mapStateToProps = (state) => ({
  user: state.user
})

const mapDispatchToProps = (dispatch) => ({
  logout: () => dispatch(logout())
})

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AppLayout))