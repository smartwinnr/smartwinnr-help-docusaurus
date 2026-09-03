# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Docusaurus documentation site for SmartWinnr help content, plus an integrated Express
backend (`server.js`) that serves the static build AND a chatbot/vector-search API. Docs
are Markdown in `docs/` (26 category dirs, 877+ files); a RAG pipeline indexes them into
ChromaDB and answers questions via OpenAI. See `ARCHITECTURE.md` for the full RAG,
indexing, and Freshdesk-pipeline detail - but note the corrections in "Gotchas" below.

## Commands

```bash
npm run dev            # Docusaurus dev server, hot reload, docs only, port 3001 (NO chatbot API)
npm run dev:full       # Docs (3000) + chatbot API (3002) in parallel - but see gotcha re services/
npm run build          # Compile docs to static build/
node server.js         # Unified Express server: serves build/ + all /api routes on PORT (default 3000)
npm start              # build + node server.js (production-like, single port)

npm run index-internal # Index docs/ into ChromaDB (incremental, hash-based). Requires server.js running.
FORCE_FULL_REINDEX=true npm run index-internal   # Delete collection + re-embed all docs

npm run lint:docs      # markdownlint-cli2 over docs (custom rules in custom-markdownlint-rules.js)
npm run lint:docs:fix  # Auto-fix lint issues
npm run typecheck      # tsc (no emit)

npm run images:audit   # Report wizard uploads under static/img/helpscout/authored/ that no
                       # article references. A local checkout has no drafts, so this is an
                       # ESTIMATE and refuses --apply. For the real list, ask the server:
                       #   node scripts/prune-orphan-images.js --remote \
                       #     --server=https://help.smartwinnr.com --cron-secret=$CRON_SECRET
                       # Add --apply there to queue the deletes. Flags: --json, --min-age-days=N
```

No automated test suite exists. Validation is: `lint:docs`, `typecheck`, and `build`.

## Dev role switching - test different roles without re-logging-in

Real sign-in requires a Mailgun magic-link round-trip through the main app -
too slow for iterating on per-role UI. Three layered shortcuts work in dev
(`NODE_ENV !== 'production'`) and are **disabled in production builds**.

### 1. The fastest: `/auth/dev-login` - one URL per role

While the server is running locally, hit any of:

```
http://localhost:3001/auth/dev-login?role=user
http://localhost:3001/auth/dev-login?role=manager
http://localhost:3001/auth/dev-login?role=editor
http://localhost:3001/auth/dev-login?role=admin
http://localhost:3001/auth/dev-login?role=orgadmin
http://localhost:3001/auth/dev-login?role=superadmin
```

The route mints a JWT with the requested role + every privilege (defaults
to a fully-licensed dev org) and sets the `swhelp_session` cookie, then
redirects to `/`. Bookmark the six URLs and role-switching becomes
single-click.

Optional query params (all default sensibly):

| Param | Default | Use case |
|---|---|---|
| `role` | `user` | Comma-list for multi-role users: `role=editor,manager` |
| `privileges` | **none** | The realistic default - a role on its own gets you only the role's reach, no licensed modules. Pass `*` for all (`privileges=*`), or a comma-list for a subset (`privileges=quiz,smartpaths`). Pass empty (`?privileges=`) for the same effect as omitting. |
| `email` | `dev@example.com` | The greeting uses the first word |
| `displayName` | derived from email | `Hi <displayName>` in the hero |
| `orgName` | `Dev Org` | Carried through to `/api/me` |
| `orgId` | `dev-org` | |
| `region` | `local` | |
| `redirect` | `/` | Path-only (starts with `/`); rejected otherwise |

The `/auth/login` page itself auto-renders a yellow **"DEV: sign in as → role × 6"**
strip when not in production, so you never need to remember the URLs.

### 2. Headless / CI: `scripts/dev-mint-cookie.js`

For Puppeteer, Playwright, or `curl` tests where launching a browser to
`/auth/dev-login` isn't practical:

```bash
node scripts/dev-mint-cookie.js --role editor --privileges quiz,smartpaths
```

The script prints two lines to stdout:
1. The raw JWT (for tools that set `Authorization`-style headers directly)
2. A copy-paste-friendly `Set-Cookie: swhelp_session=…` line

Reads `HELP_JWT_SECRET` from `.env` - same secret the running server uses,
so cookies it mints are accepted by `/api/me`, `auth/middleware.js`, and the
URL guard in `server.js`.

### 3. In-session preview: `?as=<role>`

