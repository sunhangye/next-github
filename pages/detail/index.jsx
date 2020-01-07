import WithRepoBasic from '../../components/WithRepoBasic'
import api from '../../lib/api'
import MarkdownRender from '../../components/MarkdownRender'


function Detail({ readme }) {


  return (
    <MarkdownRender content={readme.content} />
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