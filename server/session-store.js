function getRedisSessionId(sid) {
  return `ssid:${sid}`
}

class RedisSessionStore {
  constructor(client) {
    this.client = client
  }

  async get(sid) {
    console.log('get session', sid)
    const id = getRedisSessionId(sid)
    const data = await this.client.get(id)
    if (!data) {
      return null
    }
    try {
      console.log(data);
      
      const result = JSON.parse(data)
      return result
    } catch (error) {
      console.error(error)
    }
  }

  async set(sid, sess, ttl) {
    console.log('set session', sid)
    const id = getRedisSessionId(sid)
    if (typeof ttl === 'number') {
      ttl = Math.ceil(ttl / 1000)
    }
    try {
      const sessStr = JSON.stringify(sess)
      if (ttl) {
        await this.client.setex(id, ttl, sessStr)
      } else {
        await this.client.setex(id, sessStr)
      }
    } catch (error) {
      console.error(error)
    }
  }

  async destroy(sid) {
    console.log('delete session', sid)
    const id = getRedisSessionId(sid)
    try {
      await this.client.del(id)
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = RedisSessionStore