Append `?as=user`, `?as=manager`, etc. to any URL to **preview** the page as
that tier without changing the cookie:

```
http://localhost:3001/?as=user
http://localhost:3001/path/editor/?as=manager
```

- **Dev mode:** any cookied user can use `?as=`.
- **Production:** only a real `superadmin` may use `?as=`; anyone else is
  ignored.

Privileges are preserved across the preview, so module / feature licensing
stays consistent with the real org. Dropping the query string restores the
real session.

### Common test scenarios

| Goal | URL |
|---|---|
| Learner with NO licensed modules (sees upsell on every module) | `/auth/dev-login?role=user` |
| Learner with Quiz licensed only | `/auth/dev-login?role=user&privileges=quiz` |
| Fully-licensed learner (all modules visible) | `/auth/dev-login?role=user&privileges=*` |
| Manager - see **For Managers** sub-sections inside modules | `/auth/dev-login?role=manager&privileges=managerView,quiz` |
| Manager with full org licensing | `/auth/dev-login?role=manager&privileges=*` |
| Editor with full authoring tree | `/auth/dev-login?role=editor&privileges=*` |
| Editor whose org only has Quiz + SmartPath | `/auth/dev-login?role=editor&privileges=quiz,smartpaths` |
| Multi-role user (editor + manager) - see ALL sub-sections | `/auth/dev-login?role=editor,manager&privileges=*` |
| Custom name in the greeting | `/auth/dev-login?role=editor&privileges=*&displayName=Charan` |
| Superadmin previewing user view | sign in normally, then visit `/?as=user` |

> **Trap:** the **For Managers** sub-folder inside each module requires `managerView`
> privilege in addition to the manager role. If you log in as `?role=manager` with
> no `&privileges=...`, you'll see User + Editor leaves but NOT For Managers -
> because `managerView` isn't in your dev privileges. That's the intended gate
> (mirrors the LMS-side licensing for team-view UI). Add `managerView` to your
> privileges, or just use `&privileges=*`.

### Production safety

| Layer | Behavior in `NODE_ENV=production` |
|---|---|
| `/auth/dev-login` | Route NOT registered. Falls through to the catch-all → redirects to `/auth/login`. **No cookie is issued.** |
| `scripts/dev-mint-cookie.js` | Local CLI; cannot run in prod (needs `HELP_JWT_SECRET`). |
| `?as=<role>` | Honored only when the real session is `superadmin`. |
| DEV strip on `/auth/login` | Hidden (markup not rendered). CSS rules remain but no `.devStrip` element exists. |

Verified end-to-end: in dev the `/auth/dev-login` URL emits a valid
`Set-Cookie: swhelp_session=…`; in prod the same URL emits no cookie and
redirects to login.

### Plumbing reference

- `auth/routes.js` - registers `/auth/dev-login` inside an
  `IS_DEV` guard at module load.
- `auth/jwt.js` - `signSessionToken({email, displayName, roles, region,
  orgId, orgName, privileges})` is the shared signer used by `/auth/callback`,
  `/auth/dev-login`, and the CLI.
- `auth/middleware.js` - `maybeApplyPreview(req)` applies `?as=` after the
  cookie has been verified.
- `scripts/dev-mint-cookie.js` - wraps `signSessionToken`.
- `data/known-privileges.json` - drives the "all privileges by default"
  behavior.

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
  (public) then `requireAuth` - everything mounted after is protected. Admin chat-log
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
  files that aren't in the repo - they are stale and will fail. The real backend entry is
  `server.js`. Use `node server.js` / `npm start`, not those scripts.
- **All SmartWinnr roles can sign in** (`user`, `manager`, `editor`, `admin`, `orgadmin`,
  `lamadmin`, `superadmin`) - `auth/routes.js` no longer restricts to editor/admin. What
  each role sees inside is decided by the swizzled `DocSidebarItem/{Category,Link}`
  wrappers reading `customProps.{roles, privilege, anyPrivilege}` from `sidebars.ts` and
  `_category_.json` files. Gate-resolution logic lives in `src/access-policy.ts`
  (`isAllowed`); `superadmin` bypasses privilege checks (`PRIVILEGE_BYPASS_ROLES`).
