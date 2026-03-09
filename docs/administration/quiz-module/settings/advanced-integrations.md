---
title: "Advanced & Integration Settings"
description: "Configure xAPI integration, leaderboards, proctoring, and other advanced quiz settings."
sidebar_position: 6
last_update:
  date: 2026-03-09
  author: "SmartWinnr"
---

## Overview

Advanced and integration settings connect quizzes to external systems, control leaderboard visibility, and enable specialized features like proctoring and self-registration.

## Settings Reference

### xAPI Instance ID

| Detail | Description |
|--------|-------------|
| **What it does** | Sets the xAPI instance identifier used to report quiz data to an external LRS. |
| **Default** | Auto-generated |
| **Applies to** | Quizzes with xAPI integration |
| **Prerequisites** | xAPI integration needs to be configured at the organization level |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **xAPI Integration** section.
3. View or update the **xAPI Instance ID**.
4. Click **Save**.

---

### xAPI Activity ID

| Detail | Description |
|--------|-------------|
| **What it does** | Defines the unique activity identifier for this quiz in the LRS. |
| **Default** | Auto-generated |
| **Applies to** | Quizzes with xAPI integration |
| **Prerequisites** | xAPI integration needs to be configured at the organization level |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **xAPI Integration** section.
3. View or update the **xAPI Activity ID**.
4. Click **Save**.

---

### xAPI Pass Percentage

| Detail | Description |
|--------|-------------|
| **What it does** | Sets the pass percentage reported to the LRS for xAPI pass/fail statements. |
| **Default** | Matches the quiz pass percent threshold |
| **Applies to** | Quizzes with xAPI integration |
| **Prerequisites** | xAPI integration needs to be configured at the organization level |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **xAPI Integration** section.
3. Set the **xAPI Pass Percentage** value.
4. Click **Save**.

---

### Generate New xAPI ID

| Detail | Description |
|--------|-------------|
| **What it does** | Creates a new xAPI Activity ID, replacing the existing one. Use this to re-register the quiz as a new activity in the LRS. |
| **Default** | N/A (action) |
| **Applies to** | Quizzes with xAPI integration |
| **Prerequisites** | xAPI integration needs to be configured at the organization level |

**How to configure:**

1. Open the quiz view page.
2. Click the **⋮** (more options) menu.
3. Select **Generate New xAPI ID**.

> **Note**: The old xAPI ID's records in the LRS remain unchanged. The LRS treats the new ID as a separate activity.

---

### Send By Generic Name

| Detail | Description |
|--------|-------------|
| **What it does** | Sends quiz notifications and emails using a generic sender name instead of the admin's personal name. |
| **Default** | Disabled |
| **Applies to** | All quiz types |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Advanced** section.
3. Enable **Send By Generic Name**.
4. Click **Save**.

---

### Add Result to All Leaderboards

| Detail | Description |
|--------|-------------|
| **What it does** | Includes this quiz's scores in all applicable leaderboards across the organization. |
| **Default** | Disabled |
| **Applies to** | All quiz types |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Advanced** section.
3. Enable **Add Result to All Leaderboards**.
4. Click **Save**.

---

### Hide Leaderboard for User

| Detail | Description |
|--------|-------------|
| **What it does** | Hides the leaderboard from end users for this quiz, while still tracking scores for admins. |
| **Default** | Disabled |
| **Applies to** | All quiz types |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Advanced** section.
3. Enable **Hide Leaderboard for User**.
4. Click **Save**.

---

### Allow Self Registration

| Detail | Description |
|--------|-------------|
| **What it does** | Lets users register themselves for the quiz without needing an admin to assign it. |
| **Default** | Disabled |
| **Applies to** | Event quizzes |
| **Prerequisites** | None |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Advanced** section.
3. Enable **Allow Self Registration**.
4. Click **Save**.

---

### Enable Quiz Proctoring

| Detail | Description |
|--------|-------------|
| **What it does** | Activates proctoring features such as browser lockdown and activity monitoring during the quiz. |
| **Default** | Disabled |
| **Applies to** | All quiz types |
| **Prerequisites** | Proctoring needs to be enabled at the organization level |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Advanced** section.
3. Enable **Enable Quiz Proctoring**.
4. Click **Save**.

> **Note**: Proctoring may require users to grant camera and browser permissions before starting the quiz.

---

### Completion Certificate

| Detail | Description |
|--------|-------------|
| **What it does** | Awards a certificate to users who complete the quiz (or pass, if pass/fail is enabled). |
| **Default** | Disabled |
| **Applies to** | All quiz types |
| **Prerequisites** | Certificate template needs to be configured at the organization level |

**How to configure:**

1. Open the quiz in **Edit** mode.
2. Scroll to the **Advanced** section.
3. Enable **Completion Certificate**.
4. Select the certificate template.
5. Click **Save**.

## Frequently Asked Questions

**Q: Can I use xAPI and leaderboards together?**
A: Yes. These are independent features — xAPI reports to an external LRS, while leaderboards are internal to SmartWinnr.

**Q: Does proctoring work on mobile devices?**
A: Proctoring support varies by device and browser. Check with your SmartWinnr administrator for supported configurations.

## Related Topics

- [Quick Actions — Generate New xAPI ID](../features/quick-actions#generate-new-xapi-id)
- [Scoring & Display Settings](scoring-and-display)
