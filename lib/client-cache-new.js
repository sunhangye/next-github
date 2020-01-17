import LRU from 'lru-cache'
import { useEffect } from 'react'
const isServer = typeof 'window' === 'undefined'
const DEFAULT_CACHE_KEY = 'cache'

export default function initClientCache({ lruConfig = {}, genCacheKeyStrate} = {}) {
  // 默认10分钟缓存
  const {
    maxAge = 1000 * 60 * 10,
    ...restConfig
  } = lruConfig || {}

  const lryCache = new LRU({
    maxAge,
    ...restConfig
  })

  function getCacheKey(context) {
    return genCacheKeyStrate ? genCacheKeyStrate(context) : DEFAULT_CACHE_KEY
  }
  /**
   * 缓存客户端渲染得到的getInitialProps返回的props
   * @param {fun} fn getInitialProps
   */
  function cache(fn) {
    if (isServer) {
      return fn
    }

    return async (...args) => {
      // 获取key
      const key = getCacheKey(...args)
      // 获取key对应缓存内容
      const cache = lryCache.get(key)
      // 返回缓存数据
      if (cache) {
        return cache
      }
      // 获取第一次数据 也就是getInitialProps返回的props
      const result = await fn(...args)
      // 缓存数据
      lryCache.set(key, result)
      // 返回props
      return result
    }
  }

  function setCache(key, cachedData) {
    lryCache.set(key, cachedData)
  }

  function getCachedData(key) {
    return lryCache.get(key)
  }

  /**
   * 允许外部客户端（ 除了getInitialProps之外的地方）缓存数据
   * @param {*} key 
   * @param {*} cachedData 
   */
  function useCache(key, cachedData) {
    useEffect(() => {
      if (!isServer) {
        setCache(key, cachedData)
      }
    }, [])
  }

  return {
    cache,
    getCachedData,
    setCache,
    useCache
  }
}
