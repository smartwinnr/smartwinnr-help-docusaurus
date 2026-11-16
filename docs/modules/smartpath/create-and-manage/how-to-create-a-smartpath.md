---
id: 5fd711e636980410c9123b73
title: How to create a SmartPath?
description: >-
  A SmartPath is a structured sequence of learning modules designed to guide
  learners step by step through a curated learning journey.
slug: how-to-create-a-smartpath
sidebar_position: 999
last_update:
  date: 2026-11-16
  author: Sandeep Bhuthagaddala
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
  privilege: smartpaths
tags:
  - smartpath
  - admin
draft: false
---

> **At a glance** - Create the SmartPath, add modules with rules and milestones, assign learner batches, and add coaches if needed.

A **SmartPath** is a structured sequence of learning modules that guides learners step by step through a curated journey.

## When to use this

Use a SmartPath when you want to organize learning into a guided sequence.

- You want learners to complete modules in a specific order.
- You want to control when later modules unlock.
- You want to assign the same SmartPath to different learner groups.
- You want to include coaching in the learning flow.

## Before you start

Create the modules you want to include first. See [How to create a module for SmartPath](./how-to-create-a-module-for-smartpath.md).

## Steps

### 1. Create a new SmartPath

Navigate to **EDITOR > LEARNING AND KNOWLEDGE > SmartPaths > View All SmartPaths** and click **Create SmartPath** at the top right corner.

Enter the basic details:

* **Business Unit:** Select the relevant unit. The label of this field can vary by organization.
* **Course Type:** Tag the SmartPath by delivery style: **Blended**, **ILT** (Instructor-Led Training), **E-Learning**, or **Classroom**. It defaults to **None**.
* **Type:** Classify the SmartPath as **Mandatory** or **Optional**. It defaults to **None**. This classification is informational and does not enforce completion.
* **SmartPath Title:** Enter a clear name for the SmartPath. This field is required.
* **SmartPath Code:** Enter a code that helps you uniquely identify the SmartPath.
* **Description:** Enter a short summary of what the SmartPath covers.

The SmartPath itself has no start or end date. Scheduling happens later, per batch, when you assign learners in Step 3.

You can also:

* Change the **language** of the SmartPath through per-language content tabs.
* Update the **cover image** and **theme color**.
* Enable **Add Score to Global Leaderboard On Completion** if the SmartPath score should count toward your organization's leaderboard. When you enable it, a required **Completion Points** field appears. Enter the points learners earn for finishing the whole SmartPath.
* Select a **Completion Certificate** to award on completion.
* For ILT course types, an **Enforce Visibility Restriction** option can appear when your organization enables it.

![SmartPath creation form](/img/helpscout/editors/how-to-create-a-smartpath-1.png)

Change the cover image and color using these icons:

![You can change the cover image and color of the SmartPath using the icons below](/img/helpscout/editors/how-to-create-a-smartpath-2.png)

Select a **Completion Certificate** to award participants when they finish. Create the certificate in advance so it appears in the list.

![You can also add a Completion Certificate that would be awarded to the participants on the completion of the SmartPath](/img/helpscout/editors/how-to-create-a-smartpath-3.png)

Click **Save SmartPath** to move to the next step.

### 2. Add modules to the SmartPath

The next screen lists available modules. Use the search or business unit filter to find them.

![On the next screen, you will see a list of available modules. Use the search or business unit filter to find specific modules](/img/helpscout/editors/how-to-create-a-smartpath-4.png)

Select the modules you want and click **Add Selected**. The chosen modules attach to the SmartPath.

![Then it opens the following page where the list of modules assigned to the SmartPath is shown](/img/helpscout/editors/how-to-create-a-smartpath-5.png)

Change the order with **Reorder Modules**. Drag modules into the preferred sequence, then click **Save**.

![You can change the order of modules by clicking Re-order Modules and dragging them into the preferred sequence](/img/helpscout/editors/how-to-create-a-smartpath-6.png)

Optionally set **module access rules**. Rules apply from the second module onward and control progression. Click **Manage Rules** beside a module.

![To apply rules, click on the Manage Rules button that is beside each module. It opens the following pop-up](/img/helpscout/editors/how-to-create-a-smartpath-7.png)

* **By Day:** Select the day and time from which the module opens, then click **Add Rule**.

![By Day rule](/img/helpscout/editors/how-to-create-a-smartpath-8.png)

* **On Completion:** Select a prerequisite module. Learners access this module only after completing it. Click **Add Rule**.

![On Completion rule](/img/helpscout/editors/how-to-create-a-smartpath-9.png)

* **By Score:** Choose a module, a **Score**, and a **Comparator** (**Less than**, **Greater than**, **Equal to**). Learners unlock this module only when they meet the threshold.

![By Score rule](/img/helpscout/editors/how-to-create-a-smartpath-10.png)

