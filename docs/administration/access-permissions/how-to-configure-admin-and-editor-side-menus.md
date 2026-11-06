---
id: how-to-configure-admin-and-editor-side-menus
title: "How to Configure Admin and Editor Side Menus"
description: "Customize Admin and Editor side menus with sections, access restrictions, sub-menu items, and restricted links."
slug: how-to-configure-admin-and-editor-side-menus
sidebar_position: 206
last_update:
  date: 2026-10-21
  author: Anagha Isal
customProps:
  roles: [admin, orgadmin, lamadmin, superadmin]
tags: ["admin", "editor", "configure-menus"]
draft: true
---

> **At a glance** - Menu Configuration lets you customize the side menus for Admin and Editor users in SmartWinnr. You can organize menu items into sections, apply division and sub-division restrictions, configure supported sub-menu items, and add restricted links for specific organizational units or meta-tag values.

Use menu configuration when you want to customize left menus for Admin and Editor roles. If you do not create a custom menu for a role, SmartWinnr keeps that role’s default menu.

## When to use this

Use this when you need to:

- Customize the side menu for Admin or Editor users.
- Control menu access by division and sub-division.
- Choose supported sub-menu items for specific modules.
- Rename default Admin menu items.
- Add restricted links for specific organizational units or meta tags.

## Steps

### 1. Open menu configuration

Log in to the SmartWinnr Portal, then go to **Admin > Company Settings > Menu Configuration**. 

![Menu configuration](/img/helpscout/authored/authored-mv4wta7c.png)

### 2. Enter the menu details
Click **Add Menu** at top right corner to create a new Menu for the required role.
![Add menu](/img/helpscout/authored/authored-mv4wx0jh.png)

Enter the basic details for setting up a new menu configuration:

**Menu Title**: Enter the title for the menu. 

**Select Role**: Choose Admin or Editor to specify which role the menu applies to. Depending on the role you choose, you can find the menu items that can be added to your new menu configuration.

**Description**: Add a description, if required.

**Manage Translation**: Configure the menu items and sub-menus in the required languages. If the menu is configured in multiple languages, the left menu will be displayed in the language selected by the user, provided the corresponding translations have been configured.

![Menu Title, Description and manage translation](/img/helpscout/authored/how-to-configure-admin-and-editor-side-menus-mv7w1evk.png)

### 3. Set organizational restrictions

If you want the new menu to be available only for a specific division or subdivision, you can add the required division and sub-division restrictions. If no restriction is added, the new menu gets applied to everyone with the specific role.

Select **Click here** to add divisional and sub-divisional access. Do the same for Editor menus when needed.

![divisional and sub-divisional access](/img/helpscout/authored/how-to-configure-admin-and-editor-side-menus-mv7w4q8m.png)


### 4. Add sections

Sections help organize related menu items into logical groups, making the side menu easier to navigate.

To add a section:

1. Select **Add Section**.
2. Enter the **Section Name**.
3. Add a **Description**, if required.

Repeat these steps to create additional sections.

![Configure menu items](/img/helpscout/authored/authored-mv50tykp.png)

You can organize menu items under the appropriate sections when configuring the menu.

To remove a section, click the red Delete (trash) icon associated with it. Review the section and its associated menu items before deleting it.

### 5. Configure Menu Items

Menu items determine which modules are available in the custom left menu.

You can configure fields such as:

**Type**: Specifies the menu item type. (Page, External Link, PDF)

**Privilege**: If you choose the type as **Page**, privilege will list down the modules (menus) that you can add in your left menu.

**Sections**: Determines the section under which this menu item is organized.

**Menu Item Title**: Defines the title displayed for the menu item.

**Description**: Provides additional information about the menu item. (Optional)

**Metatag**: If you want to display a specific left menu item only to users associated with certain metatag values, select the relevant metatag here. Then, choose the permitted values for that metatag in the Allowed Values field.

**Allowed Values** : Choose the permitted values for the selected metatag.

### Default Admin menu items:

The Admin menu includes three default items:
- Manage Users
- Company Settings
- Manage Divisions

These items cannot be removed from the Admin menu, but their titles can be changed.

![Configure menu items](/img/helpscout/authored/authored-mv518x51.png)

![Configure menu items](/img/helpscout/authored/authored-mv5190d5.png)

The available values for **Privilege**, **Menu State**, and **Display Icon** depend on the menu configuration and existing privileges.

Add each menu item you want for the selected role. A menu item appears only when it is available under existing privileges and included in the custom menu.

### 6. Configure sub-menu items

Some menu items include sub-menu options. Use them to control which areas appear under the parent menu.

Supported sub-menu items include:

- **Coaching**: **View Coaching**, **My Reviews**, **Reports**, **Coaching Dashboard**
- **SmartPath**: **View All SmartPaths**, **View All Modules**, **SmartPath Dashboard**
- **Quiz**: **Question Bank**, **View All Quizzes**, **Reports**, **Quiz Dashboard**
- **Dashboard**: **Dashboard Designs**, **Widgets**

Other items, such as **Manage Users**, **Company Settings**, and **Billing**, do not have sub-menu options.

Select only the sub-menu items your users need. Each sub-menu item can be configured only once.

![Configure sub-menu items](/img/helpscout/authored/authored-mv51o6gl.png)

### 7. Add restricted links

Use the restricted links area to configure links for specific business units or meta-tag values.

Select **Add** to add a restricted link. Then configure fields such as **Business Unit**, **MetaTag**, **Allowed Values**, **Type**, **Upload**, and **Link**.

Review the organizational units and allowed values so each link reaches the right audience.

![Configure restricted links](/img/helpscout/authored/authored-mv51pmhz.png)

### 8. Review and create the menu

Review the full configuration before you save it.

Check the selected role, organizational restrictions, section names, menu item placement, sub-menu items, default Admin item titles, and restricted links. When everything looks right, select **Create**.

## Things to know

- Custom menus are optional. If you do not configure one, the default menu stays in place.
- Admin and Editor menus are separate. Configure each role independently when you need different items or restrictions.
- Existing privileges still apply. A menu item must already be available to the organization and included in the custom menu.
- Configure restrictions separately for users with both roles.
- **Manage Users**, **Company Settings**, and **Manage Divisions** stay in the Admin menu, but you can rename their titles.
- Duplicate menu items are not allowed. Sub-menu items must also be unique.
- Review sections and restricted links before you delete them with **Delete**.