---
title: "How to create a Field Mapping?"
description: ""
slug: how-to-create-a-field-mapping
sidebar_position: 173
last_update:
  date: 2025-08-10
  author: HelpScout Migration
helpscout_id: 5fdb0cd97129911ba1b21e50
helpscout_url: https://help.smartwinnr.com/article/173-how-to-create-a-field-mapping
---
A Field Mapping defines the processing logic within SmartWinnr. The entire intent of writing this logic is to ensure that the KPIs that we have defined in Step 1 has data through these field mappings.

Here is how you fill various fields while creating a mapping.

The first section is a generic section and defines the overall rule of reading the import data.

![](https://support.smartwinnr.com/api/v1/attachments/898)

Mapping Name: Enter the name of the mapping

Upload Type: Select the relevant upload type.

* Individual Record: If the data source (CSV, or data report) has rows by individual deal or call, then select this option. e.g., an agent can make 10 calls in 1 day and each call is a separate row in the data source. So for each of the calls, there is a row in the data source.
* Daily Record: If the data source has rows aggregated by date, then select this option. e.g., an agent makes 10 calls in 1 day and 1 row is present in the data source for all the 10 calls for that specific date

Sample of Individual Record:

![](https://support.smartwinnr.com/api/v1/attachments/752)

![](https://support.smartwinnr.com/api/v1/attachments/753)

* * *

_When you select 'Individual Record' there are going to be three mandatory fields- Unique User Id, Date To Credit, and Unique Record Id. If you choose 'Daily Record' then there are going to be two mandatory fields- Unique User Id and Date To Credit._

* * *

User Unique SmartWinnr Field: Denotes the field within SmartWinnr that uniquely defines a user. It can be email or any other field that has been decided to be a unique field. If you have admin access, go to Admin > Manage Users > Click on one user > Check the Email field or User Identifier field. The same field will need to be present in your data source.

Default Date Format: Select the date format to the one that will be present in your data source. In case the date in your data source is in the DD/MM/YYYY, then make sure that you specify the same date format in this field as well. For example, if the data source has a date 02/04/2019 and the date format is DD/MM/YY then an error will be thrown during the upload.

* * *

## CSV Fields

This section defines the mapping between individual columns in your data source to the data that will be imported into SmartWinnr. Each section defines a field. And each of these fields is either a mandatory field or is a KPI or a helper field that needed to calculate a KPI.

Each section has the following entries:

* Field Type: Select the correct field type
* Display Name: Enter a display name for this field. This name will be used when you view the uploaded data within SmartWinnr
* CSV Column Heading: Column header name in the CSV
* Description: Describe this field
* 'Add Filter' button: Use this button to add a filter for this field.

* * *

_The CSV Column Heading field needs to exactly match the relevant column header in the CSV file._

* * *

### Mandatory Fields

The first three sections are mandatory. Namely

* Unique User Id - Uniquely identifies a participant
* Date to Credit - The date against which this KPI will be entered
* Unique Record Id - Uniquely defines a record in the data source. This field is mandatory only if you have selected the 'Upload Type' as 'Individual Record'

For the purpose of explanation, we will use this CSV as a sample throughout this page

![](https://support.smartwinnr.com/api/v1/attachments/754)

Unique User Id

This is a mandatory field. Map that column in the data source that uniquely identifies the participant. It can be an email address, employee id, etc.

Our reference CSV shows the 'User' column to be the one that uniquely identifies the participant with an email address. So 'User' goes into the 'CSV Column Heading' field.

![](https://support.smartwinnr.com/api/v1/attachments/755)

Date to Credit

This is the 2nd mandatory field. Enter the column name in the data source that identifies the date against which this _KPI was completed_.

In this example, the column is 'Date'

![](https://support.smartwinnr.com/api/v1/attachments/756)

* * *

_The 'Date to Credit' field is not the date on which this record was created in the CRM, but the date when the KPI was completed._

* * *

Unique Record Id

The 'Unique Record Id' is the field that will map to that column in your data source that uniquely identifies a record row. This can be a transaction number, a row number, or a unique identifier from your source data.

In this sample, its the 'Transaction Number'

![](https://support.smartwinnr.com/api/v1/attachments/757)

* * *

_The 'Unique Record Id' field is mandatory only if you have selected the 'Upload Type' as 'Individual Record'_

* * *

### KPIs

Each field mapping must have a KPI as a field. Because the entire intent of writing a Field Mapping is to ensure that the KPIs that we have defined in Step 1 has data through this logic.

As a sample, we will take the KPI 'Number of New Signups'. It's defined as a 'Sum' and we will see how to fill values into this KPI.

![](https://support.smartwinnr.com/api/v1/attachments/758)

We click on the 'Add Field' button to add a field. Next, enter the

* 'Field Type' = KPI,
* Select KPI as 'New signups' (this comes from the pre-filled list of [KPI Definitions](https://smartwinnr.drift.help/article/what-are-field-definitions/?v=1556012737058) we created in Step 1)
* CSV Column Heading = 'New Signups' (refer to sample CSV mentioned earlier in this article, where 'New Signups' is a column)
* Record Operation = Sum

![](https://support.smartwinnr.com/api/v1/attachments/759)

## Filters

There are 2 types of filters present within SmartWinnr.

1. Filter at the overall data level - This filter will help you to restrict data that's imported into SmartWinnr
2. Filter at the field level - This filter will help you to restrict data for each field.

### Filter at the Overall Data Level

This filter acts as an overall filter in importing data into SmartWinnr. For example, if your data source has generated data from 01 Dec 2018 till current date. But you are interested to import only FY 2019's data, then you will define a filter like this:

             ![](https://support.smartwinnr.com/api/v1/attachments/760)

How to Add Filter at an Overall Data Level

Click on the 'Add Filter' button that you see on the page:

                                                                      ![](https://support.smartwinnr.com/api/v1/attachments/761)

Add Filter: This adds filters to the fields based on which you can aggregate or slice the data in the fields. When you click on the 'Add Filter' field, a pop-up will open.

Filter Operation: This lets you choose two operations- OR and AND based on which the filtering will be done.

Filter Key: This lets you choose the field on which filtering will be done.

Filter Comparator: You can choose the comparators here like Equal, Not Equal, Less Than, Greater Than

Filter value: This is the value based on which filtering will be done.

Once you have entered all the filters, click on the 'Save' button to save the changes.

### Filter at the Field Level

Such filters are extremely helpful when you have to define restrictions at the level of individual fields. For example, if you had to record a new KPI called 'New signups for Product A' in which you have to consider only those signups that are for Product A. And ignore signups for other products.

Create a field for the KPI 'New signups for Product A'. It will still map to the column 'New Signups' but will now have a restriction. Click on this button:

                                                                                         ![](https://support.smartwinnr.com/api/v1/attachments/762)

It will add a section just below the earlier details. Build the logic to ignore all other signups, except for Product A. Note the changes in the screenshot below:

![](https://support.smartwinnr.com/api/v1/attachments/763)

Wondering where the 'Product Type' came from? This example brings us to the next type of field that can be added into the Field Mapping, called Helper Fields.

* * *

## Helper Fields

Helper fields are simply fields that help to generate the KPI fields. For example, if you had to record a new KPI called 'New signups for Product A' in which you have to consider only those signups that are for Product A. And ignore signups for other products.

From this CSV:

![](https://support.smartwinnr.com/api/v1/attachments/764)

We will now create a new helper field called 'Product Type'. Its Field Type will be String and will have the values mentioned below.

![](https://support.smartwinnr.com/api/v1/attachments/765)

![](https://support.smartwinnr.com/api/v1/attachments/766)

Such helper fields can be of types Number, Date or String. These are extremely helpful when adding filters at the field level.

* * *

_Thumb rule: Add all the important columns in your data source to the Field Mapping. Even if you don't need them right now, you might need them later on. Adding them as fields in the field mapping will ensure that SmartWinnr will upload the data into its processed table for later use._

* * *

 Once you enter all the required fields in the 'Create KPI Integration Field Mapping' page, click on the 'Create' button to create mapping successfully.

![](/img/reports/helpscout-image-62b8fec3.png)
