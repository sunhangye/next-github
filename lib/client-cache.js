import LYU from 'lru-cache'

/**
 * 使用lru - cache 在浏览器渲染判断到有数据就放到cache中， 超过maxAge不调用则销毁重新请求。否则一直使用一直缓存
 */

export const cache = new LYU({
  maxAge: 1000* 60 * 10
})
export function getClientCache(full_name) {
  return cache.get(full_name)
}
export function setClientCache(repo) {
  const full_name = repo.full_name
  cache.set(full_name, repo)
}

export function setCacheArray(repos) {
  repos.forEach(repo => setClientCache(repo))
}


