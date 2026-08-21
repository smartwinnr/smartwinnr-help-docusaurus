---
id: 5fdb0cafa5d295659b369c60
title: "What are Field Mappings?"
description: "Understand how to map fields from your data sources to the KPIs defined in SmartWinnr for accurate KPI data uploads and processing."
slug: what-are-field-mappings
sidebar_position: 172
last_update:
  date: 2026-08-20
  author: Anagha Isal
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
  privilege: kpi
tags:
  - kpi
  - gamification
draft: false
---

> **At a glance** - Field Mapping is essential for accurately uploading and processing KPI data in SmartWinnr. It connects your data source fields to the KPIs defined in the platform.

Field Mapping is a crucial step in setting up KPI data uploads in SmartWinnr. It defines how the fields (columns) in your uploaded data file are mapped to the corresponding KPIs and data fields configured in SmartWinnr. When KPI data is uploaded through a CSV file or other Integration Source, SmartWinnr uses the field mapping to understand what each column in the uploaded file represents and how the data should be processed.

For example, if your upload file contains fields such as **User ID**, **Date**, **Product**, and **Sales Amount**, the field mapping specifies which of these fields should be used to calculate or update the relevant KPI data in SmartWinnr.

## When to use this
Field Mapping is required to ensure SmartWinnr correctly interprets the data received from your source file. It ensures that the uploaded information is associated with the appropriate KPIs.

A mapping can define:

- Which fields from the source file should be imported into SmartWinnr
- Which SmartWinnr fields correspond to the columns in the upload file
- How the uploaded data should be processed for the configured KPIs
- Whether the data is uploaded as an Individual Record or a Daily Record
- The data fields required for a particular KPI data upload

Once the mapping is created, you can use it whenever the corresponding data file is uploaded in SmartWinnr to process or update the data.

## How to view existing Field Mappings
To view the Field Mappings configured for your organization:

### 1. Navigate to Field Mappings
Go to **Admin > KPI Settings > Field Mappings**.

### 2. View Mappings
The **KPI Integration Field Mappings** page displays the mappings available for the selected division. Use the available filters to view mappings based on:
- Division
- Integration Source
- Upload Type

Click on a mapping name to view its configuration and the fields included in the mapping. The Field Mappings page also displays details such as the Integration Source, Upload Type, and Total Fields configured for each mapping.

![Go to ADMIN > KPI Settings > Field Mappings.](/img/helpscout/editors/what-are-field-mappings-1.png)

## Creating a Field Mapping
If a mapping does not already exist for your KPI data source, you can create a new mapping by clicking **Create Mapping**. 

When creating the mapping, you define the fields from the source data file and specify how SmartWinnr should interpret and process those fields for KPI data.

[Learn more on how to create Field Mapping](https://help.smartwinnr.com/modules/kpi-gamification/create-and-manage/how-to-create-field-mapping/)

Note: The Field Mapping must be configured according to the structure and fields available in the data file that will be uploaded. Any changes to the structure of the source file may require the corresponding mapping to be updated.