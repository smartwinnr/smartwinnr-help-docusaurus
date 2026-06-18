---
id: what-is-scenario-lifecycle
title: "What is Scenario Lifecycle?"
description: "As AI Role Play becomes a bigger part of training, it matters more that the *right* version of a scenario reaches learners — and that nothing half-finished slip"
slug: what-is-scenario-lifecycle
sidebar_position: 999
last_update:
  date: 2026-06-17
  author: Sheri Deekshith Reddy
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
  privilege: coaching
tags: [video-coaching, ai-coaching]
draft: false
---

> **At a glance** - The Scenario Lifecycle ensures that only the right versions of AI Role Play scenarios reach learners, providing clarity and control throughout the creation process.

The Scenario Lifecycle is a structured process that governs how AI Role Play scenarios move from initial draft to live experience. It tracks every change, maintains a clear status at all times, and enforces assignment rules to protect learners from unfinished content. The same lifecycle applies to every video coaching type in SmartWinnr so drafting, reviewing, publishing, and archiving a coaching works the same way across the board.

## When to use this

Use the Scenario Lifecycle when creating or managing AI Role Play scenarios in SmartWinnr. It is essential for ensuring that:

- You want to maintain clarity on the status of your scenarios.
- You need to track changes and decisions made throughout the scenario's lifecycle.
- You want to ensure that only finished scenarios are assigned to learners.
- You are involved in reviewing or approving scenarios.

## Why the Scenario Lifecycle exists

As AI Role Play becomes a larger part of training, it is crucial that the *right* version of a scenario reaches learners and that nothing half-finished slips out by accident. Previously, scenarios were either "saved" or "not saved," lacking clear signals about their readiness and making it difficult to track changes over time.

The Scenario Lifecycle introduces a **governed journey**. Each scenario carries a visible **status** at all times, maintains a complete **history** of its content and decisions, and is governed by **assignment rules** that determine who can access it based on its completeness.

### Where it all happens — the Scenario Lifecycle Management page

The Scenario Lifecycle Management page is the single place to manage your scenarios. You can submit, approve or request changes, publish, archive or unarchive, and view both Version and Status History. Access this page from the scenario's **⋮ menu** to see all the lifecycle actions in one convenient location.

![](/img/helpscout/authored/what-is-scenario-lifecycle-mqj1adpa.png)
## The five statuses, explained

A scenario is always in exactly one status and moves through them **in order** — it cannot jump ahead. For example, a Draft cannot become Published without being submitted, reviewed, and approved first.

| Status | What it really means | Can it be edited? | Who can be assigned to it |
|--------|----------------------|-------------------|---------------------------|
| **Draft** | A work in progress — you're still writing and shaping it. | Yes | Demo users only |
| **In Review** | You've handed it off and it's waiting for someone to check it. | Yes (any edit sends it back to Draft) | Demo users only |
| **Approved** | It's been checked and signed off, and is queued to go live. | Yes | Demo users only |
| **Published** | It's **live** — this is the version learners use. | Yes — each edit creates a new version | **Everyone** |
| **Archived** | Retired; kept for the record but out of active use. | No (must be unarchived first) | **Nobody** |

### Two ideas worth understanding

- **Demo users.** A *demo user* is a practice account. Assigning a not-yet-published scenario to a demo user allows you and your reviewers to run the role play and experience it as a learner would — without it counting for real people or appearing in real reporting. Think of it as a dress rehearsal. (See *Setting up demo users* below for how to create them.)
- **The "live" version.** Once a scenario is published, the **published version** is the single source of truth for learners. Even if you keep editing afterward, the most recent published version is what they see, ensuring ongoing edits do not disrupt learners who are mid-way through.

![](/img/helpscout/authored/what-is-scenario-lifecycle-mqj1b0kd.png)

## Setting up demo users

Testing every scenario with demo users before publication is essential, so it helps to set a few up in advance.

**Only Org Admins can mark or unmark demo users.** There are two ways to do this:

- **From a single user's profile.** Open the user, then use the **⋮ (more options) menu** → **Mark as Demo User**. To reverse it later, the same menu offers **Remove as Demo User**.
- **From the Users list, in bulk.** Select one or more users and choose **Make As Demo Users** (or **Remove As Demo Users**) from the bulk actions. This is the quickest way to set up several test accounts at once.

A few helpful details:

- Demo users are clearly marked with a **"Demo User"** badge wherever they appear.
- You can **filter** the Users list by the **Demo User** status to see who's currently a demo user.
- Marking and unmarking is **recorded for audit**, providing a record of who changed a user's demo status and when.