- **Server-side URL guard is live.** `plugins/access-gate-emit.js` walks `_category_.json`
  files + article frontmatter at build time and writes `build/doc-gates.json` (a
  longest-prefix lookup table). The middleware in `server.js` (around line 2322) loads
  that table and 403s on any disallowed path, using AND-of-all-matching-gates semantics
  (every ancestor category must allow the viewer). The same `isUrlAllowedForUser`
  helper filters vector-search results and chatbot citations so what we feed the LLM
  matches what the site would serve. Falls open if `doc-gates.json` is absent (e.g. dev
  with no build), so local dev still works.
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
  BLOCKS the commit if the `no-decorative-emojis` rule fires. GitHub Actions
  (`.github/workflows/build-check.yml`) runs the full build on every push to `main` -
  including the publish bot's API commits, which never trigger husky hooks. The old
  `.gitlab-ci.yml` predates the move to GitHub and is NOT part of the deploy path.
- **The Railway volume at `/app/data` SHADOWS the repo's `data/` directory.** On the
  production container, repo files like `data/redirects.json` and
  `data/known-privileges.json` don't exist on disk until the server seeds them from
  the publish branch (`loadRedirectsBase`, `ensureKnownPrivilegesSeeded` in server.js).
  Never assume a `data/` file readable locally is readable in production.
- **The publish bot pre-flights every deploy.** `fireDeploy` (server.js) validates the
  batch before committing: build-breaking articles (bad MDX/YAML, unknown privilege
  keys, missing images, route/id collisions) are held back in the queue; a
  `redirects.json` with dangling targets aborts the deploy with HTTP 422 and a
  `lastValidationError` surfaced on `/admin/authoring/drafts`. Route-changing actions
  (move, slug rename in the raw editor, delete) maintain `data/redirects.json`
  automatically - the build hard-fails on redirects to nonexistent routes.
- **The `authoring-wip` branch is machine-owned - never push to it.** When
  `AUTHORING_JOURNAL=true`, the server write-through-commits every wizard
  save/upload/move/delete to that branch within seconds (durability journal;
  see the journal section in server.js). Its invariant is "publish-branch tree
  at `baseMainSha` + all runtime-dirty files + `.authoring/journal.json`
  manifest", and after every green deploy the server force-rebases it onto the
  new main tip - manual commits there get clobbered. On boot the server
  materializes manifest entries back onto the ephemeral disk (after the
  `data/pending-files/` snapshot restore, which stays as the offline fallback).
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
support.smartwinnr.com) and is a one-shot cleanup tool - it is NOT part of the canonical
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

## Module sub-folder template (the "8-leaf" layout)

Every module under `docs/modules/<m>/` is built from ONE canonical set of leaf
sub-folders. The source of truth is `SUB_FOLDERS` in `src/lib/authoring.ts`
(mirrored by `scripts/write-subsection-categories.js` and
`scripts/restamp-subsection-gates.js`). The 8 leaves every module should draw
from - with their canonical gate:

| Leaf dir | Label | Roles gate |
|---|---|---|
| `for-learners` | For Learners | all roles + module privilege |
| `for-managers` | For Managers | manager+ + `managerView` |
| `create-and-manage` | Create & Manage | editor+ + module privilege |
| `features` | Features | editor+ + module privilege |
| `reports-and-analytics` | Reports & Analytics | editor+ + module privilege |
| `settings-and-permissions` | Settings & Permissions | editor+ + module privilege |
| `best-practices` | Best Practices | editor+ + module privilege |
| `faqs-and-troubleshooting` | FAQs & Troubleshooting | all roles + module privilege |

Notes / gotchas:
- **`assign-and-schedule` is being deprecated.** It is still in `SUB_FOLDERS`
  (9th entry) but do NOT author new content there. `audit:gates` treats it as
  known; everything else outside the table warns as an "unknown sub-folder".
- **Only canonical, correctly-spelled dir names count.** Variants like
  `reports-analytics`, `faqs-troubleshooting`, or one-off names like `editors`
  are flagged by `npm run audit:gates` and must be renamed/merged. The folder
  name is part of the URL (`/modules/<m>/<leaf>/<slug>`), so any rename needs a
  redirect in `data/redirects.json` (the build hard-fails on dangling targets).
- **Empty leaves are invisible.** Docusaurus skips an autogenerated category
  with no articles - it renders no route. So you do NOT pre-create empty
  leaves; a leaf appears when its first article lands. Uniformity is enforced
  at authoring time (the wizard offers the canonical leaves) and audited by
  `npm run audit:gates`, not by stamping empty folders.
- **Module identity lives in `static/module-overviews.json`**, not the module
  root `_category_.json`. The root stays open (all roles, NO privilege) so the
  overview/upsell page is reachable; `cascade-module-privilege.js` pushes the
  module's `privilege`/`anyPrivilege` down onto each leaf's gate.

