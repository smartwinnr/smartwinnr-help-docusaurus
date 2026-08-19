---
id: 696cf34e0ef05b444cde8d3c
title: "How to update User details in SmartWinnr?"
description: "Update user details in SmartWinnr, either individually or in bulk using a CSV file for efficient management."
slug: how-to-update-users
sidebar_position: 298
last_update:
  date: 2026-08-19
  author: Anagha Isal
source:
  helpscout_id: 696cf34e0ef05b444cde8d3c
  helpscout_url: 'https://help.smartwinnr.com/article/298-how-to-update-users'
customProps:
  roles: [admin, orgadmin, lamadmin, superadmin]
tags: ["admin", "onboarding"]
draft: false
---

> **At a glance** - SmartWinnr allows administrators to update user details individually or in bulk through the backend portal. This guide details both methods.

## When to use this
Use this article when you need to update user information in SmartWinnr. You can update user details individually or in bulk, depending on your needs.

* Update a single user's details, such as role, business unit, or login settings.
* Modify multiple users' information efficiently using a CSV file upload.
* Ensure user information is current for accurate reporting and access management.

## Before you start
* Only accounts with the required **Admin privileges** can update user details.
* When you have larger list of users to update, prepare any necessary information or CSV files before starting the update process.

## Steps

### How to Update User details in Manually (one-by-one) in SmartWinnr

### 1. Log in to the SmartWinnr Admin Portal
* Sign in to the **SmartWinnr Admin Portal** using your administrator credentials.

### 2. Navigate to Manage Users
* Go to **ADMIN > Manage Users**.
* This will list down all the accounts available under your Business Unit.

![Step 2: Navigate to Manage Users](/img/helpscout/editors/how-to-update-users-1.png)

### 3. Search for the User
* Use the **search bar** or available **filters** (Name, Email ID, Business Unit, Role, etc.) to locate the user you want to update.
* Click on the **user name** to open the user profile.

![Step 3: Search for the User](/img/helpscout/editors/how-to-update-users-2.png)

### 4. Edit User Details
Once the user profile opens, click on the **Edit** option and update the required fields, such as:

* **Personal Information**
  * First Name
  * Last Name
  * Email ID (if editable)
  * User Identifier

* **Organizational Details**
  * Business Unit / Division
  * Sub Division / Country
  * Metatags (User-specific information such as product specialization, certification level, region mapping, or other organizational attributes, available for your organization) 
  * Territory (if applicable)

* **Role and Permissions**
  * Update the user’s **role** based on responsibilities.
  * Role changes will automatically update the user’s access permissions.

* **Login Method**
  * Password Login
  * SAML Login (if enabled for the organization)

![Step 4: Edit User Details](/img/helpscout/editors/how-to-update-users-3.png)

### 5. Save Changes
* After making the required updates, click **Save Changes** to apply the changes.
* The updated details will take effect immediately.

### How to Update Users in Bulk
SmartWinnr allows administrators to update multiple users at once using a **CSV file upload**. This method is ideal when you need to modify user details such as role, division, reporting structure, or login settings for a large number of users efficiently. Follow the below steps to update users via CSV upload:

### 1. Log in to the SmartWinnr Admin Portal
* Sign in to the **SmartWinnr Admin Portal** using your administrator credentials.

### 8. Navigate to Bulk User Upload
* Go to **ADMIN > Manage Users > Hamburger Menu > Add Users in Bulk**.
* This page allows you to upload or update users in bulk using a CSV file.

![Step 8: Navigate to Bulk User Upload](/img/helpscout/editors/how-to-update-users-4.png)

### 9. Download the Sample CSV File
* Click on **Download Sample CSV** to download the predefined file format.
* The sample CSV contains all supported fields.

> **Important:** The CSV file must follow the exact format provided by SmartWinnr for a successful upload.

### 10. Prepare the CSV File
* Open the downloaded CSV file in Excel.
* Update the required user details for existing users.

Ensure the following **mandatory fields** are correctly filled:
* Email ID or User Identifier (used to identify existing users)
* First Name
* Business Unit / Division
* Sub Division / Country
* Role

> **Tip:** 
> * To update existing users, ensure the **Email address or User Identifier** exactly matches the existing user record.
> * Do not delete or rename column headers.

### 11. Set Password Options (If Applicable)
During bulk upload, you may see different password-related options. However, if a user already exists in SmartWinnr, providing a new password during the upload, will **not** update the existing user's password.

This is designed to ensure that user information can be updated through bulk upload without interrupting users' existing login credentials or daily activities.
### 12. Upload the CSV File
* Click **Upload CSV** and select the completed file.
* The system will validate the file and display real-time status updates.

### 13. Review Validation Results
* If any errors are found, they will be displayed with clear messages.
* Fix the errors in the CSV file and re-upload.
* Once the upload is successful, the updated user details will be applied.

### 14. Confirm User Updates
* After completion, you can review the updated users from **ADMIN > Manage Users**.
* Updated users can immediately access SmartWinnr based on their revised roles and permissions.

## Important Notes
* Mandatory fields must not be left blank while updating.
* Changes to roles or divisions may impact the user’s access to quizzes, surveys, SmartFeeds, and reports.
* Email notifications are not sent automatically for profile updates unless explicitly configured.
* Bulk upload **updates existing users** only when identifiers match correctly.
* Invitation emails are sent only to newly created account and if the **Send Invitation Email** option is enabled.