> **Tip:** Keep a small, dedicated set of demo accounts for testing. This keeps your rehearsals separate from real learners and maintains clean reporting.

![](/img/helpscout/authored/what-is-scenario-lifecycle-mqj1bwrb.png)

## Who can approve a scenario?

To act on a scenario — submit it for review, approve it, request changes, publish it, or archive it — a person must satisfy **two** conditions **at the same time**:

1. **They hold the right role** — Editor, Admin, or Org Admin, **and**
2. **They are connected to that specific scenario** — they either **created** it or have been added as an **owner**.

Holding the role alone is **not** enough. Even an Admin or Org Admin cannot approve or publish a scenario they didn't create and aren't an owner of. This ensures control remains with those responsible for the content.

### Who counts as an "owner"?

- The **creator** of a scenario is automatically an owner of it.
- Additional owners can be granted through the scenario's **Access Permission** option — the people listed there are its owners.

### What this means in practice

- **There's no organization-wide approver pool.** Permission is tied to each scenario, not handed out across the whole organization. To allow someone to approve a specific scenario, they must be added as an owner.
- **Self-approval is possible.** Because the creator is also an owner, they can approve and publish the scenario, allowing small teams to move quickly. If you prefer a second pair of eyes, add another owner and establish a practice where someone other than the author reviews the scenario.
- **Senior roles are not a shortcut.** An Admin or Org Admin still must be the creator or an owner to act on a scenario — the creator/owner requirement applies equally to every role.
- **Every action is attributed.** The **Status History** records who submitted, approved, requested changes, published, and archived the scenario, along with any comments, providing a clear trail of accountability.

### Roles & ownership at a glance

| | Has Editor / Admin / Org Admin role | Is creator or owner of the scenario | Can submit / review / approve / publish / archive |
|---|:---:|:---:|:---:|
| Creator of the scenario | Yes | (automatic) | Yes |
| Owner added via Access Permission | Yes | Yes | Yes |
| Editor/Admin/Org Admin, but **not** an owner | Yes | No | No|
| Someone without one of these roles | No | — | No |

If a person doesn't meet **both** conditions, the lifecycle actions aren't available to them, and the system will refuse the action if attempted directly.

## How to use it — step by step

### Step 1 — Create your scenario

