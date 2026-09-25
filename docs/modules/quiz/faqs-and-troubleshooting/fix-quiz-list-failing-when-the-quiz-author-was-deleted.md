---
id: fix-quiz-list-failing-when-the-quiz-author-was-deleted
title: "Fix quiz list failing when the quiz author was deleted"
description: "Quiz lists load normally even when a quiz was created by someone whose account was permanently deleted."
slug: fix-quiz-list-failing-when-the-quiz-author-was-deleted
sidebar_position: 65
last_update:
  date: 2026-09-22
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
tags: [quiz, troubleshooting]
draft: true
---
{/* release-draft: tag=v3.59.22 issue=9673 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9673 */}

Learners can open **My Quizzes** and view their **Assigned** and **Completed** quizzes even when a quiz author account no longer exists. Quizzes created by a deleted account still appear in the list, and the author name is left blank.

Quizzes created by active accounts continue to show the author name. The rest of the quiz list behaves normally.

## When to use this

Use this when you want to confirm that quiz lists load correctly for learners after an author account is permanently deleted.

- A learner opens **My Quizzes** and sees both **Assigned** and **Completed** tabs.
- A quiz created by a deleted account appears without an author name.
- The rest of the quiz list still loads as expected.
- Quizzes created by active accounts still show the author name.

## Things to know

:::note
You do not need to change any quiz settings for this behavior.
:::

:::note
You do not need to recreate existing quizzes that were created by a deleted account.
:::