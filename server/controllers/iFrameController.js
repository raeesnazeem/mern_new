const { createProxyMiddleware } = require("http-proxy-middleware");

const wpAdminProxy = createProxyMiddleware({
  target: "https://customlayout.gogroth.com",
  changeOrigin: true,
  secure: false,
  ws: true,
  logLevel: "debug",

  // Enabling timeouts to prevent 504 errors on long operations
  proxyTimeout: 120000, // 2 minutes
  timeout: 120000,

  onProxyReq(proxyReq, req, res) {
    // Prevents garbled/gibberish responses from WordPress
    proxyReq.removeHeader("accept-encoding");
  },

  onProxyRes(proxyRes, req, res) {
    // Allows the WordPress admin to be embedded in an iframe
    delete proxyRes.headers["x-frame-options"];

    // Correctly rewrites login cookies for cross-domain use
    if (proxyRes.headers["set-cookie"]) {
      const cookies = proxyRes.headers["set-cookie"].map((cookie) => {
        return (
          cookie
            .replace(/; secure/gi, "")
            .replace(/; SameSite=Lax/gi, "")
            .replace(/; SameSite=Strict/gi, "") + "; SameSite=None; Secure"
        );
      });
      proxyRes.headers["set-cookie"] = cookies;
    }
  },
});

module.exports = wpAdminProxy;