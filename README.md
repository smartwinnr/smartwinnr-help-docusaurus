# SmartWinnr Help Center

Customer-facing help center for SmartWinnr. A Docusaurus documentation site
served by an integrated Express backend (`server.js`) that also hosts a
RAG-powered chatbot (**Wynnie**), magic-link authentication, role-based access
control, an LLM-assisted authoring wizard, and analytics dashboards.

The whole stack — static docs + every API route — runs as a single Node
process. There is no separate chatbot service in production.

## What's in the box

| Surface | What it does |
|---|---|
| **Docs site** (`docs/`, 26 categories, 900+ articles) | Markdown articles, sidebar gated by viewer role + org privileges. Auto-generated category routes; per-module landing pages render via a swizzled `ModuleOverview`. |
| **Auth** (`auth/`) | Magic-link sign-in through a Mailgun Lambda. JWT cookie carries email, roles, region, orgId, privileges. Three dev shortcuts (`/auth/dev-login`, `?as=<role>` preview, headless cookie minter) are stripped at production build. |
| **URL guard** (`plugins/access-gate-emit.js` + `server.js`) | Walks `_category_.json` + frontmatter at build, emits `build/doc-gates.json`, then middleware enforces AND-of-all-matching-gates so a hand-typed URL can't bypass the swizzled sidebar. Same logic filters vector search + chatbot citations. |
| **Wynnie chatbot** (`/api/chat`, widget in `src/components/ChatBot/`) | RAG over `smartwinnr_docs` ChromaDB collection. OpenAI `text-embedding-3-small` + a chat completion. Every exchange persists to SQLite with retention and circuit breaker. |
| **Authoring wizard** (`/admin/authoring`, superadmin only) | LLM-assisted 3-step flow: where + who → brain dump + image upload → preview/refine. Produces canonical-frontmatter markdown, supports drafts, image upload, and an auto-deploy pipeline that pushes to GitHub. |
| **Analytics** (`/admin/analytics/{chat,feedback}`, `/admin/digests`) | Per-article feedback ("Was this helpful?"), chat-log stats with citation CTR and low-confidence triage, scheduled email digests. |
| **Content pipelines** | `scripts/freshdesk/` ingests support-ticket CSVs and generates new articles; `scripts/migrate-helpscout.js` is the canonical Help Scout re-sync tool. |

## Ports + scripts

`server.js` is the single entry. In production it serves the built site
**and** every `/api/*` route on one port. In dev there's no such unified mode —
either run Docusaurus dev (no APIs) or build + serve (full stack).

| Service | Local port | URL | Notes |
|---|---|---|---|
| Docusaurus dev (hot-reload, **no chatbot API**) | `3001` | `http://localhost:3001` | `npm run dev` |
| Unified server (build + every API on one port) | `3001` | `http://localhost:3001` | `npm start` (= `npm run build && node server.js`) |
| ChromaDB (local only) | `8000` | `http://localhost:8000` | Optional, only if running locally instead of pointing at the prod Chroma. |
| Health check | — | `http://localhost:3001/api/health` | Public, before auth middleware. |

> **Trap:** `package.json` still has stale scripts (`chatbot:start`,
> `chatbot:dev`, `start:docs`, `index-docs`, `start:production`) pointing
> at a `services/chatbot/` directory that doesn't exist. Don't use them.
> The current entry is `server.js`.

## Quick start

```bash
git clone <repo> && cd smartwinnr-help-docusaurus
npm install --legacy-peer-deps          # better-sqlite3 needs native build deps
cp .env.example .env                    # add your OPENAI_API_KEY, auth secrets, etc.

npm run dev                             # docs only on 3001, no chatbot API
# OR
npm start                               # build + unified server on 3001 (full stack)
```

To exercise the chatbot or any `/api/*` route locally you **need** the unified
server, not the dev server.

## Indexing docs into ChromaDB

```bash
node server.js &                        # the indexer calls /api/vector/embed
npm run index-internal                  # incremental, SHA-256-keyed
FORCE_FULL_REINDEX=true npm run index-internal   # nuke + re-embed everything
```

## Production deployment (Railway)

Two services + a few cron jobs:

| Railway service | Image | Role |
|---|---|---|
| `docusaurus` | `Dockerfile.docusaurus` (Node 22 + built site + `server.js`) | Public web + every API route, single port. Builds the site at image-build time so the runtime container is small. |
| `chroma` | Railway's official ChromaDB template | Vector DB. IPv6-bound (`CHROMA_HOST_ADDR=::`) so the docusaurus service can reach it over Railway's private network. |
| Cron jobs (one per digest type) | `curlimages/curl` | Hit `/api/admin/digests/send?type=...` weekly, guarded by `CRON_SECRET`. See `railway.toml` for the schedule. |

