---
id: how-to-import-scorm-course-into-smartwinnr
title: How to Import SCORM course into SmartWinnr?
description: >-
  SmartWinnr supports the import of SCORM courses, enabling you to incorporate
  external e-learning content into your learning ecosystem.
slug: how-to-import-scorm-course-into-smartwinnr
sidebar_position: 271
last_update:
  date: 2026-07-24
  author: Anagha Isal
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
  privilege: smartpaths
tags: ["smartpath", "admin", "onboarding"]
draft: false
---

> **At a glance** - This article explains how to import SCORM courses into SmartWinnr, including exporting from Articulate 360 and creating modules.

SmartWinnr supports the import of SCORM courses, enabling you to incorporate external e-learning content into your learning ecosystem. The following SCORM versions are supported in SmartWinnr:

- SCORM version 1.2
- SCORM version 2004 (3rd edition)

Follow the steps below to successfully upload and configure your SCORM package.

## When to use this

Use this guide when you want to:

- Import SCORM courses into SmartWinnr.
- Create a module for SmartPath using SCORM content.
- Ensure that your SCORM course is properly configured for tracking and reporting.

## Before you start

You need to export your SCORM course from the respective platform. This guide will use Articulate 360 as an example for exporting SCORM courses.

### How to export courses from Articulate 360

1. Choose your course from **Articulate 360** and select the contents you would like to include in the SCORM course.
2. Click on the **Publish** option in the top right-hand corner of the page, then select **LMS**.

![Choose your course from Articulate 360 and select the contents you would like to include in the SCORM course. Then click on the “Publish” option.](/img/helpscout/editors/how-to-import-scorm-course-into-smartwinnr-1.jpg)

Follow the instructions below while exporting the SCORM course to ensure it uploads properly into SmartPath:

#### Publish Settings

- **LMS:** Choose SCORM version as 1.2 or SCORM 2004.
- **Edition:** If you choose SCORM 2004, select the edition as 3rd Edition.

#### Tracking

You can track progress and completion in different ways:

![You can track progress and completion in different ways:
](/img/helpscout/authored/how-to-import-scorm-course-into-smartwinnr-mryrak06.png)

- **Tracking using course completion:** Set to 100% (the percentage of the course a learner must finish to mark it as completed).
- **Track using quiz result:** Use results from quizzes.
- **Reporting:** All four options are supported, so you can use the one that fits your selected course.
- **Exit Course Link:** This provides an exit option for learners to return to the home page, which will be captured by SmartWinnr.
- **Hide Cover Page:** It is recommended to keep this option enabled so that learners understand that the SCORM course is loading for them.

### How to create a module for SmartPath

Since the SCORM course needs to be imported into the SmartPath module, you must create a module for SmartPath.

[Learn how to create a module for SmartPath](https://smartwinnr-help-docusaurus-production.up.railway.app/modules/smartpath/create-and-manage/how-to-create-a-module-for-smartpath)

When creating the segments, choose the segment type as SCORM from the available options.

![While creating the segments, choose the segment type as SCORM from the available options.](/img/helpscout/editors/how-to-import-scorm-course-into-smartwinnr-3.png)

Upon creating the segment, you will be redirected to the following page:

![Upon creating the segment, you will be redirected to the following page.](/img/helpscout/editors/how-to-import-scorm-course-into-smartwinnr-4.png)

Here, you can define the SCORM version, course details, language, and upload the SCORM package to make it available to learners.

- **Business Unit:** Select the business unit under which the SCORM course will be created.
- **SCORM Version:** Choose the SCORM standard used to build the content. Supported versions include **SCORM 1.2** and **SCORM 2004 (3rd Edition)**.
- **Course ID:** A unique identifier that gets automatically populated for the SCORM course.
- **Cover Image:** Upload or change the cover image displayed to learners for this SCORM course.
- **Always Show Complete Button:** When enabled, the **Complete** button is visible after course completion, allowing learners to manually mark the course as completed.
- **Play in Popup:** Enable this option to launch the SCORM content in a popup window.
- **Enable Tracking:** When enabled, the course progress will be tracked.
- **SCORM Title:** Enter the title of the SCORM course as it will appear to learners.
- **SCORM Description:** Provide a brief description of the SCORM course content (optional).
- **Upload ZIP:** Upload the SCORM package as a ZIP file. Ensure the ZIP file follows SCORM standards.
- **Choose Content Center Item:** Select an existing SCORM package from the Content Center, if applicable.

### How to create a SmartPath

The next step is to create a SmartPath and attach the module that you created with the SCORM course.

##### [Learn how to create a SmartPath](https://smartwinnr-help-docusaurus-production.up.railway.app/modules/smartpath/create-and-manage/how-to-create-a-smartpath)

Once you create the SmartPath successfully, you can assign it to the desired participants.
