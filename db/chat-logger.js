'use strict';

const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const ENABLED = (process.env.CHAT_LOGGING_ENABLED || 'true').toLowerCase() !== 'false';
const DB_PATH = process.env.CHAT_LOG_DB_PATH || path.join(process.cwd(), 'data', 'chat-logs.db');
const RETENTION_DAYS = parseInt(process.env.CHAT_LOG_RETENTION_DAYS || '90', 10);
const CIRCUIT_RESET_MS = parseInt(process.env.CHAT_LOGGER_CIRCUIT_RESET_MS || '60000', 10);
const MAX_FAILURES = 5;

// ---------------------------------------------------------------------------
// Circuit breaker state
// ---------------------------------------------------------------------------

let consecutiveFailures = 0;
let circuitOpenedAt = null;
let lastCircuitWarning = 0;

function isCircuitOpen() {
  if (consecutiveFailures < MAX_FAILURES) return false;
  // Auto-reset after CIRCUIT_RESET_MS
  if (circuitOpenedAt && Date.now() - circuitOpenedAt > CIRCUIT_RESET_MS) {
    consecutiveFailures = 0;
    circuitOpenedAt = null;
    console.log('[chat-logger] Circuit breaker reset — retrying writes');
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
  console.error(`[chat-logger] Write failed (${consecutiveFailures}/${MAX_FAILURES}):`, err.message);
}

// ---------------------------------------------------------------------------
// Lazy-init SQLite (better-sqlite3)
// ---------------------------------------------------------------------------

let _db = null;

function getDb() {
  if (_db) return _db;

  // Ensure the directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const Database = require('better-sqlite3');
  _db = new Database(DB_PATH);

  // Performance pragmas
  _db.pragma('journal_mode = WAL');
  _db.pragma('synchronous = NORMAL');
  _db.pragma('wal_checkpoint(TRUNCATE)');

  // Create tables
  _db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      message_count INTEGER DEFAULT 0,
      user_page_url TEXT,
      user_agent TEXT,
      user_email TEXT,
      consent_version TEXT DEFAULT '1.0',
      requests_in_window INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS chat_exchanges (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      user_query TEXT NOT NULL,
      ai_response TEXT NOT NULL,
      confidence REAL,
      relevance_score REAL,
      citations_json TEXT,
      num_docs_retrieved INTEGER,
      top_doc_distance REAL,
      page_url TEXT,
      created_at TEXT NOT NULL,
      response_time_ms INTEGER,
      is_fallback INTEGER DEFAULT 0,
      prompt_tokens INTEGER,
      completion_tokens INTEGER,
      user_rating INTEGER,
      contains_pii INTEGER DEFAULT 0,
      is_duplicate INTEGER DEFAULT 0,
      query_type TEXT,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_email TEXT NOT NULL,
      action TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      query_params TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER NOT NULL
    );
  `);

  // Create indexes (IF NOT EXISTS is implicit with CREATE INDEX IF NOT EXISTS)
  _db.exec(`
    CREATE INDEX IF NOT EXISTS idx_exchanges_created_at ON chat_exchanges(created_at);
    CREATE INDEX IF NOT EXISTS idx_exchanges_conversation_id ON chat_exchanges(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_exchanges_confidence ON chat_exchanges(confidence);
    CREATE INDEX IF NOT EXISTS idx_exchanges_relevance_score ON chat_exchanges(relevance_score);
    CREATE INDEX IF NOT EXISTS idx_exchanges_is_fallback ON chat_exchanges(is_fallback);
    CREATE INDEX IF NOT EXISTS idx_exchanges_query_type ON chat_exchanges(query_type);
    CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
    CREATE INDEX IF NOT EXISTS idx_conversations_user_email ON conversations(user_email);
    CREATE INDEX IF NOT EXISTS idx_audit_created_at ON admin_audit_log(created_at);
  `);

  // Run migrations
  runMigrations(_db);

  // Clean old records on startup
  cleanOldRecords(RETENTION_DAYS);

  // Schedule periodic WAL checkpoint (every 6 hours)
  setInterval(() => {
    try {
      _db.pragma('wal_checkpoint(TRUNCATE)');
    } catch (e) {
      console.error('[chat-logger] WAL checkpoint failed:', e.message);
    }
  }, 6 * 60 * 60 * 1000);

  console.log(`[chat-logger] SQLite initialised at ${DB_PATH}`);
  return _db;
}

// ---------------------------------------------------------------------------
// Migrations
// ---------------------------------------------------------------------------

const MIGRATIONS = [
  // Version 1 = initial schema (handled by CREATE TABLE above)
  { version: 1, sql: "SELECT 1" },
  // Future migrations go here, e.g.:
  // { version: 2, sql: "ALTER TABLE chat_exchanges ADD COLUMN some_new_col TEXT" },
];

function runMigrations(db) {
  const currentRow = db.prepare(
    'SELECT MAX(version) as v FROM schema_version'
  ).get();
  const current = currentRow?.v || 0;

  if (current === 0 && MIGRATIONS.length > 0) {
    // First run — mark version 1 as applied (tables were just created)
    db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(1);
  }

  for (const m of MIGRATIONS.filter(m => m.version > Math.max(current, 1))) {
    db.exec(m.sql);
    db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(m.version);
    console.log(`[chat-logger] Applied migration v${m.version}`);
  }
}

// ---------------------------------------------------------------------------
// Query classification
// ---------------------------------------------------------------------------

function classifyQuery(query) {
  const q = query.toLowerCase().trim();
  if (/^(hi|hello|hey|good morning|good evening|good afternoon)/.test(q)) return 'greeting';
  if (/how (do|to|can|should)|steps to|guide|setup|configure|set up/.test(q)) return 'how-to';
  if (/error|issue|problem|not working|bug|fail|broken|wrong|trouble/.test(q)) return 'troubleshooting';
  if (/what is|explain|define|meaning|difference between|overview/.test(q)) return 'definition';
  if (/pricing|cost|plan|subscription|license|billing|payment/.test(q)) return 'commercial';
  return 'general';
}

// ---------------------------------------------------------------------------
// Core logging
// ---------------------------------------------------------------------------

/**
 * Log a chat exchange. Runs synchronously via better-sqlite3 but called from
 * process.nextTick so it never blocks the HTTP response.
 */
function logExchange(data) {
  if (!ENABLED) return;
  if (isCircuitOpen()) {
    const now = Date.now();
    if (now - lastCircuitWarning > 60000) {
      console.warn('[chat-logger] Circuit open — logging disabled temporarily');
      lastCircuitWarning = now;
    }
    return;
  }

  try {
    const db = getDb();
    const now = new Date().toISOString();
    const exchangeId = data.exchangeId || uuidv4();

    // Upsert conversation
    const existingConv = db.prepare('SELECT id, requests_in_window FROM conversations WHERE id = ?').get(data.conversationId);

    if (!existingConv) {
      db.prepare(`
        INSERT INTO conversations (id, created_at, updated_at, message_count, user_page_url, user_agent, user_email, consent_version, requests_in_window)
        VALUES (?, ?, ?, 1, ?, ?, ?, ?, 1)
      `).run(
        data.conversationId, now, now,
        data.pageUrl || null,
        data.userAgent || null,
        data.userEmail || null,
        data.consentVersion || '1.0'
      );
    } else {
      db.prepare(`
        UPDATE conversations
        SET updated_at = ?, message_count = message_count + 1, requests_in_window = requests_in_window + 1
        WHERE id = ?
      `).run(now, data.conversationId);
    }

    // Dedup check: same query in same conversation within 60s
    let isDuplicate = 0;
    if (existingConv) {
      const recent = db.prepare(`
        SELECT id FROM chat_exchanges
        WHERE conversation_id = ? AND user_query = ? AND created_at > datetime(?, '-60 seconds')
        LIMIT 1
      `).get(data.conversationId, data.userQuery, now);
      if (recent) isDuplicate = 1;
    }

    // Insert exchange
    db.prepare(`
      INSERT INTO chat_exchanges (
        id, conversation_id, user_query, ai_response, confidence, relevance_score,
        citations_json, num_docs_retrieved, top_doc_distance, page_url,
        created_at, response_time_ms, is_fallback, prompt_tokens, completion_tokens,
        user_rating, contains_pii, is_duplicate, query_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 0, ?, ?)
    `).run(
      exchangeId,
      data.conversationId,
      data.userQuery,
      data.aiResponse,
      data.confidence ?? null,
      data.relevanceScore ?? null,
      data.citations ? JSON.stringify(data.citations) : null,
      data.numDocsRetrieved ?? null,
      data.topDocDistance ?? null,
      data.pageUrl || null,
      now,
      data.responseTimeMs ?? null,
      data.isFallback ? 1 : 0,
      data.promptTokens ?? null,
      data.completionTokens ?? null,
      isDuplicate,
      classifyQuery(data.userQuery)
    );

    recordSuccess();
    return exchangeId;
  } catch (err) {
    recordFailure(err);
  }
}

// ---------------------------------------------------------------------------
// Rating
// ---------------------------------------------------------------------------

function rateExchange(exchangeId, rating) {
  if (!ENABLED) return false;
  try {
    const db = getDb();
    const result = db.prepare('UPDATE chat_exchanges SET user_rating = ? WHERE id = ?').run(rating, exchangeId);
    return result.changes > 0;
  } catch (err) {
    console.error('[chat-logger] rateExchange failed:', err.message);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Admin queries
// ---------------------------------------------------------------------------

function getRecentExchanges(limit = 50, offset = 0) {
  const db = getDb();
  return db.prepare(`
    SELECT e.*, c.user_email, c.user_agent
    FROM chat_exchanges e
    LEFT JOIN conversations c ON c.id = e.conversation_id
    ORDER BY e.created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);
}

function getLowConfidenceExchanges(threshold = 0.5, limit = 50) {
  const db = getDb();
  return db.prepare(`
    SELECT e.*, c.user_email
    FROM chat_exchanges e
    LEFT JOIN conversations c ON c.id = e.conversation_id
    WHERE e.relevance_score IS NOT NULL AND e.relevance_score < ?
    ORDER BY e.relevance_score ASC
    LIMIT ?
  `).all(threshold, limit);
}

function getStats(days = 30) {
  const db = getDb();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  return db.prepare(`
    SELECT
      COUNT(*) as total_exchanges,
      COUNT(DISTINCT conversation_id) as total_conversations,
      ROUND(AVG(confidence), 2) as avg_confidence,
      ROUND(AVG(relevance_score), 2) as avg_relevance_score,
      ROUND(AVG(response_time_ms), 0) as avg_response_time_ms,
      SUM(CASE WHEN is_fallback = 1 THEN 1 ELSE 0 END) as fallback_count,
      SUM(COALESCE(prompt_tokens, 0)) as total_prompt_tokens,
      SUM(COALESCE(completion_tokens, 0)) as total_completion_tokens,
      SUM(CASE WHEN user_rating = 1 THEN 1 ELSE 0 END) as thumbs_up,
      SUM(CASE WHEN user_rating = -1 THEN 1 ELSE 0 END) as thumbs_down,
      SUM(CASE WHEN is_duplicate = 1 THEN 1 ELSE 0 END) as duplicate_count
    FROM chat_exchanges
    WHERE created_at >= ?
  `).get(since);
}

function getQueryTypeStats(days = 30) {
  const db = getDb();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  return db.prepare(`
    SELECT query_type, COUNT(*) as count
    FROM chat_exchanges
    WHERE created_at >= ?
    GROUP BY query_type
    ORDER BY count DESC
  `).all(since);
}

function getHealth() {
  const db = getDb();
  let dbSizeMb = 0;
  let walSizeBytes = 0;
  try {
    const stats = fs.statSync(DB_PATH);
    dbSizeMb = Math.round((stats.size / (1024 * 1024)) * 100) / 100;
    const walPath = DB_PATH + '-wal';
    if (fs.existsSync(walPath)) {
      walSizeBytes = fs.statSync(walPath).size;
    }
  } catch { /* ignore */ }

  const totals = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM conversations) as total_conversations,
      (SELECT COUNT(*) FROM chat_exchanges) as total_exchanges,
      (SELECT MIN(created_at) FROM chat_exchanges) as oldest_record
  `).get();

  return {
    db_size_mb: dbSizeMb,
    wal_size_bytes: walSizeBytes,
    total_conversations: totals.total_conversations,
    total_exchanges: totals.total_exchanges,
    oldest_record: totals.oldest_record,
    circuit_breaker_status: isCircuitOpen() ? 'open' : 'closed',
    consecutive_failures: consecutiveFailures,
    logging_enabled: ENABLED,
  };
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

function exportToJSON(startDate, endDate, anonymize = false) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT e.*, c.user_email, c.user_agent, c.consent_version
    FROM chat_exchanges e
    LEFT JOIN conversations c ON c.id = e.conversation_id
    WHERE e.created_at >= ? AND e.created_at <= ?
    ORDER BY e.created_at ASC
  `).all(startDate, endDate);

  if (anonymize) {
    return rows.map(row => ({
      ...row,
      user_email: null,
      user_agent: null,
      user_query: '[REDACTED]',
      ai_response: '[REDACTED]',
    }));
  }
  return rows;
}

