---
title: "Scoring & Display Settings"
description: "Configure scoring, pass/fail thresholds, and result display options in the Quiz module."
sidebar_position: 4
last_update:
  date: 2026-03-09
  author: "SmartWinnr"
---

## Overview

Scoring and display settings determine how quiz results are calculated, presented to users, and whether pass/fail criteria apply. These settings shape the learner's post-quiz experience.

## Settings Reference

### Show Score

| Detail | Description |
|--------|-------------|
| **What it does** | Displays the user's score after they complete the quiz. |
| **Default** | Enabled |
| **Applies to** | All quiz types |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Scoring & Display** section.
3. Toggle **Show Score** on or off.
4. Click **Save**.

---

### Show Score with Decimal Points

| Detail | Description |
|--------|-------------|
| **What it does** | Displays scores with decimal precision instead of rounding to whole numbers. |
| **Default** | Disabled |
| **Applies to** | All quiz types |
| **Prerequisites** | Show Score needs to be enabled |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Scoring & Display** section.
3. Enable **Show Score with Decimal Points**.
4. Click **Save**.

---

### Show Answer After Each Question

| Detail | Description |
|--------|-------------|
| **What it does** | Reveals the correct answer immediately after the user answers each question, before moving to the next. |
| **Default** | Disabled |
| **Applies to** | All quiz types |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Scoring & Display** section.
3. Enable **Show Answer After Each Question**.
4. Click **Save**.

> **Note**: This turns the quiz into a learning exercise. Users see feedback in real time rather than only at the end.

---

### Tag Correct Response

| Detail | Description |
|--------|-------------|
| **What it does** | Highlights the correct answer option with a visual tag (such as a checkmark) after the user answers. |
| **Default** | Disabled |
| **Applies to** | All quiz types |
| **Prerequisites** | Show Answer After Each Question needs to be enabled |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Scoring & Display** section.
3. Enable **Tag Correct Response**.
4. Click **Save**.

---

### Show Quiz Review

| Detail | Description |
|--------|-------------|
| **What it does** | Allows users to review all their answers and the correct answers after completing the quiz. |
| **Default** | Disabled |
| **Applies to** | All quiz types |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Scoring & Display** section.
3. Enable **Show Quiz Review**.
4. Click **Save**.

---

### Hide Correct Options to Incorrect Responses

| Detail | Description |
|--------|-------------|
| **What it does** | When quiz review is enabled, hides the correct answer for questions the user answered incorrectly. |
| **Default** | Disabled |
| **Applies to** | Quizzes with Show Quiz Review enabled |
| **Prerequisites** | Show Quiz Review needs to be enabled |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Scoring & Display** section.
3. Enable **Hide Correct Options to Incorrect Responses**.
4. Click **Save**.

> **Tip**: Use this when you want users to retry the quiz and figure out the correct answer on their own.

---

### Enable Pass/Fail

| Detail | Description |
|--------|-------------|
| **What it does** | Applies a pass/fail outcome to the quiz based on a percentage threshold. |
| **Default** | Disabled |
| **Applies to** | All quiz types |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Scoring & Display** section.
3. Enable **Enable Pass/Fail**.
4. Click **Save**.

---

### Pass Percent Threshold

| Detail | Description |
|--------|-------------|
| **What it does** | Sets the minimum score percentage required to pass the quiz. |
| **Default** | 70% |
| **Applies to** | Quizzes with Pass/Fail enabled |
| **Prerequisites** | Enable Pass/Fail needs to be enabled |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Scoring & Display** section.
3. Set the **Pass Percent Threshold** value.
4. Click **Save**.

---

### Collect Confidence Level

| Detail | Description |
|--------|-------------|
| **What it does** | Asks users to rate their confidence in each answer, providing additional analytics data. |
| **Default** | Disabled |
| **Applies to** | All quiz types |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Scoring & Display** section.
3. Enable **Collect Confidence Level**.
4. Click **Save**.

> **Tip**: Confidence data helps identify topics where users are unsure even when they answer correctly — a useful signal for additional training.

## Frequently Asked Questions

**Q: Can I show scores but hide the correct answers?**
A: Yes. Enable **Show Score** and keep **Show Answer After Each Question** and **Show Quiz Review** disabled.

**Q: Does the pass/fail result affect the leaderboard?**
A: No. Pass/fail is a separate outcome. Leaderboard rankings are based on the numerical score.

## Related Topics

- [Timer & Attempt Settings](timer-and-attempts)
- [Question Delivery Settings](question-delivery)
