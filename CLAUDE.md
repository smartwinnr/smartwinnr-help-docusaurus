# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Docusaurus documentation site for SmartWinnr help content, plus an integrated Express
backend (`server.js`) that serves the static build AND a chatbot/vector-search API. Docs
are Markdown in `docs/` (26 category dirs, 877+ files); a RAG pipeline indexes them into
ChromaDB and answers questions via OpenAI. See `ARCHITECTURE.md` for the full RAG,
indexing, and Freshdesk-pipeline detail — but note the corrections in "Gotchas" below.

## Commands

```bash
npm run dev            # Docusaurus dev server, hot reload, docs only, port 3001 (NO chatbot API)
npm run dev:full       # Docs (3000) + chatbot API (3002) in parallel — but see gotcha re services/
npm run build          # Compile docs to static build/
node server.js         # Unified Express server: serves build/ + all /api routes on PORT (default 3000)
npm start              # build + node server.js (production-like, single port)

npm run index-internal # Index docs/ into ChromaDB (incremental, hash-based). Requires server.js running.
FORCE_FULL_REINDEX=true npm run index-internal   # Delete collection + re-embed all docs

npm run lint:docs      # markdownlint-cli2 over docs (custom rules in custom-markdownlint-rules.js)
npm run lint:docs:fix  # Auto-fix lint issues
npm run typecheck      # tsc (no emit)
```

No automated test suite exists. Validation is: `lint:docs`, `typecheck`, and `build`.

## Architecture (big picture)

- **Single server, single port.** `server.js` (Express) serves the Docusaurus `build/`
  statically AND hosts the API. There is no separate API service in production.
- **API routes:** `/api/health` (public), `/api/vector/embed` (OpenAI embeddings, guarded
  by `INTERNAL_API_KEY`), `/api/vector/search`, `/api/chat` (RAG), `/api/chat/:id`,
  and `/api/admin/chat-logs/*` (superadmin only).
- **RAG flow:** question → embed (`text-embedding-3-small`) → ChromaDB cosine search
  (collection `smartwinnr_docs`) → build context → OpenAI chat completion → answer + citations.
