---
id: 696c7d311e938328836da344
title: How to Add/Remove segments in Module added to SmartPath?
description: You can add or remove any segments from module as per the requirement.
slug: how-to-add-remove-segments-in-module-added-to-smartpath
sidebar_position: 297
last_update:
  date: 2026-07-18
  author: Charan
source:
  helpscout_id: 696c7d311e938328836da344
  helpscout_url: >-
    https://help.smartwinnr.com/article/297-how-to-update-add-remove-segments-from-module-in-smartpath
customProps:
  roles:
    - editor
    - admin
  privilege: smartpaths
tags:
  - smartpath
  - admin
---

> **At a glance** - Use the SmartPath Sync feature to add or remove segments from modules in SmartPath, ensuring learners always see the most current version.

You can add or remove any segments from a module as per the requirement. The SmartPath Sync feature allows you to sync changes made in the module to the SmartPath. This ensures that changes made to a module—such as adding or deleting segments—are reflected in the SmartPath where that module is used. This keeps learning paths consistent and up-to-date without manual intervention.

## When to use this
Use this feature when you need to update segments in a module that is already part of a SmartPath. This is particularly useful in the following scenarios:
- You want to ensure that learners see the latest content in their learning paths.
- You need to add new segments to enhance the learning experience.
- You want to remove outdated segments to keep the content relevant.

## Steps

### 1. Access the SmartPaths
Go to **EDITOR > LEARNING AND KNOWLEDGE > SmartPaths > View All Modules**. This will display the list of all modules that have been created within your business unit.

### 2. Select the Module
Select the module that you would like to update.

### 3. Edit the Module
Click on the **Edit module** option at the top right corner to edit the module.

![Click on the Edit module option at the top right corner to edit the module.](/img/helpscout/editors/how-to-add-remove-segments-in-module-added-to-smartpath-1.png)

### 4. Make Required Changes
Make the required changes in the module, such as adding a new segment or deleting an existing segment.

### 5. Open the SmartPath
Once the module is updated with the required changes, go to the SmartPath where you would like to sync the changes made in the module.

### 6. Confirm Sync
Open the SmartPath, and it will show you a message confirming the SmartPath Sync.

![Open the SmartPath, and it will show you the following message, confirming for the SmartPath Sync.](/img/helpscout/editors/how-to-add-remove-segments-in-module-added-to-smartpath-2.png)

### 7. Sync Changes
Click on **Yes** to confirm the sync and reflect the changes made in the module.

## Making a segment optional instead of removing it

If you only want to stop enforcing a segment for a live SmartPath, you do not have to delete it. Open the SmartPath's segment view and use the **Update Optional Segments** option (available when enabled for your organization) to change each segment's **Is Mandatory?** flag. Optional segments stay visible to learners but no longer block completion.

![the Update Segments pop-up showing the Is Mandatory toggle per segment ](/img/helpscout/authored/how-to-add-remove-segments-in-module-added-to-smartpath-mrpxhusr.png)

## Segment Addition/Deletion Sync
When segments are added or removed from a module, the same changes can be synced to the SmartPath. This ensures that learners always see the most current version of the module in their SmartPath.

## Affected Segments
The sync feature is applied to the following segment types:
- Quiz
- SmartFeed
- Coaching
- Survey
- Form
- Scorm Course
- Learning Session
- Action Item
- Assignment

No change made inside a content/segment will be identified to sync a segment.

## Score & Completion Status
For users who haven't completed the module yet, their score and completion status will be updated based on the synced content. Removing a segment a learner had completed also subtracts its points from their score, and can move them back to In Progress. For learners who have already completed the SmartPath, the completion status and scores will remain unchanged. Batches whose end date has passed are not updated by the sync. This ensures accurate tracking of learner progress.

The sync feature also updates segment order: when you reorder segments in the module, the SmartPath and existing learner instances are rearranged to match the module's order on the next sync.

Following changes made in the module will not be applied in the sync feature:
- Editing an existing segment's access rules (e.g., visibility conditions, prerequisites) will not trigger a sync on its own. Rules attached to newly added segments are carried over when those segments sync.
- If the segment included is a learning session, it will not get updated to the existing batches created for the SmartPath. The new learning session will be applied to the new batches that will get created for the SmartPath.
