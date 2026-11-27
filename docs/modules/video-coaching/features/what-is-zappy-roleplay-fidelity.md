---
id: what-is-zappy-roleplay-fidelity
title: "What is Zappy roleplay fidelity"
description: "See how Zappy keeps roleplay details, objections, and language aligned with your brief and uploaded files."
slug: what-is-zappy-roleplay-fidelity
sidebar_position: 100
last_update:
  date: 2026-11-02
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [video-coaching]
draft: true
---
{/* release-draft: tag=v3.60.20 issue=9885 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9885 rev=5ed4c28816cc */}
{/* release-update: issue=9885 summary="New article" */}

Zappy roleplay fidelity keeps the generated coaching aligned with your brief and uploaded files. It preserves the counterpart’s name, role, and attitude as entered, uses only the objections and facts you provide, and checks each round for invented details.

It also supports non-English coaching in the chosen language and native script, and it generates boost words for the speech recognizer from product and proper names. On the review screen, you can check the reference facts, boost words, and objective weights before you save or publish.

## When to use this

Use Zappy roleplay fidelity when you want the generated coaching to stay close to your source material.

- You want the counterpart to keep the same name, role, and attitude across runs.
- You want only the objections you named to appear in the roleplay.
- You want product details to come from uploaded files, not from added assumptions.
- You want coaching in a non-English language and script.

## Steps

### 1. Open Zappy
Open Zappy from the **AI Roleplay** menu. Then choose the role play type and describe the person you want to coach against.

### 2. Confirm the counterpart details
Check the **Counterpart role** and **Counterpart attitude** fields on the confirm card before you generate the roleplay. Zappy keeps those details exactly as you entered them.

### 3. Add objections and source files
Name the objections you want raised in the instructions, or upload the files that state them. Zappy uses only the objections and facts it finds in those inputs.

### 4. Generate the roleplay
Select **Generate AI Roleplay** to create the coaching. Zappy reads each uploaded file on its own, builds the scenario from those facts, and keeps the brief tied to the file content.

### 5. Review the generated details
On the review screen, check the **Product details** card. It shows the reference facts read from your files and the boost words the speech recognizer will expect.

### 6. Balance the objectives
Open the **Objectives** card and check the weights. They must total exactly 100 before **Save** or **Publish** becomes available.

## Things to know

:::note
If Zappy cannot read a file fully, it names that file in a warning on the job.
:::

:::note
Non-English coaching uses the chosen language and native script, such as Hindi in Devanagari.
:::

:::note
Generation can take a few minutes because Zappy checks the output for missing facts, invented details, and ignored instructions.
:::

:::warning
If the objective weights do not total 100, Zappy does not let you save the coaching.
:::