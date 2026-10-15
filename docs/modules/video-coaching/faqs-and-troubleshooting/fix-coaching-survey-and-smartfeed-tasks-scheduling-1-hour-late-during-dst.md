---
id: fix-daylight-saving-time-scheduling-for-coaching-survey-and-smartfeed-tasks
title: "Fix Daylight Saving Time scheduling for coaching, survey, and SmartFeed tasks"
description: "Scheduled start and end times now save at the exact time you enter during Daylight Saving Time."
slug: fix-daylight-saving-time-scheduling-for-coaching-survey-and-smartfeed-tasks
sidebar_position: 210
last_update:
  date: 2026-10-12
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
tags: [video-coaching]
draft: true
---
{/* release-draft: tag=v3.59.74 issue=9780 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9780 */}

Scheduled coaching scenarios, surveys, SmartFeeds, and competition tasks save at the exact time you enter during Daylight Saving Time. This keeps scheduled start and end times aligned with the time you typed in the editor.

Quiz scheduling already follows this behavior. Other task types now match it.

## When to use this

Use this when you schedule time-based content in a timezone that is observing Daylight Saving Time.

- You create a coaching scenario during DST.
- You duplicate a coaching scenario during DST.
- You create a survey during DST.
- You create a SmartFeed during DST.
- You schedule a competition task during DST.

## Things to know

:::note
You do not need to change how you create or duplicate content. The saved time matches the time you enter.
:::

:::caution
A small number of timezones use a non-standard DST shift. Those schedules may still behave differently.
:::