Build an AI Role Play scenario the way you always have. The moment it's created, it automatically becomes a **Draft** and is saved as **version 1.0**. There's no "start lifecycle" button — it just begins. (As the creator, you're automatically an owner, so you can manage it from here on.)

### Step 2 — Build and test it

Add everything that makes the scenario work: the AI's role and persona, the product details, the coach script, the evaluation criteria, supporting documents, scoring, and settings. As you save meaningful changes, SmartWinnr quietly records new versions in the background.

While it's still a Draft, assign it to a **demo user** and run through it yourself. This is the best way to catch awkward wording, an off-target persona, or scoring that doesn't behave as expected — *before* anyone else sees it.

### Step 3 — Submit it for review

When you're happy with it, open the scenario's **⋮ menu** and choose **Submit for Review**. You'll be asked to confirm. Submitting moves the scenario to **In Review** and signals to your team that it's ready for a check. At this moment, SmartWinnr also locks in a clean snapshot of the scenario, so the reviewer always looks at a known version.

![](/img/helpscout/authored/what-is-scenario-lifecycle-mqiwhnd4.png)

### Step 4 — Review and decide

A reviewer — someone who holds an Editor/Admin/Org Admin role **and** is the creator or an owner of this scenario — opens it and makes a call:

- **Approve** — the scenario is good to go. Its status becomes **Approved**.
- **Request changes** — something needs fixing. The reviewer leaves a **comment** explaining what, and the scenario returns to **Draft** for the author to address. Nothing is lost; the author edits and re-submits when ready.

Leaving a clear comment when requesting changes is strongly encouraged — it's captured in the Status History and tells the author exactly what to fix.

![](/img/helpscout/authored/what-is-scenario-lifecycle-mqiwivl7.png)

### Step 5 — Publish it

Once a scenario is **Approved**, publish it. Publishing is the moment it truly goes **live**:

- The current version becomes the **published version** — the one every learner uses.
- You can now assign it to **anyone**: individuals, groups, or meta-tags.
- It's clearly marked so everyone knows it's the active, official version.

![](/img/helpscout/authored/what-is-scenario-lifecycle-mqiwj6ge.png)

### Step 6 — Maintain it over time

Publishing isn't the end. Scenarios evolve, and the lifecycle is built for that:

- **Keep improving it.** You can edit a published scenario at any time. Each edit is saved as a new version, and learners always see the latest published version — so improvements roll out smoothly without breaking anyone's session.
- **See the difference.** Because every version is recorded, you can review exactly what changed between any two points in the scenario's life.

### Step 7 — Retire it when it's done

When a scenario has served its purpose, **archive** it. Archived scenarios are kept for your records and reporting history, but they can't be assigned to anyone new. If you ever need it again, an authorized owner can bring it back by unarchiving it (which returns it to a published state).

![](/img/helpscout/authored/what-is-scenario-lifecycle-mqiwjvto.png)

## Assigning scenarios to learners

The lifecycle's most important safety feature is how it controls assignment. The rule is intentionally strict: **the less finished a scenario is, the fewer people can be assigned to it.**

| Scenario status | Who you can assign it to | How |
|-----------------|--------------------------|-----|
| Draft / In Review / Approved | **Demo users only** | One person at a time |
| Published | **Anyone** | Individuals, groups, or meta-tags |
| Archived | **No one** | — |

### What this means in practice

- **Before publishing, you test with demo users — individually.** This is deliberate: it lets you rehearse and review safely while making it effectively impossible to push an unfinished scenario to a crowd by mistake.
- **Group and meta-tag assignment unlock only at Published.** These are the "assign to many people at once" tools, reserved for scenarios that are truly ready. If you try to use them on a not-yet-published scenario, SmartWinnr stops the action and explains why — it won't silently assign the wrong people.
- **A friendly reminder appears on the assignment pages.** Whenever a scenario's status limits assignment, you'll see a message stating the current rule. You can dismiss it once you've read it, so it never gets in your way.
- **"Upload Users" appears only for published scenarios.** Bulk-uploading learners is a broad action, so it's available only once a scenario is live.

## Tracking changes — Version & Status History

A major benefit of the lifecycle is that **you never have to wonder what happened to a scenario.** Open **Scenario Lifecycle Management** from the scenario's **⋮ menu** to see its full history.

![](/img/helpscout/authored/what-is-scenario-lifecycle-mqj1pmqa.png)

### Version History — what changed in the content

This is the timeline of the scenario's content. For every saved version, it shows:

- the **version number**,
- a **plain-English summary** of what changed,
- **when** it changed and **who** changed it, and
- a **"Live"** marker on the version that's currently published.

You can click **View** on any version to open a **read-only snapshot** of exactly how the scenario looked at that point — handy for understanding an older version or checking what a learner saw at a particular time.

**Understanding version numbers.** SmartWinnr decides how much to bump the version based on *what kind* of change you made:

- A **major** change — something that materially affects the experience, such as the AI role, the persona, the scenario premise, the evaluation criteria, or the scoring — increases the **whole** version number and resets the rest (for example, **v1.3 → v2.0**).
- A **smaller** change — refining wording, swapping a document, updating an image, or adjusting a setting or visibility — increases the version by a small step (for example, **v1.3 → v1.4**).

So the version number itself tells a story: a jump from v2.x to v3.0 signals a significant rework, while v3.1, v3.2 are gentle refinements.

![](/img/helpscout/authored/what-is-scenario-lifecycle-mqj1q9tu.png)

### Status History — the scenario's journey

This is the timeline of the scenario's *journey* (as opposed to its content). It records every lifecycle move — submitted, approved, changes requested, published, archived, unarchived — along with **who** performed it and any **comment** they left.

Because approval is tied to each scenario's owners, this history is your accountability record: it always answers "who approved this, and when?"

![](/img/helpscout/authored/what-is-scenario-lifecycle-mqj16y37.png)

## Duplicating a scenario

Building something similar to an existing scenario? You can **duplicate** any scenario to get a running start — regardless of its current status.

However it's created, the copy always begins as its own fresh **Draft**, with a brand-new version history of its own. That means it goes through the full review-and-publish journey before it can go live — so duplicating never accidentally ships unfinished work.

One thing to note about the two *embedded* places you can add a scenario:

- When adding a scenario into a **Competition** or a **SmartPath**, the picker lists only **published** scenarios to choose from, so you're always starting those from a known, live version.


## A quick mental model

If you remember nothing else, remember this:
> **Draft → In Review → Approved → Published → Archived**, always in that order. Before **Published**, only **demo users** (one at a time). At **Published**, **everyone**. At **Archived**, **no one**. A scenario can only be moved along by someone who holds an **Editor / Admin / Org Admin** role **and** is its **creator or an** owner (this applies to every role, including admins) — and **every move is recorded** for you automatically.