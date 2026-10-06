---
id: 5fdb13f67129911ba1b21e6b
title: How to create a Scorecard?
description: >-
  Scorecards are a way to measure sales reps against set KPIs, along with scores
  and leaderboards. Read more about Scorecards.
slug: how-to-create-a-scorecard
sidebar_position: 176
last_update:
  date: 2026-10-06
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

    Note: This option does not apply to custom date ranges.

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

    Note: This option does not apply to custom date ranges.

---

### 7. Store Organizational Achievement

**Disabled by default**

The **Store Organizational Achievement** option calculates and stores an achievement value at the organisation level.

The organisational achievement can be:

- Summed across all users.
- Grouped using an organisation metatag, such as **Region** or **Division**.

For example, instead of storing achievement only for individual users, the Scorecard can maintain an organisation-level achievement or achievement grouped by a relevant metatag.

    Note: An organisation-level target must be configured for each KPI when using this option.

---

### 8. Store Team Wise KPI Data

**Disabled by default**

    Note: This option is available only when the required tenant-level configuration is enabled.

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

**Add KPI**

Click **Add KPI** to add an individual KPI to the Scorecard.

For each KPI, you can configure:

- **Visibility** — Choose whether the KPI and its data is displayed to users.
- **Position** — Define the order in which the KPI appears.
- **Target** — Use a target from another KPI (if applicable).
- **Measurement Type** — Define how the KPI score should be scored.
- **Target** — Configure the target value of the KPI. Target is based on the frequency selected for the scorecard.

**Add KPI Collection**

A KPI Collection allows you to combine multiple existing KPIs into a single KPI. This is useful when you want to group related KPIs and use their combined data as one KPI within a Scorecard.

Click **Add KPI Collection** to combine multiple existing KPIs into a new KPI.

Any data associated with the selected KPIs contributes to the KPI Collection.

When creating a KPI Collection, you can configure:

- KPI Name: Enter the name of the KPI Collection.
- Abbreviation: Enter a short abbreviation for the KPI Collection.
- Priority: Set the display priority.
- KPI Description: Add a description explaining what the KPI Collection represents.
- Display Properties: Add display properties if required.
- Select KPIs: Select the existing KPIs that you want to include in the collection.

![KPI collection creation](/img/helpscout/authored/how-to-create-a-scorecard-mugovbo5.png)

For example, you can select **Health and Life** to include both KPIs in the **Total Policy Sold** KPI Collection.

    **Note:** A KPI Collection is useful when you want to group related KPIs and use them together within a Scorecard.


## 4. Select a Measurement Type

The **Measurement Type** determines how SmartWinnr calculates the score for the KPI.

The available measurement types include:

- Actual
- Level
- Individual Level
- Target Actual
- Target Level
- Formula
- Grid
- Level with Filter

Each measurement type supports a different scoring approach.

### a) Actual

The **Actual** measurement type allows you to assign points based on a specific KPI value. Points are awarded each time the user achieves the configured KPI value.

For example, suppose you configure:

| KPI Value | Points |
|---:|---:|
| 5 New Leads | 100 points |

![Actual scoring rule](/img/helpscout/authored/how-to-create-a-scorecard-mugpq3yh.png)

The user receives **100 points for every 5 New Leads** achieved within the Scorecard's measurement frequency.

With this scoring rule, if the Scorecard frequency is Quarterly and the user achieves **15 New Leads, they will receive 300 points**.

You can also configure:

**Target**: The target KPI value.

**Floor**: The minimum KPI value required to earn points. Points are awarded only when the KPI value meets or exceeds the configured floor.

**Ceiling**: The maximum KPI value considered for scoring. If the KPI value exceeds the ceiling, no additional points are awarded for the value above the ceiling.

For example, if:

- 5 New Leads = 100 points
- Floor = 5
- Ceiling = 20

A user achieving **15 New Leads** receives **300 points**. If they achieve **25 New Leads, points are calculated only up to the configured Ceiling of 20**, and no additional points are awarded for the 5 leads above the Ceiling.

---

### b) Level

The **Level** measurement type allows you to define different KPI levels and assign a score to each level.

For example:

| KPI Level | Score |
|---:|---:|
| 1 | 10 points |
| 5 | 50 points |
| 10 | 120 points |

Based on these levels:

- **1–4 New Leads** → 10 points
- **5–9 New Leads** → 50 points
- **10 or more New Leads** → 120 points

