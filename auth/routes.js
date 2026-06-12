'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const config = require('./config');
const { signSessionToken, COOKIE_NAME, COOKIE_OPTIONS, verifySessionToken } = require('./jwt');
const { renderLoginPage } = require('./loginPage');

const router = express.Router();
const IS_DEV = process.env.NODE_ENV !== 'production';

const VALID_ROLES = new Set([
  'user', 'manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin',
]);

/**
 * Lazy-load the LMS privileges snapshot so the dev-login default ("all
 * privileges enabled") matches reality. Falls back to an empty array if the
 * file is missing.
 */
function loadKnownPrivileges() {
  try {
    const file = path.join(__dirname, '..', 'data', 'known-privileges.json');
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(json.privileges) ? json.privileges : [];
  } catch {
    return [];
  }
}

function guessFirstName(email) {
  const local = String(email || '').split('@')[0] || 'dev';
  return local
    .replace(/[._-].*$/, '')
    .replace(/^\w/, (c) => c.toUpperCase()) || 'Dev';
}

/**
 * GET /auth/login — Serve standalone login page
 */
router.get('/login', (req, res) => {
  const error = req.query.error === 'invalid_token'
    ? 'This link has expired or is invalid. Please request a new one.'
    : null;
  res.set('Content-Type', 'text/html');
  res.send(renderLoginPage(config.lambdaMagicLinkUrl, error, IS_DEV));
});

/**
 * GET /auth/callback — Receive JWT from smartwinnr_prd, verify, set cookie
 * Query param: ?token=<JWT>&redirect=<optional path>
 */
router.get('/callback', (req, res) => {
  const { token, redirect } = req.query;

  if (!token) {
    return res.redirect('/auth/login');
  }

  try {
    const payload = verifySessionToken(token);

    // Defense in depth: re-check that the user has a recognized SmartWinnr role.
    // Help center is accessible to all SmartWinnr personas; the sidebar gates
    // sections per role. Anyone without one of these roles is rejected.
    const ALLOWED_ROLES = ['user', 'manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin'];
    const roles = payload.roles || [];
    const hasAccess = roles.some((r) => ALLOWED_ROLES.includes(r));
    if (!hasAccess) {
      console.warn('Auth: JWT valid but user has no recognized SmartWinnr role');
      return res.redirect('/auth/login');
    }

    // Sign a new session token (so cookie expiry is independent of the incoming JWT)
    const sessionToken = signSessionToken({
      email: payload.email,
      displayName: payload.displayName || null,
      roles: payload.roles,
      region: payload.region,
      orgId: payload.orgId,
      orgName: payload.orgName || null,
      privileges: payload.privileges,
    });

    res.cookie(COOKIE_NAME, sessionToken, COOKIE_OPTIONS);

    // Only allow path-based redirects (must start with /). Reject fragments,
    // empty strings, or absolute URLs to prevent redirect loops and open redirects.
    var safePath = (redirect && redirect.startsWith('/')) ? redirect : '/';
    return res.redirect(safePath);
  } catch (err) {
    console.error('Auth: invalid callback token:', err.message);
    return res.redirect('/auth/login');
  }
});

/**
 * POST /auth/logout — Clear cookie, redirect to login
 */
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  return res.redirect('/auth/login');
});

/**
 * GET /auth/status — Return current auth status from cookie
 */
router.get('/status', (req, res) => {
  const token = req.cookies && req.cookies[COOKIE_NAME];

  if (!token) {
    return res.json({ authenticated: false });
  }

  try {
    const payload = verifySessionToken(token);
    return res.json({
      authenticated: true,
      email: payload.email,
      displayName: payload.displayName || null,
      roles: payload.roles,
      region: payload.region,
      orgId: payload.orgId || null,
      orgName: payload.orgName || null,
      privileges: payload.privileges || [],
    });
  } catch (err) {
    return res.json({ authenticated: false });
  }
});

/**
 * GET /auth/dev-login — DEV-ONLY (process.env.NODE_ENV !== 'production').
 * Mints a session cookie for the supplied role + privileges so devs can flip
 * tiers in one click without the Mailgun magic-link round-trip.
 *
 *   /auth/dev-login?role=editor
 *   /auth/dev-login?role=manager&privileges=managerView,quiz
 *   /auth/dev-login?role=editor&privileges=*           ← shorthand for ALL known privs
 *   /auth/dev-login?role=superadmin&displayName=Sasha&orgName=Acme
 *
 * Defaults:
 *   role        → 'user'
 *   privileges  → NONE (empty array). This is intentional: a role without
 *                 privileges is the real-world default and exposes
 *                 privilege-gating leaks. To grant everything, pass
 *                 `?privileges=*` (or list specific keys explicitly).
 *   email       → 'dev@example.com'
 *   displayName → derived from the email's first word
 *   orgName     → 'Dev Org'
 *   region      → 'local'
 *
 * Not registered in production builds — a curl in prod returns 404.
 */
if (IS_DEV) {
  router.get('/dev-login', (req, res) => {
    const KNOWN = loadKnownPrivileges();

    const rawRole = String(req.query.role || 'user');
    const roles = rawRole.split(',').map((r) => r.trim()).filter(Boolean);
    const invalid = roles.filter((r) => !VALID_ROLES.has(r));
    if (roles.length === 0 || invalid.length > 0) {
      return res.status(400).json({
        error: 'invalid role',
        validRoles: [...VALID_ROLES],
        receivedRoles: roles,
        invalidRoles: invalid,
      });
    }

    let privileges;
    if (req.query.privileges === undefined || req.query.privileges === '') {
      // Default: empty privileges, so privilege-gating leaks show up
      // immediately in dev testing. Opt into the full set with `*`.
      privileges = [];
    } else if (String(req.query.privileges).trim() === '*') {
      privileges = KNOWN;
    } else {
      privileges = String(req.query.privileges)
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
    }

    const email = String(req.query.email || 'dev@example.com');
    const displayName = String(req.query.displayName || guessFirstName(email));
    const orgName = String(req.query.orgName || 'Dev Org');
    const region = String(req.query.region || 'local');
    const orgId = String(req.query.orgId || 'dev-org');
    const redirectRaw = req.query.redirect;
    const redirect = typeof redirectRaw === 'string' && redirectRaw.startsWith('/')
      ? redirectRaw
      : '/';

    const token = signSessionToken({
      email,
      displayName,
      roles,
      region,
      orgId,
      orgName,
      privileges,
    });

    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    console.log(
      `🛠  /auth/dev-login → ${roles.join('+')} (privileges: ${privileges.length}/${KNOWN.length})`
    );
    return res.redirect(redirect);
  });
}

module.exports = router;
