'use strict';

const crypto = require('crypto');
const { COOKIE_NAME, verifySessionToken } = require('./jwt');

// File extensions that should be served without auth (for login page resources)
const PUBLIC_EXTENSIONS = /\.(js|css|ico|png|svg|jpg|jpeg|woff|woff2|map|json)$/i;

/**
 * Timing-safe comparison of two strings.
 * Returns false if either value is missing or lengths differ.
 */
function safeCompare(a, b) {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Express middleware that requires a valid JWT session cookie.
 * - Skips static asset requests so login page can load its own resources.
 * - Allows internal service-to-service calls via X-Internal-API-Key header.
 * - API requests get 401 JSON; page requests get 302 redirect to /auth/login.
 */
function requireAuth(req, res, next) {
  // Skip static assets
  if (PUBLIC_EXTENSIONS.test(req.path)) {
    return next();
  }

  // Allow internal service-to-service calls via API key
  const internalKey = process.env.INTERNAL_API_KEY;
  const providedKey = req.headers['x-internal-api-key'];
  if (internalKey && providedKey && safeCompare(internalKey, providedKey)) {
    req.user = { email: 'internal-service', roles: ['service'], region: 'internal' };
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
