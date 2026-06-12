---
id: 5fd48eb723119734ee37eda5
title: Quiz types
description: >-
  Manual quizzes are created and sent by the quiz editor. While the quiz can be
  scheduled for delivery on a future date, the editor is required to manually…
slug: quiz-types
sidebar_position: 48
last_update:
  date: 2026-01-19T00:00:00.000Z
  author: HelpScout Migration
source:
  helpscout_id: 5fd48eb723119734ee37eda5
  helpscout_url: 'https://help.smartwinnr.com/article/48-quiz-types'
customProps:
  roles:
    - editor
    - admin
  privilege: quiz
tags:
  - quiz
---
#### **Manual Quiz**

**Manual quizzes** are created and sent by the quiz editor. While the quiz can be scheduled for delivery on a future date, the editor is required to manually select the questions included in the quiz.

#### **Automatic Quiz**

In an **automatic quiz**, the SmartWinnr system automatically delivers targeted questions to each participant based on their previous response history. This approach is especially useful when you have a large question bank and want to distribute a limited number of questions per quiz over time, while eventually covering the entire question bank.

The editor can configure various options for an automatic quiz, including:

* **Quiz Delivery Frequency:**

    Defines the number of days between successive quiz deliveries. For example, if this value is set to **1**, SmartWinnr will automatically send **one quiz per day** to all assigned participants.

* **Number of Questions per Quiz:**

    Specifies the number of questions to be included in each quiz.

* **Correct Response Threshold for Question Repetition:**

    Determines how many times a participant must answer a question correctly before it is removed from future quizzes. For example, if this value is set to **1**, the question will no longer be repeated once the participant answers it correctly.

There are different types of quizzes that can be created within SmartWinnr. You can use this simple list to decide on which quiz type will suit your case.

**Number**

**Requirement**

**SmartWinnr Quiz Type**

**How to Create?**

**1**

Pre-training assessment that will happen one-time

Manual Quiz

**Questions and Quizzes > View All Quizzes > Add New Quiz > Quiz Type = ‘Manual’**

**2**

A quiz (with the same questions) that can be taken multiple times before a minimum score is achieved. All quiz takers get the same questions in the same order

Manual Quiz with Multiple Attempts

**Questions and Quizzes > View All Quizzes > Add New Quiz -> Quiz Type = ‘Manual’ and check the ‘Allow multiple attempts' checkbox.**

**3**

A quiz with the timer

Manual Quiz with Timer

**Questions and Quizzes > View All Quizzes > Add New Quiz -> Quiz Type = ‘Manual’ and check the ‘Enable timer?’ checkbox.**