![Level scoring rule](/img/helpscout/authored/how-to-create-a-scorecard-mugpqrsj.png)

The user receives the score associated with the level achieved.

Unlike **Actual** scoring, points are not repeatedly awarded for every configured KPI value. Instead, the score is based on the level achieved for the total KPI data.

---

### c) Individual Level

The **Individual Level** measurement type works similarly to Level scoring, but the score is calculated separately for each individual data submission or upload.

For example, configure:

| KPI Level | Score |
|---:|---:|
| 1 | 10 points |
| 5 | 50 points |
| 10 | 120 points |

![Individual scoring rule](/img/helpscout/authored/how-to-create-a-scorecard-mugptbl0.png)

If a user has:

- **Day 1:** 2 New Leads
- **Day 2:** 5 New Leads

The scores are calculated separately:

- Day 1 → 10 points
- Day 2 → 50 points

**Total = 60 points**

With standard **Level** scoring, the total KPI value would be 7 New Leads. This would fall within the 5–9 level and result in 50 points.

The key difference is:

| Measurement Type | How scoring is calculated |
|---|---|
| **Level** | Evaluates the combined KPI value for the Scorecard frequency. |
| **Individual Level** | Evaluates each individual data submission separately and adds the resulting scores. |


### d) Target Actual

The **Target Actual** measurement type assigns points based on the **percentage of the target achieved**, rather than the actual KPI value.

It works similarly to Actual scoring, but instead of awarding points for a specific KPI value, points are awarded for achieving a configured percentage of the target.

For example, if the target is **25 New Leads**, you can configure:

| % of Target Achieved | Points |
|---:|---:|
| 20% | 10 points |

![Target actual scoring rule](/img/helpscout/authored/how-to-create-a-scorecard-mugpxf5j.png)

You can also configure:

**Target**: The target KPI value.

**Floor**: The minimum target-achievement percentage considered for scoring.Points are awarded only when the target-achievement percentage meets or exceeds the configured floor.

**Ceiling**: The maximum target-achievement percentage considered for scoring. If the target-achievement percentage exceeds the ceiling, no additional points are awarded for the value above the ceiling.

---

### e) Target Level

The **Target Level** measurement type allows you to define different scoring levels based on the **percentage of the target achieved**.

It is similar to Level scoring, but instead of awarding points based on a specific KPI value, points are awarded based on the percentage of the target achieved.

For example:

| % of Target Achieved | Score |
|---:|---:|
| 25% | 10 points |
| 50% | 20 points |
| 100% | 50 points |

![target level scoring](/img/helpscout/authored/how-to-create-a-scorecard-muwhxq84.png)

Based on these levels:

- **25%–50% of the target** → 10 points
- **50%–100% of the target** → 20 points
- **More than 100% of the target** → 50 points

This allows you to award different scores as users progress toward or exceed their targets.

---

### f) Formula

The **Formula** measurement type allows you to calculate a score using a formula based on the values of selected KPIs.

You can enter a formula directly or use **Build Formula** to construct the calculation.

For example, suppose you have a KPI named **Sales Performance Score** and want to calculate its score using two KPIs with weightage as follows:

- New Leads → 40% weight
- Sales Vol (in m) → 60% weight

The formula can be:

![sample formula](/img/helpscout/authored/how-to-create-a-scorecard-munxbung.png)

To use this formula, add the following KPIs to the Scorecard:
- Sales Performance Score
- New Leads
- Sales Vol (in m)

You can then use **Build Formula** to select the required KPI columns, operators, and functions to construct the calculation as follows.

![Build formula](/img/helpscout/authored/how-to-create-a-scorecard-muwi0usm.png)

This allows the Scorecard to calculate the score for a KPI based on the relationship between the values of the selected KPIs and their corresponding targets.

![formula scoring rule](/img/helpscout/authored/how-to-create-a-scorecard-muwhz28w.png)


---

### g) Grid

The **Grid** measurement type allows you to define scoring using a configurable grid.

A Grid can use the data from another KPI to define **slabs** and assign different scores based on the combination of KPI values.

You can configure:

- **Rows** — Define values or ranges for the primary KPI.
- **Slabs** — Define values or ranges based on another KPI.
- **Points** — Assign a score for each combination of row and slab values.
- **Filters** — Add conditions to determine when a specific grid rule should apply.

### Add a KPI as a Slab

Click **Click to define column** to select a KPI for the slab.

![Define slab](/img/helpscout/authored/how-to-create-a-scorecard-muwi25xz.png)

