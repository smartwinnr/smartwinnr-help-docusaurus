---
id: set-a-separate-timer-for-each-quiz-question
title: "Set a separate timer for each quiz question"
description: "Set a default quiz timer, then assign a different time to individual questions before you assign the quiz."
slug: set-a-separate-timer-for-each-quiz-question
sidebar_position: 10
last_update:
  date: 2026-09-10
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [quiz]
draft: true
---
{/* release-draft: tag=v3.58.94 issue=9585 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9585 */}

> **At a glance** - Use a default time for the quiz, then override it for specific questions. Each question counts down from its own timer when the quiz runs.

Use separate timers when different questions need different amounts of time. Set one default time for the quiz, then fine-tune individual questions from the quiz questions screen.

## When to use this

Use separate timers when one quiz includes questions with different levels of complexity.

- Give short recall questions less time than long matching questions.
- Keep most questions on one quiz-level time.
- Adjust only the questions that need more or less time.
- Set times before you assign the quiz.

## Steps

### 1. Turn on the quiz timer
Open **Quizzes**, then create or edit a quiz. Turn on the per question timer and enter the default time in seconds.

The label for this field is **Default time per question (in seconds)**. Use it as the fallback time for any question that does not have its own timer.

### 2. Set question-specific times
On the quiz questions screen, click **Question Timers**.

A popup opens where you can set the time for each question. Enter a value in seconds between 10 and 300 for any question that needs a different timer, then click **Save**.

![The Question Timers button opens a popup for setting per-question times](/img/helpscout/authored/question-timers-popup.png)

### 3. Leave other questions on default
Keep any question without a custom value on the default quiz time.

The quiz uses the individual timer when you set one. Otherwise, it uses **Default time per question (in seconds)**.

## Things to know

:::note
The **Question Timers** button appears only before anyone has started the quiz.
:::

:::note
Duplicating a quiz copies its question timers.
:::

:::note
If you edit question timers later, the new values apply to learners who have not started the quiz yet.
:::

:::note
Auto quizzes and dynamic question pools use the default quiz time for the questions they pick at run time.
:::

:::note
If this option is not visible in your site, contact SmartWinnr support.
:::