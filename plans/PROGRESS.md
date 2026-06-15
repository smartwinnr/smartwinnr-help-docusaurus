# SmartWinnr Help - Implementation progress

Status snapshot of the [Help-site IA redesign](./help-menu-redesign.md).
Updated **2026-06-12**. Branch: `feature/help-ia-redesign` (uncommitted).

For decision rationale and full design, see `plans/help-menu-redesign.md` (the
authoritative plan file - this document is a derived status view).

---

## At a glance

| Phase | Status | Notes |
|---|:-:|---|
| **1. Foundation** - role constants, access-policy, shared CJS, validator | ✅ done | `prebuild` runs `validate:privileges` + `audit:gates` |
| **2. IA scaffolding** - `sidebars.ts`, 12 modules × 45 sub-sections + 8 sections | ✅ done | Module count 13 → 12 (Project Management removed) |
| **3. Content migration** - 21 dir moves + 174 article bucketing + 37 guides + 446 redirects | ✅ done | 6 scripts in `scripts/` (incl. bucketing + cascade) |
| **4. Server-side URL guard** - plugin + middleware (AND-of-all-gates) | ✅ done | 83 prefix · 275 article gates · directory-permission semantics |
| **5. Lint & verification** - `MD-SW-001` + privilege validator + gate auditor | ✅ done | `MD-SW-001` disabled until content classification pass |
| **§12 Landing journey** - LP-1 → LP-4 | ✅ done | LP-5 ?as= preview shipped via dev-tooling; checklist deferred |
| **§12.10 Stakeholder refinement** (MDX docs, real article hrefs) | ✅ done | All 46 entry hrefs resolve |
| **§12.11 Hero redesign** (Infima tokens, dark-mode safe) | ✅ done | Soft pale-purple wash |
| **§12.12 Dev-mode role switching** (`/auth/dev-login`, mint CLI, `?as=`) | ✅ done | NODE_ENV-gated; `?privileges=` defaults to empty, `*` shorthand for all |
| **§12.13 Module access audit + per-module upsell** | ✅ done | 12 module `index.mdx` with `<ModuleOverview>`; cascade onto sub-folders |
| **Privilege gating ENABLED** | ✅ done | `PRIVILEGE_GATING_ENABLED=true` in both copies; cascade ensures every sub-folder carries the right gate |
| **`allPrivileges` schema** (AND across multiple privs) | ✅ done | `for-managers` requires both `managerView` AND parent module privilege |
| **Project Management module removed** | ✅ done | 4 articles + 9 redirects pruned; LMS privilege snapshot retained |
| **Typography / fonts** | ✅ done | Apple-quality pass shipped 2026-06-12 (plan §14). Self-hosted Inter Variable + JetBrains Mono Variable in `static/fonts/`; preloaded via `headTags`; Google Fonts CDN dropped. New `--text-*` / `--lh-*` / `--tr-*` / `--space-*` token system in `custom.css` with `.type-*` utility classes. Article `.markdown` reading measure capped at 72ch with 8pt rhythm. Landing / Modules / ChatBot / VectorSearch / SearchBar / sidebar / footer all rewritten to consume tokens - zero hard-coded font-size in any component module. |
| **Article format pass** | ✅ done | Plan §15 shipped 2026-06-12: `STYLE.md` canonical template, `scripts/audit-articles.js` + `npm run audit:articles` (auto-emits `reports/article-audit-<date>.md` with priority scores), DocItem/Content swizzle with MetaChip + FeedbackFooter + RelatedStrip, `db/feedback-logger.js` + `/api/feedback` + admin endpoints, `plugins/access-gate-emit.js` now emits `article-graph.json`, `scripts/article-autofix.js` filled 249 descriptions + 249 tag sets + 1002 image alts (score dropped 32.4 → 13.8), `scripts/rewrite-articles.js` + `prompts/rewrite-article.md` for LLM rewrites, superadmin dashboard at `/admin/analytics/feedback`. Lint rules `MD-SW-002 description-required` + `MD-SW-003 alt-text-required` added (kept disabled until further cleanup). |
| **Sub-section content classification pass** | ⏸ deferred | 170 articles bucketed by filename heuristics; human review would refine edge cases. After that, flip `MD-SW-001` to enforced |
| **First-time editor onboarding checklist** | ⏸ deferred | LP-5 polish - dismissible 5-step panel on landing |
| **Persona-led landing (Option C)** | ✅ done | 5-door hero (`PersonaDoors`) + persona-shell hero in `PathBody` with `taskGrid` card sections + mode rail. Reports + Integrations absorbed into Manager + Admin doors. Manager door gated on `managerView` privilege via new `canEnterPersona()` helper. |
| **Authoring skill** (`/admin/authoring`) | ✅ done | Plan §19 shipped 2026-06-12: 4-step wizard (Where + who → Hook → Brain dump → Preview + refine + save), superadmin-only, `prompts/author-article.md` system prompt with anti-release-note + anti-hallucination clauses, `db/article-audit.js` `gradeMarkdown()` returns `Finding[]` with blocking flag, `server.js` adds POST `generate`/`save`/`publish`/`upload` + GET `drafts`/`draft` + DELETE `draft` routes (all `requireRole('superadmin')`), drafts queue at `/admin/authoring/drafts` with Publish/Delete. OpenAI Chat Completions (`gpt-4o` default, override via `AUTHORING_MODEL`) via existing axios + `getOpenAIKey()` - no new SDK dep. Server stamps `last_update.date` to today + `last_update.author` to logged-in user. Custom tags allowed in step 2; ≥1 tag required. |
| **Authoring LLM rate limit** | ✅ done | Plan §20.1 - 10 generates per hour per superadmin via in-memory ring buffer keyed on email. Override via `AUTHORING_RATE_LIMIT` env var. Wizard catches 429 + surfaces "Try again in ~M min" message. |
| **Authoring publish-to-deploy pipeline** | ⏸ TODO | Plan §20.3–§20.5 - when an editor publishes, the article is invisible until Railway redeploys. Approach: server commits + pushes the changed files to `main` using a GitLab PAT; Railway is already configured to auto-redeploy on push (no deploy-hook URL needed - Railway no longer exposes one in their UI). Need: pending-publish queue + Deploy now button + 30 min debounced auto-fallback (capped at 1 deploy / 60 min). Env vars: `AUTHORING_GIT_PUSH`, `GIT_PUBLISH_BRANCH`, `GIT_PUSH_TOKEN`, `GIT_PUSH_REPO_URL`, `AUTHORING_DEPLOY_DEBOUNCE_MS`, `AUTHORING_DEPLOY_MIN_INTERVAL_MS`. |
| **Chat-logging identity columns** (Group A) | ✅ done | 2026-06-13 - `conversations` gained `user_display_name`, `org_id`, `org_name`, `user_roles`, `user_privileges` (JSON-stringified); `chat_exchanges` gained `chat_model`. Migration v2 in `db/chat-logger.js` is idempotent (catches "duplicate column" on fresh installs where CREATE TABLE already declared them). New index `idx_conversations_org_id`. `server.js` threads all six fields from `req.user` + `CHAT_MODEL` env. `exportToJSON(anonymize=true)` redacts all new identity fields. |
| **Chat-logging Group B** (quality signals) | ✅ done | 2026-06-15 — schema migration v3 added `is_refusal` (distinct from `is_fallback`) + `citation_clicks_json` to `chat_exchanges`. `server.js` `/api/chat` sets `isRefusal` at write time when search returned nothing or every result was distance ≥ 0.8. New `POST /api/chat/:exchangeId/citation-click` endpoint; `ChatBot.tsx` wires `sendBeacon` on citation link clicks. New helpers `recordCitationClick`, `getArticlePerformance` (now with `clickCount` + `ctrPct`), `getAbandonmentStats` (proxy: single-turn conversations with no thumbs-up). Schema self-heal added on every `getDb()` boot via `ensureSchemaColumns()` so migration drift is recoverable. |
| **Chat-logging Groups C + D** (privacy + ops) | ⏸ TODO | See [Chat-logging improvements](#chat-logging-improvements-deferred) below. Group C — PII scrubber, per-user opt-out, encryption at rest. Group D — Railway volume verification, S3/R2 backup, circuit-breaker webhook alerting. |
| **Chat analytics dashboard** (`/admin/analytics/chat/`) | ✅ done | 2026-06-15 — shipped V1+V2+V3 in three commits. V1: KPI tiles, Top Unanswered Queries (clustered), Article Performance (citations × ratings), query-type breakdown, ops footer. V2: refusal split, CTR column on Article Performance, abandonment in ops footer. V3: role + org filter dropdowns at the page header backed by `getAvailableOrgs` + a `buildConvFilter` clause builder that splices into all five aggregation queries. Mirrors `/admin/analytics/feedback/`'s structure and CSS module; cross-links between the two pages. |
| **Authoring wizard image controls (F1)** | ✅ done | Manual up/down reorder + optional `stepAnchor` text input per image. Prompt at `prompts/author-article.md` rewritten with a 3-tier placement priority order (stepAnchor → caption → array position). F2 (drag-to-section in Step 4 preview via per-image dropdown) deferred. |
| **Post-launch stakeholder feedback (round 1)** | ✅ done | Image border + shadow on `.markdown` images; RelatedStrip widens by audience tier rather than gate (no more learner pages surfacing manager/editor "What's next"); gate-aware Prev/Next paginator with reroute past blocked docs; doc-gate filter applied to vector search, chat citations, WhatsNew, RecentlyViewed; favicon set refreshed; role-label scrub on admin gate copy; `/api/*` path scrub on dashboard subheads. |
| **Wynnie chatbot — rename + voice + mark** | ✅ done (partial) | Renamed from "SmartWinnr Help Assistant" → Wynnie with custom W+sparkle SVG mark, system prompt rewritten in `prompts/wynnie.md` for conversational voice + threaded follow-ups (last 6 turns sent to OpenAI). **Open**: stakeholder flagged a slang concern; naming exploration ongoing (Sira / Asha / Quill candidates evaluated). No second rename shipped yet. |
| **Wynnie mascot** | ⏸ pending decisions | `branding/wynnie/designer-brief.md` + PDF generated; brief locked. Awaiting (a) chatbot name decision and (b) brand approver assignment before designer engagement. |
| **Git commits** | ⏸ open | Tree still uncommitted on `feature/help-ia-redesign` |

---

## Completed (chronological)

### Phase 1 - Foundation
- `src/role-constants.ts` - `ALL_ROLES`, `MANAGER_PLUS_ROLES`, `EDITOR_PLUS_ROLES`,
  `ADMIN_PLUS_ROLES`, `ORGADMIN_PLUS_ROLES`, `SUPERADMIN_ROLES`
- `src/access-policy.ts` - added `ROLE_TIER` + `hasMinTier()`; later exported
  `PRIVILEGE_GATING_ENABLED`
- `shared/access-policy.cjs` - CommonJS mirror for `server.js` + plugins
- `data/known-privileges.json` - 67-privilege snapshot
- `scripts/validate-privilege-keys.js` - wired into `prebuild`

### Phase 2 - IA scaffolding
- `sidebars.ts` rewritten to 8 topic-first sections
- Modules / Reference / Release Notes carry `generated-index` so the bare
  section URL resolves
- 8 section + 13 module + 45 sub-section `_category_.json` files

### Phase 3 - Content migration (270 articles)
- `scripts/migrate-ia.js` - 21 legacy directory moves
- `scripts/bucket-articles.js` - 174 module articles bucketed into 8 canonical
  sub-folders by heuristic classifier
- `scripts/bucket-guides.js` - 37 of 43 legacy guides articles moved into
  `for-learners/` / `for-managers/` (explicit per-filename map)
- `scripts/compact-redirects.js` - chains collapsed; final 455 entries in
  `data/redirects.json`
- `scripts/restamp-subsection-gates.js` - stamps the canonical role gate on
  every sub-section's `_category_.json`
- `@docusaurus/plugin-client-redirects@3.8.1` installed; redirects normalizer
  in `docusaurus.config.ts`

### Phase 4 - Server-side URL guard
- `plugins/access-gate-emit.js` - Docusaurus plugin; emits
  `build/doc-gates.json` (86 prefix + 267 article gates) and
  `build/landing-modules.json` (13 modules)
- `server.js` URL-guard middleware between `requireAuth` and
  `express.static`; returns 403 for hand-typed URLs the viewer can't access

### Phase 5 - Lint & verification
- `custom-markdownlint-rules.js` - `MD-SW-001` accepts 9 canonical sub-folder
  names. Disabled in `.markdownlint-cli2.jsonc` until per-article content
  classification pass
- Build: `npm run build` exits 0 cleanly across 30+ rebuilds
- Validators: `node scripts/validate-privilege-keys.js` exits 0

### §12 Role-Based Landing Journey (LP-1 → LP-4)
- **LP-1/1.5** - homepage at `/` + 7 persona path pages at `/path/<persona>/`,
  now as MDX docs (`docs/index.mdx` + `docs/path/*.mdx`) so they inherit the
  docs layout
- **LP-2** - `RecommendedModules` tile grid (runtime fetch of
  `landing-modules.json`) + `HelpFooter`
- **LP-3** - `WhatsNew` feed from `static/whats-new.json` (no rebuild required
  to add an announcement)
- **LP-4** - `RecentlyViewed` strip backed by a localStorage ring buffer,
  populated by the swizzled `src/theme/DocItem/Layout` on every doc view

### §12.10 Stakeholder-review refinement
- Fix A - landing & path pages moved from `src/pages/*` → MDX docs so the
  left sidebar renders correctly on real article pages
- Fix B - all 46 entry-point hrefs in `PathContent.ts` rewritten to point at
  specific real articles (verified)
- Fix C - yellow "requires X" pills only render when
  `PRIVILEGE_GATING_ENABLED = true`
- Fix D - `hide_title: true` MDX frontmatter so the docs layout doesn't
  double the hero

### Post-§12.10 follow-ups
- Sidebar hidden on `/` + `/path/*` (`displayed_sidebar` removed)
- First-person persona labels ("I'm a learner", "I manage a team", "I'm an
  Author", "I administer the org", "I'm integrating SmartWinnr")
- Responsive `.wrap` (max-width 1180 px + 768 px mobile breakpoint)
- Hero search wired: `<form action="/search">` + `VectorSearch.initialQuery`
  + `useLocation()` reading `?q=` in `src/pages/search.tsx`
- "Open the help bot" CTAs dispatch `smartwinnr:open-chatbot` custom event;
  `ChatBot.tsx` listens and opens
- `/modules/`, `/reference/`, `/release-notes/` made browsable via
  `link: {type: 'generated-index'}` in `sidebars.ts`

### §12.11 Hero redesign
- Removed: search input, `user.orgId` span, `user.region` span
- Kept: greeting, role pill, two CTAs (Open the help bot · Browse modules)
- Background switched from saturated navy gradient to soft pale-purple wash
  using Infima theme tokens (`--ifm-color-primary-lightest`,
  `--ifm-color-primary*`, `--ifm-heading-color`, `--ifm-color-emphasis-*`)
- Dark-mode flip is automatic (Infima vars)
- 640 px mobile breakpoint trims padding + heading size

### Stakeholder-facing mockups
- `plans/mockups/landing-{t1-user,t3-editor,t5-orgadmin}.html` - 3 landing
  mockups (one per tier)
- `plans/mockups/role-{t1..t6}.html` - 6 sidebar mockups (one per tier)
- `plans/mockups/index.html` - surfaces both families

### Project Management module removed (2026-06-09)
- `docs/modules/project-management/` deleted (4 articles + 4 `_category_.json` files)
- 9 redirects pruned from `data/redirects.json`
- References stripped from `RecommendedModules.tsx`, `migrate-ia.js`, `migrate-helpscout.js`
- Module count 13 → 12. Privilege key `projectManagement` retained in
  `data/known-privileges.json` (LMS still has it)

### Dev-mode role switching (§12.12, polished 2026-06-09)
- `/auth/dev-login` route (NODE_ENV-gated): mints a JWT cookie for any
  `role + privileges` combo. **Default flipped 2026-06-09**: `?privileges=`
  omitted/empty → no privileges (exposes upsell flows); `?privileges=*`
  shorthand for all known privileges
- `scripts/dev-mint-cookie.js` - CLI mirror with the same defaults
- `?as=<role>` in-session preview interceptor in `auth/middleware.js`
  (dev mode any cookied user, prod superadmin only)
- `/auth/login` dev strip renders TWO rows: "no privileges" + "all privileges"
- Documented in `CLAUDE.md` → "Dev role switching - test different roles
  without re-logging-in"

### Module access audit + per-module upsell (§12.13, 2026-06-11)
- `scripts/audit-gates.js` - canonical-table validator wired into `prebuild`
- `static/module-overviews.json` - 12-module metadata registry (tagline,
  description, key features, audience, privilege, CTA email)
- `src/components/Modules/ModuleOverview.tsx` + styles - universal landing
  per module: branches on viewer privilege → Get Started cards OR upsell
  block with "Talk to your admin" mailto CTA
- 12 `docs/modules/<m>/index.mdx` - thin MDX wrappers around
  `<ModuleOverview slug="..." />` (9 new + 3 rewritten from static markdown)
- `RecommendedModules.tsx` - locked tiles now navigate to `/modules/<m>/`
  (the upsell page) instead of `#`

### Privilege cascade onto sub-folders (2026-06-11)
- `scripts/cascade-module-privilege.js` - reads each module's privilege
  identity from `static/module-overviews.json` and writes it onto every
  sub-folder's `_category_.json` (49 sub-folders updated)
- Module-root `_category_.json` files no longer carry privilege - they stay
  `ALL_ROLES` so the upsell index is universally reachable
- `for-managers` got a dual gate (see `allPrivileges` below)

### URL guard rewrite: AND-of-all-gates (2026-06-11)
- `server.js` `lookupGate` → `lookupGates`: collects EVERY gate that
  matches the URL (exact frontmatter + every ancestor prefix) and
  AND-combines them. Directory-permission semantics.
- Closes the bug where a deep article's exact frontmatter gate would
  override the parent's privilege gate

### `allPrivileges` schema for `for-managers` (2026-06-11)
- `AccessGate` extended with `allPrivileges?: OrgPrivilege[]` - AND across
  multiple privilege keys (single `privilege` field only ANDs one)
- `for-managers/_category_.json` files now carry **both** `managerView` AND
  the parent module's privilege:
  - Quiz: `{privilege: managerView, allPrivileges: ["quiz"]}`
  - KPI: `{privilege: managerView, anyPrivilege: ["kpi","competitions","achievements"]}`
- `isAllowed()` updated in both `src/access-policy.ts` and
  `shared/access-policy.cjs`
- `scripts/audit-gates.js` + `scripts/validate-privilege-keys.js` updated

### Sidebar visibility fixes (2026-06-11)
- `displayed_sidebar: tutorialSidebar` on every module `index.mdx` so
  Modules tree renders on module pages
- `sidebar_class_name: sw-sidebar-hide` removed from module indexes
  (Docusaurus was propagating it to the whole category)
- `link` removed from module `_category_.json` (was suppressing autogen
  children)
- Net result: clicking Quiz / SmartPath / etc. in the sidebar expands the
  category with all sub-sections (filtered per viewer by the swizzle)

### Path-page entry redirect for locked items (2026-06-11)
- `PathBody.tsx` - when an entry's privilege isn't held by the viewer, the
  link swaps to `/modules/<slug>/` (the module's upsell page) instead of
  the deep article URL (which would just 403)
- Lock pill says "🔒 needs `<privilege>` - see module page"
- Defense-in-depth: URL guard still 403s direct hits on the deep URL

### Flipped `PRIVILEGE_GATING_ENABLED = true` (2026-06-11)
- Both `src/access-policy.ts` and `shared/access-policy.cjs`
- Now active because every category carries the right
  `customProps.privilege` (via the cascade) and the URL guard
  AND-combines correctly

### Persona-led landing - Option C (2026-06-12)
- `src/components/Landing/PersonaDoors.tsx` - new 5-door hero
  (Learner / Manager / Author / Admin / Help), viewer-aware ordering,
  spotlight on primary tier, locked doors render with role-vs-privilege-
  specific copy
- `Landing.tsx` rewritten - door hero replaces the older `Hero` +
  `PersonaGrid` combo; `RecommendedModules` / `WhatsNew` /
  `RecentlyViewed` / `HelpFooter` stay below as a browse surface
- `PathBody.tsx` rewritten - persona-shell hero (icon + breadcrumb +
  Switch lens pill), group-aware `taskGrid` of `taskCard` elements
  (matches `plans/mockups/landing-c-*.html`), bottom mode rail with
  links to other accessible doors
- `PathContent.ts` - added `EntryGroup` type + `GROUPS` registry; manager
  door absorbs Reports ("Reports for your team"), admin door absorbs
  Integrations. `reports` + `integrations` personas marked
  `hiddenFromDoors` but still resolvable for old bookmarks. Added
  optional `icon` to `EntryPoint` (falls back to persona icon)
- Door + persona-shell + taskGrid + mode-rail styles added to
  `styles.module.css` using Infima tokens (dark-mode safe)
- **managerView gate on the Manager door**: `Persona.privilege` field
  added; manager persona carries `privilege: 'managerView'`. New
  `canEnterPersona()` helper in `PathContent.ts` AND-combines `hasMinTier`
  with the persona's privilege check (mirrors `isAllowed`'s
  `PRIVILEGE_GATING_ENABLED` + superadmin bypass). Used by:
  - `PersonaDoors` to decide visible vs locked doors (locked-with-
    privilege copy: "Needs the `managerView` privilege")
  - `PathBody.Inner` + `Fallback` to 403 direct hits on `/path/manager/`
  - `PathBody` mode rail to hide inaccessible doors
- Result: editor+manager without `managerView` no longer sees the
  Manager door nor the manager persona page; with `managerView` added
  they get back in

---

## Chat-logging improvements (deferred)

Group A (identity context — user display name, org id/name, roles,
privileges, chat model) shipped 2026-06-13.
Group B (quality signals) shipped 2026-06-15 alongside the V2 chat
analytics dashboard. Groups C + D remain — captured here so we don't
relitigate the design when picking them back up.

### Group B — Quality signals ✅ done (2026-06-15)

Shipped as part of the V2/V3 chat analytics dashboard.

| Improvement | Status |
|---|---|
| **Distinguish refusal from API-failure fallback** | ✅ shipped — `is_refusal INTEGER DEFAULT 0` column added in migration v3; `server.js` `/api/chat` sets it at write time when search returned nothing or every result was distance ≥ 0.8. `getStats` exposes `refusal_count` alongside `fallback_count`. Dashboard tile renamed "No-docs refusal" with no caveat. |
| **Citation click tracking** | ✅ shipped — `citation_clicks_json TEXT` column on `chat_exchanges` (de-duped JSON array of clicked URLs). `POST /api/chat/:exchangeId/citation-click` accepts root-relative URLs only. `ChatBot.tsx` fires `navigator.sendBeacon` (with `fetch keepalive` fallback) on every citation link click. Aggregated per-URL into the Article Performance table's `CTR` column. |
| **Conversation end signal** | ⚠ partial — explicit `closed_at` tracking was deferred. Instead the abandonment proxy uses single-turn-with-no-thumbs-up, computable from existing data. Sufficient for the V2 dashboard signal; revisit if we want explicit duration / time-to-first-citation-click later. |
| **Top-unanswered queries view** | ✅ shipped — at `/admin/analytics/chat/`. Clusters by normalized query text in JS, filtered on `is_refusal=1 OR is_fallback=1 OR relevance_score<0.3`. Each row has a "Create article" link that opens the authoring wizard pre-filled with the query as the title. |
| **Per-module analytics** | ⏸ deferred — the Article Performance table already groups by URL which gives per-article granularity. A per-module rollup (regex `/modules/<m>/` aggregation) is a future polish. |

### Group C — Privacy hardening

Defer until a stakeholder asks. Today the data is internal,
superadmin-only, 90-day retention.

| Improvement | Detail |
|---|---|
| **Implement PII redaction** | `contains_pii INTEGER DEFAULT 0` column has been reserved since v1 but no scanner runs. Either (a) drop the column, or (b) wire a lightweight regex scrubber on `user_query` ingest (emails, phone numbers, common customer-name patterns). Microsoft Presidio is the heavier alternative if regex isn't enough. Set `contains_pii=1` on the row when matches are found; consider redacting the substring in-place. |
| **Per-user opt-out** | A toggle in the chatbot footer: *"Don't store my questions."* Sets a per-conversation flag; logger respects it and stores only timestamps + token counts. Useful for support engineers / executives whose questions might leak strategy. |
| **Encryption at rest** | SQLite file is plaintext on disk. For a help center this is fine, but if logs ever grow sensitive we'd move to SQLCipher or migrate to a managed encrypted DB. |

### Group D — Operational

Low-effort, low-risk; pick up whenever the operational pain shows.

| Improvement | Detail |
|---|---|
| **Verify Railway volume mount** | `CHAT_LOG_DB_PATH=/app/data/chat-logs.db` - if `/app/data` is NOT on a mounted Railway volume, every redeploy wipes the SQLite file. Verify with `railway run ls -la /app/data` against the live service; if it's ephemeral, attach a 1 GB volume to the path. |
| **S3 / R2 backup of the SQLite file** | `.env.example` already documents `BACKUP_S3_BUCKET` and `CHAT_LOG_BACKUP_INTERVAL_HOURS`; the upload code does NOT exist. Add a `setInterval` that runs a `wal_checkpoint(TRUNCATE)` then uploads the `.db` to S3/R2 every N hours. Cheap insurance against the volume-mount risk above. |
| ~~**Admin chat-analytics page**~~ | ✅ shipped — `/admin/analytics/chat/` lives, V1+V2+V3 done (see status table). |
| **Circuit-breaker alerting** | Today the breaker opens silently after 5 failed writes. Emit a single ERROR log line on open (already done) PLUS a webhook POST to a configurable URL (`CHAT_LOGGER_ALERT_WEBHOOK`). Slack incoming webhook is the easiest integration. |

### Tracking notes

- Each group is independent — pick any order. With Group B shipped,
  the remaining recommended sequence is **D → C** (operational is
  cheap insurance now that the dashboard exists; privacy stays
  defer-until-asked).
- New columns added in any future group should follow the established
  migration pattern: extend `CREATE TABLE` for fresh installs, add an
  idempotent v4+ migration entry (per-statement `statements: []` array,
  caught "duplicate column name" errors continue), AND append to the
  `ENSURED_COLUMNS` list near the top of `db/chat-logger.js` so the
  self-heal pass keeps production schema in sync if the migration log
  ever drifts.
- The current `MIGRATIONS` array lives at the top of `db/chat-logger.js`;
  the runner at `runMigrations()` already handles both legacy `sql:` and
  new `statements:` shapes.

---

## Verification artefacts

Run from the repo root with Node 22 (`nvm use 22`):

```
npm run validate:privileges   # 229 references; expect "OK"
npm run lint:docs             # baseline 940 warnings (matches master)
npm run build                 # expect "SUCCESS"; emits build/doc-gates.json
                              # (86 prefix gates + 267 article gates) and
                              # build/landing-modules.json (13 modules)
```

Manual smoke-test paths:
- `/` - personalized hero, persona cards, recommended modules, what's new
- `/path/<persona>/` - curated entry points (try `editor`, `manager`)
- `/modules/quiz/create-and-manage/how-to-create-a-manual-quiz` - real
  article with sidebar
- Click any persona card · click "Open the help bot" · search via hero
  form · "Forget recents" button after viewing 3 articles

---

## Dev role switching

See **[CLAUDE.md → "Dev role switching"](../CLAUDE.md#dev-role-switching--test-different-roles-without-re-logging-in)** for the canonical
documentation. Three layered shortcuts let devs flip tiers in one click
without the Mailgun magic-link round-trip; all three are disabled in
production builds (`NODE_ENV=production`).
