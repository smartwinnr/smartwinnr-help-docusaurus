---
id: show-the-real-rating-scale-and-org-logo-on-the-feedback-pdf
title: "Show the real rating scale and org logo on the feedback PDF"
description: "Downloaded AI coaching feedback PDFs now match the coaching rating scale and include your organization logo."
slug: show-the-real-rating-scale-and-org-logo-on-the-feedback-pdf
sidebar_position: 150
last_update:
  date: 2026-10-10
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
  tags: [video-coaching, troubleshooting]
draft: true
---
{/* release-draft: tag=v3.59.66 issue=9772 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9772 */}

Downloaded AI coaching feedback PDFs show Smart Skills and Evaluation Criteria scores out of the rating scale the coaching was graded on. The score colors follow the same scale, so a 4 out of 5 reads as a good score rather than a poor one.

The PDF header also shows your company logo in the top left when your logo file is an SVG. Existing PDFs you already downloaded are not affected.

## When to use this

Use this when you want to confirm that a downloaded feedback PDF matches the score scale shown in the app.

- You see a score in the PDF and want it to reflect the same scale as the coaching.
- You use a rating scale other than 10.
- Your company logo is an SVG and you want it to appear in the PDF header.
- You are checking older feedback and want to understand why it still shows the scale it was graded on.

## Things to know

:::note
Open a completed coaching from **Coaching**, go to the **Coaching Instance Analytics** screen, and tap **Download feedback**. The PDF header carries your company logo on the left, and the **Smart Skills** and **Evaluation Criteria** sections show each score as score out of your configured rating scale.
:::

:::note
The scale comes from the rating scale set on the coaching, falling back to the organization coaching setting, then to 10.
:::

:::note
Scores recorded before a rating scale change still display against the scale they were graded on, so historic feedback keeps reading correctly.
:::

:::note
Nothing needs to be enabled.
:::