---
id: how-to-set-up-single-sign-on-sso-in-smartwinnr
title: "How to Set Up Single Sign-On (SSO) in SmartWinnr"
description: "Configure SmartWinnr SSO with Microsoft Entra ID, assign users and administrators, and verify access."
slug: how-to-set-up-single-sign-on-sso-in-smartwinnr
sidebar_position: 21
last_update:
  date: 2026-10-28
  author: Anagha Isal
customProps:
  roles: [admin, orgadmin, lamadmin, superadmin]
tags: ["settings", "integration"]
draft: true
---

> **At a glance** - Set up SSO so users sign in to SmartWinnr with your organization’s identity provider. Create separate applications for SmartWinnr and SmartWinnr Admin, then assign the right users to each one.

Use SSO to let people access SmartWinnr through your organization’s existing sign-in system. You configure one enterprise application for SmartWinnr users and a separate one for SmartWinnr Admin. After setup, assigned users can open the right app tile and sign in without managing another password.

## When to use this

Use this when you want SmartWinnr to authenticate through Microsoft Entra ID or another compatible identity provider.

- You want users to sign in with their organization account.
- You need separate access for SmartWinnr users and administrators.
- You want to control access through assigned users or groups.
- You are testing SSO before rolling it out to a wider audience.

## Before you start

Make sure you have:

- Global Administrator or Application Administrator permissions in Microsoft Entra ID
- The SmartWinnr metadata file
- The SmartWinnr Admin metadata file
- The SmartWinnr logo
- The SmartWinnr Admin logo
- The users or groups that need access
- Any tenant-specific values from the SmartWinnr team

## Steps

### 1. Create the SmartWinnr application

Sign in to the Azure portal, then go to **Microsoft Entra ID → Enterprise Applications**. Select **+ New application**, then **+ Create your own application**. Enter **SmartWinnr** as the application name, choose **Integrate any other application you don't find in the gallery (Non-gallery)**, and select **Create**.

### 2. Configure SAML sign-on

Open the **SmartWinnr** application, then go to **Single sign-on**. Select **SAML** as the sign-on method, then select **Upload metadata file**. Upload the SmartWinnr metadata file from the SmartWinnr team, and save the configuration.

The metadata file contains the settings needed to establish the SSO connection.

### 3. Add the application logo

Open **Properties** for the application. Upload the SmartWinnr logo, set **Visible to users?** to **Yes**, then select **Save**.

This makes the application available to assigned users in your organization’s application portal.

### 4. Set the Relay State

Go back to **Single sign-on → Basic SAML Configuration**, then select **Edit**. Find **Relay State (Optional)**, enter the tenant-specific value from the SmartWinnr team, and select **Save**.

The Relay State sends users to the correct SmartWinnr tenant after sign-in.

### 5. Create the SmartWinnr Admin application

Repeat the same process for the admin portal. Go to **Microsoft Entra ID → Enterprise Applications**, then select **+ New application → + Create your own application**. Enter **SmartWinnr Admin** as the application name, choose **Integrate any other application you don't find in the gallery (Non-gallery)**, and select **Create**.

### 6. Configure SmartWinnr Admin SSO

Open **Single sign-on** for **SmartWinnr Admin**, then select **SAML**. Upload the **Metadata-SmartWinnr-Admin.xml** file from the SmartWinnr team, then save the configuration.

### 7. Add the SmartWinnr Admin logo

Open **Properties** for **SmartWinnr Admin**. Upload the SmartWinnr Admin logo, set **Visible to users?** to **Yes**, then select **Save**.

### 8. Assign users and groups

Open each enterprise application, then go to **Users and groups**. Select **+ Add user/group**, choose the users or security groups that need access, and select **Assign**.

Assign users to **SmartWinnr** for the learner or user portal. Assign administrators to **SmartWinnr Admin** for the admin portal.

### 9. Verify access

Sign in to the Microsoft My Apps portal with a test user account. Confirm that the **SmartWinnr** tile appears, then open it to verify that SmartWinnr launches through SSO.

Repeat the test with a test administrator account. Confirm that the **SmartWinnr Admin** tile appears, then open it to verify that the admin console launches through SSO.

## Things to know

:::note
If an app tile does not appear in My Apps, check whether the user or group is assigned to that application.
:::

:::warning
Users assigned to **SmartWinnr** do not automatically get access to **SmartWinnr Admin**. Assign each application separately.
:::

:::note
If SSO does not work, confirm that you uploaded the correct metadata file, saved the configuration, and used the correct Relay State where required.
:::

SmartWinnr also supports SSO with other identity providers, including PingID and Keycloak. Contact the SmartWinnr team for the setup details for your provider.