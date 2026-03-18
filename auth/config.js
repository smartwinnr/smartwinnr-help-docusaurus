'use strict';

const REQUIRED_IN_PRODUCTION = [
  'HELP_JWT_SECRET',
  'HANDOFF_SHARED_SECRET',
  'HELP_SITE_URL',
  'MAILGUN_API_KEY',
  'MAILGUN_DOMAIN',
  'MONGO_URI_AP_SOUTH_1',
  'MONGO_URI_EU_WEST_1',
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
    handoffSecret: env.HANDOFF_SHARED_SECRET || 'dev-handoff-secret-change-me',
    siteUrl: env.HELP_SITE_URL || 'http://localhost:3000',
    awsRegion: env.AWS_REGION_AUTH || 'eu-west-1',
    mailgunApiKey: env.MAILGUN_API_KEY || '',
    mailgunDomain: env.MAILGUN_DOMAIN || 'mail.smartwinnr.com',
    mailgunFrom:
      env.MAILGUN_FROM || 'SmartWinnr <noreply@mail.smartwinnr.com>',
    mongoUriApSouth1: env.MONGO_URI_AP_SOUTH_1 || '',
    mongoUriEuWest1: env.MONGO_URI_EU_WEST_1 || '',
    isProd,
  });
}

module.exports = loadConfig();
