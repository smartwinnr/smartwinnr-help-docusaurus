---
id: completion-email-greeting-by-recipient-name
title: "What is completion email greeting by recipient name"
description: "See how completion emails greet each recipient by name for quizzes, SmartPaths, and coachings."
slug: completion-email-greeting-by-recipient-name
sidebar_position: 186
last_update:
  date: 2026-11-24
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [notifications]
draft: true
---
{/* release-draft: tag=v3.60.72 issue=10004 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/10004 rev=065e11633de0 */}
{/* release-update: issue=10004 summary="New article" */}

Completion emails for quizzes, SmartPaths, and coachings can greet each recipient by name. People added under **Users** or **Groups** see a personalized opening, such as “Hello Jeff G,” when they receive the email.

External email addresses still receive a generic greeting because no name is available. The email content stays the same otherwise, including any quiz email template you choose on the **Email Templates** page.

## When to use this

Use this when you want completion emails to feel more personal for the people you notify.

- You want the same completion email to feel consistent for managers, users, and group members.
- You send completion notifications to people added under **Users** or **Groups**.
- You want external recipients to still receive the email without a name-based greeting.

## Steps

### 1. Turn on completion notifications
Open a quiz, SmartPath, or coaching, then turn on **Enable completion notification**.

### 2. Add recipients
Add the people who should receive the email under **Users** or **Groups**, then save your changes.

### 3. Let the learner complete the item
When a learner completes the quiz, SmartPath, or coaching, each recipient receives the completion email with their own name in the greeting.

## Things to know

:::note
The greeting is personalized for each recipient, even when the email is sent to a large group.
:::

:::note
If you use a custom quiz template from the **Email Templates** page, that template still applies.
:::