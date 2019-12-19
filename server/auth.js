const axios = require('axios')
const config = require('../config')

const { request_token_url, client_secret, client_id } = config.github

const auth = (server) => {
  server.use(async (ctx, next) => {
    if (ctx.path === '/auth') {
      const code = ctx.query.code
      if (!code) {
        ctx.body = 'code not exit'
        return
      }

      const result = await axios({
        method: 'POST',
        url: request_token_url,
        data: {
          client_id,
          client_secret,
          code
        },
        headers: {
          Accept: 'application/json',
        },
      })

      if (result.status === 200 && result.data && !result.data.error) {
        ctx.session.githubAuth = result.data

        const { token_type, access_token } = result.data

        const userInfoResp = await axios({
          method: 'GET',
          url: 'https://api.github.com/user',
          headers: {
            Authorization: `${token_type} ${access_token}`
          }
        })

        ctx.session.userInfo = userInfoResp.data
        ctx.redirect((ctx.session && ctx.session.urlBeForeAOuth) || '/')
        ctx.session.urlBeForeAOuth = ''
      } else {
        ctx.body = `request token failed ${result.message}`
      }
    } else {
      await next()
    }
  })

  server.use(async (ctx, next) => {
    if (ctx.path === '/user/logout' && ctx.method === 'POST') {
      ctx.session = null
      ctx.body = 'logout sussess'
    } else {
      await next()
    }
  })

  server.use(async (ctx, next) => {
    if (ctx.path === '/prepare-auth' && ctx.method === 'GET') {
      const { url } = ctx.query
      ctx.session.urlBeForeAOuth = url
      ctx.redirect(config.OAUTH_URL)
    } else {
      await next()
    }
  })
  
}

module.exports = auth