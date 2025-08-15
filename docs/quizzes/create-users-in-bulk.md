---
title: "Create users in bulk"
description: ""
slug: create-users-in-bulk
sidebar_position: 118
last_update:
  date: 2025-08-10
  author: HelpScout Migration
helpscout_id: 5fda4abb27288b7f895d61dd
helpscout_url: https://help.smartwinnr.com/article/118-create-users-in-bulk
---
SmartWinnr allows you to upload a CSV file to upload users in bulk. This is useful when you have a large number of users to be added or modified. Email id is the key with which SmartWinnr searches existing records in the database. If the system finds existing records, it updates the record from the value in the CSV. If no existing records are found, then the system creates a new user.

Step1:Create Users In Bulk

Go to ADMIN > Manage Users. Click on the Add Users in Bulk button from the hamburger menu.

![](/img/quizzes/helpscout-image-e8ad99d8.png)  
Step-2: Checking and Mapping File Sample

The default mapping for your organization will automatically be selected in the top drop-down.If not, contact your system administrator.

The uploaded file needs to be of a specific format. You can download the format by clicking on the Download Sample CSV button.ÂÂ

The file needs to be in CSV format. For best result, save the spreadsheet as CSV UTF-8 (Comma delimited), as shown in the image below. Without UTF-8 encoding, non-English characters in the file might not display correctly.

![](https://support.smartwinnr.com/api/v1/attachments/853) ![](https://support.smartwinnr.com/api/v1/attachments/854)

3\. Set password options

During the user uploads, there are 3 options for setting the user credentials:

* Set password by user: The user will get an activation link to her email. She needs to click on the email to activate the account and then will be prompted to set the account password. In this option, till the user activates her account, her account status will be in the de-active state and she cannot be assigned quizzes/surveys/SmartFeeds.
* Set random password: The system will randomly create a password as per the organizational password policy. The account will be automatically activated. The user will get a welcome mail with the username and password. She can be assigned quizzes/surveys/SmartFeeds immediately.
* Set the same password: Same as the above option. Only, in this case, all users who are being created as part of this upload will have the same password set. The admin has to select this password before uploading.

4\. Upload CSV file

Upload the CSV file. The system will provide real-time updates on the file processing. If there are any validation errors, the system will display the errors. You can re-upload the file after fixing the errors. Once all the user upload has been completed, you can see the details in this page.
