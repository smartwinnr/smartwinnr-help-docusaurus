---
id: how-to-record-external-training-with-external-activity
title: "How to record external training with External Activity"
description: "Record off-platform training in SmartPath and count it toward learner completion."
slug: how-to-record-external-training-with-external-activity
sidebar_position: 364
last_update:
  date: 2026-10-19
  author: Manaswini V
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: ["smartpath"]
draft: true
---

> **At a glance** - Add an External Activity to a SmartPath, then upload completion records in bulk. SmartPath uses those records to count external training toward completion.

Use External Activity when learners complete training outside SmartWinnr. You can record classroom sessions or third-party learning in the same SmartPath. That gives you one place to track progress across platform and off-platform training.

## When to use this

Use this when you need to:

- Record classroom training completed outside SmartWinnr.
- Record third-party training completed outside SmartWinnr.
- Count external training toward a learner’s SmartPath progress.
- Keep learner progress in one SmartPath across multiple training sources.

## Steps

### 1. Add an External Activity
In the Editor Portal, open the relevant SmartPath module and click Add Segment. Select External Activity and fill in the required details.

For more information on adding a segment, refer to [How to add Learning Sessions in SmartPath Module?](https://help.smartwinnr.com/modules/smartpath/create-and-manage/how-to-add-learning-sessions-in-smartpath-module/?utm_source=chatgpt.com).

### 2. Prepare a CSV file
Create a CSV file with learner identifiers and completion statuses. Make sure the status values match the completions you want to record.

### 3. Upload the file
In the SmartPath, go to **Batches** and click the **Bulk Attendance** icon. Upload your CSV file to record the completions.

### 4. Check Validation Errors
After uploading the CSV file, review the **Validation Errors** message to identify any issues. Correct the errors in your CSV file and upload it again, if needed.

For more information, refer to [How to upload attendance in bulk for Learning Sessions](https://help.smartwinnr.com/modules/smartpath/create-and-manage/how-to-upload-attendance-in-bulk-for-learning-sessions/).

### 5. Confirm completion
After the upload succeeds, the external activity contributes to the learner’s SmartPath completion. To verify the record, go to **User Portal > Learning > SmartPath > My SmartPaths** and open the **Completed** tab.
![completed status](/img/helpscout/authored/authored-mvf7pwl8.png)