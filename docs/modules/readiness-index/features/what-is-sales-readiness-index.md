---
id: what-is-sales-readiness-index
title: "What is sales readiness index and how it works?"
description: "See how the Sales Readiness Index combines knowledge, skill, and engagement into a readiness score."
slug: what-is-sales-readiness-index
sidebar_position: 999
last_update:
  date: 2026-11-27
  author: Manaswini V
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [sales-readiness-index, index, knowledge, skill, engagement]
draft: true
---

> **At a glance** - The Sales Readiness Index shows how prepared your sales team is to perform effectively. It combines three components, **Knowledge**, **Skill**, and **Engagement**, into an individual readiness score for each user.

Use the Sales Readiness Index to understand individual and team readiness, identify strengths and areas that need improvement, and compare your team's results with the wider organization.

## When to use this

Use the Sales Readiness Index when you want to:

- Understand how prepared each user is to perform in the field.
- Review users' Knowledge, Skill, and Engagement scores.
- Compare readiness across teams and organizational groups.
- Identify users who may need additional learning support or coaching.
- Track changes in readiness over a selected period.

## How the Sales Readiness Index works

The Sales Readiness Index uses three components to calculate each user's readiness score:

1. **Knowledge** measures how well the user performs in assessments.
2. **Skill** measures how well the user performs in coaching exercises.
3. **Engagement** measures how consistently the user completes assigned modules.

Each component is calculated separately and contributes to the user's overall Readiness Index based on the weights configured by your organization.

## 1. Understand the three readiness components

### Knowledge - Average quiz score

Knowledge measures how well a user performs in assessments. It is based on the user's average score across all eligible quizzes completed during the selected period.

**How it is calculated:**

- Consider all eligible quizzes completed by the user within the selected period.
- Use only the user's most recent attempt for each quiz.
- Add the scores from the most recent attempts and divide the total by the number of quizzes completed.
- Earlier attempts are excluded, so retakes do not count more than once.

**Example:**

A user completed three quizzes during the selected period. Their most recent scores are:

| Quiz   | Most recent score |
| ------ | ----------------- |
| Quiz 1 | 80%               |
| Quiz 2 | 70%               |
| Quiz 3 | 90%               |

The three scores are added together and divided by the number of quizzes completed. The resulting average is 80%.

The user's **Knowledge Score is 80%**.

### Skill - Average coaching score

Skill measures how well a user performs in coaching exercises. It is based on the user's average score across all eligible coaching sessions completed during the selected period.

**How it is calculated:**

- Consider all eligible coaching sessions completed by the user within the selected period.
- Use only the user's most recent attempt for each coaching session.
- Add the scores from the most recent attempts and divide the total by the number of coaching sessions completed.
- Earlier attempts are excluded, so retakes do not count more than once.

**Example:**

A user completed three coaching sessions during the selected period. Their most recent scores are:

| Coaching session | Most recent score |
| ---------------- | ----------------- |
| Session 1        | 75%               |
| Session 2        | 85%               |
| Session 3        | 80%               |

The three scores are added together and divided by the number of coaching sessions completed. The resulting average is 80%.

The user's **Skill Score is 80%**.

### Engagement - Percentage of assigned modules completed

Engagement measures how consistently a user completes the modules assigned to them during the selected period.

**How it is calculated:**

- Consider the modules assigned to the user during the selected period.
- Identify how many of those assigned modules the user has completed within the same period.
- Divide the number of completed assigned modules by the total number of assigned modules.
- Convert the result into a percentage.

**Example:**

A user has 10 assigned modules and has completed 8 of them during the selected period.

The number of completed modules is divided by the total number of assigned modules and converted into a percentage. The resulting Engagement Score is 80%.

The user's **Engagement Score is 80%**.

## 2. Understand how the three components combine

Once Knowledge, Skill, and Engagement are calculated, they are combined to produce the user's overall Readiness Index.

Each user receives an individual readiness score on a scale of **0 to 100**. The score is calculated using a weighted average of the three components.

**Default calculation:**

By default, all three components have equal weights:

- Knowledge contributes one-third of the overall score.
- Skill contributes one-third of the overall score.
- Engagement contributes one-third of the overall score.

Your organization can configure different weights based on the relative importance of each component.

**Example:**

Suppose a user's component scores are:

| Component  | Score | Default weight |
| ---------- | ----- | -------------- |
| Knowledge  | 80%   | One-third      |
| Skill      | 70%   | One-third      |
| Engagement | 90%   | One-third      |

Since all three components have equal weights by default, their scores are averaged. The user's overall Readiness Index is 80 out of 100.

If your organization uses different weights, the overall score is calculated using those configured weights instead.
![Understand how Knowledge, Skill, and Engagement are calculated and combined to determine each user’s overall Sales Readiness Index.](/img/helpscout/authored/what-is-sales-readiness-index-mwyn3ipe.png)
## 3. Understand how the selected period affects the score

The Sales Readiness Index considers activity within the selected reporting period. You can review readiness using the following period options:

- **Last 30 Days:** Includes activity from the last 30 days.
- **Last 90 Days:** Includes activity from the last 90 days.
- **Custom Date Range:** Includes activity from the selected start date through the end date, including the full end date.

The Knowledge, Skill, and Engagement calculations all follow the selected period.
![date range](/img/helpscout/authored/what-is-sales-readiness-index-mwyn6dws.png)
## 4. Understand which users and records are included

The following rules determine which users and activity records contribute to the Sales Readiness Index:

- **Eligible modules:** Only quizzes and coaching sessions marked **Include in Readiness Index** by your administrators contribute to the calculation.
- **Latest attempts:** Only the most recent attempt for each quiz or coaching session is considered. Earlier attempts remain in the audit history but do not affect the scores.
- **Missing components:** If a user has not taken any quizzes or coaching sessions, the missing component is treated as zero in the overall calculation. The user still counts in averages.
- **Users with no activity:** Users with no assignments or completions during the selected period are excluded from the dashboard.
- **Removed records:** Modules and submissions marked as removed are automatically excluded from the calculations. Historical records remain in the system for audit.

## 5. Understand how team and organization readiness is calculated

The Sales Readiness Index helps leaders understand readiness at the team and organization levels.

The dashboard first calculates each user's individual Readiness Index. It then averages these individual scores to show team-wide and organization-wide readiness.

- **My Team:** Shows the average readiness of users within your permitted view and selected filters.
- **Org Avg:** Shows the average readiness of the entire organization, regardless of the active filters. This allows you to compare your team's results against the organization-wide benchmark.

The dashboard displays the headline readiness score on a **0–10 scale** and assigns a proficiency tier based on the score.

The nine proficiency tiers are:

- Novice
- Path Finder
- Kick Starter
- Pioneer
- Achiever
- Master
- Champion
- Legend
- Super Star

Each tier covers a one-point band on the 0–10 scale. For example, a team with a readiness score of 6.6 falls into the **Master** tier.
![Understand how team and organization readiness is calculated](/img/helpscout/authored/what-is-sales-readiness-index-mwyn8ph5.png)
## Things to know

- Knowledge, Skill, and Engagement are calculated separately before being combined into the overall Readiness Index.
- The default weights are equal, but your organization can configure different weights.
- A missing Knowledge or Skill component is treated as zero in the overall calculation.
- Team and organization averages are calculated by averaging individual users' readiness scores.
- The dashboard refreshes once daily at **6:00 PM IST**. Activity recorded after the latest sync appears after the next scheduled sync.
- The Readiness Index is intended for reviewing readiness trends and comparing performance over time, not for real-time monitoring.