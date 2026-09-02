'use strict';

/**
 * SQLite-backed article feedback logger. Mirrors db/chat-logger.js for
 * circuit-breaker + retention semantics. Records "Was this helpful?" votes
 * on individual articles plus optional free-text comments.
 *
 * Schema:
 *   feedback (id, ts, slug, vote 'up'|'down', viewer_email, comment, user_agent)
 *
 * Public API:
 *   recordVote({slug, vote, viewerEmail, comment, userAgent})
 *   summary(days)                  → rollup for the dashboard
 *   forArticle(slug, limit, days)  → per-article detail
 *   getStats()                     → {totalVotes, articleCount, helpfulPct}
 *   deleteByEmail(email)           → GDPR deletion (mirrors chat-logger)
 */

const path = require('path');
const fs = require('fs');

const ENABLED = (process.env.FEEDBACK_LOGGING_ENABLED || 'true').toLowerCase() !== 'false';
const DB_PATH = process.env.FEEDBACK_LOG_DB_PATH
  || path.join(__dirname, '..', 'data', 'feedback.db');
const RETENTION_DAYS = parseInt(process.env.FEEDBACK_RETENTION_DAYS || '365', 10);
const CIRCUIT_RESET_MS = parseInt(process.env.FEEDBACK_CIRCUIT_RESET_MS || '60000', 10);
const MAX_FAILURES = 5;

let consecutiveFailures = 0;
let circuitOpenedAt = null;

function isCircuitOpen() {
  if (consecutiveFailures < MAX_FAILURES) return false;
  if (circuitOpenedAt && Date.now() - circuitOpenedAt > CIRCUIT_RESET_MS) {
    consecutiveFailures = 0;
    circuitOpenedAt = null;
    console.log('[feedback-logger] Circuit breaker reset - retrying writes');
    return false;
  }
  return true;
}
function recordSuccess() {
  consecutiveFailures = 0;
  circuitOpenedAt = null;
}
function recordFailure(err) {
  consecutiveFailures++;
  if (consecutiveFailures >= MAX_FAILURES && !circuitOpenedAt) {
    circuitOpenedAt = Date.now();
  }
  console.error(`[feedback-logger] Write failed (${consecutiveFailures}/${MAX_FAILURES}):`, err.message);
}

let _db = null;
function getDb() {
  if (_db) return _db;
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
  const Database = require('better-sqlite3');
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('synchronous = NORMAL');
  _db.exec(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT NOT NULL,
      slug TEXT NOT NULL,
      vote TEXT NOT NULL CHECK (vote IN ('up', 'down')),
      viewer_email TEXT,
      comment TEXT,
      user_agent TEXT
    );
    CREATE INDEX IF NOT EXISTS feedback_slug_idx ON feedback(slug);
    CREATE INDEX IF NOT EXISTS feedback_ts_idx ON feedback(ts);
    CREATE INDEX IF NOT EXISTS feedback_slug_email_idx ON feedback(slug, viewer_email);
  `);
  // Prune old rows on init and every 24h (init-only meant retention was
  // never enforced on a long-lived container between deploys).
  pruneOldRows(_db);
  setInterval(() => pruneOldRows(_db), 24 * 3600 * 1000);
  return _db;
}

function pruneOldRows(db) {
  try {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 3600 * 1000).toISOString();
    db.prepare('DELETE FROM feedback WHERE ts < ?').run(cutoff);
  } catch (err) {
    console.error('[feedback-logger] prune failed:', err.message);
  }
}

function recordVote({slug, vote, viewerEmail, comment, userAgent}) {
  if (!ENABLED) return {ok: false, reason: 'disabled'};
  if (isCircuitOpen()) return {ok: false, reason: 'circuit-open'};
  if (!slug || (vote !== 'up' && vote !== 'down')) {
    return {ok: false, reason: 'invalid-input'};
  }
  try {
    const db = getDb();
    const ts = new Date().toISOString();
    const trimmedComment = (comment || '').trim() || null;
    // One vote per (slug, viewer) - a repeat vote updates the existing row
    // (vote flip, or a comment attached after the initial down-vote) rather
    // than inserting a duplicate. Refresh-and-vote loops used to inflate
    // helpfulPct freely. Anonymous votes (no email) still insert plainly.
    db.transaction(() => {
      const existing = viewerEmail
        ? db.prepare(`
            SELECT id, vote FROM feedback
            WHERE slug = ? AND viewer_email = ?
            ORDER BY id DESC LIMIT 1
          `).get(slug, viewerEmail)
        : null;
      if (existing) {
        // Keep the old comment only when the vote is unchanged and no new
        // comment came in; a vote flip invalidates the prior comment.
        db.prepare(`
          UPDATE feedback
          SET ts = ?, vote = ?,
              comment = CASE
                WHEN ? IS NOT NULL THEN ?
                WHEN vote = ? THEN comment
                ELSE NULL
              END,
              user_agent = ?
          WHERE id = ?
        `).run(ts, vote, trimmedComment, trimmedComment, vote, userAgent || null, existing.id);
      } else {
        db.prepare(`
          INSERT INTO feedback (ts, slug, vote, viewer_email, comment, user_agent)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(ts, slug, vote, viewerEmail || null, trimmedComment, userAgent || null);
      }
    })();
    recordSuccess();
    return {ok: true};
  } catch (err) {
    recordFailure(err);
    return {ok: false, reason: 'write-failed', error: err.message};
  }
}

