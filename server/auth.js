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
        console.log(result);
        const { token_type, access_token } = result.data

        const userInfoResp = await axios({
          method: 'GET',
          url: 'https://api.github.com/user',
          headers: {
            Authorization: `${token_type} ${access_token}`
          }
        })
        console.log(userInfoResp.data)
        
        ctx.session.userInfo = userInfoResp.data
        ctx.redirect('/')
      } else {
        ctx.body = `request token failed ${result.message}`
      }
    } else {
      await next()
    }
  })
}

module.exports = auth