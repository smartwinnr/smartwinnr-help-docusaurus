---
id: add-itube-videos-to-smartfeeds
title: "How to add iTube videos to SmartFeeds"
description: "Add iTube videos or links to a SmartFeed so viewers can watch or open them with their own access."
slug: add-itube-videos-to-smartfeeds
sidebar_position: 305
last_update:
  date: 2026-11-01
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [smartfeed, integration]
draft: true
---
{/* release-draft: tag=v3.60.11 issue=9890 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9890 rev=18169318fb89 */}
{/* release-update: issue=9890 summary="New article" */}

SmartFeed can show iTube content inside your feed when your organization uses the KPoint integration. You can add a specific video so it plays inline, or add an iTube page link so viewers open it with their own access.

Use this when you want to share hosted video content in a SmartFeed without sending people to a separate login flow.

## When to use this

Use iTube content in a SmartFeed when you want to:

- Embed a specific video directly in the feed.
- Share an iTube page link that opens with the viewer's own access.
- Keep video content inside the web portal experience.
- Add iTube content to an existing SmartFeed or a new one.

## Steps

### 1. Open the SmartFeed editor
Create or edit a SmartFeed, then open the editor toolbar.

### 2. Select the video option
Choose the video icon in the toolbar, then open the **iTube** tab.

![SmartFeed editor showing the iTube tab in the insert video dialog](/img/helpscout/authored/itube-tab-insert-video-dialog.png)

### 3. Add the iTube content
Paste a video link or a video ID that starts with `gcc-` to embed the video inline.

For other iTube pages, paste the page link and add link text. SmartFeed inserts it as a link that opens iTube with the viewer already signed in.

### 4. Save the SmartFeed
Save your SmartFeed when you finish adding the content.

## Things to know

:::note
The **iTube** tab appears only when your organization has the KPoint integration configured. If you do not see it, contact SmartWinnr support.
:::

:::note
Inline videos play in the web portal. iTube page links open with the viewer's own access applied.
:::

:::note
Tokens are created when someone plays or clicks the content. They are not stored in the SmartFeed.
:::