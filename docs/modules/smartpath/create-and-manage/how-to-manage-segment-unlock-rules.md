---
id: manage-segment-unlock-rules
title: "How to manage Segment Unlock Rules"
description: "This article shows you how to configure Segment Unlock Rules in SmartPath to control learner access."
slug: manage-segment-unlock-rules
sidebar_position: 999
last_update:
  date: 2026-07-23
  author: Sandeep Bhuthagaddala
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
draft: false
tags: ["smartpath"]
---

> **At a glance** - Configure Segment Unlock Rules in SmartPath to guide learner access through structured learning journeys.

SmartPath allows organizations to create structured learning journeys by organizing content into Modules and Segments. You can control when learners access each segment by configuring Segment Unlock Rules, ensuring they complete prerequisites or meet specific conditions before moving on.

## When to use this

Use Segment Unlock Rules when you want to:

- Ensure learners complete content in a specific order.
- Release segments based on time schedules.
- Personalize learning paths based on assessment scores.

## Steps

***Note:** Unlock rules are available only at the Segment level and cannot be configured for an entire Module.*

### What are Segments?

A Segment is an individual learning activity within a Module.

A Segment can contain one of the following learning resources:

- SmartFeed
  - Images
  - PDF
  - PowerPoint
  - Videos
  - YouTube Videos
  - Audio
- Quiz
- Survey
- SCORM Package
- Coaching
- Learning Session

Each Segment represents a single learning activity that learners complete during their learning journey.

Configuring Segment Unlock Rules

Unlock Rules determine when a Segment becomes available to learners.

These rules are configured while arranging Segments inside a Module.

There are three available rule types:

- On Completion
- By Day
- By Score

**Rule Type: On Completion**

This rule unlocks the next Segment only after the learner completes the previous Segment.

**Example**

Segment 1 -> Complete

Segment 2 -> Unlocked

Segment 3 -> Locked

Once Segment 2 is completed, Segment 3 becomes available automatically.
![You can follow the below steps to check on completion rules in SmartWinnr.](/img/helpscout/authored/how-to-manage-segment-unlock-rules-mrxi6f1v.jpg)

Use this rule when learners must complete content in sequence.

### Rule Type: By Day

This rule releases Segments on specific days and times after the learner starts the SmartPath.

While configuring this rule, specify:
![You can follow the below steps to check By Day rules in SmartWinnr.](/img/helpscout/authored/how-to-manage-segment-unlock-rules-mrxi5o86.jpg)

This rule is useful for instructor-led programs, onboarding journeys, and scheduled learning plans.

### Rule Type: By Score

This rule unlocks Segments based on the learner's score in a previous assessment.

Available comparators include:

- Less Than
- Greater Than
- Equal To

The administrator specifies:
![You can follow the below steps to check By Score rules in SmartWinnr.](/img/helpscout/authored/how-to-manage-segment-unlock-rules-mrxhynxu.png)

This rule enables personalized learning paths based on learner performance.

### Important Notes

- Unlock Rules can only be configured from the second Segment onward within a Module.
- The first Segment of every Module is always available by default and cannot have an Unlock Rule.
- Unlock Rules are applicable only at the Segment level.
- Unlock Rules cannot be configured for an entire Module.
- Rules determine when learners gain access to subsequent Segments within the Module.
