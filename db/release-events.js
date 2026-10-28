'use strict';

/**
 * Audit trail for the release-draft pipeline (POST /api/release-drafts):
 * one 'dispatch' row per incoming POST plus one 'change' row per change
 * inside it. Backs the /admin/release-events dashboard and the
 * /api/admin/release-events endpoints.
 *
 * Table lives in the chat-logs SQLite DB (Railway volume, survives
 * deploys); schema created in db/chat-logger.js's getDb() init block.
 * Retention is RELEASE_EVENTS_RETENTION_DAYS (default 365), swept by
 * chat-logger's cleanOldRecords.
 *
 * Every write is wrapped so it can NEVER fail a dispatch - an events
 * outage degrades to console noise, exactly like the chat logger's
 * circuit-breaker philosophy (that breaker is module-private, so this
 * module carries its own try/catch instead of reaching into it).
 */

const { getDb } = require('./chat-logger');

const KINDS = new Set(['dispatch', 'change']);
const CHANGE_STATUSES = new Set([
  'created', 'updated', 'skipped-not-relevant', 'needs-foundational-article',
  'rate-limited', 'error',
]);
// 'queued' and 'running' are the in-flight states of an async dispatch (one
// row per dispatch, inserted at enqueue and updated at the end); 'ok' stays
// the terminal success value so existing dashboard logic keeps working.
// 'lost' = the row was still in flight when the server booted, so the job
// died with the previous process.
const DISPATCH_STATUSES = new Set(['queued', 'running', 'ok', 'failed', 'bad-request', 'lost']);
const DISPATCH_IN_FLIGHT = new Set(['queued', 'running']);

function jsonOrNull(value) {
  if (value === undefined || value === null) return null;
  try { return JSON.stringify(value); } catch { return null; }
}

