---
id: 5fdb13f67129911ba1b21e6b
title: How to create a Scorecard?
description: >-
  Scorecards are a way to measure sales reps against set KPIs, along with scores
  and leaderboards. Read more about Scorecards.
slug: how-to-create-a-scorecard
sidebar_position: 176
last_update:
  date: 2026-08-17
  author: Sruthi Suresh
source:
  helpscout_id: 5fdb13f67129911ba1b21e6b
  helpscout_url: 'https://help.smartwinnr.com/article/176-how-to-create-a-scorecard'
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
  privilege: kpi
tags:
  - kpi
  - gamification
  - admin
draft: false
---

> **At a glance** - This article explains how to create a scorecard to measure sales reps against set KPIs, including detailed steps for adding KPIs and selecting users.

Scorecards are a way to measure sales reps against set KPIs, along with scores and leaderboards. [Read more](/modules/kpi-gamification/features/what-are-scorecards) about Scorecards.

Here is how to fill each field to create a scorecard:

## When to use this
Use this feature when you want to track the performance of sales representatives against defined KPIs. Scorecards help in evaluating their achievements and ranking them on leaderboards.

## Steps

### 1. Select Measurement Frequency and KPIs
**Business Unit:** Select the business unit for which you would like to create the scorecard. In most cases, you might not see this field at all.

**Measurement Frequency:** Specify how frequently you want to measure the KPIs, such as daily, weekly, monthly, quarterly, or annually.

**Status:** Select the status of the scorecard here: Active or Inactive.

**Visibility:** Choose if you want to make this visible to the users or hide it.

**Priority:** Assign a priority to the scorecard. According to this priority, it will be displayed in the report. For example, if you give "1" here, it will be displayed in the first position. If you give "2," it will be displayed in the second position.

![Select Measurement Frequency and KPIs](/img/helpscout/authored/how-to-create-a-scorecard-mswu8sgl.png)

**Scorecard Name:** Give a name to the scorecard.

**Scorecard Description:** Write a short description of the scorecard.


**KPIs Added to this Scorecard:** In this section, add the KPIs that you would like to measure in the scorecard by clicking on the **Add KPI** button.

![describe this screenshot](/img/helpscout/authored/how-to-create-a-scorecard-mswuqjpo.png)

### 2. Fill in KPI Details
Here is how to fill the fields to add KPIs:

**Visibility:** Choose if you want to make this KPI visible to the users.

**Position:** This determines the position of the KPI in the chart. If you give "1" here, it shows the KPI in the first position; "2" shows it in the second position, and so on.

**Measurement Type:** This field accepts two types of values: Actual and Level.

- **Actual:** This value allows you to assign a KPI value and points for that value. Every time a rep achieves the KPI, they will be allotted points. For example, in the below screenshot, for every 20 calls made, the rep will be allotted 10 points.

![Actual Measurement Type](/img/helpscout/editors/how-to-create-a-scorecard-4.jpg)

**Target:** Set a target for the KPI.

**Floor:** This is the minimum KPI value to achieve in order to receive a score.

**Ceiling:** This is the maximum KPI value after which the score will not be awarded.

- **Level:** This allows you to set a KPI level and a score. The score will be allotted only once the rep achieves that level. In the screenshot below, three levels have been defined. If the rep makes up to 5 calls, they get 10 points; if they make between 5 and 10 calls, they get 50 points; and if they exceed 10 calls, they get 120 points.

![Level Measurement Type](/img/helpscout/editors/how-to-create-a-scorecard-5.jpg)

- **Individual Level:** This is similar to Level scoring, allowing you to set scoring for each data uploaded individually. The score will be allotted only once the rep achieves that level. In the screenshot below, three levels have been defined. If the rep makes up to 5 calls, they get 10 points; if they make between 5 and 10 calls, they get 50 points; and if they exceed 10 calls, they get 120 points.

![Individual Level Measurement Type](/img/helpscout/editors/how-to-create-a-scorecard-6.jpg)

- **Target Actual:** This is similar to the Actual type, but the difference is that this value is based on the target percentage and not directly on the uploaded data. Every time a rep reaches a certain percentage, they will be allotted points. For example, in the below screenshot, when they reach 20 percent of their target, they receive 10 points.

![Target Actual Measurement Type](/img/helpscout/editors/how-to-create-a-scorecard-7.jpg)

**Target:** Set a target percentage for the KPI.

**Floor:** This is the minimum KPI percentage to achieve in order to receive a score.

**Ceiling:** This is the maximum KPI percentage after which the score will not be awarded.

- **Target Level:** This is similar to the Level type, but it allows you to set a KPI level percentage and a score. The score will be allotted only once the rep crosses that percentage level. In the screenshot below, three levels have been defined. If the rep reaches 30% of the target, they get 10 points; if they reach between 30% and 60% of the target percentage, they get 20 points; and if they exceed 60%, they get 30 points.

![Target Level Measurement Type](/img/helpscout/editors/how-to-create-a-scorecard-8.jpg)

### 3. Select the Sales Reps for the Scorecard
Once you have filled all the fields, click on the **Create Scorecard** button to successfully create the scorecard. This will take you to the next page where users need to be added to this scorecard.

![Select Sales Reps](/img/helpscout/authored/how-to-create-a-scorecard-mswucd4z.png)

Here, you can search for users based on Business Unit, Zone, Group, Name, Email, and Meta tags, and then add them to the scorecard.

Click on the **Save** button once you have selected the users.

Alternatively, you can upload bulk users and add them to the scorecard. To bulk upload users, click on the **Upload Users** button. It opens the following screen where you can upload a CSV file that contains your user details:

![Bulk Upload Users](/img/helpscout/authored/how-to-create-a-scorecard-mswuimvi.png)

**User Identifier:** Choose if you want to identify and upload the users by their Email Address or User Identifier.

**CSV Delimiter:** Select the CSV delimiter here—Comma or Semicolon.

**Download Template:** You can download the CSV file template here and fill in the user details.

**Choose File:** Click on this button and upload your user CSV file.

### 4. Change Targets
The third step in this process is to view each participant's targets. Here is how you will see the targets of each user:

![Change Targets](/img/helpscout/authored/how-to-create-a-scorecard-mswukoko.png)

You can choose to change targets for the entire team by editing in the line of the **Target**. Refer to [How to add/change targets?](/modules/kpi-gamification/create-and-manage/how-to-add-change-targets) to learn more about editing the targets.

Once all the changes are done, click on **Save**, and the scorecard will be activated.