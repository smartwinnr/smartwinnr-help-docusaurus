# Plan: Persistent Chat Transcript Logging

## Context

The SmartWinnr Help Center chatbot currently stores conversations in an in-memory `Map()` (`server.js:29`) that is lost on every restart. The team needs persistent storage of chat exchanges to enable manual review, identify documentation gaps, and iteratively improve chatbot quality. There is no existing database besides ChromaDB (vector-only), no auth system, and the app runs on Railway with Docker.

---

## Storage: SQLite via `better-sqlite3`

**Why SQLite**: Zero infrastructure (file-based), no new Railway service, full SQL for analytics, trivial to set up. ChromaDB is wrong for relational queries. A managed PostgreSQL adds cost and complexity unnecessary for the expected volume (hundreds–low thousands of chats/month).

- DB file path: configurable via `CHAT_LOG_DB_PATH` env var, default `./data/chat-logs.db`
- Use WAL journal mode + NORMAL synchronous for fast writes
- Railway: attach a persistent volume at `/data` and set `CHAT_LOG_DB_PATH=/data/chat-logs.db`

---

## Schema

**Table: `conversations`**
| Column | Type | Purpose |
|--------|------|---------|
| id | TEXT PK | UUID (existing conversationId) |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |
| message_count | INTEGER | Total exchanges |
| user_page_url | TEXT | Page where chat started |
| user_agent | TEXT | Browser info |
| user_email | TEXT | Nullable, from `req.user.email` when authenticated |
| consent_version | TEXT DEFAULT '1.0' | Privacy notice version active at conversation start |
| requests_in_window | INTEGER DEFAULT 0 | Exchange count for rate tracking |

**Table: `chat_exchanges`**
| Column | Type | Purpose |
|--------|------|---------|
| id | TEXT PK | UUID |
| conversation_id | TEXT FK | Links to conversations |
| user_query | TEXT | The question asked |
| ai_response | TEXT | The AI's answer |
| confidence | REAL | Original binary 0.8/0.4 (preserved for frontend) |
| relevance_score | REAL | New continuous 0.1–1.0 score for analytics |
| citations_json | TEXT | JSON array of citation objects |
| num_docs_retrieved | INTEGER | ChromaDB results count |
| top_doc_distance | REAL | Best vector distance (lower = better match) |
| page_url | TEXT | Doc page user was viewing |
| created_at | TEXT | ISO timestamp |
| response_time_ms | INTEGER | End-to-end latency |
| is_fallback | INTEGER | 1 if AI failed and fallback used |
| prompt_tokens | INTEGER | OpenAI prompt token usage |
| completion_tokens | INTEGER | OpenAI completion token usage |
| user_rating | INTEGER | 1 (thumbs up), -1 (thumbs down), NULL (no rating) |
| contains_pii | INTEGER DEFAULT 0 | PII detection flag |
| is_duplicate | INTEGER DEFAULT 0 | Duplicate query flag |
| query_type | TEXT | Auto-classified query type |

**Table: `admin_audit_log`**
| Column | Type | Purpose |
|--------|------|---------|
| id | INTEGER PK AUTOINCREMENT | Row ID |
| admin_email | TEXT NOT NULL | From `req.user.email` |
| action | TEXT NOT NULL | e.g., `view_logs`, `export`, `delete` |
| endpoint | TEXT NOT NULL | Request path |
| query_params | TEXT | JSON of query string params |
| ip_address | TEXT | `req.ip` (admin only, not chat users) |
| created_at | TEXT NOT NULL | ISO timestamp |

**Table: `schema_version`**
| Column | Type | Purpose |
|--------|------|---------|
| version | INTEGER | Current migration version |

**Indexes**: on `created_at`, `conversation_id`, `confidence`, `relevance_score`, `is_fallback`, `query_type`

---

## Admin Endpoints: `superadmin` Role + Audit Logging

