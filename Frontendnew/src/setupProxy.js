const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // The context for which you want to proxy requests
    createProxyMiddleware({
      target: 'http://localhost:5000', // Your backend server
      changeOrigin: true,
    })
  );
};