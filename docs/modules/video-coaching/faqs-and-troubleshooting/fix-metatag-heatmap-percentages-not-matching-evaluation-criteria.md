---
id: fix-metatag-heatmap-percentages-not-matching-evaluation-criteria
title: "Fix MetaTag heatmap percentages not matching Evaluation Criteria"
description: "See why the MetaTag heatmap and Evaluation Criteria table now show matching percentages for the same objective."
slug: fix-metatag-heatmap-percentages-not-matching-evaluation-criteria
sidebar_position: 340
last_update:
  date: 2026-10-30
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
tags: [video-coaching, troubleshooting]
draft: true
---
{/* release-draft: tag=v3.60.08 issue=9732 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9732 */}

The **AI Evaluation - Performance by MetaTag Type** heatmap on the Coaching Editor Analytics page now matches the **AI Based Evaluation - Evaluation Criteria** table for the same objective. Each cell uses the same learners and the same calculation as the table, so the columns add up to the **Organization Average** score shown above.

The heatmap shows one column for every value of the selected metatag that the scenario's learners have. It also includes an **N/A** column at the end for learners with no value for that metatag. Column labels use the metatag value names configured for your organization.

## When to use this

Use this when the heatmap and the evaluation table show different percentages for the same objective.

- You want to compare one objective against all values of a metatag type.
- You want learners with no metatag value included in the total.
- You want the heatmap columns to add up to the **Organization Average** score.
- You want column labels to reflect the metatag value names configured for your organization.

## Things to know

:::note
Learners whose session was reassigned and not yet resubmitted do not appear in either section until they submit again.
:::

:::note
The **Coach Evaluation** competency heatmap is separate and does not change here.
:::