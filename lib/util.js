import moment from 'moment'

moment.locale('zh-cn')

export function getTimeFromNow (time) {
  return moment(time).fromNow()
}

// 生成详情页缓存key
export const genDetailCacheKey = (ctx) => {
  const { query, pathname } = ctx
  const { owner, name } = query
  console.log(`${pathname}-${owner}-${name}`)
  return `${pathname}-${owner}-${name}`
}

export const genDetailCacheKeyStrate = (context) => {
  const { ctx } = context
  return genDetailCacheKey(ctx)
}

/**
 * 
 * @param {*} query `{query: "vue2"}
 * @returns 'vue2'
 */
export const getCacheKeyByQuery = (query) => {
  return Object.keys(query).reduce((prev, cur) => {
    prev += query[cur]
    return prev
  }, '')
}



