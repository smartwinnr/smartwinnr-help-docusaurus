# 02. Setup and run

**Version:** 1.0 | **Last Updated:** June 2026

**Audience:** Engineers running the site locally for the first time, or revisiting after a long break.

---

## Table of contents

1. [Prerequisites](#prerequisites)
2. [Clone and install](#clone-and-install)
3. [Configure `.env`](#configure-env)
4. [Run modes](#run-modes)
5. [Sign in as a role](#sign-in-as-a-role)
6. [The daily script cheatsheet](#the-daily-script-cheatsheet)
7. [Pre-commit hook](#pre-commit-hook)
8. [Common setup issues](#common-setup-issues)

---

## Prerequisites

| Tool | Version | Why |
|---|---|---|
| Node.js | 22.x (matches `Dockerfile.docusaurus`) | Runtime |
| npm | bundled with Node | Dependency install |
| Python 3 + make + g++ | any recent | `better-sqlite3` builds native bindings |
| ChromaDB | any recent | Vector DB. Either run locally (port 8000) or point at a remote instance via `.env`. |
| OpenAI API key | — | Embeddings + chat completions |
| Git | any recent | The authoring wizard's auto-deploy uses the GitHub Git Data API; you don't need that locally. |

### Install ChromaDB locally (one-time)

```bash
pip install chromadb
# then, in a separate terminal whenever you need vector search:
chroma run --host localhost --port 8000 --path ./chroma_data
```

The `--path` flag makes Chroma persist to a local directory so your
embeddings survive `Ctrl-C`. The first index run creates the
`smartwinnr_docs` collection automatically.

> **Trap.** If you skip Chroma, the chatbot will boot but every chat
> request 500s on a missing collection. The static doc site still works.

---

## Clone and install

```bash
git clone git@github.com:smartwinnr/smartwinnr-help-docusaurus.git
cd smartwinnr-help-docusaurus
npm install --legacy-peer-deps
```

`--legacy-peer-deps` is **required** — Docusaurus + a couple of theme
packages have peer-dep conflicts that resolve cleanly with the legacy
resolver but fail under npm 7+ strict mode. The CI install uses the same
flag.

After `npm install`, `husky` installs a pre-commit hook
(`prepare` script). See [§ Pre-commit hook](#pre-commit-hook).

---

## Configure `.env`

Copy the example:

```bash
cp .env.example .env
```

The minimum to do anything useful locally:

```bash
# .env
NODE_ENV=development
OPENAI_API_KEY=sk-proj-...

# Chroma (defaults are localhost:8000 if you've run `chroma run` above)
CHROMA_HOST=localhost
CHROMA_PORT=8000
CHROMA_SSL=false
COLLECTION_NAME=smartwinnr_docs
EMBEDDING_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4o-mini

# Internal API key (guards /api/vector/embed)
INTERNAL_API_KEY=anything-you-want-for-dev

# Auth (only needed if you want to hit a real Mailgun Lambda — for dev,
# use /auth/dev-login URLs instead, see "Sign in as a role" below).
HELP_JWT_SECRET=dev-secret-change-in-prod
HELP_SITE_URL=http://localhost:3001
# LAMBDA_MAGIC_LINK_URL=...  # leave unset for dev
```

> **Why this works.** When `NODE_ENV !== 'production'`, the `/auth/dev-login`
> route is registered (`auth/routes.js`). It mints a JWT for any role you
> ask for with one redirect — no Mailgun round-trip needed. So
> `LAMBDA_MAGIC_LINK_URL` can be unset in dev.

The full env-var reference lives in [09-reference.md](./09-reference.md).

---

## Run modes

There are **two** local run modes. Which one you need depends on what
you're working on.

### Mode A — Docusaurus dev server (`npm run dev`)

```bash
npm run dev
# Serves on http://localhost:3001
```

- **What works:** the static docs, hot reload, theme/swizzle changes,
  React component changes in `src/`.
- **What does NOT work:** any `/api/*` route. There is no Express server
  in this mode. The ChatBot widget will fail to send messages. The
  authoring wizard at `/admin/authoring` will load the UI but every save
  will 404.

Use this when you're iterating on a doc, a sidebar gating change, or a
theme component. It's much faster than Mode B because there's no
production build step.

### Mode B — Unified server (`npm start`)

```bash
npm start                                    # build + node server.js
# OR, if the build is already current:
node server.js
# Serves on http://localhost:3001 (or PORT)
```

- **What works:** everything. Docs, all `/api/*` routes, chat, the
  authoring wizard, dev-login URLs, the URL guard.
- **What does NOT work:** hot reload. Every change to docs or
  React/swizzle code requires `npm run build && node server.js` again.

Use this when you're testing anything that touches the API surface, the
chatbot, the wizard, auth/gating end-to-end, or the URL guard. Most
backend work happens in this mode.

> **Trap.** `npm run dev:full` exists in `package.json` and looks like the
> "do both" option. It is **dead** — points at the non-existent
> `services/chatbot/` directory. Don't use it.

### When to use which

| You're working on | Run mode |
|---|---|
| Adding/editing an article | Mode A (you'll see your changes instantly) |
| Changing a swizzled theme component, the sidebar, or React UI in `src/` | Mode A |
| Anything in `server.js` or `auth/` | Mode B |
| Chatbot prompts, retrieval, ranking | Mode B (and Chroma running) |
| The authoring wizard (`src/pages/admin/authoring/*`) | Mode B |
| Adding a new `/api/*` route | Mode B |
| Working on the URL guard | Mode B (URL guard loads `build/doc-gates.json` which only exists after `npm run build`) |

---

## Sign in as a role

In dev, you have three layered shortcuts. **All three are disabled in
production**, so you can leave them in your test workflows without risk.

### Shortcut 1 — `/auth/dev-login` (the fastest)

Bookmark these URLs and role-switching becomes one click:

```
http://localhost:3001/auth/dev-login?role=user
http://localhost:3001/auth/dev-login?role=manager
http://localhost:3001/auth/dev-login?role=editor
http://localhost:3001/auth/dev-login?role=admin
http://localhost:3001/auth/dev-login?role=orgadmin
http://localhost:3001/auth/dev-login?role=superadmin
```

Each mints a fully-formed JWT, sets the `swhelp_session` cookie, and
redirects to `/`. Optional query params (all default sensibly):

| Param | Default | Use |
|---|---|---|
| `role` | `user` | Comma-list for multi-role users: `role=editor,manager` |
| `privileges` | none | Pass `*` for all org privileges (a "fully licensed" view) or a comma-list (`privileges=quiz,smartpaths`) |
| `email` | `dev@example.com` | The greeting uses the first word |
| `displayName` | derived from email | `Hi <displayName>` in the hero |
| `orgName` | `Dev Org` | Carried through to `/api/me` |
| `orgId` | `dev-org` | |
| `region` | `local` | |
| `redirect` | `/` | Path-only; rejected if it doesn't start with `/` |

The `/auth/login` page auto-renders a yellow strip with all six role
shortcuts when `NODE_ENV !== 'production'`.

### Shortcut 2 — Headless CLI (`scripts/dev-mint-cookie.js`)

For Puppeteer/Playwright/curl tests where launching a browser to
`/auth/dev-login` isn't practical:

```bash
node scripts/dev-mint-cookie.js --role editor --privileges quiz,smartpaths
```

Prints two lines to stdout:
1. The raw JWT (for `Authorization: Bearer …` style tools)
2. A `Set-Cookie: swhelp_session=…` line for `curl -b`

Reads `HELP_JWT_SECRET` from `.env` — same secret the running server uses
— so the cookies it mints are accepted by `/api/me`, `auth/middleware.js`,
and the URL guard.

### Shortcut 3 — `?as=<role>` preview

Append `?as=user`, `?as=manager`, etc. to any URL to **preview** the
page as that tier without changing the cookie:

```
http://localhost:3001/?as=user
http://localhost:3001/modules/quiz/?as=manager
```

In dev, any signed-in user can use `?as=`. In production, only a real
`superadmin` may. Privileges are preserved, so module licensing stays
consistent. Drop the query string to restore the real session.

### Common dev-login presets

| Goal | URL |
|---|---|
| Learner with no licensed modules (sees upsell everywhere) | `/auth/dev-login?role=user` |
| Learner with Quiz licensed only | `/auth/dev-login?role=user&privileges=quiz` |
| Fully-licensed learner | `/auth/dev-login?role=user&privileges=*` |
| Manager who can see "For Managers" sub-sections | `/auth/dev-login?role=manager&privileges=managerView,quiz` |
| Editor with full authoring tree | `/auth/dev-login?role=editor&privileges=*` |
| Superadmin testing the admin wizard | `/auth/dev-login?role=superadmin&privileges=*` |

> **Trap.** The "For Managers" sub-folder requires `managerView` privilege
> AND the manager role. Logging in as `?role=manager` with no privileges
> hides it. This mirrors the LMS-side licensing.

---

## The daily script cheatsheet

The scripts you'll run most often:

| Command | What it does |
|---|---|
| `npm run dev` | Mode A. Docs only, hot reload. |
| `npm start` | Mode B. Build + unified server. |
| `node server.js` | Mode B but skip the build (you've already built). |
| `npm run build` | Compile docs to `build/`. Emits `build/doc-gates.json` for the URL guard. |
| `npm run typecheck` | `tsc --noEmit` for the React app. |
| `npm run lint:docs` | markdownlint with custom rules. |
| `npm run lint:docs:fix` | Auto-fix what's auto-fixable. |
| `npm run index-internal` | Re-embed `docs/` into Chroma. Requires `server.js` running so it can call `/api/vector/embed`. |
| `FORCE_FULL_REINDEX=true npm run index-internal` | Delete the collection + re-embed everything. |
| `npm run audit:articles` | Article-grade audit (uses `db/article-audit.js`). |
| `npm run articles:autofix` | Deterministic style-guide fixes. |
| `npm run articles:rewrite` | LLM-driven rewrite pass (uses `prompts/rewrite-article.md`). |
| `npm run helpscout:inventory` | Read upstream Help Scout structure. |
| `npm run helpscout:migrate` | Upsert from Help Scout into `docs/`. |
| `npm run db:heal` | Recover the chat-logger SQLite if it's corrupted. |
| `npm run audit:gates` | Sanity-check the access-gate tree (catches unreachable gates). |
| `npm run validate:privileges` | Verify every `privilege:` in frontmatter exists in the canonical privileges list. |

> **Why `prebuild` runs validators.** `npm run build` is preceded by
> `validate:privileges + audit:gates` (see the `prebuild` script). A
> misnamed privilege fails the build *before* anything ships. This is
> cheap insurance.

Full list in [09-reference.md](./09-reference.md#npm-scripts-cheatsheet).

---

## Pre-commit hook

`npm install` registers a husky hook (`prepare` script). The hook runs
on every commit and does two things:

1. **`lint:docs:fix`** — auto-fixes what it can. If the auto-fix fails
   (e.g. on a broken markdown file), the hook moves on. This is a
   "best effort" pass.
2. **No-decorative-emojis gate.** A custom rule blocks the commit if
   any file in the diff uses emojis as decorative icons. Lucide stroke
   icons (in React) are the project's convention — see
   [06-tasks-frontend.md](./06-tasks-frontend.md#icons-no-emojis).

> **Note.** The lint hook may print a Node-version error on your machine
> (the bundled `markdownlint-cli2` parses optional-chaining which old
> Node rejects). The hook is built to continue past lint errors and only
> the **emoji check** is a hard gate. If the emoji check passes, your
> commit lands. CI re-runs the full lint on its side.

---

## Common setup issues

### `npm install` fails on `better-sqlite3`

Missing Python or build tools.

```bash
# macOS:
xcode-select --install
# Ubuntu:
sudo apt-get install -y python3 make g++
# then retry:
npm install --legacy-peer-deps
```

### Chroma reachable but `/api/chat` returns "collection not found"

You haven't indexed yet. Start `server.js` (so `/api/vector/embed` is
live), then in another terminal:

```bash
npm run index-internal
```

This is a one-time setup. Subsequent runs are incremental — only
new/changed articles get re-embedded.

### `/auth/login` redirects in a loop

Almost always `HELP_JWT_SECRET` is unset or differs from what the
cookie was minted with. Clear the `swhelp_session` cookie in DevTools,
verify `HELP_JWT_SECRET` is in `.env`, restart `server.js`, and try
the dev-login URL again.

### `/api/me` returns 401 but I have a cookie

The cookie was minted with a different `HELP_JWT_SECRET` (e.g. you
rotated it, or you're using a cookie from another env). Mint a fresh
one via `/auth/dev-login?role=…`.

### `npm run build` complains about a missing privilege

You added a `privilege: <key>` to a frontmatter or `_category_.json` but
the key isn't in `data/known-privileges.json`. The `prebuild` validator
caught it. Add the key to that JSON (which mirrors the LMS-side
privileges enum) and re-run.

### The husky hook keeps complaining about `markdownlint-cli2`

Pre-commit-hook noise; the emoji gate is what actually blocks commits.
If you want quieter commits, upgrade your local Node to 18+ so the lint
script runs cleanly.

---

Next: [03-architecture.md](./03-architecture.md) →
