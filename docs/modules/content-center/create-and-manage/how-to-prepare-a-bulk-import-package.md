---
id: how-to-prepare-a-bulk-import-package
title: "How to prepare a bulk import package"
description: "Prepare a ZIP package with metadata and assets for creating, updating, or validating Content Center content in bulk."
slug: how-to-prepare-a-bulk-import-package
sidebar_position: 40
last_update:
  date: 2026-09-30
  author: Manaswini V
customProps:
  owner: jazz.k@smartwinnr.com
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: ["content-center", "bulk-import"]
draft: false
---

> **At a glance** - Prepare a bulk import package by downloading the metadata template, adding your files and metadata, and zipping everything together. Use **Validate only** to check the package before you import.

Use bulk import when you need to add or update multiple content files in Content Center at once. You can prepare the content in a spreadsheet, package the files, and then import them together.

## When to use this

Use this when you need to:

- Add multiple content files to Content Center at once.
- Prepare content and metadata in a spreadsheet.
- Update existing content in bulk.
- Validate a bulk import package before importing it.

## Steps

## 1. Open **Bulk Import**
In the **Editor Portal**, go to **Content Management > Content Center > All Content Center**. On the right side, open the **hamburger menu** and select **Bulk Import**.
![kindly click on bulk import](/img/helpscout/authored/how-to-prepare-a-bulk-import-package-munrb7x5.png)
## 2. Bulk Import Content page
After selecting **Bulk Import** from the hamburger menu, the **Bulk Import Content** page opens.
* **Back to Folder:** Click **Back to Folder** to return to the current Content Centre folder.
* **Download Template:** After selecting the import action, package format, and run option, click **Download Template** to download the spreadsheet template. Fill in the spreadsheet and add the corresponding content files to the `assets` folder. 
* **Show the columns the sheet accepts:** Click **Show the columns the sheet accepts** to view the supported columns for `metadata.csv`.

![bulk upload page](/img/helpscout/authored/how-to-prepare-a-bulk-import-package-munsb3tl.png)


## 3. Choose the import action
Under **New content or changes to existing content**, select the action you want.

Choose **Create new content** to create a new content item for each row in the spreadsheet.

Choose **Update existing content** to update content items that already exist in Content Center. Use **Content Id** to identify each item.
![kindly select the import action](/img/helpscout/authored/how-to-prepare-a-bulk-import-package-munrdekn.png)


## 4. Select the package format
Under **How the package describes its content**, select **Spreadsheet (data/metadata.csv)**.

Each row in the spreadsheet represents one file. Use `source_path` for the file and `destination_path` for the target Content Center folder.
![kindly Select the package format](/img/helpscout/authored/how-to-prepare-a-bulk-import-package-muns1qsq.png)
## 5. Choose what the run does
Under **What should this run do**, choose one of these options:

- **Validate only** to check the package without creating or updating content items.
- **Import** to create or update content items from the package.

If you chose **Create new content**, **Import** creates the content items from valid rows.

If you chose **Update existing content**, **Import** applies the updates using **Content Id**.
![ Choose what the run does](/img/helpscout/authored/how-to-prepare-a-bulk-import-package-muns3oym.png)
## 6. Fill in the spreadsheet

For **new content**, add one row for each file you want to create. For **existing content**, include the **Content Id** and provide values only for the fields you want to update.

Use the following fields to provide the content details:

| Field                              | Description                                                                |
| ---------------------------------- | -------------------------------------------------------------------------- |
| **Source File**                    | Path of the file from the `assets` folder that you want to import.         |
| **Destination Folder**             | Content Centre folder where the content should be saved.                   |
| **Title**                          | Title of the content item.                                                 |
| **Description**                    | Description of the content item.                                           |
| **Tags**                           | Tags to associate with the content.                                        |
| **Competencies**                   | Competencies to associate with the content.                                |
| **Content Type**                   | Type of content, such as PDF, video, SCORM, or image.                      |
| **Status**                         | Status of the content, such as Draft, Published, or Archived.              |
| **Language**                       | Language of the content.                                                   |
| **Approved At**                    | Date and time when the content was approved, if applicable.                |
| **Approver Email ID**              | Email address of the person who approved the content, if applicable.       |
| **Auto Archive Date (YYYY-MM-DD)** | Date on which the content should be automatically archived, if applicable. |
| **Content Code**                   | Content code for the content item.                                         |
| **Legacy Created On**              | Original creation date, if applicable.                                     |
| **Legacy Created By**              | Original creator, if applicable.                                           |
| **Legacy Modified On**             | Original modification date, if applicable.                                 |
| **Legacy Modified By**             | Original modifier, if applicable.                                          |

 **Note:** The metadata fields are optional. Add the fields required for your content. Legacy fields can be used to retain content information from external systems. 

For **updates**, include the **Content Id** to identify the existing content item. Leave fields blank when you do not want to change their existing values.


Once the CSV file is prepared and the content files are added to the `assets` folder, click **Choose File** to upload the prepared `.zip` package. Ensure that the ZIP file does not exceed **500 MB**, and then click **Start Import** to begin the import process.

## 7. View Import Status

After clicking **Start Import**, the **Import Status** section displays the import progress and results.

* **Status** – Shows the import status.
* **Assets** – Shows the total number of assets processed.
* **Valid** – Shows the number of successfully processed assets.
* **Failed** – Shows the number of assets that could not be processed.

### Previous Imports

The **Previous Imports** section shows earlier import attempts, including the package name, mode, status, and number of assets processed.

Click **View Contents** to see the details of a specific import, including the row, status, content, file, and any error details.

 **Note:** If an item fails, review the error shown in **Details**, correct the issue, and run the import again.


## Things to know

## Tips

* Keep the ZIP package structure simple and consistent.
* Ensure each file path in `metadata.csv` matches the corresponding file in `data/assets/`.
* Use **Validate only** to identify package issues before running the import.
* For updates, leave fields blank when you do not want to change the existing content.

Available next action: Create a downloadable DOCX file here in this chat containing the editable prose above
