---
id: fix-archived-coachings-missing-from-other-coachings-all-filter
title: "Fix archived coachings missing from Other Coachings \"All\" filter"
description: "Archived coachings now appear in the Other Coaching tab when you select **All** in **Scenario Status**."
slug: fix-archived-coachings-missing-from-other-coachings-all-filter
sidebar_position: 10
last_update:
  date: 2026-10-01
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
tags: [video-coaching, troubleshooting]
draft: true
---
{/* release-draft: tag=v3.59.50 issue=9720 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9720 */}

Archived coachings now appear in the **Other Coaching** tab when you select **All** in **Scenario Status**. They still show with the red **Archived** label, and you can find them with **Coaching Title** or **Code** search.

## When to use this

Use this when you want to confirm that archived coachings are included in the default status view on **Other Coaching**.

- You open **Coaching List** and switch to the **Other Coaching** tab.
- You select **All** in **Scenario Status** next to **Tags**.
- You expect archived coachings to appear with active and other statuses.
- You search for an archived coaching by exact title or code.

## Things to know

:::note
This behavior applies to the **Other Coaching** tab only.
:::

:::note
The same status filter on **My Coaching** and the coaching report download are not affected.
:::