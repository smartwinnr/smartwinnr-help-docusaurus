---
id: add-lifecycle-and-include-archived-filters-to-coaching-report-downloads
title: "Add lifecycle and include-archived filters to coaching report downloads"
description: "Filter coaching report downloads by lifecycle status and include archived coachings when needed."
slug: add-lifecycle-and-include-archived-filters-to-coaching-report-downloads
sidebar_position: 10
last_update:
  date: 2026-09-29
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [video-coaching]
draft: true
---
{/* release-draft: tag=v3.59.45 issue=9716 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9716 */}

> **At a glance** - You can narrow coaching report downloads by lifecycle status. You can also include archived coachings in selected report downloads.

Use these filters when you need a report for a specific coaching state. They help you download only the coachings you want, or include archived coachings when a full history matters.

## When to use this

Use these options when you need a report that matches a specific coaching state.

- Download only published coachings for a standard report.
- Include draft, archived, or other lifecycle states in the Coaching Feedback Report.
- Include archived coachings in the Combined Objective Report or Attempt Wise CSV Report.
- Keep the default download behavior when you do not need archived coachings.

## Steps

### 1. Open the report download modal

Open the download modal for the coaching report you want to export.

For the Coaching Feedback Report, you will see a **Lifecycle** dropdown below **Report Type**.

![The Coaching Feedback Report modal with the Lifecycle dropdown below Report Type](/img/helpscout/authored/coaching-feedback-report-lifecycle-dropdown.png)

### 2. Choose a lifecycle filter

Use **Lifecycle** to filter the coaching records in the download.

**Published** is the default selection. Choose **All** to include every lifecycle state, or select a specific state to narrow the report.

### 3. Include archived coachings

For the Combined Objective Report or Attempt Wise CSV Report, open the download confirmation popup and select **Include Archived** when you want archived coachings in the file.

Leave **Include Archived** unchecked to keep the default report scope. You can also use **Include Demo Users** in the same popup when needed.

## Things to know

:::note
The **Lifecycle** dropdown appears in the Coaching Feedback Report download modal.
:::

:::note
The **Include Archived** checkbox appears in the Combined Objective Report and Attempt Wise CSV Report confirmation popups.
:::

:::note
If a filter is not visible, contact SmartWinnr support.
:::