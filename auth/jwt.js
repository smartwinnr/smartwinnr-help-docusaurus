'use strict';

const jwt = require('jsonwebtoken');
const config = require('./config');

const COOKIE_NAME = 'swhelp_session';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProd,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

function signSessionToken({ email, roles, region }) {
  return jwt.sign({ email, roles, region }, config.jwtSecret, {
    expiresIn: '7d',
  });
}

function verifySessionToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = {
  COOKIE_NAME,
  COOKIE_OPTIONS,
  signSessionToken,
  verifySessionToken,
};
