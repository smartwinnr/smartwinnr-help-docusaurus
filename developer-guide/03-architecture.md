# 03. Architecture

**Version:** 1.0 | **Last Updated:** June 2026

**Audience:** Engineers about to make a change that touches more than one file. Required reading before backend or frontend work.

---

## Table of contents

1. [Single-process design](#single-process-design)
2. [Boot sequence](#boot-sequence)
3. [Middleware order in `server.js`](#middleware-order-in-serverjs)
4. [Auth model](#auth-model)
5. [URL guard](#url-guard)
6. [Data stores](#data-stores)
7. [Build-time artifacts](#build-time-artifacts)
8. [Frontend integration points](#frontend-integration-points)
9. [Background pipelines](#background-pipelines)
10. [Architecture map](#architecture-map)

---

## Single-process design

All four surfaces — docs, Wynnie, the authoring wizard, the admin
dashboards — run inside the same Express process. `server.js` is the
single entrypoint in production:

```bash
node server.js
```

The Docusaurus React app is **pre-built** into `build/` at image-build
time. At runtime, `server.js` does two things on every request:

1. Run a small middleware chain (auth → URL guard).
2. Serve either an `/api/*` JSON response or a static file from `build/`.

There is no separate "chatbot service." Older docs may describe a 3-service
split (`docusaurus` + `chatbot-api` + `chromadb`). That was collapsed.
The current production deployment is **2 services**: `docusaurus` (this
process) + `chroma` (manually configured from a Railway template).

> **Why one process.** Simpler deploys. One image to build, one health
> check, one log stream, one auth surface. The chatbot's RAG happens to
> use OpenAI + Chroma, but it's *a function call inside Express*, not a
> different runtime.

---

## Boot sequence

`server.js` runs through these steps once at startup. If you've added
something that needs initialization, this is where it goes.

```
 1. require('dotenv').config()
 2. Build Express app, register CORS for /api/*
 3. Mount GET /api/health (BEFORE auth so health checks bypass cookie)
 4. initAuth(app)
       Mounts /auth routes (public): /login, /callback, /logout,
       /auth/dev-login (DEV only). Then mounts auth middleware so every
       subsequent route requires a valid swhelp_session cookie.
 5. Mount /api/me  (returns the hydrated UserContext payload)
 6. Open SQLite connections via require('./db/...')
 7. Open ChromaDB client
 8. Mount /api/vector/embed (key-guarded), /api/vector/search, /api/chat,
       /api/feedback, and every /api/admin/* route.
 9. Load build/doc-gates.json (if present) → URL-guard middleware
10. express.static('build/', ...)        ← static docs
11. express.static('static/', ...)       ← newly-uploaded authoring images
12. Catch-all → 404 (or 403 from the URL guard above)
13. app.listen(PORT)
```

The boot logs include:
- `🔐 doc-gates.json loaded: N prefix gates, M article gates` (URL guard active)
- `🔓 doc-gates.json absent - URL guard inactive (build first to enable)` (dev mode without a build)

If neither line shows up, the guard module didn't load — check
`server.js` around line 2322.

---

## Middleware order in `server.js`

The order matters because of how Express composes handlers.

```
Request
  │
  ▼
 1. cors() on /api/*                 ← preflight handled here
 2. express.json({ limit: '10mb' })  ← parses JSON bodies (image upload uses 10MB)
 3. express.urlencoded(...)
 4. /api/health                      ← public, returns early
 5. initAuth(app):
        a. /auth/login, /callback, /logout, /dev-login
        b. auth middleware:
              - read swhelp_session cookie
              - verifySessionToken (HELP_JWT_SECRET)
              - on failure: redirect /auth/login or 401 for /api/*
              - on success: req.user = { email, roles, region,
                orgId, orgName, privileges, displayName }
              - maybeApplyPreview(req) handles ?as=<role>
 6. /api/me, /api/vector/embed, /api/chat, /api/feedback,
    /api/admin/*, ... (all auth-required by step 5)
       - admin routes additionally require requireRole('superadmin')
       - /api/vector/embed additionally requires INTERNAL_API_KEY header
 7. URL-guard middleware:
       - skips /api/* and /auth/* (those are already gated above)
       - looks up gates for req.path in build/doc-gates.json
       - AND-of-all-matching-gates against req.user
       - 403 (with a friendly 403.html if present) on deny
 8. express.static('build/', ...) for docs
 9. express.static('static/', ...) for newly-uploaded images
10. 404
```

If you're inserting middleware:
- **Auth needed?** Mount it after step 5.
- **Admin-only?** Pair the route with `requireRole('superadmin')`.
- **No auth needed?** Mount it *before* step 5 (rare; `/api/health` is the only one today).

---

## Auth model

### Magic-link sign-in

```
 1. User hits any URL → middleware sees no cookie → redirect to /auth/login
 2. /auth/login renders a branded form (see auth/loginPage.js)
 3. Form POSTs the email to LAMBDA_MAGIC_LINK_URL
        - In prod: Mailgun-Lambda emails a magic link with a JWT
        - In dev:  use /auth/dev-login?role=… to skip the round-trip
 4. User clicks the link → /auth/callback?token=<JWT>
 5. auth/routes.js verifies the JWT with HELP_JWT_SECRET, then re-signs
    a fresh swhelp_session cookie via signSessionToken (auth/jwt.js)
 6. Cookie is HttpOnly + SameSite=Lax. Server reads it on every request.
```

### JWT payload

```json
{
  "email": "user@example.com",
  "displayName": "Charan",
  "roles": ["editor"],
  "region": "in",
  "orgId": "org-123",
  "orgName": "Acme Inc",
  "privileges": ["quiz", "smartpaths", "managerView"]
}
```

These fields land on `req.user` in every authenticated request, and on
`UserContext` in the React app via `GET /api/me`.

### Role tier

`src/access-policy.ts` defines:

```
user:        tier 1
manager:     tier 2
editor:      tier 3
admin:       tier 4
lamadmin:    tier 5
orgadmin:    tier 5
superadmin:  tier 6
```

`superadmin` is special — it bypasses privilege checks (see
`PRIVILEGE_BYPASS_ROLES` in the same file). A `superadmin` always passes
every gate.

### Server-side enforcement

Two libraries:

- **`auth/middleware.js`** — cookie verification, `req.user` population,
  `?as=` preview interceptor.
- **`auth/requireRole.js`** — `requireRole('superadmin')` factory used
  inline on `/api/admin/*` routes.

### Frontend awareness

The React client has **no notion of authentication state** until it
fetches `/api/me`. On mount, `src/contexts/UserContext.tsx` makes that
fetch; until it returns, every gated component renders a skeleton.

The ChatBot widget mounts in its own React root (`plugins/chatbot-client.js`)
*outside* the main `Root.tsx`, so it fetches `/api/me` independently.

---

## URL guard

The sidebar gates content **for navigation**. The URL guard gates content
**for the network**. Without the guard, anyone with a guessed URL could
fetch a category they shouldn't see — the sidebar would have hidden it,
but `express.static` would have served the HTML.

### How the gate table is built

At build time, `plugins/access-gate-emit.js` walks:

1. Every `_category_.json` (the `customProps` field).
2. Every article's frontmatter (`customProps`).

It produces `build/doc-gates.json`:

```json
{
  "version": 1,
  "prefixes": [
    { "prefix": "/modules/quiz",       "gate": { "roles": ["editor","admin"], "privilege": "quiz" } },
    { "prefix": "/modules/quiz/for-managers", "gate": { "roles": ["manager","editor","admin"], "privilege": "managerView" } }
  ],
  "exact": {
    "/modules/quiz/for-managers/some-article": { "roles": ["manager"], "privilege": "managerView" }
  }
}
```

### How the gate is checked

At every request to a non-`/api/*` non-`/auth/*` path:

```js
const gates = lookupGates(req.path);
// every prefix that matches + the exact-path gate if present
const blocked = gates.some(g => !isAllowed(g, req.user));
if (blocked) return res.status(403).sendFile(buildPath + '/403.html');
```

**AND semantics** — every ancestor category PLUS the article's own gate
must allow the viewer. This catches the deep-nesting bug where an
article gated to `role: user` lives under a category gated to a
`quiz`-licensed org. The user role alone is not enough.

### Same logic, used for citations and search

`isUrlAllowedForUser(url, user)` reuses the same lookup. It filters:

- vector-search results (`/api/vector/search`)
- chatbot retrieval context (`/api/chat`)
- chatbot citations in the answer

So if a learner asks Wynnie about an admin-only setting, the gated
articles are never passed to the LLM context — the answer won't even
*mention* them. This is the difference between defense-in-depth and
"oops we put private content in a public-looking response."

### Falling open in dev

If `build/doc-gates.json` is missing (dev with no build, or a fresh
clone), the guard logs `🔓 doc-gates.json absent` and falls **open** —
every doc URL is reachable. This is intentional: local dev shouldn't
break just because you haven't built.

---

## Data stores

The site uses **two** classes of data store: a vector DB (ChromaDB)
and three small relational DBs (SQLite via `better-sqlite3`).

### ChromaDB

- **Collection:** `smartwinnr_docs` (configurable via `COLLECTION_NAME`).
- **What's in it:** one row per article chunk (rough chunking by section).
- **Embedding model:** `text-embedding-3-small` (1536 dimensions, OpenAI).
- **Written by:** `scripts/internal-indexer.js` via POST to
  `/api/vector/embed`. The indexer is incremental — SHA-256 hash per
  doc, only re-embed if the hash changed.
- **Read by:** `server.js` `/api/chat` and `/api/vector/search`.

Connection settings: `CHROMA_HOST`, `CHROMA_PORT`, `CHROMA_SSL`. In
production, `CHROMA_HOST=chroma.railway.internal` reaches the manually-
configured ChromaDB service over Railway's private network.

### SQLite × 3

| File | Module | Tables | Purpose |
|---|---|---|---|
| `chat-logs.db` | `db/chat-logger.js` | conversations, exchanges, citations, ratings | Every chat exchange persists here. Used by `/admin/analytics/chat`. |
| `feedback.db` | `db/feedback-logger.js` | feedback | Per-article thumbs + comment from `FeedbackFooter`. Used by `/admin/analytics/feedback`. |
| `digests.db` | `db/digest-store.js` | subscriptions, send_log | Who's subscribed to which weekly digest, when it last sent. |

All three:
- Use `better-sqlite3` (synchronous, fast).
- Are wrapped in a **circuit breaker** — if writes start failing, the
  module short-circuits future writes for a cool-off period instead of
  taking down the request. Chat exchanges still return to the user; the
  log just gets dropped.
- Live at paths configurable via env (`CHAT_LOG_DB_PATH`, etc.). Default
  is `./data/<name>.db`.
- In production, mount a Railway volume at `/app/data` so they survive
  deploys. Without the volume, all chat-log analytics resets on every push.

> **Why SQLite?** The whole site is one process, with no horizontal scale
> story. SQLite gives us local ACID writes, file-based backups (just `cp`
> the .db file), and zero ops cost. The day a second replica is needed,
> this changes — but it's not the foreseeable future.

---

## Build-time artifacts

`npm run build` produces:

| Artifact | Source | Consumed by |
|---|---|---|
| `build/index.html` and every other page | Docusaurus | `express.static` |
| `build/assets/*.{js,css,…}` | Docusaurus webpack | the browser |
| **`build/doc-gates.json`** | `plugins/access-gate-emit.js` | `server.js` URL guard |
| `build/sitemap.xml` | Docusaurus sitemap plugin | search crawlers (only what they're allowed to see if site is public; here it's behind auth so largely moot) |
| `build/module-overviews.json` | a custom plugin | `src/components/Modules/ModuleOverview.tsx` (the per-module landing pages) |

The `prebuild` script (`validate-privilege-keys` + `audit-gates`) runs
before the build, so a misnamed privilege or unreachable gate fails the
build cycle — never reaches `doc-gates.json`.

---

## Frontend integration points

The React app is mostly stock Docusaurus + a handful of swizzled theme
components and custom widgets. The integration points worth knowing:

| File | What it does |
|---|---|
| `src/contexts/UserContext.tsx` | Fetches `/api/me` once on mount. Every gated component reads from this context. |
| `src/theme/Root.tsx` | Wraps the app in `UserProvider`. Plus a `ToastProvider`, plus boots a few singletons. |
| `src/theme/DocSidebarItem/{Category,Link}/index.tsx` | Swizzled — reads `customProps.{roles, privilege, anyPrivilege}` and calls `isAllowed()` to hide gated entries. |
| `src/components/ChatBot/ChatBot.tsx` | The Wynnie widget. Floating button → modal → `/api/chat`. |
| `plugins/chatbot-plugin.js` | Docusaurus plugin: injects `chatbot-client.js` as a client module so the widget mounts on every page. |
| `plugins/chatbot-client.js` | Boot script that mounts `<ChatBot />` in its own React root **outside** `Root.tsx` (so it can fetch `/api/me` independently and doesn't block the rest of the app). |
| `src/components/Article/FeedbackFooter.tsx` | "Was this helpful?" footer on every article. POSTs to `/api/feedback`. |
| `src/pages/admin/authoring/*` | The 3-step wizard React UI. |
| `src/pages/admin/analytics/{chat,feedback}.tsx`, `src/pages/admin/digests.tsx` | Admin dashboards. |
| `src/access-policy.ts` | The shared gate resolver. **Critical**: it has a CommonJS twin at `shared/access-policy.cjs` so `server.js` can use the exact same `isAllowed()` logic. Keep them in sync. |

> **Why the .ts/.cjs twin?** Docusaurus's React app compiles TS via
> webpack; `server.js` is plain Node CJS. They can't import each other.
> So `src/access-policy.ts` and `shared/access-policy.cjs` are the same
> code in two dialects. Changes to one **must** be mirrored in the other.

---

## Background pipelines

Five background pipelines exist. None run automatically on every deploy.

| Pipeline | Trigger | Outcome |
|---|---|---|
| **Indexer** (`scripts/internal-indexer.js`) | Manual: `npm run index-internal` | Re-embed new/changed docs into ChromaDB. |
| **Freshdesk pipeline** (`scripts/freshdesk/`) | Manual: when a new ticket export arrives | Gap analysis → new article drafts. |
| **Help Scout re-sync** (`scripts/migrate-helpscout.js`) | Manual: when upstream Help Scout changes | Upsert `docs/` from Help Scout. |
| **Article audit + rewrite** (`scripts/audit-articles.js`, `scripts/rewrite-articles.js`) | Manual or scheduled | Content-quality lift. |
| **Digest emails** | Railway cron, weekly | POST to `/api/admin/digests/send?type=...`. |

Of these, only the **digests** run automatically (via Railway cron jobs
hitting the API). Everything else is engineer-driven.

See [04-tasks-content.md](./04-tasks-content.md) for how to operate them.

---

## Architecture map

```
                 ┌──────────────────────────────────────────────────────┐
                 │                        BROWSER                        │
                 │  Docusaurus static site (served from build/)          │
                 │   - Sidebar (swizzled, role-gated)                    │
                 │   - Article body with FeedbackFooter                  │
                 │   - Wynnie ChatBot (floating)                         │
                 │   - VectorSearch (navbar)                             │
                 │   - /admin/* pages (superadmin)                       │
                 │  UserContext hydrated via single GET /api/me          │
                 └─────────────────────────┬─────────────────────────────┘
                                           │  fetch() with swhelp_session
                                           ▼
   ┌────────────────────────────────────────────────────────────────────┐
   │                EXPRESS SERVER  (server.js, port PORT)                │
   │                                                                    │
   │  Layer 0  Public:    GET /api/health                               │
   │  Layer 1  Auth:      /auth/login, /callback, /dev-login (DEV),     │
   │                       middleware verifies swhelp_session            │
   │  Layer 2  URL guard: build/doc-gates.json → 403 disallowed paths   │
   │  Layer 3  Static:    express.static('build/')                      │
   │  Layer 4  APIs (all auth-protected):                               │
   │     /api/me, /api/vector/{embed,search}, /api/chat,                │
   │     /api/feedback, /api/admin/{chat-logs,feedback,digests,         │
   │     authoring}/*                                                   │
   └──────────┬────────────────────┬────────────────────┬───────────────┘
              │                    │                    │
              ▼                    ▼                    ▼
       ┌─────────────┐      ┌────────────┐      ┌─────────────────────┐
       │  ChromaDB   │      │  OpenAI    │      │  SQLite (3 files)   │
       │  port 8000  │      │            │      │  /app/data/*.db     │
       │ smartwinnr_ │      │ embed-3-S  │      │  - chat-logs        │
       │ docs        │      │ chat       │      │  - feedback         │
       │ (~900 docs) │      │            │      │  - digests          │
       └─────────────┘      └────────────┘      └─────────────────────┘

  External:
    Mailgun Lambda ← /auth/login POSTs here for magic-link issuance
    GitHub Git API ← authoring-wizard publish pushes commits (auto-deploy)
    Railway cron  → /api/admin/digests/send (weekly digest emails)

  Offline pipelines (manual):
    scripts/internal-indexer.js          re-embed docs into Chroma
    scripts/freshdesk/                   support tickets → new articles
    scripts/migrate-helpscout.js         re-sync from Help Scout
    scripts/{audit,autofix,rewrite}.js   content-quality passes
```

---

Next: [04-tasks-content.md](./04-tasks-content.md) →
