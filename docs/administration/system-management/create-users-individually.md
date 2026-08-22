---
id: 5fda4f4a0b11ce44f6392e62
title: Create users individually
description: >-
  SmartWinnr allows administrators to create users individually through the
  backend portal.
slug: create-users-individually
sidebar_position: 119
last_update:
  date: 2026-08-22
  author: Sruthi Suresh
source:
  helpscout_id: 5fda4f4a0b11ce44f6392e62
  helpscout_url: 'https://help.smartwinnr.com/article/119-create-users-individually'
customProps:
  roles: [admin, orgadmin, lamadmin, superadmin]
tags:
  - admin
  - settings
draft: false
---

> **At a glance** - This article explains how to create users individually in SmartWinnr through the backend portal. Follow the steps to ensure successful user creation.

SmartWinnr allows administrators to create users individually through the backend portal. This option is ideal when onboarding a small number of users or when quick updates are required for specific user accounts.

> **Note:** Only users with the appropriate **administrative privileges** can create new users.

## When to use this

Use this feature when you need to:

* Onboard new users individually.
* Update specific user accounts quickly.
* Manage user access and roles efficiently.

## Steps to Create a User Individually

### 1. Log in to the SmartWinnr Backend Portal

Sign in to the SmartWinnr backend portal using your administrator credentials.

### 2. Navigate to User Management

Go to:

**ADMIN > Manage Users > Add User**

### 3. Enter User Details

On the **Create User** page, provide the following information:

**Mandatory Fields**

* First Name
* Email ID
* User Identifier
* Business Unit / Division
* Sub-Division / Country
* Role

Ensure all mandatory fields are completed for successful user creation. Additional optional fields may be filled in based on organizational requirements.

### 4. Assign Role and Permissions

Select the appropriate **role** for the user. Role selection determines the features, modules, and access levels available to the user within SmartWinnr.

**Roles available in SmartWinnr:**

**1. USER**

* **Who:** Salespeople
* **Purpose:** End users who access and complete training, quizzes, and learning activities.

**2. MANAGER**

* **Who:** Managers of reportees in the organization.
* **Purpose:** Supervise and monitor their team's performance and progress.

**3. EDITOR**

* **Who:** Content and coaching coordinators.
* **Purpose:** Responsible for tracking and reporting on coaching.

**4. ADMIN**

* **Who:** System administrators.
* **Purpose:** Responsible for user management and administration.

### 5. Set Login Method

SmartWinnr supports multiple authentication methods to ensure secure and flexible access. Choose the appropriate login method based on your organization’s setup.

#### Password Login

* Users log in using their registered **email ID and password**.
* Recommended when **Single Sign-On (SSO)** is not enabled for the organization.

#### SAML Login

* SAML (Security Assertion Markup Language) enables authentication through the organization’s **Single Sign-On (SSO)** system.

When SAML login is enabled:

* Users sign in using their corporate credentials.
* Password management is handled by the organization’s identity provider.
* Users do not need to create or remember a separate SmartWinnr password.
* Provides enhanced security and seamless access.

### 6. Save the User

After entering all required details and selecting the login method, click **Create User** to create the user account successfully.

![After entering all required details and selecting the login method, click Create User to create the user account successfully.](/img/helpscout/admins/create-users-individually-1.png)

### After Creating the User

Once the user account is successfully created:

* The user will receive an **email invitation** to activate their account, **if the “Send Invitation Email” option is enabled**.
* The invitation email will contain instructions for completing the account setup process.
* Users must complete the **account activation steps** to log in and access the SmartWinnr platform.

> **Note:** If invitation emails are disabled, administrators must share login details or activation instructions with users manually.

![describe this screenshot](/img/helpscout/authored/create-users-individually-mt421q7s.png)
