#!/usr/bin/env node
/**
 * CLI mirror of /auth/dev-login. Mints a JWT for the supplied role +
 * privileges so headless tools (curl, Puppeteer, Playwright) can hit the
 * authenticated help site without going through the magic-link flow.
 *
 * Usage:
 *   node scripts/dev-mint-cookie.js --role editor
 *   node scripts/dev-mint-cookie.js --role manager --privileges managerView,quiz
 *   node scripts/dev-mint-cookie.js --role superadmin --display-name Sasha
 *
 * Output (stdout): two lines
 *   <RAW_JWT>
 *   Set-Cookie: swhelp_session=<RAW_JWT>; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800
 *
 * Reads HELP_JWT_SECRET from the environment (same secret the server uses).
 */

'use strict';

require('dotenv').config({path: require('path').resolve(__dirname, '..', '.env')});

const path = require('path');
const fs = require('fs');
const {signSessionToken, COOKIE_NAME, COOKIE_OPTIONS} = require('../auth/jwt');

const VALID_ROLES = new Set([
  'user', 'manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin',
]);

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      out[key] = '';
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function camel(k) {
  // accept both --display-name and --displayName
  return k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function usage() {
  console.error(`
Usage: node scripts/dev-mint-cookie.js [flags]

  --role <r>              required; one of: ${[...VALID_ROLES].join(', ')}
                          (comma-separated for multi-role users)
  --privileges <list>     comma-separated privilege keys. Omit (or empty)
                          for NO privileges - the realistic default that
                          exposes privilege-gating leaks. Pass '*' as
                          shorthand for ALL known privileges.
  --email <email>         default: dev@example.com
  --display-name <name>   default: first word of the email local-part
  --org-name <name>       default: Dev Org
  --org-id <id>           default: dev-org
  --region <region>       default: local
`);
  process.exit(2);
}

function loadKnownPrivileges() {
  const file = path.join(__dirname, '..', 'data', 'known-privileges.json');
  try {
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(json.privileges) ? json.privileges : [];
  } catch {
    return [];
  }
}

function guessFirstName(email) {
  const local = String(email || '').split('@')[0] || 'dev';
  return local.replace(/[._-].*$/, '').replace(/^\w/, (c) => c.toUpperCase()) || 'Dev';
}

function main() {
  const argv = parseArgs(process.argv.slice(2));
  const get = (k) => argv[k] !== undefined ? argv[k] : argv[camel(k)];

  const rawRole = get('role');
  if (!rawRole) usage();

  const roles = rawRole.split(',').map((r) => r.trim()).filter(Boolean);
  const invalid = roles.filter((r) => !VALID_ROLES.has(r));
  if (roles.length === 0 || invalid.length > 0) {
    console.error(`Invalid role(s): ${invalid.join(', ') || '(none)'}`);
    console.error(`Valid: ${[...VALID_ROLES].join(', ')}`);
    process.exit(2);
  }

  const KNOWN = loadKnownPrivileges();
  const privArg = get('privileges');
  let privileges;
  if (privArg === undefined || privArg === '') {
    privileges = [];
  } else if (privArg.trim() === '*') {
    privileges = KNOWN;
  } else {
    privileges = privArg.split(',').map((p) => p.trim()).filter(Boolean);
  }

  const email = get('email') || 'dev@example.com';
  const displayName = get('display-name') || guessFirstName(email);
  const orgName = get('org-name') || 'Dev Org';
  const orgId = get('org-id') || 'dev-org';
  const region = get('region') || 'local';

  const jwt = signSessionToken({email, displayName, roles, region, orgId, orgName, privileges});

  const maxAge = Math.floor((COOKIE_OPTIONS.maxAge || 7 * 24 * 60 * 60 * 1000) / 1000);
  const setCookie =
    `Set-Cookie: ${COOKIE_NAME}=${jwt}; Path=${COOKIE_OPTIONS.path || '/'}` +
    (COOKIE_OPTIONS.httpOnly ? '; HttpOnly' : '') +
    (COOKIE_OPTIONS.secure ? '; Secure' : '') +
    `; SameSite=${COOKIE_OPTIONS.sameSite || 'Lax'}` +
    `; Max-Age=${maxAge}`;

  // Two lines: the raw token first (for tools that want it), then a copy-paste-
  // friendly Set-Cookie header line.
  process.stdout.write(jwt + '\n');
  process.stdout.write(setCookie + '\n');
}

main();
