---
id: role-play-inventory-search-and-tree-view
title: "Role Play Inventory search and Tree view"
description: "Use Role Play Inventory to search coaching items, filter results, and browse duplicated coachings in Tree view."
slug: role-play-inventory-search-and-tree-view
sidebar_position: 356
last_update:
  date: 2026-10-30
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [video-coaching]
draft: true
---
{/* release-draft: tag=v3.60.08 issue=9804 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9804 */}
{/* release-draft: tag=v3.60.08 issue=9815 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9815 */}
{/* release-draft: tag=v3.58.78 issue=9551 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9551 */}

> **At a glance** - Open Role Play Inventory from the left menu, search coaching items, and browse duplicated coachings in Tree view.

The Role Play Inventory helps you find coaching scenarios, skills, tags, competencies, and related coaching families. You can search the list, filter it by date, and switch between Tile, List, and Tree views to match how you want to review results.

## When to use this
Use Role Play Inventory when you need to:
- Find a specific coaching scenario or skill.
- Search by tag or competency to narrow a coaching set.
- Review coaching items by date.
- See duplicated coachings grouped with the items they came from.
- Compare near-identical coaching copies in a readable nested view.

## Steps

### 1. Open Role Play Inventory
Open **Role Play Inventory** from the left menu in the **Coaching** module.

### 2. Search coaching items
Use the search box to find coaching items by title, scenario, skill, tag, competency, or other searchable attributes. Use the **Search by** dropdown to scope your search to a specific field.

### 3. Filter the list
Use the tag, competency, and attribute filters to narrow the list. Use the **Dates** button next to the tag filter to filter by date, then choose a date type in the **Date** dropdown and set **From**, **To**, or both.

Leaving one side empty filters in that direction only. Using the same day in both fields filters to that single day. The line under the inputs states what you are filtering, and **Clear dates** removes the filter.

![The Dates filter opens a panel with date type, From, and To fields beside the Tags filter](/img/helpscout/authored/role-play-inventory-dates-filter.png)

### 4. Switch to Tree view
Select **Tree** beside **Tile** and **List** to group each coaching with everything copied from it. Tree view shows the same search and filter results, but it nests matches under the coaching they belong to.

### 5. Review the grouped results
Review the grouped results to see which coachings were copied from others and which coachings stand alone. A chosen column still orders items within each group.

### 6. Move through pages
Use paging to move through the list. The list shows 20 items per page, and search returns up to 20 matches so a searched page fills the same way an unsearched page does.

### 7. Download the report
Use **Download Report** in the header menu to export the filtered results you see on screen.

### 8. Find a parent coaching
Open **Create New Coaching** or edit an existing coaching, then type either the title or the coaching code into the **Parent Coaching** box. Matching coachings show the code beneath the title so you can tell similar entries apart.

## Tips
- Use specific keywords to narrow your search results effectively.
- Try different fields in the **Search by** dropdown to find the best matches for your needs.
- Use the same day in **From** and **To** when you want results for a single day.
- Leave **From** or **To** empty when you want results on or after, or on or before, a date.
- Use Tree view when you need to understand how duplicated coachings relate to one another.
- Use the grouped view when a flat list makes near-identical coaching copies hard to read.

## Things to know
:::note
The date filter applies to the Tile, List, and Tree views, and the downloaded report matches what you see on screen.
:::

:::note
A **To** date includes the full day, so items created later that day still appear in the results.
:::

:::note
The available date options depend on the list you are viewing, and the filter uses the same labels as the date columns.
:::

:::note
Newly-added items may take a short time to become searchable. If you encounter any issues or the Role Play Inventory option is not visible, contact SmartWinnr support for assistance.
:::

:::note
Paging in Tree view counts top-level coachings rather than rows, so the total differs from the other two views. A page of 20 families can contain far more than 20 coachings.
:::

:::note
A filter expands to include the families that contain matching items, so you do not see a parent without its children.
:::