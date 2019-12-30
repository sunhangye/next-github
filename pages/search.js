import Router, { withRouter } from 'next/router'
import { useEffect, memo, isValidElement } from 'react'
import { Row, Col, List, Pagination } from 'antd'
import Link from 'next/link'
import api from '../lib/api'
import Repo from '../components/Repo'
const LANGUAGES = ['JavaScript', 'HTML', 'CSS', 'TypeScript', 'Java', 'Vue', 'React']
const SORT_TYPES = [{
    name: 'Best Match',
  },
  {
    name: 'Most Starts',
    value: 'stars',
    order: 'desc',
  },
  {
    name: 'Fewest Starts',
    value: 'stars',
    order: 'asc',
  },
  {
    name: 'Most Forks',
    value: 'forks',
    order: 'desc',
  },
  {
    name: 'Fewest Forks',
    value: 'forks',
    order: 'asc',
  },
]

const selectItemStyle = {
  borderLeft: '2px solid #e36309',
  fontWeight: 100
}

const PER_PAGE = 20

const FilterLink = memo(({name, query, sort, order, lang, page}) => {

  // const doSearch = () => {
  //   Router.push({
  //     pathname: '/search',
  //     query: {
  //       query,
  //       sort,
  //       order,
  //       lang
  //     }
  //   })
  // }

  let queryString = `?query=${query}`
  if (lang) {
    queryString += `&lang=${lang}`
  }
  if (sort) {
    queryString += `&sort=${sort}&order=${order || 'desc'}`
  }
  if (page) {
    queryString += `&page=${page}`
  }
  queryString += `&per_page=${PER_PAGE}`
  return (
    <Link href={`/search${queryString}`}>
      {isValidElement(name) ? name : <a>{name}</a>}
    </Link>
  )
})



/**
 * 声明匿名函数每次都会被渲染
 */
function Search ({ router, repos }) {

  const { ...querys } = router.query
  const { sort, order, lang, query, page } = router.query
  const handleLanguageChange = (language) => {
    Router.push({
      pathname: '/search',
      query: {
        query,
        sort,
        order,
        lang: language
      }
    })
  }

  const handleSortChange = (sort) => {
    Router.push({
      pathname: '/search',
      query: {
        query,
        sort: sort.name,
        order: sort.order,
        lang
      }
    })
  }
  const doSearch = (config) =>  {
    Router.push({
      pathname: '/search',
      query: config
    })
  }

  const noop = () => {

  }
  // useEffect(() => {
  //   if (!query.query) {
  //     Router.push('/')
  //   }
  //   return () => {}
  // })
  return (
    <div className="root">
      <Row gutter={{xs: 5, sm: 10, md: 20}}>
        <Col span={6}>
          <List
            bordered
            style={{marginBottom: 20 }}
            dataSource={LANGUAGES}
            header={(
              <span className="list-header">语言</span>
            )}
            renderItem={(item) => {
              const selected = lang === item
              return (
                <List.Item style={lang === item ? selectItemStyle : null}>
                  {
                    selected ? <span>{item}</span> : <FilterLink { ...querys } name={item} lang={item} />
                  }
                  
                </List.Item>
              )
            }}
          />
          <List
            bordered
            style={{marginBottom: 20 }}
            dataSource={SORT_TYPES}
            header={(
              <span className="list-header">排序</span>
            )}
            renderItem={(item) => {
              let selected = false
              if (item.name === 'Best Match' && !sort) {
                selected = true
              } else if (item.value === sort && item.order === order) {
                selected = true
              }
              
              return (
                <List.Item style={selected ? selectItemStyle : null}>
                    {
                      selected ? <span>{item.name}</span> : <FilterLink { ...querys } sort={item.value} order={item.order} name={item.name} />
                    }
                </List.Item>
              )
            }}
          />
        </Col>
        <Col span={18}>
          <h3 className="repos-title">{repos.total_count}个仓库</h3>
          {
            repos.items.map((repo) => (
              <Repo repo={repo} key={repo.id} />
            ))
          }
          <div className="pagination">
            <Pagination
              pageSize={PER_PAGE}
              current={Number(page) || 1}
              total={Math.min(repos.total_count, 1000)}
              onChange={noop}
              itemRender={(renderPage, renderType, renderOl) => {
                const targetPage = renderType === 'page' ? renderPage : renderType === 'prev' ? renderPage - 1 : renderPage + 1
                // name 为<a></a> 所以需要在FilterLink判断下是直接使用name还是用个a标签
                const name = renderType === 'page' ? renderPage : renderOl

                return <FilterLink { ...querys } page={targetPage} name={name} />
              }}
            />
          </div>
        </Col>
      </Row>
      <style jsx>{`
        .root {
          padding: 20px;
        }
        .list-header {
          font-weight: 800;
          font-size: 16;
        }
        .repos-title {
          border-bottom: 1px solid #eee;
          font-size: 16px;
          line-height: 50px;
        }
        .pagination {
          padding: 20px;
          text-align: center;
        }
        `}</style>
    </div>
  )
}

Search.getInitialProps = async ({ ctx }) => {
  const { query, sort, lang, order, page } = ctx.query
  // ?q=react+language:javascript&sort=starts&order=desc&page=2
  if (!query) {
    return {
      repos: {
        total_count: 0
      }
    }
  }
  let queryString = `?q=${query}`
  if (lang) {
    queryString += `+language:${lang}`
  }
  if (sort) {
    queryString += `&sort=${sort}&order=${order}`
  }
  if (page) {
    queryString += `&page=${page}`
  }

  queryString += `&per_page=${PER_PAGE}`

  const result = await api.request({
    url: `/search/repositories${queryString}`
  },
  ctx.req,
  ctx.res
  )
  
  return {
    repos: result.data
  }
}

export default withRouter(Search)