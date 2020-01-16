import WithRepoBasic from '../../components/WithRepoBasic'
import dynamic from 'next/dynamic'
import api from '../../lib/api'
const MarkdownRender = dynamic(() => import('../../components/MarkdownRender'))

function Detail({ readme }) {


  return (
    <MarkdownRender content={readme.content} isBase64={true} />
  )
}
Detail.getInitialProps = async ({ ctx: { query: { owner, name }, req, res }}) => {
  const readmeResp = await api.request({
    url: `/repos/${owner}/${name}/readme`
  }, req, res)
  
  return {
    readme: readmeResp.data
  }
}
export default WithRepoBasic(Detail, 'index')