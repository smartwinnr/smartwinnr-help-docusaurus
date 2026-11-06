---
id: what-is-role-play-inventory-report-custom-headers
title: "What is Role Play Inventory report custom headers"
description: "Customize Role Play Inventory report columns and review the new inventory details in the exported report."
slug: what-is-role-play-inventory-report-custom-headers
sidebar_position: 90
last_update:
  date: 2026-11-01
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [video-coaching]
draft: true
---
{/* release-draft: tag=v3.60.10 issue=9846 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9846 */}
{/* release-draft: tag=v3.60.10 issue=9838 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9838 */}
{/* release-draft: tag=v3.60.08 issue=9699 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9699 */}

The Role Play Inventory report supports custom report headers. You can reorder, rename, show, or hide columns to match the layout you need.

The report includes seven new columns after **AI Avatar**. These columns add more detail to each role play inventory row and appear in the exported report.

Dates in the downloaded Role Play Inventory report use the correct format. You see a space before **AM** or **PM**, and the rest of the date stays the same.

## When to use this

Use this when you want a more detailed Role Play Inventory report or a custom column layout.

- Review inventory data with the columns you care about most.
- Reorder columns to match your team’s reporting format.
- Rename columns to use familiar labels.
- Hide columns you do not need in the export.
- Review the added inventory details after **AI Avatar**.
- Confirm that downloaded date columns use the corrected time format.

## Before you start

The custom header option may not be visible to everyone. If you do not see it, contact SmartWinnr support.

## Things to know

The affected coaching reports download with native Excel date cells. That helps Excel filter and sort the dates correctly.

The affected reports are:

- Attempt Wise Coaching Report (XLSX)
- Attempt Wise Competency Report (XLSX)
- Combined Objective Report (CSV)
- Attempt Wise CSV Report

Date columns keep the **DD-MM-YY H:mm** display format. Excel respects that format when you open the file.

CSV reports remain text-based. Excel may still interpret CSV dates based on the locale on the computer that opens the file.

For the CSV report, dates pass through consistent formatting before download.

The Combined Objective Report appears in **Company Settings** and then **Permission Sets** for column-level access control.

The report includes metadata for **format_type** and **date_format** in the default headers for the affected CSV reports.

:::note
The corrected format applies to every date column in the Role Play Inventory report. It does not affect other parts of the product.
:::

:::note
Noon and midnight still render as **12:00 PM** and **12:00 AM**.
:::

:::note
A missing or unreadable date still appears blank.
:::