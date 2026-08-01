---
id: 5fda4f87b624c71b7985a29a
title: "How to bulk delete or deactivate users in SmartWinnr"
description: "Learn how to efficiently delete or deactivate multiple users in SmartWinnr using a CSV file for bulk management."
slug: delete-users
sidebar_position: 120
last_update:
  date: 2026-07-31
  author: Sruthi Suresh
customProps:
  roles:
    - admin
tags:
  - admin
  - settings
draft: false
---

> **At a glance** - This article explains how to deactivate users from SmartWinnr in bulk, including the option to permanently delete accounts.

You can delete users from SmartWinnr in bulk. This feature is useful when you need to manage user accounts efficiently.

## When to use this
Use this feature when you need to:
- Remove multiple users from your organization.
- Permanently delete users and their associated data.
- Deactivate users temporarily while retaining their data for future reactivation.

## Before you start
You will need a CSV file containing the email addresses of the users you wish to delete. Ensure the column name for the email list is “Email Address”.

## Steps

### 1. Navigate to Manage Users
Go to **ADMIN** > **Manage Users**. Click on the “Delete Users in Bulk” option in the drop-down from the hamburger menu.

![Manage users](/img/helpscout/authored/delete-users-ms8ne0wo.png)

### 2. Upload the CSV file
Upload a CSV file with the list of emails for the users who need to be deleted. The column name for the email address list must be “Email Address”.

![CSV upload](/img/helpscout/authored/delete-users-ms8ng5kl.png)

### 3. Choose deletion options
There is a “Delete Forever” checkbox. If you select this checkbox, the list of users will be permanently deleted along with any quizzes, SmartFeeds, Surveys, and any other associated objects. This data cannot be recovered once deleted.

If the checkbox is unchecked, the list of users will be deactivated. The admin can reactivate the users at a later date. None of the objects associated with the user will be deleted.