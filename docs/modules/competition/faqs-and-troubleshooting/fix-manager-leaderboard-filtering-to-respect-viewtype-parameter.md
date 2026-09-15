---
id: fix-manager-leaderboard-filtering-to-respect-viewtype-parameter
title: "Fix manager leaderboard filtering to respect viewType parameter"
description: "The leaderboard now shows only immediate reportees in My Team view on the manager dashboard."
slug: fix-manager-leaderboard-filtering-to-respect-viewtype-parameter
sidebar_position: 10
last_update:
  date: 2026-09-15
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
tags: [competition, troubleshooting]
draft: true
---
{/* release-draft: tag=v3.59.06 issue=9638 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9638 */}

The competition leaderboard now matches the selected view on the manager dashboard. When you switch to **My Team**, you see only immediate reportees on the leaderboard.

Use this behavior to confirm that the leaderboard is filtering the right people in the right view.

## When to use this

Use this when you want to confirm how the competition leaderboard behaves in **My Team** view.

- You switch between team views on the manager dashboard.
- You expect the leaderboard to show only direct reports in **My Team**.
- You want to verify that the leaderboard matches the selected dashboard view.

## Things to know

:::note
If the leaderboard is available to you, **My Team** view now shows only immediate reportees.
:::

:::note
If a view parameter is not provided, the leaderboard still loads normally.
:::