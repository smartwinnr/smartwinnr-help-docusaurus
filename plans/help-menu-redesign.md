# SmartWinnr Help — Role-Aware Topic Taxonomy (Option B)

## Context

The SmartWinnr help site (`/Users/saicharanreddy/Development/smartwinnr-help-docusaurus`)
today categorizes docs by **role** at the top level (User Guide / Manager Guide /
Administrative Guide), and inside Admin by **module** (16 sub-categories). 270 articles
were imported from Help Scout into this shape. Two pain points have emerged:

1. **Discoverability** — Users hunt by topic ("how do I read this report?") but the
   menu only exposes that information once they've already picked the right role
   shelf and the right module. Modern docs (ClickHouse, Stripe, Vercel) are
   topic-first; SmartWinnr's role-first IA does not scale as more modules ship.
2. **Inconsistent depth per module** — Some modules have 40 flat articles
   (`quiz-module`), others have 4 (`field-coaching-module`). There is no shared
   sub-section template, so editors don't know where to file new how-tos and readers
   can't predict where to find them.

**Intended outcome.** Reorganize the help site so the top-level navigation is **topic-first**
(matching ClickHouse-style docs), enforce **6-tier role gating** (User → Manager → Editor →
Admin → OrgAdmin → Superadmin) through the existing `customProps` access-policy plumbing,
and give every module a uniform sub-shape (Overview · Quickstart · Create & Manage · Assign
· Reports · Settings · Best Practices · FAQs). Roles and org privileges silently hide what
the viewer can't access — they never appear as labels. Manager is treated as a first-class
tier in its own right (not a sub-variant of User) because it has dedicated coaching, team-
dashboard, and reportee-review content that does not appear for plain learners.

The decision was made after side-by-side review of three HTML mockups
(`plans/mockups/index.html`, `plans/mockups/option-a-role-shelves.html`,
`plans/mockups/option-b-clickhouse-style.html`, `plans/mockups/option-c-persona-landing.html`).

---

## Decision log

- **2026-06-11 — Hero redesign.** The shipped Hero used a saturated navy
  gradient that clashed with the site's purple Infima palette and crowded the
  greeting with three low-value items (a duplicate search box, the raw org
  ID, and a region URL). Strip those three; soften the background to a pale
  brand wash; keep greeting + role pill + the two CTAs. Use Infima theme
  tokens so dark mode flips automatically. See §12.11.

- **2026-06-10 — Landing & path pages move from `src/pages/` to `docs/` MDX.**
  Stakeholders flagged three regressions on the LP-1…LP-3 ship:
  (1) the left docs sidebar is missing on `/` and `/path/<persona>/`;
  (2) the path pages render in a narrow content column (looks "mobile");
  (3) curated entry points point at directory URLs instead of articles.
  Root cause for (1) and (2): `src/pages/*.tsx` files use `@theme/Layout`
  which is the bare site shell — no docs sidebar, narrower main column. The
  fix is to convert the landing and the seven persona path pages into MDX
  docs (`docs/index.mdx` + `docs/path/<persona>.mdx`) that import the existing
  React components but render under the docs layout. Root cause for (3): the
  `ENTRIES` table in `src/components/Landing/PathContent.ts` hard-coded
  directory URLs; replace with specific article URLs sampled from the migrated
  tree (every entry now points at a real built page). See §12.10.

- **2026-06-09 — Role-based landing journey (new §12).** Stakeholders approved the
  "Pick a path" persona-card pattern from `plans/mockups/option-b-clickhouse-style.html`.
  Promote it from mockup to a real React landing at `/` that personalizes per role,
  with universal search + chatbot, persona cards, recommended modules, a What's New
  feed, and recently-viewed memory. The existing homepage doc at
  `docs/get-started/overview/index.md` (currently `slug: /`) moves to
  `/get-started/overview/` and the React landing takes the root.

- **2026-06-08 — Module-first IA, audience inside each module.** Resolved the
  Guides-vs-Modules ambiguity: anything about a single module lives under
  `docs/modules/<m>/` with role-aware sub-folders (`for-learners/`, `for-managers/`,
  plus the existing editor+ authoring sub-folders). **Guides** survives only for
  genuinely cross-module workflows. The legacy `docs/guides/learner/` (31 articles)
  and `docs/guides/manager/` (9 articles) get re-bucketed into the right
  `modules/<m>/for-*/` sub-folder. Modules' top-level gate stays at `ALL_ROLES`;
  per-audience gating moves into the sub-folders. See §5.

---

## Completed activities log (as of 2026-06-09)

A point-in-time snapshot of what's already shipped on `feature/help-ia-redesign`,
grouped by the phases declared in this plan. Each item below is committed code in
the working branch (uncommitted; tree is reviewable via `git status`).

### Phase 1 — Foundation ✓ done

- `src/role-constants.ts` — shared role arrays (`ALL_ROLES`, `MANAGER_PLUS_ROLES`,
  `EDITOR_PLUS_ROLES`/`STAFF_ROLES`, `ADMIN_PLUS_ROLES`, `ORGADMIN_PLUS_ROLES`,
  `SUPERADMIN_ROLES`).
- `src/access-policy.ts` extended with `ROLE_TIER` map + `hasMinTier(user, n)`
  helper; later (§12.10) also exported `PRIVILEGE_GATING_ENABLED`.
- `shared/access-policy.cjs` — CommonJS port consumed by `server.js` and
  Docusaurus plugins. Mirrors the TS module by hand.
- `data/known-privileges.json` — 67-privilege snapshot of the LMS enum at
  `smartwinnr_prd/modules/organizations/.../organizations.server.model.js`.
- `scripts/validate-privilege-keys.js` — scans `sidebars.ts`, every
  `_category_.json`, every article frontmatter for `customProps.privilege` /
  `anyPrivilege` values and fails on unknown keys. Wired into `prebuild`.

### Phase 2 — IA scaffolding ✓ done

- `sidebars.ts` rewritten to the 8 topic-first sections. Imports role constants
  from `src/role-constants.ts`. Modules / Reference / Release Notes each carry
  `link: {type: 'generated-index'}` so the bare section URL is browsable.
- 8 section + 13 per-module `_category_.json` files written via
  `scripts/migrate-ia.js`. Each module gate currently set to `ALL_ROLES +
  privilege` so the module appears to learners; audience gating lives in the
  sub-folders.
- 45 sub-section `_category_.json` files generated by
  `scripts/write-subsection-categories.js` (extended) + restamped by
  `scripts/restamp-subsection-gates.js` so every leaf carries the right gate:
  for-learners → ALL_ROLES, for-managers → MANAGER_PLUS_ROLES + managerView,
  authoring → EDITOR_PLUS_ROLES, FAQs → ALL_ROLES.

### Phase 3 — Content migration ✓ done

- `scripts/migrate-ia.js` — `git mv`'d 21 legacy directories into the new
  topic tree (`docs/administration/quiz-module/` → `docs/modules/quiz/`, etc.).
  Emitted initial 244 redirects.
- `scripts/bucket-articles.js` — heuristic classifier moved 174 module articles
  into the 8 canonical sub-folders (Create & Manage / Features / Reports &
  Analytics / Settings / FAQs / etc.).
- `scripts/bucket-guides.js` — explicit-mapping classifier moved 37 of the 43
  legacy `docs/guides/learner/*` + `docs/guides/manager/*` articles into the
  right `docs/modules/<m>/for-{learners,managers}/`. 2 cross-cutting articles
  stay under `docs/guides/`; 2 redundant index files deleted.
- `scripts/compact-redirects.js` — collapsed chained redirects so legacy URLs
  point directly at the final bucketed paths. Final count: 455 entries in
  `data/redirects.json`.
- `@docusaurus/plugin-client-redirects@3.8.1` installed and wired in
  `docusaurus.config.ts` with `/index`-suffix + trailing-slash normalization.
- Index-page slugs rewritten to match the new IA: `docs/modules/ai-coaching/
  index.md` etc. now use absolute slugs like `/modules/ai-coaching/`.

### Phase 4 — Server-side URL guard ✓ done

- `plugins/access-gate-emit.js` Docusaurus plugin emits
  `build/doc-gates.json` (86 prefix gates + 267 article gates) AND
  `build/landing-modules.json` (13 modules with privilege + audience
  metadata) on postBuild. Reads both `.md` and `.mdx` files; respects
  absolute slugs.
- `server.js` URL-guard middleware runs between `requireAuth` and
  `express.static`. Reads `doc-gates.json`, does longest-prefix match,
  returns 403 for unauthorized URL access. Falls open if the gates file is
  missing (dev convenience).

### Phase 5 — Lint + verification ✓ done

- `custom-markdownlint-rules.js` — added `MD-SW-001`
  (`module-sub-section-placement`) accepting the 9 canonical sub-folder
  names. Currently disabled in `.markdownlint-cli2.jsonc` until the
  per-article content pass; the rule is ready to flip.
- Validators clean: `node scripts/validate-privilege-keys.js` exits 0
  (229 references checked); `npm run lint:docs` baseline matches `master`
  (940 warnings, all pre-existing style issues).
- Build: `npm run build` exits 0 cleanly; 30+ rebuilds executed across
  sessions.

### §12 Role-Based Landing Journey ✓ LP-1 → LP-4 shipped (LP-5 deferred)

- **LP-1 / 1.5** — landing page at `/` + 7 persona path pages under
  `/path/<persona>/`. Originally `src/pages/*.tsx`, later moved to
  `docs/index.mdx` + `docs/path/<persona>.mdx` per §12.10.
- **LP-2** — `RecommendedModules` tile grid driven by runtime fetch of
  `landing-modules.json`. Locked modules (org-lacks-privilege) render
  dimmed with "ask your admin" hint. `HelpFooter` added with
  glossary / chatbot / support / release-notes cards.
