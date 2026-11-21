---
id: what-is-the-field-coaching-dashboard
title: "What is the Field Coaching Dashboard"
description: "See how field coaching is running across your organization and what it shows about skills."
slug: what-is-the-field-coaching-dashboard
sidebar_position: 277
last_update:
  date: 2026-11-21
  author: Aswani TK
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: ["field-coaching"]
draft: true
---

The Field Coaching Dashboard gives you one place to review coaching activity across your organization. Use it to see whether coaching is happening, how it is distributed, and what it shows about skills.

The dashboard includes three tabs: **Participation**, **Manager View**, and **Competency Analysis**. Each tab answers a different question about coaching activity and performance.

## When to use this

Use the dashboard when you want to:

- Check whether coaching sessions are being assigned and completed.
- Review coaching activity for one manager and their team.
- Compare coaching results across competencies.
- Filter results by form, time period, and organizational attributes.

## Before you start

Set the time period, coaching form, and filters before you review the numbers. Every metric on the dashboard depends on those selections.

## Steps

### 1. Open the dashboard

Go to the **Field Coaching** section and select **Field Coaching Dashboard**.

![How to access field coaching dashboard](/img/helpscout/authored/authored-mwq1u6b7.png)

### 2. Choose a time period

Use the period controls at the top right to set the range you want to review. Choose **90D** for the last 90 days, **1Y** for the last year, or the calendar icon for a custom date range.

For a custom range, pick a start date from 1 January 2024 onward. The selected period includes today and the full first and last days.

![Select the date range for which you wanted to see the coaching submission data](/img/helpscout/authored/authored-mwq4ppqo.png)

### 3. Select a coaching form

Select **Filters** at the top right, then choose a form in **Field Coaching Form**. If you do not choose one, the first form in alphabetical order is used.

### 4. Apply filters

Use the same **Filters** panel to narrow the dashboard by **Business Unit**, **Country**, **Group**, **User Type**, and meta tags such as **Designation** and **Region**.

The **Applied Filters** bar under the page title shows what is active. Filters apply to coachees, and managers appear only when they still have matching coachees.

![Select the applicable filters](/img/helpscout/authored/authored-mwq4vjqd.png)

![Select the applicable filters](/img/helpscout/authored/authored-mwq4w11b.png)

## Things to know

:::note
All filters except **Division** apply to the coachee. A manager appears only when at least one coachee still matches the filters.
:::

:::note
For **Business Unit**, administrators can only see divisions they already have access to. The filter can narrow results, but it cannot widen access.
:::

:::note
For meta tags, multiple values of the same tag work as an OR match. Different tags must all match.
:::

There are 3 tabs in the dashboard

1. Participation
2. Manager View
3. Competency Analysis

![Tabs in field coaching dashboard](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqfr2u8.png)

1. Participation tab.

The Participation tab tells you whether coaching is happening as planned across the organization. Click Participation under the page title to open it.

Check the summary cards:
Five cards sit across the top. Each shows the value for the selected period and the change against the prior period.

1. Number of Managers: How many managers are coaching
Managers with at least one session assigned in the period. Each manager counts once.
2. Coachees Assigned: How many people are being coached
People with at least one session assigned in the period, completed or not. Each person counts once.
3. Completed Sessions: How much coaching has been done
Sessions assigned in the period that are now completed. A coachee with three completed sessions adds three.
4. Completion %: How much of the assigned coaching is done
Completed Sessions divided by all sessions assigned in the period, to one decimal place.
5. Total Sessions: The size of the coaching plan
All sessions assigned in the period, whatever their status.
6. Avg Final Score: Overall session quality (forms with scoring only)
Average final score of completed, scored sessions assigned in the period. Replaces Total Sessions on forms with scoring.

![cards](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqg0yzc.png)

Check the Session Completion Trend
1.  Find the line chart on the left, below the cards.
2.  Read the two lines per month: Assigned (sessions assigned that month) and Completed (how many of those are now completed).
3.  Hover over a point to see the exact values.
Each session sits in the month it was assigned, so the gap between the lines is work from that month still outstanding. Only months with sessions appear.
What to look for: a widening gap means coaching is falling behind plan. The most recent month will naturally show a gap while its sessions are still being carried out.

![Session Completion Trend](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqgon7j.png)

Check Completion % by Manager
1.  Find the bar chart on the right, below the cards.
2.  Each bar is one manager's completed sessions divided by the sessions assigned to them in the period.
3.  Managers are ranked from the highest completion rate down.
4.  If there are more than 15 managers, only the top 15 are shown and the subtitle gives the total. Use the Participation Report (Step 5) to see everyone.

![Completion %](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqgpet9.png)

Check Final Score Analytics (forms with scoring only)
These three charts cover sessions completed in the selected period that have a final score.
1.  Final Score Trend: check the average final score of sessions completed in each month to see whether session quality is improving.
2.  Final Score Distribution: check how many sessions fall into each of six equal score ranges, from the lowest score in the period to the highest.
3.  Final Score by Coach: check each coach's average final score, highest first. The top third of coaches are green, the middle third blue and the bottom third red, relative to this group.
Note: the Avg Final Score card counts sessions assigned in the period, while these charts count sessions completed in the period, so the two can differ slightly.

![participation status](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqgzil9.png)
![participation status](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqgzxq9.png)

Check the Participation Report

Below are the attributes of partipation report table.

Manager: The manager's name and email address.
Division: The manager's division.
Coachees Assigned: People with a session assigned to this manager in the period.
Completed Sessions: This manager's sessions assigned in the period that are completed.
Total Sessions: All sessions assigned to this manager in the period.
Completion %: Completed Sessions divided by Total Sessions.
Avg Score: Average final score of this manager's completed sessions (forms with scoring only).
Status: A band based on Completion % (see below).

Different Completion % and its status

100%: Complete
80% to under 100%: On Track
50% to under 80%: Behind
Under 50%: At Risk