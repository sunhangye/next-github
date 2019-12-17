const Koa = require('koa')
const Router = require('koa-router')
const next = require('next')
const session = require('koa-session')

const RedisSessionStore = require('./session-store')
const Redis = require('ioredis')

const PORT = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const auth = require('./auth')

// const redis = new Redis()

app.prepare().then(() => {
  const server = new Koa()
  const router = new Router()

  /**
   * ctx.req和ctx.res 是 node 原生提供的
   * 之所以要传递 ctx.req和ctx.res， 是因为 next 并不只是兼容 koa 这个框架， 所以需要传递 node 原生提供的 req 和 res
   */

  server.use(async (ctx, next) => {
    
    await next()
  })

  server.keys = ['51cto Develop Training App']

  const SESSION_CONFIG = {
    key: 'jid',
    // store: new RedisSessionStore(redis)
  }

  server.use(session(SESSION_CONFIG, server))
  auth(server)


  router.get('/a/:id', async ctx => {
    const id = ctx.params.id
    await handle(ctx.req, ctx.res, {
      pathname: '/a',
      query: {
        id
      },
    })
    ctx.respond = false
  })

  // 添加redis session
  router.get('/api/user/info', async ctx => {
    const user = ctx.session.userInfo
    if (!user) {
      ctx.status = '401'
      ctx.body = 'Need Login'
    } else {
      ctx.body = user
      ctx.set('Content-Type', 'application/json')
    }

  })

  // 删除redis session
  router.get('/delete/user', async ctx => {
    ctx.session = null
    ctx.body = 'destroy session success'
  })

  server.use(router.routes())

  server.use(async (ctx, next) => {
    
    ctx.req.session = ctx.session
    await handle(ctx.req, ctx.res)
    ctx.respond = false
  })

  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`)
  })
})

// redis-server redis-cli  set a 123  get a