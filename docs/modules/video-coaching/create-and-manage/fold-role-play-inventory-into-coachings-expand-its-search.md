---
id: fold-role-play-inventory-into-coachings-expand-its-search
title: "Fold Role Play Inventory into coachings, expand its search"
description: "This article shows you how to access and utilize the expanded Role Play Inventory within the Coaching module."
slug: fold-role-play-inventory-into-coachings-expand-its-search
sidebar_position: 306
last_update:
  date: 2026-09-04
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [video-coaching]
draft: true
---
{/* release-draft: tag=v3.58.78 issue=9551 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9551 */}

> **At a glance** - Access the Role Play Inventory within the Coaching module and utilize enhanced search capabilities to find specific coaching scenarios.

The Role Play Inventory is now integrated into the Coaching module, allowing for a more streamlined experience. You can search for specific coaching scenarios using detailed fields rather than a single text blob. This makes it easier to find relevant coaching materials based on various criteria.

## When to use this
Use the Role Play Inventory when you need to:
- Find specific coaching scenarios for training.
- Search by detailed criteria such as skill or tag.
- Reindex coaching materials to ensure all content is searchable.

## Before you start
Your environment needs to run `scripts/reindex_role_play_inventory.js --execute` once before using the new search fields and the **is_indexed** flag.

## Steps

### 1. Access the Role Play Inventory
Open the **Coaching** module from the topbar menu or access it through the hamburger menu on the list page.

### 2. Use the Search Functionality
Utilize the **Search by** dropdown next to the search box to narrow your search to specific fields like Title, Scenario, Skill, Tag, or Competency.

### 3. Reindex Coaching Materials
If you have the appropriate permissions, select the **Reindex all** action. The checkbox is checked by default to resync only coachings that are missing from the index.

## Tips
- Use specific search terms to improve the relevance of your results.
- Regularly check the index status to ensure all coaching materials are searchable.
- Contact SmartWinnr support if you cannot see the Role Play Inventory option.

## Things to know
:::warning
Ensure you run the reindex script before using the new search features, as the **is_indexed** flag will not populate until then.
:::

:::caution
The **Reindex all** action is restricted to org admins only. Ensure you have the necessary permissions before attempting this action.
:::