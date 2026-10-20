---
id: how-to-configure-admin-and-editor-side-menus
title: "How to Configure Admin and Editor Side Menus"
description: "Customize Admin and Editor side menus with sections, access restrictions, sub-menu items, and restricted links."
slug: how-to-configure-admin-and-editor-side-menus
sidebar_position: 206
last_update:
  date: 2026-10-15
  author: Manaswini V
customProps:
  owner: jazz.k@smartwinnr.com
  roles: [admin, orgadmin, lamadmin, superadmin]
tags: ["admin", "editor", "configure-menus"]
draft: false
---

> **At a glance** - Use menu configuration to customize the side menu for Admin and Editor users. You can group items into sections, apply division restrictions, choose supported sub-menu items, and add restricted links.

Use menu configuration when you want different side menus for Admin and Editor roles. If you do not create a custom menu for a role, SmartWinnr keeps that role’s default menu.

## When to use this

Use this when you need to:

- Customize the side menu for Admin or Editor users.
- Control menu access by division and sub-division.
- Group menu items into sections.
- Choose supported sub-menu items for specific modules.
- Rename default Admin menu items.
- Add restricted links for specific organizational units or meta tags.

## Steps

### 1. Open menu configuration

Log in to the SmartWinnr Portal, then go to **Company Settings > Menu Configuration**. Open the option to create a menu.

![Menu configuration](/img/helpscout/authored/authored-mv4wta7c.png)

### 2. Enter the menu details
Click Add Menu to add a menu item.
![Add menu](/img/helpscout/authored/authored-mv4wx0jh.png)
Enter the details that define the custom menu. Choose **Admin** or **Editor** in **Select Role** so the menu applies to the right users.

Add a **Menu Title** and **Description** if needed. Use **Manage Translation** to configure the menu title and other supported text in the required languages.
![ Enter the menu details](/img/helpscout/authored/how-to-configure-admin-and-editor-side-menus-mv92gs2z.png)
### 3. Set organizational restrictions

Add division and sub-division restrictions when the menu should apply only to specific organizational units.

For both Admin and Editor menus, click Click here to add divisional and sub-divisional access to configure the required access restrictions.

If a user has both roles, configure each menu separately. Each role follows its own restrictions and menu setup.
![divisional and sub-divisional access](/img/helpscout/authored/how-to-configure-admin-and-editor-side-menus-mv7w4q8m.png)


### 4. Add sections

Use sections to group related menu items and make the side menu easier to scan.

Select **Add Section**, enter the **Section Name**, and add a **Description** if needed. Repeat this for each section you want to create.

To remove a section, select its red **Delete** icon. Review the section and its menu items before you delete it.

### 5. Add menu items

1.	Click Add Section.
2.	Enter the Section Name.
3.	Add a Description, if required.
4.	Repeat these steps to create additional sections.

To remove a section, click the red Delete (trash) icon associated with it. Review the section and its associated menu items before deleting it.

![Configure menu items](/img/helpscout/authored/authored-mv50tykp.png)

You can set fields such as **Type**, **Privilege**, **Sections**, **Menu Item Title**, **Menu State**, **Display Icon**, **Description**, **Metatag**, and **Allowed Values**.

The Admin menu includes three default items: **Manage Users**, **Company Settings**, and **Manage Divisions**. You cannot remove them, but you can change their titles.
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