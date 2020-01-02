import Repo from '../../components/Repo'
import Link from 'next/link'
import { withRouter } from 'next/router'
import api from '../../lib/api'
/**
 * @param {*} queryObject: `owner=sunhangye&name=awesome-vue`
 * Object.entries: [['owner', 'sunhangye'], ['name', 'awesome-vue']]
 * Array.reduce: [] => ['owner=sunhangye', 'name=awesome-vue']
 * owner = sunhangye&name=awesome-vue
 */
function makeQuery(queryObject) {  
  const query = Object.entries(queryObject)
    .reduce((result, entry) => {
      result.push(entry.join('='))
      return result
    }, []).join('&')
    console.log('query', query)
    return query

}

function Detail({repoBasic, router}) {
  const query = makeQuery(router.query)
  return (
    <div className="root">
      <div className="repo-basic">
        <Repo repo={repoBasic}  />
        <Link href={`/detial?${query}`}>
          <a className="tab index">Readme</a>
        </Link>
        <Link href={`/detail/issues?${query}`}>
          <a className="tab issues">Issues</a>
        </Link>
      </div>
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
Detail.getInitialProps = async ({ router, ctx }) => {
  const { owner, name } = ctx.query

  const {data: repoBasic} = await api.request({
    url: `/repos/${owner}/${name}`
  },
  ctx.req, ctx.res)

  return {
    repoBasic
  }

}
export default withRouter(Detail)