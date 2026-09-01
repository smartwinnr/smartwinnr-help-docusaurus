'use strict';

const cookieParser = require('cookie-parser');
const authRoutes = require('./routes');
const { requireAuth } = require('./middleware');

/**
 * Wire authentication into an Express app:
 * 1. cookie-parser middleware
 * 2. /auth routes (public)
 * 3. /login alias -> /auth/login (public)
 * 4. requireAuth middleware (protects everything mounted after this)
 */
function initAuth(app) {
  app.use(cookieParser());
  app.use('/auth', authRoutes);

  // Public, memorable sign-in entry point. Since the homepage moved to /home
  // and bare / is a 301 to the marketing site, this is how logged-out staff
  // get in - it must be mounted before requireAuth or it would 302 to
  // /auth/login?redirect=/login.
  //
  // 302, never 301: a permanently-cached redirect on the sign-in alias would
  // be unrevertible in every user's browser.
  //
  // Redirects rather than rendering the page: renderLoginPage() is one large
  // self-contained HTML string, and the /auth routes already bounce to
  // /auth/login from their error paths - serving the same page at two URLs
  // would flap users mid-flow and leave two call sites to keep in sync.
  app.get('/login', (req, res) => {
    const redirect = req.query && req.query.redirect;
    const safe = typeof redirect === 'string'
      && redirect.startsWith('/')
      && !redirect.startsWith('//')
      && !redirect.startsWith('/\\');
    res.set('Cache-Control', 'no-store');
    return res.redirect(
      302,
      safe ? `/auth/login?redirect=${encodeURIComponent(redirect)}` : '/auth/login'
    );
  });

  app.use(requireAuth);
  console.log('Auth initialized');
}

module.exports = { initAuth, requireAuth };
