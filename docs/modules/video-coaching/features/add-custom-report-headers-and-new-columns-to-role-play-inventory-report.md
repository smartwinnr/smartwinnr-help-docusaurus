---
id: add-custom-report-headers-and-new-columns-to-role-play-inventory-report
title: "Add custom report headers and new columns to Role Play Inventory report"
description: "Customize the Role Play Inventory report columns and review additional coaching details in the exported report."
slug: add-custom-report-headers-and-new-columns-to-role-play-inventory-report
sidebar_position: 30
last_update:
  date: 2026-10-10
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [video-coaching]
draft: true
---
{/* release-draft: tag=v3.59.69 issue=9699 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9699 */}

The Role Play Inventory report includes more coaching details and supports custom report headers. You can reorder, rename, show, or hide columns to match the report layout you need.

Download the report from the Role Play Inventory screen when you want a fuller view of each role play. Use Super Admin Settings to adjust the report header layout.

## When to use this

Use this when you need a more detailed inventory export or a report layout that matches your team’s workflow.

- Review role play details alongside the standard inventory data.
- Show only the columns your team uses.
- Rename columns to match your internal reporting language.
- Reorder columns to put the most important information first.

## Steps

### 1. Download the report

Open the Role Play Inventory screen and download the Role Play Inventory report.

The export includes the new columns after **AI Avatar**. It also keeps Dynamic Global Attribute columns at the end of the report.

### 2. Open report header settings

Go to **Super Admin Settings** and select **Coaching** from the module dropdown. Then choose **Role Play Inventory Report**.

This opens the custom header configuration for the report.

### 3. Customize the columns

Reorder, rename, show, or hide the columns you want in the report.

The report supports these new columns:

- **Audio Video Mode**
- **Enable Screen Share**
- **Enable Difficulty Levels**
- **Sharable Resources**
- **Skills**
- **Competencies for Review**

**Audio Video Mode** shows **Audio**, **Video**, or **Both**.  
**Enable Screen Share**, **Enable Difficulty Levels**, and **Sharable Resources** show **Yes** or **No**.  
**Skills** shows a comma-separated list of skills from coaching objectives and smart skills.  
**Competencies for Review** shows the review rubric competencies from the org competency catalog.

### 4. Save your layout

Save the header configuration when you finish.

Your selected layout applies to the Role Play Inventory report export.

## Things to know

:::note
Dynamic Global Attribute columns stay at the end of the report, even when you customize headers.
:::

:::note
If you do not see the custom header option, contact SmartWinnr support.
:::