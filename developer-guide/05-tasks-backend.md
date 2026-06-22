# 05. Backend tasks

**Version:** 1.0 | **Last Updated:** June 2026

**Audience:** Engineers modifying `server.js`, `auth/`, `db/`, or anything else that runs in the Node process.

---

## Table of contents

1. [Where backend code lives](#where-backend-code-lives)
2. [Task: add a new `/api/*` route](#task-add-a-new-api-route)
3. [Task: add role / privilege gating to a route](#task-add-role--privilege-gating-to-a-route)
4. [Task: modify the URL guard](#task-modify-the-url-guard)
5. [Task: add a new role or privilege](#task-add-a-new-role-or-privilege)
6. [Task: persist data to SQLite](#task-persist-data-to-sqlite)
7. [Task: add a new environment variable](#task-add-a-new-environment-variable)
8. [Task: change the chatbot prompt or retrieval](#task-change-the-chatbot-prompt-or-retrieval)
9. [Server.js navigation map](#serverjs-navigation-map)

---

## Where backend code lives

```
server.js                  The single entry. Routes + middleware in one big file.
auth/
  routes.js                /auth/login, /callback, /logout, /dev-login
  middleware.js            cookie verify → req.user; ?as= preview
  jwt.js                   sign + verify the swhelp_session JWT
  loginPage.js             the HTML for /auth/login (rendered server-side)
  config.js                reads HELP_JWT_SECRET, HELP_SITE_URL, etc.
  requireRole.js           factory: requireRole('superadmin')
  index.js                 initAuth(app) wires everything in one call
db/
  chat-logger.js           SQLite persistence for /api/chat exchanges
  feedback-logger.js       SQLite persistence for /api/feedback
  digest-store.js          subscriptions + send_log for digest emails
  digest-data.js           builds digest payloads from chat-logs + feedback
  digest-payload.js        renders HTML email
  digest-send.js           Mailgun integration
  article-audit.js         grades a markdown file (used by wizard + scripts)
shared/
  access-policy.cjs        CJS twin of src/access-policy.ts (used by server.js)
plugins/
  access-gate-emit.js      build-time: emits build/doc-gates.json (URL guard table)
scripts/
  internal-indexer.js      reads docs/ → POST /api/vector/embed → ChromaDB
  audit-articles.js, ...   content-quality CLI tools
```

> **Trap.** `server.js` is one long file (~2500 lines). Don't try to
> refactor it into modules in the same PR as a feature change — the
> review surface explodes. Add new routes inline; refactor in a
> dedicated cleanup PR.

---

## Task: add a new `/api/*` route

### Where to put it

Find the section of `server.js` whose routes are conceptually nearest
yours, and add it there. The current ordering is roughly:

```
Lines 100-200    /api/vector/{embed,search}
Lines 300-560    /api/chat/* and rating endpoints
Lines 560-700    /api/admin/chat-logs/*
Lines 700-755    /api/feedback + admin feedback
Lines 757-860    /api/admin/digests/*
Lines 1000-2300  /api/admin/authoring/*
Lines 2300+      URL guard, static, listen
```

### Pattern for a public-to-authenticated route

```js
app.post('/api/your-thing', async (req, res) => {
  // req.user is guaranteed populated here because we're after initAuth(app)
  const { foo } = req.body || {};
  if (!foo) return res.status(400).json({ error: 'foo required' });

  try {
    const result = await doSomething(foo, req.user);
    res.json(result);
  } catch (err) {
    console.error('[your-thing]', err);
    res.status(500).json({ error: 'internal error' });
  }
});
```

### Pattern for an admin-only route

```js
app.post('/api/admin/your-thing', requireRole('superadmin'), async (req, res) => {
  // 401 (not signed in) or 403 (signed in, wrong role) are handled by
  // requireRole. By here, req.user.roles definitely includes 'superadmin'.
  ...
});
```

### Pattern for "indexer-only" (no human user)

```js
app.post('/api/vector/embed', (req, res) => {
  if (req.headers['x-internal-api-key'] !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'invalid internal key' });
  }
  ...
});
```

The indexer reads `INTERNAL_API_KEY` from its environment and sends it
as a header. This is a shared-secret scheme — sufficient for an internal
write endpoint that never sees human users.

### Make sure your route returns JSON, not HTML

If your route throws inside a `then()` chain and you don't catch, Express
returns its default HTML 500 page. Frontend code that expects JSON will
fail to parse and the error becomes a confusing "Unexpected token <".
**Always wrap in `try/catch` and `res.status(...).json(...)`.**

### Make sure your route is mounted after `initAuth(app)`

If you mount it before, it'll be public — no `req.user`, no cookie check.
The only routes mounted before are `GET /api/health` (intentionally
public) and the CORS preflight.

---

## Task: add role / privilege gating to a route

### Three layers, used in combination

1. **Auth layer (free)** — every route mounted after `initAuth(app)`
   requires a valid cookie. Anonymous traffic is already 401-ed.
2. **`requireRole(roleName)`** — quick role gate. Used for `superadmin`-
   only routes. Pattern:

   ```js
   app.use('/api/admin/chat-logs', requireRole('superadmin'));
   // Then every /api/admin/chat-logs/* route gets the gate for free.
   ```

3. **Per-request privilege check** — when the gate depends on the
   resource. E.g. only let editors edit articles their org has the
   matching privilege for:

   ```js
   const { isAllowed } = require('./shared/access-policy.cjs');
   const gate = { roles: ['editor', 'admin'], privilege: 'quiz' };
   if (!isAllowed(gate, req.user)) return res.status(403).end();
   ```

### What `isAllowed(gate, user)` accepts

```ts
type AccessGate = {
  roles?: SmartWinnrRole[];      // ANY of these roles
  privilege?: string;             // user.privileges must include this
  anyPrivilege?: string[];        // user.privileges must include AT LEAST ONE
};
```

Semantics:

- Role check passes if `user.roles` intersects `gate.roles`.
- Privilege check passes if `user.privileges` includes `gate.privilege`.
- `anyPrivilege` check passes if `user.privileges` includes at least one.
- All checks must pass (AND) for the gate to allow.
- `superadmin` bypasses privilege checks but still requires the role
  ladder if specified.

`shared/access-policy.cjs` is the CJS twin of `src/access-policy.ts`.
**Both must stay in sync.** If you change one, mirror the change.

---

## Task: modify the URL guard

The guard is in two places:

1. **`plugins/access-gate-emit.js`** — runs at build time. Walks
   `_category_.json` + frontmatter. Produces `build/doc-gates.json`.
2. **`server.js`** (around line 2322) — loads `doc-gates.json` at boot,
   runs AND-of-all-matching-gates on every non-`/api/*` non-`/auth/*`
   request.

### Common changes

**Add a new gate axis (e.g. `region`).**

1. Add the field to `customProps` in `_category_.json` files that should
   use it.
2. Extend `plugins/access-gate-emit.js` to pick it up.
3. Extend `isAllowed()` in **both** `src/access-policy.ts` and
   `shared/access-policy.cjs` to evaluate it.
4. Add the field to the JWT payload in `auth/jwt.js` and to `/api/me` in
   `server.js`.
5. Add tests for the role × privilege × region matrix.

**Change AND-semantics to OR.**

Don't. AND-of-all-gates is load-bearing — it closes the deeply-nested
permission bug where an inner article gated to a lax role lives under a
parent gated to a strict role. Switching to OR re-opens that bug.

**Make the guard skip a path.**

The guard short-circuits on `/api/*` and `/auth/*`. If you have a path
that needs to be public (e.g. a new asset path), the cleanest fix is to
mount its static handler **before** the URL-guard middleware in
`server.js`. Don't add new skip rules unless absolutely necessary.

### When the guard logs `🔓 doc-gates.json absent`

That's expected in dev (no build). In production it's a bug — means the
build didn't emit the file. Re-run `npm run build` and check for errors
from `plugins/access-gate-emit.js`.

### Citation filtering — same library, different surface

`isUrlAllowedForUser(url, user)` in `server.js` is the same logic
exposed for:

- `/api/chat` retrieval — filters chunks before they reach the LLM
  context. Without this, an "answer with X cites Y" could leak X-only
  content even when Y was gated away.
- `/api/chat` citation list — final filter on the citations returned.
- `/api/vector/search` results.

If you add a new RAG surface, route its URL list through the same
helper. **Never trust the vector store alone for access control.**

---

## Task: add a new role or privilege

### A new role (rare)

Roles are a closed ladder in `src/access-policy.ts`. Adding one means:

1. Add to `SmartWinnrRole` type + `ROLE_TIER` map in
   `src/access-policy.ts`.
2. Mirror in `shared/access-policy.cjs`.
3. Add to `VALID_ROLES` set in `auth/routes.js` (otherwise `/auth/dev-login`
   rejects it) and `VALID_PREVIEW_ROLES` in `auth/middleware.js` (for
   `?as=`).
4. Decide if it bypasses privileges. If yes, add to
   `PRIVILEGE_BYPASS_ROLES` in `src/access-policy.ts` and the CJS twin.
5. Coordinate with the main SmartWinnr app — the Lambda that issues
   magic links must know about the new role.

### A new privilege (common)

Privileges are open-ended. Adding one:

1. Add the key to `data/known-privileges.json`.
2. Add it to the main SmartWinnr app's
   `node_projects/smartwinnr_prd/modules/organizations/server/models/organizations.server.model.js`
   `privileges` enum **first**, then mirror here.
3. Use it in `customProps` on the categories/articles it should gate.
4. `npm run validate:privileges` will pass once the JSON has the key.

> **Trap.** Privilege keys are case-sensitive. `Quiz` ≠ `quiz`. Use the
> exact spelling from the main app.

---

## Task: persist data to SQLite

### When to add a new DB

Almost never. The three existing DBs (chat-logs, feedback, digests)
cover the use cases we have. If you're thinking "I need a fourth DB,"
first check if the data belongs in one of the existing ones with a new
table.

### When to add a new table to an existing DB

Pattern: edit the relevant `db/<name>.js`. The migration approach is
deliberately simple — at boot, each module runs a series of
`CREATE TABLE IF NOT EXISTS` and `ALTER TABLE ... ADD COLUMN` statements.
There is no formal migration framework.

Example (`db/chat-logger.js`, simplified):

```js
const db = new Database(CHAT_LOG_DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id          TEXT PRIMARY KEY,
    user_email  TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    ...
  );

  CREATE TABLE IF NOT EXISTS exchanges (
    id              TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    question        TEXT NOT NULL,
    answer          TEXT NOT NULL,
    created_at      TEXT NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
  );
`);

// Lazy column add for an existing prod DB:
try { db.exec(`ALTER TABLE exchanges ADD COLUMN confidence REAL`); }
catch (_) { /* already added */ }
```

The `try/catch` is the migration safety net — SQLite throws if the
column already exists. Idempotent and safe.

### Circuit breaker

Every `db/*.js` writer wraps its `INSERT`s in a circuit breaker:

```js
let failures = 0;
let openedAt = null;
function shouldWrite() {
  if (openedAt && Date.now() - openedAt < COOLDOWN_MS) return false;
  return true;
}
function write(...) {
  if (!shouldWrite()) return;
  try {
    stmt.run(...);
    failures = 0; openedAt = null;
  } catch (e) {
    failures++;
    if (failures >= THRESHOLD) openedAt = Date.now();
    console.error('[db]', e);
  }
}
```

This means: a sick DB never takes down the request. Chat exchanges
return to the user even if the log can't write. Logs catch up when the
DB heals.

> **Note.** `npm run db:heal` is the manual recovery — see
> `scripts/heal-chat-logger.js`. It rebuilds indexes and re-opens the
> file if it got locked.

### Local SQLite inspection

```bash
sqlite3 ./data/chat-logs.db
sqlite> .tables
sqlite> .schema exchanges
sqlite> SELECT count(*) FROM exchanges;
sqlite> SELECT * FROM exchanges ORDER BY created_at DESC LIMIT 5;
```

In production, shell into the Railway container first (see
`RAILWAY_SSH_ACCESS.md`).

---

## Task: add a new environment variable

Steps in order:

1. **Add a default value** in code:

   ```js
   const MY_VAR = process.env.MY_VAR || 'sensible-default';
   ```

   If there's no sensible default and prod must set it, fail loudly:

   ```js
   const MY_VAR = process.env.MY_VAR;
   if (!MY_VAR) throw new Error('MY_VAR is required');
   ```

2. **Document it** in:
   - `.env.example` — include a comment explaining what it does.
   - `RAILWAY_ENVIRONMENT_VARIABLES.md` — table of every var, per service.
   - `ARCHITECTURE.md` §7 — the reference table.
   - `developer-guide/09-reference.md#environment-variables` — the
     guide's quick-lookup.

3. **Set it in Railway:**

   ```bash
   railway variables --service docusaurus --set "MY_VAR=value"
   ```

4. **Redeploy** for the new value to take effect.

> **Why all four locations.** `.env.example` is for new devs. The Railway
> docs are for ops. ARCHITECTURE is for design conversations. The
> developer-guide reference is for engineers looking up "what does this
> var do?" Different audiences, all need the info.

---

## Task: change the chatbot prompt or retrieval

### The prompt

`prompts/wynnie.md` is the system prompt. Edit it directly. The server
reads it on every chat request (no restart needed), so iteration is
fast.

```bash
# Open the prompt
$EDITOR prompts/wynnie.md
# Test against a real query
curl -X POST -b "swhelp_session=<cookie>" \
  http://localhost:3001/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"how do I create a quiz?"}'
```

### Retrieval (vector search)

In `server.js`, the `/api/chat` route does roughly:

```
1. Embed the question via OpenAI.
2. ChromaDB cosine query for top-K chunks.
3. Filter chunks by isUrlAllowedForUser(chunk.url, req.user).
4. Build the context string: top-N chunks concatenated, with
   citation IDs.
5. Call OpenAI chat completion with prompts/wynnie.md as system,
   context as user.
6. Parse citations from the response, filter through
   isUrlAllowedForUser one more time, return.
```

Knobs you can tune:

- **`TOP_K`** — number of chunks retrieved before filtering. Higher =
  more context but more tokens.
- **`DISTANCE_THRESHOLD`** — citations beyond this distance are dropped.
- **`CONTEXT_TOKEN_BUDGET`** — how much of the chunk content makes it
  into the prompt.

All three are constants near the top of the `/api/chat` handler. There's
no env-var override yet — change them in code and re-test.

### When changing retrieval, always re-test against:

- A signed-in `user` asking about a `superadmin`-only setting → expect
  refusal or generic answer, never a leaked specific.
- A signed-in `superadmin` asking the same → expect a cited answer.
- A signed-in `user` asking a question whose answer needs chunks across
  two articles → expect the response to cite both.
- A long question (>1000 tokens) → expect graceful truncation, not a
  timeout.

---

## Server.js navigation map

A rough table-of-contents for `server.js` to save you from scrolling:

| Line range (approx.) | Section |
|---|---|
| 1-100 | Requires, CORS, JSON body, health check |
| 100-220 | Auth init, `/api/me`, ChromaDB client setup, helper functions |
| 220-320 | `isUrlAllowedForUser`, vector-search helpers |
| 320-560 | `/api/chat` (RAG flow) + `/api/chat/:id`, rating, citation-click |
| 560-700 | `/api/admin/chat-logs/*` |
| 700-760 | `/api/feedback` + `/api/admin/feedback*` |
| 760-1000 | `/api/admin/digests/*` |
| 1000-2300 | `/api/admin/authoring/*` (the wizard backend) |
| 2300-2400 | URL guard middleware |
| 2400-end | Static serving, 404, `app.listen` |

Use `grep -n` for specifics. The order of routes is roughly the order
they were added, not strictly by topic — but the table above gets you to
the right region.

---

Next: [06-tasks-frontend.md](./06-tasks-frontend.md) →
