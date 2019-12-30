const axios = require('axios')
const { requestGithub } = require('../lib/api')

const GITHUB_BASE_URL = 'https://api.github.com'

module.exports = (server) => {
  server.use(async (ctx, next) => {

    const { path, url, method } = ctx
    const proxyPrefix = '/github/'

    if (path.startsWith(proxyPrefix)) {
      const { githubAuth } = ctx.session
      const { access_token, token_type } = githubAuth || {}
      const headers = {}

      if (access_token) {
        headers.Authorization = `${token_type} ${access_token}`
      }

      try {
        const result = await requestGithub(
          method,
          url.replace('/github/', '/'),
          ctx.request.body || {},
          headers
        )
        ctx.status = result.status
        ctx.body = result.data
      } catch (error) {
        console.error(error)

      }

    } else {
      await next()
    }
  })
}