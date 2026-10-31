---
id: quiz-completion-certificate-only-when-the-learner-passes-the-quiz
title: "Quiz completion certificate only when the learner passes the quiz"
description: "Quiz completion certificates are issued only after a passing attempt, with one certificate per learner per quiz."
slug: quiz-completion-certificate-only-when-the-learner-passes-the-quiz
sidebar_position: 85
last_update:
  date: 2026-10-30
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
tags: [quiz, troubleshooting]
draft: true
---
{/* release-draft: tag=v3.60.08 issue=9818 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9818 */}

Quiz completion certificates follow the quiz pass rule. Learners receive a certificate only when they pass the quiz. If a quiz allows multiple attempts, the passing attempt issues the certificate. Each learner can receive only one certificate per quiz.

## When to use this

Use this behavior when you want certificates to reflect quiz success, not just quiz completion.

- A learner passes on the first attempt and receives the certificate.
- A learner fails first and passes later, and receives the certificate on the passing attempt.
- A learner should not receive a second certificate for the same quiz.
- A quiz has no pass rule, and completion still issues the certificate.

## Things to know

:::note
If a learner already received a certificate for a failed attempt, that certificate stays in place.
:::

:::note
If a learner already has a certificate for a quiz, passing later does not create another one.
:::