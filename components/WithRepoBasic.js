import Repo from './Repo'
import Link from 'next/link'
import { withRouter } from 'next/router'
import api from '../lib/api'
import { genDetailCacheKey, genDetailCacheKeyStrate } from '../lib/util'
import initCache from '../lib/client-cache-new'

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

const { cache, useCache } = initCache({
  genCacheKeyStrate: genDetailCacheKeyStrate
})

const isServer = typeof window === 'undefined'

export default (Comp, type = 'index') => {
  const WithDetail = ({ repoBasic, router, ...rest }) => {
    const query = makeQuery(router.query)

    useCache(genDetailCacheKey(router), { repoBasic, router, ...rest })

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
        <div style={{padding: '0 20px'}}><Comp { ...rest} router={router} /></div>
        <style jsx>{`
          .root {
            padding-top: 20px;
          }
          .repo-basic {
            padding: 20px;
            border: 1px solid #eee;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .tab + .tab {
            margin-left: 20px;
          }
          `}</style>
      </div>
    )
  }
  WithDetail.getInitialProps = cache(async (context) => {
    const { router, ctx } = context
    const { owner, name } = ctx.query


    let compProps = {}
    if (typeof Comp.getInitialProps === 'function') {
      compProps = await Comp.getInitialProps(context)
    }

    const {data: repoBasic} = await api.request({
      url: `/repos/${owner}/${name}`
    },
    ctx.req, ctx.res)
    return {
      repoBasic,
      ...compProps
    }

  })
  return withRouter(WithDetail)
}