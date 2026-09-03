'use strict';

/**
 * A durable map of every email that has ever become an article owner
 * (see setFrontmatterOwner in frontmatter.js - owner is only ever set at
 * publish time, so this registry only ever grows via a real human
 * publishing something, never via the release pipeline's service account).
 *
 * Purpose: when publishHandler sees an owner email it has never recorded
 * before, that's the signal to (a) add them here and (b) send them a
 * one-time notice explaining what this email address is now used for -
 * cheap, durable identity tracking without a real user-directory
 * integration, and it means nobody is surprised the first time they get
 * an "your article needs review" email.
 *
 * Tracked in git (not gitignored) - this is team roster data worth
 * reviewing/curating over time, not ephemeral log output.
 */

const fsSync = require('fs');
const path = require('path');

const KNOWN_AUTHORS_PATH = path.join(__dirname, '..', 'known-authors.json');

function loadKnownAuthors() {
  try {
    if (!fsSync.existsSync(KNOWN_AUTHORS_PATH)) return {};
    return JSON.parse(fsSync.readFileSync(KNOWN_AUTHORS_PATH, 'utf8'));
  } catch (e) {
    console.error('known-authors: failed to read registry, treating as empty:', e.message);
    return {};
  }
}

function isKnownAuthor(email) {
  if (!email) return true; // nothing to notify - don't treat as "new"
  const registry = loadKnownAuthors();
  return Object.prototype.hasOwnProperty.call(registry, email.toLowerCase());
}

/** Records a first-seen author. Best-effort - a registry write failure
 *  must never block the publish it's recording. */
function recordAuthor(email) {
  try {
    const registry = loadKnownAuthors();
    const key = email.toLowerCase();
    if (registry[key]) return; // already recorded (race with another publish)
    registry[key] = { firstSeenAt: new Date().toISOString() };
    fsSync.writeFileSync(KNOWN_AUTHORS_PATH, JSON.stringify(registry, null, 2) + '\n', 'utf8');
  } catch (e) {
    console.error('known-authors: failed to record (publish unaffected):', e.message);
  }
}

module.exports = { KNOWN_AUTHORS_PATH, loadKnownAuthors, isKnownAuthor, recordAuthor };
