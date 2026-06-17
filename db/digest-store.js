'use strict';

/**
 * CRUD for the digest_subscriptions + digest_send_log tables. Tables live
 * in the chat-logs SQLite DB; we reuse chat-logger's connection so there's
 * one open handle per process.
 *
 * Schema created in db/chat-logger.js's getDb() init block.
 */

const { getDb } = require('./chat-logger');

const VALID_TYPES = new Set(['editor-gap', 'ops-snapshot', 'module-overview']);
const VALID_STATUSES = new Set(['sent', 'failed', 'no-recipients', 'no-data']);

function isValidType(t) { return VALID_TYPES.has(t); }
function listValidTypes() { return [...VALID_TYPES]; }

function listSubscriptions({ digestType } = {}) {
  const db = getDb();
  if (digestType) {
    return db.prepare(`
      SELECT id, digest_type, email, region, added_at, added_by
      FROM digest_subscriptions
      WHERE digest_type = ?
      ORDER BY added_at DESC
    `).all(digestType);
  }
  return db.prepare(`
    SELECT id, digest_type, email, region, added_at, added_by
    FROM digest_subscriptions
    ORDER BY digest_type, added_at DESC
  `).all();
}

/** Returns {ok, id, error}. Validates type + email shape + uniqueness. */
function addSubscription({ digestType, email, region, addedBy }) {
  if (!isValidType(digestType)) return { ok: false, error: `Invalid digest_type. Allowed: ${listValidTypes().join(', ')}` };
  const e = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return { ok: false, error: 'Invalid email' };
  const r = String(region || 'global').trim();
  const db = getDb();
  try {
    const info = db.prepare(`
      INSERT INTO digest_subscriptions (digest_type, email, region, added_at, added_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(digestType, e, r, new Date().toISOString(), addedBy || null);
    return { ok: true, id: info.lastInsertRowid };
  } catch (err) {
    if (/UNIQUE/i.test(err.message)) {
      return { ok: false, error: `${e} is already subscribed to ${digestType}` };
    }
    return { ok: false, error: err.message };
  }
}

function removeSubscription(id) {
  const db = getDb();
  const info = db.prepare(`DELETE FROM digest_subscriptions WHERE id = ?`).run(Number(id));
  return { ok: info.changes > 0, removed: info.changes };
}

/** Subscribers for a single digest type, oldest first (so the send order
 *  matches subscription order). Returned shape matches what the send
 *  pipeline groups by region. */
function getSubscribersByType(digestType) {
  const db = getDb();
  return db.prepare(`
    SELECT id, email, region
    FROM digest_subscriptions
    WHERE digest_type = ?
    ORDER BY added_at ASC
  `).all(digestType);
}

/** Append one row to the send log. status MUST be one of VALID_STATUSES. */
function logSend({ digestType, recipientCount = 0, status, error = null, metaJson = null }) {
  if (!isValidType(digestType)) throw new Error(`Invalid digest_type: ${digestType}`);
  if (!VALID_STATUSES.has(status)) throw new Error(`Invalid status: ${status}`);
  const db = getDb();
  const info = db.prepare(`
    INSERT INTO digest_send_log (digest_type, sent_at, recipient_count, status, error, meta_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(digestType, new Date().toISOString(), recipientCount | 0, status, error, metaJson);
  return { ok: true, id: info.lastInsertRowid };
}

function getRecentSends({ digestType, limit = 50 } = {}) {
  const db = getDb();
  if (digestType) {
    return db.prepare(`
      SELECT id, digest_type, sent_at, recipient_count, status, error, meta_json
      FROM digest_send_log
      WHERE digest_type = ?
      ORDER BY sent_at DESC
      LIMIT ?
    `).all(digestType, Math.min(Number(limit) || 50, 500));
  }
  return db.prepare(`
    SELECT id, digest_type, sent_at, recipient_count, status, error, meta_json
    FROM digest_send_log
    ORDER BY sent_at DESC
    LIMIT ?
  `).all(Math.min(Number(limit) || 50, 500));
}

/** Most-recent send per digest type, used by the admin page's per-card
 *  "last sent" badge. CTE picks the max id per type (autoincrement PK
 *  is monotonic and unique per insert, so two rows with the same sent_at
 *  millisecond still resolve to a single "latest"), then joins back to
 *  fetch the row. */
function getLastSendByType() {
  const db = getDb();
  return db.prepare(`
    WITH latest AS (
      SELECT digest_type, MAX(id) AS max_id
      FROM digest_send_log
      GROUP BY digest_type
    )
    SELECT l.digest_type, s.sent_at, s.status
    FROM latest l
    JOIN digest_send_log s ON s.id = l.max_id
    ORDER BY l.digest_type
  `).all();
}

module.exports = {
  isValidType,
  listValidTypes,
  listSubscriptions,
  addSubscription,
  removeSubscription,
  getSubscribersByType,
  logSend,
  getRecentSends,
  getLastSendByType,
};
