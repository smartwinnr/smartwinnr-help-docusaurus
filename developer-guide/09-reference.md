# 09. Reference

**Version:** 1.0 | **Last Updated:** June 2026

**Audience:** Anyone looking up a value, path, or name. Optimized for quick lookup, not for reading top-to-bottom.

---

## Table of contents

1. [Roles and tiers](#roles-and-tiers)
2. [Privileges](#privileges)
3. [Environment variables](#environment-variables)
4. [npm scripts cheatsheet](#npm-scripts-cheatsheet)
5. [API endpoint inventory](#api-endpoint-inventory)
6. [File-path map](#file-path-map)
7. [Glossary](#glossary)

---

## Roles and tiers

Defined in `src/access-policy.ts` and `shared/access-policy.cjs`.

| Role | Tier | Bypass privileges? | Typical use |
|---|---|---|---|
| `user` | 1 | no | End learner |
| `manager` | 2 | no | Team manager, sees team analytics |
| `editor` | 3 | no | Content author |
| `admin` | 4 | no | Org admin |
| `lamadmin` | 5 | no | Learning admin manager |
| `orgadmin` | 5 | no | Org-level admin |
| `superadmin` | 6 | **yes** | SmartWinnr internal — bypasses all privilege gates |

Bypass logic is in `PRIVILEGE_BYPASS_ROLES` in `src/access-policy.ts`.
A `superadmin` always passes every privilege check, regardless of
`org.privileges` content.

---

## Privileges

The list of org-level privilege keys lives in
`data/known-privileges.json`. The canonical source is the main SmartWinnr
app's organizations model:

```
node_projects/smartwinnr_prd/modules/organizations/server/models/organizations.server.model.js
```

Common keys (truncated; check the JSON for the full list):

| Key | What it unlocks |
|---|---|
| `quiz` | Quiz module |
| `smartpaths` | SmartPath module |
| `content` | SmartFeed (microlearning) |
| `coaching` | Video Coaching module |
| `fCoaching` | Field Coaching module |
| `aiCoaching` | AI Coaching module |
| `survey` | Survey module |
| `khub` | Knowledge Hub |
| `forms` | Forms module |
| `kpi` | KPI module |
| `competitions` | Competitions / leaderboards |
| `achievements` | Achievements |
| `customNotifications`, `notifications`, `chat` | Notifications areas |
| `customReports`, `learnerReport`, `adminReports`, `generatedReports` | Reports |
| `projectManagement` | Project management module |
| `managerView` | "For Managers" sub-sections in each module |

> **Trap.** Privilege keys are case-sensitive. Mirror the exact spelling
> from the main app. `npm run validate:privileges` catches typos.

---

## Environment variables

Alphabetized. See `.env.example` for the source of truth. Required-prod
columns indicate vars without which prod won't boot or function.

| Variable | Default | Required (prod) | Purpose |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | — | no | Freshdesk `cluster-queries.js` fallback model |
| `AUTHORING_DEPLOY_DEBOUNCE_MS` | `1800000` | no | Burst-publish window before deploy fires |
| `AUTHORING_DEPLOY_MIN_INTERVAL_MS` | `3600000` | no | Min interval between wizard deploys |
| `AUTHORING_GIT_PUSH` | `false` | no | Master switch for wizard auto-deploy |
| `AUTHORING_MODEL` | `gpt-4o` | no | LLM for wizard `/generate` |
| `AUTHORING_RATE_LIMIT` | `10` | no | LLM generates per superadmin per 60-min window |
| `CHAT_LOG_DB_PATH` | `./data/chat-logs.db` | no | SQLite path for chat-logger |
| `CHAT_LOG_RETENTION_DAYS` | unbounded | no | Row TTL for chat-log retention job |
| `CHAT_LOGGING_ENABLED` | `true` | no | Master switch for chat-log persistence |
| `CHAT_MODEL` | OpenAI model id | no | Chatbot generation model |
| `CHROMA_HOST` | `localhost` | yes | ChromaDB host |
| `CHROMA_PORT` | `8000` | yes | ChromaDB port |
| `CHROMA_SSL` | `false` | no | Use HTTPS for Chroma |
| `COLLECTION_NAME` | `smartwinnr_docs` | no | Chroma collection override |
| `CRON_SECRET` | — | yes (if cron) | Auth header for `/api/admin/digests/send` |
| `EMBEDDING_MODEL` | `text-embedding-3-small` | no | Override embedding model |
| `FORCE_FULL_REINDEX` | `false` | no | Indexer: delete + re-embed everything |
| `GIT_PUSH_TOKEN` | — | yes (if `AUTHORING_GIT_PUSH=true`) | Fine-grained GitHub PAT, Contents: R/W on this repo |
| `GITHUB_API` | `https://api.github.com` | no | Override for GHES |
| `GITHUB_REPO` | — | yes (if `AUTHORING_GIT_PUSH=true`) | `owner/repo` for wizard auto-deploy |
| `GIT_PUBLISH_BRANCH` | `main` | no | Branch Railway watches |
| `HELP_JWT_SECRET` | — | **yes** | Signs `swhelp_session` cookie |
| `HELP_SITE_URL` | — | **yes** | Used by `/auth/callback` redirect |
| `INTERNAL_API_KEY` | — | **yes** | Guards `/api/vector/embed` |
| `LAMBDA_MAGIC_LINK_URL` | — | **yes** | Where `/auth/login` form POSTs |
| `LOG_LEVEL` | `info` | no | Server log verbosity |
| `NODE_ENV` | `development` | yes (set to `production` in Dockerfile) | Toggles dev-login, `?as=` gate, login-page DEV strip |
| `OPENAI_API_KEY` | — | **yes** | OpenAI auth |
| `PORT` | `3001` locally; set by Railway in prod | yes | Express listen port |

Per-service env-var matrices: see
[../RAILWAY_ENVIRONMENT_VARIABLES.md](../RAILWAY_ENVIRONMENT_VARIABLES.md).

---

## npm scripts cheatsheet

Grouped by purpose. The full list is in `package.json`.

### Run modes

| Script | What it does |
|---|---|
| `npm run dev` | Docusaurus dev server on port 3001. Docs only, no `/api/*`. |
| `npm start` | `npm run build && node server.js`. Unified server on `PORT` (or 3001). |
| `node server.js` | Unified server without re-building. |
| `npm run serve` | Alias for `node server.js`. |
| `npm run start:railway` | Same as `node server.js`. Used by Railway. |

### Build + validate

| Script | What it does |
|---|---|
| `npm run build` | Compile docs. Runs `prebuild` first (privilege + gate validators). Emits `build/doc-gates.json`. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run lint:docs` | markdownlint with custom rules. |
| `npm run lint:docs:fix` | Auto-fix what's auto-fixable. |
| `npm run validate:privileges` | Confirm every frontmatter `privilege:` is in `known-privileges.json`. |
| `npm run audit:gates` | Look for unreachable / contradictory access gates. |

### Content

| Script | What it does |
|---|---|
| `npm run index-internal` | Re-embed `docs/` into Chroma (incremental). |
| `npm run audit:articles` | Article-grade audit using `db/article-audit.js`. |
| `npm run articles:autofix` | Deterministic style fixes. |
| `npm run articles:rewrite` | LLM-driven rewrite pass. |
| `npm run helpscout:inventory` | Read upstream Help Scout structure. |
| `npm run helpscout:migrate` | Upsert from Help Scout into `docs/`. |
| `npm run backup:docs` | Tarball `docs/` to `data/backups/`. |
| `npm run images:audit` | Find orphan images in `static/`. |
| `npm run images:prune` | Delete orphan images (after `images:audit` review). |
| `npm run inventory` | Generate an article inventory JSON. |

### Operations

| Script | What it does |
|---|---|
| `npm run db:heal` | Recover the chat-logger SQLite (VACUUM, rebuild indexes). |

### Dead scripts

These exist in `package.json` but **don't work** — they point at a
non-existent `services/chatbot/` directory:

- `chatbot:start`
- `chatbot:dev`
- `start:production`
- `index-docs`
- `dev:full`, `dev:old`

Don't use them. They're leftovers from the pre-unification era. The
real entry is `node server.js`.

---

## API endpoint inventory

All routes are auth-required except `/api/health` and `/auth/*`.

### Public

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Health check. Returns `{status, timestamp, service, version}`. |
| GET | `/auth/login` | Magic-link sign-in page. |
| GET | `/auth/callback` | Verify JWT from email link, set cookie, redirect. |
| GET | `/auth/logout` | Clear cookie, redirect to `/auth/login`. |
| GET | `/auth/dev-login` | **DEV only.** Mint a JWT for any role. |

### User (auth required)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/me` | Returns the hydrated UserContext payload. |
| POST | `/api/vector/embed` | Indexer-only; `INTERNAL_API_KEY`-guarded. Embed text + upsert. |
| POST | `/api/vector/search` | Semantic search; results filtered by `isUrlAllowedForUser`. |
| POST | `/api/chat` | RAG chat. Returns `{answer, citations, exchangeId}`. |
| GET | `/api/chat/:conversationId` | Conversation history. |
| DELETE | `/api/chat/:conversationId` | Clear a conversation. |
| POST | `/api/chat/:exchangeId/rate` | Submit a thumbs-up/down rating. |
| POST | `/api/chat/:exchangeId/citation-click` | Track citation CTR. |
| POST | `/api/feedback` | Article thumbs + comment. |

### Admin (superadmin only)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/chat-logs` | List chat logs. |
| GET | `/api/admin/chat-logs/low-confidence` | Filtered: low-confidence answers. |
| GET | `/api/admin/chat-logs/stats` | Aggregate stats. |
| GET | `/api/admin/chat-logs/dashboard` | Dashboard data shape. |
| GET | `/api/admin/chat-logs/health` | Circuit-breaker state. |
| GET | `/api/admin/chat-logs/export` | CSV export. |
| DELETE | `/api/admin/chat-logs/:conversationId` | Delete a conversation (anonymization). |
| DELETE | `/api/admin/chat-logs/by-email/:email` | Delete all chat logs for one email (GDPR-ish). |
| GET | `/api/admin/feedback-summary` | Per-article feedback stats. |
| GET | `/api/admin/feedback` | Raw feedback rows. |
| GET | `/api/admin/digests/subscriptions` | List subscribers. |
| POST | `/api/admin/digests/subscriptions` | Add a subscriber. |
| DELETE | `/api/admin/digests/subscriptions/:id` | Remove a subscriber. |
| GET | `/api/admin/digests/log` | When digests were last sent. |
| GET | `/api/admin/digests/last-sent` | Last-sent summary per type. |
| GET | `/api/admin/digests/preview` | Render a digest without sending. |
| POST | `/api/admin/digests/send-now` | Force send via the admin UI. |
| POST | `/api/admin/digests/send` | Cron entry point (requires `x-cron-secret`). |
| POST | `/api/admin/authoring/generate` | Wizard LLM generation. |
| POST | `/api/admin/authoring/suggest-field` | Suggest title/description inline. |
| POST | `/api/admin/authoring/save` | Save (validates frontmatter). |
| POST | `/api/admin/authoring/save-raw` | Save without validation (escape hatch). |
| POST | `/api/admin/authoring/publish` | Remove draft flag + (optionally) auto-deploy. |
| POST | `/api/admin/authoring/deploy` | Manual deploy trigger. |
| POST | `/api/admin/authoring/deploy/enqueue-deletes` | Stage deletes for next deploy. |
| GET | `/api/admin/authoring/deploy/state` | Current deploy queue state. |
| POST | `/api/admin/authoring/upload` | Image upload (base64). |
| GET | `/api/admin/authoring/articles` | List articles. |
| GET | `/api/admin/authoring/article/:slug` | Single article. |
| GET | `/api/admin/authoring/drafts` | List drafts. |
| GET | `/api/admin/authoring/draft/:slug` | Single draft. |
| GET | `/api/admin/authoring/modules` | Read `data/modules.json` registry. |

For exact line numbers, see [05-tasks-backend.md](./05-tasks-backend.md#serverjs-navigation-map).

---

## File-path map

### Top-level entries

| Path | Role |
|---|---|
| `server.js` | The single Node entry. |
| `docusaurus.config.ts` | Site config. Lists plugins. |
| `sidebars.ts` | Top-level sidebar tree. |
| `package.json` | Deps + npm scripts. |
| `Dockerfile.docusaurus` | Production image. |
| `railway.json` / `railway.toml` | Railway service config. |
| `tsconfig.json` | TS for the Docusaurus React app. |
| `.env.example` | Env var template. |
| `custom-markdownlint-rules.js` | Lint rules (no-decorative-emojis). |

### Directories

| Path | Role |
|---|---|
| `docs/` | The actual markdown articles. Sidebar auto-generated from here. |
| `src/` | Docusaurus React app source. |
| `src/components/` | Custom React components. |
| `src/theme/` | Swizzled theme components. |
| `src/pages/admin/` | Authoring wizard + analytics dashboards. |
| `src/access-policy.ts` | `isAllowed()` — the gate resolver. |
| `src/contexts/UserContext.tsx` | `/api/me` hydration. |
| `src/css/custom.css` | Global theme tokens. |
| `auth/` | Magic-link sign-in, JWT, middleware, login page. |
| `db/` | SQLite layer (chat-logs, feedback, digests, article-audit). |
| `plugins/` | Docusaurus plugins (chatbot, access-gate-emit). |
| `prompts/` | LLM system prompts. |
| `scripts/` | CLI tools (indexer, audit, autofix, helpscout, freshdesk). |
| `shared/` | Code shared between Docusaurus (TS) and server.js (CJS). |
| `static/` | Static assets served at `/img/...`. |
| `templates/` | Canonical-frontmatter article templates. |
| `data/` | JSON registries (modules, known-privileges). At runtime: SQLite DBs. |

### Key files

| Path | Why it matters |
|---|---|
| `src/access-policy.ts` + `shared/access-policy.cjs` | Same logic, two dialects. Must stay in sync. |
| `data/known-privileges.json` | Canonical privilege keys. `validate:privileges` reads this. |
| `data/modules.json` | The authoring wizard's "where to put it?" picklist. |
| `plugins/access-gate-emit.js` | Build-time emitter of `build/doc-gates.json`. |
| `prompts/wynnie.md` | Chatbot system prompt. Reloaded per request. |
| `prompts/author-article.md` | Wizard system prompt. |
| `prompts/rewrite-article.md` | `articles:rewrite` system prompt. |
| `SmartWinnr-Help-Style-Guide.md` | Loaded by content-quality scripts. |
| `AUTH_MENU_PLAN.md` §C1 | Canonical frontmatter schema. |

---

## Glossary

| Term | Definition |
|---|---|
| **Wynnie** | The RAG chatbot widget. Codename across the codebase. |
| **The wizard** | The 3-step authoring UI at `/admin/authoring/`. |
| **Magic link** | A signed-URL email sign-in. JWT in the URL. |
| **Cookie / `swhelp_session`** | The session cookie. JWT-signed by `HELP_JWT_SECRET`. HttpOnly + SameSite=Lax. |
| **Gate** | A `customProps` block with `roles`, `privilege`, `anyPrivilege`. Drives the sidebar hide-show and the URL guard. |
| **URL guard** | The server-side middleware that 403s gated paths. Backed by `build/doc-gates.json`. |
| **Privilege** | An org-level licensing key (`quiz`, `smartpaths`, ...). Determines which modules the org has bought. |
| **Role** | A user's tier (`user` → `superadmin`). Determines what UI they see inside enabled modules. |
| **Swizzle** | A Docusaurus mechanism for replacing the default React component for a theme element. Files in `src/theme/`. |
| **AccessGate** | The TypeScript type representing a single gate. See `src/access-policy.ts`. |
| **Canonical frontmatter** | The fixed YAML schema every article uses. See `AUTH_MENU_PLAN.md` §C1. |
| **Re-sync** | Pulling the latest content from Help Scout into `docs/`. |
| **Indexer** | `scripts/internal-indexer.js`. SHA-256-hashed incremental re-embedding into Chroma. |
| **Circuit breaker** | The protection inside `db/*.js` writers. Drops writes when the DB is sick instead of crashing requests. |
| **Help Scout** | The legacy SaaS knowledge base this site replaced. Still the upstream source for re-syncs. |
| **Freshdesk** | The support-ticket system whose CSV exports feed the gap-analysis pipeline. |
| **Path A / Path B** | The two production deploy paths: engineer-driven git push vs wizard auto-deploy. |

---

End of developer guide. If something here is wrong or missing, fix
it — every page is just a `.md` file in this repo. The next person
shouldn't have to rediscover it.

Back to [README](./README.md) →
