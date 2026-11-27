---
id: what-is-conversation-intelligence-talk-ratio
title: "What is Conversation Intelligence talk ratio"
description: "Understand how Conversation Intelligence calculates talk ratio and when it shows an estimated value."
slug: what-is-conversation-intelligence-talk-ratio
sidebar_position: 10
last_update:
  date: 2026-11-01
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [reports, ai-coaching]
draft: true
---
{/* release-draft: tag=v3.60.11 issue=9546 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9546 rev=eedbc4e1f434 */}
{/* release-update: issue=9546 summary="New article" */}

Conversation Intelligence talk ratio shows how speaking time is split across a conversation. It uses measured speaking time when the transcript supports it, and it falls back to an estimate when it does not.

You may also see talk time marked as estimated. That means the conversation still has a usable split, but the system could not measure it directly from the transcript data.

## When to use this

Use talk ratio when you want a quick view of how balanced a conversation was.

- Review whether one speaker dominated the call.
- Compare speaking balance across conversations.
- Check conversations that still have questions and monologue insights, even when timing data is incomplete.
- Understand why a talk ratio may appear as an estimate.

## Things to know

:::note
When talk ratio is estimated, it is clearly marked in the interface.
:::

:::note
Existing conversations can show an estimated talk ratio after they are reprocessed.
:::

:::note
New conversations show a measured split when the speakers are separated clearly in the transcript.
:::