---
id: add-submitted-for-review-columns-to-coaching-reports
title: "Add submitted-for-review columns to coaching reports"
description: "See submitted-for-review status and totals in coaching report exports when the feature is enabled."
slug: add-submitted-for-review-columns-to-coaching-reports
sidebar_position: 346
last_update:
  date: 2026-10-10
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [video-coaching]
draft: true
---
{/* release-draft: tag=v3.59.69 issue=9767 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9767 */}

> **At a glance** - Coaching report exports can include **Submitted For Review** and **Total Submitted For Review**. Use them to see which attempts were sent for manager review and how many submissions each coaching has.

Coaching report exports can include two submission columns: **Submitted For Review** and **Total Submitted For Review**. Use them to see which attempts were sent for manager review and how many submissions each coaching has.

These columns appear in coaching report downloads when the feature is enabled for your tenant and for the individual coaching.

## When to use this

Use these columns when you want review status in the same export as your coaching data.

- You want to check submission status without opening each coaching instance.
- You want totals for submitted attempts in report exports.
- You want the same submission details across multiple coaching report types.

## Before you start

Make sure the submission columns are enabled for your tenant and for the coaching you want to report on.

## Steps

### 1. Enable the report columns
Turn on the tenant-level setting for submission columns, and turn on the matching setting on each coaching you want included.

### 2. Download a coaching report
Export any coaching report that supports these columns. They appear in overall coaching reports, reportee-wise completion reports, archive reports, coaching instance reports, attempt-wise reports, and custom reports.

### 3. Read the new columns
Use **Submitted For Review** to see whether a row was submitted for manager review. Use **Total Submitted For Review** to see the total number of submissions.

## Things to know

:::note
The columns appear only when both settings are enabled.
:::