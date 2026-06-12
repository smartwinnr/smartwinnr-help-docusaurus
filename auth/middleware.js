'use strict';

const crypto = require('crypto');
const { COOKIE_NAME, verifySessionToken } = require('./jwt');

// File extensions that should be served without auth (for login page resources)
const PUBLIC_EXTENSIONS = /\.(js|css|ico|png|svg|jpg|jpeg|woff|woff2|map|json)$/i;

const IS_DEV = process.env.NODE_ENV !== 'production';
const VALID_PREVIEW_ROLES = new Set([
  'user', 'manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin',
]);

/**
 * Honor the in-session `?as=<role>` preview when allowed.
 * - In dev (NODE_ENV !== 'production'): any cookied user can preview.
 * - In production: only a real `superadmin` may preview as a lower tier.
 *
 * The override is purely runtime — the cookie is NOT rewritten. Drop the
 * query param to restore the real session.
 */
function maybeApplyPreview(req) {
  const as = req.query && req.query.as;
  if (!as) return;
  if (!req.user) return;
  const canPreview = IS_DEV || (req.user.roles || []).includes('superadmin');
  if (!canPreview) return;
  const roles = String(as)
    .split(',')
    .map((r) => r.trim())
    .filter((r) => VALID_PREVIEW_ROLES.has(r));
  if (roles.length === 0) return;
  req.user = {
    ...req.user,
    roles,
    // Preserve privileges so org-feature availability stays consistent.
    // Mark the request so downstream code (e.g. a preview banner) can detect it.
    preview: true,
  };
}

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
        displayName: payload.displayName || null,
        roles: payload.roles,
        region: payload.region,
        orgId: payload.orgId || null,
        orgName: payload.orgName || null,
        privileges: payload.privileges || [],
      };
      maybeApplyPreview(req);
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
