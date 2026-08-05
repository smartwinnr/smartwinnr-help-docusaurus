---
id: bulk-coaching-assignment
title: "How to do bulk assignment for coaching"
description: "This article shows you how to perform bulk assignments for standalone coaching scenarios."
slug: bulk-coaching-assignment
sidebar_position: 999
last_update:
  date: 2026-07-23
  author: Aswani TK
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
draft: false
tags: ["video-coaching", "ai-coaching"]
---

> **At a glance** - Follow these steps to efficiently assign multiple users to standalone coaching programs.

You can streamline your coaching assignments by using the bulk assignment feature. This allows you to assign multiple users to a coaching program quickly, ensuring that all necessary details are captured.

## When to use this

Use the bulk assignment feature when you need to assign multiple users to a standalone coaching program. This is particularly useful in the following scenarios:

- You have a large number of users to assign to coaching.
- You want to ensure consistency in user assignments.
- You need to manage coaching assignments efficiently without doing them one by one.

## Steps

### 1. Log in and access the coaching report

Log in to your edit account. Navigate to **COACHING** and select **View Coaching**. This will display the list of coaching programs. Click on the **Hamburger menu** and select **All Coaching User Assignment Report**.

![All Coaching User Assignment Report](/img/helpscout/authored/authored-mrx3xb1x.png)

### 2. Select the coaching

You will be prompted to select the required coaching. Choose any standalone active coaching. The bulk assignment feature only supports standalone coachings. If you are unsure, select **All** to generate a report with details of all coaching programs.

![Select the Standalone Coaching Name](/img/helpscout/authored/authored-mrx3xm2o.png)

### 3. Review the coaching details

Check the details in the report. Filter the **Source** by **Standard Coaching** since bulk assignments only support standalone coachings. Additionally, filter the **Coaching Status** to **Active**.

![Coaching Details](/img/helpscout/authored/authored-mrx4uad2.png)

### 4. Access bulk coaching assignment

Go to the coaching list and select **Bulk Coaching Assignment** from the **Hamburger Menu**.

![Bulk Coaching Assignment](/img/helpscout/authored/authored-mrx4uvwe.png)

### 5. Download the template

You will be redirected to a page where you can download the assignment template. Select the **User Identifier** from the drop down and click on the **Download Template** button.

![Download Template](/img/helpscout/authored/authored-mrx4vmey.png)

### 6. Fill out the template

Complete the downloaded template with the required details. Ensure that the coaching division matches the division of the users.

![Sample CSV to upload](/img/helpscout/authored/authored-mrx4wif7.png)

### 7. Upload the CSV file

Select the correct **User Identifier** type (the same as when you downloaded the template). Click **Choose file** to select your prepared CSV file, then click the **Upload** button. A progress bar will show the upload percentage.

![Upload the Sample CSV](/img/helpscout/authored/authored-mrx4y3g5.png)

### 8. Monitor the upload process

The system will start uploading and display a status of **Processing**. Once complete, a success message will appear: "Upload successful! Processing records. Please check Job History for status."

![Upload in Processing state](/img/helpscout/authored/authored-mrx4yjww.png)
![Upload Completed](/img/helpscout/authored/authored-mrx4zm1z.png)

### 9. Check the upload results

Click on **View Details** to see records with errors and those that uploaded successfully. If a user is already assigned to the coaching or user is assigned to the coaching with same coach, then, that record will be skipped. If the user has submitted a video in this coaching, the new assignment will also not be processed. The system uploads only new and unique records.

![Record skipped due to some errors](/img/helpscout/authored/authored-mrx504q3.png)
![Records that successfully uploaded to the system](/img/helpscout/authored/authored-mrx50ub9.png)

## Things to know

:::caution
Ensure that the coaching division and the division of the users are the same to avoid assignment issues.
:::
