---
id: 6971f2a9015ae02ac00219c8
title: Understanding the Participation Tab on the Quiz Dashboard
description: >-
  This tab focuses on engagement patterns, completion status, and when learners
  are most active with quizzes.
slug: understanding-the-participation-tab-on-the-quiz-dashboard
sidebar_position: 330
last_update:
  date: 2026-07-29
  author: Sandeep Bhuthagaddala
source:
  helpscout_id: 6971f2a9015ae02ac00219c8
  helpscout_url: >-
    https://help.smartwinnr.com/article/330-understanding-the-participation-tab-on-the-quiz-dashboard
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
  privilege: quiz
tags:
  - quiz
  - reports
draft: false
---

> **At a glance** - The Participation tab provides insights into engagement patterns, completion status, and peak activity times for quizzes.

The Participation tab focuses on engagement patterns, completion status, and when learners are most active with quizzes.

## Participation Metrics

![Participation metrics overview](/img/helpscout/authored/understanding-the-participation-tab-on-the-quiz-dashboard-mrsvautp.png)

### Daily Active Users

**What it shows:** The number of unique learners who attempted at least one quiz on a given day.

**How to read it:**

* The main number (e.g., 2) shows daily active users.
* The percentage below (e.g., "-60% vs previous period") shows the change from the prior period.

**Why this matters:** This helps you understand daily engagement levels. Compare this with your total learner population to see what percentage is actively using quizzes each day.

* * *

### Peak Usage Time

**What it shows:** The time range during the day when the most quiz activity occurs.

**How to read it:**

* Shows a time window (e.g., "3 PM-5 PM").
* Based on when learners are submitting the most quiz attempts.

**Why this matters:** Understanding when learners are most active can help you:

* Schedule quiz releases for maximum engagement.
* Time reminder messages effectively.
* Plan system maintenance during low-activity periods.

**Things to know:** The example shows 3 PM-5 PM, which might indicate:

* Global teams in different time zones.
* Learners completing quizzes early before work.
* Data from a specific region.

* * *

### Participation Completion

**What it shows:** The percentage of assigned quizzes that have been completed by learners.

**How to read it:**

* The main number (e.g., 11%) shows the completion rate.
* The percentage below (e.g., "+0% vs previous period") shows the change from the prior period (it is based on the selected period).

**Why this matters:** This is similar to the Completion Rate in the Overview tab but presented in the context of participation patterns. A low percentage suggests many assigned quizzes remain incomplete.

* * *

### Total Participation

**What it shows:** The total number of quiz attempts during the selected time period.

**How to read it:**

* The main number (e.g., 44) shows total attempts.
* The percentage below (e.g., "0% vs previous period") shows the change from the prior period (it is based on the selected period).

**Why this matters:** This is the same metric as "Quiz Attempts" from the Overview tab, but shown here to provide context for participation patterns alongside completion status and timing data.

* * *

### Participation Over Time

This bar chart tracks quiz participation volume across time periods.
![Participation over time](/img/helpscout/authored/understanding-the-participation-tab-on-the-quiz-dashboard-mrsvlhct.png)

**What it shows:**

* Each bar represents a time period (typically monthly).
* Bar height indicates the number of quiz participations during that period.
* Peak periods are highlighted.

**How to read it:**

* Taller bars indicate more activity.
* The chart shows "Peak Period (Jul 2025): 10" and "Average: 3."
* This means July had the highest participation (10 attempts) while the average across all months is 3.

**Why this matters:** This helps you:

* Identify seasonal patterns in quiz activity.
* Understand if participation is growing, declining, or stable.
* Correlate participation spikes with training initiatives or deadlines.
* Plan future quiz releases based on historical engagement patterns.

* * *

### Quiz Completion Status

This donut chart shows the current status of all assigned quizzes.

**What it shows:**

* Total number of assigned quizzes in the center (e.g., "307 Total").
* Three segments representing different completion states:
  * **Completed (blue):** Quizzes that have been fully completed.
  * **In Progress (orange):** Quizzes that have been started but not finished.
  * **Not Started (gray):** Quizzes that have been assigned but not yet attempted.

**How to read it:**

* Example: Completed (35), In Progress (9), Not Started (263).
* These numbers add up to the total (307).
* Percentages show: 11% Completed, 3% In Progress, 86% Not Started.

**Why this matters:** This gives you a clear picture of quiz assignment completion status. In the example:

* 86% of assigned quizzes haven't been started yet.
* This indicates either recent assignments or low engagement.
* Only 11% completion suggests learners need reminders or motivation.

**Action items:**

* If "Not Started" is very high, send reminder notifications.
* If "In Progress" is high but "Completed" is low, quizzes might be too long or difficult.
* Track this over time to measure improvement after intervention efforts.

* * *

### Submissions

This section displays each user's quiz submission details along with scoring information, submission date, organizational attributes, and customer-related data.
![Submissions overview](/img/helpscout/authored/understanding-the-participation-tab-on-the-quiz-dashboard-mrsweur4.png)

The submission table contains the following columns:

| Column Name      | Description                                                       |
|------------------|-------------------------------------------------------------------|
| User             | Name and email address of the participant who attempted the quiz  |
| Quiz Title       | Name of the quiz attempted                                        |
| Attempt Count    | Number of attempts completed versus allowed attempts              |
| Score            | Percentage score achieved in the quiz                             |
| Best Score       | Highest score achieved by the user for that quiz                  |
| Date             | Date and time when the quiz was submitted                        |
| Business Unit    | Business category or organizational division associated with the user |
| Type             | Type of quiz or assessment                                        |
| Territory        | Geographic/business territory assigned to the user                |
| Department       | Department associated with the participant                        |
| Customer Data    | Additional customer-related information captured during submission |

* * *

### Participation Heatmap

This horizontal timeline heatmap shows participation rates across different organizational segments.
![Participation heatmap](/img/helpscout/authored/understanding-the-participation-tab-on-the-quiz-dashboard-mrswgrv6.png)

**What it shows:**

* Rows: Different organizational groups (filterable by Zone, Region, Team, etc.).
* Columns: Time periods (months).
* Colors and percentages: Participation rates for that group during that period.

**How to read it:**

* Green color with 100%: All assigned learners in that group participated in quizzes.
* Lower percentages would show in different colors.

**Why this matters:** This heatmap helps you:

* Compare participation across different teams or regions.
* Identify groups with consistently low engagement.
* Recognize high-performing groups to learn from their practices.
* Spot temporal trends in participation.