- **LP-3** — `WhatsNew` feed driven by `static/whats-new.json` registry
  (authors edit JSON, no rebuild needed). Role-filtered.
- **LP-4** — `RecentlyViewed` strip backed by a localStorage ring buffer.
  Pushed via the swizzled `src/theme/DocItem/Layout` on every doc view;
  hidden when the buffer is empty; "Forget recents" button + custom-event
  refresh.
- **LP-5** — **not started** (polish: privilege-off hints with explanation,
  first-time editor onboarding checklist, `?as=` superadmin preview).

### §12.10 Stakeholder-review refinement ✓ done

- **Fix A** — `src/pages/index.tsx` + `src/pages/path/*.tsx` removed.
  Replaced with `docs/index.mdx` + `docs/path/<persona>.mdx` so the docs
  layout (with sidebar) becomes available. `Landing.tsx` + `PathBody.tsx`
  presenter components extracted.
- **Fix B** — All 46 entry hrefs in `PathContent.ts` rewritten to specific
  real article URLs (verified by `/tmp/check-entries.js`).
- **Fix C** — `PRIVILEGE_GATING_ENABLED` exported from `access-policy.ts`;
  yellow "requires X" pills only render when gating is on.
- **Fix D** — `hide_title: true` in MDX frontmatter so the docs layout
  doesn't double the hero greeting.

### Post-§12.10 follow-ups ✓ done (user-driven)

- **Sidebar hidden on landing + path pages** — `displayed_sidebar`
  stripped from all 8 MDX files; sidebar still renders on real doc pages
  (verified: 0 sidebar markers on `/`, `/path/*`; 1 on `/modules/`,
  `/modules/ai-coaching/`, `/reference/`).
- **Persona labels switched to first person** — "I'm a learner",
  "I manage a team", "I'm an Author", "I administer the org",
  "I'm integrating SmartWinnr".
- **Responsive `.wrap`** — `max-width: 1180px`, `width: 100%`, plus a
  `@media (max-width: 768px)` breakpoint trimming padding.
- **Hero search → `/search?q=…`** — `VectorSearch` accepts an
  `initialQuery` prop and auto-runs on mount; `src/pages/search.tsx`
  reads `?q=` via `useLocation()`.
- **"Open the help bot" actually opens it** — `ChatBot.tsx` listens for
  the `window` `smartwinnr:open-chatbot` custom event; Hero + HelpFooter
  CTAs dispatch it; PathBody's help entry also wires through.
- **`/modules/`, `/reference/`, `/release-notes/`** — generated-index
  landings added in `sidebars.ts` so CTAs that "see all" actually
  resolve.

### §12.11 Hero redesign ✓ done

- Stripped the search form, `user.orgId`, and `user.region` spans from
  `Hero.tsx`. Kept greeting + role pill + 2 CTAs.
- Hero panel now uses Infima theme tokens
  (`--ifm-color-primary-lightest`, `--ifm-color-primary`,
  `--ifm-heading-color`, `--ifm-color-emphasis-100/200/300`) so light /
  dark mode auto-flips. Soft pale-purple wash replaces the saturated
  navy gradient. Mobile breakpoint at 640 px tightens padding + heading.

### Mockups (stakeholder-facing) ✓ done

- `plans/mockups/_landing.css` — landing shell styles
- `plans/mockups/landing-{t1-user,t3-editor,t5-orgadmin}.html` — three
  per-tier landings with hero + persona cards + recommended modules +
  what's new + recently viewed
- `plans/mockups/role-{t1..t6}.html` — six per-tier sidebar mockups
  (earlier session)
- `plans/mockups/index.html` — updated to surface both landing + sidebar
  mockup families

### Currently still deferred / not started

- **Typography & font-family parity** with Infima — explicitly out of
  scope per the user; planned as a separate task.
- **LP-5 polish** — privilege-off explanation hints on RecommendedModules,
  first-time editor onboarding checklist, `?as=<tier>` superadmin preview
  query param.
- **Sub-section content classification pass** — the 174 module articles
  were bucketed by filename heuristics. A human content pass would refine
  edge cases (e.g. "how-to-create-a-hotspot-question" currently in
  `features/`, possibly better in `create-and-manage/`). After this,
  flip `MD-SW-001` to enforced.
- **Flip `PRIVILEGE_GATING_ENABLED = true`** in both `src/access-policy.ts`
  and `shared/access-policy.cjs` — only after every category carries the
  correct `customProps.privilege` and every authored article does too.
- **Persona-led landing page (Option C)** — the 8-section card grid
  already gives most of the discoverability benefit; a full
  persona-door entry remains a polish item.
- **Git commits** — the entire tree is uncommitted on
  `feature/help-ia-redesign`. Logical commits to author: foundation,
  IA migration (big rename), sidebars + redirects + server guard,
  landing journey (LP-1..LP-4), Hero redesign + sidebar-hide
  refinement.

---

## Recommended approach

### 1. Top-level IA (ClickHouse-flavored)

A horizontal top-nav strip plus a contextual sidebar. Eight top-level sections:

| # | Section | Audience (after gating) | What lives here |
|---|---|---|---|
| 1 | **Get Started** | All roles | Concept overview, role-specific quickstarts, glossary |
| 2 | **Guides** | All (filtered) | Task-oriented, cross-module how-tos ("Run a quarterly review", "Onboard new sellers") |
| 3 | **Modules** | All (per-module gated) | One sub-tree per product module — uniform sub-shape |
| 4 | **Reports & Analytics** | Manager+ | Learner / Admin / Generated / Automated reports, dashboards |
| 5 | **Integrations** | Admin+ | SSO, SCIM, Azure, Salesforce, xAPI, SCORM, REST API |
| 6 | **Administration** | Admin+ | Users, roles, groups, divisions, privileges, audit, system mgmt |
| 7 | **Reference** | All (filtered) | Roles & privileges reference, glossary, API reference |
| 8 | **Release Notes** | All | Announcements, changelogs |

Each top-level section is itself gated by role; if a viewer's role excludes the entire
section, the tab is hidden from the top nav.

### 2. The 6-tier role model

`SmartWinnrRole` has 7 values in `src/access-policy.ts`. We keep all 7 and formalize a
**6-tier order** for documentation visibility, where `lamadmin` maps onto the
`orgadmin` tier (its closest functional equivalent in the LMS):

```
Tier 1: user         → end-learner content (consume quizzes/paths/feed/coaching)
Tier 2: manager      → tier 1 + team dashboards, coaching reviews, reportee KPIs,
                        1:1 workflows  — a first-class persona, NOT a sub-variant of user
Tier 3: editor       → tier 1 + authoring of every content module + module-level reports
Tier 4: admin        → tier 3 + system administration, users/roles/groups, audit, SSO
Tier 5: orgadmin     → tier 4 + org-wide settings, custom notifications, CRM components,
                        transformation layer, incentive plans  (lamadmin maps here)
Tier 6: superadmin   → unrestricted; bypasses privilege checks
```

The plan refers to these as **T1 … T6**. Each tier is a first-class audience with its
own gated mockup, sidebar shape, and verification step (§4, §10, §11). Tiers are
**cumulative on the role list**, not strictly nested in the LMS — e.g. a user with
roles `['editor','manager']` sees the union of T2 + T3 content (already handled by
the existing `roles.some(...)` check in `isAllowed`).

### 3. Per-role top-level visibility matrix

| Top-level section | T1 user | T2 mgr | T3 editor | T4 admin | T5 orgadmin | T6 superadmin |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Get Started | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Guides | ✓ (cross-module) | ✓ (cross-module) | ✓ (cross-module) | ✓ | ✓ | ✓ |
| Modules | ✓ (for-learners + FAQs leaves only) | ✓ (+ for-managers leaves) | ✓ (+ full authoring leaves) | ✓ (full) | ✓ (full) | ✓ (full) |
| Reports & Analytics | – | ✓ (team only) | ✓ | ✓ | ✓ | ✓ |
| Integrations | – | – | – | ✓ | ✓ | ✓ |
| Administration | – | – | – | ✓ | ✓ | ✓ |
| Reference | ✓ (glossary) | ✓ (+ mgr ref) | ✓ (+ author ref) | ✓ (+ admin ref) | ✓ (+ org ref) | ✓ (all) |
| Release Notes | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

Visibility inside a module is per-sub-folder, not per-module. A learner expanding
**Quiz** sees `Overview`, `Quickstart`, `For Learners`, `FAQs & Troubleshooting`. A
manager additionally sees `For Managers`. An editor additionally sees `Create & Manage
/ Assign & Schedule / Features / Reports & Analytics / Settings & Permissions`.

### 4. Per-role sidebar mockups (annotated)

#### T1 — User (learner)

```
Top nav:  Get Started · Guides · Modules · Reference · Release Notes
─────────────────────────────────────────────────────────────────────
GET STARTED
├── What is SmartWinnr?
├── Quickstart for learners
└── Key concepts

GUIDES   (cross-module workflows only — may be sparse)
└── Your first week as a learner

MODULES   (each module collapsed to its learner-facing leaves)
├── Quiz                                            [priv: quiz]
│   ├── Overview
│   ├── Quickstart
│   ├── For Learners       ← was docs/guides/learner/* (quiz subset)
│   └── FAQs & Troubleshooting
├── SmartPath                                        [priv: smartpaths]
│   ├── Overview · Quickstart · For Learners · FAQs
├── SmartFeed                                        [priv: content]
├── Video Coaching                                   [priv: coaching]
├── AI Coaching                                      [priv: aiCoaching]
├── Survey                                           [priv: survey]
└── KPI & Achievements                               [priv: kpi | achievements]

REFERENCE
├── Glossary
└── Roles you may interact with

RELEASE NOTES
└── What's new for learners
```