### Creating a new module

```bash
# 1. Scaffold: module-overviews.json entry + root _category_.json + index.mdx
npm run module:new -- --slug <slug> --label "<Label>" --privilege <priv> --position <N>
#    (use --any-privilege a,b,c instead of --privilege for multi-privilege modules;
#     privilege keys are validated against data/known-privileges.json)

# 2. Add articles under docs/modules/<slug>/<leaf>/ (canonical leaf names above).
#    The authoring wizard offers these automatically.

# 3. Stamp canonical labels/positions + gates, cascade privilege, and verify:
npm run module:restamp        # write-subsection-categories + restamp-gates + cascade + audit:gates
```

`module:restamp` is idempotent - safe to re-run on any existing module to
reconcile drifted `_category_.json` files back to the canonical template.

## Release-draft pipeline (commits -> draft articles)

Turns a contract-conforming commit in `smartwinnr_9543` into a DRAFT article
here, automatically, at deploy time. A human always reviews and publishes -
nothing goes live unattended. Counterpart repo: `smartwinnr_9543`
(`tools/release/push-article-drafts.js`, `tools/git-hooks/*`,
`deploy/prod/deploy_git_actions.py` - **not** `deploy_git_actions_py3.py`,
which is stale and not the script actually run for production deploys).

### Flow

1. A commit in `smartwinnr_9543` carries `Change-Type`/`Audience` trailers
   and `What changed`/`Why`/`How to use`/`Notes` sections, enforced by that
   repo's pre-push hook (`tools/git-hooks/msg-contract.js`).
2. At deploy time, `deploy_git_actions.py` calls
   `tools/release/push-article-drafts.js <prevTag> <newTag> <masterCommit>`,
   which collects every `Audience: client` commit since its own marker
   (`refs/smartwinnr/last-article-dispatch`, held back on any per-change
   failure - never advances past something that didn't actually draft) and
   POSTs to this repo's `POST /api/release-drafts`, authenticated by
   `x-release-shared-secret` (`RELEASE_DRAFTS_SECRET`). That route is
   registered in the public zone, **before** `initAuth(app)` - it does its
   own auth, not session-cookie auth.
3. `findMatchingArticle` searches every canonical sub-folder under the
   target module for an existing article on the same issue (provenance
   comment `{/* release-draft: tag=... issue=... url=... */}`, injected
   into every pipeline-created/updated article) or close keyword overlap.
   Match -> refines that article in place (no duplicate). No match ->
   fresh draft via `subFolderForChangeType` (`feature` -> create-and-manage,
   `bug` -> faqs-and-troubleshooting, else -> features).
4. Always lands as `draft: true`. A human opens `/admin/authoring/drafts`
   (badged + filterable by `origin: pipeline` vs hand-authored, with a
   "Location" column showing the resolved module/sub-folder) and publishes
   like any other draft.

### Module routing - two maps, not one

`server.js`'s `RELEASE_MODULE_MAP` (source `modules/<dir>` -> destination
doc module slug) predates verification against the real `smartwinnr_9543`
repo and several of its keys are generic/singular names
(`modules/quiz`, `modules/smartpath`, ...) that don't exist there - left
as-is rather than rewritten. `RELEASE_SOURCE_ALIASES`, right below it, is
the real, verified routing table (`modules/quizzes` -> `quiz`,
`modules/coachings` -> `video-coaching`, `modules/contents` -> `smartfeed`,
etc.) and is checked FIRST in `mapChangeToDestination`, falling back to
`RELEASE_MODULE_MAP`. **When a new smartwinnr_9543 module needs routing,
add it to `RELEASE_SOURCE_ALIASES`**, and verify the source directory name
against the real repo (`ls modules/` there) rather than guessing - this
exact mismatch caused every commit touching quizzes/smartpaths/surveys/
competitions/knowledge-hub to silently fail to draft until caught by a
live test.

### Ownership and notifications

`customProps.owner` in article frontmatter is set ONLY by `publishHandler`
(never by save/draft) - first publish sets the publisher as owner, every
later publish reassigns ownership to whoever approved that version.
Distinct from `last_update.author`, which the release pipeline's service
account also touches.

