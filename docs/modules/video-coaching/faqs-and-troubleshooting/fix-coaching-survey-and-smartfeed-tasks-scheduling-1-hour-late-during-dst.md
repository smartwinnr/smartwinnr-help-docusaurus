---
id: fix-coaching-survey-and-smartfeed-tasks-scheduling-1-hour-late-during-dst
title: "Fix coaching, survey, and SmartFeed tasks scheduling 1 hour late during DST"
description: "Coaching, survey, SmartFeed, and competition task times save at the exact time you enter during Daylight Saving Time."
slug: fix-coaching-survey-and-smartfeed-tasks-scheduling-1-hour-late-during-dst
sidebar_position: 140
last_update:
  date: 2026-10-10
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
tags: [video-coaching]
draft: true
---
{/* release-draft: tag=v3.59.66 issue=9780 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9780 */}

When you schedule coaching scenarios, surveys, SmartFeeds, or competition tasks during Daylight Saving Time, the saved start and end times match what you enter. This keeps scheduled content aligned with the time you typed in the editor.

Use this behavior to confirm that time-based content starts and ends at the intended local time during DST. Quiz tasks already follow this behavior.

## When to use this

Use this when you schedule time-based content in a timezone that is currently observing Daylight Saving Time.

- You create a coaching scenario during DST.
- You duplicate a coaching scenario during DST.
- You create a survey during DST.
- You create a SmartFeed during DST.
- You schedule any competition task during DST.

## Things to know

:::note
You do not need to change how you create or duplicate content. The saved time now matches the time you enter.
:::

:::caution
A small number of timezones use a non-standard DST shift. Those schedules may still behave differently.
:::