function parseOrNull(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

/**
 * Fire-and-forget insert. Returns {ok} / {ok:false, error}; never throws.
 * fields: { dispatchId, kind, tag?, deployer?, audience?, issueId?,
 *           issueUrl?, changeType?, subject?, status, module?, articlePath?,
 *           matchMethod?, match?, relevance?, durationMs?, error?, meta? }
 * (match/relevance/meta are plain objects, stored as JSON.)
 */
function recordEvent(fields) {
  try {
    const f = fields || {};
    if (!f.dispatchId || !KINDS.has(f.kind)) {
      return { ok: false, error: 'dispatchId and a valid kind are required' };
    }
    const validStatuses = f.kind === 'dispatch' ? DISPATCH_STATUSES : CHANGE_STATUSES;
    if (!validStatuses.has(f.status)) {
      return { ok: false, error: `Invalid status "${f.status}" for kind "${f.kind}"` };
    }
    getDb().prepare(`
      INSERT INTO release_events (
        created_at, dispatch_id, kind, tag, deployer, audience,
        issue_id, issue_url, change_type, subject, status, module,
        article_path, match_method, match_json, relevance_json,
        duration_ms, error, meta_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      new Date().toISOString(),
      String(f.dispatchId),
      f.kind,
      f.tag != null ? String(f.tag) : null,
      f.deployer != null ? String(f.deployer) : null,
      f.audience != null ? String(f.audience) : null,
      f.issueId != null ? String(f.issueId) : null,
      f.issueUrl != null ? String(f.issueUrl) : null,
      f.changeType != null ? String(f.changeType) : null,
      f.subject != null ? String(f.subject).slice(0, 500) : null,
      f.status,
      f.module != null ? String(f.module) : null,
      f.articlePath != null ? String(f.articlePath) : null,
      f.matchMethod != null ? String(f.matchMethod) : null,
      jsonOrNull(f.match),
      jsonOrNull(f.relevance),
      Number.isFinite(f.durationMs) ? Math.round(f.durationMs) : null,
      f.error != null ? String(f.error).slice(0, 2000) : null,
      jsonOrNull(f.meta),
    );
    return { ok: true };
  } catch (err) {
    console.error('[release-events] recordEvent failed (dispatch unaffected):', err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Move a dispatch row written at enqueue to its next state. Never throws.
 * fields: { status, durationMs?, error?, meta?, results? } - results is the
 * per-change results[] array the deployer reads back through GET.
 */
function updateDispatch(dispatchId, fields) {
  try {
    const f = fields || {};
    if (!dispatchId || !DISPATCH_STATUSES.has(f.status)) {
      return { ok: false, error: 'dispatchId and a valid dispatch status are required' };
    }
    const info = getDb().prepare(`
      UPDATE release_events
      SET status = ?, duration_ms = ?, error = ?, meta_json = ?, results_json = ?
      WHERE kind = 'dispatch' AND dispatch_id = ?
    `).run(
      f.status,
      Number.isFinite(f.durationMs) ? Math.round(f.durationMs) : null,
      f.error != null ? String(f.error).slice(0, 2000) : null,
      jsonOrNull(f.meta),
      jsonOrNull(f.results),
      String(dispatchId),
    );
    if (info.changes === 0) {
      // The enqueue insert never landed (events outage at the time) - write
      // the terminal row now so the audit trail still has the dispatch.
      return recordEvent({ dispatchId, kind: 'dispatch', status: f.status, durationMs: f.durationMs, error: f.error, meta: f.meta, ...(f.audience ? { audience: f.audience } : {}), ...(f.tag ? { tag: f.tag } : {}), ...(f.deployer ? { deployer: f.deployer } : {}) });
    }
    return { ok: true };
  } catch (err) {
    console.error('[release-events] updateDispatch failed (dispatch unaffected):', err.message);
    return { ok: false, error: err.message };
  }
}

/** The dispatch row (latest, if several) with meta/results parsed, or null. */
function getDispatch(dispatchId) {
  try {
    const row = getDb().prepare(`
      SELECT * FROM release_events
      WHERE kind = 'dispatch' AND dispatch_id = ?
      ORDER BY id DESC LIMIT 1
    `).get(String(dispatchId));
    if (!row) return null;
    return {
      dispatchId: row.dispatch_id,
      status: row.status,
      tag: row.tag,
      deployer: row.deployer,
      audience: row.audience,
      createdAt: row.created_at,
      durationMs: row.duration_ms,
      error: row.error,
      meta: parseOrNull(row.meta_json) || {},
      results: parseOrNull(row.results_json) || [],
    };
  } catch (err) {
    console.error('[release-events] getDispatch failed:', err.message);
    return null;
  }
}

/**
 * Boot sweep: any dispatch still queued/running belongs to a process that
 * no longer exists (single replica), so mark it lost. The deployer polling
 * it then gets a terminal answer, holds its marker, and retries next deploy.
 * @returns number of rows marked
 */
function markStaleDispatchesLost() {
  try {
    const info = getDb().prepare(`
      UPDATE release_events SET status = 'lost', error = 'server restarted mid-dispatch'
      WHERE kind = 'dispatch' AND status IN ('queued', 'running')
    `).run();
    if (info.changes > 0) console.log(`[release-events] marked ${info.changes} in-flight dispatch(es) lost after restart`);
    return info.changes;
  } catch (err) {
    console.error('[release-events] markStaleDispatchesLost failed:', err.message);
    return 0;
  }
}

/** Newest-first event rows. All filters optional. */
function listEvents({ days = 30, status, tag, issueId, kind, limit = 50, offset = 0 } = {}) {
  const db = getDb();
  const clauses = ['created_at >= ?'];
  const params = [new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()];
  if (status) { clauses.push('status = ?'); params.push(String(status)); }
  if (tag) { clauses.push('tag = ?'); params.push(String(tag)); }
  if (issueId) { clauses.push('issue_id = ?'); params.push(String(issueId)); }
  if (kind) { clauses.push('kind = ?'); params.push(String(kind)); }
  return db.prepare(`
    SELECT * FROM release_events
    WHERE ${clauses.join(' AND ')}
    ORDER BY created_at DESC, id DESC
    LIMIT ? OFFSET ?
  `).all(...params, Number(limit), Number(offset));
}

/**
 * Dashboard summary over the window: per-status change counts, dispatch
 * count, the last dispatch row, the current consecutive-failed-dispatch
 * streak, and the modules accruing the most relevance rejections (the
 * feedback signal for no-client-article-modules.js on the source side).
 */
function getSummary({ days = 30 } = {}) {
  const db = getDb();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const changeCounts = {};
  for (const row of db.prepare(`
    SELECT status, COUNT(*) AS n FROM release_events
    WHERE kind = 'change' AND created_at >= ? GROUP BY status
  `).all(since)) {
    changeCounts[row.status] = row.n;
  }

  const dispatchCount = db.prepare(`
    SELECT COUNT(*) AS n FROM release_events
    WHERE kind = 'dispatch' AND created_at >= ?
  `).get(since).n;

  const lastDispatch = db.prepare(`
    SELECT * FROM release_events
    WHERE kind = 'dispatch'
    ORDER BY created_at DESC, id DESC LIMIT 1
  `).get() || null;

  // Consecutive most-recent dispatches that failed outright or carried
  // at least one per-change error (from the meta_json counts).
  let errorStreak = 0;
  for (const d of db.prepare(`
    SELECT status, meta_json FROM release_events
    WHERE kind = 'dispatch'
    ORDER BY created_at DESC, id DESC LIMIT 20
  `).all()) {
    if (DISPATCH_IN_FLIGHT.has(d.status)) continue; // not decided yet - neither breaks nor extends the streak
    let hasErrors = d.status !== 'ok';
    if (!hasErrors && d.meta_json) {
      try {
        const meta = JSON.parse(d.meta_json);
        hasErrors = !!(meta && meta.counts && meta.counts.error > 0);
      } catch { /* unreadable meta counts as clean */ }
    }
    if (hasErrors) errorStreak++;
    else break;
  }

  const rejectionsByModule = db.prepare(`
    SELECT module, COUNT(*) AS n FROM release_events
    WHERE kind = 'change' AND status = 'skipped-not-relevant'
      AND created_at >= ? AND module IS NOT NULL
    GROUP BY module ORDER BY n DESC LIMIT 10
  `).all(since);

  return {
    days,
    dispatchCount,
    changeCounts,
    lastDispatch,
    errorStreak,
    rejectionsByModule,
  };
}

module.exports = { recordEvent, updateDispatch, getDispatch, markStaleDispatchesLost, listEvents, getSummary };
