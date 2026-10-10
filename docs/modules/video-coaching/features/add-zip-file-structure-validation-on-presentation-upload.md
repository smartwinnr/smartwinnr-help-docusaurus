---
id: add-zip-file-structure-validation-on-presentation-upload
title: "Add zip file structure validation on presentation upload"
description: "Validate presentation-mode coaching zip files as soon as you select them."
slug: add-zip-file-structure-validation-on-presentation-upload
sidebar_position: 20
last_update:
  date: 2026-10-10
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [video-coaching]
draft: true
---
{/* release-draft: tag=v3.59.67 issue=9770 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9770 */}

> **At a glance** - When you upload a zip file for presentation-mode coaching, SmartWinnr checks its structure right away. If the file is invalid, you see an error and the file is cleared before you save.

Use this validation when you create or edit a presentation-mode coaching and want to upload slides from a zip file. It helps you catch file structure problems before you save the coaching.

## When to use this

Use this when you upload a zip file for presentation-mode coaching and want to confirm it is ready to save.

- You want to check the file before saving the coaching.
- You need to know why a zip file was rejected.
- You want to re-upload a corrected zip file right away.
- You want to avoid saving a file that cannot be extracted into slides.

## Steps

### 1. Select the zip file
When you create or edit a presentation-mode coaching, choose the zip file you want to upload.

### 2. Review the validation result
SmartWinnr checks the zip file as soon as you select it, before you save. If the file structure is invalid, you see a specific error message immediately, and the file is cleared so it cannot be saved.

If the zip file is missing the top-level folder, contains subfolders, includes non-image files, or is empty, the upload is rejected right away.

### 3. Upload a valid zip file
Re-select a zip file that contains exactly one top-level folder with image files directly inside it. The supported image formats are JPG, JPEG, PNG, GIF, BMP, and WEBP.

If the zip file is valid, you can continue and save the coaching.

## Things to know

:::note
The zip file must contain one top-level folder only. That folder must include image files directly inside it.
:::

:::warning
If the zip file is invalid, SmartWinnr clears it right away. You need to choose a corrected file before saving.
:::