---
title: "Question Delivery Settings"
description: "Configure how questions are delivered to users in the Quiz module."
sidebar_position: 3
last_update:
  date: 2026-03-09
  author: "SmartWinnr"
---

## Overview

Question delivery settings control how questions are selected, ordered, and presented to users. Use these to create varied quiz experiences and prevent answer-sharing among users.

## Settings Reference

### Randomly Assign Questions

| Detail | Description |
|--------|-------------|
| **What it does** | Assigns a random subset of questions from the quiz's question pool to each user. |
| **Default** | Disabled |
| **Applies to** | All quiz types |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Question Delivery** section.
3. Enable **Randomly Assign Questions**.
4. Click **Save**.

> **Note**: Each user may receive a different set of questions, making direct score comparisons less meaningful.

---

### Questions Per Quiz

| Detail | Description |
|--------|-------------|
| **What it does** | Sets how many questions each user receives when random assignment is enabled. |
| **Default** | All questions |
| **Applies to** | Quizzes with random assignment enabled |
| **Prerequisites** | Randomly Assign Questions needs to be enabled |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Question Delivery** section.
3. Set the **Questions Per Quiz** value.
4. Click **Save**.

---

### Randomize by Tag

| Detail | Description |
|--------|-------------|
| **What it does** | Ensures the random selection picks a balanced number of questions from each tag/category. |
| **Default** | Disabled |
| **Applies to** | Quizzes with random assignment enabled |
| **Prerequisites** | Randomly Assign Questions needs to be enabled; questions need to be tagged |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Question Delivery** section.
3. Enable **Randomize by Tag**.
4. Click **Save**.

> **Tip**: Tag your questions by topic before enabling this setting to ensure balanced coverage across subjects.

---

### Shuffle Answer Options

| Detail | Description |
|--------|-------------|
| **What it does** | Randomizes the order of answer choices for each question so users see options in a different order. |
| **Default** | Disabled |
| **Applies to** | Multiple-choice questions |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Question Delivery** section.
3. Enable **Shuffle Answer Options**.
4. Click **Save**.

---

### Question Skip in Quiz

| Detail | Description |
|--------|-------------|
| **What it does** | Allows users to skip questions and return to them later within the same attempt. |
| **Default** | Disabled |
| **Applies to** | All quiz types |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Question Delivery** section.
3. Enable **Question Skip in Quiz**.
4. Click **Save**.

## Frequently Asked Questions

**Q: Can I use random assignment and shuffle answer options together?**
A: Yes. These settings are independent — random assignment selects which questions a user sees, while shuffle changes the order of answer choices within each question.

**Q: If I enable Question Skip, are skipped questions scored?**
A: Skipped questions that are not answered before submission are marked as incorrect.

## Related Topics

- [Timer & Attempt Settings](timer-and-attempts)
- [Scoring & Display Settings](scoring-and-display)
