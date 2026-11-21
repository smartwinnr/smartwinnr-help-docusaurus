---
id: how-to-set-up-single-sign-on-sso-in-smartwinnr
title: "How to Set Up Single Sign-On (SSO) in SmartWinnr"
description: "Configure SmartWinnr SSO with Microsoft Entra ID, assign users and administrators, and verify access."
slug: how-to-set-up-single-sign-on-sso-in-smartwinnr
sidebar_position: 21
last_update:
  date: 2026-11-05
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
- You are testing SSO before rolling it out to a wider audience.
 
## Before you start
 
You need to set up two SAML-based Enterprise Applications in 
your Microsoft Entra ID (formerly Azure Active Directory) tenant based on the requiremen:
 
- SmartWinnr — the application used by end users to access SmartWinnr.
- SmartWinnr Admin — the application used by administrators to manage SmartWinnr.
 
Both applications are configured the same way, using SAML 2.0 with metadata files provided by the  SmartWinnr team. Once set up, both application tiles will appear in your users' My Apps portal at 
https://myapps.microsoft.com/
 
Make sure you have:
 
- Global Administrator or Application Administrator permissions in Microsoft Entra ID
- The SmartWinnr metadata file
- The SmartWinnr Admin metadata file
- The SmartWinnr logo
- The SmartWinnr Admin logo
- The users or groups that need access
- Tenant-specific values from the SmartWinnr team
 
## Steps
 
### 1. Create the SmartWinnr application.
 
Sign in to the Azure portal, then go to **Microsoft Entra ID → Enterprise Applications**. Select **+ New application**, then **+ Create your own application**. 
1. Enter the application name as **SmartWinnr** when creating the application for SmartWinnr Users and enter the application name as **SmartWinnr Admin** when creating the application for SmartWinnr admin .
2. Select **Integrate any other application you don't find in the gallery (Non-gallery)**.
3. Click **Create** to provision the application.
 
![Create application](/img/helpscout/authored/how-to-set-up-single-sign-on-sso-in-smartwinnr-mw30o6w2.png)
 
### 2. Configure SAML sign-on
 
Open the **SmartWinnr** application, then go to **Single sign-on**. Select **SAML** as the sign-on method.
 
4. In the SAML configuration page, click **Upload metadata file** at the top.
5. Upload the file **Metadata-SmartWinnr.xml** provided by the SmartWinnr team for SmartWinnr user application and upload the file **Metadata-SmartWinnr-Admin.xml** for SmartWinnr admin application. The metadata file contains the settings needed to establish the SSO connection.
6. **Save** the configuration when prompted.
 
![Configure SAML](/img/helpscout/authored/how-to-set-up-single-sign-on-sso-in-smartwinnr-mw30oram.png)
 
 
### 3. Add the application logo
 
Open the **Properties** section of the application to customize how it appears to end users in the My Apps.
 
7. Click the **logo icon** and upload the SmartWinnr application logo provided.
8. Set **Visible to users?** to Yes. This enables the application tile to appear at
https://myapps.microsoft.com/.
9. Click Save to apply the changes.
 
This makes the application available to assigned users in your organization’s application portal.
 
### 4. Set the Relay State (SmartWinnr Tenant Parameter)
 
10. Go back to **Single sign-on → Basic SAML Configuration**, then select **Edit**.
 
Find **Relay State (Optional)**, enter the tenant-specific value from the SmartWinnr team given below, and select **Save** to finalize the Basic SAML Configuration.
 
![Relay state](/img/helpscout/authored/how-to-set-up-single-sign-on-sso-in-smartwinnr-mw30qt4e.png)
 
The Relay State sends users to the correct SmartWinnr tenant after sign-in.
 
    Note: Relay State is not required for the SmartWinnr Admin app
 
### 5. Assign users and groups
 
After both applications are created, assign the appropriate users or groups so they can access the apps:
 
11. Open the **application** (SmartWinnr or SmartWinnr Admin) → **Users and groups**.
12. Click **+ Add user/group**, select the appropriate users or security groups, and click **Assign**.
13. Repeat for the second application using the relevant administrator group(s).
 
![Assign users and group](/img/helpscout/authored/how-to-set-up-single-sign-on-sso-in-smartwinnr-mw36abwi.png)
 
Assign users to **SmartWinnr** for the user portal. Assign administrators to **SmartWinnr Admin** for the admin portal.
 
### 9. Verify access
 
### For SmartWinnr User application:
 
Sign in to the Microsoft My Apps portal with a test user account. Confirm that the **SmartWinnr** tile appears, then open it to verify that SmartWinnr launches through SSO.
 
![Final settings for user application](/img/helpscout/authored/how-to-set-up-single-sign-on-sso-in-smartwinnr-mw36djrc.png)
  
 
### For SmartWinnr Admin application:

Repeat the test with a test administrator account. Confirm that the **SmartWinnr Admin** tile appears, then open it to verify that the admin console launches through SSO.
 
![Final settings for admin application](/img/helpscout/authored/how-to-set-up-single-sign-on-sso-in-smartwinnr-mw36e9wh.png)
 
 
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