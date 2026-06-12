---
id: 5fda4f87b624c71b7985a29a
title: Delete users
description: You can delete users from SmartWinnr in bulk.
slug: delete-users
sidebar_position: 120
last_update:
  date: 2021-04-21T00:00:00.000Z
  author: HelpScout Migration
source:
  helpscout_id: 5fda4f87b624c71b7985a29a
  helpscout_url: 'https://help.smartwinnr.com/article/120-delete-users'
customProps:
  roles:
    - admin
tags:
  - admin
  - settings
---
You can delete users from SmartWinnr in bulk.

1\. Go to ADMIN > Manage Users. Click on the “Delete Users in Bulk” option in the drop-down from the hamburger menu.

![1\. Go to ADMIN > Manage Users. Click on the “Delete Users in Bulk” option in the drop-down from the hamburger menu.](/img/helpscout/admins/delete-users-1.png)

2\. You need to then upload a CSV file with the list of emails for the users who need to be deleted. The column name for the email id list must be “Email Address”.

![2\. You need to then upload a CSV file with the list of emails for the users who need to be deleted. The column name for the email id list m](https://support.smartwinnr.com/api/v1/attachments/859)

3\. There is a “Delete Forever” checkbox. On selecting that checkbox, the list of users will be permanently deleted along with any quiz/SmartFeeds/Surveys and any other associated object with the users. This data cannot be recovered once deleted.

If the checkbox is unchecked, the list of users will be deactivated. The admin can reactivate the users at a later date. None of the objects associated with the user will be deleted.
