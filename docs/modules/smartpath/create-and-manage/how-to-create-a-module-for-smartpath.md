---
id: 5fd6f70a23119734ee37f088
title: How to create a module for SmartPath.
description: >-
  To build a structured learning experience within a SmartPath, you first need
  to create the modules that will be included in it.
slug: how-to-create-a-module-for-smartpath
sidebar_position: 76
last_update:
  date: 2026-07-17
  author: Charan
source:
  helpscout_id: 5fd6f70a23119734ee37f088
  helpscout_url: >-
    https://help.smartwinnr.com/article/76-how-can-i-create-a-module-for-smartpath
customProps:
  roles:
    - editor
    - admin
  privilege: smartpaths
tags:
  - smartpath
  - admin
---

> **At a glance** - A module is the building block of a SmartPath. It holds segments - quizzes, SmartFeeds, coachings, surveys, sessions, and more - arranged in the order and rules you define.

To build a structured learning experience within a SmartPath, you first create the modules that will be included in it. A module contains **segments** of different types that learners work through.

## Segment types a module can hold

Depending on your organization's configuration, a segment can be any of:

* **Quiz**
* **SmartFeed** (content)
* **Coaching** (video coaching)
* **Survey**
* **Form**
* **SCORM**
* **xAPI**
* **Learning Session** (classroom or virtual)
* **Action Item**
* **Assignment**
* **Trainer / Manager / Self Feedback** (when enabled for your organization)

SmartFeed, Quiz, and Assignment are always available; the rest appear based on the modules licensed for your organization.

## Steps

### 1. Create the module

Go to **EDITOR > LEARNING AND KNOWLEDGE > SmartPaths > View All Modules**. This displays all modules created within your business unit.

![This will display the list of all modules that have been created within your business unit.](/img/helpscout/editors/how-to-create-a-module-for-smartpath-1.png)

Click **Create Module** at the top right of the page.

![Create module form](/img/helpscout/editors/how-to-create-a-module-for-smartpath-2.png)

Enter the module details:

* **Business Unit:** Choose the business unit the module belongs to. (The label of this field can vary by organization.)
* **Module Title:** Give a clear, descriptive title. Required.
* **Module Code:** A code that helps you identify the module. Required; only letters, numbers, hyphens, and underscores are allowed.
* **Description:** Summarize what the module covers.

Optionally, customize the module card's **Cover Image** and **Color**. Then click **Save Module** to move to the segments step.

### 2. Add segments to the module

Click **Add Segment** at the top right.

![To create a segment in the module, click Add Segment at the top right.](/img/helpscout/editors/how-to-create-a-module-for-smartpath-3.png)

On the segment page:

1. Choose the **segment type**.
2. Enter a **name** for the segment.
3. Set the points under **Point Distribution** (for example, points on completion). Point Distribution is not shown for SCORM, xAPI, Action Item, and Trainer/Manager/Self Feedback segments.
4. Click **Create**.

![Segment creation page - choose type, name, points, then click Create.](/img/helpscout/editors/how-to-create-a-module-for-smartpath-4.png)

The next page collects the details specific to the segment type you chose. See:

* [How to create a SmartFeed](../../smartfeed/create-and-manage/how-to-create-a-smartfeed.md)
* [How to create a Quiz](../../quiz/create-and-manage/how-to-create-a-manual-quiz.md)
* [How to create a Survey](../../survey/create-and-manage/how-to-create-a-survey.md)
* [How to create a Video Coaching](../../video-coaching/assign-and-schedule/how-to-create-a-video-coaching-assignment.md)
* [How to add a Learning Session](./how-to-add-learning-sessions-in-smartpath-module.md)
* [How to create an Action Item](./how-to-create-an-action-item-in-the-smartpath.md)
* [How to create an Assignment](../assign-and-schedule/how-to-create-assignment-in-smartpath.md)

### 3. Reuse existing content as a segment (optional)

Instead of creating content from scratch, reuse something that already exists. After choosing the segment type, the page lists existing items (quizzes, SmartFeeds, surveys, and so on) - click the button next to the item you want to bring into the module.

![Alternatively, you can reuse an existing segment by clicking the button next to the required item.](/img/helpscout/editors/how-to-create-a-module-for-smartpath-5.png)

A confirmation pop-up appears:

![It will open the following pop-up asking you to confirm if you would like to duplicate the segment.](/img/helpscout/editors/how-to-create-a-module-for-smartpath-6.png)

Confirm, and a copy of the content is added to the module as a new segment.

![It will get displayed in a module as shown in the screenshot below.](/img/helpscout/editors/how-to-create-a-module-for-smartpath-7.png)

### 4. Reorder segments

Add as many segments as you need, then arrange them. Click **Reorder Segments** at the top right, drag segments into the order you want, and click **Done**.

![Click on the Reorder Segments button at the top right corner to re-order the segments in modules.](/img/helpscout/editors/how-to-create-a-module-for-smartpath-8.png)

### 5. Manage Rules - control access to segments

You can gate each segment behind **access rules**: a day, a completed prerequisite, or a score threshold. Completion and score rules apply from the second segment onwards.

Click **Manage Rules** beside the segment:

![To apply rules, click on the Manage Rules button that is beside each segment.](/img/helpscout/editors/how-to-create-a-module-for-smartpath-9.png)

The rules pop-up opens:

![It opens the following pop-up.](/img/helpscout/editors/how-to-create-a-module-for-smartpath-10.png)

* **By Day:** Select a day and time from which the segment becomes accessible. Day 0 is the first day of each batch. Click **Add Rule** to apply.

![By Day rule](/img/helpscout/editors/how-to-create-a-module-for-smartpath-11.png)

* **On Completion:** Select a prerequisite segment. Learners access this segment only after completing the selected one. Click **Add Rule** to apply.

![On Completion rule](/img/helpscout/editors/how-to-create-a-module-for-smartpath-12.png)

* **By Score:** Select a segment, a **Score**, and a **Comparator** (**Less than**, **Greater than**, **Equal to**). Learners must meet the threshold on that segment to unlock this one. For example: unlock only when the previous segment's score is greater than or equal to 85.

![By Score rule](/img/helpscout/editors/how-to-create-a-module-for-smartpath-13.png)

Click **Done** when you finish adding rules.

Your module is now ready to be added to a SmartPath - see [How to create a SmartPath](./how-to-create-a-smartpath.md).
