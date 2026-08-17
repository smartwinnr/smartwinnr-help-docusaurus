---
id: 6943caf79c8f912774281514
title: How to Create Field mapping
description: 'To create a field mapping, go to Admin > KPI Settings > Field Mappings.'
slug: how-to-create-field-mapping
sidebar_position: 296
last_update:
  date: 2026-08-17
  author: Aswani TK
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
  privilege: fCoaching
tags: ["admin", "kpi"]
draft: false
---

> **At a glance** - This article explains how to create field mappings in the SmartWinnr platform, detailing each step and the required fields.

To create a field mapping, go to **Admin > KPI Settings > Field Mappings**.

## When to use this
Use field mappings when you need to upload KPI data from an external source into the SmartWinnr platform. This is essential for tracking performance metrics accurately.

## Steps

### 1. Click on Create Mapping
On the top-right corner, you will find the **Create Mapping** option. Click this button to create a new field mapping.

![On the top-right corner, you will find the Create Mapping option. Click on this button to create a new field mapping.](/img/helpscout/editors/how-to-create-field-mapping-1.png)

### 2. Fill in the Field Mapping Details
After clicking on **Create Mapping**, you can fill in the required **field mapping details**. Provide a **name** for the mapping as per your requirement.

There are **two upload types** available: **Daily Record** and **Individual Record**.

* **Daily Record**: This option allows you to upload **one value per KPI for a specific date**. If multiple values are uploaded for the same KPI on the same day, the system will **add them together and reflect them as a single consolidated value** for that date.

* **Individual Record**: In this option, each entry has a **unique record ID**. You can upload **multiple values for the same KPI on the same day**, and each value will be reflected **separately under different record IDs**.

In this case, we are selecting **Daily Record**, as we want to upload **one consolidated value per day**.

![In this case, we are selecting Daily Record, as we want to upload one consolidated value per day.](/img/helpscout/editors/how-to-create-field-mapping-2.png)

### 3. Specify KPI Fields
In the **KPI Fields**, the following details need to be provided:

* **Unique User ID**: This is the column in the data source that uniquely identifies each participant, such as an **email address**, **employee ID**, or any other unique identifier.

* **Date to Credit**: Enter the column name from the data source that represents the **date on which the KPI activity was completed**. The KPI value will be credited against this date.

* **KPI**: In this field, specify the **KPI for which values are being uploaded**.

Once all the required fields are filled in correctly, click on the **Save** button to save the field mapping.

![In this case, we are selecting Daily Record, as we want to upload one consolidated value per day.](/img/helpscout/editors/how-to-create-field-mapping-3.png)