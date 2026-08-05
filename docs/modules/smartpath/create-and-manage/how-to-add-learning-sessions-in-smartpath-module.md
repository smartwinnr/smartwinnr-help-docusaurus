---
id: 60a645beeb3af44cc120aa6d
title: How to add Learning Sessions In SmartPath Module?
description: >-
  Your SmartPaths can be enhanced with Learning Sessions to provide scheduled
  instructor-led or facilitated activities as part of the learning journey.
slug: how-to-add-learning-sessions-in-smartpath-module
sidebar_position: 242
last_update:
  date: 2026-07-18
  author: Charan
source:
  helpscout_id: 60a645beeb3af44cc120aa6d
  helpscout_url: >-
    https://help.smartwinnr.com/article/242-how-to-add-learning-sessions-in-smartpath
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
  privilege: smartpaths
tags:
  - smartpath
  - admin
---

> **At a glance** - A Learning Session is a scheduled, instructor-led segment inside a SmartPath module. It can be a physical classroom session or a virtual session, with an optional calendar invitation for learners.

SmartWinnr supports two types of Learning Sessions:

* **Classroom Session** - an offline session. The training is scheduled on SmartWinnr, and learners attend in person at the given location.
* **Virtual Session** - an online session conducted on a platform like Zoom, Microsoft Teams, or Google Meet, scheduled through SmartWinnr with a join link.

## Before you start

Learning Sessions are created inside a **SmartPath module**, the same way you add quiz, survey, or SmartFeed segments. A single module can mix Learning Sessions with other segment types.

## Steps

### 1. Open your module

Go to **EDITOR > LEARNING AND KNOWLEDGE > SmartPaths > View All Modules**. Create a new module or select the module where you want the session.

![Here, create a new module or select the module in which you would like to add a Learning session.](/img/helpscout/editors/how-to-add-learning-sessions-in-smartpath-module-1.jpg)

### 2. Add a segment

In the module's segments step, click **Add Segment** at the top right corner.

![Once your module is created or selected, go to step 2, where you add Segments to your module. Click on the Add Segment button at the top right.](/img/helpscout/editors/how-to-add-learning-sessions-in-smartpath-module-2.jpg)

### 3. Choose the Learning Session segment type

In the **Select Segment Type** dropdown, choose **Learning Session**.

![To create a segment that is the classroom/virtual session, choose the option Learning Session in the Select Segment Type dropdown.](/img/helpscout/editors/how-to-add-learning-sessions-in-smartpath-module-3.png)

### 4. Name the segment and set points

Enter a **Name** for the segment. Under **Point Distribution > On Completion**, set how many points learners earn for attending. Then click **Create**.

![After selecting the Learning Session, enter the Name for the segment and set the completion points under Point Distribution, then click Create.](/img/helpscout/editors/how-to-add-learning-sessions-in-smartpath-module-4.jpg)

### 5. Fill in the session details

The session setup page opens. Enter:

* **Title** - the session name learners see.
* **Description** - details about the training (optional).
* **Image** - an optional cover image for the session.
* **Session Type** - choose one:
  * **Virtual Session:** the training happens online. Later, at batch creation, the system asks for the meeting link (for example, Microsoft Teams or Google Meet).
  * **Classroom Session:** the trainer and learners meet in a classroom or conference hall. Later, at batch creation, the system asks for the session location.

![Session details form with Title, Description, and Session type](/img/helpscout/editors/how-to-add-learning-sessions-in-smartpath-module-5.jpg)

### 6. Send a calendar invitation (optional)

Enable **Send Calendar Invitation** so learners receive the session in their calendar and can plan ahead.

![You can also send a calendar invitation for the scheduled training session. Enable the Send Calendar Invitation option to send the invitation.](/img/helpscout/editors/how-to-add-learning-sessions-in-smartpath-module-6.jpg)

When enabled, learners receive an invitation based on the session details provided in the **SmartPath Batch**:

![When the Editor enables the calendar invite, the user receives the invitation based on the session details provided in the SmartPath Batch.](/img/helpscout/editors/how-to-add-learning-sessions-in-smartpath-module-7.png)

### 7. Save

Click **Save** to finish creating the Learning Session.

![Then click on the Save button to complete creating the learning session.](/img/helpscout/editors/how-to-add-learning-sessions-in-smartpath-module-8.jpg)

## Next steps

Attach this module to a SmartPath and assign it to learners. The exact session date, time, instructor, and link/location are entered when you create the **batch** - see [How to Create SmartPath with Learning Sessions](./how-to-create-smartpath-with-learning-sessions.md).

After the session, the instructor marks attendance - the segment turns **Completed** for each learner only once attendance is recorded. Attendance can be marked per user, in bulk, or through a QR code that learners scan at the session. See [how to mark attendance for Learning Sessions](../for-managers/how-to-mark-the-attendance-for-users-in-learning-sessions.md).

![the QR-code attendance option](/img/helpscout/authored/how-to-add-learning-sessions-in-smartpath-module-mrpxx94h.png)
