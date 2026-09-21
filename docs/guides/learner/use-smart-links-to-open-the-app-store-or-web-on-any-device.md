---
id: use-smart-links-to-open-the-app-store-or-web-on-any-device
title: "Use deep links to open SmartWinnr on any device"
description: "Use a single deep Link to open the SmartWinnr app, app store, or web experience based on the user’s device."
slug: use-smart-links-to-open-the-app-store-or-web-on-any-device
sidebar_position: 20
last_update:
  date: 2026-09-19
  author: Manaswini V
customProps:
  owner: jazz.k@smartwinnr.com
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
tags: ["deep-links"]
draft: false
---

> **At a glance** - Deep Links send users to the right SmartWinnr experience based on their device and app availability.

Deep Links give you one shareable link for mobile and desktop users. The link opens the SmartWinnr app when it is installed, sends users to the app store when it is not, and opens the web application on desktop or laptop.

## When to use this

Use Deep Links when you want a single link that works across devices.

* Share one link in email or chat.
* Open SmartWinnr in the app on a phone with the app installed.
* Send mobile users to the App Store or Google Play when they need the app.
* Open the web application on a desktop or laptop.

### **Deep Link Address**

Deep Links use the **links.smartwinnr.com** domain, an official SmartWinnr domain used for Deep Link routing. Users may see this domain when they receive a SmartWinnr link through email or copy a Deep Link to share.

### **How Deep Links Work**

A Deep Link detects the user's device and whether the SmartWinnr app is installed, then directs the user to the appropriate destination.

| **User's Device**                       | **Deep Link Behavior**                                                    |
| --------------------------------------- | ------------------------------------------------------------------------- |
| **Phone with SmartWinnr app installed** | Opens the **SmartWinnr app** and takes the user to the intended content.  |
| **Phone without SmartWinnr app**        | Redirects the user to the appropriate **App Store or Google Play Store**. |
| **Desktop or Laptop**                   | Opens the **SmartWinnr web application**.                                 |

**Deep Link → Device & App Detection → Appropriate Destination**

## Things to know
Deep Links use the **links.smartwinnr.com** domain. Users may see this domain when they receive or share a Deep Link.
