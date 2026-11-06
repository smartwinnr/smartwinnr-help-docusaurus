---
id: fix-field-coaching-average-score-showing-0-on-completed-sessions-with-ratings
title: "Fix field coaching average_score showing 0 on completed sessions with ratings"
description: "Completed field coaching sessions now show the correct average score when inline ratings are saved at completion."
slug: fix-field-coaching-average-score-showing-0-on-completed-sessions-with-ratings
sidebar_position: 10
last_update:
  date: 2026-11-01
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
tags: [field-coaching, reports]
draft: true
---
{/* release-draft: tag=v3.60.10 issue=9834 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9834 */}
{/* release-draft: tag=v3.60.08 issue=9708 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9708 */}

Completed field coaching sessions now show the correct average score when inline ratings are saved at the same time as completion. The combined coaching report also shows the correct score for any session with ratings and a missing stored average.

Use this when you want to confirm that completed sessions and reports reflect competency ratings correctly. The fix applies automatically, so you do not need to change any settings or repeat any workflow.

## When to use this

Use this when you see a completed field coaching session show 0 for the average score even though inline ratings are present.

- A coach completes a field coaching session with inline ratings.
- The completed session shows 0 for the average score.
- The combined coaching report shows an empty score for a session that has ratings.
- You want historical sessions affected by this issue to show the correct score in exports.

No action is needed. When a coach completes a field coaching session and the average score ends up as 0 despite inline ratings being present, the system recalculates the score after the save finishes. The combined coaching report also calculates the score from assessment records for any session that is missing a stored average, so affected historical sessions show the correct score in exports.

## Things to know

:::note
This applies only to inline-rating coaching. It does not apply to self-assessment, no-ratings, or dropdown competency types.
:::

:::note
The fix also covers the combined coaching report, which calculates the score on the fly when a session has ratings but no stored average.
:::

:::note
You do not need to take any action to use this fix.
:::