---
id: troubleshooting-coaching-status-not-updating-for-all-reviewers
title: "Troubleshooting coaching status not updating for all reviewers"
description: "Coaching submissions now move every assigned review instance to the reviewer action status."
slug: troubleshooting-coaching-status-not-updating-for-all-reviewers
sidebar_position: 310
last_update:
  date: 2026-10-30
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
  tags: [video-coaching]
draft: true
---
{/* release-draft: tag=v3.60.08 issue=9778 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9778 */}

When a coachee submits a coaching session, every assigned review instance moves to the reviewer action status. This applies to video, conversational, and presentation coaching.

If one instance does not update on the first pass, the system corrects it automatically. That keeps reviewers from getting stuck on an earlier submission status.

## When to use this

Use this behavior when you want to confirm that submitted coaching sessions are ready for review.

- A coachee has submitted a coaching session with multiple reviewers assigned.
- You want every reviewer instance to show the same review-ready status.
- You want to avoid cases where one reviewer sees an outdated submission status.

## Things to know

:::note
If a status mismatch occurs, SmartWinnr records it for monitoring.
:::