#### T2 — Manager (first-class team-lead persona)

Manager is a distinct documentation audience. They consume their own learning
content (T1) **and** drive their team's — coaching reviews, KPI tracking, reportee
performance, 1:1 prep, team competitions. The top nav adds **Reports & Analytics**
(team-scoped) for managers.

```
Top nav:  Get Started · Guides · Modules · Reports & Analytics · Reference · Release Notes
─────────────────────────────────────────────────────────────────────
GET STARTED
├── What is SmartWinnr?
├── Quickstart for managers          ← dedicated landing
└── Key concepts (manager lens)

GUIDES   (cross-module workflows only)
├── Onboarding new reportees
└── Running a quarterly review (quiz + coaching + KPI)

MODULES   (each module shows learner + manager leaves; authoring still hidden)
├── Quiz                                                  [priv: quiz]
│   ├── Overview · Quickstart
│   ├── For Learners        ← take quizzes, view scores
│   ├── For Managers        ← reportee scores, 1:1 prep
│   └── FAQs & Troubleshooting
├── SmartPath · SmartFeed · Video / AI / Field Coaching
├── Survey · KPI & Scorecards · Competitions
└── Achievements & Recognition

REPORTS & ANALYTICS  (scoped to direct + indirect reportees)
├── Reportee learner report                          [priv: learnerReport]
├── Team KPI dashboard
├── Coaching review history
└── Reportee engagement trends

REFERENCE
├── Glossary
├── Manager terminology (reportee, observer, 2nd-level manager)
└── Roles & privileges (manager lens)

RELEASE NOTES
└── What's new for managers
```

#### T3 — Editor (authoring)

```
Top nav adds: Reports & Analytics
─────────────────────────────────────────────────────────────────────
GET STARTED
├── Quickstart for editors

GUIDES
├── Authoring workflows
├── Assignment & scheduling
└── Running reports

MODULES (full sub-shape per module, gated by org privilege)
├── Quiz             [priv: quiz]
│   ├── Overview
│   ├── Quickstart
│   ├── Create & Manage
│   ├── Assign & Schedule
│   ├── Question Types & Features
│   ├── Reports & Analytics
│   ├── Settings & Permissions
│   ├── Best Practices
│   └── FAQs & Troubleshooting
├── SmartPath        [priv: smartpaths]
├── SmartFeed        [priv: content]
├── Video Coaching   [priv: coaching]
├── AI Coaching      [priv: aiCoaching]
├── Field Coaching   [priv: fCoaching]
├── Survey           [priv: survey]
├── Knowledge Hub    [priv: khub]
├── Forms            [priv: forms]
├── KPI & Scorecards [priv: kpi]
├── Competitions     [priv: competitions]
├── Achievements & Rewards
├── Goals · Streaks · XP
└── Notifications & Chat (authoring side)

REPORTS & ANALYTICS
├── Learner reports        [priv: learnerReport]
├── Admin reports          [priv: adminReports]
├── Generated reports      [priv: generatedReports]
├── Automated reports      [priv: automatedReports]
└── Overall dashboards     [priv: overAllDashboards]

REFERENCE
├── Roles & privileges reference
└── Field-mapping reference
```

#### T4 — Admin (= T3 + system administration)

```
Top nav adds: Integrations · Administration
─────────────────────────────────────────────────────────────────────
INTEGRATIONS (admin-side: configuration)
├── Azure AD / SSO            [priv: azureIntegration]
├── SCIM provisioning         [priv: scimIntegration]
├── User auto-integration     [priv: autoUserIntegration]
├── xAPI / LRS                [priv: xApi | xApiIntegration]
├── SCORM                     [priv: scormCourse]
└── Magic-link auth (help site)

ADMINISTRATION
├── Users & roles
├── Groups & metatags
├── Divisions & subdivisions
├── Access permissions
├── Audit log                 [priv: auditLog]
├── Approval flow             [priv: ApprovalFlow]
└── Banner management         [priv: banner]
```

#### T5 — OrgAdmin (= T4 + org-wide tools)

```
ADMINISTRATION adds:
├── Organization settings & privileges    (org-level toggles)
├── Custom notifications                  [priv: customNotifications]
├── Custom tables                         [priv: customTable]
├── CRM components                        [priv: crmComponents]
├── Transformation layer                  [priv: transformationLayer]
├── Schedule notifications                [priv: scheduleNotification]
├── Incentive plans                       [priv: incentivePlans]
├── Project management                    [priv: projectManagement]
├── HR module                             [priv: HR_Module]
├── Secondary sales                       [priv: secondarySales]
└── LAM-admin tooling                     (lamadmin role)

INTEGRATIONS adds:
└── Org-wide integration registry
```

#### T6 — Superadmin

Sees everything T5 sees **plus** every privilege-gated section regardless of the
viewing org's enabled privileges. `superadmin` is already in `PRIVILEGE_BYPASS_ROLES`
in `src/access-policy.ts:59`.

```
ADMINISTRATION adds:
├── Platform-level superadmin operations
├── Cross-org content tools
├── Feature-flag toggles
└── Internal debug & escalation
```

### 5. Per-module sub-section template (audience-stratified)

**Decision (2026-06-08): Module-first IA with role gates inside each module.**

Every article about a specific module lives under `docs/modules/<m>/`, regardless of
who reads it. Audience is expressed by the sub-folder's `_category_.json` gate, not by
a separate top-level section. The module top-level (`docs/modules/_category_.json`) is
open to `ALL_ROLES`; the swizzle hides sub-folders the viewer can't see, so a learner
opening Quiz sees only the leaves marked `[ALL]`.

```
docs/modules/<module-slug>/
├── overview.md                          [ALL]       # plain-English what + when
├── quickstart.md                        [ALL]       # 5-min "use it once"
├── for-learners/                        [ALL]       # consume the module
├── for-managers/                        [MANAGER+]  # review reportees, team views
├── create-and-manage/                   [EDITOR+]   # authoring CRUD
├── assign-and-schedule/                 [EDITOR+]   # distribution
├── features/                            [EDITOR+]   # feature reference
├── reports-and-analytics/               [EDITOR+]   # admin reporting
├── settings-and-permissions/            [EDITOR+]   # configuration
└── faqs-and-troubleshooting/            [ALL]       # cross-audience Q&A
```

Sub-folders without content are omitted on disk; the autogen sidebar skips empty dirs.
Some modules (Forms, KPI authoring, Project Management) legitimately have no
`for-learners/` content — that's fine.

