---
title: "Automatic Quiz Settings"
description: "Configure automatic quiz delivery schedules, self-activation, and auto-mode options."
sidebar_position: 7
last_update:
  date: 2026-03-09
  author: "SmartWinnr"
---

## Overview

Automatic quiz settings control how quizzes are scheduled and delivered without manual intervention. These settings apply specifically to automatic (recurring) quiz types.

## Settings Reference

### Delivery Days of Week

| Detail | Description |
|--------|-------------|
| **What it does** | Specifies which days of the week the automatic quiz is delivered to users. |
| **Default** | All weekdays (Monday–Friday) |
| **Applies to** | Automatic quizzes |
| **Prerequisites** | Quiz type needs to be set to Automatic |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Schedule** section.
3. Select the desired days under **Delivery Days of Week**.
4. Click **Save**.

---

### Self-Activated Quiz Assignment

| Detail | Description |
|--------|-------------|
| **What it does** | Automatically assigns the quiz to new users who match the target audience criteria, without admin action. |
| **Default** | Disabled |
| **Applies to** | Automatic quizzes |
| **Prerequisites** | Quiz type needs to be set to Automatic |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Schedule** section.
3. Enable **Self-Activated Quiz Assignment**.
4. Click **Save**.

> **Tip**: Use this for onboarding quizzes — new users are automatically included as they join the target group.

---

### Schedule by Last Completion Date

| Detail | Description |
|--------|-------------|
| **What it does** | Schedules the next quiz delivery based on when the user last completed a quiz, rather than on a fixed calendar schedule. |
| **Default** | Disabled |
| **Applies to** | Automatic quizzes |
| **Prerequisites** | Quiz type needs to be set to Automatic |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Schedule** section.
3. Enable **Schedule by Last Completion Date**.
4. Click **Save**.

> **Note**: This creates a personalized schedule for each user, so different users may receive quizzes at different times.

---

### AutoMode Settings

| Detail | Description |
|--------|-------------|
| **What it does** | Configures the automated behavior of the quiz, including the number of questions per delivery, question pool rotation, and delivery frequency. |
| **Default** | Varies by organization |
| **Applies to** | Automatic quizzes |
| **Prerequisites** | Quiz type needs to be set to Automatic |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **AutoMode Settings** section.
3. Configure the following options:
   - **Questions per delivery** — Number of questions sent in each automatic quiz.
   - **Question pool rotation** — How the system cycles through available questions.
   - **Delivery frequency** — How often quizzes are sent (daily, weekly, etc.).
4. Click **Save**.

## Frequently Asked Questions

**Q: Can I combine automatic delivery with manual assignment?**
A: Automatic quizzes handle delivery on their own schedule. If you need to assign a quiz manually, consider duplicating it as a manual quiz.

**Q: What happens if a user does not complete an automatic quiz before the next one is delivered?**
A: The incomplete quiz remains available. The new quiz is delivered as scheduled. Users can complete both.

## Related Topics

- [Timer & Attempt Settings](timer-and-attempts)
- [Question Delivery Settings](question-delivery)
