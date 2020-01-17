import WithRepoBasic from '../../components/WithRepoBasic'
import dynamic from 'next/dynamic'
import api from '../../lib/api'
const MarkdownRender = dynamic(() => import('../../components/MarkdownRender'))
import { genDetailCacheKey, genDetailCacheKeyStrate } from '../../lib/util'

import initCache from '../../lib/client-cache-new'


const { cache, useCache } = initCache({
  genCacheKeyStrate: (context) => genDetailCacheKeyStrate(context)
})

function Detail({ readme, router }) {

  useCache(genDetailCacheKey(router), { readme })

  return (
    <MarkdownRender content={readme.content} isBase64={true} />
  )
}
Detail.getInitialProps = cache(async ({ ctx: { query: { owner, name }, req, res }}) => {
  const readmeResp = await api.request({
    url: `/repos/${owner}/${name}/readme`
  }, req, res)
  
  return {
    readme: readmeResp.data
  }
})
export default WithRepoBasic(Detail, 'index')