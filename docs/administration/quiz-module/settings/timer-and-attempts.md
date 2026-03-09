---
title: "Timer & Attempt Settings"
description: "Configure timer and attempt settings for quizzes in the Quiz module."
sidebar_position: 2
last_update:
  date: 2026-03-09
  author: "SmartWinnr"
---

## Overview

Timer and attempt settings control how long users have to complete a quiz and whether they can retake it. These settings help balance quiz difficulty with fair assessment practices.

## Settings Reference

### Quiz Time

| Detail | Description |
|--------|-------------|
| **What it does** | Sets the total time allowed for completing the quiz. |
| **Default** | Disabled (no time limit) |
| **Applies to** | Manual quizzes |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Timer** section.
3. Enable **Quiz Time** and enter the duration in minutes.
4. Click **Save**.

> **Note**: When the timer expires, the quiz is automatically submitted with whatever answers the user has provided.

---

### Show Time

| Detail | Description |
|--------|-------------|
| **What it does** | Displays the remaining time to the user while they take the quiz. |
| **Default** | Enabled (when Quiz Time is set) |
| **Applies to** | Timed quizzes |
| **Prerequisites** | Quiz Time needs to be enabled |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Timer** section.
3. Toggle **Show Time** on or off.
4. Click **Save**.

---

### Allow Multiple Attempts

| Detail | Description |
|--------|-------------|
| **What it does** | Lets users retake the quiz after their first attempt. |
| **Default** | Disabled |
| **Applies to** | All quiz types |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Attempts** section.
3. Enable **Allow Multiple Attempts**.
4. Click **Save**.

---

### Score Threshold

| Detail | Description |
|--------|-------------|
| **What it does** | Sets a minimum score below which the user is prompted or allowed to retake the quiz. |
| **Default** | Not set |
| **Applies to** | Quizzes with multiple attempts enabled |
| **Prerequisites** | Allow Multiple Attempts needs to be enabled |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Attempts** section.
3. Enter the **Score Threshold** percentage.
4. Click **Save**.

> **Note**: Users who score above the threshold are not prompted to retake the quiz.

---

### Show Answers After Each Attempt

| Detail | Description |
|--------|-------------|
| **What it does** | Reveals the correct answers to the user after each completed attempt. |
| **Default** | Disabled |
| **Applies to** | Quizzes with multiple attempts enabled |
| **Prerequisites** | Allow Multiple Attempts needs to be enabled |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Attempts** section.
3. Enable **Show Answers After Each Attempt**.
4. Click **Save**.

---

### Max Allowed Attempts

| Detail | Description |
|--------|-------------|
| **What it does** | Limits the total number of times a user can take the quiz. |
| **Default** | Unlimited (when multiple attempts is enabled) |
| **Applies to** | Quizzes with multiple attempts enabled |
| **Prerequisites** | Allow Multiple Attempts needs to be enabled |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Attempts** section.
3. Set the **Max Allowed Attempts** value.
4. Click **Save**.

---

### Allow Quiz Retake

| Detail | Description |
|--------|-------------|
| **What it does** | Allows users to retake the quiz after it has been completed and closed, separate from the multiple attempts setting. |
| **Default** | Disabled |
| **Applies to** | All quiz types |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Attempts** section.
3. Enable **Allow Quiz Retake**.
4. Click **Save**.

## Frequently Asked Questions

**Q: What is the difference between Allow Multiple Attempts and Allow Quiz Retake?**
A: Multiple Attempts lets users retry the quiz within the original quiz period. Quiz Retake lets users take the quiz again after the quiz has been closed or completed.

**Q: Does the timer reset on each attempt?**
A: Yes. Each attempt starts with the full time allocation.

## Related Topics

- [Scoring & Display Settings](scoring-and-display)
- [Question Delivery Settings](question-delivery)
