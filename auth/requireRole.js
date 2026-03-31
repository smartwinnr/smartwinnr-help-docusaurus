'use strict';

/**
 * Express middleware factory that requires the authenticated user
 * to have a specific role in their JWT payload.
 *
 * Must be used AFTER requireAuth middleware (which sets req.user).
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || !req.user.roles || !req.user.roles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { requireRole };
