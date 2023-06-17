const {
  defineConfig
} = require("@vue/cli-service");
const {
  resolve
} = require('path')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            // 在这里设置全局的 less 变量，例如：
            // 'primary-color': '#1DA57A'
          },
          javascriptEnabled: true,
        }
      }
    }
  },
  chainWebpack: config => {
    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/assets/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/assets/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  }
});