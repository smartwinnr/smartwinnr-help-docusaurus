'use strict';

// Exercises db/release-events.js against a throwaway SQLite file. The env
// var must be set BEFORE chat-logger is required (it reads CHAT_LOG_DB_PATH
// at module load), which is why this file sets it at the very top.

const path = require('path');
const os = require('os');
const fs = require('fs');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-events-test-'));
process.env.CHAT_LOG_DB_PATH = path.join(tmpDir, 'test.db');
process.env.CHAT_LOGGING_ENABLED = 'true';

const test = require('node:test');
const assert = require('node:assert/strict');

const { recordEvent, listEvents, getSummary } = require('../db/release-events');
const { cleanOldRecords, closeDb } = require('../db/chat-logger');

test.after(() => {
  try { if (typeof closeDb === 'function') closeDb(); } catch { /* best-effort */ }
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* best-effort */ }
});

test('recordEvent validates kind and status', () => {
  assert.equal(recordEvent({ dispatchId: 'd1', kind: 'nope', status: 'ok' }).ok, false);
  assert.equal(recordEvent({ dispatchId: 'd1', kind: 'dispatch', status: 'created' }).ok, false);
  assert.equal(recordEvent({ kind: 'dispatch', status: 'ok' }).ok, false);
  assert.equal(recordEvent({ dispatchId: 'd1', kind: 'dispatch', status: 'ok' }).ok, true);
});

test('change rows round-trip with JSON fields and filters apply', () => {
  const base = { dispatchId: 'd2', kind: 'change', tag: 'v1.2.3', deployer: 'dev', audience: 'client' };
  assert.equal(recordEvent({ ...base, issueId: 101, status: 'created', module: 'quiz', match: { method: 'none' }, relevance: { verdict: 'relevant', confidence: 'high' }, durationMs: 1234.6 }).ok, true);
  assert.equal(recordEvent({ ...base, issueId: 102, status: 'skipped-not-relevant', module: 'quiz', relevance: { verdict: 'not-relevant', confidence: 'high', reason: 'tooling' } }).ok, true);
  assert.equal(recordEvent({ ...base, issueId: 103, status: 'rate-limited', error: 'Rate limit' }).ok, true);

  const all = listEvents({ days: 1, kind: 'change' });
  assert.ok(all.length >= 3);
  const skipped = listEvents({ days: 1, status: 'skipped-not-relevant' });
  assert.equal(skipped.length, 1);
  assert.equal(skipped[0].issue_id, '102');
  assert.equal(JSON.parse(skipped[0].relevance_json).reason, 'tooling');
  const created = listEvents({ days: 1, status: 'created', issueId: '101' });
  assert.equal(created.length, 1);
  assert.equal(created[0].duration_ms, 1235);
  assert.equal(JSON.parse(created[0].match_json).method, 'none');
});

test('getSummary counts statuses, finds the last dispatch, and ranks rejections', () => {
  recordEvent({ dispatchId: 'd3', kind: 'dispatch', tag: 'v1.2.4', deployer: 'dev', status: 'ok', meta: { changesCount: 3, counts: { created: 2, error: 1 } } });
  const s = getSummary({ days: 1 });
  assert.ok(s.dispatchCount >= 2);
  assert.ok((s.changeCounts['skipped-not-relevant'] || 0) >= 1);
  assert.equal(s.lastDispatch.tag, 'v1.2.4');
  // The newest dispatch's meta carries an error count -> streak starts at 1.
  assert.ok(s.errorStreak >= 1);
  assert.ok(s.rejectionsByModule.some((r) => r.module === 'quiz'));
});

test('retention sweeps old release events on the RELEASE_EVENTS_RETENTION_DAYS window', () => {
  // Insert a synthetic old row by writing directly, then run the sweep.
  const { getDb } = require('../db/chat-logger');
  getDb().prepare(`
    INSERT INTO release_events (created_at, dispatch_id, kind, status)
    VALUES (?, 'old-dispatch', 'dispatch', 'ok')
  `).run(new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString());
  assert.equal(listEvents({ days: 500, tag: undefined }).filter((e) => e.dispatch_id === 'old-dispatch').length, 1);
  cleanOldRecords(90); // chat retention; release events use their own 365-day default
  assert.equal(listEvents({ days: 500 }).filter((e) => e.dispatch_id === 'old-dispatch').length, 0);
  // Recent rows survive.
  assert.ok(listEvents({ days: 1 }).length > 0);
});
