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

# Understanding Adaptive Roleplay

## At a glance

Adaptive Roleplay enables SmartWinnr's AI persona to retain context from a learner's previous coaching attempts within the same scenario. This allows subsequent conversations to continue from earlier discussions, recall commitments and unresolved topics, and provide feedback on the learner's performance and progress.

The feature uses previous attempt summaries to support conversational continuity and provides performance insights to help managers and learning teams understand learner progress.

## When to use this

Use this article when:

- You want to enable Adaptive Roleplay for your organization.
- You want to understand how the AI persona remembers previous conversations.
- You want to know whether memory can be shared across different scenarios or HCP personas.
- You want to understand how evaluation and feedback work across multiple attempts.
- You want to understand how session summaries support conversation continuity, how performance summaries help managers and learning teams review progress, and how pre-session briefings prepare learners for their next attempt.
- You notice that the AI persona is not using relevant details from previous attempts to maintain continuity.

## 1. What is Adaptive Roleplay?

Adaptive Roleplay allows learners to continue a coaching conversation across multiple attempts without starting from scratch each time.

The AI persona uses information from previous attempts to maintain conversational continuity. For example, if the persona raises an objection or requests additional information in an earlier attempt, it can refer to that topic in a subsequent conversation.

Learners can continue addressing previous topics while discussing other aspects relevant to the scenario.

## 2. How to Enable Adaptive Roleplay

Adaptive Roleplay must be enabled for the applicable organization before it can be used.

### Step 1: Enable the organization settings

1. Navigate to **Admin > Company Settings > Organisation Configuration**.
![Navigate to Admin](/img/helpscout/authored/understanding-adaptive-roleplay-mv9f0p7y.png)
2. Set the following configuration values to `true`:
   - `enableAdaptiveLearning`
![enableAdaptiveLearning](/img/helpscout/authored/understanding-adaptive-roleplay-mv9f1zvm.png)
   - `enableAdaptiveRoleplay`
![enableAdaptiveRoleplay](/img/helpscout/authored/understanding-adaptive-roleplay-mv9f2n2g.png)
Enable these settings only for organizations that require Adaptive Roleplay.

### Step 2: Select the coaching type

When creating a coaching, select **Adaptive Roleplay** as the Coaching Type.
![select Adaptive Roleplay](/img/helpscout/authored/understanding-adaptive-roleplay-mv9f3vnm.png)
Once configured, the AI persona can use context from previous attempts of the same coaching scenario in subsequent conversations.

## 3. How Conversation Memory Works

Adaptive Roleplay uses information from the coaching setup, the current conversation, and previous attempts to support continuity.

The information used includes:

- **Roleplay setup:** The scenario description, the learner's first name, and the AI persona's name and role.
- **Current attempt:** The conversation transcript and calculated results, including the overall score, Smart Skills score, objectives achieved, coaching suggestions, objections and how they were handled, strengths, and improvement areas.
- **Previous attempts:** Earlier scores, objectives achieved, improvement areas, and session summaries from the same coaching.

Each attempt's session summary is retained and used to inform subsequent attempts. This helps the AI persona refer to previous commitments, revisit outstanding topics, and maintain continuity across conversations.

The system uses the last three attempts for memory.

## 4. Understand the Scope of Memory

Adaptive Roleplay memory is currently limited to a single scenario and must remain specific to the HCP persona.

### Memory within the same scenario

The AI persona can retain context from previous attempts of the same coaching scenario and use it to continue the conversation.

### Memory across different scenarios or HCP personas

Memory cannot currently be shared across different scenarios or HCP personas. Each conversation's context remains specific to the corresponding scenario and HCP persona.

## 5. Understand Evaluation and Feedback

Adaptive Roleplay provides scenario-specific evaluation for each attempt, along with additional feedback that considers performance across multiple attempts.

### Scenario-specific evaluation

The same evaluation criteria apply to each attempt. Previous conversation details are not considered in the standard scenario-specific evaluation.

### Feedback across attempts

Additional feedback combines results from different attempts to help managers and learning teams understand the learner's progress over time.

This feedback includes information about scores, objectives achieved, improvement areas, and recommendations.

## 6. Understand the Generated Outputs

Adaptive Roleplay produces three types of outputs: Session Summary, Performance Summary, and Pre-session Briefing.

### Session Summary

The session summary records the conversation for use in the next attempt and for managers reviewing the account.

It includes:

- Topics discussed during the conversation.
- Materials the learner promised to share.
- Commitments made by the learner.
- The AI persona's position and objections.
- The tone of the relationship.
- Where the conversation ended.
- Open topics and outstanding follow-ups.

### Performance Summary

The performance summary helps managers and learning teams review the learner's performance and progress.

It includes:

- Scores and an overview of performance.
- Observations about the quality of the conversation, including short quotes.
- How objectives and objections were handled.
- Smart Skills observations.
- Progress compared with earlier attempts.
- Three to five recommendations.

### Pre-session Briefing

The pre-session briefing is shown to the learner before the next attempt. It helps the learner recall the previous conversation and prepare to continue it.

It contains five to eight short bullet points covering:

- The person the learner is meeting and their current position.
- Where the previous conversation ended.
- What the learner promised to provide.
- The HCP persona's main concern.
- Topics or questions that may come up again.