`docusaurus` runs `npm run start:railway` which is just `node server.js`. The
build happens in the Dockerfile, not at deploy time. Auto-redeploys are
triggered by the authoring wizard pushing commits via the GitHub Git Data API
(see `AUTHORING_GIT_PUSH` / `GIT_PUSH_TOKEN` in `.env.example`).

See:
- `RAILWAY_DEPLOYMENT.md` — service setup details + ChromaDB-template quirks.
- `RAILWAY_ENVIRONMENT_VARIABLES.md` — full env-var reference per service.
- `RAILWAY_SSH_ACCESS.md` — how to shell into a running container for SQLite inspection.

## Key environment variables

Copy `.env.example` → `.env`. Minimum to run anything useful locally:

| Var | What it does | Required when |
|---|---|---|
| `OPENAI_API_KEY` | Embeddings + chat completions | Always |
| `INTERNAL_API_KEY` | Guards `POST /api/vector/embed` (indexer-only) | Always |
| `CHROMA_HOST` / `CHROMA_PORT` / `CHROMA_SSL` | Where Chroma lives | Always (default `localhost:8000`) |
| `COLLECTION_NAME` | Override the default collection (`smartwinnr_docs`) | If splitting corpora |
| `EMBEDDING_MODEL` | Override `text-embedding-3-small` | Rarely |
| `PORT` | Server listen port | Railway sets this; local default is `3001` |
| `HELP_JWT_SECRET` | Signs the `swhelp_session` cookie | Production |
| `HELP_SITE_URL` | Used by the magic-link redirect | Production |
| `LAMBDA_MAGIC_LINK_URL` | Where the login form POSTs | Production |
| `CHAT_LOG_DB_PATH` | SQLite path for chat logs (default `./data/chat-logs.db`) | If non-default |
| `CHAT_LOG_RETENTION_DAYS` | TTL for chat-log rows | If non-default |
| `CHAT_LOGGING_ENABLED` | Master switch | Defaults `true` |
| `CRON_SECRET` | Auth header for the digest cron services | If wiring up digests |
| `AUTHORING_GIT_PUSH` + `GIT_PUSH_TOKEN` + `GITHUB_REPO` + `GIT_PUBLISH_BRANCH` | Authoring-wizard auto-deploy pipeline | If using the publish-to-deploy flow |

## Project structure (top-level)

```
auth/                  magic-link routes, JWT signer, middleware, login page
db/                    SQLite layer: chat logs, feedback, digests, article-grade audit
docs/                  the markdown source (gated by frontmatter + _category_.json)
plugins/               Docusaurus plugins (chatbot widget injection, access-gate emit)
prompts/               LLM system prompts (Wynnie, author-article, rewrite-article)
scripts/               indexer, audit, autofix, Help Scout migration, Freshdesk pipeline
shared/                code shared between the Docusaurus runtime and server.js (CJS)
src/                   Docusaurus React app (swizzled sidebar, ChatBot, admin pages)
static/                images served at /img/
templates/             authoring templates (canonical frontmatter examples)
server.js              the unified Express entry
docusaurus.config.ts   site + plugin config
sidebars.ts            top-level sidebar tree (auto-generated subtrees from docs/)
Dockerfile.docusaurus  production image
railway.json / .toml   Railway service config
ARCHITECTURE.md        end-to-end system architecture (RAG, indexing, auth, pipelines)
AUTH_MENU_PLAN.md      role-based menu layout + canonical article format (§C1)
CLAUDE.md              context for Claude Code sessions
SmartWinnr-Help-Style-Guide.md   loaded by the rewrite/audit scripts as the prose style source
INTERNAL_KB_PLAN.md    plan for a separate internal-only KB (handed to another session)
```

## Validation

There's no automated test suite. The CI gates are:

- `npm run lint:docs` — markdownlint with custom rules (`custom-markdownlint-rules.js`), including the no-decorative-emojis rule. A husky pre-commit hook auto-fixes + blocks the commit if it can't.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run build` — Docusaurus build (also runs `prebuild` = `validate-privilege-keys` + `audit-gates`).

Manual verification — sign in via `/auth/dev-login?role=<role>&privileges=*`, exercise the sidebar + chatbot + authoring wizard for each role tier.

## Where to look next

- **First time on the codebase:** read `CLAUDE.md` end-to-end (it's the densest survey).
- **System design:** `ARCHITECTURE.md`.
- **Adding articles:** `SmartWinnr-Help-Style-Guide.md` + the authoring wizard at `/admin/authoring`. The wizard handles canonical frontmatter for you.
- **Role-based access:** `AUTH_MENU_PLAN.md` § Phase C / §13.8 for category gating; `src/access-policy.ts` for the actual `isAllowed` function.
- **Help Scout re-sync:** the runbook is in `CLAUDE.md` (search for "Re-sync runbook").