![Add slab KPI](/img/helpscout/authored/how-to-create-a-scorecard-muwi2whp.png)

For example, you can select **New Leads** and configure slabs such as:

- **Between 5–10 New Leads**
- **10 or more New Leads**

You can then assign different points for each combination of the primary KPI (Perfomance Improvement in the above example) and New Leads slab.

![Slab rule](/img/helpscout/authored/how-to-create-a-scorecard-muwi3opm.png)

### Add a Metatag Filter

You can also add an organisation **Metatag** as a filter.

For example, if **Territory** is an organisation metatag, you can use Territory as a filter and define different grid scoring rules for each territory value.

For example:

| Performance Improvement | New Leads: 5–10 | New Leads: ≥10 | Territory |
|---:|---:|---:|---|
| 50 | 100 points | 200 points | NorthEast |
| 75 | 200 points | 500 points | NorthEast |
| 50 | 150 points | 250 points | East |
| 75 | 250 points | 550 points | East |

In this example, the score depends on the combination of:

- Performance Improvement
- New Leads
- Territory

![Grid with filter](/img/helpscout/authored/how-to-create-a-scorecard-muwi74lf.png)

This allows you to create multi-dimensional scoring rules based on KPI values and organisation-specific metatag values.

---

### h) Level with Filter

The **Level with Filter** measurement type works like the **Level** measurement type, where you define different KPI levels and assign a score to each level. It also allows you to apply a **Metatag filter** to define different scoring rules based on the selected metatag value.

For example:

| Performance Improvement | Points | Territory |
|---:|---:|---|
| 50 | 100 points | NorthEast |
| 75 | 200 points | NorthEast |
| 50 | 50 points | East |
| 75 | 100 points | East |

In this example:

- For **NorthEast**, 50 → 100 points and 75 → 200 points.
- For **East**, 50 → 50 points and 75 → 100 points.

This allows you to use the same Level-based scoring approach while applying different scoring rules for different values of an organisation metatag.

![Level with filter](/img/helpscout/authored/how-to-create-a-scorecard-muwi8h1q.png)

## 5. Select the Sales Reps for the Scorecard

Once you have configured the Scorecard and added the required KPIs, click **Create Scorecard**. 

You will then be taken to the user selection screen. You can add users individually or in bulk.

#### Add users individually:

Use the available filters to find the required users.
Depending on your organisation's configuration, you can filter users using fields such as:
- Business Unit
- Zone
- Group
- Name
- Email
- Metatags

![Select Sales Reps](/img/helpscout/authored/how-to-create-a-scorecard-mswucd4z.png)

Select the required users and add them to the Scorecard.

#### Add users in bulk:

You can upload users using a CSV file. To bulk upload users, click on the **Upload Users** button.

![Upload users option](/img/helpscout/authored/how-to-create-a-scorecard-muwilxg8.png)

It opens the following screen where you can upload a CSV file that contains your user details:

![Bulk Upload Users](/img/helpscout/authored/how-to-create-a-scorecard-mswuimvi.png)

**User Identifier:** Choose if you want to identify and upload the users by their Email Address or User Identifier.

**CSV Delimiter:** Select the CSV delimiter here—Comma or Semicolon.

**Download Template:** You can download the CSV file template here and fill in the user details.

**Choose File:** Click on this button and upload your user CSV file.

![Bulk Upload Users](/img/helpscout/authored/how-to-create-a-scorecard-mswuimvi.png)

## 6. Review and Configure Targets

After adding users, review the targets configured for each user and KPI. Here is how you will see the targets of each user:

![Change Targets](/img/helpscout/authored/how-to-create-a-scorecard-mswukoko.png)

Depending on the Scorecard configuration, targets may be:

- Entered manually.
- Obtained from another KPI.
- Automatically initialized.
- Carried forward from the previous period.

Review the target values and make any required changes before saving the Scorecard.

You can choose to change targets for the entire team by editing in the line of the **Target**. Refer to [How to add/change targets?](/modules/kpi-gamification/create-and-manage/how-to-add-change-targets) to learn more about editing the targets.

Once all the changes are done, click on **Save**, and the scorecard will be activated. The Scorecard will become active based on the configured activation settings.

### Scorecard Creation Flow
The overall process can be summarized as:

**Configure Scorecard → Configure Scorecard Settings → Add KPIs/KPI Collections → Select Measurement Type for selected KPIs → Configure Scoring Rules → Add Users → Review Targets → Save**