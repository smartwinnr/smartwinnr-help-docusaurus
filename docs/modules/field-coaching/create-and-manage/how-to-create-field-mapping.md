---
id: 6943caf79c8f912774281514
title: How to Create Field mapping
description: 'To create a field mapping, go to Admin > KPI Settings > Field Mappings.'
slug: how-to-create-field-mapping
sidebar_position: 296
last_update:
  date: 2025-12-18T00:00:00.000Z
  author: HelpScout Migration
source:
  helpscout_id: 6943caf79c8f912774281514
  helpscout_url: 'https://help.smartwinnr.com/article/296-how-to-create-field-mapping'
customProps:
  roles:
    - editor
    - admin
  privilege: fCoaching
tags:
  - field-coaching
  - admin
---
To create a field mapping, go to **Admin > KPI Settings > Field Mappings**.

On the top-right corner, you will find the **Create Mapping** option. Click on this button to create a new field mapping.

![On the top-right corner, you will find the Create Mapping option. Click on this button to create a new field mapping.](/img/helpscout/editors/how-to-create-field-mapping-1.png)

After clicking on **Create Mapping**, you can fill in the required **field mapping details**. You may give a **name** to the mapping as per your requirement.

There are **two upload types** available: **Daily Record** and **Individual Record**.

* **Daily Record**:

    This option allows you to upload **one value per KPI for a specific date**. If multiple values are uploaded for the same KPI on the same day, the system will **add them together and reflect them as a single consolidated value** for that date.

* **Individual Record**:

    In this option, each entry has a **unique record ID**. You can upload **multiple values for the same KPI on the same day**, and each value will be reflected **separately under different record IDs**.

In this case, we are selecting **Daily Record**, as we want to upload **one consolidated value per day**.

![In this case, we are selecting Daily Record, as we want to upload one consolidated value per day.](/img/helpscout/editors/how-to-create-field-mapping-2.png)

![In this case, we are selecting Daily Record, as we want to upload one consolidated value per day.](/img/helpscout/editors/how-to-create-field-mapping-3.png)

In the **KPI Fields**, the following details need to be provided:

* **Unique User ID**:

    This is the column in the data source that uniquely identifies each participant, such as an **email address**, **employee ID**, or any other unique identifier.

* **Date to Credit**:

    Enter the column name from the data source that represents the **date on which the KPI activity was completed**. The KPI value will be credited against this date.

* **KPI**:

    In this field, you specify the **KPI for which values are being uploaded**.

Once all the required fields are filled in correctly, click on the **Save** button to save the field mapping.
