---
id: saving-a-2-way-conversational-coaching-with-existing-attempts
title: "Saving a 2-way conversational coaching with existing attempts"
description: "Save coaching changes even when learners have already taken more attempts than the current limit."
slug: saving-a-2-way-conversational-coaching-with-existing-attempts
sidebar_position: 160
last_update:
  date: 2026-10-10
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
tags: [video-coaching, troubleshooting]
draft: true
---
{/* release-draft: tag=v3.59.67 issue=9764 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9764 */}

Saving the **Edit Coaching** page for a 2-way conversational coaching succeeds when you keep **Maximum Attempt Count** unchanged or raise it. The limit check runs only when you lower the value below the highest number of attempts a learner has already taken.

If you lower **Maximum Attempt Count** too far, SmartWinnr shows the lowest allowed value. You can keep the current value or raise it to save your other changes.

## When to use this

Use this when you edit a 2-way conversational coaching and want to save changes without changing the attempt limit.

- You want to update notification settings on an existing coaching.
- You want to change PDF or presentation uploads on the same page.
- You want to keep **Maximum Attempt Count** unchanged.
- You want to raise **Maximum Attempt Count** for future learner retakes.

:::note
This behavior applies to 2-way conversational coachings when retakes are enabled for your organization.
:::

:::note
If a coaching has no limit yet, SmartWinnr checks the first limit you enter against the attempts learners have already taken.
:::

## Things to know

:::warning
You cannot lower **Maximum Attempt Count** below the highest number of attempts any learner has already taken.
:::

Learners who already went past the limit keep those attempts. They do not get more retakes until you raise the limit above their count.

If the coaching option is not visible to you, contact SmartWinnr support.