#### Combining rules using AND

You can add multiple access rules to a module. When multiple rules are combined using AND, learners must meet all configured conditions before the module becomes accessible.

For example, you can configure the following rules for a module:

- **On Completion:** Complete the prerequisite module.
- **By Score:** Achieve a score greater than 30 in the prerequisite module.
- **By Day:** The module becomes available on Day 1 at the specified time.

The next module unlocks only when all three conditions are met. If any one condition is not satisfied, the module remains locked.

Click **Add Rule** to add each condition, then click **Save** to apply the rules.

![Combine Rules using AND](/img/helpscout/authored/how-to-create-a-smartpath-mw35krmd.png)

Optionally assign **milestones**. These are badges or certificates awarded when a learner completes a module. Click **Manage Milestone** next to the module.

![To configure a milestone for a module, click Manage Milestone next to the relevant module](/img/helpscout/editors/how-to-create-a-smartpath-11.png)

Select the badge or certificate and click **Save**.

![It will open up the following pop-up where you can select the required badge/certificate and click Save](/img/helpscout/editors/how-to-create-a-smartpath-12.png)

### 3. Assign batches

SmartPath assignments are created in **batches**, so the same SmartPath can be reused for different learner groups without rebuilding it.

Click **View Batches** at the top right.

![After modules are added to the SmartPath, to create the batch of learners for the SmartPath, click View Batches at the top right](/img/helpscout/editors/how-to-create-a-smartpath-13.png)

Select **Create Batch**.

![Select Create Batch](/img/helpscout/editors/how-to-create-a-smartpath-14.png)

Fill in the batch details:

* **Batch Name**
* **Duration of the batch** - start date and time, end date and time, and the timezone. You can change the timezone with **Change**. This is where the SmartPath's schedule lives. Each batch has its own window.
* **Due Date of the batch** - shown on the learner's calendar as the deadline to complete the SmartPath. Availability can depend on your organization's configuration.

![Batch details form](/img/helpscout/editors/how-to-create-a-smartpath-15.png)

If the SmartPath includes Learning Sessions, enter the session details for this batch: date, time, instructor, and link or location. See [How to Create SmartPath with Learning Sessions](./how-to-create-smartpath-with-learning-sessions.md) for the full field reference.

![Learning session details at batch creation](/img/helpscout/editors/how-to-create-a-smartpath-16.png)

After creating the batch, select the users you want to assign the SmartPath to.

SmartWinnr provides multiple options to identify and select participants. You can assign users based on the following criteria:

Business Unit: Select a Business Unit to include users mapped to that Business Unit.

Country: Select a country to include users mapped to the selected country.

Group: Select a predefined group to include all users added to that group.

Roles: Select the required user roles, such as Admin, Manager, Editor, or User, to assign the SmartPath to users with those roles.

Name: Search for users by their names and select the required participants.

Email ID: Search for specific users using their email addresses.

Metatag Type and Metatags: Select a metatag type and its associated tags to include users mapped to the selected metatags.

You can use these options to select participants based on your assignment requirements. Once the required users are selected, proceed with the remaining batch details and click **Assign Users** to complete the assignment.
![Assigning by metatag and BU](/img/helpscout/authored/how-to-create-a-smartpath-mwj4i11v.png)

Optionally add **reminders** that nudge users to complete their training and attend sessions.

![You can also add reminders for the users notifying them to complete their training and attend the learning session](/img/helpscout/editors/how-to-create-a-smartpath-17.png)

Click **Assign Users** to complete the batch assignment.

![Click Assign Users to complete the batch assignment. This finalises the SmartPath for the selected users](/img/helpscout/editors/how-to-create-a-smartpath-18.png)

Create new batches any time you need to run the same SmartPath for another group of learners.

### 4. Add a coach

This step appears only when a video coaching segment exists in one of the SmartPath's modules.

On the coaching assignment screen, enter the number of **coaches** per participant, then select the coach for each participant. If one coach applies to everyone, select them under **Select Coach** in the first row. Otherwise, pick a coach per user.

Click **Assign Coach** to complete the setup.

![Click Assign Coach to complete the setup](/img/helpscout/editors/how-to-create-a-smartpath-19.png)

This assigns the selected coaches to the SmartPath's coaching segments.

## Tips

- Use **Reorder Modules** to fine-tune the learner sequence before you assign batches.
- Add access rules only when you want to control module unlock timing or prerequisites.
- Create milestones when you want to reward completion of individual modules.
- Use batches to reuse the same SmartPath for different learner groups.

## Things to know

:::note
The SmartPath itself has no start or end date. The schedule belongs to each batch.
:::

:::note
Rules apply from the second module onward.
:::

:::note
The coaching step appears only when a video coaching segment exists in one of the SmartPath's modules.
:::