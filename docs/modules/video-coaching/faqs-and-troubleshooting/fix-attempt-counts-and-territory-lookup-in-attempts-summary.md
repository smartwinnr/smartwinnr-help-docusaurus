---
id: fix-attempt-counts-and-territory-lookup-in-attempts-summary
title: "Fix attempt counts and territory lookup in Attempts Summary"
description: "See the corrected attempt counts and Territory values in the Coaching Completion Report's Attempts Summary sheet."
slug: fix-attempt-counts-and-territory-lookup-in-attempts-summary
sidebar_position: 10
last_update:
  date: 2026-09-10
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
  tags: [video-coaching]
draft: true
---
{/* release-draft: tag=v3.58.94 issue=9545 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9545 */}

The **Attempts Summary** sheet in the **Coaching Completion Report** now shows attempt counts and Territory values consistently. It matches the meaning used on the coachee-wise sheet, so you can compare both sheets with confidence.

Use this sheet when you download the report from **Coaching > Coaching Completion Analytics** and want to review assigned attempts, completed attempts, and Territory details.

## When to use this

Use the **Attempts Summary** sheet when you want to:

- Check how many attempts were assigned for a coaching.
- Confirm how many attempts were completed after submission.
- Review Territory values for each coachee.
- Compare the summary sheet with the coachee-wise sheet.

## Things to know

:::note
**Total Attempts Assigned** matches the coaching's **Maximum Attempt Count** on this sheet and on the coachee-wise sheet.
:::

:::note
A coaching counts as completed only after the coachee submits it. Scheduled or in-progress coaching does not count as completed.
:::

:::note
**Completed** is capped at **Assigned**.
:::

:::note
The **Territory** column is populated on the **Attempts Summary** sheet, and the duplicate **Coachee Status** column is no longer shown there.
:::