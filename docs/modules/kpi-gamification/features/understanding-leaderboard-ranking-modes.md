---
id: understanding-leaderboard-ranking-modes
title: "Understanding Leaderboard Ranking Modes"
description: "Learn how competition ranking modes work and how global, quarterly, and quiz leaderboards display performance."
slug: understanding-leaderboard-ranking-modes
sidebar_position: 203
last_update:
  date: 2026-10-07
  author: Anagha Isal
customProps:
  owner: jazz.k@smartwinnr.com
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: ["gamification"]
draft: false
---

> **At a glance** - SmartWinnr offers different ranking modes for Competition Leaderboards to determine how users with the same score are ranked. SmartWinnr also offers multiple leaderboard types to show different kinds of performance and points.

SmartWinnr includes ranking modes for competition leaderboards and organization-level leaderboard views for users. Organizations can choose different ranking modes for their competitions depending on how they want ties and positions to be displayed. Ranking modes are applicable only to Competition Leaderboards.

## When to use this

Organizations can configure different org-level leaderboards to show users' overall performance, including Global, Quarterly, Division-wise Global Points, and Quiz leaderboards.

- Use a global leaderboard when you want to track points across multiple SmartWinnr activities.
- Use a quarterly leaderboard when you want to review quiz performance over a quarter.
- Use a quiz leaderboard when you want to show ranking for specific quiz.
- Choose a ranking mode when users can earn the same score in a competition.

For Competition Leaderboards, organizations can choose how ranks are assigned when users have the same score:
- Normal Ranking
- Tie Ranking
- Competition Ranking

## Ranking Modes for Competition Leaderboards

Ranking modes determine how users are ranked on a **Competition Leaderboard**, particularly when multiple users have the same score.

### 1. Normal Ranking

In **Normal Ranking**, each user is assigned a unique rank based on their score.

Even when two users have the same score, they receive different ranks. First person who achieve the score comes in the higher rank.

**Example:**

| User | Score | Rank |
|---|---:|---:|
| User A | 100 | 1 |
| User B | 90 | 2 |
| User C | 90 | 3 |
| User D | 80 | 4 |

Here, Users B and C have the same score, but they are assigned different ranks.

### 2. Tie Ranking

In **Tie Ranking**, users with the same score receive the **same rank**.

**Example:**

| User | Score | Rank |
|---|---:|---:|
| User A | 100 | 1 |
| User B | 90 | 2 |
| User C | 90 | 2 |
| User D | 80 | 3 |

Users B and C have the same score, so both receive Rank 2. The next user receives Rank 3.

### 3. Competition Ranking

In **Competition Ranking**, users with the same score receive the same rank, and the next rank is skipped.

**Example:**

| User | Score | Rank |
|---|---:|---:|
| User A | 100 | 1 |
| User B | 90 | 2 |
| User C | 90 | 2 |
| User D | 80 | 4 |

Users B and C share Rank 2. Since two users occupy Rank 2, the next user is ranked 4th.

### Ranking Modes at a Glance

| Ranking Mode | How users with the same score are ranked | Example |
|---|---|---|
| **Normal Ranking** | Each user receives a different rank | 1, 2, 3, 4 |
| **Tie Ranking** | Users with the same score receive the same rank | 1, 2, 2, 3 |
| **Competition Ranking** | Users with the same score receive the same rank and the next rank is skipped | 1, 2, 2, 4 |

## Org-Level Leaderboards

Org-level leaderboards provide broader views of user performance beyond an individual competition.

### Global Points Leaderboard

The **Global Points** leaderboard provides an overall view of points accumulated by users over a selected period. You can find the global leaderboard with total points and ranks under Admin > Global points. 

![Global points](/img/helpscout/authored/understanding-leaderboard-ranking-modes-muydcq7o.png)

Here, goto Hamburger menu and choose **View Aggregated Ranks** to find the total points and rank obtained at global level for each user.

![Aggregated rank](/img/helpscout/authored/understanding-leaderboard-ranking-modes-muyecyye.png)

You can also view the division wise global points here. Filter with the required Business Unit and you can find the **Division-wise Global Points Leaderboard** which provides users' global points and rankings within the selected division.

This provides a way to compare performance within a specific organizational division rather than only looking at the overall organization.

### Quarterly Leaderboard

The **Quarterly Leaderboard** displays user's total quiz performance for each quarter. This is available under **Editor >> Questions and Quizzes > Reports > Team Analytics**

![Quaterly leaderboard](/img/helpscout/authored/understanding-leaderboard-ranking-modes-muyd9i76.png)

Users can navigate between quarters to view the leaderboard for the selected period. For example, the leaderboard can display **Q3 2026**, with options to move to the previous or next quarter.

The leaderboard can display information such as:

- Rank
- User name
- Country (Sub BU)
- Score
- Analytics, which takes you to the details report of the quizzes completed by the selected user.

### Quiz Leaderboard

The **Quiz Leaderboard** displays rankings based on quiz performance. It is created by default when a quiz is setup in SmartWinnr. You can find the quiz leaderboard under the quiz analytics page.

Depending on the configuration, the leaderboard can display information such as:

- Rank
- User name
- Country
- Completion time (for timed quiz)
- Score
- Analytics

![Quiz leaderboard](/img/helpscout/authored/understanding-leaderboard-ranking-modes-muyenszz.png)

The quiz leaderboard can therefore be used to compare users based on their quiz scores and, where enabled, the time taken to complete the quiz.
