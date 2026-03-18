'use strict';

const cookieParser = require('cookie-parser');
const authRoutes = require('./routes');
const { requireAuth } = require('./middleware');
const { startCleanup, stopCleanup } = require('./magicLink');
const { closeAllConnections } = require('./mongo');

/**
 * Wire authentication into an Express app:
 * 1. cookie-parser middleware
 * 2. /auth routes (public)
 * 3. requireAuth middleware (protects everything mounted after this)
 * 4. Start magic link cleanup interval
 */
function initAuth(app) {
  // Parse cookies on all requests
  app.use(cookieParser());

  // Public auth routes
  app.use('/auth', authRoutes);

  // Protect everything mounted after this call
  app.use(requireAuth);

  // Start periodic cleanup of expired magic link tokens
  startCleanup();

  console.log('🔐 Authentication initialized');
}

module.exports = {
  initAuth,
  requireAuth,
  closeAllConnections,
  stopCleanup,
};
