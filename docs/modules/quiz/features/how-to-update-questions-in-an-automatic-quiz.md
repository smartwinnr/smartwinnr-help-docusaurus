---
id: update-questions-in-automatic-quiz
title: "How to update questions in an automatic quiz"
description: "Learn how to modify questions in a running automatic quiz without recreating it."
slug: update-questions-in-automatic-quiz
sidebar_position: 999
last_update:
  date: 2026-07-07
  author: Anagha Isal
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: ["quiz"]
draft: false
---

> **At a glance** - You can update questions in a running automatic quiz using the Pool Management feature. This allows you to add, remove, swap, and hide questions without needing to recreate the quiz.

The **Pool Management** feature enables you to manage questions in a live automatic quiz. You can make changes directly from the quiz's **Questions view**, ensuring updates reach learners on their next scheduled quiz delivery without requiring re-assignment.

## When to use this

Use the Pool Management feature when you need to:

- Update questions in an ongoing automatic quiz.
- Temporarily hide outdated questions from the automatic quiz.
- Add new questions to the quiz pool.
- Ensure updated mandatory category list are met for question delivery.

## Steps

### 1. Access Pool Management

Open the required automatic quiz and navigate to the **Questions view** in second step. The **Pool Management** panel appears at the top for quizzes.

![Pool Management](/img/helpscout/authored/how-to-update-questions-in-an-automatic-quiz-mrak2793.png)

Here, based on the requirement, we can perform different actions in the existing question pool selected for the automatic quiz:

- Exclude by Tag
- Include by Tag
- Bulk select
- Remove questions
- Swap questions
- Add questions

![Pool management](/img/helpscout/authored/authored-mrah7syp.png)

### 2. Exclude Questions by Tag

Use this to temporarily stop delivering certain questions — for example, to pause an out-of-date question — without deleting anything. It can always be undone.

1. Click **Exclude by Tag** and select one or more categories.
2. All questions from the category will stop being delivered from the next run.
3. Excluded tags appear as chips. Click a chip or select **Include by Tag** to restore them.

![Exclude questions by tag](/img/helpscout/authored/authored-mrahbk3c.png)

Excluded questions stay visible in the list with an EXCLUDED badge. If any learners have run out of eligible questions, a banner shows how many users have exhausted their pool.

**Automatic reactivation**: When you re-include questions, any learner who had exhausted their pool is reactivated and sent a "pool replenished" notification.

![Questions with excluded tag](/img/helpscout/authored/how-to-update-questions-in-an-automatic-quiz-mrc03yqk.png)

### 3. Add Questions

To bring new questions into the live pool of question:

1. Click **Add Questions**.
2. Filter by division/category, search, and select questions to add (you can add up to 200 at a time).
3. If learners are mid-quiz, a notice explains the impact — tick "I understand the impact on in-progress users" to continue.
4. Click **Add Questions** at the bottom.

New questions become eligible on each learner's next scheduled delivery and are added to everyone still active in the quiz. You can Remove an added question only until a learner attempts it. After that, use Exclude to hide it instead.

![Add questions to pool](/img/helpscout/authored/authored-mrahg1nz.png)

### 4. Remove Questions

To permanently delete questions from the pool:

1. Click **Remove Questions**.
2. Select the questions and confirm.

![Remove questions from pool](/img/helpscout/authored/authored-mrahd7xu.png)

### 5. Swap Questions

To replace questions while maintaining pool size:

1. Click **Swap Questions**.
2. Select an equal number of questions to remove and add (1:1 ratio).
3. Confirm the swap.

For each learner, any question they've already attempted is kept, and proportionally fewer replacements are assigned so their total stays the same. Learners who've finished the quiz are skipped, and swapped-out questions remain on record for reporting.

![Swap questions](/img/helpscout/authored/how-to-update-questions-in-an-automatic-quiz-mrbufmus.png)

### Mandatory Categories

Set how many questions from specific tags must appear in every delivery. These are prioritized in the question mix, and Remove/Swap actions warn you if a change would break the required coverage.

- Click Configure to set counts per tag, or View Current to review the existing setup.

### 6. View Audit Log

To see a record of changes made:

1. Click **Audit Log** to view recent actions, affected questions, and the user who made the changes.

![Audit log for pool management](/img/helpscout/authored/authored-mrahgw1m.png)

## Tips

- Use the **Exclude** and **Include** options to manage questions without deleting them.
- Review the **Audit Log** regularly to track changes and their impact on learners.

## Things to know

- A question can only be removed if no learner has been delivered or has answered it. If a question is already in use, removal is blocked and the affected questions are listed. If removing would drop a Mandatory Category below its required count, you'll get a warning.
- If learners have exhausted their pool, re-including questions will reactivate them and send a "pool replenished" notification.
