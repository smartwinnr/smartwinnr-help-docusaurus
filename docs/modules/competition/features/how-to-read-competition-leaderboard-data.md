---
id: competition-leaderboard-time-display
title: "Competition leaderboard time display"
description: "View competition leaderboard times in minutes and whole seconds on group, participant, and manager app leaderboards."
slug: competition-leaderboard-time-display
sidebar_position: 10
last_update:
  date: 2026-10-30
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [reports]
draft: true
---
{/* release-draft: tag=v3.60.08 issue=9831 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9831 */}
{/* release-draft: tag=v3.60.08 issue=9863 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9863 */}

The competition group leaderboard, participant-wise competition leaderboard, and manager app competition leaderboards show time as minutes and whole seconds. For example, a time of 4:25 appears as 4:25.

This display applies to scores saved before the earlier fix and to new scores. Rankings and scores stay the same.

## When to use this

Use this when you want to confirm how competition leaderboard times appear on screen.

- Open a competition with a timed quiz.
- View the leaderboard by group on the web portal.
- View the leaderboard by participant on the web portal.
- Open the competition leaderboard in the manager app.

## Things to know

Only the displayed time is cleaned up. The stored leaderboard data is not rewritten.

The **Time** column shows minutes and whole seconds on the supported leaderboards.

Scores saved before the earlier fix may have included leftover milliseconds in storage. Those values appear as whole seconds on the leaderboard.