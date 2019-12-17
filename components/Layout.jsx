import { Button, Layout, Icon, Input } from 'antd'
import {useState, useCallback} from 'react'
import Link from 'next/link'
const { Header, Content, Footer } = Layout

import CenterContainer from './CenterContainer'

export default ({ children }) => {
  const [search, setSearch] = useState('')
  const handleSearchChange = useCallback((event) => {
    setSearch(event.target.value)
  }, [search])

  return (
    <Layout>
      <Header>
        <CenterContainer>
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
        </CenterContainer>
      </Header>
      <Content>
        {children}
      </Content>
      <Footer>
        Develop Training
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
        .header-inner {
          display: flex;
          justify-content: spance-between;
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
      `}</style>
    </Layout>
  )
}