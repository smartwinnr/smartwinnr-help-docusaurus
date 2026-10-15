---
id: understanding-adaptive-roleplay
title: "Understanding Adaptive Roleplay"
description: "Learn how Adaptive Roleplay retains context across attempts, supports continuity, and generates summaries and feedback."
slug: understanding-adaptive-roleplay
sidebar_position: 349
last_update:
  date: 2026-10-15
  author: Manaswini V
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: ["adaptive-roleplay"]
draft: true
---

> **At a glance** - Adaptive Roleplay lets SmartWinnr carry context from earlier coaching attempts into later ones. It helps the AI persona continue the same conversation, surface unresolved topics, and generate summaries for learners and managers.

Adaptive Roleplay helps learners pick up a coaching conversation where they left off. The AI persona can remember key details from earlier attempts in the same scenario and use them in the next conversation. It also creates summaries and feedback that help managers and learning teams review progress.

## When to use this

Use Adaptive Roleplay when you want coaching sessions to build on prior attempts instead of starting over.

- Enable it for organizations that need continuity across repeated coaching attempts.
- Use it when you want the AI persona to remember commitments and open topics.
- Use it when you want managers to review progress across multiple attempts.
- Use it when you want learners to see a short briefing before their next attempt.

## Before you start

- Your organization must have Adaptive Roleplay enabled.
- You must select **Adaptive Roleplay** as the **Coaching Type** when you create the coaching.

## Steps

### 1. Open Organisation Configuration

Go to **Admin > Company Settings > Organisation Configuration**.

![Navigate to Organisation Configuration](/img/helpscout/authored/authored-mv9d0coe.png)

### 2. Enable the required settings

Set **enableAdaptiveLearning** and **enableAdaptiveRoleplay** to true in the configuration settings.

![configuration setting](/img/helpscout/authored/authored-mv9d97rb.png)

![enableAdaptiveLearning](/img/helpscout/authored/authored-mv9dfu60.png)

![enableAdaptiveRoleplay](/img/helpscout/authored/authored-mv9dfxxh.png)

### 3. Choose Adaptive Roleplay

When you create the coaching, select **Adaptive Roleplay** as the **Coaching Type**.

![Select the coaching type](/img/helpscout/authored/authored-mv9dvwn6.png)

## Things to know

:::note
Adaptive Roleplay uses the current conversation, earlier attempts, and the coaching setup to keep the session consistent.
:::

:::note
Memory stays within the same scenario and the same HCP persona.
:::

:::note
The system uses the last three attempts for memory.
:::

:::note
Adaptive Roleplay generates three outputs: **Session Summary**, **Performance Summary**, and **Pre-session Briefing**.
:::

:::note
The **Session Summary** captures topics discussed, commitments, objections, tone, open topics, and where the conversation ended.
:::

:::note
The **Performance Summary** helps managers and learning teams review scores, observations, progress, and recommendations.
:::

:::note
The **Pre-session Briefing** prepares learners for the next attempt with a short recap of the previous conversation.
:::