# 08. Debugging

**Version:** 1.0 | **Last Updated:** June 2026

**Audience:** Engineers diagnosing a bug in dev or prod.

---

## Table of contents

1. [The diagnostic mindset](#the-diagnostic-mindset)
2. [Where to look first](#where-to-look-first)
3. [Symptom matrix](#symptom-matrix)
4. [Useful commands](#useful-commands)
5. [Inspecting SQLite databases](#inspecting-sqlite-databases)
6. [Chat-logger circuit breaker recovery](#chat-logger-circuit-breaker-recovery)
7. [Reading the URL guard](#reading-the-url-guard)
8. [Reading `server.js` logs](#reading-serverjs-logs)
9. [Browser-side debugging](#browser-side-debugging)
10. [When all else fails](#when-all-else-fails)

---

## The diagnostic mindset

Every bug in this stack falls into one of five buckets. Identifying the
bucket first cuts triage time in half.

| Bucket | Symptom | Where to look |
|---|---|---|
| **Auth** | Redirect loop on `/auth/login`, 401 on `/api/me`, no cookie set after callback | `auth/jwt.js`, `auth/middleware.js`, `HELP_JWT_SECRET` |
| **Gating** | Content visible to the wrong role, "403 Forbidden" for someone who should have access | `_category_.json` `customProps`, frontmatter, `build/doc-gates.json`, `src/access-policy.ts` |
| **RAG / Chat** | Chatbot returns "I don't know" for a known answer, citations link to 403 pages, hallucinations | `prompts/wynnie.md`, `server.js` `/api/chat`, `scripts/internal-indexer.js`, ChromaDB |
| **Build** | "Privilege not in known-privileges.json", "Unreachable gate", build fails before deploy | `data/known-privileges.json`, `_category_.json`, `scripts/audit-gates.js` |
| **DB** | `/admin/analytics/chat` shows zero rows, `/api/feedback` returns 500, digest emails not arriving | `db/<name>.js`, SQLite circuit breaker, `/app/data/*.db`, `npm run db:heal` |

When you start debugging, **ask the bucket question first**. Most
"weird" bugs collapse to one of these.

---

## Where to look first

In order:

1. **Browser DevTools → Network tab.** The failing request tells you
   *what* and *why*. A 401 is auth; a 403 is gating; a 500 is server-
   side. Note the URL, method, and response body.
2. **Server logs.** `railway logs --service docusaurus -f` in prod;
   the terminal running `server.js` in dev. Errors print with stack
   traces.
3. **The relevant module.** If the failure is in `/api/chat`, the
   handler is in `server.js`. Open the file at that line and read top-
   down.
4. **The DB.** If a write went missing or a row looks corrupt, open the
   SQLite file directly. See [§ Inspecting SQLite](#inspecting-sqlite-databases).

> **Trap.** Don't start by re-reading `ARCHITECTURE.md`. The high-level
> docs help you understand *what should happen*, not *what is
> happening*. For a live bug, read the network response and the logs
> first.

---

## Symptom matrix

### Auth

| Symptom | Diagnosis | Fix |
|---|---|---|
| `/auth/login` redirects in a loop | Cookie minted with a different `HELP_JWT_SECRET` than the running server | Clear `swhelp_session` cookie; verify `HELP_JWT_SECRET` is set; re-sign in via `/auth/dev-login` |
| `GET /api/me` returns 401 with cookie present | Same as above — secret mismatch | Same as above |
| `/auth/dev-login?role=user` 404s | Server is in production mode (`NODE_ENV=production`) | This route is gated; not a bug. Use production magic-link or temporarily start with `NODE_ENV=development` |
| Cookie not set after `/auth/callback` | Lambda issued a JWT with the wrong signing key | Check Lambda's `HELP_JWT_SECRET` matches the help server's |
| `?as=user` ignored in prod | Only `superadmin` may preview-as in production | Sign in as superadmin, or use the dev-login URL to mint a non-superadmin cookie |

### Gating

| Symptom | Diagnosis | Fix |
|---|---|---|
| User says they should see a section but it's hidden | Sidebar gating in `_category_.json` doesn't match their role/privilege | Check `customProps`. Test with `?as=<user.role>&privileges=<user.privs>` |
| Hand-typed URL returns 403 unexpectedly | URL guard has a `customProps` chain that AND-denies | Check `build/doc-gates.json` for the path. Each ancestor's gate must allow |
| Sidebar hides a section but a typed URL serves the HTML | `build/doc-gates.json` is missing (dev with no build) or stale | Run `npm run build`; verify the boot log says `🔐 doc-gates.json loaded` |
| New article visible to everyone | `customProps.roles` is missing or empty in frontmatter | Add it; rebuild |
| New privilege not recognized | Not in `data/known-privileges.json` | Add the key (mirrors LMS-side enum) |

### RAG / Chat

| Symptom | Diagnosis | Fix |
|---|---|---|
| Chatbot says "I don't know" about a doc that exists | Article not in ChromaDB (newly added, indexer not run) | `npm run index-internal` |
| Chatbot returns confident but wrong info | Either stale embedding (article changed since last index) OR retrieval is finding the wrong doc | Re-index; if persistent, inspect retrieved chunks (add a debug log in `/api/chat`) |
| Citations 403 on click | Cited URL is gated for the viewer — leak in retrieval filter | Verify `isUrlAllowedForUser` is applied before context-build AND on citations |
| Chat slow | OpenAI latency. Or context too large (token budget high) | Check OpenAI status; tune `CONTEXT_TOKEN_BUDGET` near top of `/api/chat` |
| Chat returns empty answer | Either OpenAI returned an empty string or all retrieval was filtered out | Check chat-logger row: was the context empty? Was the OpenAI call successful? |
| `/api/chat` 500s | ChromaDB unreachable, or OpenAI rate-limited, or DB write failed | Check the stack trace. If "collection not found", run the indexer. If OpenAI rate-limit, wait or upgrade the key. |

### Build / deploy

| Symptom | Diagnosis | Fix |
|---|---|---|
| `npm run build` fails on `validate-privileges` | A frontmatter `privilege:` key isn't in `data/known-privileges.json` | Add the key |
| Build fails on `audit-gates` | An access gate is unreachable (e.g. role denied by parent but allowed at leaf) | Reconcile: either lift the parent gate or remove the leaf gate |
| Deploy succeeds but `🔓 doc-gates.json absent` in boot log | `plugins/access-gate-emit.js` didn't run | Check `docusaurus.config.ts` `plugins` array includes it |
| Wizard publish doesn't deploy | `AUTHORING_GIT_PUSH=false` or `GIT_PUSH_TOKEN` invalid | Set the env vars; verify PAT scope |
| Railway deploy fails on `npm install` | `better-sqlite3` build issue | Confirm Python+make in the Dockerfile (they are; this should not happen with the current `Dockerfile.docusaurus`) |
| Site loads but `/admin/*` 404s | UserContext didn't hydrate — the page rendered before `/api/me` returned | Add `useIsUserReady()` guard |

### DB

| Symptom | Diagnosis | Fix |
|---|---|---|
| `/admin/analytics/chat` shows zero rows in prod | Volume not mounted at `/app/data` — DB lost on each deploy | Add the volume in Railway |
| `/api/chat` works but log row doesn't appear | Circuit breaker tripped; chat-logger silently dropping writes | `npm run db:heal`; check stderr for the trip reason |
| Two writes simultaneously corrupt the DB | SQLite is single-writer; an external process is touching the file | Don't run `sqlite3 ./data/chat-logs.db` from a shell while the server is writing. Use `.bak` first |
| `digests.db` exists but no digests sent | `CRON_SECRET` mismatch between cron service and main service | Verify with `railway variables` |

---

## Useful commands

### Server-side (Node)

```bash
# Tail logs in prod.
railway logs --service docusaurus -f

# Logs from the last 5 minutes.
railway logs --service docusaurus --since 5m

# Run a one-off command in the prod container.
railway run --service docusaurus npm run db:heal
railway run --service docusaurus npm run index-internal
```

### Auth diagnostics

```bash
# Inspect a JWT (paste the token from your swhelp_session cookie).
node -e "console.log(require('jsonwebtoken').decode('eyJ...'))"

# Verify a JWT against your secret.
node -e "
  const jwt = require('jsonwebtoken');
  try { console.log(jwt.verify('eyJ...', process.env.HELP_JWT_SECRET)); }
  catch (e) { console.error(e.message); }
"

# Mint a fresh cookie headlessly.
node scripts/dev-mint-cookie.js --role editor --privileges quiz,smartpaths
```

### Gating diagnostics

```bash
# Confirm the gate table emitted at build.
jq '.prefixes | length' build/doc-gates.json
jq '.exact["/modules/quiz/for-managers/some-article"]' build/doc-gates.json

# Test a URL against the gate table from the CLI:
node -e "
  const gates = require('./build/doc-gates.json');
  const { isAllowed } = require('./shared/access-policy.cjs');
  const user = { roles: ['manager'], privileges: ['managerView'] };
  const url = '/modules/quiz/for-managers/some-article';
  const matched = [
    ...gates.prefixes.filter(p => url.startsWith(p.prefix)).map(p => p.gate),
    gates.exact[url],
  ].filter(Boolean);
  console.log('gates:', matched);
  console.log('allowed:', matched.every(g => isAllowed(g, user)));
"
```

### RAG diagnostics

```bash
# Embed a query manually and search Chroma.
curl -X POST http://localhost:3001/api/vector/embed \
  -H 'x-internal-api-key: '"$INTERNAL_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"text":"how do I create a quiz"}'

curl -X POST -b "swhelp_session=$COOKIE" http://localhost:3001/api/vector/search \
  -H 'Content-Type: application/json' \
  -d '{"query":"how do I create a quiz", "topK": 5}'
```

### Build diagnostics

```bash
# What plugins are registered?
grep -E "^\s*\[?\s*'" docusaurus.config.ts | grep -v "^\s*//"

# What scripts run before build?
node -e "console.log(require('./package.json').scripts.prebuild)"
```

---

## Inspecting SQLite databases

### Locally

```bash
sqlite3 ./data/chat-logs.db
sqlite> .tables
sqlite> .schema exchanges
sqlite> SELECT id, user_email, question, created_at
        FROM exchanges
        ORDER BY created_at DESC
        LIMIT 5;
sqlite> SELECT count(*) FROM exchanges WHERE created_at > datetime('now','-1 day');
sqlite> .quit
```

### In production

```bash
railway ssh --service docusaurus
sqlite3 /app/data/chat-logs.db
```

### Safe copy for offline inspection

```bash
railway ssh --service docusaurus -- "cat /app/data/chat-logs.db" > local-chat-logs.db
sqlite3 local-chat-logs.db
```

> **Trap.** Don't `.open` a DB file while the server is actively
> writing it. Use `.bak` first (`sqlite3` `.backup` command) or copy
> the file to a temp location.

### Common queries

```sql
-- Hourly chat volume over the last day.
SELECT strftime('%H', created_at) AS hour, count(*) AS n
FROM exchanges
WHERE created_at > datetime('now','-1 day')
GROUP BY hour
ORDER BY hour;

-- Low-confidence answers (if confidence column exists).
SELECT id, question, confidence
FROM exchanges
WHERE confidence < 0.5
ORDER BY created_at DESC
LIMIT 20;

-- Feedback for a specific article.
SELECT rating, comment, created_at, user_email
FROM feedback
WHERE article_url = '/modules/quiz/how-to-create-a-quiz/'
ORDER BY created_at DESC;
```

---

## Chat-logger circuit breaker recovery

The chat-logger has a circuit breaker — if writes start failing, the
breaker opens and drops further writes for a cool-off period. This
keeps the chat working even when the DB is sick.

### Detect a tripped breaker

```bash
# Errors prefixed with [chat-logger] in server logs.
railway logs --service docusaurus -f | grep chat-logger

# Or: count of recent exchanges should be > 0 if chat is being used.
sqlite3 /app/data/chat-logs.db \
  "SELECT count(*) FROM exchanges WHERE created_at > datetime('now','-1 hour');"
```

### Recover

```bash
# 1. Stop traffic (if you can — usually you can't in prod).
# 2. Heal:
npm run db:heal
# This re-opens the DB connection, runs VACUUM, rebuilds indexes.
```

If `db:heal` fails, the DB file may be corrupt. Restore from the most
recent backup (Railway volume snapshots if you have them, or your most
recent `cp` of the file).

> **Last resort.** Delete the DB file. The next chat exchange will
> recreate it. You lose history but the site keeps working.

---

## Reading the URL guard

### Confirm the table loaded

```
railway logs --service docusaurus --since 1h | grep doc-gates
```

Look for one of:

```
🔐 doc-gates.json loaded: 247 prefix gates, 902 article gates
🔓 doc-gates.json absent - URL guard inactive (build first to enable)
⚠️  Failed to load doc-gates.json - URL guard inactive: <reason>
```

The third is a real bug — investigate the error.

### Why a specific URL is 403

```bash
# Get the cookie from your browser (DevTools → Application → Cookies).
curl -i --cookie "swhelp_session=eyJ..." \
  https://docusaurus-production.up.railway.app/modules/quiz/for-managers/foo
# Look at the response body: the 403 page hints at which gate denied.
```

Then trace the gate locally:

1. `jq '.exact["/modules/quiz/for-managers/foo"]' build/doc-gates.json`
2. `jq '.prefixes[] | select(.prefix | startswith("/modules/quiz"))'
   build/doc-gates.json`
3. Decode the JWT (`node -e "console.log(require('jsonwebtoken').decode('eyJ...'))"`)
   and check that `roles` × `privileges` satisfies every matched gate.

---

## Reading `server.js` logs

The server prefixes log lines by area for easier grep:

| Prefix | Source |
|---|---|
| `[server]` | startup, listen, generic |
| `[auth]` | sign-in, callback, cookie verify |
| `[chat]` | `/api/chat` lifecycle |
| `[chat-logger]` | SQLite chat-log writes |
| `[feedback]` | `/api/feedback` |
| `[digest]` | digest sending |
| `[authoring]` | wizard endpoints |
| `[indexer]` | (in the indexer process, not server.js) |
| `[vector]` | `/api/vector/{embed,search}` |
| `🔐 / 🔓 / ⚠️` | URL-guard table state (boot-time) |

When adding a new area, follow the same `[prefix]` convention. Future-
you will thank past-you.

---

## Browser-side debugging

### Tools to keep open

- **Network tab** — for every request, see status, body, headers.
- **Application tab → Cookies** — verify `swhelp_session` is set,
  HttpOnly, SameSite=Lax.
- **Console** — React warnings, ChatBot debug output.
- **React DevTools** — inspect `UserContext` state to confirm
  hydration.

### Common browser-side bugs

- **"401 on /api/me"** — cookie is missing or expired. Sign in again.
- **"CORS error on /api/chat"** — only happens if you're hitting a
  different origin than where the cookie was set. In normal use the
  page and the API are same-origin, so CORS shouldn't fire. If it does,
  check the page URL matches the API host.
- **Sidebar flickers between gated and ungated** — `UserContext` is
  re-fetching on every render. Check that the provider isn't inside a
  component that re-mounts.
- **ChatBot button shows but won't open** — the React root may have
  failed to mount. Check console for errors from `chatbot-client.js`.

---

## When all else fails

If you've spent more than 30 minutes and the symptom doesn't match any
row in the matrix:

1. **Reproduce locally.** Half of "weird prod bugs" don't reproduce
   locally because of env mismatches. The other half do, and become
   easy.
2. **Bisect.** `git log` recent commits, `git checkout` the one before
   the symptom started.
3. **Add a debug log.** Wherever you suspect, add `console.log` with
   a `[debug-NN]` prefix. Redeploy. Read the logs. Remove the log when
   done.
4. **Ask in #help-eng with a minimal repro.** "Chat returns wrong
   answer for X" is too vague. "Chat returns wrong answer for X. I see
   chunks Y and Z in the retrieval log but the LLM picks neither." is
   actionable.

---

Next: [09-reference.md](./09-reference.md) →
