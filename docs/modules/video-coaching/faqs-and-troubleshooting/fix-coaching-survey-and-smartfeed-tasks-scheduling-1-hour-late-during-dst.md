---
id: fix-coaching-survey-and-smartfeed-tasks-scheduling-1-hour-late-during-dst
title: "Fix coaching, survey, and SmartFeed tasks scheduling 1 hour late during DST"
description: "Coaching, survey, SmartFeed, and competition task times save at the exact time you enter during Daylight Saving Time."
slug: fix-coaching-survey-and-smartfeed-tasks-scheduling-1-hour-late-during-dst
sidebar_position: 240
last_update:
  date: 2026-10-30
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
tags: [video-coaching]
draft: true
---
{/* release-draft: tag=v3.60.08 issue=9780 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9780 */}

Scheduled start and end times for coaching scenarios, surveys, SmartFeeds, and competition tasks save at the exact time you enter during Daylight Saving Time.

Use this behavior when you create or duplicate scheduled content in a timezone that is observing DST. The saved times match the values you type in the editor.

## When to use this

Use this behavior when you schedule content during Daylight Saving Time and want the saved time to match your entry.

- You are creating a coaching scenario during DST.
- You are duplicating a coaching scenario during DST.
- You are creating a survey or SmartFeed during DST.
- You are scheduling a competition task during DST.

## Things to know

:::note
Quiz scheduling already follows this behavior.
:::

:::note
A small number of timezones with non-standard DST shifts may still behave differently.
:::