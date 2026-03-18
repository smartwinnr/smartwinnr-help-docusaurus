'use strict';

const { COOKIE_NAME, verifySessionToken } = require('./jwt');

// File extensions that should be served without auth (for login page resources)
const PUBLIC_EXTENSIONS = /\.(js|css|ico|png|svg|jpg|jpeg|woff|woff2|map|json)$/i;

/**
 * Express middleware that requires a valid JWT session cookie.
 * - Skips static asset requests so login page can load its own resources.
 * - API requests get 401 JSON; page requests get 302 redirect to /auth/login.
 */
function requireAuth(req, res, next) {
  // Skip static assets
  if (PUBLIC_EXTENSIONS.test(req.path)) {
    return next();
  }

  const token = req.cookies && req.cookies[COOKIE_NAME];

  if (token) {
    try {
      const payload = verifySessionToken(token);
      req.user = {
        email: payload.email,
        roles: payload.roles,
        region: payload.region,
      };
      return next();
    } catch (err) {
      // Invalid/expired token — fall through to unauthenticated handling
    }
  }

  // Not authenticated
  const isApiRequest =
    req.path.startsWith('/api/') ||
    (req.headers.accept && req.headers.accept.includes('application/json'));

  if (isApiRequest) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Redirect to login with the original URL for post-login redirect
  const redirectUrl = encodeURIComponent(req.originalUrl);
  return res.redirect(302, `/auth/login?redirect=${redirectUrl}`);
}

module.exports = { requireAuth };
