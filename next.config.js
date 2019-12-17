const withCss = require('@zeit/next-css')
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer')
const config = require('./config')

const { GITHUB_OAUTH_URL } = config

if (typeof require !== 'undefined') {
  require.extensions['.css'] = file => {}
}



// withCss得到的是一个next的config配置
module.exports = withBundleAnalyzer(withCss({
  publicRuntimeConfig: {
    GITHUB_OAUTH_URL,
    OAUTH_URL: config.OAUTH_URL,
  },
}))