// ---------------------------------------------------------------------------
// GDPR deletion
// ---------------------------------------------------------------------------

function deleteConversation(conversationId) {
  const db = getDb();
  // Foreign key cascade handles chat_exchanges
  db.pragma('foreign_keys = ON');
  const result = db.prepare('DELETE FROM conversations WHERE id = ?').run(conversationId);
  // Also explicitly delete exchanges in case FK cascade isn't enabled
  db.prepare('DELETE FROM chat_exchanges WHERE conversation_id = ?').run(conversationId);
  return result.changes > 0;
}

function deleteByEmail(email) {
  const db = getDb();
  const convIds = db.prepare('SELECT id FROM conversations WHERE user_email = ?').all(email);
  let deleted = 0;
  for (const { id } of convIds) {
    db.prepare('DELETE FROM chat_exchanges WHERE conversation_id = ?').run(id);
    db.prepare('DELETE FROM conversations WHERE id = ?').run(id);
    deleted++;
  }
  return deleted;
}

// ---------------------------------------------------------------------------
// Retention cleanup
// ---------------------------------------------------------------------------

function cleanOldRecords(retentionDays) {
  if (!retentionDays || retentionDays <= 0) return 0;
  try {
    const db = getDb();
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
    // Delete exchanges first (FK child)
    db.prepare(`
      DELETE FROM chat_exchanges WHERE conversation_id IN (
        SELECT id FROM conversations WHERE updated_at < ?
      )
    `).run(cutoff);
    const result = db.prepare('DELETE FROM conversations WHERE updated_at < ?').run(cutoff);
    if (result.changes > 0) {
      console.log(`[chat-logger] Cleaned ${result.changes} conversations older than ${retentionDays} days`);
    }
    return result.changes;
  } catch (err) {
    console.error('[chat-logger] cleanOldRecords failed:', err.message);
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Audit logging
// ---------------------------------------------------------------------------

function auditLog(req, action) {
  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO admin_audit_log (admin_email, action, endpoint, query_params, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      req.user?.email || 'unknown',
      action,
      req.originalUrl || req.path,
      JSON.stringify(req.query || {}),
      req.ip || null,
      new Date().toISOString()
    );
  } catch (err) {
    console.error('[chat-logger] auditLog failed:', err.message);
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  logExchange,
  rateExchange,
  getRecentExchanges,
  getLowConfidenceExchanges,
  getStats,
  getQueryTypeStats,
  getHealth,
  exportToJSON,
  deleteConversation,
  deleteByEmail,
  cleanOldRecords,
  auditLog,
  classifyQuery,
  getDb,
};
