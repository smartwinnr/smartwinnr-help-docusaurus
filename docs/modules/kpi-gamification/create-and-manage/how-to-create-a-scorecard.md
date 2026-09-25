---
id: 5fdb13f67129911ba1b21e6b
title: How to create a Scorecard?
description: >-
  Scorecards are a way to measure sales reps against set KPIs, along with scores
  and leaderboards. Read more about Scorecards.
slug: how-to-create-a-scorecard
sidebar_position: 176
last_update:
  date: 2026-09-25
  author: Anagha Isal
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

A Scorecard helps you measure sales representatives against defined KPIs. You can configure how each KPI is measured, assign scores based on performance, add users to the Scorecard, and use leaderboards to track performance.[Read more](/modules/kpi-gamification/features/what-are-scorecards) about Scorecards.


## When to use this

Use a Scorecard when you want to:

- Track sales representatives against defined KPIs.
- Assign points based on KPI performance.
- Measure performance at different levels or against targets.
- Combine multiple KPIs into a single KPI Collection.
- Rank users on a leaderboard.
- Track KPI performance over a defined measurement frequency.

## Before you create a Scorecard

Before creating a Scorecard, make sure the required KPIs have been configured.

The typical KPI setup process in SmartWinnr is:

1. **Define KPIs**
2. **Configure Field Mappings**
3. **Create Scorecards**

Scorecards use the KPI data received through the configured data source and field mappings to measure performance and calculate scores.

You can configure Scorecards to measure performance at different frequencies, such as:

- Daily
- Weekly
- Monthly
- Quarterly
- Annually
- Custom Date Range

## Steps

## 1. Configure the Scorecard

Go to **Editor > KPI Scorecards > Scorecards** and create a new Scorecard.

The first step is to configure the basic details of the Scorecard.

![Select Measurement Frequency and KPIs](/img/helpscout/authored/how-to-create-a-scorecard-mswu8sgl.png)

**Business Unit**: Select the Business Unit for which you want to create the Scorecard.

**Measurement Frequency**: Select how the KPIs should be measured, such as Daily basis, Weekly basis, Monthly basis, Quarterly basis, or Annually. Also, the target you define for each KPI will be the target for the selected frequency. Thus if you choose **frequency as Weekly, the target you set against each KPI will be the weekly target**.

**Visibility**: Choose whether the Scorecard should be visible to users.

**Priority**: Set the display priority of the Scorecard. A lower number gives the Scorecard a higher display position.

For example:
- 1 — displayed first
- 2 — displayed second
- 3 — displayed third

**Scorecard Name**: Enter a name for the Scorecard.

**Scorecard Description**: Add a short description explaining the purpose of the Scorecard.

**Activation and End Date**: Set the Activation Date and End Date to define when the Scorecard is active. The data get recording in the scorecard for this date range.

**Data Visibility Date**: Configure when KPI data becomes visible to:
- User
- Manager

**Time Zone**: Select the time zone in which the Scorecard should operate.


## 2. Configure Scorecard Settings

SmartWinnr provides additional settings that control how Scorecard data is initialized, stored, displayed, and used.

These options can be enabled based on the requirements of your Scorecard.

### 1. Add Leaderboard

**Enabled by default**

The **Add Leaderboard** option adds a leaderboard view to the Scorecard.

When enabled, users can view how they rank compared to other users based on their Scorecard performance.

Use this option when you want the Scorecard to support performance visibility and comparison between users.

---

### 2. Initialize Data Automatically

**Disabled by default**

When **Initialize Data Automatically** is enabled, SmartWinnr automatically creates Scorecard records for every user.

The records are created with:

- Achievement set to **zero**.
- The default target pre-filled.

This removes the need to manually create or upload the initial Scorecard data.

For example, if a Scorecard is created for 100 users, enabling this option automatically creates the initial Scorecard records for those users.

---

### 3. Store Previous Achievement

**Disabled by default**

The **Store Previous Achievement** option stores the achievement value from the previous measurement period along with the current period's data.

For example, for a monthly Scorecard:

- Current period → September achievement
- Previous achievement → August achievement

