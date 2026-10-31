---
id: fix-field-coaching-average-score-showing-0-on-completed-sessions-with-ratings
title: "Fix field coaching average_score showing 0 on completed sessions with ratings"
description: "Completed field coaching sessions now show the correct average score when inline ratings are saved at completion."
slug: fix-field-coaching-average-score-showing-0-on-completed-sessions-with-ratings
sidebar_position: 10
last_update:
  date: 2026-10-30
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
tags: [field-coaching, reports]
draft: true
---
{/* release-draft: tag=v3.60.08 issue=9708 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9708 */}
{/* release-draft: tag=v3.60.08 issue=9834 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9834 */}

Star ratings saved in a field coaching session now appear again after you reopen the session. When a coach rates competencies and clicks **Save** or **Complete Coaching**, the session shows the rated stars and the **Average** section again. The coaching planner also shows each session's average rating instead of **NA**.

## When to use this

Use this when you want to confirm that saved ratings appear in completed field coaching sessions and in the coaching planner.

- You rate competencies with stars and save or complete the session.
- You reopen the session with **View** and expect to see the saved stars.
- You check the coaching planner and expect each session to show an average rating.

No setup is needed. Open **Field Coaching**, pick a coachee from the planner, open a session, rate the competencies with stars, and click **Save** or **Complete Coaching**. Reopening the session with **View** shows the saved stars and average, and the planner row shows the session's average rating.

## Things to know

:::note
Ratings saved before this fix were never stored and cannot be recovered. Coaches need to re-rate those sessions.
:::

:::note
Coachings created from a template are unaffected and keep storing the template reference.
:::

:::note
This covers both Inline Rating and Self-Assessment coachings.
:::