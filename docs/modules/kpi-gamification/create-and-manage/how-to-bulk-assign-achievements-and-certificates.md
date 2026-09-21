---
id: how-to-bulk-assign-achievements-and-certificates
title: "How to Bulk Assign Achievements and Certificates"
description: "Assign badges and certificates to one user or many users, then review assignment history and logs."
slug: how-to-bulk-assign-achievements-and-certificates
sidebar_position: 306
last_update:
  date: 2026-09-18
  author: Anagha Isal
customProps:
  owner: jazz.k@smartwinnr.com
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: ["gamification"]
draft: false
---

> **At a glance** -You can assign badges and certificates to individual users or multiple users at once. For bulk assignment, upload a user data file using either the user's Email Address or User Identifier. After the assignment, you can track the assignment status and view detailed logs for each user.

## When to use this

Use this feature when you want to:

- Assign a badge or certificate to individual users.
- Assign the same achievement to multiple users.
- Check whether a bulk assignment completed successfully.
- Review individual user logs for a specific assignment.
- View assignment logs for individual users.
- Review assignment history across all achievements.


## Before you start

Make sure the required badge or certificate has already been created in SmartWinnr.

SmartWinnr supports two types of achievements:
- Badges
- Certificates

You can assign either type using the bulk assignment process.

## Steps

### 1. Open the achievement you want to assign
Go to **EDITOR → Achievements** and open the badge or certificate you want to assign. Select **Assign**, choose the user, and complete the assignment.

On the achievement details page, you can use the **Assign** option to assign the achievement to users individually.

For bulk assignment, click the **Hamburger menu (⋮ )** in the top-right corner and select Bulk Assign.

![Bulk assign of achievemnt](/img/helpscout/authored/how-to-bulk-assign-achievements-and-certificates-mu5gmxyq.png)

    - Note: The same bulk assignment process can be used for both badges and certificates.

### 2. Bulk assign the achievement
After selecting Bulk Assign, SmartWinnr opens the Bulk Assign Achievements page.

Here, you need to select:

- **Achievement** – The badge or certificate you want to assign.
- **User Identifier** – The identifier you want to use to identify users in the upload file.

The available user identifier options are:
- Email Address
- User Identifier

![Choose the identifier](/img/helpscout/authored/how-to-bulk-assign-achievements-and-certificates-mu5gtvi5.png)

    - Note: The user identifier selected here should match the user details provided in the upload file.

### 3. Download the sample template
After selecting the achievement and user identifier, click **Download Template**.

SmartWinnr provides a sample template that you can use to prepare the list of users who should receive the achievement.

![Upload userlist](/img/helpscout/authored/how-to-bulk-assign-achievements-and-certificates-mu5gm4e1.png)

**Prepare the file**

Open the downloaded template and enter the user details based on the identifier you selected.

![sample filled csv](/img/helpscout/authored/how-to-bulk-assign-achievements-and-certificates-mu5h2bkp.png)

For example:

- If Email Address is selected, enter the email addresses of the users.
- If User Identifier is selected, enter the corresponding User Identifier values.

Save the completed file as CSV before uploading it.

### 4. Upload the user data file

On the Bulk Assign Achievements page:
- Click Choose file.
- Select the data file.
- Click Upload.

SmartWinnr processes the uploaded file and assigns the selected achievement to the applicable users.

### 5. Track assignment history for a specific achievement
After completing an assignment, you can check the assignment history for that particular badge or certificate.

- Open the required achievement.
- Click the hamburger (⋮)  menu.
- Select Assignment History.

![Choose assignment history](/img/helpscout/authored/how-to-bulk-assign-achievements-and-certificates-mu5h87xf.png)

The Assignment History page shows the **assignment batches** for that achievement.

You can see:

- Date – When the assignment was processed.
- Status – The overall status of the assignment.
- Assigned To – Number of users included in the assignment.
 Generated For – Number of users for whom the achievement was generated.
- View Logs – Opens the detailed log for that assignment.

For example, the screenshot below shows an assignment with a Completed status, where the achievement was assigned to 18 users and generated for 18 users.

![assignment batches](/img/helpscout/authored/how-to-bulk-assign-achievements-and-certificates-mu5h7v4y.png)

The view logs displays the result for each user included in that assignment.

You can see:

- User – The user included in the assignment.
- Status – Whether the assignment was successful.
- Message – Additional information about the assignment.

For example, a successful certificate assignment is displayed as:

Status: Success
Message: Certificate Generated Successfully

![View logs of assignment history](/img/helpscout/authored/how-to-bulk-assign-achievements-and-certificates-mu5iaolt.png)

### 6. View assignment history for all achievements

If you want to review assignment activity across all badges and certificates, you can access the overall achievement history.

- Go to **EDITOR → Achievements**.
- On the Achievements list page, click the **hamburger (⋮)** menu.
- Select **Assigned Logs**.

![View logs](/img/helpscout/authored/how-to-bulk-assign-achievements-and-certificates-mu5h7fan.png)

The **Achievements History page** displays assignment records across achievements.

![All assignemnt history](/img/helpscout/authored/how-to-bulk-assign-achievements-and-certificates-mu6ry43t.png)

You can filter by:

- **Achievement Type**
- **Source Type**
- **Date Range**
- **Search**

The history includes:

- User
- Achievement Type
- Achievement Source
- Achievement Name
- Received On

You can also select Download Report to download the achievement history.

## Things to know

:::note
Use **Assignment History** for one achievement, **View Logs** for one assignment batch, and **Assigned Logs** for all achievements.
:::

:::tip
After a bulk assignment, check **View Logs** to confirm each user's achievement was generated successfully.
:::