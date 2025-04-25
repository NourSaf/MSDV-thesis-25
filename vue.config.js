module.exports = {
  devServer: {
    disableHostCheck: true,
    proxy: {
      '/api/gradio': {
        target: 'https://huggingface.co/spaces/NourSafadi95/rightditector/api',
        changeOrigin: true,
        pathRewrite: {
          '^/api/gradio': ''
        }
      }
    }
  },
  publicPath: '/MSDV-thesis-25/',
  transpileDependencies: [
    '@gradio/client'
  ]
};