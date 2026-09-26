---
id: add-verbal-assessment-image-tasks-and-html-sharable-resources
title: "Add verbal assessment image tasks and HTML sharable resources"
description: "Add spoken assessment questions with image tasks and share PDF, video, or HTML resources in a Conversational coaching session."
slug: add-verbal-assessment-image-tasks-and-html-sharable-resources
sidebar_position: 326
last_update:
  date: 2026-09-26
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [video-coaching]
draft: true
---
{/* release-draft: tag=v3.59.39 issue=9702 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9702 */}

> **At a glance** - Use verbal knowledge assessments to ask spoken questions, score expected answers, and include image tasks. You can also add PDF, video, or HTML resources for learners to view during the session.

Use this in a Conversational coaching session when you want learners to answer out loud. It also helps when you need to show an image or share interactive HTML content during the session.

## When to use this

Use verbal assessment image tasks when you want learners to identify something from a picture and answer by speaking.

Use sharable resources when you want to support the session with reference material.

- You want to ask short spoken questions and score the response.
- You want an image to appear while the learner names it aloud.
- You want to share a PDF or video during the session.
- You want to share HTML content in the same session view.

## Before you start

- The coaching must be a Conversational coaching with **AI Coach** enabled.
- The sharable-resources coaching setting must be enabled for your organization.

## Steps

### 1. Open the coaching editor
Open the coaching editor for your Conversational coaching.

### 2. Add verbal assessment questions
Go to the **Verbal knowledge assessment** section and add your questions. For each question, enter the spoken text and the expected answer.

### 3. Turn on an image task
For a question that needs an image, turn on **Image task** and upload the image. During the session, the AI voice asks the question and shows the image in the presentation pane.

![The Verbal knowledge assessment section with an Image task toggle and uploaded image](/img/helpscout/authored/verbal-assessment-image-task.png)

### 4. Add sharable resources
In **Sharable resources**, click **Add resource** and choose a PDF, a video, or an HTML `.zip` package. The system detects the resource type automatically.

![The Sharable resources area with Add resource and file type options](/img/helpscout/authored/sharable-resources-html-zip.png)

### 5. Review the session view
During the session, the image appears inline in the presentation pane for the matching question. It clears when the next question is asked. HTML resources also render inline in the session view.

## Things to know

:::note
If the feature is not visible, contact SmartWinnr support.
:::

:::warning
HTML resources must be uploaded as a package so they can render correctly in the session.
:::