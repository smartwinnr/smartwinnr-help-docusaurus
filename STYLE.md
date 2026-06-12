# SmartWinnr Help - Style Guide

One page. Scan it before writing or rewriting an article. Linters enforce
most of these; the rest are conventions the reviewer will catch.

---

## Voice & tone

- **Direct, friendly, ≤20 words per sentence.** `short-sentences` lint
  flags long ones.
- **You = the reader.** "You'll click **Save**…" - not "the user
  clicks…".
- **No marketing copy.** No "delight", "seamless", "magical",
  "best-in-class".
- **No throat-clearing.** Skip "Welcome", "This article will explain",
  "In this guide". Get to the point in sentence one.
- **Active voice.** "Click **Save**" - not "The Save button should be
  clicked".
- **Positive framing.** Tell readers what to do, not what to avoid.
  `positive-framing` lint enforces.
- **American English.** "color", not "colour"; "behavior", not
  "behaviour". `american-english` lint enforces.
- **No decorative emojis** in prose. (Persona doors / module cards are
  a different surface - they're product UI, not copy.)

## Article shape

Every article follows §15.1 of `plans/help-menu-redesign.md`. The skeleton:

```markdown
---
id: <stable-id>
title: "Action-led, Title Case"
description: "One sentence, 110–160 chars, plain prose."
slug: kebab-case-slug
sidebar_position: <integer>
last_update: { date: YYYY-MM-DD, author: <name> }
customProps: { roles: [...], privilege: <key> }
tags: [1-to-5-from-controlled-vocab]
---

> **At a glance** - optional 1–2 sentence TL;DR for multi-step how-tos.

A two-sentence lede answering "what is this for, and when do I use it?"

## When to use this
## Before you start    ← skip if none
## Steps
### 1. <action>
### 2. <action>
### 3. <action>
## Tips
## Things to know       ← edge cases, warnings via admonitions
## What's next          ← 2–3 relative .md links
```

Rules of thumb:

- **Title**: starts with a verb or question word ("How to…",
  "What is…", "Why does…"). `action-oriented-titles` lint enforces.
- **Description**: required, ≤160 chars, single sentence, plain prose
  (no markdown).
- **Lede**: ≤3 sentences. Answers what + when.
- **Headings**: h2 for sections, h3 for numbered steps. Never h4+.
- **UI elements bold**: `**Save**`, `**File → Export**`.
  `ui-element-formatting` lint enforces.
- **Cross-links**: relative `.md` paths only.
  `[How to assign a quiz →](../assign-and-schedule/how-to-assign-a-quiz.md)`.
  Never absolute URLs to the live help site.

## Admonitions

Four types only:

```markdown
:::tip
For shortcuts and "you can also…" power-user nudges.
:::

:::note
For clarifications, edge cases that aren't dangerous.
:::

:::warning
For irreversible actions and gotchas.
:::

:::caution
For data loss, charges, security implications. Used sparingly.
:::
```

Skip `:::info` (too vague) and `:::danger` (overdramatic for our domain).

## Screenshots

- **Size**: 1280 px wide, PNG, captured at 100 % browser zoom.
- **Annotate** in brand purple (`#8b5cf6`) when calling out UI elements.
- **Alt text required**, semantic, ≤140 chars.
  "Question editor with the **Pass mark** field highlighted" - not
  "screenshot-1" or "image".
- **Storage**: `static/img/helpscout/<collection-slug>/<article-slug>-<n>.<ext>`.
  Referenced as `/img/helpscout/<collection-slug>/<article-slug>-<n>.<ext>`.
- **One image per step**. More than that - the step is doing too much.

## Tags - controlled vocabulary

Pick 1–5 from this list. Extend deliberately (PR review).

```
quiz, smartpath, smartfeed, video-coaching, ai-coaching,
field-coaching, survey, knowledge-hub, forms, kpi, gamification,
reports, notifications, settings, admin, troubleshooting,
billing, onboarding, mobile, web, integration
```

## Quick checklist before you commit

- [ ] Frontmatter complete (`description`, `tags`, `customProps`)
- [ ] Lede ≤ 3 sentences, no "This article will…"
- [ ] Every UI element bold
- [ ] Every screenshot has semantic alt text
- [ ] At least one cross-link in **What's next**
- [ ] `npm run lint:docs` passes
- [ ] `npm run build` passes
