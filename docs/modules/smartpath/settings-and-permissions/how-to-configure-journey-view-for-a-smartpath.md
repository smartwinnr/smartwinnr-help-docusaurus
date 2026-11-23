---
id: how-to-configure-journey-view-for-a-smartpath
title: "How to Configure Journey View for a SmartPath"
description: "Configure Journey View to control visibility, layout, progress metrics, and What's Next guidance for a SmartPath."
slug: how-to-configure-journey-view-for-a-smartpath
sidebar_position: 273
last_update:
  date: 2026-11-20
  author: Manaswini V
customProps:
  owner: jazz.k@smartwinnr.com
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: ["smartpath", "configure", "journey-view", "settings", "editor"]
draft: false
---

> **At a glance** Journey View shows a learner's progress through a SmartPath as an animated map. You can control who sees it, how it looks, and what guidance appears on the learner's cards.

Journey View lets you shape how learners experience a SmartPath. You can turn the view on, choose the first tab learners see, pick the animation behavior, and customize the map layout and theme. You can also highlight key modules, add readiness metrics, and set rules for the learner's **What's Next** card.

## When to use this

Use these settings when you want to control the learner experience for a specific SmartPath.

- Show Journey View only for selected SmartPaths.
- Choose whether learners land on **Details** or **My Journey** first.
- Highlight important modules as milestones.
- Surface progress metrics and next-step guidance on learner cards.

## Before you start

Journey View must be enabled for your organization before you can configure it for a SmartPath.

## Steps

### 1. Open Journey View settings
Sign in to the Editor Portal. Then go to **Learning and Knowledge** > **SmartPath** > **View All SmartPaths**.

Find the SmartPath you want to configure, then click **Journey View**.

![Navigate to Journey view](/img/helpscout/authored/authored-mwniny6g.png)

The Journey View settings page opens. It shows configuration sections on the left, settings in the middle, and a live preview on the right.

### 2. Set visibility options
Use **Visibility** to control how learners access Journey View.

Turn on **Show the journey view to learners** to display the **My Journey** tab for the SmartPath. When you turn it off, learners see only the module list.
![Turn on the toggle to display the My Journey tab to learners](/img/helpscout/authored/authored-mwnjncv7.png)
Choose **Open on** to set the first tab learners see. Select **Details** or **My Journey**.

Choose **Play the animation** to control how the trail draws:
- **Every time** draws the trail from the first module each time a learner opens **My Journey**.
- **Only new progress** animates only the progress since the learner last viewed the journey.

![open the visibility section](/img/helpscout/authored/authored-mwnjn8cf.png)

### 3. Choose a theme and layout
Use **Theme** to control the look of the journey map.

Choose a layout:
- **Path** places modules along a winding trail. It works with every theme and suits SmartPaths of any length.
- **Picture map** places modules on a single image with landmarks. It works best for shorter SmartPaths with a strong visual theme.

Choose a theme from your organization's theme library. The preview updates when you select a theme.

Use **Create a theme** to open the theme library and create a new theme. Use **Manage themes** to open the theme library and manage existing themes.

If you click **Create a theme** or **Manage themes** with unsaved changes, a confirmation pop-up appears. Choose **Keep editing** to keep your changes, or **Discard changes** to return to the last saved settings.

![A confirmation pop-up warning that unsaved Journey settings will be lost if discarded](/img/helpscout/authored/authored-mwol0hg2.png)

Picture map is available only for themes with pictures uploaded for phone, tablet, and laptop screens.

### 4. Place pins on a picture map
Use this section only when you select the **Picture map** layout.

Place each module on the picture for phone, tablet, and laptop screens. You can drag a module onto the picture, or select it and click the picture to place its pin.

Move pins by dragging them or by using the arrow keys after selecting a pin. Use **Place the rest automatically** to spread unplaced modules across the picture, then move them to the right landmarks.

Check the shaded areas before placing pins. The progress card and **What's next** card cover parts of the picture, so avoid those areas.

You can save a Picture map only after every module has a pin on all three screen sizes. The page shows which screen size still needs pins.

![pins section](/img/helpscout/authored/authored-mwon07ss.png)

### 5. Highlight key modules
Use **Highlighted modules** to mark important milestones.

Highlighted modules appear as larger stops with a star, and their names always show. Use this for modules such as a certification or launch-day milestone.

Select **Clear all** to remove every highlight.

![Highlight modules section](/img/helpscout/authored/authored-mwon3mw9.png)

Highlighting changes only how modules appear on the map. It does not change module order, scoring, or completion rules.

### 6. Configure readiness metrics
Use readiness metrics to show progress details below the overall progress percentage on the learner's progress card.

You can add up to four metrics and drag them to set their display order. If you do not add any metrics, the card shows the learner's average quiz score.

For each metric, set:
- **Name** and optional translations with **Add Translation**.
![Add the metric name in other languages](/img/helpscout/authored/authored-mwonn4o4.png)

- **Measures** to define what the metric tracks.
- **Counts** to choose whether it applies to the whole SmartPath, selected modules, or selected activities.
![Counts](/img/helpscout/authored/authored-mwonl4gb.png)

- **Color** for the metric display.
- **Icon** for the metric display.

The available measures are:
- **Activities completed (%)** shows the percentage of completed activities out of the selected activities.
- **Average quiz score** shows the learner's average score across completed quizzes.
- **Activities completed (count)** shows the number of completed activities out of the selected activities.
- **Modules completed** shows the number of completed modules out of the selected modules.
- **Last activity** shows how long ago the learner last completed an activity in the selected part of the SmartPath.
- **Due date** shows time remaining until the due date or how long it is overdue.
![Measures](/img/helpscout/authored/authored-mwonkxmz.png)

If a SmartPath has no quizzes, **Average quiz score** shows *Not started* for all learners. Modules without quizzes cannot be selected for this metric.
![Readiness metrics](/img/helpscout/authored/authored-mwonmjmn.png)

![readiness metrics section](/img/helpscout/authored/authored-mwonachi.png)

### 7. Set What's Next rules
Use **What's Next** rules to show a short message on the learner's **What's Next** card.

The system checks enabled rules in order and shows the first one that applies. Drag the rules to set their priority, and place the most important rule at the top.

The **What's Next** card appears on both the **My Journey** and **Details** tabs.

Configure these rules as needed:
- **Due date is close**
- **Past the due date**
- **Almost done**
- **Certificate**
- **Milestone ahead**
- **Halfway through a module**
- **Welcome back**
- **First step**

Enable the rules you want and set thresholds where needed. If all rules are disabled, the **What's Next** card shows only the next activity.

![Configure What's Next rules](/img/helpscout/authored/authored-mwoo2yym.png)
Click on save
## Things to know

:::note
Journey View changes only how the SmartPath is displayed. It does not change modules, activities, due dates, scores, or certificates.
:::

:::note
Learners see Journey View only when **Show the journey view to learners** is on and the settings are saved.
:::

:::note
SmartPaths offered on a public Academy site do not use Journey View.
:::

:::note
If you change a shared theme, the update appears in every SmartPath that uses that theme.
:::