- Existing article updated -> `notifyExistingOwner`: an email to
  `RELEASE_OWNER_NOTIFY_DISTRO_EMAIL` (a shared team/manager address, NOT
  the owner's personal inbox - the owner is named in the body) plus a
  plain "For: `<owner>`" Teams post to `RELEASE_DRAFTS_TEAMS_WEBHOOK`
  (real `@mention` via `msteams.entities` is confirmed NOT to render
  through the Workflows "Post card" action - don't reintroduce it).
- New article created -> `notifyNewArticleChannel`: a batched Teams
  summary on the same webhook.
- First time an email becomes an owner -> `notifyNewAuthor`: a one-time
  welcome email straight to that individual (identity verification, so it
  intentionally does NOT go through the distro), gated by
  `isEmailApproved` (`lib/email-allowlist.js`): any `@smartwinnr.com`
  address is allowed outright, anyone else needs approval at
  `/admin/approved-emails` (superadmin page, backed by the
  `approved_notify_emails` table).
- Both email paths require `RELEASE_OWNER_EMAILS_ENABLED=true` (default
  off) - the kill switch that lets the pipeline be exercised end-to-end
  without emailing real people. Uses `MAIN_APP_SHARED_SECRET` /
  `urlForRegion('global')` from `db/digest-send.js` - the SAME path the
  weekly digests already use, not a separate secret.
- `lib/authors-registry.js` (`known-authors.json`, tracked in git) records
  every email that has ever become an owner.
- Every publish appends to `release-publish-log.jsonl` (gitignored) - a
  placeholder for a future release-notes aggregator, not one itself.

### Testing locally - and the one sharp edge

Point this repo's config at a local run (`.env`: `RELEASE_DRAFTS_SECRET`
set), then in `smartwinnr_9543`:

```bash
git config smartwinnr.articleDestClient "http://localhost:3000"
git config smartwinnr.articleSecretClient "<same value as RELEASE_DRAFTS_SECRET>"
DRY_RUN=1 node tools/release/push-article-drafts.js <prevCommit> <fakeTag> <headCommit>   # prints payloads, no network call
node tools/release/push-article-drafts.js <prevCommit> <fakeTag> <headCommit>             # actually dispatches
```

**On a real (non-`DRY_RUN`) success, this pushes
`refs/smartwinnr/last-article-dispatch` to `smartwinnr_9543`'s real
`origin`** (`release-marker.js`'s `advance()`) - a genuine write to shared
remote state, not just local. Testing with a scratch commit/branch leaves
that ref pointing at a SHA that's about to become unreachable once the
branch is deleted. Clean it up after any local test:

```bash
git push origin :refs/smartwinnr/last-article-dispatch
git update-ref -d refs/smartwinnr/last-article-dispatch
git config --unset smartwinnr.articleDestClient
git config --unset smartwinnr.articleSecretClient
```

(Low practical risk if forgotten - the next REAL deploy's `resolvePrev`
checks `merge-base --is-ancestor <marker> <head>` and gracefully falls
back to the tag-derived range when the marker isn't in that history - but
it's a stray write to shared infra and should be cleaned up regardless.)

A commit's `Audience` having real changes but no destination configured
(`smartwinnr.articleDest<Audience>` unset) is a deliberate, logged skip -
`push-article-drafts.js` prints e.g. `"1 tech change(s) ready, but
smartwinnr.articleDestTech is not configured - skipped"` rather than
staying silent.

## Key environment variables

`OPENAI_API_KEY` (required), `INTERNAL_API_KEY` (guards `/api/vector/embed`),
`CHROMA_HOST`/`CHROMA_PORT`/`CHROMA_SSL`/`COLLECTION_NAME`, `EMBEDDING_MODEL`,
`PORT`. Auth (required in production): `HELP_JWT_SECRET`, `HELP_SITE_URL`,
`LAMBDA_MAGIC_LINK_URL`. Chat logging: `CHAT_LOG_DB_PATH`, `CHAT_LOG_RETENTION_DAYS`,
`CHAT_LOGGING_ENABLED`. Release-draft pipeline (see that section above):
`RELEASE_DRAFTS_SECRET` (auth for incoming dispatches), `MAIN_APP_SHARED_SECRET`
(reused from the digest-email path), `RELEASE_OWNER_EMAILS_ENABLED` (default
off), `RELEASE_OWNER_NOTIFY_DISTRO_EMAIL`, `RELEASE_DRAFTS_TEAMS_WEBHOOK`.
Copy `.env.example` → `.env` to start. Deployment is Railway
(see `RAILWAY_DEPLOYMENT.md`); `Dockerfile.docusaurus` is the production image.
