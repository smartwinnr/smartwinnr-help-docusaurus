'use strict';

const cookieParser = require('cookie-parser');
const authRoutes = require('./routes');
const { requireAuth } = require('./middleware');

/**
 * Wire authentication into an Express app:
 * 1. cookie-parser middleware
 * 2. /auth routes (public)
 * 3. requireAuth middleware (protects everything mounted after this)
 */
function initAuth(app) {
  app.use(cookieParser());
  app.use('/auth', authRoutes);
  app.use(requireAuth);
  console.log('Auth initialized');
}

module.exports = { initAuth, requireAuth };
