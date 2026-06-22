# 04. Content tasks

**Version:** 1.0 | **Last Updated:** June 2026

**Audience:** Engineers and editors adding, editing, organizing, or re-syncing articles.

---

## Table of contents

1. [Canonical article format](#canonical-article-format)
2. [Task: add an article via the wizard](#task-add-an-article-via-the-wizard)
3. [Task: add an article by hand](#task-add-an-article-by-hand)
4. [Task: add a new module or category](#task-add-a-new-module-or-category)
5. [Task: re-index into ChromaDB](#task-re-index-into-chromadb)
6. [Task: re-sync from Help Scout](#task-re-sync-from-help-scout)
7. [Task: generate articles from Freshdesk tickets](#task-generate-articles-from-freshdesk-tickets)
8. [Image conventions](#image-conventions)
9. [Style guide enforcement](#style-guide-enforcement)

---

## Canonical article format

Every article under `docs/` follows this frontmatter schema. Defined in
`AUTH_MENU_PLAN.md` §C1; enforced by the migrator, the wizard, and
`audit:articles`.

```yaml
---
id: <helpscout_id>                            # required; doubles as Docusaurus doc id
title: "<Article Title>"                      # required; double-quoted; Title Case
description: "<one-line summary, ≤160 chars>" # required; may be ""
slug: <kebab-case-slug>                       # required; unquoted
sidebar_position: <integer>                   # required; preserved across re-syncs if set
last_update:
  date: <YYYY-MM-DD>                          # required
  author: HelpScout Migration                 # required literal string
source:
  helpscout_id: <helpscout_id>                # required; matches top-level `id`
  helpscout_url: <https://help.smartwinnr.com/article/...>  # required
customProps:                                  # required; consumed by sidebar swizzle + URL guard
  roles: [user, editor, admin]                # at least one SmartWinnrRole
  privilege: <orgPrivilegeKey>                # optional; one of the privileges enum
tags: []                                      # optional; Help Scout tags, lowercased
---
```

Rules:

- Field order is fixed. Don't add fields outside this schema.
- No comments inside the frontmatter block (YAML allows them but breaks
  some downstream parsers).
- `customProps.roles` must be valid `SmartWinnrRole` values from
  `src/access-policy.ts`. `customProps.privilege` must be in
  `data/known-privileges.json`. `npm run validate:privileges` enforces this.

### Canonical directory layout

`scripts/migrate-helpscout.js` will refuse to write outside the
`CANONICAL_DIRS` set at the top of that file. The layout mirrors
`sidebars.ts`:

```
docs/
├── overview/                            # all roles
├── getting-started/                     # all roles
├── announcements/                       # all roles
├── user-guide/                          # all roles
│   └── ai-coaching/                     # all roles  (privilege: aiCoaching)
├── help-support/                        # all roles
├── troubleshooting/                     # all roles
├── manager-guide/                       # manager+editor+admin (privilege: managerView)
└── administration/                      # editor+admin (per-module privileges)
    ├── system-management/               # admin only
    ├── access-permissions/              # admin only
    ├── quiz-module/                     # privilege: quiz
    ├── smartpath-module/                # privilege: smartpaths
    ├── smartfeed-module/                # privilege: content
    ├── video-coaching-module/           # privilege: coaching
    ├── field-coaching-module/           # privilege: fCoaching
    ├── ai-coaching/                     # privilege: aiCoaching
    ├── survey-module/                   # privilege: survey
    ├── knowledge-hub-module/            # privilege: khub
    ├── forms-module/                    # privilege: forms
    ├── kpi-gamification/                # anyPrivilege: kpi|competitions|achievements
    ├── reports/                         # anyPrivilege: learnerReport|adminReports|generatedReports
    ├── notifications/                   # anyPrivilege: customNotifications|notifications|chat
    ├── project-management/              # privilege: projectManagement
    └── cross-module-features/           # editor+admin (catch-all)
```

---

## Task: add an article via the wizard

The fastest, lowest-friction path. Recommended for most articles.

**Preconditions:**
- Mode B running (`npm start` or `npm run build && node server.js`).
- You're signed in as `superadmin` (e.g. `/auth/dev-login?role=superadmin&privileges=*`).

### Steps

1. Open `http://localhost:3001/admin/authoring/`.
2. **Step 1 — Where + who.** Pick:
   - **Module** (from `data/modules.json`).
   - **Sub-section** (matches the canonical directory layout above).
   - **Roles + privilege** (defaults derived from the sub-section, but
     overridable).
3. **Step 2 — Brain dump.** Paste a rough description, paste URLs of
   screenshots if you have them. The "Suggest a new title/description"
   buttons call `/api/admin/authoring/suggest-field` which uses
   `prompts/author-article.md`.
4. **Step 3 — Preview, refine, save.**
   - Editable inputs above the preview let you tweak title / description.
   - Slug auto-syncs from title.
   - **Save** persists as draft (`docs/<path>` with the `draft: true`
     frontmatter flag).
   - **Publish** removes the draft flag and, if `AUTHORING_GIT_PUSH=true`,
     pushes a commit to GitHub. Railway picks it up and redeploys.

### What gets written

```
docs/<module>/<sub-section>/<slug>.md         ← the article
static/img/helpscout/authored/<n>.png         ← uploaded screenshots
```

### Limitations

- The wizard only writes inside `CANONICAL_DIRS`. You can't put a new
  article anywhere else.
- Each superadmin is rate-limited to `AUTHORING_RATE_LIMIT` LLM
  generates per 60-minute window (default 10).
- Auto-deploy is debounced (default 30-min window) and rate-limited
  (default ≤ 1 deploy per 60 min). Tune via `AUTHORING_DEPLOY_*` env vars.

---

## Task: add an article by hand

Use this when you need precision (an unusual frontmatter combination,
inline MDX components, or a doc that needs to exist before the wizard
can target it).

### Steps

1. Pick the directory under `docs/` from the canonical layout above.
2. Create `<slug>.md` with the canonical frontmatter.
3. Write the body following `SmartWinnr-Help-Style-Guide.md`:
   - American English, active voice, ≤20-word sentences.
   - Bold every UI element (`**Save**`, `**Submit**`).
   - Numbered steps for procedures; bullets for options.
   - Callouts: `> **Tip**: ...`, `> **Note**: ...`.
   - No decorative emojis. Use plain prose or Lucide icons in the
     React layer when something visual is needed.
4. Verify locally:

   ```bash
   npm run lint:docs:fix
   npm run validate:privileges
   npm run audit:gates
   npm run build         # the URL guard re-emits doc-gates.json here
   ```

5. Optionally re-index so Wynnie can find it:

   ```bash
   # In another terminal, with the server running:
   npm run index-internal
   ```

6. Commit + push. CI re-runs `lint:docs` and `build`.

### Common mistakes

- **Missing `customProps`.** The article will be visible to everyone
  with access to the parent — usually wrong. Always specify roles.
- **`privilege` not in `data/known-privileges.json`.** `validate:privileges`
  fails the build.
- **Article slug collides** with an existing one. Docusaurus warns at
  build time. Adjust the slug.

---

## Task: add a new module or category

This is a multi-step structural change. Don't do it just for an article;
do it when you're adding a real new product area.

### Steps

1. **Create the directory** under the canonical layout.
2. **Add `_category_.json`** with:

   ```json
   {
     "label": "Foo Module",
     "position": 12,
     "collapsible": true,
     "collapsed": true,
     "link": {
       "type": "generated-index",
       "title": "Foo Module",
       "description": "..."
     },
     "customProps": {
       "roles": ["editor", "admin"],
       "privilege": "foo"
     }
   }
   ```

3. **Add the privilege** (if new) to `data/known-privileges.json`. This
   mirrors the LMS-side `privileges` enum at
   `node_projects/smartwinnr_prd/modules/organizations/server/models/organizations.server.model.js`
   in the main SmartWinnr app.
4. **Add the module** to `data/modules.json` so the authoring wizard
   shows it in Step 1.
5. **Update sidebar mapping** (the swizzled `ModuleOverview` may need a
   new entry — see `src/components/Modules/ModuleOverview.tsx`).
6. **Add an icon** for the homepage module strip:
   `src/lib/module-icons.ts` (`MODULE_ICON_BY_SLUG`).
7. Build + run:

   ```bash
   npm run build && node server.js
   ```

   Confirm the new module appears in the sidebar for a user with the
   right role + privilege. Try `/auth/dev-login?role=editor&privileges=foo`.

8. Confirm `/modules/foo/` renders the per-module landing page.

---

## Task: re-index into ChromaDB

The indexer reads `docs/`, SHA-256 hashes each file, and re-embeds only
new or changed articles. It's safe to run frequently.

### Steps

```bash
# Terminal 1
node server.js                       # the indexer needs /api/vector/embed live

# Terminal 2
npm run index-internal
```

Expected output:

```
[indexer] scanning docs/
[indexer] 902 articles found
[indexer] 3 changed, 1 new, 0 deleted
[indexer] embedding 4 chunks via /api/vector/embed
[indexer] done in 12.4s
```

### When to use `FORCE_FULL_REINDEX`

```bash
FORCE_FULL_REINDEX=true npm run index-internal
```

This **deletes** the entire `smartwinnr_docs` collection and re-embeds
every article. Use only when:

- The embedding model changed (e.g. you bumped `EMBEDDING_MODEL`).
- The collection got corrupted.
- You want a guaranteed-clean re-embed for a release.

It costs OpenAI credits proportional to total content length (~$0.50 for
the current corpus).

---

## Task: re-sync from Help Scout

Use when upstream Help Scout articles have been edited and you want to
pull those changes into `docs/`. The original migration is done — this
is the periodic refresh flow.

### Steps

```bash
# 1. Snapshot first.
npm run backup:docs                                              # tarball to data/backups/
git checkout -b backup/pre-helpscout-resync-$(date +%F)          # snapshot branch (frozen)
git checkout main && git checkout -b feature/helpscout-resync-$(date +%Y-%m)

# 2. Inventory upstream.
npm run helpscout:inventory                                      # writes scripts/helpscout-inventory.json
#    Edit CATEGORY_MAPPING in scripts/migrate-helpscout.js if collections are new.
#    Commit the mapping change.

# 3. Migrate.
npm run helpscout:migrate                                        # aborts on unmapped collections
#    Add --allow-relocate to move articles whose canonical dir changed
#    Add --prune to delete on-disk articles no longer in Help Scout

# 4. Validate.
npm run lint:docs:fix
npm run typecheck
npm run build

# 5. Re-index.
node server.js & npm run index-internal
```

### Invariants the migrator enforces

- Refuses to write outside `CANONICAL_DIRS`.
- Preserves any human-set `sidebar_position` across re-syncs.
- Bucket images per Help Scout collection at
  `static/img/helpscout/<collection-slug>/<article-slug>-<n>.<ext>`.
- Existing non-zero-byte image files are not re-downloaded (idempotent).

> **Trap.** `--prune` deletes articles. Always run without `--prune`
> first, review the diff, then re-run with `--prune` if the deletes look
> right.

---

## Task: generate articles from Freshdesk tickets

Use when you want to surface documentation gaps from real support
tickets. Runs out of `scripts/freshdesk/`.

```
Stage 1: ingest-csv.js          # clean threads, strip signatures, dedup
Stage 2: cluster-queries.js     # rule-based clustering + Claude AI fallback
Stage 3: gap-analysis.js        # compare clusters against existing 900+ docs
Stage 4: generate-articles.js   # GPT-4o generates markdown per style guide
Stage 5: validate-articles.js   # frontmatter + style-guide checks
Stage 6: prepare-output.js      # copy to docs/, generate recommendations
```

You run them in sequence via `scripts/freshdesk/process-freshdesk.js`.
See `ARCHITECTURE.md` §4.1 for the full pipeline details.

The output lands as drafts in `docs/<category>/`. They need human review
before publishing — the LLM is good but not perfect, and the canonical
frontmatter must be confirmed manually.

---

## Image conventions

### Help Scout-sourced images

```
static/img/helpscout/<collection-slug>/<article-slug>-<n>.<ext>
```

Referenced from markdown:

```markdown
![Description](/img/helpscout/quiz-module/how-to-create-quiz-1.png)
```

The migrator buckets by collection so deletes and audits are scoped.

### Wizard-uploaded images

```
static/img/helpscout/authored/<random-slug>.png
```

Uploaded via `POST /api/admin/authoring/upload` (base64-encoded). The
wizard returns the URL and the editor pastes it into the brain dump.

> **Why served from `static/` not `build/`?** Newly-uploaded images
> need to be visible **before** the next build, since the wizard's
> save-as-draft happens immediately. `server.js` mounts
> `express.static('static/')` after `express.static('build/')` so
> newly-uploaded files win over any stale build artifact with the same
> name.

### Other sources

`scripts/migrate-images.js` exists to clean up images from Google Drive
or support.smartwinnr.com paths. It is a **one-shot cleanup tool**, not
part of the canonical re-sync pipeline.

---

## Style guide enforcement

Three places enforce the style guide:

1. **`SmartWinnr-Help-Style-Guide.md`** — the canonical text. Loaded
   verbatim by `scripts/audit-articles.js`, `scripts/article-autofix.js`,
   `scripts/rewrite-articles.js`, `db/article-audit.js`, and the
   authoring wizard.
2. **`npm run lint:docs`** — `markdownlint-cli2` with custom rules in
   `custom-markdownlint-rules.js`. Includes the no-decorative-emojis
   gate. Runs on commit and in CI.
3. **`npm run audit:articles`** — runs `db/article-audit.js` over every
   file, grades on freshness/completeness/style, emits a report. Use
   this when prepping a content-quality push.

### The autofix + rewrite pipeline

```bash
npm run articles:autofix      # deterministic — safe to run on every article
npm run articles:rewrite      # LLM-driven — review the diff before committing
```

`articles:autofix` is regex-driven and idempotent. `articles:rewrite`
calls the LLM with `prompts/rewrite-article.md` as system prompt — it can
make substantive changes, so always review the diff.

---

Next: [05-tasks-backend.md](./05-tasks-backend.md) →
