---
id: understanding-sales-readiness-index-dashboard
title: "Understanding Sales Readiness Index Dashboard"
description: "See how the Sales Readiness Dashboard combines Knowledge, Skill, and Engagement into one readiness view."
slug: understanding-sales-readiness-index-dashboard
sidebar_position: 10
last_update:
  date: 2026-11-25
  author: Manaswini V
customProps:
  owner: jazz.k@smartwinnr.com
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: ["dashboard", "sales-readiness-index", "knowledge", "skill", "engagement"]
draft: false
---

> **At a glance** - The Sales Readiness Dashboard shows how prepared your sales team is to perform. It combines Knowledge, Skill, and Engagement into one readiness view.

Use the Sales Readiness Dashboard to review team readiness over time. You can compare your team with the organization, spot trends, and find users who need support. The dashboard also helps you recognize top performers and review readiness by region or other configured groups.

## When to use this

Use this dashboard when you want to:

- Check overall sales readiness for a selected period.
- Compare readiness across teams, regions, or other configured groups.
- Review which component is driving strong or weak readiness.
- Find top performers and users who need attention.
- Download readiness data for deeper analysis.

## Steps

### 1. Select a time period
Use the time-period options at the top of the dashboard to choose the period you want to review. You can select **30D**, **90D**, or **Custom Date Range**.
![Select a time period](/img/helpscout/authored/understanding-sales-readiness-index-dashboard-mww1bd0u.png)

After selecting the custom date range, click **Apply**.
All dashboard metrics and trends update to match the selected period.
![select the custom date range](/img/helpscout/authored/understanding-sales-readiness-index-dashboard-mww1c4dg.png)

### 2. Select **Filters** to narrow the dashboard data.

You can filter by **Region/Sub-region** or by tag-based filters such as role, level, or line of business. 
![Select the required filters, then click Apply to apply them.](/img/helpscout/authored/understanding-sales-readiness-index-dashboard-mww1jp2i.png)
If you do not apply extra filters, the dashboard uses the data you are allowed to see.

### 3. Review the Sales Readiness Index
The **Sales Readiness Index** is the headline score at the top of the dashboard. It shows an overall readiness score from 0 to 10 and the matching proficiency tier.

This section also shows:

- **My Team**: the average readiness score for your selected team and filter scope.
- **Org Avg**: the average readiness score across the full organization.
- **Active Users**: the number of users who completed at least one module during the selected period, out of the total cohort.

The dashboard groups readiness into these proficiency tiers:

- Novice
- Path Finder
- Kick Starter
- Pioneer
- Achiever
- Master
- Champion
- Legend
- Super Star

Each tier represents a one-point score band.
![Displays your team's average readiness score, organisation-wide average, active user count, and corresponding proficiency tier on a 0–10 scale.](/img/helpscout/authored/understanding-sales-readiness-index-dashboard-mww34txs.png)
### 4. Review the component cards
The dashboard shows three component cards: **Knowledge**, **Skill**, and **Engagement**.

Each card shows the organization-level average for that component and the change from the previous period.

- **Knowledge** shows the average score from completed quizzes.
- **Skill** shows the average score from completed coaching sessions.
- **Engagement** shows the percentage of assigned modules completed by users.

Use these cards to see which part of readiness is improving or declining.
![review the component cards](/img/helpscout/authored/understanding-sales-readiness-index-dashboard-mww3fh9r.png)

### 5. Analyze the readiness trend
The **Readiness Trend** chart shows how the overall readiness score and its three components change over the selected period.

It includes four lines:

- **Readiness Index**
- **Knowledge**
- **Skill**
- **Engagement**

Use this chart to see whether training and coaching efforts are moving readiness in the right direction.
![Shows how your overall readiness score and Knowledge, Skill, and Engagement scores change over the selected period.](/img/helpscout/authored/understanding-sales-readiness-index-dashboard-mww3joub.png)

### 6. Review component balance
The **Component Balance** chart compares **Knowledge**, **Skill**, and **Engagement** for the selected group.

A balanced chart shows steady performance across all three components. An uneven chart shows where the team may need more support.
![Compares your team's Knowledge, Skill, and Engagement scores to show strengths and areas that may need support.](/img/helpscout/authored/understanding-sales-readiness-index-dashboard-mww3mtq4.png)
### 7. Compare regional performance by component
The **Regional Performance by Component** section compares **Knowledge**, **Skill**, and **Engagement** across groups.

Use the dropdown to change the grouping based on configured attributes such as Zone, Business Unit, or Role. Each value shows the average score for that component in the selected group.
![Compares your group's average Knowledge, Skill, and Engagement scores across different groups, such as Zone, Business Unit, or Role.](/img/helpscout/authored/understanding-sales-readiness-index-dashboard-mww47w38.png)

### 8. Review readiness distribution
The **Readiness Distribution** section shows how users are spread across three readiness levels.

The levels are:

- **High**: readiness score of 80 or above
- **Medium**: readiness score between 60 and 79
- **Low**: readiness score below 60

Each user is counted once in the distribution.
![Review readiness distribution](/img/helpscout/authored/understanding-sales-readiness-index-dashboard-mww4czcn.png)
### 9. Identify top performers
The **Top Performers** section shows the five users with the highest readiness scores in the selected group and period.

Use this section to recognize strong performers and identify people who can share effective practices with others.
![Identify top performers](/img/helpscout/authored/understanding-sales-readiness-index-dashboard-mww4fbw7.png)
### 10. Review users who need attention
The **Needs Attention** section shows the five users with the lowest readiness scores.

It also shows each user's weakest component:

- **Knowledge**: may need more learning or content support
- **Skill**: may need more coaching and practice
- **Engagement**: may need follow-up to complete assigned activities

Use this section to plan support for users who need help.
![Review users who need attention](/img/helpscout/authored/understanding-sales-readiness-index-dashboard-mww4fndj.png)
### 11. Review the readiness list
The **Readiness List** gives you a detailed view of individual users and their scores.

It shows:

- **User Name**
- **Knowledge Score**
- **Skill Score**
- **Engagement Index**
- **Readiness Index**

The list is sorted by readiness score in descending order by default. Use **Filter** to narrow the list, or select **Report** to download the readiness data for further analysis.
![Review the readiness list](/img/helpscout/authored/understanding-sales-readiness-index-dashboard-mww4hagy.png)
## Things to know

:::note
The readiness calculation uses the most recent attempt for each quiz and coaching session.
:::

:::note
Only quizzes and coaching modules marked **Include in Readiness Index** contribute to the calculation.
:::

:::note
The default calculation gives equal weight to **Knowledge**, **Skill**, and **Engagement**. Organizations can configure different weights.
:::

:::note
If a user has no quiz or coaching activity, the missing component counts as zero.
:::

:::note
Users with no activity during the selected period are excluded from the dashboard cohort.
:::

:::note
The dashboard refreshes once daily at 6:00 PM IST. Activities recorded after the refresh appear after the next sync.
:::

:::note
Use this dashboard for readiness analysis and trend reviews, not real-time activity monitoring.
:::