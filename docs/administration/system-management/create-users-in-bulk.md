---
id: 5fda4abb27288b7f895d61dd
title: "Create users in bulk with a CSV file"
description: "Upload a CSV file in SmartWinnr to create or update multiple user accounts in bulk, simplifying user management for larger teams."
slug: create-users-in-bulk
sidebar_position: 118
last_update:
  date: 2026-08-19
  author: Anagha Isal
source:
  helpscout_id: 5fda4abb27288b7f895d61dd
  helpscout_url: 'https://help.smartwinnr.com/article/118-create-users-in-bulk'
customProps:
  roles: [admin, orgadmin, lamadmin, superadmin]
tags: ["admin", "settings", "onboarding"]
draft: false
---
> **At a glance** - SmartWinnr enables you to upload a CSV file for bulk user creation or modification, streamlining the process for large groups of users.

SmartWinnr allows you to upload a CSV file to create or modify user accounts in bulk. This feature is particularly useful when you need to add or update a large number of users at once. The email ID serves as the key for SmartWinnr to search for existing records in the database. If the system finds existing records, it updates the details of the account based on the values in the CSV. If no existing records are found, the system creates new users.

## When to use this

Use the bulk user creation feature when you need to:

- Add a large number of users to the system at once.
- Update existing set of user information efficiently.
- Ensure consistency in user data by using a standardized CSV format.

## Steps

### 1. Go to Manage Users

Navigate to **ADMIN > Manage Users**. Click on the **Add Users in Bulk** option from the hamburger menu.

![Go to ADMIN > Manage Users. Click on the “Add Users in Bulk” button from the hamburger menu.](/img/helpscout/admins/create-users-in-bulk-1.png)

### 2. Check and Map the File Sample

In order to create/update multiple user accounts in bulk, you need to prepare a CSV file in a specific template format which collects the required details of the user.
After initiating the bulk user upload process, prepare your CSV file using the following steps:

#### Choose the User Upload Mapping

- The **default user upload mapping** for your organization will be **automatically selected** in the top drop-down.
- If additonal user upload mappings are created for your organisation, click on the drop-down list to find the same.
- If the user upload mapping is not selected or available, please **contact your system administrator** or write to support@smartwinnr.com for assistance.

#### Download the Sample CSV

- The CSV file that you prepare to create/update user details should follow a **specific format**.
- Click on the **Download Sample CSV** button to download the standard template, which tells you the column heading and details that can go into the user upload file.

The file needs to be in CSV format. For best results, save the spreadsheet as CSV UTF-8 (Comma delimited). Without UTF-8 encoding, non-English characters in the file might not display correctly.

![The file needs to be in CSV format. For best result, save the spreadsheet as CSV UTF-8 (Comma delimited) Without UTF-8 encoding, non-English](/img/helpscout/admins/create-users-in-bulk-2.png)

#### Fill in User Details

- Open the downloaded CSV file in **Microsoft Excel** or a compatible spreadsheet application.
- Enter the user details as required.
- Ensure that **all mandatory fields** are filled correctly to avoid validation errors during upload.

![Once the CSV file is correctly filled and validated, proceed to the next step to upload the file.](/img/helpscout/admins/create-users-in-bulk-3.png)

Here's a short description for each column in the SmartWinnr User Upload template:

**Core Identity**

| Column | Description |Is Mandatory  |
|--------|-------------|---------------|
| FirstName | User's first name |Mandatory |
| LastName | User's last name |Mandatory |
| Email | Work email address used as the primary login identifier and communication means | Mandatory |
| employee_id | Unique employee ID from your HR system |Optional |
| orgUserIdentifier | Organization-specific unique identifier for the user. Fill the work email address here or any other unique identifier thats used in the organisation for each employee.  |Mandatory |
| Username | Alternate username for login (if different from the email address) |Optional |
| Password | Initial password assigned to the user. Fill this if you want to set different password for each user and you need the clarity of the password |Optional |
| personal_email_id | User's personal email address |Optional |
| personal_mobile_no | User's personal mobile number | Optional |
| Phone | User's work phone number |Optional |

**Org Structure**

