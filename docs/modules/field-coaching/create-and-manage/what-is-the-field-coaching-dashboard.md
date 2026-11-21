---
id: what-is-the-field-coaching-dashboard
title: "What is the Field Coaching Dashboard"
description: "See how field coaching is running across your organization and what it shows about skills."
slug: what-is-the-field-coaching-dashboard
sidebar_position: 999
last_update:
  date: 2026-11-21
  author: Aswani TK
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [field-coaching]
draft: true
---

> **At a glance** - The Field Coaching Dashboard shows coaching activity across your organization. Use it to review participation, manager performance, and competency trends.

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

There are 3 tabs in the dashboard:

1. **Participation**
2. **Manager View**
3. **Competency Analysis**

![Tabs in field coaching dashboard](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqfr2u8.png)

### 1. Review the Participation tab

The Participation tab tells you whether coaching is happening as planned across the organization. Click **Participation** under the page title to open it.

Check the summary cards. Five cards sit across the top. Each shows the value for the selected period and the change against the prior period.

1. **Number of Managers**: How many managers are coaching. Managers with at least one session assigned in the period count once.
2. **Coachees Assigned**: How many people are being coached. People with at least one session assigned in the period, completed or not, count once.
3. **Completed Sessions**: How much coaching has been done. Sessions assigned in the period that are now completed count here. A coachee with three completed sessions adds three.
4. **Completion %**: How much of the assigned coaching is done. This is **Completed Sessions** divided by all sessions assigned in the period, to one decimal place.
5. **Total Sessions**: The size of the coaching plan. This includes all sessions assigned in the period, whatever their status.
6. **Avg Final Score**: Overall session quality, for forms with scoring only. This is the average final score of completed, scored sessions assigned in the period. It replaces **Total Sessions** on forms with scoring.

![cards](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqg0yzc.png)

Check the **Session Completion Trend**.

1. Find the line chart on the left, below the cards.
2. Read the two lines per month: **Assigned** for sessions assigned that month, and **Completed** for how many of those are now completed.
3. Hover over a point to see the exact values.

Each session sits in the month it was assigned, so the gap between the lines is work from that month still outstanding. Only months with sessions appear.

What to look for: a widening gap means coaching is falling behind plan. The most recent month will naturally show a gap while its sessions are still being carried out.

![Session Completion Trend](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqgon7j.png)

Check **Completion % by Manager**.

1. Find the bar chart on the right, below the cards.
2. Each bar is one manager's completed sessions divided by the sessions assigned to them in the period.
3. Managers are ranked from the highest completion rate down.
4. If there are more than 15 managers, only the top 15 are shown and the subtitle gives the total. Use the **Participation Report** in Step 5 to see everyone.

![Completion %](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqgpet9.png)

### Review the Participation Report

To work with the table:

1. Use the **All Statuses** dropdown to filter by status, for example to list only managers who are **At Risk**.
2. Click any column header to sort by that column.
3. Click **Manage columns** to show or hide columns.
4. Click **Download Report** to export every manager for the current filters to Excel. The file is prepared in the background and appears in the **Generated Reports** section. It includes all managers, whatever status filter, sort, or page is shown on screen.

![participation status](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqgzil9.png)
![participation status](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqgzxq9.png)

Below are the attributes of the **Participation Report** table.

- **Manager**: The manager's name and email address.
- **Division**: The manager's division.
- **Coachees Assigned**: People with a session assigned to this manager in the period.
- **Completed Sessions**: This manager's sessions assigned in the period that are completed.
- **Total Sessions**: All sessions assigned to this manager in the period.
- **Completion %**: **Completed Sessions** divided by **Total Sessions**.
- **Avg Score**: Average final score of this manager's completed sessions, for forms with scoring only.
- **Status**: A band based on **Completion %**.

Different **Completion %** values and their status:

- **100%**: **Complete**
- **80% to under 100%**: **On Track**
- **50% to under 80%**: **Behind**
- **Under 50%**: **At Risk**

### 2. Review the Manager View tab

The Manager View shows one manager and the people they coach. Every section uses the same period and filters as the rest of the dashboard.

#### 2.1 Select the manager

1. Click **Manager View** under the page title.
2. Open the **Manager** dropdown at the top.
3. Choose a manager. The list comes from the Participation Report and starts with the highest completion rate.

![Manager View](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqigez3.png)

#### 2.2 Check the manager's summary cards

The cards are the same as on the Participation tab (**Coachees Assigned**, **Completed Sessions**, **Completion %**, **Total Sessions**, and, for forms with scoring, **Avg Final Score**), calculated only for the sessions this manager runs. **Number of Managers** is not shown.

What to look for: whether this manager is keeping up with their own coaching plan.

![cards](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqihj1e.png)

#### 2.3 Check the manager's Session Completion Trend

Read the monthly **Assigned** and **Completed** lines in the same way as on the Participation tab, for this manager only. A gap shows sessions from that month still outstanding.

![Session Completion Trend](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqijkac.png)

#### 2.4 Check Reportee Sessions

This table has one row for every person the manager has coached on the selected form.

1. Note who is listed: everyone the manager has ever coached on this form, not only people coached in the period. Anyone with no session in the period appears as **Not Started**.
2. Scroll to the end of the list for greyed-out rows:
   - "No longer in this team. Now reports to [name]" means the person now reports to a different manager. People who report to someone further down this manager's team still count as part of the team.
   - "No longer active. This user has been deleted." means the account was deleted. The person stays on the list because their past sessions still happened.
3. Read each column:

Column: Meaning

**Coachee**: The person's name, plus the moved-team or deleted note where it applies.

**Sessions**: Sessions assigned to this person by this manager in the period, whatever their status.

