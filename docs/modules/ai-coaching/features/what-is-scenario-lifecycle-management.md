---
id: what-is-scenario-lifecycle-management
title: "What is Scenario Lifecycle Management?"
description: "Manage AI Coaching scenarios through review, publishing, archiving, and version history."
slug: what-is-scenario-lifecycle-management
sidebar_position: 339
last_update:
  date: 2026-09-10
  author: Anagha Isal
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: ["ai-coaching"]
draft: true
---

> **At a glance** - Scenario Lifecycle Management helps you move an AI Coaching scenario through review, publishing, and archiving. It also keeps version history so you can review earlier edits.

Scenario Lifecycle Management helps you control a coaching scenario from creation to retirement. You use it to review changes, approve content, publish it for learners, and keep a record of earlier versions.

## When to use this

Use Scenario Lifecycle Management when you need to manage a scenario through a review process.

- You want to keep a scenario editable while you build and test it.
- You need a reviewer to approve or request changes.
- You want to publish a scenario only after review is complete.
- You need to archive a scenario without affecting existing learner assignments.

## Lifecycle Stages

**1. Draft**

- Every newly created scenario will automatically be created in the Draft state.
- This is the initial stage where the scenario creator builds and tests the scenario.
- The scenario is fully editable.
- It can only be assigned to demo users.
- Available Action: **Submit for Review → Moves the scenario to In Review.**

![draft stage](/img/helpscout/authored/what-is-scenario-lifecycle-management-mtvg2sdn.jpg)

**2. In Review**

- The scenario has been submitted for review.
- It is locked while under review and remains available only for demo users.
- Available Actions: 
   - **Approve → Moves the scenario to Approved.** (If everything is as expected)
   - **Request Changes → Moves the scenario back to Draft. A comment can be added explaining the required changes.**

![In review stage](/img/helpscout/authored/what-is-scenario-lifecycle-management-mtvg58el.jpg)

**3. Approved** 

- The review is complete, and the scenario has been approved.
- Confirm the scenario at this stage.
- Available Actions:
    - **Publish → Moves the scenario to Published.**
    - **Send Back → Moves the scenario back to In Review if additional review is needed.**

**4. Published**

- The scenario is now live and can be assigned to all learners.
- **Available Action: Archive → Moves the scenario to Archived.**

**Note:** If you duplicate a published scenario, the duplicated scenario will also be created in the Draft state.

**5. Archived**

- The scenario is retired and cannot be assigned to new learners.
- Existing learner assignments will continue to work.
- Available Action: **Republish → Moves the scenario back to Published.**


## Steps

### 1. Open the scenario menu
Open the scenario you want to manage. Then select the three-dot menu and choose **Scenario Lifecycle Management**.

### 2. Review the lifecycle stage
Check the scenario’s current stage before you take action. A scenario can move through **Draft**, **In Review**, **Approved**, **Published**, and **Archived**.

### 3. Move the scenario forward
Use the available action for the current stage:

- **Submit for Review** moves a scenario from **Draft** to **In Review**.
- **Approve** moves a scenario from **In Review** to **Approved**.
- **Publish** moves a scenario from **Approved** to **Published**.
- **Archive** moves a scenario from **Published** to **Archived**.
- **Republish** moves a scenario from **Archived** to **Published**.

### 4. Add a comment when needed
Add a comment when you move a scenario between stages. Use it to explain review feedback, requested changes, or the reason for the move.

### 5. Open Version History
Open **Version History** from the top-right corner of the **Scenario Lifecycle Management** tab. You can view previous versions of the scenario and open an earlier version with **View**.

![version history](/img/helpscout/authored/what-is-scenario-lifecycle-management-mtvg996f.jpg)

## Tips

- Use **Draft** to keep working on a scenario before review.
- Use **Version History** to compare how a scenario changed over time.
- Use comments to keep the review trail clear for other reviewers.

## Things to know

:::note
A duplicated **Published** scenario starts in **Draft**.
:::

:::note
An **Archived** scenario cannot be assigned to new learners. Existing assignments continue to work.
:::