**Resolving the Guides-vs-Modules tension.** Anything about ONE module lives under
Modules with an audience gate. **Guides** survives only for genuinely cross-module
workflows ("Run a quarterly review combining a quiz + coaching", "Onboard a new
editor"). Today Guides may be sparse; that is acceptable.

**Content migration delta from the current tree:**
1. Re-bucket the 31 articles in `docs/guides/learner/` into `docs/modules/<m>/for-learners/`
   (e.g. `how-to-take-the-smartpath-assigned-to-me` → `modules/smartpath/for-learners/`).
2. Re-bucket the 9 articles in `docs/guides/manager/` into `docs/modules/<m>/for-managers/`.
3. Write `for-learners/_category_.json` + `for-managers/_category_.json` per module
   with the right gate (reuse `scripts/write-subsection-categories.js`, extended).
4. Re-open `docs/modules/_category_.json` from `EDITOR_PLUS_ROLES` back to `ALL_ROLES`
   (audience-gating is now inside, so the top tab is safe to show).
5. Keep `docs/guides/_category_.json` at `ALL_ROLES`; let cross-module content land
   there as it's written.
6. Extend `scripts/bucket-articles.js` (the existing classifier) with the for-learners /
   for-managers heuristics, append redirects to `data/redirects.json`, then run
   `scripts/compact-redirects.js` to collapse chains so legacy
   `/guides/learner/<slug>` → `/modules/<m>/for-learners/<slug>` and similar.

The 6-tier access policy, role constants, swizzled sidebar components, server-side URL
guard, and the access-gate-emit Docusaurus plugin are **unchanged** — they already read
`_category_.json` `customProps`, so the new audience sub-folders gate automatically.

Lint rule **MD-SW-001** is extended to accept the two new audience sub-folder names
(`for-learners`, `for-managers`) alongside the existing 7.

### 6. Frontend implementation

#### 6.1 Access-policy extensions (`src/access-policy.ts`)

Extend the existing module **without** breaking the `AccessGate` shape. Reuse
`isAllowed()` (lines 72–98) — it already handles the AND-of-role + privilege logic.

Add a tier helper alongside the existing `SmartWinnrRole` type:

```typescript
// src/access-policy.ts
export const ROLE_TIER: Record<SmartWinnrRole, number> = {
  user: 1,
  manager: 2,
  editor: 3,
  admin: 4,
  lamadmin: 5,
  orgadmin: 5,
  superadmin: 6,
};

export function hasMinTier(user: CurrentUser, min: number): boolean {
  return user.roles.some((r) => (ROLE_TIER[r] ?? 0) >= min);
}
```

This is **additive**. The existing `roles: SmartWinnrRole[]` field in `AccessGate`
keeps working; `hasMinTier` is for shared utility code (top-nav, landing) that
prefers a tier check over enumerating six roles.

Keep `PRIVILEGE_GATING_ENABLED = false` for the first cut so the IA migration ships
independently of privilege enforcement; flip to `true` once authors confirm every
new sub-folder carries `customProps.privilege`.

#### 6.2 Top-nav strip (new theme component)

ClickHouse-style horizontal nav. Add via Docusaurus theme config or a swizzled
`Navbar`. Each entry is gated by `isAllowed`:

```typescript
// src/theme/Navbar/TopNav.tsx (new)
const SECTIONS = [
  { label: 'Get Started',         to: '/get-started',  gate: { roles: ALL_ROLES } },
  { label: 'Guides',              to: '/guides',       gate: { roles: ALL_ROLES } },
  { label: 'Modules',             to: '/modules',      gate: { roles: ALL_ROLES } },
  { label: 'Reports & Analytics', to: '/reports',      gate: { roles: MANAGER_PLUS_ROLES } },
  { label: 'Integrations',        to: '/integrations', gate: { roles: ADMIN_PLUS_ROLES } },
  { label: 'Administration',      to: '/administration', gate: { roles: ADMIN_PLUS_ROLES } },
  { label: 'Reference',           to: '/reference',    gate: { roles: ALL_ROLES } },
  { label: 'Release Notes',       to: '/release-notes', gate: { roles: ALL_ROLES } },
];
```

Reuse role constants from `sidebars.ts` (`ALL_ROLES`, `MANAGER_PLUS_ROLES`,
`STAFF_ROLES`). Add `ADMIN_PLUS_ROLES = ['admin','orgadmin','lamadmin','superadmin']`
to `sidebars.ts` and re-export from a new `src/role-constants.ts` for shared use
(so `sidebars.ts` and `TopNav.tsx` cannot drift).

#### 6.3 Sidebar swizzles — reuse what's already there

The existing swizzles already do the heavy lifting:

- `src/theme/DocSidebarItem/Category/index.tsx` — gates categories
- `src/theme/DocSidebarItem/Link/index.tsx` — gates individual articles
- `src/contexts/UserContext.tsx` — hydrates `currentUser` from `/api/me`
- `src/theme/Root.tsx` — wraps the app in `UserProvider`

No changes required to these files. We only need to reshape `sidebars.ts` and the
`docs/` directory tree. This is the leverage point — all access gates flow through
the existing `customProps` mechanism.

#### 6.4 Reshaped `sidebars.ts`

Replace the current 6 top-level shelves with 8 topic-based ones. Each top-level entry
is an autogenerated subtree pointing at a `docs/<section>/` directory. Example:

```typescript
// sidebars.ts (sketch)
const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'Get Started',
      link: { type: 'doc', id: 'get-started/index' },
      customProps: { roles: ALL_ROLES },
      items: [{ type: 'autogenerated', dirName: 'get-started' }],
    },
    {
      type: 'category',
      label: 'Modules',
      customProps: { roles: ALL_ROLES }, // per-module gating in _category_.json
      items: [{ type: 'autogenerated', dirName: 'modules' }],
    },
    {
      type: 'category',
      label: 'Integrations',
      customProps: { roles: ADMIN_PLUS_ROLES },
      items: [{ type: 'autogenerated', dirName: 'integrations' }],
    },
    // … Administration, Reports, Reference, Release Notes
  ],
};
```

Per-module `customProps` (roles + privilege) move into per-module
`_category_.json` files, e.g.
`docs/modules/quiz/_category_.json`:

```json
{
  "label": "Quiz",
  "collapsible": true,
  "collapsed": true,
  "customProps": {
    "roles": ["user","manager","editor","admin","orgadmin","lamadmin","superadmin"],
    "privilege": "quiz"
  }
}
```

This pushes module-gating data **next to the module's own folder** instead of
centralizing it in `sidebars.ts`. Adding a new module = create a folder with a
`_category_.json`; no `sidebars.ts` edit.

#### 6.5 Landing page

See **§12 Role-Based Landing Journey** for the full design. Short version:
`src/pages/index.tsx` replaces `docs/get-started/overview/index.md` at the `/`
slug and renders a role-aware page (persona cards, recommended modules, what's
new, recently viewed). Reuses `useCurrentUser()`, `isAllowed()`, `hasMinTier()`.

### 7. Backend implementation

#### 7.1 `/api/me` already provides what we need

`/api/me` returns `{ email, roles, region, orgId, privileges }` — read by
`src/contexts/UserContext.tsx`. No backend change required for the IA migration.
The auth/role plumbing in `auth/middleware.js` already enriches `req.user` from the
JWT (`HELP_JWT_SECRET`).

#### 7.2 Server-side URL guard (closes the AUTH_MENU_PLAN.md Phase D gap)

The sidebar hides categories, but `express.static` still serves hand-typed URLs
inside `build/`. To enforce role gating at the URL level, add an Express middleware
between `requireAuth` and `express.static`:

```javascript
// server.js (sketch)
const docGates = require('./data/doc-gates.json'); // generated at build time
app.use((req, res, next) => {
  const gate = matchGate(docGates, req.path); // longest-prefix match
  if (!gate) return next();
  if (!isAllowedServer(gate, req.user)) return res.status(403).render('forbidden');
  next();
});
app.use(express.static('build'));
```

Generate `doc-gates.json` from `sidebars.ts` + `_category_.json` + per-article
frontmatter as a Docusaurus build step (a small plugin under
`plugins/access-gate-emit.js`). Reuse `isAllowed` logic by porting it to a tiny
CommonJS file (`shared/access-policy.cjs`) that both `src/access-policy.ts` and
`server.js` import.

This makes Phase D in `AUTH_MENU_PLAN.md` complete.

#### 7.3 `privileges` enum drift

The privileges enum lives in
`/Users/saicharanreddy/Development/node_projects/smartwinnr_prd/modules/organizations/server/models/organizations.server.model.js`
(~67 entries). To prevent drift between the help site's `customProps.privilege`
values and the source-of-truth enum, add a build-time validator:

- `scripts/validate-privilege-keys.js` reads every `customProps.privilege` /
  `customProps.anyPrivilege` value from `sidebars.ts`, `_category_.json`, and
  article frontmatter, and validates against a static snapshot
  (`data/known-privileges.json`) committed to the help repo. CI fails on unknown
  keys. The snapshot is updated manually when the LMS adds a privilege.

### 8. Content migration

#### 8.1 Directory remap

| Today (`docs/`) | Tomorrow (`docs/`) |
|---|---|
| `overview/`, `getting-started/`, `announcements/` | `get-started/` (consolidated) |
| `user-guide/`, `help-support/`, `troubleshooting/` | `modules/<module>/faqs-and-troubleshooting/` + `reference/help/` |
| `manager-guide/` | `guides/manager/` |
| `administration/quiz-module/` | `modules/quiz/{overview,quickstart,create-and-manage,…}/` |
| `administration/smartpath-module/` | `modules/smartpath/…` |
| `administration/<each-module>/` | `modules/<module-slug>/…` |
| `administration/reports/` | `reports-and-analytics/` |
| `administration/notifications/` | split: `modules/notifications/` (authoring) + `integrations/` |
| `administration/system-management/`, `access-permissions/` | `administration/` |
| `administration/project-management/`, `cross-module-features/` | distribute by topic |

The migration is a one-time `git mv` script plus a top-level `vercel.json`-style
**redirect map** so existing Help Scout links keep working. Docusaurus supports
`@docusaurus/plugin-client-redirects`; add it with a `redirects: [...]` array
generated by the migration script.

#### 8.2 Migration tooling

Reuse `scripts/migrate-helpscout.js` (the canonical authoring path). Extend it to:

1. **Add a "section" axis** alongside the existing `category` mapping. Each Help
   Scout collection maps to (section, module, sub-section).
2. **Emit redirects** for every moved path (old → new) into `static/_redirects` and
   `docusaurus.config.js` redirect plugin config.
3. **Stamp sub-section** into article frontmatter as
   `customProps.subSection: "create-and-manage"` so future regroupings can re-route
   by metadata rather than path.

Run the migration on a feature branch (`feature/help-ia-redesign`); the rollback
plan is reverting the branch — the snapshot branch convention (`backup/pre-…`) in
`CLAUDE.md`'s re-sync runbook already covers this.

#### 8.3 Sub-section uniformity

Not every module has 8 sub-sections of content on day one. The migration writes a
**stub `_category_.json`** for every sub-section that has ≥1 article, and leaves
the rest absent. Lint rule (new, in `custom-markdownlint-rules.js`):

- **MD-SW-001**: any article under `docs/modules/<m>/` must live in one of the 8
  canonical sub-folders, or in the module root for `overview.md` / `quickstart.md`.

### 9. Critical files

| Path | Change |
|---|---|
| `sidebars.ts` | Replace top-level shape; per-module gates move into `_category_.json` |
| `src/access-policy.ts` | Add `ROLE_TIER`, `hasMinTier`; keep `isAllowed` |
| `src/role-constants.ts` (new) | Export `ALL_ROLES`, `MANAGER_PLUS_ROLES`, `STAFF_ROLES`, `ADMIN_PLUS_ROLES` |
| `src/theme/Navbar/TopNav.tsx` (new) | Topic-based top nav with `isAllowed` filter |
| `src/pages/index.tsx` (new or swizzled) | Section-card landing |
| `src/theme/DocSidebarItem/Category/index.tsx` | No change — already gates |
| `src/theme/DocSidebarItem/Link/index.tsx` | No change — already gates |
| `src/contexts/UserContext.tsx` | No change |
| `docs/modules/<m>/_category_.json` (×~13) | New, per module |
| `docs/<section>/_category_.json` (×8) | New, per top-level section |
| `scripts/migrate-helpscout.js` | Extend with section/sub-section axis + redirect emit |
| `scripts/validate-privilege-keys.js` (new) | CI check vs `data/known-privileges.json` |
| `data/known-privileges.json` (new) | Snapshot of LMS privileges enum |
| `plugins/access-gate-emit.js` (new) | Emits `doc-gates.json` from sidebar + frontmatter |
| `shared/access-policy.cjs` (new) | Shared isAllowed for client + server |
| `server.js` | Add URL-guard middleware before `express.static` |
| `custom-markdownlint-rules.js` | Add MD-SW-001 (sub-section placement) |
| `docusaurus.config.js` | Register `@docusaurus/plugin-client-redirects` |

For the ~270 article moves, the pattern is: `git mv docs/administration/<module>/*.md
docs/modules/<module-slug>/<sub-section>/`. Representative examples (not exhaustive):

- `docs/administration/quiz-module/how-to-create-a-quiz.md` → `docs/modules/quiz/create-and-manage/how-to-create-a-quiz.md`
- `docs/administration/reports/how-to-read-the-learner-report.md` → `docs/reports-and-analytics/learner-reports/how-to-read-the-learner-report.md`

### 10. Mockup deliverables

Five role-specific HTML mockups extending the existing `plans/mockups/option-b-*.html`
shell, plus an updated comparison index:

- `plans/mockups/role-t1-user.html`
- `plans/mockups/role-t2-manager.html`
- `plans/mockups/role-t3-editor.html`
- `plans/mockups/role-t4-admin.html`
- `plans/mockups/role-t5-orgadmin.html`
- `plans/mockups/role-t6-superadmin.html`
- `plans/mockups/index.html` — updated to surface the 6 role views

Each mockup reuses `_styles.css`, swaps the `role-pill` text, renders the gated
sidebar for that role, and highlights one representative article so the reader can
see the breadcrumb / top-nav shape.

### 11. Verification

End-to-end checks, in order:

1. **Lint & build** — `npm run lint:docs && npm run typecheck && npm run build`
   passes after the directory move and `sidebars.ts` rewrite.
2. **Privilege key validation** — `node scripts/validate-privilege-keys.js` exits 0;
   add it to `prebuild`.
3. **Per-role sidebar** — start `node server.js`, then visit `/` six times with a
   JWT cookie minted for each tier (use a small `scripts/dev-mint-jwt.js` helper).
   Confirm each tier sees exactly the sections in the matrix above.
4. **URL guard** — with a T1 (user) JWT, hand-type
   `/modules/quiz/settings-and-permissions/` → expect **403**, not the article.
5. **Redirects** — pick 10 randomly-sampled old Help Scout URLs (from
   `scripts/helpscout-inventory.json`) and confirm each 301s to the new path.
6. **Chatbot grounding** — re-run `npm run index-internal` after the move so
   ChromaDB embeddings reference the new paths; spot-check 5 chatbot answers for
   correct citation URLs.
7. **Spot-check 5 articles per top-level section** for correct frontmatter
   (`customProps.subSection`, `customProps.roles`, optional `customProps.privilege`).
8. **Visual regression** — open the 6 role mockup HTML files and confirm each
   matches the shipped behavior.

---

### 12. Role-Based Landing Journey (new)

**Why.** Stakeholders praised the "Pick a path" pattern in
`plans/mockups/option-b-clickhouse-style.html`. We promote it from a static mockup
to a real, runtime-personalized landing at `/` that adapts to the viewer's role
and the org's enabled privileges. The page does five things at once:

1. **Greets** the viewer by name and active role.
2. **Funnels** them into one of N pathways (one card per role-relevant persona).
3. **Surfaces modules** the org has licensed (privilege-aware tile grid).
4. **Highlights what's new** — release notes filtered to the viewer's audience.
5. **Remembers** recently-viewed articles via localStorage.

The page is the **only React-driven route under `/`**; everything below stays
markdown/autogen, so the cognitive cost is contained to one file.

#### 12.1 Page anatomy (top to bottom)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ TOP NAV  (existing — already role-gated)                                      │
│ Get Started · Guides · Modules · Reports · Integrations · Admin · Reference   │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ╭─────────────────────────────────────────────────────────────────────────╮  │
│  │  HERO                                                                   │  │
│  │  "Hi Jane — what would you like to do today?"   [role pill: editor]    │  │
│  │  ┌────────────────────────────────────────────────────────────────┐    │  │
│  │  │ 🔍 Ask anything across SmartWinnr docs                          │    │  │
│  │  └────────────────────────────────────────────────────────────────┘    │  │
│  │  [Open the help bot →]  [Browse all modules →]                         │  │
│  ╰─────────────────────────────────────────────────────────────────────────╯  │
│                                                                               │
│  ┌──────── PERSONA CARDS (role-filtered, ordered by viewer's primary tier) ──┐│
│  │  🎓 I'm a learner          📋 I manage a team        🛠 I author content  ││
│  │  ⚙️ I administer the org   🔌 I'm integrating SW     📊 I want a report  ││
│  └───────────────────────────────────────────────────────────────────────────┘│
│                                                                               │
│  ┌──────── RECOMMENDED FOR YOU (modules the org has + role can access) ──────┐│
│  │  Quiz · SmartPath · SmartFeed · Coaching · Survey · KPI & Scorecards ...  ││
│  └───────────────────────────────────────────────────────────────────────────┘│
│                                                                               │
│  ┌──────── WHAT'S NEW (release-notes, filtered to viewer's audience) ────────┐│
│  │  · Manager dashboard: reportee KPI drill-down redesign   (2d ago)         ││
│  │  · AI Coaching: new skill generator                       (1w ago)        ││
│  └───────────────────────────────────────────────────────────────────────────┘│
│                                                                               │
│  ┌──────── PICK UP WHERE YOU LEFT OFF (localStorage, last 5 articles) ───────┐│
│  │  · Quiz · Create & Manage · How to create a manual quiz  (yesterday)      ││
│  │  · SmartPath · For Learners · How to take an assigned path  (3d ago)      ││
│  └───────────────────────────────────────────────────────────────────────────┘│
│                                                                               │
│  ┌──────── NEED MORE HELP ────────────────────────────────────────────────────┐│
│  │  📚 Glossary    🛟 Open a support ticket    💬 Ask the help bot           ││
│  └───────────────────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────────────────────┘
```

#### 12.2 Per-role pathways

Each persona card opens a **landing-within-landing** at `/path/<persona>/` (a
small static page) listing curated entry points. Card visibility is gated by
`hasMinTier()` so non-applicable cards never render.

| Persona card                  | Visible to (min tier) | Lands on                | Curated entry points                                                                                                                              |
|---|---|---|---|
| 🎓 **I'm a learner**          | T1 user               | `/path/learner/`        | Take a quiz · Walk through a SmartPath · Submit a coaching video · View KPIs & badges · Respond to a survey · Notifications I receive             |
| 📋 **I manage a team**        | T2 manager            | `/path/manager/`        | Read team dashboards · Review coaching submissions · 1:1 prep from KPI + coaching · Drive team competitions · Appreciate / nudge / escalate       |
| 🛠 **I author content**       | T3 editor             | `/path/editor/`         | Create your first quiz / SmartPath / SmartFeed · Assign & schedule · Question types · Read module reports · Authoring best practices              |
| ⚙️ **I administer the org**   | T4 admin              | `/path/admin/`          | Add & manage users · Roles & groups · Divisions · Audit log · Approval flow · Banners · Org-wide settings (orgadmin)                              |
| 🔌 **I'm integrating SW**     | T4 admin              | `/path/integrations/`   | Azure AD / SSO · SCIM provisioning · xAPI / LRS · SCORM · REST API · User auto-integration · Webhook patterns                                     |
| 📊 **I want a report**        | T2 manager            | `/path/reports/`        | Learner reports · Admin reports · Generated reports · Automated reports · Overall dashboards · Per-module report indexes                          |
| 🆘 **I need help**            | T1 user               | `/path/help/`           | Glossary · FAQs · Troubleshooting · Open a support ticket · Ask the help bot · Status page · Release notes                                        |

Cards are rendered **in tier-order with the viewer's primary tier first** so an
editor sees "Author content" before "Be a learner", but still sees the learner
card lower down (because editors are learners too).

#### 12.3 Enhanced features (additive — incremental shipping)

These are layered on top of the base persona-card landing. Each ships
independently; none blocks the others.

| Feature                              | What it does                                                                                                                                                              | Reuses                                                                                              | Priority |
|---|---|---|:-:|
| **Personalized hero**                | Greeting + role pill ("Hi Jane — manager view"); manager who is also editor can flip between active personas via a small dropdown. Persisted in localStorage.            | `useCurrentUser()`                                                                                  | P0       |
| **Persona cards**                    | The 7-card grid above, filtered by `hasMinTier()`.                                                                                                                        | `src/role-constants.ts`, `isAllowed()`                                                              | P0       |
| **Recommended modules**              | Tile grid of modules the org has the privilege for AND the viewer's role can see at least one sub-folder of. Sourced from `build/doc-gates.json` at build time.          | `plugins/access-gate-emit.js`, `shared/access-policy.cjs`                                            | P0       |
| **Universal hero search**            | Bigger search input on the hero — same `VectorSearch` component already on `/search`.                                                                                     | `src/components/VectorSearch/`                                                                      | P0       |
| **Help-bot CTA**                     | One-click "Open the help bot" launches the existing chatbot widget (no nav change). Tracks a click event so we can measure adoption.                                       | `plugins/chatbot-client.js`                                                                          | P1       |
| **What's New**                       | Reverse-chrono list of `docs/release-notes/announcements/*` filtered by article frontmatter `customProps.roles`. Capped at 5; "see all" links to `/release-notes/`.       | `useDocsData()` from `@docusaurus/plugin-content-docs/client`                                       | P1       |
| **Recently viewed**                  | LocalStorage ring buffer of last 10 article visits; render the most recent 5. Cleared with a "forget" button.                                                              | Hook into `useEffect` in a swizzled `DocItem` to push on view                                       | P1       |
| **Persona-led path pages**           | `src/pages/path/<persona>.tsx` — one tiny page per persona card with curated entry points. Each entry point is a link with a one-line intent description.                | Same `useCurrentUser()` + `isAllowed()` for safety check                                            | P1       |
| **Privilege-driven "off" hints**     | If the org doesn't have, say, `aiCoaching`, the AI Coaching tile renders disabled with "Ask your admin to enable AI Coaching" — turns a hidden item into a help moment.   | `currentUser.privileges` from `/api/me`                                                              | P2       |
| **First-time onboarding checklist**  | First-time editors see a dismissible 5-step checklist: create org → invite users → create a quiz → assign → check the report. Stored in localStorage.                     | New component; no backend                                                                            | P2       |
| **Quick role switcher (preview)**    | Superadmins (and orgadmins in dev) can preview the page as any tier via `?as=user` query param. Banner shows "Previewing as user — click to exit". Audit-logged.          | `auth/middleware.js` allow-list of bypass roles                                                      | P3       |
| **Cross-org banner** (status, holidays) | Pinned top-of-page banner driven by `data/banner.json`. Empty file → no banner. Roles + privileges respected.                                                          | New JSON read at build time; same gate type                                                          | P3       |

#### 12.4 Implementation approach

**Step 1 — Free up the `/` slug.**
- `docs/get-started/overview/index.md`: change `slug: /` → `slug: /get-started/overview/`.
- Add a redirect entry `{from: '/', to: '/'}` is unnecessary — but
  `{from: '/overview', to: '/'}` already exists in `data/redirects.json`.
- Verify by checking `data/redirects.json` after the slug change: any legacy
  redirect that pointed at `/get-started/overview` now points at the right URL.

**Step 2 — Create `src/pages/index.tsx`.**

```tsx
import React from 'react';
import Layout from '@theme/Layout';
import {useCurrentUser, useUserState} from '@site/src/contexts/UserContext';
import {hasMinTier} from '@site/src/access-policy';
import Hero from '@site/src/components/Landing/Hero';
import PersonaGrid from '@site/src/components/Landing/PersonaGrid';
import RecommendedModules from '@site/src/components/Landing/RecommendedModules';
import WhatsNew from '@site/src/components/Landing/WhatsNew';
import RecentlyViewed from '@site/src/components/Landing/RecentlyViewed';
import HelpFooter from '@site/src/components/Landing/HelpFooter';

export default function Landing(): JSX.Element {
  const user = useCurrentUser();
  const {loading} = useUserState();
  return (
    <Layout title="SmartWinnr Help" description="Personalized SmartWinnr help center">
      <Hero user={user} loading={loading} />
      <PersonaGrid user={user} />
      <RecommendedModules user={user} />
      <WhatsNew user={user} />
      <RecentlyViewed />
      <HelpFooter />
    </Layout>
  );
}
```

**Step 3 — Build the six landing-section components.** Each lives in
`src/components/Landing/<Name>/index.tsx` with co-located CSS modules. They are
stateless except for `RecentlyViewed` (localStorage) and `Hero` (active-persona
dropdown). All gating runs through `isAllowed()` / `hasMinTier()` from
`src/access-policy.ts`.

**Step 4 — Recently-viewed instrumentation.** Swizzle `src/theme/DocItem/Layout`
to push `{title, url, viewedAt}` into `localStorage['sw.recently-viewed']` on
mount. Cap at 10. Skip if user opts out via a small "Forget recents" button on
the landing.

**Step 5 — Persona path pages.** `src/pages/path/learner.tsx` etc. Each is a
~40-line component reading a static array of `{label, href, blurb}` from
`src/components/Landing/PathContent.ts`. Centralizing content makes it
trivial to revise without touching components.

**Step 6 — Data: which modules to recommend?** Read `build/doc-gates.json` at
build time and emit a `static/landing-modules.json` mapping
`{module: {privilege, hasLearner, hasManager, hasEditor, hasAdmin}}`. The
`RecommendedModules` component filters by the viewer's privileges + role. New
postBuild step in `plugins/access-gate-emit.js`.

**Step 7 — What's-new feed.** Use the existing
`@docusaurus/plugin-content-docs/client` `useDocsData()` to grab all docs under
`release-notes/` at build time. Filter by frontmatter `customProps.roles`.

#### 12.5 Mockup deliverables

Create three new HTML mockups under `plans/mockups/`. They reuse `_styles.css`
and `_role-shell.css`. The pager at the top of each one cross-links the others.

- `plans/mockups/landing-t1-user.html` — what a plain learner sees
- `plans/mockups/landing-t3-editor.html` — what an editor sees (the default
  "interesting" view because it surfaces the most personas)
- `plans/mockups/landing-t5-orgadmin.html` — the fullest view with all 7 personas
  plus org-wide tooling

The existing `option-b-clickhouse-style.html` stays as the unauthenticated
reference. The new files add: personalized hero with the active-role pill,
recommended modules tile grid with privilege gating, the what's-new feed, and
the recently-viewed strip.

#### 12.6 Critical files

| Path | Change |
|---|---|
| `docs/get-started/overview/index.md` | `slug: /` → `slug: /get-started/overview/` |
| `data/redirects.json` | Manual review of any redirect whose `to` was `/` |
| `src/pages/index.tsx` (new) | Top-level page component (composition only) |
| `src/components/Landing/Hero/{index.tsx,styles.module.css}` (new) | Greeting + search + active-persona switcher |
| `src/components/Landing/PersonaGrid/{index.tsx,...}` (new) | 7-card grid filtered by `hasMinTier` |
| `src/components/Landing/RecommendedModules/{index.tsx,...}` (new) | Tile grid driven by `static/landing-modules.json` |
| `src/components/Landing/WhatsNew/{index.tsx,...}` (new) | Release-notes feed, role-filtered |
| `src/components/Landing/RecentlyViewed/{index.tsx,...}` (new) | localStorage-backed ring buffer |
| `src/components/Landing/HelpFooter/{index.tsx,...}` (new) | Glossary, support, bot |
| `src/components/Landing/PathContent.ts` (new) | Single source of truth for per-persona link lists |
| `src/pages/path/{learner,manager,editor,admin,integrations,reports,help}.tsx` (×7, new) | One per persona |
| `src/theme/DocItem/Layout/index.tsx` (new swizzle) | Push viewed-article into localStorage |
| `plugins/access-gate-emit.js` | Extend postBuild to also emit `static/landing-modules.json` |
| `plans/mockups/landing-{t1,t3,t5}.html` (×3, new) | Fresh stakeholder-facing mockups |
| `plans/mockups/index.html` | Surface the 3 new landing mockups next to the role-tier mockups |

#### 12.7 Phasing (incremental rollout)

| Phase | Shipping unit                                                                                                       | Acceptance |
|---|---|---|
| LP-1  | Free `/` slug, render `src/pages/index.tsx` with Hero + PersonaGrid only.                                            | All 7 cards render at the right tiers; clicks land on `/path/<persona>/` stubs. |
| LP-2  | Add `RecommendedModules` (reads `static/landing-modules.json`) + `HelpFooter`.                                       | Editor with org-quiz-enabled sees Quiz tile; user without `aiCoaching` does not. |
| LP-3  | Add `WhatsNew` + persona path pages with curated entry points.                                                       | Manager sees manager-flagged release notes; user does not. |
| LP-4  | Add `RecentlyViewed` (swizzle `DocItem/Layout`) + active-persona switcher (multi-role users).                        | Open 3 articles, return to `/`, see them listed reverse-chrono. |
| LP-5  | Polish: privilege-off hints, onboarding checklist, `?as=` preview for superadmins.                                   | Superadmin can preview "as user" and see exactly the T1 landing. |

#### 12.8 Verification (landing-specific)

Adds to §11 above:

9.  **Cold-start render** — visit `/` with no JWT cookie; landing shows
    `UNAUTH_USER` view (= same as T1), then re-hydrates within ~150 ms once
    `/api/me` resolves; no admin-flash → snap-shrink (already handled by
    `UNAUTH_USER` default).
10. **Per-tier persona visibility** — mint a JWT for each tier T1–T6 (using
    `scripts/dev-mint-jwt.js`) and screenshot the landing; compare to the new
    mockup HTML files in §12.5.
11. **RecommendedModules accuracy** — flip a single privilege (e.g.
    `aiCoaching`) on/off in a test JWT and confirm the AI Coaching tile
    appears/disappears within the next page load (no rebuild needed).
12. **Recently viewed** — visit 3 articles, return to `/`, confirm they appear
    in reverse-chrono order; click "Forget recents" and confirm the strip
    empties (and survives a reload).
13. **What's new filter** — publish a release note with
    `customProps.roles: [admin]` and verify a T1 user does not see it in the
    feed.
14. **Search & chatbot CTAs** — confirm the hero search opens
    `/search?q=...` and the chatbot CTA opens the existing widget without
    routing.
15. **Path-page server guard** — hand-type `/path/admin/` as T1; expect 403
    (the existing `doc-gates.json` middleware already gates anything we list
    there, but verify the path pages emit `customProps.roles` in their
    frontmatter-equivalent via `Layout`).

#### 12.9 Per-tier landing wireframes

Each wireframe shows what a viewer at that tier sees on `/`. Cards are ordered by
relevance to the primary tier. Privilege-gated tiles (Quiz, AI Coaching, etc.)
also fall off if the org hasn't licensed them.

**T1 — User (learner)**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Hi Jane — what would you like to do today?         [pill: learner]          │
│ [🔍 Ask anything…]                                                           │
│ [Open the help bot →]  [Browse modules →]                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ PICK A PATH                                                                 │
│ ┌──────────────┐ ┌──────────────┐                                           │
│ │ 🎓 Be a      │ │ 🆘 I need    │                                           │
│ │   learner    │ │    help      │                                           │
│ └──────────────┘ └──────────────┘                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ RECOMMENDED MODULES (learner leaves only)                                   │
│ [📝 Quiz] [🛤 SmartPath] [📺 SmartFeed] [🎥 Video Coaching] [🤖 AI Coaching] │
│ [📋 Survey] [🏆 KPI & Achievements]                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ WHAT'S NEW FOR YOU                                                          │
│ · AI Coaching mobile improvements    · KHub: recent + trending revamp       │
├─────────────────────────────────────────────────────────────────────────────┤
│ PICK UP WHERE YOU LEFT OFF                                                  │
│ · How to take an assigned SmartPath  · How to submit a coaching video       │
└─────────────────────────────────────────────────────────────────────────────┘
```

**T2 — Manager**
```
Hi Mark — managing 6 reportees    [pill: manager] [switch view ▾]
PICK A PATH
[📋 Manage a team]  [🎓 Be a learner]  [🆘 Need help]
RECOMMENDED MODULES (each shows for-learners + for-managers)
[📝 Quiz] [🛤 SmartPath] [🎥 Video Coaching] [🤖 AI Coaching]
[🏆 KPI & Scorecards] [📋 Survey] [📺 SmartFeed]
WHAT'S NEW FOR YOU
· Manager dashboard: reportee KPI drill-down redesign
· Coaching review history filter improvements
PICK UP WHERE YOU LEFT OFF — your last 5 articles…
```

**T3 — Editor**
```
Hi Eve — authoring for Acme Sales   [pill: editor] [switch view ▾]
PICK A PATH
[🛠 Author content]  [📊 Want a report]  [🎓 Be a learner]  [🆘 Need help]
RECOMMENDED MODULES (full sub-shape per module)
[📝 Quiz] [🛤 SmartPath] [📺 SmartFeed] [🎥 Video Coaching] [🤖 AI Coaching]
[🚗 Field Coaching] [📋 Survey] [📚 Knowledge Hub] [🧾 Forms]
[🏆 KPI & Scorecards] [🏁 Competitions] [🔔 Notifications]
WHAT'S NEW FOR YOU
· Quiz: bulk question import via CSV   · SmartPath learning sessions: duration
RECENTLY VIEWED
· Quiz · Create & Manage · How to create a manual quiz
· SmartPath · Features · Module + segment structure
```

**T4 — Admin**
```
Hi Alex — admin at Acme Sales      [pill: admin]
PICK A PATH
[⚙️ Administer the org]  [🔌 Integrate SmartWinnr]  [🛠 Author content]
[📊 Want a report]  [📋 Manage a team]  [🎓 Be a learner]  [🆘 Need help]
RECOMMENDED MODULES (full)  +  ADMIN QUICK ACTIONS
[👥 Users & roles] [🗂 Groups & metatags] [🏛 Divisions] [🛡 Audit log] [📜 Banners]
WHAT'S NEW FOR YOU
· SCIM provisioning v2  · Azure AD: app registration walkthrough
```

**T5 — OrgAdmin**
```
Hi Olivia — org admin (Acme + 2 child orgs)   [pill: orgadmin]
PICK A PATH
[⚙️ Administer the org]  [🔌 Integrate SmartWinnr]  [📊 Want a report]
[🛠 Author content]  [📋 Manage a team]  [🎓 Be a learner]  [🆘 Need help]
ORG-WIDE TOOLS (new strip — orgadmin/lamadmin only)
[🏢 Org privileges] [🔔 Custom notifications] [🔄 Transformation layer]
[💼 Incentive plans] [🧩 CRM components] [👤 HR module] [💰 Secondary sales]
RECOMMENDED MODULES (full)
```

**T6 — Superadmin**
```
Sasha — superadmin   [pill: superadmin]  [Previewing as ▾]
SUPERADMIN OPS (highlighted strip at top)
[🛡 Platform ops] [💬 Cross-org chat logs] [🧪 Debug & diagnostics] [🔍 Gate inspector]
PICK A PATH  (all 7 cards visible)
RECOMMENDED MODULES (all modules visible regardless of viewing org privileges —
PRIVILEGE_BYPASS_ROLES applies here)
```

Wireframes are intentionally compact; visual fidelity lives in the HTML mockup
files (§12.5). The HTML mockups inherit `_styles.css` from
`plans/mockups/`, so colors, spacing, and typography match the role-tier mockups
that were already approved.

#### 12.10 Refinement after stakeholder review (2026-06-10)

Three regressions surfaced in the live LP-1…LP-3 ship; each has a small,
self-contained fix. Font/typography differences are explicitly **out of scope**
here (separate, dedicated task).

##### Fix A — Render the landing & path pages under the docs layout (restores left sidebar)

The current implementation lives in `src/pages/index.tsx` and
`src/pages/path/<persona>.tsx`. Docusaurus' `@theme/Layout` (used by anything
under `src/pages/`) is the bare site shell — no docs sidebar, narrower main
column. Solution: move the page bodies into MDX docs that import the existing
React components.

**Steps:**

1. Delete `src/pages/index.tsx` and the seven files under `src/pages/path/`.
2. Create `docs/index.mdx`:
   ```mdx
   ---
   id: landing
   title: SmartWinnr Help
   slug: /
   sidebar_class_name: "sw-sidebar-hide"
   ---
   import Landing from '@site/src/components/Landing/Landing';
   <Landing />
   ```
3. Create `docs/path/<persona>.mdx` (×7) — one per persona, e.g.
   `docs/path/editor.mdx`:
   ```mdx
   ---
   id: path-editor
   title: Author content
   slug: /path/editor/
   customProps:
     roles: [editor, admin, orgadmin, lamadmin, superadmin]
   ---
   import PathBody from '@site/src/components/Landing/PathBody';
   <PathBody slug="editor" />
   ```
4. Extract the JSX bodies of `src/pages/index.tsx` and
   `src/components/Landing/PathPage.tsx` into thin presenter components
   `src/components/Landing/Landing.tsx` and `src/components/Landing/PathBody.tsx`
   that **omit** the `<Layout>` wrapper (MDX provides the layout) and the
   `BrowserOnly` fallback (SSR can render the unauthenticated view directly
   from `UNAUTH_USER`).
5. **Hide the landing + path docs from the sidebar.** They are reachable by URL
   but should not appear as sidebar items.
   - Add a small CSS rule in `src/css/custom.css`:
     ```css
     .menu__list-item:has(.sw-sidebar-hide),
     .theme-doc-sidebar-item-link.sw-sidebar-hide { display: none; }
     ```
   - Apply `sidebar_class_name: "sw-sidebar-hide"` to each MDX frontmatter.
6. **Customise sidebar selection for path pages.** Because each persona page
   is the entry point for a journey, set `displayed_sidebar: tutorialSidebar`
   (the existing global sidebar) so the docs tree is visible alongside.

##### Fix B — Point every persona entry-point at a real article

`src/components/Landing/PathContent.ts` currently maps to module **directory
URLs** (e.g. `/modules/quiz/create-and-manage/`). Rewrite to specific built
article slugs. Concrete mapping (verified against the migrated tree):

| Persona      | Entry label                       | New `href`                                                                              |
|---|---|---|
| learner      | Take a quiz                       | `/modules/quiz/for-learners/how-to-answer-long-answer-type-questions-in-smartwinnr`     |
| learner      | Walk through a SmartPath          | `/modules/smartpath/for-learners/how-to-take-the-smartpath-assigned-to-me-in-smartwinnr`|
| learner      | Submit a coaching video           | `/modules/video-coaching/for-learners/how-do-i-upload-a-coaching-video`                  |
| learner      | Practice AI Coaching              | `/modules/ai-coaching/for-learners/how-can-a-user-submit-an-ai-coaching-attempt`         |
| learner      | Engage with SmartFeed             | `/modules/smartfeed/for-learners/how-do-i-like-and-comment-on-a-smartfeed`              |
| learner      | View your KPI scorecard           | `/modules/kpi-gamification/for-learners/how-do-i-view-the-kpi-scorecard`                |
| learner      | Respond to a survey               | `/modules/survey/` (no learner-facing leaf yet — module home)                            |
| learner      | Manage your notifications         | `/modules/notifications/for-learners/how-to-view-notifications`                          |
| manager      | Read team dashboards              | `/reports-and-analytics/legacy/team-analytics`                                           |
| manager      | Review reportee coaching          | `/modules/video-coaching/for-managers/what-is-my-team-coaching`                          |
| manager      | 1:1 prep from KPI + coaching      | `/modules/kpi-gamification/for-managers/how-do-managers-track-the-kpi-scorecard-results-in-the-smartwinnr-app` |
| manager      | Track reportee quizzes            | `/modules/quiz/for-managers/how-to-find-the-progress-of-your-team-in-quizzes`            |
| manager      | Approve a form submission         | `/modules/forms/for-managers/how-managers-approve-form`                                  |
| editor       | Create your first quiz            | `/modules/quiz/create-and-manage/how-to-create-a-manual-quiz`                            |
| editor       | Build a SmartPath                 | `/modules/smartpath/create-and-manage/how-to-add-learning-sessions-in-smartpath-module` |
| editor       | Author SmartFeed content          | `/modules/smartfeed/create-and-manage/how-to-create-a-smartfeed`                         |
| editor       | Set up Video Coaching             | `/modules/video-coaching/create-and-manage/how-to-create-field-coaching`                 |
| editor       | Configure AI Coaching             | `/modules/ai-coaching/features/what-is-ai-coaching`                                      |
| editor       | Design a survey                   | `/modules/survey/create-and-manage/how-to-create-a-survey`                               |
| editor       | Build forms & scorecards          | `/modules/forms/create-and-manage/how-to-create-a-form`                                  |
| editor       | Configure KPIs                    | `/modules/kpi-gamification/create-and-manage/how-to-add-a-challenge-to-the-competition` |
| admin        | Add & manage users                | `/administration/system-management/create-users-individually`                            |
| admin        | Access permissions                | `/administration/access-permissions/how-do-i-give-access-permission-to-other-editors`    |
| reports/help | (link to section index is acceptable since these pages are aggregation hubs)            |                                                                                          |
| help         | Glossary                          | `/reference/`                                                                            |
| help         | Help & support                    | `/reference/help-support/`                                                                |
| help         | Troubleshooting                   | `/reference/troubleshooting/`                                                            |
| help         | Release notes                     | `/release-notes/`                                                                         |

**Hardening:** add a build-time check in `plugins/access-gate-emit.js` (or a
new `scripts/validate-path-content.js`) that loads `PathContent.ts` and asserts
every `entries[].href` either matches a key in `build/doc-gates.json#exact`
or is a known section URL ending in `/`. Fail the build if any entry is dead.

##### Fix C — Suppress "requires X" hints while privilege gating is off

In `src/components/Landing/PathPage.tsx` (and the new `PathBody.tsx`), the
yellow `requires <X>` pill is currently shown whenever the user's
`privileges` array does not include the entry's privilege. With
`PRIVILEGE_GATING_ENABLED = false` in `src/access-policy.ts:70`, the
viewer's privileges field may be empty even when the org actually has the
feature licensed — so the hint is misleading.

Solution: read the same flag from `shared/access-policy.cjs` (already exported)
and gate the hint render on it:
```tsx
import {PRIVILEGE_GATING_ENABLED} from '@site/src/access-policy';
const showPrivilegeHints = PRIVILEGE_GATING_ENABLED;
const locked = showPrivilegeHints && !!e.privilege && !privileges.includes(e.privilege);
```
Export `PRIVILEGE_GATING_ENABLED` from `src/access-policy.ts` (currently a
file-local const — flip to `export const`). When `false`, the pill never
shows; when `true`, only entries the org truly lacks are dimmed with the hint.

##### Fix D — Drop bespoke header on the landing

When the landing is an MDX doc, the docs layout already provides a title
header. The greeting/hero remains inside the `<Landing />` component but
needs no separate `<h1>` — Docusaurus' page title is derived from
`title: SmartWinnr Help` in frontmatter. Strip the `<Layout title="..." />`
prop hand-rolling that was needed for `src/pages/index.tsx`.

##### Out of scope (acknowledged, separate task)

- **Fonts and typography parity.** The Landing components currently use
  system fonts via `_styles.module.css`. Docusaurus' Infima theme uses its
  own type stack. Aligning the Landing CSS module with the global theme
  (or moving its overrides to use `var(--ifm-font-family-base)` and
  `var(--ifm-heading-color)`) is a dedicated UI polish task.

##### Critical files (delta from §12.6)

| Path | Change |
|---|---|
| `docs/index.mdx` (new) | Replaces `src/pages/index.tsx`; `slug: /`; imports `<Landing />` |
| `docs/path/<persona>.mdx` (×7, new) | Replaces `src/pages/path/<persona>.tsx`; carries role gate in frontmatter |
| `src/components/Landing/Landing.tsx` (new) | Presenter — composes Hero · PersonaGrid · RecommendedModules · WhatsNew · HelpFooter without `<Layout>` |
| `src/components/Landing/PathBody.tsx` (new) | Presenter — replaces the body of `PathPage.tsx`, no `<Layout>` |
| `src/pages/index.tsx` (deleted) | — |
| `src/pages/path/*.tsx` (deleted, ×7) | — |
| `src/components/Landing/PathContent.ts` | Rewrite every `href` per Fix B table |
| `src/components/Landing/PathPage.tsx` (deleted) | Superseded by `PathBody.tsx` |
| `src/access-policy.ts` | Export `PRIVILEGE_GATING_ENABLED` (currently file-local) |
| `src/css/custom.css` | Add `.sw-sidebar-hide` rule |
| `scripts/validate-path-content.js` (new, optional) | Build-time check that every entry resolves to a built page |

##### Verification additions (extends §11)

16. **Sidebar present on landing & path pages** — visit `/` and `/path/editor/`;
    confirm the same left-side docs sidebar renders as on any module page.
17. **Entry-point clicks land on real articles** — open `/path/editor/`, click
    each entry; verify each navigates to a built `.html` page that has content
    (not a category index with only sub-folder links).
18. **No yellow "requires X" pills with gating off** — confirm with the current
    `PRIVILEGE_GATING_ENABLED = false`. Flip the flag locally to verify the
    pills come back when gating is on.
19. **Sidebar items hidden** — the landing and path pages should NOT appear as
    sidebar links anywhere (no "SmartWinnr Help" or "Author content" entries
    in the autogen tree).

#### 12.11 Hero redesign (2026-06-11)

**Why.** The current hero uses a saturated navy gradient (`#2e5cb8 → #1f3d80`)
that clashes with the site's actual brand palette
(`--ifm-color-primary: #8b5cf6`, purple) and reads as too "loud" against the
rest of the page. Three pieces of content on the hero are also redundant or
out of place:

- **Search input** — duplicates the global navbar search (`⌘K`); users
  already have a discoverable, fast search path.
- **Org ID** (e.g. `Org: 64b9031d0a46a470954f02f2`) — a database identifier
  no real user knows or cares about.
- **Region** (e.g. `Region: http://localhost:3000`) — currently shows the
  raw region URL, not a friendly label; misleading and unhelpful.

**What stays.** Personalized greeting (`Hi <Name> — what would you like to
do today?`), the role pill (`learner` / `editor` / etc.), and the two
existing CTAs (Open the help bot · Browse modules).

**Visual direction.** Move from a dark filled banner to a **soft,
brand-aligned panel** that uses Infima theme tokens so dark mode auto-flips:

```
┌─────────────────────────────────────────────────────────────────────┐
│  [editor]                                                            │
│                                                                      │
│  Hi Sai — what would you like to do today?                          │
│                                                                      │
│  [💬 Open the help bot]  [📚 Browse modules]                          │
└─────────────────────────────────────────────────────────────────────┘
```

- Background: a subtle wash — either
  `var(--ifm-color-primary-lightest)` (very pale purple) or a near-white
  card with a thin left accent bar in `var(--ifm-color-primary)`. The plan
  recommends the **pale purple wash** for warmth without losing the
  emphasis.
- Heading: dark text (`var(--ifm-heading-color)`), 26-28 px, weight 700.
- Role pill: white background with a 1 px purple border + purple text —
  reads as a tasteful chip rather than a frosted-glass capsule.
- CTAs: primary button uses solid `var(--ifm-color-primary)` filled with
  white text (standard Infima button); secondary uses an outlined variant.
  Both reuse Infima's `.button` / `.button--primary` semantics where
  possible so they pick up the global hover/focus states.
- Padding compresses from `36 32 32` to `28 28 24`; bottom margin trims to
  `20`.
- Box-shadow softens from `rgba(31, 61, 128, 0.18)` to
  `rgba(0, 0, 0, 0.04)` (or removed entirely if the wash provides enough
  visual lift).

**Dark mode.** All colors are expressed as Infima CSS variables, so the
panel auto-flips:
- Light: pale-purple wash, dark text.
- Dark: faint dark-purple wash (Infima's primary-lightest in dark mode is
  `#c4b5fd` — works as a thin accent line; use
  `var(--ifm-color-emphasis-100)` for the panel background).

**Files to touch.**

| Path | Change |
|---|---|
| `src/components/Landing/Hero.tsx` | Delete the `<form>` search block and the two `<span>`s reading `user.orgId` / `user.region`. Keep greeting, role pill, CTAs. |
| `src/components/Landing/styles.module.css` | Rewrite `.hero` + `.hero h1` + `.hero .rolePill` + `.hero .cta*` selectors to use Infima tokens; delete `.hero .search` + `.hero .search input` + `.hero .search::before`. |

**Out of scope here.** Global font-family alignment with Infima — that is
the dedicated typography task already deferred.

**Verification.**

20. **Hero contains no search input** — `grep "<input" build/index.html`
    finds no input at the top of the page.
21. **No Org / Region text** — `grep -E "Org:|Region:" build/index.html`
    returns nothing.
22. **Palette aligned** — visit `/`; the hero panel uses the same purple
    family as the rest of the site (link color, focus ring, primary
    buttons in deep doc pages).
23. **Dark mode** — toggle the navbar's light/dark switch; the hero
    background swaps without unreadable contrast or hard-coded white text.
24. **CTA hierarchy** — primary "Open the help bot" reads as the active
    call to action; secondary "Browse modules" reads as a quieter
    alternative.

- Migrating the `manager` and `lamadmin` role definitions in the LMS itself.
- Rewriting article bodies for style / Diátaxis tone — that is a separate content
  pass (the existing `DOCUMENTATION-UPDATE-PLAN.md`).
- Localizing menu labels — current Docusaurus i18n setup is unchanged.
- Adding a new privilege to the LMS enum. We **read** it; we do not extend it.

## What is **deferred** (next iteration)

- Persona-led landing page (Option C). The 8-section card grid on the home page
  already gives most of the benefit; a full persona-door landing can be layered on
  later without further IA changes.
- Server-side privilege gating (flip `PRIVILEGE_GATING_ENABLED` to `true`). Ship
  the IA first, then enable privilege filtering once every category carries the
  right `customProps.privilege`.
