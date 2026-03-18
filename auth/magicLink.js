'use strict';

const crypto = require('crypto');
const config = require('./config');

// token → { email, expiresAt }
const pendingTokens = new Map();

// email → timestamp (last sent time for rate limiting)
const rateLimitMap = new Map();

const TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MS = 60 * 1000; // 1 email per 60 seconds per address

/**
 * Generate a magic link token for the given email.
 * Returns the full verification URL or null if rate-limited.
 */
function generateMagicLink(email) {
  const normalizedEmail = email.toLowerCase();

  // Rate limit check
  const lastSent = rateLimitMap.get(normalizedEmail);
  if (lastSent && Date.now() - lastSent < RATE_LIMIT_MS) {
    return null; // rate limited
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + TOKEN_EXPIRY_MS;

  pendingTokens.set(token, { email: normalizedEmail, expiresAt });
  rateLimitMap.set(normalizedEmail, Date.now());

  return `${config.siteUrl}/auth/verify?token=${token}`;
}

/**
 * Validate a magic link token. Returns the email if valid, null otherwise.
 * Token is consumed (one-time use).
 */
function validateMagicLink(token) {
  const entry = pendingTokens.get(token);
  if (!entry) {
    return null;
  }

  // Always delete (one-time use)
  pendingTokens.delete(token);

  if (Date.now() > entry.expiresAt) {
    return null;
  }

  return entry.email;
}

/**
 * Clean up expired tokens and stale rate limit entries.
 */
function cleanupExpiredTokens() {
  const now = Date.now();

  for (const [token, entry] of pendingTokens) {
    if (now > entry.expiresAt) {
      pendingTokens.delete(token);
    }
  }

  // Clean up rate limit entries older than 2x the limit window
  for (const [email, ts] of rateLimitMap) {
    if (now - ts > RATE_LIMIT_MS * 2) {
      rateLimitMap.delete(email);
    }
  }
}

let cleanupInterval = null;

function startCleanup() {
  if (!cleanupInterval) {
    cleanupInterval = setInterval(cleanupExpiredTokens, 5 * 60 * 1000);
    cleanupInterval.unref(); // don't prevent process exit
  }
}

function stopCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

module.exports = {
  generateMagicLink,
  validateMagicLink,
  cleanupExpiredTokens,
  startCleanup,
  stopCleanup,
};
