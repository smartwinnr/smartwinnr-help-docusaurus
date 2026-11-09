---
id: how-to-record-external-training-with-external-activity
title: "How to record external training with External Activity"
description: "Record off-platform training in SmartPath and count it toward learner completion."
slug: how-to-record-external-training-with-external-activity
sidebar_position: 364
last_update:
  date: 2026-11-09
  author: Manaswini V
customProps:
  owner: jazz.k@smartwinnr.com
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: ["smartpath", "external-activity", "learning-session", "classroom", "record"]
draft: false
---

> **At a glance** - Add a Learning Session with Classroom as the session type to a SmartPath, then upload completion records in bulk. SmartPath uses these records to count classroom training toward completion, alongside LMS content such as quizzes and SmartFeed.

 You can record classroom sessions or third-party learning in the same SmartPath. This allows you to track progress across both LMS content and classroom training in one place.

## When to use this

Use this when you need to:

- Record classroom training completed outside SmartWinnr.
- Include classroom training sessions alongside LMS content.
- Count classroom training toward a learner’s SmartPath progress.
- Track progress across online and classroom training in one SmartPath.

## Steps

### 1. Add a Learning Session

In the Editor Portal, open the relevant SmartPath module and click **Add Segment**. Select **Learning Session** and choose **Classroom** as the session type. Fill in the required details.

For more information, refer to [How to add Learning Sessions in SmartPath Module?](https://help.smartwinnr.com/modules/smartpath/create-and-manage/how-to-add-learning-sessions-in-smartpath-module/).

### 2. Prepare a CSV file

Create a CSV file with learner identifiers and completion statuses. Make sure the status values match the completions you want to record.

### 3. Upload the file

In the SmartPath, go to **Batches** and click the **Bulk Attendance** icon. Upload your CSV file to record the classroom training completions.

### 4. Check Validation Errors

After uploading the CSV file, review the **Validation Errors** message to identify any issues. Correct the errors in your CSV file and upload it again, if needed.

For more information, refer to [How to upload attendance in bulk for Learning Sessions](https://help.smartwinnr.com/modules/smartpath/create-and-manage/how-to-upload-attendance-in-bulk-for-learning-sessions/).

### 5. Confirm completion

After the upload succeeds, the classroom training contributes to the learner’s SmartPath completion. To verify the record, go to **User Portal > Learning > SmartPath > My SmartPaths** and open the **Completed** tab.

![Once your classroom training is completed, you can view it as Completed in the User Portal under the Completed tab.](/img/helpscout/authored/authored-mvf7pwl8.png)

Once the attendance record is uploaded successfully, the learner’s SmartPath completion status is updated. You can verify the completion percentage in the Completed tab under My SmartPaths.
