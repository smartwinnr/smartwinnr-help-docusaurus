---
id: fix-quiz-list-failing-when-the-quiz-author-was-deleted
title: "Fix quiz list failing when the quiz author was deleted"
description: "Quiz lists load normally when a quiz was created by someone whose account was permanently deleted."
slug: fix-quiz-list-failing-when-the-quiz-author-was-deleted
sidebar_position: 75
last_update:
  date: 2026-10-30
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
tags: [quiz, troubleshooting]
draft: true
---
{/* release-draft: tag=v3.60.08 issue=9673 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9673 */}

Learners can open **My Quizzes** and see their **Assigned** and **Completed** quizzes even when a quiz author account no longer exists. Quizzes from deleted authors appear in the list as normal, with no author name shown.

Quizzes created by active accounts still show the author name. The rest of the quiz list behaves the same.

## When to use this

Use this when you want to confirm that quiz lists still load after an author account is permanently deleted.

- A learner opens **My Quizzes** and the list loads normally.
- A quiz from a deleted author appears without an author name.
- Other quizzes in the same list still show their author names.
- Both **Assigned** and **Completed** tabs continue to load.

## Things to know

:::note
You do not need to change quiz settings or recreate quiz data for this behavior.
:::