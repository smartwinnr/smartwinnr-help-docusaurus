---
id: 5fd711e636980410c9123b73
title: How to create a SmartPath?
description: >-
  A SmartPath is a structured sequence of learning modules designed to guide
  learners step by step through a curated learning journey.
slug: how-to-create-a-smartpath
sidebar_position: 78
last_update:
  date: 2026-07-17
  author: Charan
source:
  helpscout_id: 5fd711e636980410c9123b73
  helpscout_url: 'https://help.smartwinnr.com/article/78-how-can-i-create-a-smartpath'
customProps:
  roles:
    - editor
    - admin
  privilege: smartpaths
tags:
  - smartpath
  - admin
---

> **At a glance** - Creating a SmartPath is a four-part flow: create the SmartPath, add modules with rules and milestones, assign learner batches, and (if coaching is included) add coaches.

A **SmartPath** is a structured sequence of learning modules that guides learners step by step through a curated journey.

## Before you start

Create the modules you want to include first - see [How to create a module for SmartPath](./how-to-create-a-module-for-smartpath.md).

## Step 1: Create New SmartPath

Navigate to **EDITOR > LEARNING AND KNOWLEDGE > SmartPaths > View All SmartPaths** and click **Create SmartPath** at the top right corner.

Enter the basic details:

* **Business Unit:** Select the relevant unit. (The label of this field can vary by organization.)
* **Course Type:** Tag the SmartPath by delivery style - **Blended**, **ILT** (Instructor-Led Training), **E-Learning**, or **Classroom**. Defaults to **None**.
* **Type:** Classify the SmartPath as **Mandatory** or **Optional** (defaults to **None**). This classification is informational and does not enforce completion.
* **SmartPath Title:** A clear name for the SmartPath. Required.
* **SmartPath Code:** A code that helps you uniquely identify the SmartPath.
* **Description:** A short summary of what the SmartPath covers.

The SmartPath itself has no start or end date - scheduling happens later, per batch, when you assign learners (Step 3).

You may also:

* Change the **language** of the SmartPath (per-language content tabs).
* Update the **cover image** and **theme color**.
* Enable **Add Score to Global Leaderboard On Completion** if the SmartPath score should count toward your organization's leaderboard. When enabled, a required **Completion Points** field appears - the points learners earn for finishing the whole SmartPath.
* Select a **Completion Certificate** to award on finishing.
* For ILT course types, an **Enforce Visibility Restriction** option can appear when enabled for your organization.

![SmartPath creation form](/img/helpscout/editors/how-to-create-a-smartpath-1.png)

Change the Cover Image and Color using these icons:

![You can change the Cover Image and Color of the SmartPath using the icons below.](/img/helpscout/editors/how-to-create-a-smartpath-2.png)

Select a **Completion Certificate** to award participants when they finish. Create the certificate in advance so it appears in the list.

![You can also add a Completion Certificate that would be awarded to the participants on the completion of the SmartPath.](/img/helpscout/editors/how-to-create-a-smartpath-3.png)

Click **Save SmartPath** to move to the next step.

## Step 2: Add Modules to the SmartPath

1. The next screen lists available modules. Use the search or business unit filter to find them.

![On the next screen, you will see a list of available modules. Use the search or business unit filter to find specific modules.](/img/helpscout/editors/how-to-create-a-smartpath-4.png)

2. Select the modules you want and click **Add Selected**. The chosen modules attach to the SmartPath:

![Then it opens the following page where the list of modules assigned to the SmartPath is shown.](/img/helpscout/editors/how-to-create-a-smartpath-5.png)

3. Change the order with **Reorder Modules** - drag modules into the preferred sequence, then click **Save**.

![You can change the order of modules by clicking Re-order Modules and dragging them into the preferred sequence.](/img/helpscout/editors/how-to-create-a-smartpath-6.png)

4. Optionally set **module access rules**. Rules apply from the second module onwards and control progression. Click **Manage Rules** beside a module:

![To apply rules, click on the Manage Rules button that is beside each module. It opens the following pop-up.](/img/helpscout/editors/how-to-create-a-smartpath-7.png)

* **By Day:** Select the day and time from which the module opens, then click **Add Rule**.

![By Day rule](/img/helpscout/editors/how-to-create-a-smartpath-8.png)

* **On Completion:** Select a prerequisite module. Learners access this module only after completing it. Click **Add Rule**.

![On Completion rule](/img/helpscout/editors/how-to-create-a-smartpath-9.png)

* **By Score:** Choose a module, a **Score**, and a **Comparator** (**Less than**, **Greater than**, **Equal to**). Learners unlock this module only when they meet the threshold.

![By Score rule](/img/helpscout/editors/how-to-create-a-smartpath-10.png)

5. Optionally assign **milestones** - badges or certificates awarded when a learner completes a module. Click **Manage Milestone** next to the module:

![To configure a milestone for a module, click Manage Milestone next to the relevant module.](/img/helpscout/editors/how-to-create-a-smartpath-11.png)

Select the badge or certificate and click **Save**:

![It will open up the following pop-up where you can select the required badge/certificate and click Save.](/img/helpscout/editors/how-to-create-a-smartpath-12.png)

## Step 3: Assign Batches

SmartPath assignments are created in **batches**, so the same SmartPath can be reused for different learner groups without rebuilding it.

1. Click **View Batches** at the top right.

![After modules are added to the SmartPath, to create the batch of learners for the SmartPath, click View Batches at the top right.](/img/helpscout/editors/how-to-create-a-smartpath-13.png)

2. Select **Create Batch**.

![Select Create Batch.](/img/helpscout/editors/how-to-create-a-smartpath-14.png)

3. Fill in the batch details:

* **Batch Name**
* **Duration of the batch** - start date/time and end date/time, with the timezone (changeable via **Change**). This is where the SmartPath's schedule actually lives - each batch has its own window.
* **Due Date of the batch** - shown on the learner's calendar as the deadline to complete the SmartPath (availability can depend on your organization's configuration).

![Batch details form](/img/helpscout/editors/how-to-create-a-smartpath-15.png)

4. If the SmartPath includes Learning Sessions, enter the session details for this batch - date, time, instructor, and link or location. See [How to Create SmartPath with Learning Sessions](./how-to-create-smartpath-with-learning-sessions.md) for the full field reference.

![Learning session details at batch creation](/img/helpscout/editors/how-to-create-a-smartpath-16.png)

5. Select the users for the batch. Filter participants by business unit, country, group, and more.

6. Optionally add **reminders** that nudge users to complete their training and attend sessions.

![You can also add reminders for the users notifying them to complete their training and attend the learning session.](/img/helpscout/editors/how-to-create-a-smartpath-17.png)

7. Click **Assign Users** to complete the batch assignment.

![Click Assign Users to complete the batch assignment. This finalises the SmartPath for the selected users.](/img/helpscout/editors/how-to-create-a-smartpath-18.png)

Create new batches any time you need to run the same SmartPath for another group of learners.

## Step 4: Add Coach (Optional)

This step appears only when a video coaching segment exists in one of the SmartPath's modules.

1. On the coaching assignment screen, enter the number of **coaches** per participant, then select the coach for each participant. If one coach applies to everyone, select them under **Select Coach** in the first row; otherwise pick a coach per user.
2. Click **Assign Coach** to complete the setup.

![Click Assign Coach to complete the setup.](/img/helpscout/editors/how-to-create-a-smartpath-19.png)

This assigns the selected coaches to the SmartPath's coaching segments.
