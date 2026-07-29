---
id: how-to-allow-multipe-attempts
title: "How to allow multipe attempts"
description: "How to allow multipe attempts How to allow multipe attempts.."
slug: how-to-allow-multipe-attempts
sidebar_position: 999
last_update:
  date: 2026-07-29
  author: Sandeep Bhuthagaddala
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
  privilege: quiz
tags: [quiz]
draft: false
---

> **At a glance** - Enable multiple attempts for quizzes to allow users to retry until they pass.

When **Allow Multiple Attempts** is enabled for quizzes, users can attempt the quiz multiple times. The status will reflect whether they have met the passing criteria, showing **Attempted** if they haven't passed yet.

## When to use this
Enable multiple attempts when you want to give users the opportunity to retake quizzes until they achieve the required pass percentage. This is useful in scenarios such as: 
- Training programs where mastery is essential.
- Assessments that require a minimum score for certification.
- Situations where users may need additional attempts to reinforce learning.

## Before you start
Ensure you have the necessary permissions to modify quiz settings.

## Steps

### 1. Enable Allow Multiple Attempts
Navigate to the quiz settings and toggle the **Allow Multiple Attempts** option to enable it.

![Enable Allow Multiple Attempts in Quiz Settings](/img/helpscout/authored/how-to-allow-multipe-attempts-mr5xrtl0.png)

### 2. Configure Attempt Rules
When **Allow Multiple Attempts** is enabled, the following options will appear:

- **Score % below which quiz will be reassigned**: 
Set a threshold percentage. Learners scoring below this value will automatically receive another attempt to improve and achieve mastery.
- **Show answers after each attempt**: 
Provide immediate feedback by displaying correct answers after each question response instead of waiting until quiz completion. This supports real-time learning and instant answer validation.
- **Set number of attempts**: 
If a numeric value (e.g., 10) is entered in the attempts field, the learner will be allowed to take the quiz up to 10 times.

### 3. Monitor Attempt Status
Check the status of user attempts in the **Quiz Analytics Page**. Users who do not meet the passing criteria will have their status listed as **Attempted**.

## Difference: Allow Multiple Attempts vs Allow Quiz Retake
- **Allow Multiple Attempts**: 
Automatically allows learners to retry the quiz based on system rules such as score threshold or attempt limits.
- **Allow Quiz Retake**: 
Enables learners to voluntarily retake quizzes for self-paced improvement. Unlike automatic reassignment, this is learner-initiated and not triggered by scoring rules.