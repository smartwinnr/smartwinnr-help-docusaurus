---
id: what-is-single-sign-on-sso-in-smartwinnr
title: "What Is Single Sign-On (SSO) in SmartWinnr?"
description: "Learn how SmartWinnr uses SSO, which sign-in options users see, and where SSO works across the platform."
slug: what-is-single-sign-on-sso-in-smartwinnr
sidebar_position: 11
last_update:
  date: 2026-10-14
  author: Anagha Isal
customProps:
  owner: jazz.k@smartwinnr.com
  roles: [admin, orgadmin, lamadmin, superadmin]
tags: ["integration"]
draft: false
---

> **At a glance** - Single Sign-On lets users sign in to SmartWinnr through your organization’s identity provider. This article explains how SSO works, and how users can access SmartWinnr through SSO.


## What Is SSO?

Single Sign-On (SSO) is an authentication method that allows users to access an application using their organization's existing identity and authentication system.

With SSO enabled in SmartWinnr, users can authenticate through their organization's identity provider and access SmartWinnr without needing to enter a separate SmartWinnr password to login to their SmartWinnr account.

You can also combine SSO with password login, depending on your organization’s configuration. The sign-in screen shows only the login methods that are enabled for your organization.

## When to use this

Use SSO when you want users to sign in with your organization’s existing authentication setup.

- Your organization already uses an identity provider for employee access.
- You want to allow both SSO and password login for different users or use cases.

## Before you start

Your organization needs the relevant SSO configuration in place.

## How Does SSO Work in SmartWinnr?

The SSO sign-in process typically follows these steps:

1. **Open SmartWinnr**: The user opens the SmartWinnr Admin Portal/web version/ mobile app.

2. Enter your **Username** and choose **Next**.

![Login screen](/img/helpscout/authored/what-is-single-sign-on-sso-in-smartwinnr-mv7p0ylz.png)

3. Select the SSO sign-in option and it will take them to the organization's identity provider.

![organization's identity provider login](/img/helpscout/authored/what-is-single-sign-on-sso-in-smartwinnr-mv7p3pkx.png)

Authenticate with the identity provider: The user is redirected to their organization's identity provider, where they complete the required authentication.

4. Return to SmartWinnr: After successful authentication, the user will be redirected back to SmartWinnr and signed in.

The identity provider verifies the user's identity and facilitates authentication before the user returns to SmartWinnr.

## Tips

- The sign-in methods shown to a user depend on your organization’s authentication setup.
- SSO works across the Admin Portal, web app, and mobile app.

## Things to know

:::note
The sign-in methods shown to a user depend on your organization’s authentication setup.
:::

:::note
SSO works across the Admin Portal, web app, and mobile app.
:::