All admin endpoints require authentication via existing JWT auth (`auth/middleware.js`) and the `superadmin` role. Every admin action is logged to `admin_audit_log`.

### New middleware: `auth/requireRole.js`
```js
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || !req.user.roles || !req.user.roles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}
```

### Admin routes in `server.js`
```js
const { requireRole } = require('./auth/requireRole');
app.use('/api/admin/chat-logs', requireRole('superadmin'));
```

- `GET /api/admin/chat-logs` — paginated recent exchanges
- `GET /api/admin/chat-logs/low-confidence` — poor-match queries (filters on `relevance_score`)
- `GET /api/admin/chat-logs/stats` — summary metrics
- `GET /api/admin/chat-logs/export` — JSON/CSV export
- `GET /api/admin/chat-logs/health` — DB health & metrics
- `DELETE /api/admin/chat-logs/:conversationId` — delete conversation (GDPR)
- `DELETE /api/admin/chat-logs/by-email/:email` — delete by user email (GDPR)

Each endpoint calls `auditLog(req, action)` to record the admin's email, action, endpoint, params, and timestamp.

---

## Relevance Score (New Continuous Metric)

The existing binary `confidence` (0.8 if citations exist, 0.4 otherwise) is preserved for frontend use. A new `relevance_score` is added for logging and analytics:

```js
function calculateRelevanceScore(searchResults, citations) {
  if (searchResults.length === 0) return 0.1;
  const bestDistance = Math.min(...searchResults.map(r => r.distance));
  const distanceScore = Math.max(0, 1 - bestDistance);
  const citationBonus = Math.min(citations.length / 3, 1) * 0.2;
  const score = (distanceScore * 0.8) + citationBonus;
  return Math.round(score * 100) / 100;
}
```

Produces a meaningful range (0.1–1.0). `getLowConfidenceExchanges()` filters on `relevance_score`, not `confidence`.

---

## Files to Create/Modify

### 1. New: `auth/requireRole.js`
Role-checking middleware for `superadmin` access on admin endpoints.

### 2. New: `db/chat-logger.js`
Core logging module:
- `getDb()` — lazy-init SQLite, create tables/indexes, set pragmas, run migrations
- `runMigrations(db)` — sequential schema migrations via `schema_version` table
- `logExchange(data)` — INSERT into both tables with circuit breaker protection
- `auditLog(req, action)` — INSERT into `admin_audit_log`
- `getRecentExchanges(limit, offset)` — paginated review
- `getLowConfidenceExchanges(threshold, limit)` — filters on `relevance_score`
- `getStats(days)` — summary metrics (total queries, avg confidence, fallback rate, token usage)
- `getHealth()` — DB size, row counts, WAL size, circuit breaker status
- `exportToJSON(startDate, endDate, anonymize)` — bulk export with optional anonymization
- `cleanOldRecords(retentionDays)` — delete records older than N days (run on startup)
- `deleteConversation(conversationId)` — CASCADE delete (GDPR)
- `deleteByEmail(email)` — delete all conversations for a user email (GDPR)
- `rateExchange(exchangeId, rating)` — update `user_rating`
- `classifyQuery(query)` — keyword-based query type classification
- Check `CHAT_LOGGING_ENABLED` env var; silently skip if `false`
- Circuit breaker: disable logging after 5 consecutive write failures, auto-reset after `CHAT_LOGGER_CIRCUIT_RESET_MS` (default 60000ms)
- WAL checkpoint on startup + every 6 hours via `setInterval`

