---
id: fix-duplicate-scoring-in-ai-coaching-leaderboard-calculations
title: "Fix duplicate scoring in AI coaching leaderboard calculations"
description: "Leaderboard scores for AI coaching competitions now count each attempt once and use a consistent canonical record."
slug: fix-duplicate-scoring-in-ai-coaching-leaderboard-calculations
sidebar_position: 20
last_update:
  date: 2026-09-11
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
  tags: [video-coaching, ai-coaching, reports]
draft: true
---
{/* release-draft: tag=v3.58.97 issue=9617 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9617 */}

Leaderboard scores for AI coaching competitions now count each attempt once. If a coaching attempt is re-evaluated or a scoring callback runs more than once, the leaderboard uses the latest canonical result.

You can view affected leaderboards in **Coaching Competitions** in the SmartWinnr app. If historical scores look inflated, a leaderboard recalculation corrects them.

## When to use this

Use this when you want to understand why an AI coaching leaderboard score changed or looks too high.

- A coaching attempt was evaluated more than once.
- A scoring callback ran again for the same record.
- Two records shared the same timestamp and needed a consistent winner.
- Historical leaderboard scores need correction after duplicate scoring.

## Things to know

:::note
Records that were already marked as scored are not affected by this fix.
:::

:::caution
If older scores were inflated, a leaderboard recalculation may be needed to correct them.
:::