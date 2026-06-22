# 06. Frontend tasks

**Version:** 1.0 | **Last Updated:** June 2026

**Audience:** Engineers modifying the React app, theme, sidebar, ChatBot, admin pages, or the authoring wizard.

---

## Table of contents

1. [Where frontend code lives](#where-frontend-code-lives)
2. [The Docusaurus swizzle model](#the-docusaurus-swizzle-model)
3. [Task: modify a swizzled theme component](#task-modify-a-swizzled-theme-component)
4. [Task: change the sidebar](#task-change-the-sidebar)
5. [Task: add a new admin page](#task-add-a-new-admin-page)
6. [Task: touch the ChatBot widget](#task-touch-the-chatbot-widget)
7. [Task: work on the authoring wizard](#task-work-on-the-authoring-wizard)
8. [Task: add a custom Docusaurus plugin](#task-add-a-custom-docusaurus-plugin)
9. [Icons: no emojis](#icons-no-emojis)
10. [Styling conventions](#styling-conventions)
11. [Hydrating user state](#hydrating-user-state)

---

## Where frontend code lives

```
src/
├── components/                    Custom React components
│   ├── ChatBot/                   The Wynnie widget
│   ├── Landing/                   Homepage persona doors + module strip
│   ├── Modules/                   Per-module landing page (ModuleOverview)
│   ├── Article/                   FeedbackFooter, MetaChip, RelatedStrip
│   ├── VectorSearch/              Navbar semantic search bar
│   └── admin/                     Wizard sub-components
├── theme/                         Swizzled Docusaurus components
│   ├── Root.tsx                   Wraps the app in UserProvider
│   ├── DocSidebarItem/            Role-gated sidebar entries
│   ├── DocCard/                   Module-aware card icons
│   ├── DocCategoryGeneratedIndexPage/   Custom landing for /modules/
│   ├── SearchBar/                 Vector-search aware navbar bar
│   ├── Navbar/MobileSidebar/      Lucide-icon mobile nav
│   └── SmartPaginator/            Skips gated docs in prev/next
├── pages/
│   ├── admin/
│   │   ├── authoring/             3-step wizard UI
│   │   ├── analytics/{chat,feedback}.tsx  Dashboards
│   │   └── digests.tsx            Digest subscription admin
│   └── (other top-level pages)
├── contexts/
│   └── UserContext.tsx            /api/me hydration
├── access-policy.ts               isAllowed(), role tiers, privilege bypass
├── lib/                           Misc shared utilities
└── css/
    └── custom.css                 Global theme tokens

plugins/
├── chatbot-plugin.js              Injects chatbot-client.js
├── chatbot-client.js              Mounts <ChatBot/> outside Root
└── access-gate-emit.js            Build-time URL-guard table

docusaurus.config.ts               Site config; plugin list
sidebars.ts                        Top-level sidebar tree
```

---

## The Docusaurus swizzle model

Docusaurus ships with default React components for every theme element
(sidebar items, breadcrumbs, search bar, footer, etc.). To customize one,
**swizzle** it — make a copy of the original under `src/theme/<path>/`
and Docusaurus uses your copy instead of the default.

### How to swizzle

```bash
npm run swizzle
# Pick the component when prompted. Choose "Wrap" or "Eject":
#   Wrap   — your file renders the default + your additions. Use when
#            you only need to add behavior around the default.
#   Eject  — your file fully replaces the default. Use when you need to
#            change rendering or props.
```

Most of this project's swizzles are **Eject** because they enforce
gating logic that doesn't compose well as a wrapper.

### How to find what's already swizzled

```bash
find src/theme -name "index.tsx"
```

Each file is one swizzled component. If your customization target is
already there, edit the existing one. If not, swizzle it and add a
docstring at the top explaining **why**.

### Swizzle conventions in this repo

Every swizzled component has a top-of-file comment explaining:

1. **What** the original component does.
2. **Why** we swizzled it (the specific behavior the default lacks).
3. **Which Docusaurus version** it was forked from (so future
   maintainers know if upstream has drifted).

Stick to this pattern. The next person upgrading Docusaurus needs to
know what to diff.

---

## Task: modify a swizzled theme component

### Sidebar gating example

`src/theme/DocSidebarItem/Category/index.tsx` is the swizzled
DocSidebarItemCategory. It reads `customProps.{roles, privilege,
anyPrivilege}` from the category's `_category_.json` and calls
`isAllowed(gate, user)` to decide whether to render at all.

Pattern:

```tsx
import {useCurrentUser} from '@site/src/contexts/UserContext';
import {isAllowed} from '@site/src/access-policy';

export default function DocSidebarItemCategory(props) {
  const user = useCurrentUser();
  const gate = props.customProps;
  if (gate && !isAllowed(gate, user)) return null;
  return <OriginalCategory {...props} />;
}
```

### Two important rules

1. **Never gate on raw `user.roles`** — always go through
   `isAllowed()`. The function handles edge cases (multi-role users,
   `superadmin` bypass, `anyPrivilege` semantics) that you'd duplicate
   incorrectly.
2. **The sidebar swizzle is layer 1 of 2.** The URL guard
   (`server.js` middleware) is layer 2. Both must agree. If you hide an
   entry in the sidebar but the URL is reachable directly, you've broken
   defense-in-depth.

---

## Task: change the sidebar

### The default behavior

`sidebars.ts` defines the top-level sidebar tree:

```ts
const sidebars: SidebarsConfig = {
  docsSidebar: [
    'overview/welcome',
    {type: 'category', label: 'Get started', items: [...]},
    {type: 'autogenerated', dirName: 'modules'},
    ...
  ],
};
```

Anything under `dirName: 'modules'` is **autogenerated** — Docusaurus
walks `docs/modules/` and builds the tree from `_category_.json` files +
article frontmatter (`sidebar_position`).

### How to add a new top-level entry

Most of the time you don't. Instead:

- Adding a new module under `docs/modules/foo/` shows up automatically
  in the autogenerated section.
- Adding a new top-level area (e.g. a `docs/help-support/`) requires a
  `sidebars.ts` change.

When you do edit `sidebars.ts`:

```ts
// before
{type: 'autogenerated', dirName: 'modules'},

// after
{type: 'autogenerated', dirName: 'modules'},
{
  type: 'category',
  label: 'Compliance',
  link: {type: 'generated-index'},
  items: [{type: 'autogenerated', dirName: 'compliance'}],
  customProps: { roles: ['admin'] },
},
```

### How to reorder

Set `sidebar_position` in `_category_.json` or in article frontmatter.
The Help Scout re-sync preserves human-set positions, but inserts new
items at the natural alphabetical order. If reordering after a re-sync,
edit the JSON/frontmatter and commit.

### How to hide a category from a role

Set `customProps.roles` on the `_category_.json`. The swizzled sidebar
hides it; the URL guard (after build) returns 403 on direct URLs. Both
gates are derived from the same `customProps`.

---

## Task: add a new admin page

### Pattern

Every admin page follows the same shape:

```tsx
// src/pages/admin/your-thing.tsx
import React from 'react';
import Layout from '@theme/Layout';
import {useCurrentUser, useIsUserReady} from '@site/src/contexts/UserContext';
import {Redirect} from '@docusaurus/router';

export default function AdminYourThing() {
  const ready = useIsUserReady();
  const user = useCurrentUser();

  // 1. Wait for UserContext to hydrate.
  if (!ready) return <Layout><p>Loading…</p></Layout>;

  // 2. Hide from non-superadmin (404 effectively).
  if (!user.roles?.includes('superadmin')) return <Redirect to="/" />;

  // 3. Render.
  return (
    <Layout title="Your Thing">
      <main className="container margin-vert--lg">
        <h1>Your Thing</h1>
        {/* ... */}
      </main>
    </Layout>
  );
}
```

### What this gives you for free

- **URL:** `/admin/your-thing/` (Docusaurus routes `src/pages/admin/your-thing.tsx`
  there automatically).
- **Auth:** the URL guard 403s anyone without the cookie at the
  server level. The role check inside the component is belt-and-
  suspenders for `manager`/`editor`/`admin` (who can sign in but
  shouldn't see admin pages).
- **Layout chrome:** navbar, footer, theme tokens — all from `<Layout>`.

### Server-side pair

If your page calls an API, add the route in `server.js` and gate it
with `requireRole('superadmin')`. See
[05-tasks-backend.md](./05-tasks-backend.md#task-add-a-new-api-route).

> **Trap.** `Redirect` from `@docusaurus/router` works on the client but
> initial-render auth flicker may briefly show the page. The
> `useIsUserReady()` guard prevents that — always include it.

---

## Task: touch the ChatBot widget

### Architecture

```
docusaurus.config.ts
  plugins: ['./plugins/chatbot-plugin.js']
    └─ chatbot-client.js   (client module — runs on every page load)
         └─ mounts <ChatBot/> in its own React root (#smartwinnr-chatbot-root)
              └─ src/components/ChatBot/ChatBot.tsx — the actual widget
```

### Why a separate React root

The main app's `Root.tsx` wraps everything in `UserProvider`, which
blocks render until `/api/me` returns. Mounting `<ChatBot/>` outside
`Root.tsx` means it loads independently and fetches `/api/me` itself.
This way:

- The widget loads at the same time as the page content (faster perceived
  load).
- A `/api/me` failure doesn't take down the docs (or vice versa).
- The widget can mount on routes Docusaurus doesn't know about (e.g.
  the swizzled `/auth/login`).

### Common changes

**Change the prompt** — edit `prompts/wynnie.md`. Server reads it per
request; no rebuild needed for prompt-only changes.

**Change the widget UI** — edit `src/components/ChatBot/ChatBot.tsx`.
Hot reload works under Mode A; under Mode B you need `npm run build`.

**Change retrieval / ranking** — that's backend (`server.js`'s
`/api/chat`), not the widget. See
[05-tasks-backend.md](./05-tasks-backend.md#task-change-the-chatbot-prompt-or-retrieval).

**Change the floating button icon** — `WynnieMark` component. Plain SVG
inline; matches the Lucide-style stroke we use everywhere else.

### Citations

The widget renders citations with `BookOpen` Lucide icon and `[1]`-style
references. Each citation is a link to a `/docs/...` URL — which goes
through the URL guard on click, so a stale citation from before a gating
change just 403s. Defense-in-depth.

---

## Task: work on the authoring wizard

### UI

Three React pages compose the wizard:

```
src/pages/admin/authoring/
├── index.tsx       Step 1 (where + who) + state machine + step renderer
├── edit.tsx        Edit an existing article (same UI, pre-filled)
├── drafts.tsx      Draft list page
└── modules.tsx     CRUD for data/modules.json (the picklist)
```

The state machine lives in `index.tsx`. Each step is a sub-component
under `src/components/admin/authoring/`.

### Backend endpoints (in `server.js`)

| Endpoint | Purpose |
|---|---|
| `POST /api/admin/authoring/generate` | LLM generation. System prompt = `prompts/author-article.md`. |
| `POST /api/admin/authoring/suggest-field` | "Suggest a new title/description" inline buttons. |
| `POST /api/admin/authoring/save` | Save with canonical-frontmatter validation. |
| `POST /api/admin/authoring/save-raw` | Save without re-validating (escape hatch). |
| `POST /api/admin/authoring/publish` | Remove draft flag + (optionally) push to GitHub. |
| `POST /api/admin/authoring/upload` | Image upload to `static/img/helpscout/authored/`. |
| `POST /api/admin/authoring/deploy` | Manual trigger for the GitHub-push deploy step. |
| `GET /api/admin/authoring/deploy/state` | Current deploy queue state. |
| `GET /api/admin/authoring/articles` | List articles in `docs/`. |
| `GET /api/admin/authoring/drafts` | List drafts. |
| `GET /api/admin/authoring/modules` | Read `data/modules.json`. |

All gated with `requireRole('superadmin')`.

### When you're changing the LLM behavior

Edit `prompts/author-article.md`. The system prompt is loaded per
request — no restart. Test with the **Suggest a new title** button on
any draft.

### When you're changing the canonical frontmatter

The schema is enforced in three places. Update **all three** in lock-step:

1. **`prompts/author-article.md`** — tell the LLM the new shape.
2. **`server.js` `/api/admin/authoring/save`** — the validator.
3. **`AUTH_MENU_PLAN.md` §C1** — the human-facing spec.

A drift between these is the most common cause of "the wizard saves a
valid article that fails the next build."

### When publishing seems to no-op

Check, in order:

1. `AUTHORING_GIT_PUSH` is `true` (it's `false` by default).
2. `GIT_PUSH_TOKEN` has Contents: R/W on the repo.
3. The debounce window (`AUTHORING_DEPLOY_DEBOUNCE_MS`, default 30 min)
   hasn't been triggered by a recent publish.
4. `GET /api/admin/authoring/deploy/state` shows what the queue is
   doing.

---

## Task: add a custom Docusaurus plugin

Docusaurus has a plugin system; we use it sparingly.

```
plugins/
├── chatbot-plugin.js        Injects chatbot-client as a client module
└── access-gate-emit.js      Emits build/doc-gates.json at build time
```

### When to write a plugin

- You need to **run code at build time** (e.g. emit a file the runtime
  reads). `access-gate-emit.js` is the canonical example.
- You need to **inject a global React component** (e.g. the ChatBot
  widget on every page). `chatbot-plugin.js` is the canonical example.
- You need to **add a new content type** (rarely; the autogenerated
  sidebar covers docs).

Don't write a plugin for a one-off page — that's what `src/pages/` is
for.

### Plugin shape

```js
// plugins/my-plugin.js
module.exports = function (context, options) {
  return {
    name: 'my-plugin',
    async loadContent() { /* fetch + return data */ },
    async contentLoaded({content, actions}) { /* register routes etc. */ },
    async postBuild({siteConfig, outDir}) { /* emit files into outDir */ },
    getClientModules() { return ['./my-client.js']; },
    configureWebpack(config, isServer, utils) { /* alias / loader tweaks */ },
  };
};
```

Then register it in `docusaurus.config.ts` under `plugins: [...]`.

---

## Icons: no emojis

The site uses **Lucide stroke icons** in React, not emojis. The husky
pre-commit hook enforces this with the `no-decorative-emojis`
markdownlint rule.

### When to use which icon

```ts
import {Sparkles, ClipboardCheck, Route, BookOpen, ...} from 'lucide-react';
```

| Surface | Pattern |
|---|---|
| Per-module tile (homepage strip, /modules/ index) | `MODULE_ICON_BY_SLUG` in `src/lib/module-icons.ts` |
| Persona door (homepage) | `PERSONAS[i].icon` in `src/components/Landing/PathContent.ts` |
| Sub-section card (`/modules/<m>/` page) | `CARD_ICONS` in `src/components/Modules/ModuleOverview.tsx` |
| Mobile nav | `src/theme/Navbar/MobileSidebar/PrimaryMenu/index.tsx` |
| Inline icons in admin pages | direct Lucide import |

### Icon styling rules

- **Size:** 20-24px for tiles, 16px inline, 12-14px in small spaces.
- **Stroke width:** `2` for most use; `1.75` for visually quieter use.
- **Color:** `--ifm-color-primary-darker` (#6d28d9 — brand purple) for
  brand emphasis. `--ifm-color-emphasis-500` for muted/disabled.
- **Container:** `display: inline-flex; align-items: center;` — no
  `font-size` (icons don't inherit font-size like emojis did).

### When the rule does not apply

The `no-decorative-emojis` rule only fires on **markdown** decoration.
Inside React strings and TypeScript code, emojis aren't checked. But
the convention is consistent — no emoji icons anywhere user-facing.

---

## Styling conventions

The site uses Docusaurus's default Infima CSS framework + a custom
theme layer:

| File | Purpose |
|---|---|
| `src/css/custom.css` | Global theme tokens (`--ifm-color-primary`, fonts, etc.) |
| `src/components/<X>/styles.module.css` | Component-scoped CSS Modules |
| `src/theme/<X>/styles.module.css` | Swizzle-scoped CSS Modules |

### Color tokens

```
--ifm-color-primary:         #8b5cf6   /* the brand purple */
--ifm-color-primary-darker:  #6d28d9   /* icons, links */
--ifm-color-primary-darkest: #5b21b6   /* hover */
```

Use these tokens. Don't hard-code hex values. The dark-mode override
lives in the same file with a `[data-theme='dark']` selector.

### Font

`Inter` (variable font) for sans; `JetBrains Mono` for code blocks.
Defined in `src/css/custom.css` with `@font-face`.

### Spacing

Custom spacing scale at the top of `src/css/custom.css`:
`--space-1` (4px) through `--space-12` (96px). Use these tokens instead
of raw pixel values.

---

## Hydrating user state

The single source of truth for "who is the viewer?" on the client is
`src/contexts/UserContext.tsx`. It exposes two hooks:

```tsx
import {useCurrentUser, useIsUserReady} from '@site/src/contexts/UserContext';

const ready = useIsUserReady();   // boolean — has /api/me returned yet?
const user = useCurrentUser();    // { email, roles, region, orgId, orgName,
                                  //   privileges, displayName }
```

### Pattern

```tsx
function MyGatedThing() {
  const ready = useIsUserReady();
  const user = useCurrentUser();
  if (!ready) return <Skeleton />;
  if (!user.roles?.includes('admin')) return null;
  return <TheActualContent user={user} />;
}
```

**Always check `useIsUserReady()` first.** Before the fetch completes,
`user` is a default-everything object (`{ roles: [], ... }`) that will
fail every role check — causing a flicker where the gated content
briefly disappears before re-rendering. The `ready` guard prevents the
flicker.

### Outside `Root.tsx`

The ChatBot widget and `/auth/login` are outside `Root.tsx` and don't
have access to `UserContext`. They fetch `/api/me` directly. If you
build another such surface (e.g. an embedded widget in another site),
follow the same pattern — don't try to share `Root.tsx`'s context.

---

Next: [07-deploy.md](./07-deploy.md) →
