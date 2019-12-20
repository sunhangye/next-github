import Axios from "axios"
const github_base_url = 'https://api.github.com'
const isServer = typeof window === 'undefined'

const requestGithhub = async (method, url, data, headers) {

  return await Axios({
    method,
    url: `${github_base_url}url`
    data,
    headers
  })
}
/**
 * 对getInitialProps服务端渲染补全url路径
 * 服务端渲染请求补上header token
 * 浏览器渲染请求发送到koa再去正则匹配路径处理请求
 * @param {*} param0
 * @param {*} req
 * @param {*} res
 */
const request = async ({ method='GET', url, data={}, headers}, req, res) => {
  if (!url) {
    throw Error('url must provider')
  }
  if (isServer) {
    const { githubAuth } = req.session
    const { access_token, token_type } = githubAuth || {}
    const headers = {}

    if (access_token) {
      headers.Authorization = `${token_type} ${access_token}`
    }
    return await requestGithhub(method, url, data, headers)
  }
  // 
  return await Axios({
    method,
    url: `/github${url}`,
    data
  })
}

module.exports = {
  requestGithhub,
  request
}