---
id: how-to-analyse-a-smartpath-dashboard
title: "How to analyse a SmartPath Dashboard"
description: "Use the SmartPath Dashboard to review participation, progress, completion, and learner performance across SmartPaths."
slug: how-to-analyse-a-smartpath-dashboard
sidebar_position: 274
last_update:
  date: 2026-11-24
  author: release-pipeline@smartwinnr.com
customProps:
  owner: jazz.k@smartwinnr.com
  roles: [manager, editor, admin, orgadmin, lamadmin, superadmin]
tags: ["smartpath", "reports"]
draft: true
---
{/* release-draft: tag=v3.60.72 issue=10011 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/10011 rev=cc86fdc64539 */}
{/* release-update: issue=10011 summary="Adds guidance that SmartPath filters can include any number of selections and that the dashboard loads all panels and the learner progress report for the full selection." */}

> **At a glance** - Use the SmartPath Dashboard to review overall activity, drill into module-level analysis, and inspect learner participation.

The SmartPath Dashboard helps you monitor learning activity across SmartPaths. Use it to review completion trends, learner progress, scores, and participation patterns. You can also narrow the view by date range and organizational filters.

## When to use this

Use the SmartPath Dashboard when you want to understand how learners are progressing through assigned SmartPaths.

- Review overall completion and participation across SmartPaths.
- Compare progress and scores across learners.
- Spot programs with low completion rates.
- Focus on specific time periods or organizational groups.

## Steps

### 1. Open the dashboard
Go to the SmartPath Dashboard and review the available tabs: **Overview**, **Module Wise Analysis**, and **Participation Insights**.

### 2. Choose a date range
Select a preset range such as **30D** or **90D**, or use the calendar icon to choose a custom period. The dashboard updates to match the selected dates.

### 3. Apply filters
Click **Filters** in the upper-right corner to narrow the data by organizational fields such as **Zone**, **Designation**, **Product Line**, **Territory**, and **Therapeutic Area**, where configured. Apply your selections to update the dashboard.

You can select any number of SmartPaths, including **All**. The dashboard loads all panels and the learner progress report for the full selection.

### 4. Review the Overview tab
Use **Overview** to check summary metrics, charts, learner performance details, completion trends, learning component distribution, top-performing SmartPaths, and certification progress.

For a better understanding, refer to the [Understanding the Overview Tab on the SmartPath Dashboard](https://help.smartwinnr.com/modules/smartpath/reports-and-analytics/understanding-the-overview-tab-on-the-smartpath-dashboard?utm_source=chatgpt.com) article.

### 5. Review the Module Wise Analysis tab

Use Module Wise Analysis to review quiz, survey, and SmartFeed performance across SmartPaths. Check module-specific metrics, participation, average scores, and completion status to understand how learners are engaging with each learning component.

For a better understanding, refer to the [Understanding the Module Wise Analysis Tab on the SmartPath Dashboard](https://help.smartwinnr.com/modules/smartpath/reports-and-analytics/understanding-the-module-wise-analysis-tab-on-the-smartpath-dashboard?utm_source=chatgpt.com)

### 6. Check Participation Insights
Open **Participation Insights** to review participation, progress, completion, and scores across SmartPaths. Use the metrics, completion trend chart, and learner progress table to identify learners who need follow-up.

## Tips

- Compare **Total Participants** with **Total Completed** to gauge overall completion.
- Use **Average Progress** to see whether learners are moving forward before they finish.
- Review **Completion Over Time** to spot changes in activity across the selected period.
- Check **Time Spent** and **Last Activity** to understand recent engagement.

## Things to know

:::note
Dashboard metrics and records depend on the selected date range and applied filters.
:::

:::note
The **Score** column may show a dash when a score is unavailable or not applicable.
:::

:::note
Learners can show partial progress before they complete a SmartPath.
:::

:::note
The completion chart and learner table show different views of the same activity. The chart shows trends over time, and the table shows learner-level details.
:::

:::note
The dashboard sends filter selections in the request body, so large SmartPath selections still load successfully.
:::