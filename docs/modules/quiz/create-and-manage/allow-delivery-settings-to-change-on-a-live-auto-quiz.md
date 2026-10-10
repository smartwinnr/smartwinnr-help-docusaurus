---
id: allow-delivery-settings-to-change-on-a-live-auto-quiz
title: "Allow delivery settings to change on a live Auto Quiz"
description: "Change quiz delivery frequency and question count on a live Auto Quiz without recreating it."
slug: allow-delivery-settings-to-change-on-a-live-auto-quiz
sidebar_position: 316
last_update:
  date: 2026-10-10
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [quiz]
draft: true
---
{/* release-draft: tag=v3.59.67 issue=9794 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9794 */}

> **At a glance** - You can update two delivery settings on a live Auto Quiz: delivery frequency and questions per delivery. Learners keep their progress, and future deliveries use the new values.

Use this when you need to adjust an Auto Quiz without starting over. It helps you change the delivery cadence or quiz size while keeping assigned learners and past deliveries intact.

## When to use this

Use these settings when your quiz rollout needs a different pace or question count.

- You want to shorten or lengthen the time between deliveries.
- You want to increase or reduce the number of questions in each delivery.
- You need to keep learner progress and past deliveries.
- You need to keep the quiz structure in place instead of recreating it.

## Steps

### 1. Open the Auto Quiz
Open the quiz, then select **Edit**. On the **Edit Quiz** screen, find the auto mode settings table.

### 2. Change the delivery settings
Update **Frequency of quiz delivery (days)** or **Number of questions per quiz**. These are the only auto mode settings you can change on a live quiz.

![Open the Auto Quiz, click Edit, and change Frequency of quiz delivery (days) and Number of questions per quiz in the auto mode settings table](/img/helpscout/authored/allow-delivery-settings-to-change-on-a-live-auto-quiz-1.png)

### 3. Save and confirm
Select **Save**. A confirmation dialog explains what the change affects and how many learners are assigned. Review it, then confirm the change.

### 4. Update mandatory categories
Open **Step 2: Questions**, then **Mandatory Categories**, then **Configure**. Raise the per-category count so it fits the new number of questions.

![Open Step 2: Questions, Mandatory Categories, Configure, and raise the per-category count](/img/helpscout/authored/allow-delivery-settings-to-change-on-a-live-auto-quiz-2.png)

## Things to know

:::note
The new question count applies from each learner's next delivery. Earlier deliveries keep their original question count.
:::

:::note
The new frequency applies after each learner's next completion. Learners already scheduled keep their current date.
:::

:::note
Open deliveries are not changed, and pending delivery dates are not rescheduled.
:::

:::note
Every change appears on the **Audit Log** screen with the previous and new values.
:::

:::caution
If the feature is not visible, contact SmartWinnr support.
:::