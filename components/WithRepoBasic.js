import Repo from './Repo'
import Link from 'next/link'
import { withRouter } from 'next/router'
import api from '../lib/api'
import { getClientCache, setClientCache } from '../lib/client-cache'
/**
 * @param {*} queryObject: `owner=sunhangye&name=awesome-vue`
 * Object.entries: [['owner', 'sunhangye'], ['name', 'awesome-vue']]
 * Array.reduce: [] => ['owner=sunhangye', 'name=awesome-vue']
 * owner=sunhangye&name=awesome-vue
 */
function makeQuery(queryObject) {
  const query = Object.entries(queryObject)
    .reduce((result, entry) => {
      result.push(entry.join('='))
      return result
    }, []).join('&')
  return query
}
const isServer = typeof window === 'undefined'

export default (Comp, type = 'index') => {
  const WithDetail = ({ repoBasic, router, ...rest }) => {
    const query = makeQuery(router.query)

    return (
      <div className="root">
        <div className="repo-basic">
          <Repo repo={repoBasic}  />
          
          <Link href={`/detail?${query}`}>
            {
              type === 'index' ? (
                <span className="tab">Readme</span>
              ) : (
                <a className="tab index">Readme</a>
              )
            }
          </Link>
          <Link href={`/detail/issues?${query}`}>
            {
              type === 'issues' ? (
                <span className="tab">Issues</span>
              ) : (
                <a className="tab issues">Issues</a>
              )
            }
          </Link>
        </div>
        <div><Comp { ...rest } /></div>
        <style jsx>{`
          .root {
            padding-top: 20px;
          }
          .repo-basic {
            padding: 20px;
            border: 1px solid #eee;
            margin-bottom: 20px;
            border-radius: 5px;
          }
          .tab + .tab {
            margin-left: 20px;
          }
          `}</style>
      </div>
    )
  }
  WithDetail.getInitialProps = async (context) => {
    const { router, ctx } = context
    const { owner, name } = ctx.query


    let compProps = {}
    if (typeof Comp.getInitialProps === 'function') {
      compProps = await Comp.getInitialProps(context)
    }

    debugger
    const full_name = `${owner}/${name}`


    if (getClientCache(full_name)) {
      return {
        repoBasic: getClientCache(full_name),
        ...compProps
      }
    }

    const {data: repoBasic} = await api.request({
      url: `/repos/${owner}/${name}`
    },
    ctx.req, ctx.res)
    return {
      repoBasic,
      ...compProps
    }
    if (isServer) setClientCache(repoBasic)

  }
  return withRouter(WithDetail)
}