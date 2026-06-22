# SmartWinnr Help Center — Developer Guide

**Version:** 1.0 | **Last Updated:** June 2026

**Audience:** Engineers contributing to the SmartWinnr Help Center codebase.

---

## What this guide is

A task-oriented developer guide. It teaches you to **find and change** the
code that ships the help center, without having to ask "where is X?" or
"how do I add Y?"

It is **not** a marketing overview, an end-user manual, or a
hand-wavy architecture talk. Everything here points at real files,
real commands, and real failure modes you will hit.

If you only have 10 minutes, read [01-overview.md](./01-overview.md) and
the **Where everything lives** section. That alone is enough to navigate
the repo with confidence.

---

## Reading order

| Order | Page | Why read it |
|---|---|---|
| 1 | [01-overview.md](./01-overview.md) | The 30-second mental model. Read first. |
| 2 | [02-setup-and-run.md](./02-setup-and-run.md) | Get the site running locally with a signed-in user. |
| 3 | [03-architecture.md](./03-architecture.md) | The request lifecycle, middleware order, data stores. |
| 4 | [04-tasks-content.md](./04-tasks-content.md) | Add or edit articles, modules, frontmatter. Re-index. |
| 5 | [05-tasks-backend.md](./05-tasks-backend.md) | Add an API route, gate it, write to SQLite. |
| 6 | [06-tasks-frontend.md](./06-tasks-frontend.md) | Swizzle a theme component, add an admin page, touch the wizard. |
| 7 | [07-deploy.md](./07-deploy.md) | Ship a change to Railway. |
| 8 | [08-debugging.md](./08-debugging.md) | Symptom → diagnosis matrix for the failure modes that actually happen. |
| 9 | [09-reference.md](./09-reference.md) | Quick-lookup: roles, env vars, scripts, file paths, API endpoints. |

If you're tackling a specific task, jump straight to the matching tasks
page. Each task page is self-contained.

---

## Audience matrix — what to read first

| You are… | Read in this order |
|---|---|
| **A new engineer onboarding** | 01 → 02 → 03 → then whichever tasks page matches your first ticket. |
| **Adding or editing articles** | 01 → 02 → 04. |
| **Adding a new API endpoint or modifying auth** | 03 → 05. |
| **Modifying the sidebar, theme, ChatBot, or an admin page** | 03 → 06. |
| **Shipping a change to production** | 07. |
| **Debugging a bug in prod** | 08, then 09 for cross-references. |
| **A reviewer of someone else's PR** | 03 for context, 09 for the file map. |

---

## How this guide relates to the other docs at the repo root

This developer guide is the **task-oriented** layer. Three sibling docs
provide deeper or different angles:

| Doc | What it covers | Read when |
|---|---|---|
| [../README.md](../README.md) | High-level project README. Audience: anyone landing on the GitHub page. | First touch. |
| [../CLAUDE.md](../CLAUDE.md) | The densest survey of the codebase. Audience: Claude Code sessions, but also engineers who want one-shot context. | Anytime you want a "what is everything?" refresher. |
| [../ARCHITECTURE.md](../ARCHITECTURE.md) | End-to-end system architecture. Audience: someone designing a new system that talks to this one, or doing a deep RAG / indexing / auth audit. | Before a major architectural change. |
| [../RAILWAY_DEPLOYMENT.md](../RAILWAY_DEPLOYMENT.md) + [../RAILWAY_ENVIRONMENT_VARIABLES.md](../RAILWAY_ENVIRONMENT_VARIABLES.md) | Production deploy mechanics. | Before your first deploy, or when adding an env var. |
| [../AUTH_MENU_PLAN.md](../AUTH_MENU_PLAN.md) | The canonical article frontmatter (§C1) and role-based menu plan. | When adding a new module or category. |
| [../SmartWinnr-Help-Style-Guide.md](../SmartWinnr-Help-Style-Guide.md) | Content style rules (voice, formatting). Loaded by content scripts. | When writing articles or running content-quality scripts. |

---

## Conventions used in this guide

Each page follows the same structure:

- **Header:** "Version / Last Updated / Audience" line.
- **Table of contents** when the page has more than four sections.
- **What / Why / How** as the dominant section pattern. *What* the
  thing is, *why* it exists, *how* to work with it.
- **Code blocks** show real commands and file content. Paths are absolute
  from the repo root (e.g. `src/components/ChatBot/ChatBot.tsx`).
- **Callouts** for non-obvious gotchas:

  > **Note.** Used for important context.
  > **Trap.** Used for "the obvious thing is wrong" surprises.
  > **Why this exists.** Used to record load-bearing decisions.

- **Cross-links** between guide pages always use relative paths so the
  guide is portable.

When this guide and the source disagree, **trust the source**. Open an
issue (or just fix the doc) so the next person doesn't get burned.

---

## Where to start

[01-overview.md](./01-overview.md) →
