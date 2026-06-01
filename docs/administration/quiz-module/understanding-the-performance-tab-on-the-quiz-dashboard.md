---
id: 6971f21ef35cc6035d0b9bd9
title: "Understanding the Performance Tab on the Quiz Dashboard"
description: ""
slug: understanding-the-performance-tab-on-the-quiz-dashboard
sidebar_position: 329
last_update:
  date: 2026-01-22
  author: HelpScout Migration
source:
  helpscout_id: 6971f21ef35cc6035d0b9bd9
  helpscout_url: https://help.smartwinnr.com/article/329-understanding-the-performance-tab-on-the-quiz-dashboard
customProps:
  roles: [editor, admin]
  privilege: quiz
tags: []
---
## Performance Tab

This tab provides detailed analysis of quiz scores, pass/fail rates, and score distribution patterns.

### Key Performance Metrics

#### Certification Pass Rate

**What it shows:** The percentage of certification quiz attempts that achieved passing scores during the selected time period.

**How to read it:**

* The main number (e.g., 0%) shows the certification pass rate
* The percentage below (e.g., "-100% vs previous period") shows the change from the prior period
* This metric applies **only to quizzes designated as certification quizzes**

**Why this matters:** Certifications often have specific job requirements or compliance implications. A 0% pass rate indicates that no learners have successfully passed certification requirements in this period, which may require urgent intervention.

**Things to know:** This is separate from regular quiz pass rates. Not all quizzes are certifications. If you don't have certification quizzes set up, this metric will show 0%.

* * *

#### Average Attempts

**What it shows:** The average number of quiz attempts per learner during the selected time period.

**How to read it:**

* The main number (e.g., 3.8) shows the average attempts per learner
* The percentage below (e.g., "-21% vs previous period") shows the change from the prior period
* This includes first attempts and all retakes

**Why this matters:** Multiple attempts can indicate either:

* **Positive**: Learners are persistent and using quizzes to improve knowledge
* **Negative**: Quizzes are too difficult and learners must retake multiple times to pass

Context matters—look at this metric alongside average scores and pass rates to understand the full picture.

* * *

#### Avg Completion Time

**What it shows:** The average time learners take to complete a quiz, measured in minutes.

**How to read it:**

* The main number (e.g., 3014 min) shows the average completion time
* The percentage below (e.g., "+61% vs previous period") shows the change from the prior period

**Why this matters:** This helps you understand if quizzes are taking too long or if learners are rushing through. Very long times might indicate:

* Quizzes are too lengthy
* Questions are confusing
* Learners are multitasking or getting interrupted

Very short times might suggest learners aren't reading carefully.

**Things to know:** This is an aggregate average across all quizzes. If you have both 5-question quizzes and 50-question quizzes, the average may look high. Consider reviewing completion times for individual quizzes for more granular insights.

* * *

#### Retry Success Rate

**What it shows:** The percentage of learners who pass a quiz after initially failing and retrying.

**How to read it:**

* The main number (e.g., 94%) shows the retry success rate
* The percentage below (e.g., "-6% vs previous period") shows the change from the prior period

**How it's calculated:** If a learner fails on their first attempt, then retries and passes, they're counted as a retry success.

**Why this matters:** A high retry success rate (like 94%) indicates that:

* Learners are learning from their mistakes
* Feedback provided after failed attempts is helpful
* Quizzes are being used effectively as learning tools, not just assessments

A low retry success rate might suggest that learners need additional training resources, not just more attempts.

* * *

### Score Distribution Over Time

This stacked bar chart shows how quiz scores are distributed across different performance ranges over time.

**What it shows:**

* Each bar represents a time period (month)
* Different colored segments within each bar represent different score ranges
* The height of each segment shows how many attempts fell into that score range

**The color coding:**

**Green (Excellent)**

* Score range: 81-100%
* Indicates strong mastery of the material

**Blue (Good)**

* Score range: 71-80%
* Indicates solid understanding with minor gaps

**Yellow (Average)**

* Score range: 61-70%
* Indicates acceptable performance but room for improvement

**Orange (Below Average)**

* Score range: 51-60%
* Indicates significant knowledge gaps

**Red (Needs Improvement)**

* Score range: 0-50%
* Indicates learners are struggling significantly

**How to read it:**

* Larger green/blue sections indicate strong overall performance
* Larger red/orange sections suggest widespread knowledge gaps
* Track changes over time—you want to see the colors shift toward green over months

**Why this matters:** This visualization helps you understand not just average performance, but the distribution of performance across your team. Even if the average is acceptable, you might have a subset of learners struggling significantly (visible in red segments).

* * *

### Pass vs Fail Rate Comparison

This donut chart shows the breakdown of passing vs. failing attempts for certification quizzes.

**What it shows:**

* A visual representation of certification quiz pass/fail rates
* The center shows the total number of certification quiz attempts
* Blue segment: Passed attempts
* Green segment: Failed attempts

**How to read it:**

* Larger blue section = higher pass rate
* Larger green section = higher fail rate
* The percentages below show exact pass and fail rates

**Why this matters:** For certification programs, you need clear visibility into who's passing and who needs support. This chart gives you an at-a-glance view of certification effectiveness.

**Things to know:** This metric only tracks quizzes designated as "certification" quizzes. If you see "0 Total," it means no certification quizzes were attempted in the selected time period.

* * *

### Score Distribution Analysis

This horizontal bar chart shows what percentage of all quiz attempts fall into each score range.

**What it shows:** Five score ranges with the percentage of attempts in each:

* 0-50% (Needs Improvement)
* 51-60% (Below Average)
* 61-70% (Average)
* 71-80% (Good)
* 81-100% (Excellent)

**How to read it:**

* Each bar shows the percentage of total attempts that scored in that range
* Example: "95% in 0-50%" means 95% of all quiz attempts scored below 50%
* Example: "5% in 81-100%" means only 5% of attempts achieved excellent scores

**Why this matters:** This gives you a clear picture of overall knowledge proficiency across your organization. If most attempts are in the lower ranges, you have a widespread training need. If most are in higher ranges, your training programs are working well.

**Action items:**

* If 95% of attempts are in the 0-50% range (as shown in the example), this indicates urgent training intervention needed
* Consider whether quizzes are too difficult or training materials are insufficient
* Identify which specific quizzes are dragging down the average

* * *

### Score Distribution Heatmap

This horizontal timeline heatmap shows score distribution patterns across different organizational segments over time.

**What it shows:**

* Rows: Different organizational groups (filterable by Zone, Region, Team, or custom tags)
* Columns: Time periods (months)
* Colors: Average scores for that group during that period

**How to read the colors:**

* Yellow/Light colors: Lower average scores
* Green/Dark colors: Higher average scores
* The exact percentage is shown in each cell

**Using the dropdown:** Click the dropdown (showing "Zone" in the example) to change the grouping:

* Zone: Geographic territories
* Region: Larger geographic areas
* Team: Department or team structure
* Custom tags: Any organizational metadata

**Why this matters:** This heatmap lets you quickly identify:

* Which teams or zones are consistently underperforming
* Which groups are excelling and might serve as models
* Temporal patterns (are scores improving or declining over time?)
* Geographic or organizational disparities in knowledge

**Example interpretation:** If "North" zone shows 50%, 60%, 34%, 39% across four months, that zone needs targeted support and is not showing improvement over time.

![](/img/helpscout/editors/understanding-the-performance-tab-on-the-quiz-dashboard-1.png)

Performance Tab
