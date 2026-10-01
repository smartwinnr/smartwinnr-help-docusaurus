---
id: how-to-set-auto-archival-rules-for-a-content-item
title: "How to set auto archival rules for a content item"
description: "Set when a published content item archives automatically, add a reminder, and pause archival while it is still in use."
slug: how-to-set-auto-archival-rules-for-a-content-item
sidebar_position: 50
last_update:
  date: 2026-10-01
  author: Manaswini V
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: ["content-center", "archival-rules"]
draft: true
---

> **At a glance** - Set an automatic archival rule for a published content item, add a reminder, and keep archival on hold while the item is still in use.

Use auto archival to control when a published content item moves to Archived. You can archive it on a specific date, after a set period, or leave it to be archived manually. You can also add a warning before archival and pause archival while the item is referenced elsewhere.

## When to use this

Use this when you want to manage the lifecycle of a published content item.

- Set a planned archival date for time-sensitive content.
- Archive content after a fixed period from publication.
- Give reviewers time to act before archival.
- Keep content from archiving while other modules still use it.
- Update an existing archival rule.

## Steps

### 1. Open the content item
Go to **Content Management → content center → All Content Center** in the Editor Portal. Open the content item you want to configure.
![kindly open the content item](/img/helpscout/authored/how-to-set-auto-archival-rules-for-a-content-item-mupiel2e.png)
### 2. Open lifecycle settings
Click the hamburger menu in the top-right corner, then select **Manage Lifecycle**.
![click on manage lifecycle](/img/helpscout/authored/how-to-set-auto-archival-rules-for-a-content-item-mupifdxz.png)
### 3. Edit archive rules
Go to **Archive Rules** and click **Edit**. This opens the **Set Archive Rules** dialog.
![click on edit](/img/helpscout/authored/how-to-set-auto-archival-rules-for-a-content-item-mupifyp6.png)
### 4. Choose an archival rule
Select how you want the content to archive automatically.

### Never archive automatically
Select **Never archive automatically** if you want the content to remain published until someone manually archives it.
Use this option when the content does not have a planned automatic archival date.
![choose Never archive automatically](/img/helpscout/authored/how-to-set-auto-archival-rules-for-a-content-item-mupih792.png)

### A set time after it is published
Select **A set time after it is published** if you want the content to be automatically archived after a specific period from the date it is published.
For example:
* **After 30 days**
* **After 90 days**
* **After 1 year**
The system calculates the **auto-archival date** based on the selected period.
If a **new version is published**, the archival period starts again from the date the new version is published.


### On a specific date
Select **On a specific date** if you want the content to be automatically archived on a particular date.
Choose the required date using the **date selector or calendar**.
For example:
**Archive on:** 8 October 2026
The system schedules the content for automatic archival on the selected date, regardless of when the content was published.
![choose On a specific date](/img/helpscout/authored/how-to-set-auto-archival-rules-for-a-content-item-mupiiyx2.png)

### 5. Set a reminder
Under **Warn me before archiving**, choose when you want the warning to go out.

You can choose **30 days before**, **14 days before**, **7 days before**, **1 day before**, or **No warning**.

### 6. Hold archival in use
Enable **Hold off while it is still in use** if the content should not archive while another module references it.

This helps keep content available while it is still active in places like **SmartFeed** or **SmartPath**.

### 7. Save the rule
Review your selections, then click **Save rules**.
![click on save rules](/img/helpscout/authored/how-to-set-auto-archival-rules-for-a-content-item-mupik3bk.png)

### 8. Update the rule later
Open **Archive Rules** again whenever you need to change the period, date, reminder, or hold setting.

You can also switch back to **Never archive automatically** if you no longer want automatic archival.
### Archive Rules Saved

Once you click **Save rules**, a confirmation pop-up appears stating that the **archive rule has been saved** and showing the scheduled archival date.
![confirmation pop-up](/img/helpscout/authored/how-to-set-auto-archival-rules-for-a-content-item-mupir9nv.png)

## Things to know

:::note
If you choose **After a set period**, the archival date is calculated from the publication date.
:::

:::note
If a new version is published, the archival period starts again from that version’s publication date.
:::

:::note
Archived content is no longer available as an active published item.
:::

:::note
You can republish an archived content item through the lifecycle process.
:::