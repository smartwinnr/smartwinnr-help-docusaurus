---
id: fix-metatag-effective-date-skipping-first-day-joiners-for-us-tenants
title: "Fix metatag effective date skipping first-day joiners for US tenants"
description: "Users who join on the effective date are included when you assign a SmartPath by metatag and date of joining."
slug: fix-metatag-effective-date-skipping-first-day-joiners-for-us-tenants
sidebar_position: 10
last_update:
  date: 2026-09-29
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
tags: [smartpath]
draft: true
---
{/* release-draft: tag=v3.59.45 issue=9670 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9670 */}

When you assign users in a SmartPath by metatag and date of joining, people who joined on the effective date are included. This applies when the assignment scope starts from a specific date.

If your batch was already set up with these options, it works correctly the next time assignments are processed. You do not need to save it again.

## When to use this

Use this behavior when you assign a SmartPath to users based on a metatag and a joining date.

- You want users who joined on the selected effective date to be included.
- You are assigning users from a specific start date.
- You want existing batches to continue working without changes.
- You want to confirm that the first day of the range is counted correctly.

## Things to know

:::note
This behavior matters for customers in timezones behind UTC, such as the United States. Customers in India and Europe do not see a difference.
:::

:::note
A batch may enroll fewer people if the first day of the date range is skipped. The assignment now includes that day correctly.
:::