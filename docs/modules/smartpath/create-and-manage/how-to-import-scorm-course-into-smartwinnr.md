---
id: 62b3e9dd0729834c424f8fad
title: How to Import SCORM course into SmartWinnr?
description: >-
  SmartWinnr supports the import of SCORM courses, enabling you to incorporate
  external e-learning content into your learning ecosystem.
slug: how-to-import-scorm-course-into-smartwinnr
sidebar_position: 271
last_update:
  date: 2026-01-20T00:00:00.000Z
  author: HelpScout Migration
source:
  helpscout_id: 62b3e9dd0729834c424f8fad
  helpscout_url: >-
    https://help.smartwinnr.com/article/271-how-to-import-scorm-course-into-smartwinnr
customProps:
  roles:
    - editor
    - admin
  privilege: smartpaths
tags:
  - smartpath
  - admin
---
SmartWinnr supports the import of SCORM courses, enabling you to incorporate external e-learning content into your learning ecosystem. Following are the SCORM versions that are supported in SmartWinnr:

a) version 1.2

b) version 2004 3rd edition

Follow the steps below to successfully upload and configure your SCORM package.

You can first export your SCORM course from the respective platform. Following is how you can export the courses from articulate 360.

### **How to export courses from articulate 360?**

We are considering the 'articulate 360' for exporting the SCORM course and the same will be implemented inside the SmartPath module of SmartWinnr.

Choose your course from  **articulate 360** and choose the contents that you would like to include in the SCORM course. Then click on the “**Publish**” option on the top right-hand corner of the page highlighted in red and Choose "**LMS"**.

![Choose your course from articulate 360 and choose the contents that you would like to include in the SCORM course. Then click on the “Publis](/img/helpscout/editors/how-to-import-scorm-course-into-smartwinnr-1.jpg)

Kindly follow the below-given instructions while exporting the SCORM course:

●      While exporting the SCORM Course, please use the following settings so that it gets uploaded properly into SmartPath - Modules:

**Publish Settings:**

![● While exporting the SCORM Course, please use the following settings so that it gets uploaded properly into SmartPath - Modules:](/img/helpscout/editors/how-to-import-scorm-course-into-smartwinnr-2.png)

&rarr    **LMS -** Choose SCORM version as 1.2 or SCORM 2004

&rarr    **Edition -** If LMS is chosen as SCORM 2004, choose the edition as 3rd Edition

**Tracking:**

You can track progress and completion in different ways:

&rarr    **Tracking using course completion** - 100% (Set the percentage of the course a learner must finish to mark as completed )

&rarr    **Track using quiz result** - quiz (you can use results from quiz)

&rarr    **Reporting** - Here we are supporting all the four options available.So, you can use the one that is used in your selected course.

&rarr    **Exit Course Link** **\-** This will provide an exit option to learner so that they can easily return to the home page and this will be captured by SmartWinnr.

&rarr    **Hide Cover Page -** We recommend not to switch off this option. So that the learner is able to understand that the SCORM Course is loading for them.

### **How to create a module for SmartPath**

Since the SCORM course needs to be imported inside the SmartPath module, you should have to create a module for the SmartPath.

[Learn how to create a module for SmartPath](https://help.smartwinnr.com/article/76-how-can-i-create-a-module-for-smartpath)

While creating the Segments, Choose the segment type as SCORM from the available options.

![While creating the Segments, Choose the segment type as SCORM from the available options.](/img/helpscout/editors/how-to-import-scorm-course-into-smartwinnr-3.png)

Upon creating the segment, you will be redirected to the following page:

![Upon creating the segment, you will be redirected to the following page:](/img/helpscout/editors/how-to-import-scorm-course-into-smartwinnr-4.png)

Here, you can define the SCORM version, course details, language, and upload the SCORM package to make it available to learners.

* **Business Unit:** Select the business unit under which the SCORM course will be created.
* **SCORM Version :** Choose the SCORM standard used to build the content. Supported versions include **SCORM 1.2** and **SCORM 2004 (3rd Edition)**.
* **Course ID:** A unique identifier get automatically populated to the SCORM course.
* **Cover Image:** Upload or change the cover image displayed to learners for this SCORM course.
* **Always Show Complete Button:** When enabled, the **Complete** button is visible after course completion, allowing learners to manually mark the course as completed.
* **Play in Popup:** Enable this option to launch the SCORM content in a popup window.
* **Enable Tracking :** When enabled, the course progress will be tracked
* **SCORM Title :** Enter the title of the SCORM course as it will appear to learners.
* **SCORM Description:** Provide a brief description of the SCORM course content (optional).
* **Upload ZIP** Upload the SCORM package as a ZIP file. Ensure the ZIP file follows SCORM standards.
* **Choose Content Center Item:** Select an existing SCORM package from the Content Center, if applicable.

## **How to create a SmartPath**

The next step is to create a SmartPath and attach the module that you have created with SCORM course.

##### [Learn how to create a SmartPath](https://help.smartwinnr.com/article/78-how-can-i-create-a-smartpath)

Once you create the SmartPath successfully, you can assign the same to the desired participants.
