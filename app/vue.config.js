const { defineConfig } = require("@vue/cli-service");
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
  }
});
