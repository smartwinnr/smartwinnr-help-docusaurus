---
id: 6971f2ff425fd115e68cbc8b
title: "Understanding the Learner Management Tab on the Quiz Dashboard"
description: ""
slug: understanding-the-learner-management-tab-on-the-quiz-dashboard
sidebar_position: 331
last_update:
  date: 2026-01-22
  author: HelpScout Migration
source:
  helpscout_id: 6971f2ff425fd115e68cbc8b
  helpscout_url: https://help.smartwinnr.com/article/331-understanding-the-participation-tab-on-the-quiz-dashboard
customProps:
  roles: [editor, admin]
  privilege: quiz
tags: []
---
## Learner Management Tab

This tab provides insights into individual learners and categorizes users by performance and risk level.

### Learner Management Metrics

#### New Learners

**What it shows:** The number of users added to the system during the selected time period.

**How to read it:**

* The main number (e.g., 19) shows new users added
* The comparison text (e.g., "+19 this quarter") shows the change from the previous period

**Why this matters:** This helps you track user growth and onboarding activity. A large number of new learners might require additional support or onboarding resources.

* * *

#### High Performers

**What it shows:** The number of learners scoring above a defined performance threshold during the selected time period.

**How to read it:**

* The main number (e.g., 0) shows high performers
* The comparison text (e.g., "-2 vs last quarter") shows the change from the previous period

**Performance threshold:** Typically defined as learners with average scores above 80%

**Why this matters:** High performers can serve as mentors, provide feedback on training effectiveness, or be recognized publicly to motivate others.

* * *

#### At-Risk Users

**What it shows:** The number of learners flagged as needing support based on performance or engagement issues.

**How to read it:**

* The main number (e.g., 5) shows at-risk learners
* The comparison text (e.g., "+3 vs last quarter") shows the change from the previous period

**What defines "at-risk":** Learners are flagged as at-risk if they exhibit:

* Low quiz scores (typically ≤50%)
* Multiple quiz failures
* Low participation rates
* Long periods of inactivity

**Why this matters:** These learners need immediate attention and support. Use this to:

* Provide one-on-one coaching
* Offer additional training resources
* Check for technical barriers
* Ensure learners understand the importance of knowledge assessments

* * *

#### Certification Due

**What it shows:** The number of learners who have certification quizzes due within the next 30 days.

**How to read it:**

* The main number (e.g., 0) shows upcoming certifications
* "Next 30 days" indicates the timeframe

**Why this matters:** Certifications often have compliance or job readiness implications. This metric helps you:

* Send proactive reminders to learners
* Ensure adequate time for preparation
* Prevent last-minute rushes or missed deadlines

* * *

### User Engagement Trend

This dual-bar chart compares logged-in activity with actual quiz-taking activity over time.

**What it shows:**

* Each time period has two bars:
  * **Blue bars**: Logged-in users (users who accessed the platform)
  * **Green bars**: Active users (users who attempted quizzes)

**How to read it:**

* Compare the height of blue vs. green bars
* A large gap means many users log in but don't take quizzes
* Similar heights mean most users who log in also take quizzes

**Why this matters:** This helps identify engagement issues:

* Large blue bars with small green bars: Users are logging in but not engaging with quizzes
* This might indicate quizzes are hard to find, not relevant, or not required
* Use this insight to improve quiz visibility or send targeted reminders

* * *

### User Segmentation

This donut chart categorizes learners by performance level.

**What it shows:** Three performance categories:

* **High Performers (blue)**: Learners scoring above 80%
* **Normal Users (green)**: Learners scoring between 51-80%
* **At-Risk Users (purple)**: Learners scoring at or below 50%

**How to read it:**

* The size of each segment shows the proportion of learners in that category
* The center shows the total number of learners (e.g., "6 Total")
* Percentages below show exact distribution (e.g., 0% High Performers, 17% Normal Users, 83% At-Risk Users)

**Why this matters:** This gives you a quick visual of your learner population's health. In the example:

* 0% are high performers (no one scoring above 80%)
* 17% are normal users (1 learner)
* 83% are at-risk (5 learners)

This indicates widespread performance issues requiring immediate intervention.

**Action items:**

* If at-risk segment is large, launch targeted training programs
* If high performer segment is small, review if content is too difficult
* Use this to allocate coaching resources where most needed

* * *

### User Performance Overview

This table provides detailed individual learner statistics.

**What it shows:** A sortable table with columns:

* **User**: Learner name and profile picture
* **Attempts**: Total number of quiz attempts by this learner
* **Avg Score**: Average performance across all their quiz attempts
* **Status**: Performance category badge (High Performers, Normal Users, or At Risk Users)
* **Last Active**: Time since their most recent quiz attempt

**How to read it:** Example row: "Jason Smith, 15 attempts, 45%, At Risk Users, 6 days ago"

* Jason has taken 15 quizzes total
* His average score is 45%
* He's flagged as at-risk due to low scores
* His last quiz was 6 days ago

**Using the filter buttons:** At the top of the table, you'll see filter buttons:

* **High Performers**: Show only high performers
* **Normal Users**: Show only normal users
* **At Risk**: Show only at-risk learners

Click these to focus on specific segments.

**Why this matters:** This table lets you:

* Identify specific individuals who need support
* Track who's actively taking quizzes and who's gone inactive
* Recognize top performers for rewards or recognition
* Follow up with at-risk learners personally

**Action items:**

* Contact at-risk learners individually
* Celebrate high performers publicly
* Check on inactive learners (those with "Last Active" dates weeks or months ago)

![](/img/helpscout/editors/understanding-the-learner-management-tab-on-the-quiz-dashboard-1.png)

Learner Management Tab
