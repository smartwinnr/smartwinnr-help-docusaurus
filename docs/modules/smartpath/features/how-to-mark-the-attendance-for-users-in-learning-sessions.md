---
id: 6106badbb37d837a3d0df896
title: How to Mark the Attendance for Users in Learning Sessions?
description: >-
  If the SmartPath assigned to the trainees has a learning session added to it,
  the editor/instructor should mark the attendance for the trainees.
slug: how-to-mark-the-attendance-for-users-in-learning-sessions
sidebar_position: 263
last_update:
  date: 2026-08-22
  author: Sandeep Bhuthagaddala
source:
  helpscout_id: 6106badbb37d837a3d0df896
  helpscout_url: >-
    https://help.smartwinnr.com/article/263-how-to-mark-the-attendance-for-users-who-participated-in-learning-sessions
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
  privilege: smartpaths
tags:
  - smartpath
draft: false
---

> **At a glance** - If the SmartPath assigned to trainees includes a learning session, editors or instructors can mark attendance through various methods.

If the SmartPath assigned to the trainees has a learning session added to it, **the editor/instructor should mark the attendance for the trainees**. Only once the attendance is marked, the system will update the status of the learning session to '**Completed**' for the trainees.

There are different ways to mark attendance for a learning session:

* Editors can mark attendance from the SmartWinnr Editor portal, i.e., [https://app.smartwinnr.com/](https://app.smartwinnr.com/)
* Instructors (whose accounts are available in SmartWinnr with user roles) can mark attendance from the SmartWinnr user view, i.e., SmartWinnr App/Web view
* Attendees (learners) can scan the QR code available for the learning session and mark the attendance themselves.

## When to use this
Use this feature when you need to track attendance for trainees in learning sessions associated with a SmartPath. This ensures that the system accurately reflects the completion status of each session for the users.

## How the Editor/Instructor Can Mark Attendance from SmartWinnr Admin Portal

This option will be available only if the instructor has an editor role in SmartWinnr.

Follow these steps to mark attendance from the SmartWinnr Editor portal (https://app.smartwinnr.com/):

### 1. Go to the SmartPaths Section
Navigate to **Left Menu > Editor > SmartPaths > View All SmartPaths.**

### 2. Locate the Desired SmartPath
From the list of SmartPaths, find the one where you want to mark attendance.

![On the particular SmartPath card, click on the 'Batches' button at the bottom right corner. Alternatively, you can click and open a particular SmartPath.](/img/helpscout/editors/how-to-mark-the-attendance-for-users-in-learning-sessions-1.png)

### 3. Access Batches
On the selected SmartPath card, click on the **'Batches'** button at the bottom right corner. Alternatively, you can click and open a particular SmartPath and then click on the **'View Batches'** button at the top right corner of the screen.

![View batches section](/img/helpscout/authored/how-to-mark-the-attendance-for-users-in-learning-sessions-mt3x9sdy.png)

### 4. Mark Attendance for Learning Sessions
If there are multiple learning sessions available in the selected SmartPath, you can mark attendance for each learning session one by one or bulk upload the attendance for multiple sessions together.

#### Option 1: Mark Attendance for Each Session One by One

1. Click on the analytics icon against the batch for which you would like to mark attendance.

![Click on the analytics icon against the batch for which you would like to mark the attendance.](/img/helpscout/editors/how-to-mark-the-attendance-for-users-in-learning-sessions-2.png)

2. This will take you to the analytics page of the selected batch. On the Analytics page, **you will find a section with the name of your learning session**. Click on the **Manage Attendance icon** as shown below.

![It will take you to the analytics page of the selected batch. On the Analytics page, you will find a section with the name of your learning session.](/img/helpscout/editors/how-to-mark-the-attendance-for-users-in-learning-sessions-3.png)

3. This will take you to the **Manage Attendance page** where you can mark attendance for the users in the selected batch. Here, you can manually select the list of users who attended the learning session.

![It will take you to the Manage Attendance page where you can mark attendance for the users in the selected batch. Here, you can manually select the list of users who attended the learning session.](/img/helpscout/editors/how-to-mark-the-attendance-for-users-in-learning-sessions-4.png)

4. After selecting the users who attended the learning session, click on the **Save Attendance** option to mark the attendance as "Present" for the selected users. This will change the status of the learning session to '**Completed**' for the list of users for whom you marked attendance.

![After selecting the users who attended the learning session, click on the 'Save Attendance' option to mark the attendance as "Present" for selected users.](/img/helpscout/editors/how-to-mark-the-attendance-for-users-in-learning-sessions-5.png)

#### Option 2: Mark Attendance for Multiple Sessions in Bulk

Follow these steps to upload attendance in bulk:

1. Click on the **attendance icon** against the batch for which you would like to mark attendance.

![Click on the attendance icon against the batch for which you would like to mark the attendance.](/img/helpscout/editors/how-to-mark-the-attendance-for-users-in-learning-sessions-6.png)

2. This will take you to the following page. Here, you can find the details of the selected batch. Under the 'Upload User Data File' section, select the user identifier and download the template to upload attendance for all the sessions available in the SmartPath. You can choose the user identifier as 'Email address' when you have the email address of the attendees. Alternatively, you can choose the user identifier as 'User identifier' when you have the employee ID or any other unique value to identify users in SmartWinnr.

![It will take you to the following page. Here, you can find the details of the batch selected. Under 'Upload User Data File' section, select the user identifier and download the template to upload attendance for all the sessions available in the SmartPath.](/img/helpscout/editors/how-to-mark-the-attendance-for-users-in-learning-sessions-7.png)

3. The downloaded template will have the following columns:

![Downloaded template will have the following columns in it:](/img/helpscout/editors/how-to-mark-the-attendance-for-users-in-learning-sessions-8.png)

* **SmartPath Code (Auto-populated):** Unique code of the SmartPath to which the learning session belongs.
* **Module ID (Auto-populated):** ID of the SmartPath module that contains the learning session.
* **Module Name (Auto-populated):** Name of the SmartPath module (for reference).
* **Segment ID (Auto-populated):** ID of the learning session segment within the module.
* **Segment Name (Auto-populated):** Name of the learning session segment (for reference).
* **Batch ID (Auto-populated):** Unique identifier of the batch assigned to the SmartPath.
* **Email Address:** Email ID of the learner whose attendance is being updated.
* **Is Present:** Indicates whether the learner attended the session _(Yes / No)_.
* **Is Waiver:** Indicates whether attendance is waived for the learner _(Yes / No)_.
* **Is Applicable:** Indicates whether the learning session is applicable to the learner _(Yes / No)_.
* **Comment:** Optional remarks or notes related to the learner’s attendance.
* **Attendance Date:** Date on which the attendance was recorded for the learning session.

**Note:** Each learner’s attendance must be recorded in an individual row in the attendance template.

## How Instructors Can Mark Attendance from SmartWinnr User View

If the instructor for the learning session has a user role in SmartWinnr, they can mark the attendance of trainees from their SmartWinnr account in the SmartWinnr Mobile App or SmartWinnr web view ([https://web.smartwinnr.com/](https://web.smartwinnr.com/)).

[Click here](../for-managers/how-to-mark-the-attendance-for-users-in-learning-sessions.md) to learn more about how to mark attendance from the SmartWinnr app/web view.

## How Learners Can Mark Attendance Themselves

Attendees (learners) can scan the QR code available for the learning session and mark the attendance themselves. The instructor or editor can share the QR code for each session with learners. Learners can scan the QR code using the **scanner option** available within the SmartPath in **User View**.

[Click here](../for-managers/how-to-mark-the-attendance-for-users-in-learning-sessions.md) to learn more about how learners can mark attendance from the SmartWinnr app/web view.

### How Editors Can Download the QR Code for Each Learning Session

1. Go to **Left Menu > Editor > SmartPaths > View All SmartPaths.**
2. From the list of SmartPaths, locate the one where you want to mark attendance.
3. On the selected SmartPath card, click on the **'Batches'** button at the bottom right corner. Alternatively, you can click and open a particular SmartPath and then click on the **'View Batches'** button at the top right corner of the screen.
4. Go inside the batch for which you would like to download the QR code.

![Go inside the batch for which you would like to download the QR code.](/img/helpscout/editors/how-to-mark-the-attendance-for-users-in-learning-sessions-9.png)

5. Go to the learning session details. Against each learning session, you can find the option to **download the QR code under the Action column** for the session. You can download the QR as a PDF or image file, as per your requirement.

![Go to the learning session details. Against each learning session, you can find the option to download the QR code under Action column.](/img/helpscout/editors/how-to-mark-the-attendance-for-users-in-learning-sessions-10.png)

6. You can download the QR as a PDF or image file, as per your requirement.

![You can download the QR as PDF or Image file, as per your requirement.](/img/helpscout/editors/how-to-mark-the-attendance-for-users-in-learning-sessions-11.png)