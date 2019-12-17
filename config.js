/**
 * 请求code
 * url: https://github.com/login/oauth/authorize
 * client_id
 * scope 获取仓库权限
 * redirect_url,
 * login, 是否允许在登录状态直接登录
 * state, 自用确定是否
 * 
 * 请求token
 * url https://github.com/login/oauth/access_token
 * client_id
 * client_secret
 * code 44328da5c20dfe63885b
 * 
 * 请求用户信息 https: //api.github.com/user
 * 需要在header中添加Authorization字段， 值为token 01 b077cc716d0599c1ac54ed8d30f13ca0f7670b
 */
const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize'
const SCOPE = 'user'

const github = {
  request_token_url: 'https://github.com/login/oauth/access_token',
  client_id: '9b2f689f96a8f9f46a7f',
  client_secret: '7aba86eb6a7aadf33d378239a5c459df82357a93'
}
module.exports = {
  github,
  GITHUB_OAUTH_URL,
  OAUTH_URL: `${GITHUB_OAUTH_URL}?client_id=${github.client_id}&scope=${SCOPE}`,
}
// access_token=01b077cc716d0599c1ac54ed8d30f13ca0f7670b&scope=user&token_type=bearer



/**
 * Oauth Code 保证安全的策略
 *    一次性 code，利用 code 请求过一次 token 后，这个 code 就会失效。
 */