---
id: understanding-leaderboard-ranking-modes
title: "Understanding Leaderboard Ranking Modes"
description: "Learn how competition ranking modes work and how global, quarterly, and quiz leaderboards display performance."
slug: understanding-leaderboard-ranking-modes
sidebar_position: 203
last_update:
  date: 2026-09-26
  author: Anagha Isal
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: ["gamification"]
draft: true
---

> **At a glance** - Use ranking modes to control how tied scores are ordered in competition leaderboards. Use leaderboard types to show different kinds of performance and points.

SmartWinnr includes ranking modes for competition leaderboards and organization-level leaderboard views for users. Ranking modes control how tied scores are ranked. Leaderboard types control what performance or points you see.

## When to use this

Use these leaderboard options when you want to compare performance across users or activities.

- Choose a ranking mode when users can earn the same score in a competition.
- Use a global view when you want to track points across multiple SmartWinnr activities.
- Use a quarterly view when you want to review quiz performance over a quarter.
- Use a quiz view when you want to show ranking for one quiz.

## Things to know

:::note
Organization-level leaderboards are controlled at the organization level.
:::

Competition leaderboards support three ranking modes when users have the same score.

### Normal ranking

Normal ranking gives each user a separate rank, even when scores match.

For example, scores of 20, 20, and 10 produce ranks 1, 2, and 3.

### Tie ranking

Tie ranking gives users with the same score the same rank.

The next user gets the next consecutive rank.

For example, scores of 20, 20, and 10 produce ranks 1, 1, and 2.

### Competition ranking

Competition ranking gives users with the same score the same rank.

The next rank skips ahead based on how many users share the previous rank.

For example, scores of 20, 20, and 10 produce ranks 1, 1, and 3.

Organization-level leaderboards are available at the user level.

### Global leaderboard

The Global Leaderboard shows overall points from configured SmartWinnr activities.

By default, it can include points from quizzes, SmartPath, coaching, and competitions.

Your organization can also include additional activities, such as first login and profile image upload.

### Quarterly leaderboard

The Quarterly Leaderboard shows quiz performance across all quizzes completed during a quarter.

It helps you review performance for a time period instead of one quiz at a time.

### Quiz leaderboard

The Quiz Leaderboard is created automatically for each quiz created by a Trainer or Editor.

It shows ranking for that specific quiz.

Your organization can disable it for a quiz when needed.

### Ranking mode vs. leaderboard type

Ranking mode and leaderboard type serve different purposes.

- Ranking mode controls how users are ordered when scores match.
- Leaderboard type controls what points or performance the leaderboard displays.

Use ranking mode for competition ordering. Use leaderboard type for the score source or time period you want to track.