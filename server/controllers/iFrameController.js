const { createProxyMiddleware } = require("http-proxy-middleware");

const wpAdminProxy = createProxyMiddleware({
  target: "https://customlayout.gogroth.com",
  changeOrigin: true,
  secure: false,
  ws: true,

  onProxyReq(proxyReq, req, res) {
    // Fixes compression issues
    proxyReq.removeHeader("accept-encoding");
  },

  onProxyRes(proxyRes, req, res) {
    // Fixes iframe blocking
    delete proxyRes.headers["x-frame-options"];

    // --- NEW CSP FIX ---
    // Get the existing CSP header, or start a new one
    let csp = proxyRes.headers["content-security-policy"] || "";
    // Make sure font-src 'self' is included to allow local fonts
    if (csp && !csp.includes("font-src")) {
      csp += "; font-src 'self'";
      proxyRes.headers["content-security-policy"] = csp;
    }

    // Fixes cross-domain cookie authentication
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
