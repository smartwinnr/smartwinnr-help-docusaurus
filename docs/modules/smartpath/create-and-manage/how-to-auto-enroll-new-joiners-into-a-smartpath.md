---
id: how-to-auto-enroll-new-joiners-into-a-smartpath
title: "How to auto-enroll new joiners into a SmartPath"
description: "Automatically enroll new users into a SmartPath based on user attributes and an effective date."
slug: how-to-auto-enroll-new-joiners-into-a-smartpath
sidebar_position: 354
last_update:
  date: 2026-09-18
  author: Manaswini V
customProps:
  owner: jazz.k@smartwinnr.com
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: ["smartpath", "auto-enroll"]
draft: false
---

> **At a glance** - Set up a SmartPath assignment to automatically enroll new eligible users. Target users using **Meta Tags** and choose an effective date, such as **Date of Joining** or **Created On**, to determine when the assignment applies.

Use auto-enrollment to automatically assign a SmartPath to new users who match the selected **Meta Tags** and start it based on their defined **Date of Joining** or **Confirmation Date**.

## When to use this

Use auto-enrollment when you want to:

- Automatically assign a SmartPath to new joiners.
- Enroll users based on specific **Meta Tags** or user attributes.
- Start assignments from **Date of Joining** or **Created On**.
- Include eligible users without assigning them one by one.

## Steps

### 1. Open SmartPath
Log in to the Editor Portal and go to **Learning and Knowledge > SmartPath > View All SmartPaths**.

### 2. Select the SmartPath
Find the SmartPath you want to assign automatically to new users.
![Navigate to smartpath](/img/helpscout/authored/how-to-auto-enroll-new-joiners-into-a-smartpath-mu561al5.png)
### 3. Open batches
On the SmartPath card, click **Batches**. You can also open the SmartPath and click **View Batches** in the top-right corner.

### 4. Create a new batch
Click **Create New Batch**.
![select on new batch](/img/helpscout/authored/how-to-auto-enroll-new-joiners-into-a-smartpath-mu5628eh.png)
### 5. Add batch details



Enter the batch details you want to use for the assignment.

**Batch Name:** Enter a unique name for the batch.

**Batch ID:** The Batch ID is generated automatically.

**Start Date:** Set the date on which the batch begins.

**End Date:** Set the date on which the batch ends.

**Time Zone:** Select the appropriate time zone for the batch.

**Due Date:** Set the deadline by which the assigned users must complete the batch.


### 6. Set scheduled reminders

Use Scheduled Reminders to notify learners about SmartPath completion.

Choose the Send Type, set Send Before End (in Days) if needed, and select who should receive the reminder in Send To. Use Filter By to target All, Completed, or Not Completed learners.

Enter the Email Subject and Message, then click **Save**.

### 7. Configure assignment settings

In Assignment Settings, set Selection Type to Meta Tag.

Choose the Meta Tags Type, then search and select the required values in Search Values. Set Assignment Scope to All users or users added from a specific date.

Choose the Effective Date Field:

* **Date of Joining** uses the date the user joined the organization.
* **Created On** uses the date the user was added to SmartWinnr.

Set the Effective From Date for when the assignment should take effect.

![Add batch details](/img/helpscout/authored/how-to-auto-enroll-new-joiners-into-a-smartpath-mu5642fh.png)
### 8. Assign users
After you enter the required details, click **Assign Users**.

Eligible users are then enrolled in the SmartPath automatically based on your criteria.
![kindly click on assign users](/img/helpscout/authored/how-to-auto-enroll-new-joiners-into-a-smartpath-mu56a8l1.png)