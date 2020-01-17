import WithRepoBasic from '../../components/WithRepoBasic'
import api from '../../lib/api'
import { Avatar, Button, Select, Spin } from 'antd'
import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { getTimeFromNow } from '../../lib/util'
import SearchUser from '../../components/SearchUser'

import { genDetailCacheKey, genDetailCacheKeyStrate } from '../../lib/util'

import initCache from '../../lib/client-cache-new'
const MdRenderer = dynamic(() => import('../../components/MarkdownRender'))

const { Option } = Select

// 缓存labels数据
const CACHE = {}

const { cache, useCache } = initCache({
  genCacheKeyStrate: (context) => {
    return genDetailCacheKeyStrate(context)
  },
})

const isServer = typeof window === 'undefined'

const makeQuery = (creator, state, labels) => {
  const creatorStr = creator ? `creator=${creator}` : ''
  const stateStr = state ? `state=${state}` : ''
  const labelStr = labels && labels.length > 0 ? `labels=${labels.join(',')}` : ''
  let queryArr = []

  if (creatorStr) queryArr.push(creatorStr)
  if (stateStr) queryArr.push(stateStr)
  if (labelStr) queryArr.push(labelStr)

  return `?${queryArr.join('&')}`
}

function Label({ label } ) {
  return (
    <>
      <span className="label"> {label.name} </span>
      <style> {`
        .label {
          margin-left: 8px;
          height: 20px;
          padding: .15em 4px;
          font-size: 12px;
          font-weight: 600;
          line-height: 15px;
          border-radius: 2px;
          box-shadow: inset 0 -1px 0 rgba(27,31,35,.12);
          background-color: #${label.color};
        }
        `} </style>
    </>
  )
}

function IssuesDetail({ issue }) {
  
  return (
    <div className="root">
      <MdRenderer content={issue.body} />
      <Button href={issue.url} target="_blank">打开Issue讨论页面</Button>
      <style jsx>{`
      .root {
        background: #fefefe;
        padding: 20px;
      }
      `}</style>
    </div>
  )
}
function IssuesItem ({issue}) {
  const [showDetail, setShowDetail] = useState(false)

  const toggleShowDetail = useCallback(() => {
    setShowDetail(showDetail => !showDetail)
  }, [])
  return (
    <>
    <div className="issue">
      <Button
        type="primary"
        size="small"
        style={{ position: 'absolute', right: '10px', top: '10px' }}
        onClick={toggleShowDetail}
      >
        { showDetail ? '隐藏' : '查看' }
      </Button>
      <div className="avatar">
        <Avatar src={issue.user.avatar_url} shape='square' size={50} />
      </div>
      <div className="main-info">
        <h6>
          <span>{ issue.title }</span>
            {
              issue.labels.map((label) => <Label label={label} key={label.id} />)
            }
        </h6>
        <p className="sub-info">
          <span>Updated at { getTimeFromNow(issue.updated_at) } </span>
        </p>
      </div>
      <style jsx> {`
        .issue {
          display: flex;
          position: relative;
          padding: 10px;
        }
        .issue:hover {
          background: #fafafa;
        }
        .issue + .issue {
          border-top: 1px solid #eee;
        }
        .main-info>h6 {
          max-width: 600px;
          font-size: 16px;
        }
        .avatar {
          margin-right: 20px;
        }
        .sub-info {
          margin-bottom: 0;
        }
        .sub-info > span {
          display: inline-block;
        }
        `} </style>
    </div>
      {showDetail ? <IssuesDetail issue={issue} /> : null}
    </>
  )
}

function Issues({ services, router }) {
  const { initIssues, labels } = services
  useCache(genDetailCacheKey(router), { services })
  const { owner, name } = router.query
  // 创建者
  const [creator, setCreator] = useState('')
  // 状态
  const [issueState, setIssueState] = useState()
  // 标签
  const [selectedLabels, setSelectedLabels] = useState([])
  // 请求到的问题数据
  const [issues, setIssues] = useState(initIssues)
  // 请求状态
  const [fetching, setFetching] = useState(false)

  const handleCreatorChange = useCallback(
    (value) => {
      setCreator(value)
    },
    [],
  )

  const handleStateChange = useCallback(
    (value) => {
      setIssueState(value)
    },
    []
  )

  const handleLabelChange = useCallback(
    (value) => {
      setSelectedLabels(value)
    },
    []
  )

  const handleSearch = useCallback(async () => {
    setFetching(true)
    const { data: resultIssues } = await api.request({
      url: `/repos/${owner}/${name}/issues${makeQuery(creator, issueState, selectedLabels)}`
    })
    try {
      setIssues(resultIssues)
    } catch (error) {
      console.error(error)
    }
    setFetching(false)

  }, [owner, name, fetching, creator, issueState, selectedLabels])

  useEffect(() => {
    if (!isServer) {
      CACHE[`${owner}/${name}`] = labels
    }
  }, [owner, name, labels])

  return (
    <div className="root">
      <div className="search">
        <SearchUser onChange={handleCreatorChange}  value={creator} />
        <Select
          placeholder="状态"
          onChange={handleStateChange}
          style={{width: 200,margin: '0 20px'}}
          >
            <Option value="all">all</Option>
            <Option value="open">open</Option>
            <Option value="closed">closed</Option>
        </Select>
        <Select
          mode="multiple"
          placeholder="标签"
          onChange={handleLabelChange}
          style={{ flexGrow: 1, width: 200, marginRight: 20}}
        >
          {
            labels.map(label => (
              <Option key={label.id} value={label.id}>{label.name}</Option>
            ))
          }
        </Select>
        <Button type="primary" size="small" disabled={fetching} onClick={handleSearch} style={{marginRight: 10}}>搜索</Button>
      </div>
      <div className="issues">
        {
          fetching ?
            (
              <div className="loading">
                <Spin size="small" />
              </div>
            ) :
            (
            issues.map(issue => (
              <IssuesItem issue={issue} key={issue.id} />
            ))
          )
        }
      </div>
      <style jsx> {`
        .search {
          display: flex;
          margin-top: 10px;
        }
        .loading {
          height: 400px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        `} </style>
    </div>
  )
}

Issues.getInitialProps = cache(async ({ ctx: { query: { owner, name }, req, res }}) => {
  const full_name = `${owner}/${name}`
  const [issuesResp, labelsResp] = await Promise.all([
    api.request({
      url: `/repos/${owner}/${name}/issues`
    }, req, res),
    CACHE[full_name] ? Promise.resolve({ data: CACHE[full_name]}) :
    api.request({
      url: `/repos/${owner}/${name}/labels`
    }, req, res)
  ])

  return {
    services: {
      initIssues: issuesResp.data,
      labels: labelsResp.data,
    }
    
  }
})

export default WithRepoBasic(Issues, 'issues')