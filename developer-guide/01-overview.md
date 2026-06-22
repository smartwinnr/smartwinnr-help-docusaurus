# 01. Overview

**Version:** 1.0 | **Last Updated:** June 2026

**Audience:** Engineers new to the SmartWinnr Help Center codebase.

---

## Table of contents

1. [What this is](#what-this-is)
2. [The 30-second mental model](#the-30-second-mental-model)
3. [Four surfaces, one process](#four-surfaces-one-process)
4. [How requests flow](#how-requests-flow)
5. [Where everything lives](#where-everything-lives)
6. [What you need on day one](#what-you-need-on-day-one)

---

## What this is

The SmartWinnr Help Center is the **customer-facing documentation site** for
SmartWinnr. It serves articles for end users, gates content by their role
and the modules their org has licensed, lets a chatbot ("Wynnie") answer
questions over those articles, and lets internal authors write or update
articles through a built-in admin wizard.

It is one Docusaurus site, served by one Node process (`server.js`), backed
by one ChromaDB instance and a few small SQLite files. The codebase is a
single repository.

> **Why this matters.** Other Docusaurus deployments split docs and API into
> separate services. This one **does not**. Treating it as two services
> will mislead you on every architectural question — auth, deploy, ports,
> Dockerfile. The chatbot, the admin wizard, the analytics, and the static
> doc-serving all run in the same Express app.

---

## The 30-second mental model

```
Customer → /docs page    →  Gated by role + org privileges    →  Read the article
Customer → /api/chat     →  RAG over the same docs corpus      →  Wynnie answers + cites
Author    → /admin/...   →  LLM-assisted wizard / dashboards   →  New article → commit → deploy
```

Everything is the same Node process. Everything reads from the same
canonical source (markdown in `docs/`). Authentication is universal —
the magic-link cookie is required everywhere except `/api/health` and the
`/auth/*` routes.

---

## Four surfaces, one process

The codebase exposes four surfaces. They look like four different products
when you use the site; in the code they are four feature areas of the
same Express app.

### 1. The documentation site

- **Files**: `docs/**/*.md`, sidebar logic in `sidebars.ts`, theme swizzles
  under `src/theme/`.
- **Served by**: `express.static('build/')` in `server.js`, after the
  Docusaurus build runs.
- **Gating**: Two layers. The sidebar shows or hides categories based on
  `customProps` in `_category_.json`. The URL guard (`server.js` middleware
  loading `build/doc-gates.json`) returns `403` for any role-disallowed
  path so hand-typed URLs can't bypass the sidebar.

### 2. Wynnie — the RAG chatbot

- **Files**: `src/components/ChatBot/ChatBot.tsx` (widget),
  `plugins/chatbot-plugin.js` (injection), `prompts/wynnie.md` (system
  prompt), `server.js` `/api/chat` route, `db/chat-logger.js` (persistence).
- **Backed by**: ChromaDB collection `smartwinnr_docs` (vector store) +
  OpenAI chat-completion model.
- **Flow**: question → embed → retrieve → rerank by URL-guard
  (`isUrlAllowedForUser`) → build context → LLM completion → return answer
  with citations.

### 3. The authoring wizard

- **Files**: `src/pages/admin/authoring/*.tsx` (3-step React UI),
  `server.js` `/api/admin/authoring/*` endpoints, `prompts/author-article.md`
  (system prompt), `data/modules.json` (the wizard's "where do you want to
  put this?" picklist).
- **Flow**: Step 1 *where + who* → Step 2 *brain dump + images* → Step 3
  *preview, edit, save, optionally publish*. Publish writes a markdown
  file and (if `AUTHORING_GIT_PUSH=true`) pushes a commit via the GitHub
  Git Data API. Railway watches the branch and auto-redeploys.

### 4. The analytics dashboards

- **Files**: `src/pages/admin/analytics/{chat,feedback}.tsx`,
  `src/pages/admin/digests.tsx`, `server.js`
  `/api/admin/{chat-logs,feedback,digests}/*` endpoints,
  `db/chat-logger.js`, `db/feedback-logger.js`, `db/digest-*.js`.
- **Backed by**: Three SQLite databases (chat-logs, feedback, digests). All
  use `better-sqlite3` and have a circuit breaker so a corrupt DB never
  takes down the rest of the app.

Each of these is documented in its own developer-guide page:

- Content → [04-tasks-content.md](./04-tasks-content.md)
- Backend (auth, APIs, DB) → [05-tasks-backend.md](./05-tasks-backend.md)
- Frontend (theme, ChatBot, admin) → [06-tasks-frontend.md](./06-tasks-frontend.md)

---

## How requests flow

A single in-the-wild request looks like this:

```
Browser
   │  GET /modules/quiz/create-and-manage/how-to-create-a-quiz
   ▼
server.js                                        (Express)
   │  Layer 0  /api/health passes here ── public, returns early
   │  Layer 1  initAuth(app):
   │           - /auth/login, /auth/callback, /auth/dev-login routes
   │           - middleware reads swhelp_session cookie → req.user
   │             (verified by HELP_JWT_SECRET; no cookie → redirect to /auth/login)
   │  Layer 2  URL guard:
   │           - load build/doc-gates.json once at boot
   │           - lookupGates(reqPath) → every prefix gate + exact-frontmatter gate
   │           - AND-of-all-gates against req.user → 403 if any deny
   │  Layer 3  express.static('build/') serves the article HTML
   ▼
The customer's browser receives HTML
Docusaurus's React app hydrates
UserContext fetches /api/me once → role-aware sidebar renders
Wynnie widget mounts → ready for chat
```

Every `/api/*` request goes through the same Layer 1 + Layer 2, except
that Layer 2 only applies to docs paths (the guard short-circuits when
`req.path.startsWith('/api/') || req.path.startsWith('/auth/')`).

[03-architecture.md](./03-architecture.md) covers this in depth.

---

## Where everything lives

```
smartwinnr-help-docusaurus/
├── docs/                       # The actual help articles. Markdown.
│                                 Sidebar is auto-generated from this tree.
├── server.js                   # The single Node entry. Express. Serves
│                                 the built site AND every /api/* route.
├── auth/                       # Magic-link sign-in, JWT, middleware,
│                                 dev-login route, /auth/login page.
├── db/                         # SQLite layer: chat logs, feedback,
│                                 digests, article-grade audit.
├── plugins/                    # Docusaurus plugins:
│   ├── chatbot-plugin.js       #   - injects the Wynnie widget
│   └── access-gate-emit.js     #   - emits build/doc-gates.json
├── prompts/                    # LLM system prompts (one per task):
│   ├── wynnie.md
│   ├── author-article.md
│   └── rewrite-article.md
├── scripts/                    # CLI tools:
│   ├── internal-indexer.js     #   - re-embed docs into ChromaDB
│   ├── audit-articles.js       #   - quality grade pass
│   ├── article-autofix.js      #   - deterministic style fixes
│   ├── rewrite-articles.js     #   - LLM-driven rewrite pass
│   ├── migrate-helpscout.js    #   - Help Scout re-sync
│   └── freshdesk/              #   - support-ticket → new articles
├── src/                        # The Docusaurus React app:
│   ├── components/             #   - ChatBot, Article footer, etc.
│   ├── theme/                  #   - Swizzled Docusaurus components
│   ├── pages/admin/            #   - Authoring wizard + analytics dashboards
│   ├── access-policy.ts        #   - isAllowed() — the gate resolver
│   ├── contexts/UserContext.tsx#   - /api/me hydration
│   └── lib/                    #   - shared TS utilities
├── static/                     # Files served at /img/... (mostly images)
├── shared/                     # Code shared between Docusaurus build
│                                 (TS/MJS) and server.js (CJS).
│                                 Currently: access-policy.cjs.
├── templates/                  # Canonical-frontmatter article templates
├── data/                       # JSON registries (modules.json, known-
│                                 privileges.json) + runtime SQLite at
│                                 /app/data in production.
├── Dockerfile.docusaurus       # Production image (Node 22 + built site
│                                 + server.js). Used by Railway.
├── railway.json / railway.toml # Railway service config.
├── docusaurus.config.ts        # Docusaurus site config (plugin list).
├── sidebars.ts                 # Top-level sidebar tree.
├── tsconfig.json               # TS for the Docusaurus client app.
├── package.json                # Node deps + npm scripts.
└── *.md (root docs)            # README, CLAUDE, ARCHITECTURE, RAILWAY_*,
                                  AUTH_MENU_PLAN, this developer guide.
```

> **Trap.** `package.json` has a `services/chatbot/` directory referenced
> in several scripts (`chatbot:start`, `chatbot:dev`, `start:production`,
> `index-docs`). That directory **does not exist** in the repo. Those
> scripts are dead leftovers from the pre-unification era. The real
> entry is `node server.js`.

---

## What you need on day one

Three things must be true before you can do anything useful:

1. **You can build and run the site.** Covered in
   [02-setup-and-run.md](./02-setup-and-run.md).
2. **You can sign in as a role you want to test.** Covered in
   [02-setup-and-run.md](./02-setup-and-run.md#sign-in-as-a-role).
3. **You know which file to open for the change you're making.**
   Covered in this overview's *Where everything lives* section above,
   plus the tasks pages.

Next: [02-setup-and-run.md](./02-setup-and-run.md) →
