const { createProxyMiddleware } = require("http-proxy-middleware");

const wpAdminProxy = createProxyMiddleware({
  target: "https://customlayout.gogroth.com",
  changeOrigin: true,
  secure: false,
  ws: true,
  cookieDomainRewrite: "localhost", // This handles the domain rewrite for you
  onProxyReq(proxyReq, req, res) {
    console.log(`Proxied request to: ${req.method} ${req.url}`);
  },
  onProxyRes(proxyRes, req, res) {
    if (proxyRes.headers["set-cookie"]) {
      const cookies = proxyRes.headers["set-cookie"].map((cookie) => {
        // Ensure cookies work in the iframe
        return (
          cookie
            .replace(/; secure/gi, "") // Remove existing secure flag first
            .replace(/; SameSite=Lax/gi, "") // Remove existing SameSite=Lax
            .replace(/; SameSite=Strict/gi, "") + // Remove existing SameSite=Strict
          // Add the required attributes for cross-site iframes. frontend must be HTTPS for this to work in production.
          "; SameSite=None; Secure"
        );
      });
      proxyRes.headers["set-cookie"] = cookies;
    }
  },
});

module.exports = wpAdminProxy;
