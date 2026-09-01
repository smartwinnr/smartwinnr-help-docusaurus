---
id: translate-a-coaching-using-templates
title: "Translate a Coaching Using Templates"
description: "Share a coaching as an Excel template, have it translated, and import the completed file back into SmartWinnr."
slug: translate-a-coaching-using-templates
sidebar_position: 999
last_update:
  date: 2026-09-01
  author: "Charan"
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
  privilege: aiCoaching
tags: ["ai-coaching", "video-coaching"]
draft: true
---

> **At a glance** - Share a coaching as an Excel template and send it out for translation. Import the completed file back when it returns. You can also ask SmartWinnr to fill in a first draft for review.

## Overview

Coaching content often needs to reach teams that work in different languages. Retyping every title, objective and keyword in each language takes time. Instead, share the coaching as an Excel template, have it filled in, and bring it back into SmartWinnr.

| Detail | Description |
|--------|-------------|
| **Where to find it** | **Coaching View** > **⋮ Menu** > **Share as Template**, **Import Completed Template**, **Template Requests** |
| **Who can use it** | Editors, admins and org admins. Trainers do not see these options. |
| **Applies to** | Any coaching. The first draft option needs AI translation switched on. |

:::note
**Share as Template** and **Import Completed Template** are available to every organization. **Automatically fill in a first draft** and **Template Requests** appear only when AI translation is switched on for your organization. If you need them, please contact your SmartWinnr administrator.
:::

## When to Use This

- You want a partner or regional team to translate a coaching without giving them access to author it.
- You are launching the same coaching in several markets and want one file covering all the languages.
- You want a first draft in each language for a reviewer to correct, rather than a blank page.

* * *

## How to Share a Coaching as a Template

1. Open the coaching and click the **⋮** menu at the top right.
2. Select **Share as Template**.
3. Under **Content is written in**, choose the language the coaching is written in today.
4. Under **Languages you need back**, select every language you want filled in. Use **Select all** or **Clear** to change the selection quickly.
5. Select **Automatically fill in a first draft** if you want SmartWinnr to pre-fill the language columns for review. Leave it clear if the language columns should arrive empty for your translator to complete. This option appears only when AI translation is switched on for your organization.
6. Click **DOWNLOAD**.

<!-- IMAGE 1: The Share as Template window, with the source language chosen, two or three target languages ticked, and "Automatically fill in a first draft" visible. Alt text: Share as Template window with languages selected -->

If you asked for a first draft, the file is prepared in the background. Your download starts on its own when it is ready, and you can keep working in the meantime.

> **Tip**: Nothing is saved to the coaching when you download a template. The coaching changes only when you import the completed file back.

### What the Template Contains

| Sheet | What it is for |
|-------|----------------|
| **Start here** | A short guide to the file: what to fill in, what to leave alone, and what the cell colors mean. |
| **Content** | The text learners read, one row per field, with a column for each language you asked for. |
| **AI Setup** | The instructions the AI customer follows. Needed only if you plan to create a separate coaching for each language. |
| **Glossary** | Words that should stay the same in every language, such as product and brand names. This sheet appears only if your organization keeps a glossary. |

Only the language columns can be edited. The **Field** column and the source language column are locked so that the file can be read back correctly.

Cream cells are empty and waiting for text. Blue cells hold a machine-written draft that needs checking, and some carry a short note explaining what to look at. Plain cells were written by a person.

<!-- IMAGE 2: The Start here sheet of the downloaded workbook, showing the guidance rows. Alt text: Start here sheet in the coaching template -->

<!-- IMAGE 3: The Content sheet, showing the Field column, the source language column and two language columns, with a cream cell and a blue drafted cell both in view. Alt text: Content sheet with empty and drafted language cells -->

* * *

## How to Import a Completed Template

1. Open the same coaching and click the **⋮** menu.
2. Select **Import Completed Template**.
3. Choose the completed file and click **Review changes**.
4. Choose what the import should do:
   - **Add these languages to this coaching** keeps one coaching and adds the languages to it.
   - **Create one coaching per language** creates a separate coaching for each language, which you can place in different divisions.
   - **Create a new coaching** creates a single new coaching from the file.
5. Review the changes, then click **Apply changes**.

<!-- IMAGE 4: The import window at the upload step, and a second shot of the three outcome choices. Alt text: Import Completed Template window showing the import options -->

### How to Read the Review Screen

The review screen shows what the import will do before anything is saved.

- The counts at the top show how many items will be added, updated, left unchanged, or cannot be applied.
- The language table lists each language separately. Click a language to see its own changes below.
- The **Field** column names each item. **Currently** shows what the coaching holds today, and **Will become** shows what the import will write.
- Rows shown in grey are not being written. They read either **No change**, when the coaching already holds that text, or **Not applied**, with a short reason.

<!-- IMAGE 5: The review screen, with the counts, the per language table with one language selected, and the field list below showing at least one greyed No change row. Alt text: Review changes screen with a language selected -->

Some fields cannot be translated onto the same coaching. Competencies are managed in your organization's central library and are translated there. Fields that hold a single value, such as objections, can carry only one language. Choose **Create a new coaching** if you need those in another language.

> **Note**: If the coaching is already published, the review screen tells you so. Applying the changes updates content that learners can already see.

* * *

## How to Track a Template You Asked For

When you ask SmartWinnr to fill in a first draft, the file is prepared in the background. If you close the page before it is ready, you can pick it up later.

1. Open the coaching and click the **⋮** menu.
2. Select **Template Requests**.
3. Find your request in the list to see its progress, and download the file once it is ready.

<!-- IMAGE 6: The Template Requests window listing one completed request and one still in progress. Alt text: Template Requests list showing request status -->

* * *

## Things to Know

:::caution
Please do not delete or reorder rows, add columns, or unhide the first column in the template. Each row is tagged so that your changes can be read back into SmartWinnr.
:::

- The template carries text only. Settings, scoring weights, videos, images and documents are managed in the SmartWinnr portal.
- Formatting is not carried across. Bold text, links and bullets become plain text.
- A machine draft is a starting point for review, not a final translation. Blue cells are the ones to check first.
- Terms you add to the Glossary sheet are sent back for review. They do not change your organization's glossary on their own.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| The first draft option is not in the window | AI translation is not switched on for your organization. You can still download the template and have it filled in by hand. |
| The file will not upload | Make sure you are uploading the same file that was downloaded from this coaching, with no rows or columns removed. |
| A field shows **Not applied** in the review | The field cannot hold a second language on the same coaching. Import as a new coaching to translate it. |
| A field shows **No change** | The coaching already holds the same text in that language, so nothing needs to be written. |
| Your download did not start | Open **Template Requests** from the coaching menu and download the file from there. |

* * *

<!--
AUTHORING NOTE - remove this block before publishing.

Six screenshots are marked in this article with IMAGE 1 to IMAGE 6 comments.
Add each one through the authoring tool at the marked spot, which uploads it to
/img/helpscout/authored/ and replaces the comment with a normal image line:

    ![Alt text](/img/helpscout/authored/authored-xxxxxxxx.png)

Use the alt text suggested in each comment. Set `draft: false` in the
frontmatter once the screenshots are in and the build has been verified.
-->