### 3. Modify: `server.js`
- Import `chatLogger` from `./db/chat-logger`
- Import `requireRole` from `./auth/requireRole`
- Add `calculateRelevanceScore()` function
- Add `const PRIVACY_NOTICE_VERSION = '1.0'`
- In `POST /api/chat` (line 232):
  - Add `const startTime = Date.now()` at handler start
  - Add `relevanceScore` to response object (alongside existing `confidence`)
  - After `conversations.set()` (line 321), add async logging via `process.nextTick()`:
    ```js
    process.nextTick(() => {
      chatLogger.logExchange({
        conversationId, userQuery, aiResponse, confidence,
        relevanceScore, citations, numDocsRetrieved, topDocDistance,
        pageUrl, responseTimeMs, isFallback, promptTokens,
        completionTokens, userEmail, consentVersion, queryType
      });
    });
    ```
  - In the fallback catch (line 287), set `isFallback = true`
  - Update `generateAIResponse()` to return `{ message, usage }` for token tracking
- Add admin endpoints (protected by `requireRole('superadmin')`):
  - `GET /api/admin/chat-logs` — paginated recent exchanges
  - `GET /api/admin/chat-logs/low-confidence` — poor-match queries
  - `GET /api/admin/chat-logs/stats` — summary metrics
  - `GET /api/admin/chat-logs/export` — JSON/CSV export with optional anonymization
  - `GET /api/admin/chat-logs/health` — DB health metrics
  - `DELETE /api/admin/chat-logs/:conversationId` — GDPR deletion
  - `DELETE /api/admin/chat-logs/by-email/:email` — GDPR deletion by email
- Add rating endpoint:
  - `POST /api/chat/:exchangeId/rate` — update user_rating (no auth required)

### 4. Modify: `src/components/ChatBot/ChatBot.tsx`
- Add `pageUrl: window.location.pathname` to the `userContext` object sent with chat requests
- Add footer text in the chat input area: "Conversations may be logged to improve our help center."
- Add thumbs up/down buttons below each assistant message for rating

### 5. Modify: `Dockerfile.docusaurus`
- Add `python3 make g++` to apt-get for `better-sqlite3` native compilation
- Add `RUN mkdir -p /app/data`

### 6. Modify: `package.json`
- Add `better-sqlite3` dependency

### 7. Update: `.env` / `.env.example`
- `CHAT_LOG_DB_PATH=./data/chat-logs.db`
- `CHAT_LOGGING_ENABLED=true`
- `CHAT_LOG_RETENTION_DAYS=90`
- `CHAT_LOGGER_CIRCUIT_RESET_MS=60000`
- `CHAT_LOG_BACKUP_INTERVAL_HOURS=24`
- `BACKUP_S3_BUCKET=` (optional)

### 8. New: `scripts/export-chat-logs.js`
- CLI script to export logs as JSON/CSV for offline analysis
- Usage: `node scripts/export-chat-logs.js --from 2026-01-01 --to 2026-03-01 --format json`
- `--anonymize` flag: strips `user_email`, `user_agent`; redacts freeform text; keeps metadata

### 9. New: `scripts/backup-chat-db.js`
- Copies SQLite DB file using `.backup()` API (safe, no locking)
- Optionally uploads to S3/R2 if `BACKUP_S3_BUCKET` env var is set
- Triggered on server startup and via configurable interval

---

## Compliance & Privacy

- **No PII by default**: No IP logging for chat users. Only user-agent and page URL (low-sensitivity). `user_email` populated only when user is authenticated.
- **Disclosure**: Footer text in chat UI noting conversations may be logged.
- **Consent tracking**: `consent_version` column records which privacy notice version was active.
- **PII detection**: `contains_pii` flag on exchanges (initially `0`, future: regex scan for emails/phones).
- **Retention**: Auto-delete records older than `CHAT_LOG_RETENTION_DAYS` (default 90) on server startup.
- **GDPR/CCPA deletion**: Admin endpoints to delete by conversation ID or user email, with audit logging.
- **Export anonymization**: `--anonymize` flag strips PII from exports.
- **No IP logging**: Do not store `req.ip` for chat users (only for admin audit log).

---

## Scalability & Operational Resilience

