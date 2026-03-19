'use strict';

const REQUIRED_IN_PRODUCTION = [
  'HELP_JWT_SECRET',
  'HELP_SITE_URL',
  'LAMBDA_MAGIC_LINK_URL',
];

function loadConfig() {
  const env = process.env;
  const isProd = env.NODE_ENV === 'production';

  if (isProd) {
    const missing = REQUIRED_IN_PRODUCTION.filter((k) => !env[k]);
    if (missing.length) {
      throw new Error(
        `Missing required auth env vars in production: ${missing.join(', ')}`
      );
    }
  }

  return Object.freeze({
    jwtSecret: env.HELP_JWT_SECRET || 'dev-jwt-secret-change-me',
    siteUrl: env.HELP_SITE_URL || 'http://localhost:3000',
    lambdaMagicLinkUrl: env.LAMBDA_MAGIC_LINK_URL || '',
    isProd,
  });
}

module.exports = loadConfig();