**Latest Score**: Score of the most recently assigned session in the period: its final score, or its average rating where there is no final score.

**Last Coached**: Date the most recent session was completed. Blank if that session is not completed yet.

**Final Scores**: Forms with scoring only. Final scores of completed sessions in the period, oldest first, e.g. 62 > 70 > 78.

**Score Trend**: Forms with scoring only. Compares the first and last of those scores.

**Status**: Based on the most recently assigned session in the period.

Score Trend: Rule

**Improving**: Latest final score is more than 5 points above the first one in the period.

**Declining**: Latest final score is more than 5 points below the first one.

**Flat**: The two are within 5 points of each other.

**Baseline**: Only one scored session so far, so nothing to compare yet.

Status: Rule

**Complete**: The most recent session in the period is completed.

**Due Soon**: The most recent session in the period is assigned or in progress.

**Not Started**: No session for this person in the period.

![Reportee Sessions](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqirgpe.png)

#### 2.5 Check the Coach vs Self-Assessment Gap

This section compares how the manager rates each person with how those people rate themselves. It covers all ratings on the selected form, not only the selected period.

1. **Gap by Reportee**: Check each person's average difference between their own rating and the manager's rating, across competencies where both exist.
   - Positive means the person rates themselves higher than the manager does; negative means lower.
   - Within 0.5 either way is aligned (green); above +0.5 is amber; below -0.5 is purple.
2. **Gap by Competency**: Compare the average manager rating with the average self rating for each competency across the team.

What to look for: large gaps point to development conversations where a person sees their skills differently from their manager.

![Coach vs Self-Assessment Gap](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqj3ifn.png)

#### 2.6 Check the Competency Heatmap - Reportees

1. Read the grid: one column per person, one row per competency. Each cell is that person's average rating for that competency from this manager's sessions.
2. Use the competency group dropdown at the top right of the heatmap to narrow the grid to one group of competencies.
3. Read the cell colors using the rating color scale in the Quick reference section.
4. Check the column labels: "no sessions yet" means no ratings so far, "now in another team" means the person moved team, and "no longer active" means the user was deleted.

The heatmap uses the final saved rating from each session, across all of this manager's sessions on the form, not limited to the selected period. Self-ratings, where collected, are included in the average.

![Competency Heatmap](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqj4shz.png)

### 3. How to check the Competency Analysis tab

The Competency Analysis tab shows what coaching reveals about skills. Click Competency Analysis under the page title to open it. The tab is not shown for forms that do not collect competency ratings.

Every section uses competency ratings (1 to 5) given on the selected form during the selected period, based on the date each rating was given. Only the final saved version of each rating counts, once. Where the form collects self-assessments, averages include them alongside coach ratings, except in the Score vs Rating Scatter.

![Competency Analysis tab](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqjhnpu.png)

### 1: Check the Competency Score Distribution
1.  Use the attribute dropdown (for example Designation) to choose which people attribute forms the columns, such as Designation or Region.
2.  Use the All Competency Groups dropdown to narrow the rows to one competency group.
3.  Read each cell: the average of all ratings for that competency given to coachees with that attribute value in the period.
4.  Read the cell colors using the rating color scale in the Quick reference section.
The attribute value used is the one recorded for the coachee when the rating was given.
What to look for: whether a skill gap is specific to one role, region or group, so training can be targeted.

![Competency Score Distribution](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqjjb2m.png)

### 2: Check the Competency Score Trend
1.  Read one line per competency, showing its average rating in each month.
2.  Use the competency group dropdown to narrow the chart to one group.
3.  Use the legend below the chart to identify each competency's line.
What to look for: rising lines show coaching is building that skill; a falling line is an early warning.

![Competency Score Trend](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqjkesc.png)

### 3: Check the Competency Snapshot

1.  Read one bar per competency, showing its average rating for the selected period.
2.  Bars are ordered highest first, so the strongest skills are at the top and the weakest at the bottom.
3.  Use the competency group dropdown to narrow the list.

![Competency Snapshot](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqjlnqe.png)

### 4: Check the Competency Detail table

What to look for: use Responses to judge how much evidence sits behind each average, and Change vs Prior to see which skills are improving or slipping.

### Column: Meaning

Competency: The skill being rated.

Group: The competency group it belongs to.

Avg Score: Average rating in the selected period, to two decimal places.

Responses: How many ratings were given for this competency in the period.

Change vs Prior: Avg Score minus the average in the prior period. Green with an upward arrow for an increase, red with a downward arrow for a decrease. "No prior data" when the competency was not rated in the prior period.

![Competency Detail table](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqjsy8d.png)

### 5: Check the Self-Assessment Gap Analysis (forms with self-assessment only)

This section compares coachees' self ratings with their coaches' ratings across the whole organization.
1.  Self-Awareness Distribution: check the donut, which counts coachees in three groups based on their average gap (self rating minus coach rating) across competencies.
2.  Gap Trend Over Time: check the average size of the gap, ignoring direction, in each month. A falling line means coachees' view of their skills is moving closer to their coaches' view.
3.  Perception Gap by Competency: check the average of self rating minus coach rating per competency. Positive means coachees rate themselves higher; negative means lower. Bars closer to zero are greener; larger gaps are more orange.

### Average gap: Group

Between -0.5 and +0.5: Aligned

Above +0.5: Over-raters (rate themselves higher than their coach does)

Below -0.5: Under-raters (rate themselves lower than their coach does)

![Self-Assessment Gap Analysis](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqkunyj.png)
![Perception Gap by Competency](/img/helpscout/authored/what-is-the-field-coaching-dashboard-mwqkvx1i.png)