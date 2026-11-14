---
id: show-export-as-scorm-package-to-editors-on-role-plays
title: "Show Export as SCORM Package to Editors on role-plays"
description: "Export a conversational role-play as a SCORM package from the Coaching menu and download the ZIP file for your LMS."
slug: show-export-as-scorm-package-to-editors-on-role-plays
sidebar_position: 70
last_update:
  date: 2026-11-11
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [video-coaching]
draft: true
---
{/* release-draft: tag=v3.60.38 issue=9947 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9947 rev=4251df1a27af */}
{/* release-draft: tag=v3.60.10 issue=9891 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9891 */}
{/* release-update: issue=9947 summary="These edits add the completion-reporting toggle and clarify that the SCORM package downloads directly in the browser." */}

Open a conversational role-play from the Coaching list, then export it as a SCORM package from the View Coaching page. You can set the export options and download a ZIP file for your LMS.

## When to use this

Use this when you want to package a conversational role-play for use in your learning management system.

- You need a SCORM file for a role-play.
- You want to export from the role-play’s Coaching page.
- You want to upload the exported ZIP file to your LMS.

## Steps

### 1. Open the role-play
From the Coaching list, open the role-play you want to export.

### 2. Open the menu
On the View Coaching page, click the three-dot menu in the top-right corner.

### 3. Choose the SCORM export option
Under **Configuration & integrations**, select **Export as SCORM Package**.

### 4. Set export options
On the export page, choose the options you want for the package, including whether **Reporting completion to your LMS** is on or off.

### 5. Generate the ZIP file
Create the SCORM package and download the ZIP file through the browser.

### 6. Upload the package to your LMS
Use the downloaded ZIP file in your learning management system.

## Things to know

:::note
The SCORM export option appears only for conversational role-plays.
:::

:::note
If you do not see **Export as SCORM Package**, your organization may not have SCORM export enabled.
:::

:::note
If your network uses a web-security proxy, the download still starts from the browser after you create the package.
:::

:::note
When **Reporting completion to your LMS** is off, submitting the role-play for review does not mark the LMS activity complete until the review is finished.
:::