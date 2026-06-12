---
id: 696c7d311e938328836da344
title: How to Add/Remove segments in Module added to SmartPath?
description: You can add or remove any segments from module as per the requirement.
slug: how-to-add-remove-segments-in-module-added-to-smartpath
sidebar_position: 297
last_update:
  date: 2026-01-18T00:00:00.000Z
  author: HelpScout Migration
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
You can add or remove any segments from module as per the requirement.

We have a SmartPath Sync feature, which allows you to sync/reflect the changes made in the module to the SmartPath. The Smartpath Sync feature ensures that changes made to a module-adding/deleting segments-are reflected in the Smartpath where that module is used. This keeps learning paths consistent and up-to-date without manual intervention.

But, if the module is already part of a SmartPath, then not all changes made in the module - segments will reflect in the SmartPath.

### Segment Addition/Deletion Sync

When segments are added or removed from a module, the same changes can be synced to the Smartpath. This ensures that learners always see the most current version of the module in their SmartPath.

### Affected Segments

The sync feature is applied to the following segment types:

* Quiz
* SmartFeed
* Coaching
* Survey
* Form
* Scorm Course
* Learning Session
* Action Item
* Assignment

No change made inside a content/segment will be identified to sync a segment

### Score & Completion Status

For users who haven’t completed the module yet, their score and completion status will be updated based on the synced content. For learners who have already completed the SmartPath, the completion status and scores will remain unchanged. This ensures accurate tracking of learner progress.

Following changes made in the module will not get applied in synce feature:

\* Reordering the segments will not get updated in Sync

\* Updating the rule for segments in the module (e.g., visibility conditions, prerequisites) will not be synced to the Smartpath.

\*If the segment included is a learning session, it will not get updated to the existing batches created for the SmartPath. The new learning session will be applied to the new batches that will get created for the SmartPath.

Follow the below steps to sync the SmartPath with latest changes made in the module:

a) Go to **EDITOR > LEARNING AND KNOWLEDGE > SmartPaths > View All Modules**.

This will display the list of all modules that have been created within your business unit.

b) Select the module that you would like to update

c) Click on 'Edit module' option at top right corner to edit the module.

![c) Click on 'Edit module' option at top right corner to edit the module.](/img/helpscout/editors/how-to-add-remove-segments-in-module-added-to-smartpath-1.png)

d) Make the require changes in the module - like adding new segment or deleting the segment.

e) Once the module is updated with required changes, goto the SmartPath, where you would like to sync the changes made in the module.

f) Open the SmartPath, and it will show you the following message, confirming for the SmartPath Sync.

![f) Open the SmartPath, and it will show you the following message, confirming for the SmartPath Sync.](/img/helpscout/editors/how-to-add-remove-segments-in-module-added-to-smartpath-2.png)

g) Click on 'Yes' to confirm the sync and reflect the changes made in the module.
