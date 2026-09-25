---
id: fix-missing-coach-assignment-email-notification
title: "Fix missing coach-assignment email/notification"
description: "Coach assignments now send the assignment email and in-app notification when you assign a coach one at a time."
slug: fix-missing-coach-assignment-email-notification
sidebar_position: 30
last_update:
  date: 2026-09-18
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
  tags: [video-coaching]
draft: true
---
{/* release-draft: tag=v3.59.14 issue=9652 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9652 */}

When you assign a coach to a coachee one at a time from **Edit Reviewers**, the coachee receives the assignment email and in-app notification. This applies to the single **Assign Coach** flow.

Bulk coach assignment across the page is unaffected.

## When to use this

Use this behavior when you want to confirm how coach assignment notifications work in **Video Coaching**.

- You assign a coach to a coachee from **Edit Reviewers**.
- You use the single **Assign Coach** flow.
- You want the coachee to receive both notification types after assignment.
- You want to distinguish single assignment from bulk assignment across the page.

## Things to know

:::note
The single coach-assignment flow sends both the assignment email and the in-app notification when notification settings are enabled.
:::

:::note
Bulk **Apply across page** coach assignment already works as expected.
:::