| Column | Description |Is Mandatory  |
|--------|-------------|---------------|
| DivisionName | Division/Business unit the user belongs to |Mandatory |
| SubDivisions | Sub-division(s) within the primary division |Mandatory |
| Roles | SmartWinnr role(s) assigned (e.g., User, Manager, Admin, Editor). If the user has multiple roles, enter them as a comma-separated list. |Mandatory |
| PermissionSets | Permission set(s) controlling feature access. This is specific for restricting the left menus for Admin/Editor based on specific requirements. | Optional |
| GroupName | Group(s) the user is assigned to |Optional |
| metaTag0 – 29 | Thirty configurable custom attribute fields used to capture user-specific information such as product specialization, certification level, region mapping, or other organizational attributes not covered by the standard fields. Make sure these metatag values are already created in the system, to get this properly mapped when uploading the user details.| Optional |
| reportingManagerUniqueIdentifier | Unique identifier of the user's reporting manager. Make sure to fill the orgUserIdentifier value of the manager in this column. Fill this column if you want to set the manager heirarchy in the system |Optional |
| reportingManagerName | Display name of the reporting manager |Optional |

## Employment Details

| Column | Description |Is Mandatory  |
|--------|-------------|---------------|
| date_of_joining | Date the user joined the organization |Optional |
| date_of_confirmation | Date the user's employment was confirmed |Optional |
| confirmation_status | Employment confirmation status (e.g., Confirmed or Probation) |Optional |
| date_of_resignation | Date the user submitted their resignation |Optional |
| date_of_exit | Date the user officially exited the organization |Optional |
| band | Salary band or grade band of the user |Optional |
| employee_grade | Employee grade level |Optional |
| position_id | Job position identifier |Optional |
| cost_center_name | Cost center name the user is mapped to |Optional |
| cost_center_id | Cost center ID used for finance/HR mapping |Optional |
| office_location | User's assigned office location |Optional |
| location_type | Type of work location (e.g., Field, Office, Remote) |Optional |
| status | User account status (e.g., Active or Inactive) |Optional |

## Login & Access

| Column | Description |Is Mandatory  |
|--------|-------------|---------------|
| LoginType | Login type (e.g., Email, Phone) |Mandatory |
| loginMethods | Login method type (e.g., Password or SAML) | Mandatory |
| timezone | User's time zone for scheduling and notifications. This is important to set if you are creating the accounts for Editors, becasue the activities/task scheduled by the editor will go out in this time zone. By default, if no values are filled in this column, system will consider CET time zone | Optional |
| LanguageCode | User's preferred language (e.g., en, zh, de). By default it takes English as the language for the user. |Optional |

#### Important Notes

- Follow the column headings exactly as provided in the sample template.
- Do not modify or delete column headers.
- Incomplete or incorrect data may result in upload failures.

Once the CSV file is correctly filled and validated, proceed to the next step to upload the file.

### 3. Set Password Options

During user upload or creation, SmartWinnr provides multiple options to configure user login credentials. Administrators can choose the most appropriate option based on security policies and onboarding requirements.

#### Available Password Options

**1. Allow user to set Password**

- An **activation email** is sent to the user’s registered email ID.
- The user must click the activation link and **set their own password**.
- Until the account is activated by the user:
  - The account remains in **Inactive** status.
  - The user **cannot be assigned** quizzes, surveys, or SmartFeeds.
- This option is recommended when user-driven activation is preferred.

**2. Set Random Password**

- The system automatically generates a password based on the **organization’s password policy**.
- The user account is **activated immediately**.
- A welcome email is sent to the user containing:
  - Username
  - System-generated password
- Users can be assigned quizzes, surveys, and SmartFeeds **immediately after creation**.

**3. Manually Set Password**

- The administrator manually defines a password for the users during creation.
- The account is activated immediately
A welcome email is sent to the user containing:
  - Username
  - System-generated password
- Recommended for individual user creation or controlled access scenarios where you want all accounts to have same password set.

**4. Consider from File**

- The password is taken directly from the **uploaded file** during bulk user upload.
- Each user can have the **password** defined in the file.
- Accounts are activated immediately upon successful upload.
- Administrators must ensure the file follows the required password policy.

**5. Not Applicable - SAML**

- This option applies when **SAML (Single Sign-On)** is enabled for the organization. Make sure to have the login method as '**SAML**' in this case.
- Passwords are **not managed in SmartWinnr**.
- Users authenticate using their **corporate SSO credentials**.
- Password creation, storage, and security are handled by the organization’s identity provider.

![Password options for user creation](/img/helpscout/admins/create-users-in-bulk-4.png)

### 4. Upload CSV File

Upload the prepared CSV file to begin the bulk user creation process.

- Once the file is uploaded, the system provides **real-time status updates** on the processing progress.
- If any **validation errors** are detected (such as missing mandatory fields or incorrect data formats), the system will clearly display the error details.
- You can **correct the errors** in the CSV file and **re-upload** the file without restarting the entire process.
- After the upload is completed successfully, the **user creation details and status** will be displayed on the same page for your reference.

![Upload CSV file status updates](/img/helpscout/admins/create-users-in-bulk-5.png)
