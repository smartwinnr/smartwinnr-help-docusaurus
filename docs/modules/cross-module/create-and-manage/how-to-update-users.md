---
id: 696cf34e0ef05b444cde8d3c
title: How to Update Users
description: >-
  SmartWinnr allows administrators to update user details individually through
  the backend portal.
slug: how-to-update-users
sidebar_position: 298
last_update:
  date: 2026-01-18T00:00:00.000Z
  author: HelpScout Migration
source:
  helpscout_id: 696cf34e0ef05b444cde8d3c
  helpscout_url: 'https://help.smartwinnr.com/article/298-how-to-update-users'
customProps:
  roles:
    - editor
    - admin
tags:
  - admin
---
## How to Update a User Individually in SmartWinnr

SmartWinnr allows administrators to update user details individually through the backend portal. This option is useful when you need to modify specific user information such as role, business unit, reporting details, or login settings.

> **Note:** Only users with the required **Admin privileges** can update user details.

### Step 1: Log in to the SmartWinnr Admin Portal

* Sign in to the **SmartWinnr Admin Portal** using your administrator credentials.

### Step 2: Navigate to Manage Users

* Go to **ADMIN > Manage Users**.
* The user list page will open, displaying all users in your organization.

![Step 2: Navigate to Manage Users](/img/helpscout/editors/how-to-update-users-1.png)

### Step 3: Search for the User

* Use the **search bar** or available **filters** (Name, Email ID, Business Unit, Role, etc.) to locate the user you want to update.
* Click on the **user name** to open the user profile.

![Step 3: Search for the User](/img/helpscout/editors/how-to-update-users-2.png)

### Step 4: Edit User Details

Once the user profile opens, click on the **Edit** option and update the required fields, such as:

* **Personal Information**
  * First Name
  * Last Name
  * Email ID (if editable)
  * User Identifier

        **Organizational Details**

  * Business Unit / Division
  * Sub Division / Country
  * Territory (if applicable)

        **Role and Permissions**

  * Update the user’s **role** based on responsibilities.
  * Role changes will automatically update the user’s access permissions.

        **Login Method**

  * Password Login
  * SAML Login (if enabled for the organization)

> **Note:** If SAML login is enabled, password-related options will not be applicable.

![](/img/helpscout/editors/how-to-update-users-3.png)

### Step 5: Save Changes

* After making the required updates, click **Save** **Changes** to apply the changes.
* The updated details will take effect immediately.

### Important Notes

* Mandatory fields must not be left blank while updating.
* Changes to roles or divisions may impact the user’s access to quizzes, surveys, SmartFeeds, and reports.
* Email notifications are not sent automatically for profile updates unless explicitly configured.

## How to Update Users in Bulk in SmartWinnr

SmartWinnr allows administrators to update multiple users at once using a **CSV file upload**. This method is ideal when you need to modify user details such as role, division, reporting structure, or login settings for a large number of users efficiently.

> **Note:** Only users with the required **Admin privileges** can perform bulk user updates.

### Step 1: Log in to the SmartWinnr Admin Portal

* Sign in to the **SmartWinnr Admin Portal** using your administrator credentials.

### Step 2: Navigate to Bulk User Upload

* Go to **ADMIN > Manage Users > Hamburger Menu>Add Users in Bulk**
* This page allows you to upload or update users in bulk using a CSV file.

![Step 2: Navigate to Bulk User Upload](/img/helpscout/editors/how-to-update-users-4.png)

### Step 3: Download the Sample CSV File

* Click on **Download Sample CSV** to download the predefined file format.
* The sample CSV contains all supported fields and highlights mandatory columns.

> **Important:** The CSV file must follow the exact format provided by SmartWinnr for a successful upload.

### Step 4: Prepare the CSV File

* Open the downloaded CSV file in Excel.
* Update the required user details for existing users.

    Ensure the following **mandatory fields** are correctly filled:

  * Email ID or User Identifier (used to identify existing users)
  * First Name
  * Business Unit / Division
  * Sub Division / Country
  * Role

> **Tip:**
>
> * To update existing users, ensure the **User Identifier** exactly matches the existing user record.
> * Do not delete or rename column headers.

### Step 5: Set Password Options (If Applicable)

### During bulk upload, you may see password-related options

* **Set Password by User**

    Users receive an activation email and set their own password. Until activation, the account remains inactive.

* **Set Random Password**

    The system generates a password and sends login credentials via email. The account becomes active immediately.

* **Manually Set Password**

    Admin defines the password manually during upload.

* **Consider from File**

    Passwords are picked from the CSV file.

* **Not Applicable (SAML Login)**

    Password options are disabled when SAML login is enabled.

### Step 6: Upload the CSV File

* Click **Upload CSV** and select the completed file.
* The system will validate the file and display real-time status updates.

### Step 7: Review Validation Results

* If any errors are found, they will be displayed with clear messages.
* Fix the errors in the CSV file and re-upload.
* Once the upload is successful, the updated user details will be applied.

### Step 8: Confirm User Updates

* After completion, you can review the updated users from **ADMIN > Manage Users**.
* Updated users can immediately access SmartWinnr based on their revised roles and permissions.

### Important Notes

* Bulk upload **updates existing users** only when identifiers match correctly.
* Role or division changes may affect assigned quizzes, surveys, SmartFeeds, and reports.
* Invitation emails are sent only if the **Send Invitation Email** option is enabled.
