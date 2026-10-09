---
id: use-the-smartpath-batch-end-date-for-smartpath-coaching-retake-and-end-date
title: "Use the SmartPath batch end date for SmartPath coaching Retake and end date"
description: "SmartPath coachings use the learner’s own batch end date for Retake availability and the end date shown on coaching screens."
slug: use-the-smartpath-batch-end-date-for-smartpath-coaching-retake-and-end-date
sidebar_position: 120
last_update:
  date: 2026-10-09
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
tags: [video-coaching]
draft: true
---
{/* release-draft: tag=v3.59.65 issue=9751 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9751 */}

SmartPath coachings use the learner’s own SmartPath batch end date on the coaching feedback screen and the coaching start screen. The **Retake** button stays visible while the learner’s batch is open and attempts remain under **Maximum Attempt Count**. The **End date** on the coaching start screen matches the batch end date.

The date is looked up when the screen opens. When a batch changes, nothing is rewritten on the coaching record.

## When to use this

Use this to confirm how SmartPath coachings handle **Retake** and the displayed **End date**.

- A learner’s SmartPath batch end date changes.
- A learner still has attempts left, but **Retake** does not appear.
- You want to confirm the date shown on the coaching start screen.
- You need to check whether a coaching follows the learner’s current batch end date.

## Things to know

:::note
This behavior applies only to coachings added to a SmartPath.
:::

:::note
If a learner’s batch cannot be found, the previous date is used.
:::

:::note
Standard coachings, competition coachings, reports, and stored dates are unchanged.
:::