- **Indexer:** `scripts/internal-indexer.js` scans `docs/`, SHA-256 content-hashes each
  file, and only re-embeds NEW/CHANGED docs (calls the server's own `/api/vector/embed`).
- **Auth:** `auth/` gates the whole site. Users arrive via a magic link from the main
  SmartWinnr app; `/auth/callback?token=<JWT>` verifies the JWT (must have editor/admin
  role), then sets a session cookie. `initAuth(app)` in server.js mounts `/auth` routes
  (public) then `requireAuth` — everything mounted after is protected. Admin chat-log
  endpoints additionally require `requireRole('superadmin')`.
- **Chat logging:** `db/chat-logger.js` persists every exchange to SQLite (better-sqlite3)
  at `CHAT_LOG_DB_PATH`. It has a circuit breaker (degrades gracefully, never breaks chat),
  retention (`CHAT_LOG_RETENTION_DAYS`), anonymized export, and audit logging.
- **Frontend integration:** the ChatBot widget and VectorSearch bar are React components
  in `src/components/`, injected into Docusaurus via `plugins/chatbot-plugin.js`. Sidebar
  is auto-generated from the `docs/` directory tree (`sidebars.ts`).
- **Content pipeline:** `scripts/freshdesk/` ingests support-ticket CSVs and generates new
  articles (see ARCHITECTURE.md §4). Output lands in `docs/{category}/` and becomes
  searchable only after `npm run index-internal`.

## Gotchas (read before editing)

- **`services/chatbot/` does NOT exist.** The `package.json` scripts `chatbot:start`,
  `chatbot:dev`, `index-docs`, and `start:production` point at `services/chatbot/*.ts`
  files that aren't in the repo — they are stale and will fail. The real backend entry is
  `server.js`. Use `node server.js` / `npm start`, not those scripts.
- **`ARCHITECTURE.md` §8 is outdated**: it says "no authentication." Auth now exists and
  gates the entire site (see Auth above). Treat its RAG/indexing sections as accurate but
  its access-control claims as superseded by `auth/`.
- **All SmartWinnr roles can sign in** (`user`, `manager`, `editor`, `admin`, `orgadmin`,
  `lamadmin`, `superadmin`) — `auth/routes.js` no longer restricts to editor/admin. What
  each role sees inside is decided by the swizzled `DocSidebarItem/{Category,Link}`
  wrappers reading `customProps.{roles, privilege, anyPrivilege}` from `sidebars.ts` and
  `_category_.json` files. Gate-resolution logic lives in `src/access-policy.ts`
  (`isAllowed`); `superadmin` bypasses privilege checks (`PRIVILEGE_BYPASS_ROLES`).
  **Caveat**: the sidebar hides categories, but `express.static` still serves
  hand-typed/shared URLs for those paths — there is no server-side URL guard yet (Phase D
  in `AUTH_MENU_PLAN.md`).
- **`GET /api/me`** is the only endpoint the React client calls on mount to hydrate
  `UserContext` (`src/contexts/UserContext.tsx` → `src/theme/Root.tsx`). Response shape:
  `{ email, roles, region, orgId, privileges }`. The session JWT carries the same fields,
  set by the main app's `helpAuth` controller when issuing the magic link;
  `auth/middleware.js` populates them on `req.user`. The ChatBot mounts in its own React
  root (`plugins/chatbot-client.js`) outside `Root.tsx`, so it does its own `/api/me`
  fetch to pick up the viewer's primary role.
- **Indexing requires the server running**: `index-internal` calls
  `http://localhost:{PORT}/api/vector/embed`, so start `server.js` first.
- **`npm run dev` has no chatbot API.** To exercise chat/search locally you need
  `node server.js` (after `npm run build`) so the `/api` routes are live.
- **No decorative emojis in docs.** A husky pre-commit hook runs `lint:docs:fix` and
  BLOCKS the commit if the `no-decorative-emojis` rule fires. GitLab CI also enforces
  `lint:docs` and `build` on doc/source changes.
- **Docs frontmatter & style** are governed by `SmartWinnr-Help-Style-Guide.md`
  (American English, active voice, bold UI elements, ≤15–20-word sentences).

## Article format (canonical)

Every article under `docs/` must conform to this schema. `scripts/migrate-helpscout.js`
is the only sanctioned author for new articles; if you hand-write one, follow the same
shape. See `AUTH_MENU_PLAN.md` §C1 for the full Phase C plan.

### Frontmatter

```yaml
---
id: <helpscout_id>                           # required; doubles as Docusaurus doc id
title: "<Article Title>"                     # required; double-quoted; Title Case
description: "<one-line summary, ≤160 chars>"  # required; double-quoted; may be ""
slug: <kebab-case-slug>                      # required; unquoted; URL-safe
sidebar_position: <integer>                  # required; preserved across re-syncs if a human set it
last_update:
  date: <YYYY-MM-DD>                         # required; from Help Scout updatedAt
  author: HelpScout Migration                # required; literal string
source:
  helpscout_id: <helpscout_id>               # required; matches top-level `id`
  helpscout_url: <https://help.smartwinnr.com/article/...>  # required
customProps:                                 # required; consumed by sidebar swizzles
  roles: [user, editor, admin]               # at least one SmartWinnr role
  privilege: <orgPrivilegeKey>               # optional; one of the org `privileges` enum
tags: []                                     # optional; Help Scout tags, lowercased
---
```

Rules:
- Field order is fixed (above). Do not add fields outside this schema.
- No comments inside the frontmatter block.
- `id` exists at the top because Docusaurus uses it for routing and links; it also keeps
  the migrator's upsert deterministic.
- `customProps.roles` values must be valid `SmartWinnrRole` strings from
  `src/access-policy.ts`. `customProps.privilege` must match an entry in the
  `privileges` enum at
  `node_projects/smartwinnr_prd/modules/organizations/server/models/organizations.server.model.js`.

### Canonical directory layout

The migrator refuses to write into any directory not listed in `CANONICAL_DIRS` at the
top of `scripts/migrate-helpscout.js`. The layout mirrors `sidebars.ts`:

```
docs/
  overview/                            # all roles
  getting-started/                     # all roles
  announcements/                       # all roles
  user-guide/                          # all roles
  user-guide/ai-coaching/              # all roles (privilege: aiCoaching)
  help-support/                        # all roles
  troubleshooting/                     # all roles
  manager-guide/                       # manager+editor+admin (privilege: managerView)
  administration/
    system-management/                 # admin only
    access-permissions/                # admin only
    quiz-module/                       # editor+admin (privilege: quiz)
    smartpath-module/                  # editor+admin (privilege: smartpaths)
    smartfeed-module/                  # editor+admin (privilege: content)
    video-coaching-module/             # editor+admin (privilege: coaching)
    field-coaching-module/             # editor+admin (privilege: fCoaching)
    ai-coaching/                       # editor+admin (privilege: aiCoaching)
    survey-module/                     # editor+admin (privilege: survey)
    knowledge-hub-module/              # editor+admin (privilege: khub)
    forms-module/                      # editor+admin (privilege: forms)
    kpi-gamification/                  # editor+admin (anyPrivilege: kpi|competitions|achievements)
    reports/                           # editor+admin (anyPrivilege: learnerReport|adminReports|generatedReports)
    notifications/                     # editor+admin (anyPrivilege: customNotifications|notifications|chat)
    project-management/                # editor+admin (privilege: projectManagement)
    cross-module-features/             # editor+admin (catch-all: common actions, uncategorized)
```

### Image convention

Help Scout images live under `static/img/helpscout/<collection-slug>/<article-slug>-<n>.<ext>`
and are referenced from markdown as `/img/helpscout/<collection-slug>/<article-slug>-<n>.<ext>`.
The migrator buckets per-collection so deletes/audits are scoped. Existing on-disk files
with non-zero size are not re-downloaded.

`scripts/migrate-images.js` handles non-Help-Scout sources (Google Drive,
support.smartwinnr.com) and is a one-shot cleanup tool — it is NOT part of the canonical
re-sync pipeline.

### Re-sync runbook

```bash
npm run backup:docs                                              # tarball to data/backups/
git checkout -b backup/pre-helpscout-resync-<YYYY-MM-DD>         # frozen snapshot branch
git checkout main && git checkout -b feature/helpscout-resync-<YYYY-MM>
npm run helpscout:inventory                                      # writes scripts/helpscout-inventory.json
# Edit CATEGORY_MAPPING in scripts/migrate-helpscout.js, commit
npm run helpscout:migrate                                        # upsert; aborts on unmapped collections
# Add --allow-relocate to move articles whose dir changed
# Add --prune to delete on-disk articles no longer in Help Scout
npm run lint:docs:fix && npm run typecheck && npm run build
node server.js & npm run index-internal                          # re-embed into ChromaDB
```

## Key environment variables

`OPENAI_API_KEY` (required), `INTERNAL_API_KEY` (guards `/api/vector/embed`),
`CHROMA_HOST`/`CHROMA_PORT`/`CHROMA_SSL`/`COLLECTION_NAME`, `EMBEDDING_MODEL`,
`PORT`. Auth (required in production): `HELP_JWT_SECRET`, `HELP_SITE_URL`,
`LAMBDA_MAGIC_LINK_URL`. Chat logging: `CHAT_LOG_DB_PATH`, `CHAT_LOG_RETENTION_DAYS`,
`CHAT_LOGGING_ENABLED`. Copy `.env.example` → `.env` to start. Deployment is Railway
(see `RAILWAY_DEPLOYMENT.md`); `Dockerfile.docusaurus` is the production image.
