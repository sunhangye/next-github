const axios = require('axios')
const github_base_url = 'https://api.github.com'
module.exports = (server) => {
  server.use(async (ctx, next) => {
    const { path, url } = ctx
    const proxyPrefix = '/github/'
    
  })
  server.use(async (ctx, next) => {

    const { path, url } = ctx
    const proxyPrefix = '/github/'

    if (path.startsWith(proxyPrefix)) {
      const { githubAuth } = ctx.session
      const { access_token, token_type } = githubAuth || {}
      const githubPath = `${github_base_url}${url.replace(proxyPrefix, '/')}`
      const headers = {}

      if (access_token) {
        headers.Authorization = `${token_type} ${access_token}`
      }

      try {
        const result = await axios({
          method: 'GET',
          url: githubPath,
          headers
        })
        if (result.status === 200) {
          ctx.body = result.data
        } else {
          ctx.body = result.messge
        }
        ctx.set('Content-Type', 'application/json')
      } catch (error) {
        console.error(error)
        ctx.body = {
          message: error
        }
      }
    } else {
      await next()
    }
  })
}