'use strict';

const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const ENABLED = (process.env.CHAT_LOGGING_ENABLED || 'true').toLowerCase() !== 'false';
const DB_PATH = process.env.CHAT_LOG_DB_PATH || '/app/data/chat-logs.db';
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
    console.log('[chat-logger] Circuit breaker reset - retrying writes');
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
      user_display_name TEXT,
      org_id TEXT,
      org_name TEXT,
      user_roles TEXT,       -- JSON-stringified array of SmartWinnr roles
      user_privileges TEXT,  -- JSON-stringified array of org privileges
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
      chat_model TEXT,
      is_refusal INTEGER DEFAULT 0,
      citation_clicks_json TEXT,
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

    -- Analytics digest emails (see src/pages/admin/digests + db/digest-store).
    -- Co-located in the chat-logs DB because the digests aggregate chat
    -- exchange data; sharing a connection keeps the read path simple.
    CREATE TABLE IF NOT EXISTS digest_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      digest_type TEXT NOT NULL,           -- editor-gap | ops-snapshot | module-overview
      email TEXT NOT NULL,
      region TEXT NOT NULL DEFAULT 'global',  -- global | ap-south-1 | ...
      added_at TEXT NOT NULL,
      added_by TEXT,
      UNIQUE(digest_type, email)
    );

    CREATE TABLE IF NOT EXISTS digest_send_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      digest_type TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      recipient_count INTEGER,
      status TEXT NOT NULL,                -- sent | failed | no-recipients | no-data
      error TEXT,
      meta_json TEXT
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
    CREATE INDEX IF NOT EXISTS idx_conversations_org_id ON conversations(org_id);
    CREATE INDEX IF NOT EXISTS idx_audit_created_at ON admin_audit_log(created_at);
    CREATE INDEX IF NOT EXISTS idx_digest_subscriptions_type ON digest_subscriptions(digest_type);
    CREATE INDEX IF NOT EXISTS idx_digest_send_log_sent_at ON digest_send_log(sent_at);
  `);

  // Self-heal: ensure every column we depend on exists, regardless of what
  // the schema_version table claims. ALTER TABLE ADD COLUMN is idempotent
  // via the "duplicate column name" catch, so running this on every boot is
  // safe and recovers production DBs where the migration log got out of
  // sync with the actual schema (e.g. partial migration, restored backup,
  // hand-edited DB).
  ensureSchemaColumns(_db);

  // Run migrations (kept for the legacy schema_version log + any future
  // non-ALTER migrations that need ordered application).
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
// Schema self-heal
// ---------------------------------------------------------------------------

/**
 * Authoritative column list per table, keyed by table name. The
 * ensureSchemaColumns pass uses PRAGMA table_info(<table>) to see what
 * actually exists, then only ALTERs in the columns that are missing.
 * This is more robust than the previous "ALTER blindly and catch
 * duplicate-column errors" approach - on a partial/failed prior
 * migration, that approach can leave the DB in a state where some
 * columns are missing AND the catch silently hides the real error.
 *
 * Add to this map whenever a new column lands in any migration block.
 * Include the SQL type (and DEFAULT clause if any) so the ALTER is
 * fully specified.
 */
const REQUIRED_COLUMNS = {
  conversations: [
    // v2 (identity context)
    ['user_display_name', 'TEXT'],
    ['org_id',            'TEXT'],
    ['org_name',          'TEXT'],
    ['user_roles',        'TEXT'],
    ['user_privileges',   'TEXT'],
  ],
  chat_exchanges: [
    // v2 (identity context)
    ['chat_model',           'TEXT'],
    // v3 (Group B quality signals)
    ['is_refusal',           'INTEGER DEFAULT 0'],
    ['citation_clicks_json', 'TEXT'],
  ],
};

function tableColumnSet(db, table) {
  try {
    const rows = db.prepare(`PRAGMA table_info(${table})`).all();
    return new Set(rows.map((r) => r.name));
  } catch {
    return null; // table missing or unreadable
  }
}

function ensureSchemaColumns(db) {
  let totalAdded = 0;
  for (const [table, columns] of Object.entries(REQUIRED_COLUMNS)) {
    const existing = tableColumnSet(db, table);
    if (!existing) {
      console.error(`[chat-logger] ensureSchemaColumns: table "${table}" missing or unreadable - cannot add columns`);
      continue;
    }
    if (existing.size === 0) {
      console.error(`[chat-logger] ensureSchemaColumns: table "${table}" reports zero columns - skipping`);
      continue;
    }
    for (const [name, type] of columns) {
      if (existing.has(name)) continue;
      try {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`);
        console.log(`[chat-logger] ensureSchemaColumns: added ${table}.${name}`);
        totalAdded += 1;
      } catch (err) {
        // Log loud - this is a real failure (not the "duplicate column"
        // case, since PRAGMA confirmed the column was missing). The
        // operator needs to see this in Railway / production logs.
        console.error(`[chat-logger] ensureSchemaColumns: FAILED to add ${table}.${name}: ${err.message || err}`);
      }
    }
  }
  if (totalAdded > 0) {
    console.log(`[chat-logger] ensureSchemaColumns: added ${totalAdded} missing column(s) total`);
  }

  // Final diagnostic - log the actual column set per table so the
  // operator can verify post-deploy in production logs. Catches the
  // case where a column "should" be there but isn't.
  for (const table of Object.keys(REQUIRED_COLUMNS)) {
    const existing = tableColumnSet(db, table);
    if (existing) {
      const required = REQUIRED_COLUMNS[table].map(([n]) => n);
      const missing = required.filter((n) => !existing.has(n));
      if (missing.length > 0) {
        console.error(`[chat-logger] ensureSchemaColumns: ${table} STILL MISSING after pass: ${missing.join(', ')}`);
      } else {
        console.log(`[chat-logger] ensureSchemaColumns: ${table} has all ${required.length} required columns`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Migrations
// ---------------------------------------------------------------------------

const MIGRATIONS = [
  // Version 1 = initial schema (handled by CREATE TABLE above)
  { version: 1, sql: "SELECT 1" },
  // Version 2 - identity context: display name + org + roles/privileges on the
  // conversation, plus the chat model on each exchange. Listed as separate
  // statements so the runner can catch and skip "duplicate column" errors
  // when CREATE TABLE above already declared them on a fresh install.
  {
    version: 2,
    statements: [
      "ALTER TABLE conversations  ADD COLUMN user_display_name TEXT",
      "ALTER TABLE conversations  ADD COLUMN org_id            TEXT",
      "ALTER TABLE conversations  ADD COLUMN org_name          TEXT",
      "ALTER TABLE conversations  ADD COLUMN user_roles        TEXT",
      "ALTER TABLE conversations  ADD COLUMN user_privileges   TEXT",
      "ALTER TABLE chat_exchanges ADD COLUMN chat_model        TEXT",
    ],
  },
  // Version 3 - Group B quality signals (V2 of the chat analytics dashboard).
  // - is_refusal distinguishes "no docs found" from is_fallback ("OpenAI errored").
  //   The chat handler sets it at write time when search returns nothing useful.
  // - citation_clicks_json holds the JSON-stringified list of citation URLs the
  //   user actually clicked from this exchange. Lets us compute CTR per article
  //   on the Article Performance table.
  {
    version: 3,
    statements: [
      "ALTER TABLE chat_exchanges ADD COLUMN is_refusal           INTEGER DEFAULT 0",
      "ALTER TABLE chat_exchanges ADD COLUMN citation_clicks_json TEXT",
    ],
  },
];

function runMigrations(db) {
  const currentRow = db.prepare(
    'SELECT MAX(version) as v FROM schema_version'
  ).get();
  const current = currentRow?.v || 0;

  if (current === 0 && MIGRATIONS.length > 0) {
    // First run - mark version 1 as applied (tables were just created)
    db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(1);
  }

  for (const m of MIGRATIONS.filter(m => m.version > Math.max(current, 1))) {
    if (Array.isArray(m.statements)) {
      // Per-statement migration. Idempotent: a "duplicate column name" error
      // from SQLite means CREATE TABLE already declared this column on a
      // fresh install - safe to skip and move on.
      for (const stmt of m.statements) {
        try {
          db.exec(stmt);
        } catch (err) {
          if (/duplicate column name/i.test(err.message || '')) continue;
          throw err;
        }
      }
    } else {
      db.exec(m.sql);
    }
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
      console.warn('[chat-logger] Circuit open - logging disabled temporarily');
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

    // Stringify arrays for JSON columns; pass plain strings/null through.
    const userRolesJson = Array.isArray(data.userRoles)
      ? JSON.stringify(data.userRoles)
      : null;
    const userPrivilegesJson = Array.isArray(data.userPrivileges)
      ? JSON.stringify(data.userPrivileges)
      : null;

    if (!existingConv) {
      db.prepare(`
        INSERT INTO conversations (
          id, created_at, updated_at, message_count,
          user_page_url, user_agent, user_email,
          user_display_name, org_id, org_name, user_roles, user_privileges,
          consent_version, requests_in_window
        )
        VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `).run(
        data.conversationId, now, now,
        data.pageUrl || null,
        data.userAgent || null,
        data.userEmail || null,
        data.userDisplayName || null,
        data.orgId || null,
        data.orgName || null,
        userRolesJson,
        userPrivilegesJson,
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
        user_rating, contains_pii, is_duplicate, query_type, chat_model, is_refusal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 0, ?, ?, ?, ?)
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
      classifyQuery(data.userQuery),
      data.chatModel || null,
      data.isRefusal ? 1 : 0
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

/**
 * Record that the user clicked a citation URL from a given exchange. Stored
 * as a JSON array on the row (dedup-on-write so one URL counts once even if
 * the user clicks it twice). Cheap because chat-citation click volume is
 * low; if it ever grows we'd move to a separate event table.
 */
function recordCitationClick(exchangeId, url) {
  if (!ENABLED) return false;
  if (!exchangeId || !url) return false;
  try {
    const db = getDb();
    const row = db.prepare('SELECT citation_clicks_json FROM chat_exchanges WHERE id = ?').get(exchangeId);
    if (!row) return false;
    let clicks = [];
    if (row.citation_clicks_json) {
      try { clicks = JSON.parse(row.citation_clicks_json) || []; }
      catch { clicks = []; }
    }
    if (!Array.isArray(clicks)) clicks = [];
    if (clicks.includes(url)) return true; // already tracked, no-op
    clicks.push(url);
    db.prepare('UPDATE chat_exchanges SET citation_clicks_json = ? WHERE id = ?').run(JSON.stringify(clicks), exchangeId);
    return true;
  } catch (err) {
    console.error('[chat-logger] recordCitationClick failed:', err.message);
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

/**
 * Build an AND-prefixed WHERE clause for filtering by role and/or org. Used
 * by the V3 dashboard filters. Returns `{sql, params}` you can splice into a
 * query that has a chat_exchanges alias `e` joined to conversations alias `c`.
 *
 * Role filter uses LIKE on the JSON-stringified user_roles column - works
 * because logExchange writes well-formed JSON arrays like ["editor","admin"].
 * Not a substring on labels because the role strings are stable identifiers.
 */
function buildConvFilter({role, orgId} = {}) {
  const conds = [];
  const params = [];
  if (role && typeof role === 'string' && /^[a-z][a-z0-9_-]{0,40}$/i.test(role)) {
    conds.push('c.user_roles LIKE ?');
    params.push(`%"${role}"%`);
  }
  if (orgId && typeof orgId === 'string') {
    conds.push('c.org_id = ?');
    params.push(orgId);
  }
  return { sql: conds.length ? ' AND ' + conds.join(' AND ') : '', params };
}

function getStats(days = 30, filter = {}) {
  const db = getDb();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const f = buildConvFilter(filter);
  return db.prepare(`
    SELECT
      COUNT(*) as total_exchanges,
      COUNT(DISTINCT e.conversation_id) as total_conversations,
      ROUND(AVG(e.confidence), 2) as avg_confidence,
      ROUND(AVG(e.relevance_score), 2) as avg_relevance_score,
      ROUND(AVG(e.response_time_ms), 0) as avg_response_time_ms,
      SUM(CASE WHEN e.is_fallback = 1 THEN 1 ELSE 0 END) as fallback_count,
      SUM(CASE WHEN e.is_refusal = 1 THEN 1 ELSE 0 END) as refusal_count,
      SUM(COALESCE(e.prompt_tokens, 0)) as total_prompt_tokens,
      SUM(COALESCE(e.completion_tokens, 0)) as total_completion_tokens,
      SUM(CASE WHEN e.user_rating = 1 THEN 1 ELSE 0 END) as thumbs_up,
      SUM(CASE WHEN e.user_rating = -1 THEN 1 ELSE 0 END) as thumbs_down,
      SUM(CASE WHEN e.is_duplicate = 1 THEN 1 ELSE 0 END) as duplicate_count
    FROM chat_exchanges e
    LEFT JOIN conversations c ON c.id = e.conversation_id
    WHERE e.created_at >= ?${f.sql}
  `).get(since, ...f.params);
}

function getQueryTypeStats(days = 30, filter = {}) {
  const db = getDb();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const f = buildConvFilter(filter);
  return db.prepare(`
    SELECT e.query_type, COUNT(*) as count
    FROM chat_exchanges e
    LEFT JOIN conversations c ON c.id = e.conversation_id
    WHERE e.created_at >= ?${f.sql}
    GROUP BY e.query_type
    ORDER BY count DESC
  `).all(since, ...f.params);
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

/**
 * Top unanswered queries within the window. "Unanswered" = the bot
 * returned the fallback message (is_fallback=1) OR the top retrieved
 * doc was too distant to be useful (relevance_score < 0.3).
 *
 * Clustering is in-JS: normalize each user_query (lowercase, strip
 * punctuation, collapse whitespace), group on the normalized form.
 * Per cluster we keep the longest example query as the representative
 * (longest is usually the most descriptive). Distinct users are
 * counted via the conversation_id -> user_email join.
 *
 * Returns:
 *   [{normalizedQuery, exampleQuery, count, distinctUsers,
 *     lastAskedAt, avgRelevance}]
 * sorted by count desc, then distinct users desc.
 */
/** Extract the module slug from a chat page URL. Tolerant of full URLs
 *  ("https://help.smartwinnr.com/modules/quiz/...") and root-relative
 *  paths ("/modules/quiz/..."). Returns null when the URL isn't in the
 *  modules tree (e.g. landing, reference, persona pages). */
function moduleFromPageUrl(url) {
  if (typeof url !== 'string' || !url) return null;
  const m = /\/modules\/([^/?#]+)/.exec(url);
  return m ? m[1] : null;
}

/**
 * Phrase -> module slug map for tagging unanswered queries by query
 * CONTENT. More-specific phrases come first so they win the includes()
 * scan before generic fallbacks ("ai coaching" beats the bare "coaching"
 * suffix). The slugs `coaching-group` and `multiple` are synthetic - the
 * client maps them to friendly labels ("Coaching", "Multiple").
 */
const QUERY_KEYWORDS = [
  // Specific coaching variants - MUST precede the generic "coaching"
  ['ai coaching',    'ai-coaching'],
  ['video coaching', 'video-coaching'],
  ['field coaching', 'field-coaching'],
  // Specific modules
  ['smartpath',      'smartpath'],
  ['smart path',     'smartpath'],
  ['smartfeed',      'smartfeed'],
  ['smart feed',     'smartfeed'],
  ['knowledge hub',  'knowledge-hub'],
  ['khub',           'knowledge-hub'],
  ['kpi',            'kpi-gamification'],
  ['scorecard',      'kpi-gamification'],
  ['gamification',   'kpi-gamification'],
  ['competition',    'kpi-gamification'],
  ['achievement',    'kpi-gamification'],
  ['quiz',           'quiz'],
  ['survey',         'survey'],
  ['forms',          'forms'],
  ['notification',   'notifications'],
  // Generic group label - last; cleaned up below if a specific coaching
  // variant was also detected.
  ['coaching',       'coaching-group'],
];

const COACHING_CHILD_SLUGS = new Set(['ai-coaching', 'video-coaching', 'field-coaching']);

/** Return the set of module slugs mentioned in a normalized query. */
function modulesFromQueryText(normalizedText) {
  const found = new Set();
  if (!normalizedText) return found;
  for (const [phrase, slug] of QUERY_KEYWORDS) {
    if (normalizedText.includes(phrase)) found.add(slug);
  }
  // If we picked up a specific coaching child AND the generic group,
  // drop the group (specific wins).
  if (found.has('coaching-group') && [...found].some((s) => COACHING_CHILD_SLUGS.has(s))) {
    found.delete('coaching-group');
  }
  return found;
}

/** Pick the dominant module for a cluster, combining query-text keyword
 *  signal with page_url-derived signal:
 *    - 1 specific module in query                            -> that
 *    - 1 generic group in query + page_url is a group child  -> child
 *    - 1 generic group in query + no matching page_url       -> group
 *    - >1 module in query, page_url matches one of them      -> matching
 *    - >1 module in query, no match                          -> 'multiple'
 *    - 0 modules in query                                    -> page_url mode (or null)
 */
function resolveClusterModule(querySlugs, urlModuleCounts) {
  // Mode of URL-derived modules.
  let urlDominant = null;
  let urlMax = 0;
  for (const [mod, count] of Object.entries(urlModuleCounts || {})) {
    if (count > urlMax) { urlMax = count; urlDominant = mod; }
  }

  if (!querySlugs || querySlugs.size === 0) return urlDominant; // fallback to URL signal

  if (querySlugs.size === 1) {
    const only = querySlugs.values().next().value;
    if (only === 'coaching-group') {
      if (urlDominant && COACHING_CHILD_SLUGS.has(urlDominant)) return urlDominant;
      return 'coaching-group';
    }
    return only;
  }

  // Multiple specific modules mentioned - let page_url break the tie.
  if (urlDominant && querySlugs.has(urlDominant)) return urlDominant;
  return 'multiple';
}

function getTopUnansweredQueries({days = 30, limit = 25, role, orgId} = {}) {
  const db = getDb();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const f = buildConvFilter({role, orgId});
  const rows = db.prepare(`
    SELECT e.user_query, e.relevance_score, e.created_at, e.page_url, c.user_email
    FROM chat_exchanges e
    LEFT JOIN conversations c ON c.id = e.conversation_id
    WHERE e.created_at >= ?
      AND (e.is_refusal = 1 OR e.is_fallback = 1
           OR (e.relevance_score IS NOT NULL AND e.relevance_score < 0.3))${f.sql}
  `).all(since, ...f.params);

  const clusters = new Map();
  for (const r of rows) {
    const normalized = String(r.user_query || '')
      .toLowerCase()
      .replace(/[^\p{Letter}\p{Number}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!normalized) continue;
    let bucket = clusters.get(normalized);
    if (!bucket) {
      bucket = {
        normalizedQuery: normalized,
        exampleQuery: r.user_query,
        count: 0,
        users: new Set(),
        lastAskedAt: r.created_at,
        relevanceSum: 0,
        relevanceCount: 0,
        moduleCounts: {},
      };
      clusters.set(normalized, bucket);
    }
    bucket.count += 1;
    if (r.user_email) bucket.users.add(r.user_email);
    if (r.created_at > bucket.lastAskedAt) bucket.lastAskedAt = r.created_at;
    if (r.user_query && r.user_query.length > bucket.exampleQuery.length) {
      bucket.exampleQuery = r.user_query;
    }
    if (typeof r.relevance_score === 'number') {
      bucket.relevanceSum += r.relevance_score;
      bucket.relevanceCount += 1;
    }
    // Tally the module the user was on when they asked. Top hit per cluster
    // becomes the dominant module surfaced on the dashboard.
    const mod = moduleFromPageUrl(r.page_url);
    if (mod) bucket.moduleCounts[mod] = (bucket.moduleCounts[mod] || 0) + 1;
  }

  const out = [];
  for (const b of clusters.values()) {
    // Hybrid signal: query-text keywords are primary (most direct evidence
    // of intent); page_url is a tiebreaker for ambiguous cases. See
    // resolveClusterModule for the full decision table.
    const querySlugs = modulesFromQueryText(b.normalizedQuery);
    const module = resolveClusterModule(querySlugs, b.moduleCounts);
    out.push({
      normalizedQuery: b.normalizedQuery,
      exampleQuery: b.exampleQuery,
      count: b.count,
      distinctUsers: b.users.size,
      lastAskedAt: b.lastAskedAt,
      avgRelevance: b.relevanceCount > 0
        ? Math.round((b.relevanceSum / b.relevanceCount) * 100) / 100
        : null,
      module,
    });
  }
  out.sort((a, b) => b.count - a.count || b.distinctUsers - a.distinctUsers);
  return out.slice(0, limit);
}

/**
 * Article performance from the chatbot's perspective. Aggregates the
 * `citations_json` payload from chat_exchanges by URL, joins with the
 * exchange's user_rating to estimate satisfaction per article.
 *
 * citations_json is JSON-stringified by logExchange; we parse in JS
 * rather than reach for SQLite JSON1 - simpler to debug and trivially
 * fast at our volume.
 *
 * `minCitations` filters out noise (URLs cited once or twice). Rows
 * below the threshold are dropped before sorting.
 *
 * Returns:
 *   [{url, title, citationCount, avgConfidence, thumbsUp, thumbsDown,
 *     helpfulPct}]
 * sorted by citationCount desc. `helpfulPct` is null when no ratings
 * exist on the citing exchanges.
 */
function getArticlePerformance({days = 30, minCitations = 3, limit = 50, role, orgId} = {}) {
  const db = getDb();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const f = buildConvFilter({role, orgId});
  const rows = db.prepare(`
    SELECT e.citations_json, e.citation_clicks_json, e.relevance_score, e.user_rating
    FROM chat_exchanges e
    LEFT JOIN conversations c ON c.id = e.conversation_id
    WHERE e.created_at >= ?
      AND e.citations_json IS NOT NULL${f.sql}
  `).all(since, ...f.params);

  const byUrl = new Map();
  for (const r of rows) {
    let cites;
    try { cites = JSON.parse(r.citations_json); }
    catch { continue; }
    if (!Array.isArray(cites)) continue;

    // Parse the click list for this exchange (V2 - citation CTR). Wrapped
    // in a Set for O(1) lookup against citation URLs below.
    let clicks = [];
    if (r.citation_clicks_json) {
      try { clicks = JSON.parse(r.citation_clicks_json) || []; }
      catch { clicks = []; }
    }
    const clickSet = new Set(Array.isArray(clicks) ? clicks : []);

    // De-dupe within a single exchange so one citation counts once per
    // exchange, not once per repeated entry inside the array.
    const seen = new Set();
    for (const c of cites) {
      const url = c && c.url;
      if (!url || seen.has(url)) continue;
      seen.add(url);
      let bucket = byUrl.get(url);
      if (!bucket) {
        bucket = {
          url,
          title: c.title || null,
          citationCount: 0,
          clickCount: 0,
          confSum: 0,
          confCount: 0,
          thumbsUp: 0,
          thumbsDown: 0,
        };
        byUrl.set(url, bucket);
      }
      bucket.citationCount += 1;
      if (clickSet.has(url)) bucket.clickCount += 1;
      if (!bucket.title && c.title) bucket.title = c.title;
      if (typeof r.relevance_score === 'number') {
        bucket.confSum += r.relevance_score;
        bucket.confCount += 1;
      }
      if (r.user_rating === 1) bucket.thumbsUp += 1;
      else if (r.user_rating === -1) bucket.thumbsDown += 1;
    }
  }

  const out = [];
  for (const b of byUrl.values()) {
    if (b.citationCount < minCitations) continue;
    const totalRatings = b.thumbsUp + b.thumbsDown;
    out.push({
      url: b.url,
      title: b.title,
      citationCount: b.citationCount,
      clickCount: b.clickCount,
      ctrPct: b.citationCount > 0
        ? Math.round((b.clickCount / b.citationCount) * 100)
        : null,
      avgConfidence: b.confCount > 0
        ? Math.round((b.confSum / b.confCount) * 100) / 100
        : null,
      thumbsUp: b.thumbsUp,
      thumbsDown: b.thumbsDown,
      helpfulPct: totalRatings > 0
        ? Math.round((b.thumbsUp / totalRatings) * 100)
        : null,
    });
  }
  out.sort((a, b) => b.citationCount - a.citationCount);
  return out.slice(0, limit);
}

/**
 * Abandonment proxy. A conversation is considered "abandoned" when it has
 * exactly one exchange AND no thumbs_up rating on that exchange - the
 * user asked once, didn't follow up, didn't say it helped. Computable
 * from existing data, no new tracking schema required.
 *
 * Returns: {totalConversations, abandoned, abandonedPct}
 */
function getAbandonmentStats({days = 30, role, orgId} = {}) {
  const db = getDb();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const f = buildConvFilter({role, orgId});
  const row = db.prepare(`
    WITH conv AS (
      SELECT
        c.id,
        COUNT(e.id) AS exchange_count,
        MAX(CASE WHEN e.user_rating = 1 THEN 1 ELSE 0 END) AS got_thumbs_up
      FROM conversations c
      LEFT JOIN chat_exchanges e ON e.conversation_id = c.id
      WHERE c.created_at >= ?${f.sql}
      GROUP BY c.id
    )
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN exchange_count = 1 AND got_thumbs_up = 0 THEN 1 ELSE 0 END) AS abandoned
    FROM conv
  `).get(since, ...f.params);
  const total = row.total || 0;
  const abandoned = row.abandoned || 0;
  return {
    totalConversations: total,
    abandoned,
    abandonedPct: total > 0 ? Math.round((abandoned / total) * 100) : null,
  };
}

/**
 * Distinct orgs that have any conversation in the window. Used to populate
 * the org filter dropdown on the analytics dashboard, so we never show an
 * org with zero data to filter on. Sorted by conversation count desc.
 *
 * Returns: [{orgId, orgName, conversationCount}]
 */
function getAvailableOrgs({days = 30} = {}) {
  const db = getDb();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  return db.prepare(`
    SELECT
      org_id    AS orgId,
      MAX(org_name) AS orgName,
      COUNT(*)  AS conversationCount
    FROM conversations
    WHERE created_at >= ? AND org_id IS NOT NULL AND org_id != ''
    GROUP BY org_id
    ORDER BY conversationCount DESC
  `).all(since);
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
      user_display_name: null,
      org_id: null,
      org_name: null,
      user_roles: null,
      user_privileges: null,
      citation_clicks_json: null,
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
  recordCitationClick,
  getRecentExchanges,
  getLowConfidenceExchanges,
  getStats,
  getQueryTypeStats,
  getHealth,
  getTopUnansweredQueries,
  getArticlePerformance,
  getAbandonmentStats,
  getAvailableOrgs,
  exportToJSON,
  deleteConversation,
  deleteByEmail,
  cleanOldRecords,
  auditLog,
  classifyQuery,
  getDb,
};
