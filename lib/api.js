const axios = require('axios')

const github_base_url = 'https://api.github.com'

const isServer = typeof window === 'undefined'

const requestGithub = async (method, url, data, headers) => {

  return await axios({
    method,
    url: `${github_base_url}${url}`,
    data,
    headers
  })
}
/**
 * 对getInitialProps服务端渲染补全url路径
 * 服务端渲染请求补上header token
 * 浏览器渲染请求发送到koa再去正则匹配路径服务端处理请求， 发送axios再到isServer中补全 `github_base_url` 完成转发
 * 
 * @param {*} param0
 * @param {*} req
 * @param {*} res
 */
const request = async ({ method='GET', url, data={}}, req, res) => {
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
    return await requestGithub(method, url, data, headers)
  }

  return await axios({
    method,
    url: `/github${url}`,
    data
  })
}

module.exports = {
  requestGithub,
  request
}