---
id: 6971f1c008cad8770d36663c
title: "Understanding the Overview Tab on the Quiz Dashboard"
description: ""
slug: understanding-the-overview-tab-on-the-quiz-dashboard
sidebar_position: 328
last_update:
  date: 2026-01-22
  author: HelpScout Migration
source:
  helpscout_id: 6971f1c008cad8770d36663c
  helpscout_url: https://help.smartwinnr.com/article/328-understanding-the-overview-tab-on-the-quiz-dashboard
customProps:
  roles: [editor, admin]
  privilege: quiz
tags: []
---
## Overview Tab

This tab provides a high-level snapshot of quiz activity, performance, and engagement.

### Key Metrics Section

This section displays four core metrics that summarize quiz performance.

#### Active Learners

**What it shows:** The count of unique learners who attempted at least one quiz during the selected time period.

**How to read it:**

* The main number (e.g., 6) shows total active quiz takers
* The percentage below (e.g., "+20% vs previous period") shows the change compared to the previous period of equal length
* A green upward arrow indicates growth
* A red downward arrow would indicate a decline

**Why this matters:** This tells you how many team members are actively engaging with quizzes. A declining number may indicate that learners need reminders, that quizzes aren't relevant, or that there are technical barriers to participation.

**Things to know:** Only learners who actually started a quiz are counted. Users who have quizzes assigned but haven't attempted them are not included.

* * *

#### Completion Rate

**What it shows:** The percentage of assigned quizzes that have been completed (not just started) during the selected time period.

**How to read it:**

* The main number (e.g., 87%) shows the completion rate
* The percentage below (e.g., "-9% vs previous period") shows the change from the prior period
* This measures completion, not just participation

**Formula:** Completion Rate = (Completed quizzes ÷ Total assigned quizzes) × 100

**Why this matters:** A high completion rate indicates learners are following through on their quiz assignments. A low rate might suggest quizzes are too long, too difficult, or not prioritized by learners.

**What's a good number:** Completion rates above 80% are generally strong. Rates below 60% may indicate issues that need addressing.

* * *

#### Quiz Attempts

**What it shows:** The total number of quiz submissions across all learners and all quizzes during the selected time period.

**How to read it:**

* The main number (e.g., 23) shows total attempts
* The percentage below (e.g., "-4% vs previous period") shows the change from the prior period
* This includes retakes and multiple attempts by the same learner

**Why this matters:** This metric shows overall quiz activity volume. Multiple attempts by learners often indicate they're using quizzes to improve their knowledge—a positive sign of engagement.

**Things to know:** If a learner takes the same quiz three times, all three attempts count toward this total. This is different from "Active Learners," which counts unique individuals.

* * *

#### Avg Score

**What it shows:** The average score across all quiz attempts by all learners during the selected time period, measured on a 0-100% scale.

**How to read it:**

* The main number (e.g., 41%) shows the average performance
* The percentage below (e.g., "-27% vs previous period") shows the change from the prior period

**Why this matters:** This indicates overall knowledge proficiency across your organization. Low average scores might suggest:

* Content is not being absorbed effectively
* Quizzes are too difficult
* Training materials need improvement
* Learners need additional support

**What's a good number:** This depends on your passing threshold. If passing is 70%, an average of 41% indicates most learners are struggling. An average above your passing threshold suggests strong knowledge retention.

* * *

### Quiz Performance Trend

This chart tracks how quiz scores change over time.

**What it shows:**

* A line graph displaying average quiz scores over the selected time period
* Y-axis: Score scale from 0 to 100%
* X-axis: Time periods (dates or months)
* Each data point represents the average score for all quiz attempts during that specific time period

**How to read it:**

* Upward trends indicate improving performance over time
* Downward trends suggest declining knowledge or increasing quiz difficulty
* Flat lines show consistent performance
* Hover over any point to see the exact average score for that period

**Why this matters:** This helps you understand whether your training initiatives are working. If you've launched new training materials or coaching programs, you should see scores improve over time. If scores are declining, investigate whether content is outdated or if learners need refresher training.

![](/img/helpscout/editors/understanding-the-overview-tab-on-the-quiz-dashboard-1.png)

Quiz Performance Trend

* * *

### Popular Quizzes

This section lists the quizzes with the most activity, ranked by number of attempts.

**What it shows:** A table displaying individual quizzes with key metrics:

* Quiz name (e.g., "Anatomy Knowledge Quiz," "SoP Knowledge Quiz")
* Number of attempts
* Average score
* Pass rate

**The columns explained:**

**Quiz Name**

* The title of the quiz

**Attempts**

* Total number of attempts across all learners
* Example: "8 attempts" means 8 total submissions (could be from multiple learners or the same learner retaking)

**Avg Score**

* Average performance across all attempts for this specific quiz
* Example: "Avg: 30" means the average score is 30%

**Pass Rate**

* Percentage of attempts that met the passing criteria
* Example: "Pass: 100%" means every attempt passed
* Example: "Pass: 92%" means 92% of attempts scored above the passing threshold

**Why this matters:**

* Identify which quizzes generate the most activity
* Spot quizzes where learners are struggling (low average scores or pass rates)
* Recognize quizzes that might be too easy (100% pass rate with high scores)
* Determine which topics need additional training resources

**Action items:**

* For quizzes with low pass rates, review questions for clarity or accuracy
* For very popular quizzes, consider creating similar assessments on related topics
* For quizzes with 100% pass rates, evaluate if they're challenging enough

* * *

### Recent Activity

This section shows the latest quiz submissions across your organization.

**What it shows:** A real-time feed of recent quiz completions, including:

* Learner name and profile picture
* Quiz name
* Score achieved
* Time since completion

**How to read it:**

* Each row represents one quiz attempt
* The percentage (e.g., 0%, 25%, 50%, 30%) shows the individual learner's score on that specific attempt
* The timestamp (e.g., "23 hours ago," "5 days ago") shows when the quiz was submitted

**Why this matters:** This gives you immediate visibility into quiz activity. You can:

* See who's actively taking quizzes right now
* Quickly identify learners who scored very low and might need immediate support
* Recognize learners achieving high scores
* Monitor whether quiz activity is ongoing or has stalled

![](/img/helpscout/editors/understanding-the-overview-tab-on-the-quiz-dashboard-2.png)

Popular Quizzes & Recent Activity
