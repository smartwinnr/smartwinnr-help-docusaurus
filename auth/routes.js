'use strict';

const express = require('express');
const config = require('./config');
const { signSessionToken, COOKIE_NAME, COOKIE_OPTIONS, verifySessionToken } = require('./jwt');
const { renderLoginPage } = require('./loginPage');

const router = express.Router();

/**
 * GET /auth/login — Serve standalone login page
 */
router.get('/login', (req, res) => {
  const error = req.query.error === 'invalid_token'
    ? 'This link has expired or is invalid. Please request a new one.'
    : null;
  res.set('Content-Type', 'text/html');
  res.send(renderLoginPage(config.lambdaMagicLinkUrl, error));
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

    // Defense in depth: re-check that roles include editor or admin
    const roles = payload.roles || [];
    const hasAccess = roles.some((r) => r === 'editor' || r === 'admin');
    if (!hasAccess) {
      console.warn('Auth: JWT valid but user lacks editor/admin role');
      return res.redirect('/auth/login');
    }

    // Sign a new session token (so cookie expiry is independent of the incoming JWT)
    const sessionToken = signSessionToken({
      email: payload.email,
      roles: payload.roles,
      region: payload.region,
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
      roles: payload.roles,
    });
  } catch (err) {
    return res.json({ authenticated: false });
  }
});

module.exports = router;