function summary(days = 30) {
  if (!ENABLED) return {ok: false, reason: 'disabled'};
  try {
    const db = getDb();
    const cutoff = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

    const totals = db.prepare(`
      SELECT COUNT(*) AS total,
             SUM(CASE WHEN vote = 'up'   THEN 1 ELSE 0 END) AS up,
             SUM(CASE WHEN vote = 'down' THEN 1 ELSE 0 END) AS down,
             COUNT(DISTINCT slug) AS articles
      FROM feedback WHERE ts >= ?
    `).get(cutoff);

    // Per-article aggregate
    const perArticle = db.prepare(`
      SELECT slug,
             COUNT(*) AS votes,
             SUM(CASE WHEN vote = 'up' THEN 1 ELSE 0 END) AS up,
             SUM(CASE WHEN vote = 'down' THEN 1 ELSE 0 END) AS down,
             ROUND(100.0 * SUM(CASE WHEN vote = 'up' THEN 1 ELSE 0 END) / COUNT(*), 1) AS helpfulPct
      FROM feedback
      WHERE ts >= ?
      GROUP BY slug
      ORDER BY votes DESC
    `).all(cutoff);

    return {
      ok: true,
      windowDays: days,
      totals,
      perArticle,
    };
  } catch (err) {
    return {ok: false, reason: 'read-failed', error: err.message};
  }
}

function forArticle(slug, limit = 100, days = null) {
  if (!ENABLED) return {ok: false, reason: 'disabled'};
  if (!slug) return {ok: false, reason: 'no-slug'};
  try {
    const db = getDb();
    // Optional window so the dashboard's comment drawer matches the page's
    // date selector instead of always showing all-time rows.
    const cutoff = days && days > 0
      ? new Date(Date.now() - days * 24 * 3600 * 1000).toISOString()
      : null;
    const rows = cutoff
      ? db.prepare(`
          SELECT id, ts, vote, viewer_email, comment, user_agent
          FROM feedback
          WHERE slug = ? AND ts >= ?
          ORDER BY ts DESC
          LIMIT ?
        `).all(slug, cutoff, limit)
      : db.prepare(`
          SELECT id, ts, vote, viewer_email, comment, user_agent
          FROM feedback
          WHERE slug = ?
          ORDER BY ts DESC
          LIMIT ?
        `).all(slug, limit);
    return {ok: true, slug, rows};
  } catch (err) {
    return {ok: false, reason: 'read-failed', error: err.message};
  }
}

/**
 * GDPR deletion - removes every feedback row a viewer left. Counterpart to
 * chat-logger's deleteByEmail so an account-deletion request clears both DBs.
 */
function deleteByEmail(email) {
  if (!email) return 0;
  try {
    const db = getDb();
    const result = db.prepare('DELETE FROM feedback WHERE viewer_email = ?').run(email);
    return result.changes;
  } catch (err) {
    console.error('[feedback-logger] deleteByEmail failed:', err.message);
    return 0;
  }
}

function getStats() {
  if (!ENABLED) return {totalVotes: 0, articleCount: 0, helpfulPct: 0};
  try {
    const db = getDb();
    const row = db.prepare(`
      SELECT COUNT(*) AS total,
             SUM(CASE WHEN vote = 'up' THEN 1 ELSE 0 END) AS up,
             COUNT(DISTINCT slug) AS articles
      FROM feedback
    `).get();
    return {
      totalVotes: row.total || 0,
      articleCount: row.articles || 0,
      helpfulPct: row.total ? Math.round((row.up / row.total) * 100) : 0,
    };
  } catch {
    return {totalVotes: 0, articleCount: 0, helpfulPct: 0};
  }
}

module.exports = {
  recordVote,
  summary,
  forArticle,
  getStats,
  deleteByEmail,
};