This is useful when the previous period's achievement is required for comparison or further calculations.

---

### 4. Consider Previous Target

**Disabled by default**

When **Consider Previous Target** is enabled, SmartWinnr uses the target from the previous measurement period if a target has not been configured for the current period.

For example:

- August target = 100
- September target is not available
- Previous target is considered → 100

This option applies to recurring measurement frequencies.

> **Note:** This option does not apply to custom date ranges.

---

### 5. Sync with Competition Attributes

**Disabled by default**

The **Sync with Competition Attributes** option links the Scorecard settings with the attributes configured for a Competition.

When enabled, changes made to the Competition configuration are reflected in the Scorecard automatically.

This can be useful when the Scorecard and Competition are expected to use the same configuration.

---

### 6. Maintain History By Frequency

**Disabled by default**

The **Maintain History By Frequency** option keeps a historical snapshot of Scorecard data whenever a new measurement period begins.

For example, if the Scorecard is configured with a monthly frequency, historical data can be maintained for each month.

This allows you to look back at the Scorecard data for previous periods even after the current data has been updated.

> **Note:** This option does not apply to custom date ranges.

---

### 7. Store Organizational Achievement

**Disabled by default**

The **Store Organizational Achievement** option calculates and stores an achievement value at the organisation level.

The organisational achievement can be:

- Summed across all users.
- Grouped using an organisation metatag, such as **Region** or **Division**.

For example, instead of storing achievement only for individual users, the Scorecard can maintain an organisation-level achievement or achievement grouped by a relevant metatag.

> **Note:** An organisation-level target must be configured for each KPI when using this option.

---

### 8. Store Team Wise KPI Data

**Disabled by default**

> **Note:** This option is available only when the required tenant-level configuration is enabled.

The **Store Team Wise KPI Data** option aggregates individual user KPI data at the team or group level and stores it separately.

You can specify the teams to be considered using a **group type or organisation metatag**.

The resulting team-level data includes the team's achievement and member count.

For example, individual KPI achievements can be aggregated to create a KPI achievement record for each configured team.

---

### 9. Custom Scorecard

**Disabled by default**

The **Custom Scorecard** option allows you to customize how the Scorecard is displayed in the application.

When enabled, you can:

- Give the Scorecard tab a custom display name.
- Choose whether the tab appears at the beginning or end of the tab list.

If this option is not enabled, the Scorecard uses the default display name and position.

---

### 10. Allow Navigation

**Enabled by default**

The **Allow Navigation** option controls whether users can navigate between the different sections or tabs within the Scorecard.

When enabled, users can navigate between the available Scorecard views.

When disabled, users see only the default Scorecard view and cannot switch between the available sections.


## 3. Add KPIs to the Scorecard

Once the Scorecard configuration is complete, add the KPIs that you want to measure.

Under **KPIs Added to this Scorecard**, you can:

- Add an individual KPI.
- Add a KPI Collection.
- Change the sequence in which KPIs are displayed.

![Choose KPI or KPI collection](/img/helpscout/authored/how-to-create-a-scorecard-mswuqjpo.png)

Click Add KPI to add an individual KPI to the Scorecard.

You can then configure the KPI's visibility, position, measurement type, target, and scoring rules.

Add KPI Collection

Click Add KPI Collection to create a new KPI by combining multiple existing KPIs.

A KPI Collection allows you to select multiple KPIs and combine their data into a newly created KPI.

When creating a KPI Collection, you can configure:

KPI Name: Enter the name of the KPI Collection.
Abbreviation: Enter a short abbreviation for the KPI Collection.
Priority: Set the display priority.
KPI Description: Add a description explaining what the KPI Collection represents.
Display Properties: Add display properties if required.
Select KPIs: Select the existing KPIs that you want to include in the collection.

For example, you can create a KPI Collection named Performance Improvement and select multiple existing KPIs such as % Improvement for scenario attempt and Your LinkedIn profile.

The selected KPIs are combined into the KPI Collection, and their data contributes to the newly created KPI.

Screenshot: Add KPI Collection












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