- **Write failure isolation**: Circuit breaker disables logging after 5 consecutive failures. Chat endpoint never affected by DB issues. Auto-resets after configurable interval.
- **Schema migrations**: `schema_version` table with sequential migration runner. Future schema changes don't require manual DB edits.
- **Backup strategy**: `scripts/backup-chat-db.js` uses SQLite `.backup()` API. Periodic execution on startup + configurable interval. Optional S3/R2 upload.
- **WAL checkpoint management**: Checkpoint on startup + every 6 hours to prevent unbounded WAL growth.

---

## Auditability & Observability

- **Admin audit trail**: Every admin endpoint call logged to `admin_audit_log` with email, action, endpoint, params, IP, timestamp.
- **Health endpoint**: DB size, row counts, WAL size, circuit breaker status, logging enabled flag.
- **Token & cost tracking**: `prompt_tokens` and `completion_tokens` from OpenAI responses for budget monitoring.

---

## Data Quality

- **Deduplication**: Same query in same conversation within 60 seconds flagged as `is_duplicate = 1`.
- **Query classification**: Auto-classified `query_type` (greeting, how-to, troubleshooting, definition, commercial, general) via keyword rules.
- **Rate tracking**: `requests_in_window` on conversations for anomaly detection.

---

## Using Data to Improve the Chatbot

1. **Doc gap detection**: Query exchanges where `relevance_score < 0.5` — these are questions the docs can't answer well. Group by keyword similarity to find common themes, then write new articles.
2. **Fallback analysis**: Review `is_fallback = 1` rows to understand AI service failures.
3. **Prompt tuning**: Low-relevance exchanges reveal where the system prompt (`server.js:188`) needs adjustment.
4. **Performance monitoring**: Track `response_time_ms` trends to catch degradation.
5. **Cost monitoring**: Track `prompt_tokens` + `completion_tokens` for budget oversight.
6. **User satisfaction**: Analyze `user_rating` distribution to measure chatbot quality over time.
7. **Query patterns**: Use `query_type` classification for volume analysis (e.g., "40% troubleshooting").
8. **Weekly review**: Export stats via admin endpoints or export script for team review.

---

## Extensibility: Feedback/Rating

- `user_rating` column on `chat_exchanges` (1 = thumbs up, -1 = thumbs down, NULL = no rating)
- `POST /api/chat/:exchangeId/rate` endpoint (no auth required)
- Thumbs up/down UI in ChatBot.tsx below assistant messages

---

## Future TODO (Extensibility)

- [ ] Tags/labels for admin manual review of exchanges
- [ ] Conversation-level topic/summary (LLM-powered async)
- [ ] Webhook notifications for low-confidence exchanges (`CHAT_LOG_WEBHOOK_URL` env var)
- [ ] Full-text search (SQLite FTS5) across `user_query` and `ai_response`
- [ ] Query type classification via LLM (upgrade from keyword rules)

---

## Verification

1. Start server locally, send chat messages, verify `data/chat-logs.db` is created with correct schema
2. Verify `relevance_score` is continuous (0.1–1.0) while `confidence` remains binary (0.4/0.8)
3. Admin endpoints return 403 for non-superadmin authenticated users
4. Admin endpoints return 401 for unauthenticated users
5. Every admin endpoint call creates an `admin_audit_log` entry
6. Send a message that triggers fallback, verify `is_fallback = 1` in DB
7. Verify `response_time_ms` and token counts are populated and reasonable
8. Rating endpoint updates `user_rating` correctly
9. Duplicate queries within 60s flagged with `is_duplicate = 1`
10. `query_type` auto-classified correctly for sample queries
11. Verify `pageUrl` appears from frontend context
12. Set `CHAT_LOGGING_ENABLED=false`, verify no writes occur
13. Circuit breaker activates after 5 consecutive write failures — chat endpoint unaffected
14. Schema migration adds new column to existing DB without data loss
15. Export script `--anonymize` flag strips PII fields
16. Docker build succeeds with `better-sqlite3` native compilation
17. DELETE endpoints remove data and log to audit trail
