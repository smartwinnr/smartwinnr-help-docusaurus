'use strict';

const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { signSessionToken, COOKIE_NAME, COOKIE_OPTIONS, verifySessionToken } = require('./jwt');
const { lookupUserRegion } = require('./dynamo');
const { getUserByEmail, hasPrivilegedRole } = require('./mongo');
const { generateMagicLink, validateMagicLink } = require('./magicLink');
const { sendMagicLinkEmail } = require('./mailer');
const { renderLoginPage } = require('./loginPage');

const router = express.Router();

// Rate limiter for magic link endpoint: max 5 requests per minute per IP
const magicLinkLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * GET /auth/login — Serve standalone login page
 */
router.get('/login', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(renderLoginPage());
});

/**
 * POST /auth/magic-link — Initiate magic link flow
 * Accepts { email }, does DynamoDB+MongoDB lookup, sends magic link.
 * Always returns success message to prevent email enumeration.
 */
router.post('/magic-link', magicLinkLimiter, async (req, res) => {
  const { email } = req.body || {};
  const genericMessage =
    'If this email is registered as an editor or admin, you will receive a sign-in link shortly.';

  if (!email || typeof email !== 'string') {
    return res.json({ message: genericMessage });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // 1. Look up user region in DynamoDB
    const regionInfo = await lookupUserRegion(normalizedEmail);
    if (!regionInfo) {
      console.log(`Auth: email not found in DynamoDB: ${normalizedEmail}`);
      return res.json({ message: genericMessage });
    }

    // 2. Check user role in regional MongoDB
    const user = await getUserByEmail(regionInfo, normalizedEmail);
    if (!user) {
      console.warn(`Auth: user in DynamoDB but not in MongoDB: ${normalizedEmail} (region: ${regionInfo.baseUrl})`);
      return res.json({ message: genericMessage });
    }

    if (!hasPrivilegedRole(user)) {
      console.log(`Auth: user lacks editor/admin role: ${normalizedEmail}`);
      return res.json({ message: genericMessage });
    }

    // 3. Generate magic link
    const magicLinkUrl = generateMagicLink(normalizedEmail);
    if (!magicLinkUrl) {
      // Rate limited (per-email)
      return res.json({ message: genericMessage });
    }

    // 4. Send email
    await sendMagicLinkEmail(normalizedEmail, magicLinkUrl);
    console.log(`Auth: magic link sent to ${normalizedEmail}`);
  } catch (err) {
    console.error('Auth: error in magic link flow:', err.message);
    // Don't expose internal errors — return generic message
  }

  return res.json({ message: genericMessage });
});

/**
 * GET /auth/verify — Validate magic link token, set JWT cookie, redirect
 */
router.get('/verify', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    res.set('Content-Type', 'text/html');
    return res.send(renderLoginPage('Invalid or missing token.'));
  }

  const email = validateMagicLink(token);
  if (!email) {
    res.set('Content-Type', 'text/html');
    return res.send(renderLoginPage('This link has expired or has already been used. Please request a new one.'));
  }

  try {
    // Re-verify role (in case it changed since the magic link was sent)
    const regionInfo = await lookupUserRegion(email);
    if (!regionInfo) {
      res.set('Content-Type', 'text/html');
      return res.send(renderLoginPage('Account not found. Please contact your administrator.'));
    }

    const user = await getUserByEmail(regionInfo, email);
    if (!user || !hasPrivilegedRole(user)) {
      res.set('Content-Type', 'text/html');
      return res.send(renderLoginPage('You do not have permission to access the Help Center.'));
    }

    const roles = user.roles || [];
    const sessionToken = signSessionToken({
      email,
      roles,
      region: regionInfo.baseUrl,
    });

    res.cookie(COOKIE_NAME, sessionToken, COOKIE_OPTIONS);
    return res.redirect('/');
  } catch (err) {
    console.error('Auth: error verifying magic link:', err.message);
    res.set('Content-Type', 'text/html');
    return res.send(renderLoginPage('Service temporarily unavailable. Please try again.'));
  }
});

/**
 * GET /auth/callback — Validate handoff token from primary SmartWinnr app
 * Token format: base64url(JSON payload).HMAC-SHA256-hex
 */
router.get('/callback', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.redirect('/auth/login');
  }

  try {
    const dotIndex = token.lastIndexOf('.');
    if (dotIndex === -1) {
      return res.redirect('/auth/login');
    }

    const payloadB64 = token.substring(0, dotIndex);
    const signature = token.substring(dotIndex + 1);

    // Verify HMAC
    const expectedSig = crypto
      .createHmac('sha256', config.handoffSecret)
      .update(payloadB64)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSig, 'hex'))) {
      console.warn('Auth: invalid handoff signature');
      return res.redirect('/auth/login');
    }

    // Decode payload
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson);

    // Check expiry
    if (!payload.exp || Date.now() / 1000 > payload.exp) {
      console.warn('Auth: expired handoff token');
      return res.redirect('/auth/login');
    }

    // Verify role via DynamoDB + MongoDB
    const email = (payload.email || '').toLowerCase();
    const regionInfo = await lookupUserRegion(email);
    if (!regionInfo) {
      return res.redirect('/auth/login');
    }

    const user = await getUserByEmail(regionInfo, email);
    if (!user || !hasPrivilegedRole(user)) {
      return res.redirect('/auth/login');
    }

    const roles = user.roles || [];
    const sessionToken = signSessionToken({
      email,
      roles,
      region: regionInfo.baseUrl,
    });

    res.cookie(COOKIE_NAME, sessionToken, COOKIE_OPTIONS);
    return res.redirect('/');
  } catch (err) {
    console.error('Auth: error in handoff callback:', err.message);
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
 * GET /auth/status — Return current auth status (requires valid cookie)
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
