---
title: "Notification & Communication Settings"
description: "Configure notification and email settings for quizzes in the Quiz module."
sidebar_position: 5
last_update:
  date: 2026-03-09
  author: "SmartWinnr"
---

## Overview

Notification and communication settings control how users are informed about quiz assignments, reminders, and completions. Proper configuration ensures users are aware of their quizzes without being overwhelmed by messages.

## Settings Reference

### Send Notification On Assignment

| Detail | Description |
|--------|-------------|
| **What it does** | Sends a push notification to users when a quiz is assigned to them. |
| **Default** | Enabled |
| **Applies to** | All quiz types |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Notifications** section.
3. Toggle **Send Notification On Assignment**.
4. Click **Save**.

---

### Custom Notification Subject

| Detail | Description |
|--------|-------------|
| **What it does** | Overrides the default notification title with a custom message. |
| **Default** | System-generated subject |
| **Applies to** | All quiz types |
| **Prerequisites** | Send Notification On Assignment needs to be enabled |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Notifications** section.
3. Enter your text in the **Custom Notification Subject** field.
4. Click **Save**.

---

### Send Email On Assignment

| Detail | Description |
|--------|-------------|
| **What it does** | Sends an email to users when a quiz is assigned to them, in addition to the push notification. |
| **Default** | Disabled |
| **Applies to** | All quiz types |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Notifications** section.
3. Enable **Send Email On Assignment**.
4. Click **Save**.

---

### Custom Email Subject

| Detail | Description |
|--------|-------------|
| **What it does** | Overrides the default email subject line with a custom message. |
| **Default** | System-generated subject |
| **Applies to** | All quiz types |
| **Prerequisites** | Send Email On Assignment needs to be enabled |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Notifications** section.
3. Enter your text in the **Custom Email Subject** field.
4. Click **Save**.

---

### Custom Message on Completion

| Detail | Description |
|--------|-------------|
| **What it does** | Displays a custom message to the user after they complete the quiz. |
| **Default** | System-generated completion message |
| **Applies to** | All quiz types |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Notifications** section.
3. Enter your text in the **Custom Message on Completion** field.
4. Click **Save**.

> **Tip**: Use the completion message to direct users to related training or next steps.

---

### Enable Completion Notification

| Detail | Description |
|--------|-------------|
| **What it does** | Sends a notification to specified recipients when a user completes the quiz. |
| **Default** | Disabled |
| **Applies to** | All quiz types |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Notifications** section.
3. Enable **Enable Completion Notification**.
4. Click **Save**.

---

### Completion Email Recipients

| Detail | Description |
|--------|-------------|
| **What it does** | Specifies which email addresses receive a notification when a user completes the quiz. |
| **Default** | None |
| **Applies to** | All quiz types |
| **Prerequisites** | Enable Completion Notification needs to be enabled |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Notifications** section.
3. Add email addresses to the **Completion Email Recipients** field.
4. Click **Save**.

---

### Send Digest Email

| Detail | Description |
|--------|-------------|
| **What it does** | Sends a periodic summary email to administrators with quiz completion and participation statistics. |
| **Default** | Disabled |
| **Applies to** | All quiz types |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Notifications** section.
3. Enable **Send Digest Email**.
4. Click **Save**.

## Frequently Asked Questions

**Q: Can I send both a push notification and an email on assignment?**
A: Yes. Enable both **Send Notification On Assignment** and **Send Email On Assignment** independently.

**Q: Who receives the digest email?**
A: The digest email is sent to the quiz creator and any additional administrators configured in the organization settings.

## Related Topics

- [Send a Quiz Notification](../features/send-notification)
- [Timer & Attempt Settings](timer-and-attempts)
