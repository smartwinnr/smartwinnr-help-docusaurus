---
id: quiz-types
title: "Understanding different quiz types available in SmartWinnr"
description: "Learn about the different types of quizzes in SmartWinnr, including manual and automatic quizzes, and how to create them effectively."
slug: quiz-types
sidebar_position: 48
last_update:
  date: 2026-07-08
  author: Anagha Isal
customProps:
  roles:
    - editor
    - admin
  privilege: quiz
tags: ["quiz", "smartpath", "gamification"]
draft: false
---

> **At a glance** - This article explains the different types of quizzes available in SmartWinnr, including manual and automatic quizzes, and how to create them.

SmartWinnr offers various quiz types to enhance learning and assessment. Understanding these quiz types helps you choose the right format for your needs.

## When to use this
Use the different quiz types in SmartWinnr to:

- Assess knowledge before training sessions with a one-time quiz.
- Allow learners to retake quizzes until they achieve a minimum score.
- Implement quizzes with timers for time-sensitive assessments.
- Distribute targeted questions based on participant performance over time.

## Before you start
Familiarize yourself with the quiz creation process in SmartWinnr.

## Steps

### 1. Understand Manual Quiz
**Manual quizzes** are created and sent by the quiz editor. The editor manually selects the questions included in the quiz, and while the quiz can be scheduled for future delivery, it requires manual initiation.

### 2. Explore Automatic Quiz
In an **automatic quiz**, SmartWinnr delivers targeted questions to each participant based on their previous response history. This approach is useful when you have a large question bank and want to distribute a limited number of questions per quiz over time while eventually covering the entire question bank or a large pool of questions.

The editor can configure various options for an automatic quiz, including:

- **Quiz Delivery Frequency:** Defines the number of days between successive quiz deliveries. For example, if set to **1**, SmartWinnr will automatically send **one quiz per day** to all assigned participants.

- **Number of Questions per Quiz:** Specifies the number of questions to be included in each quiz.

- **Correct Response Threshold for Question Repetition:** Determines how many times a participant must answer a question correctly before it is removed from future quizzes. For example, if set to **1**, the question will no longer be repeated once the participant answers it correctly.

### 3. Choose the Right Quiz Type
Different types of quizzes can be created within SmartWinnr. Use this simple list to decide which quiz type suits your needs:

| Number | Requirement | SmartWinnr Quiz Type | How to Create? |
|--------|-------------|----------------------|----------------|
| 1      | Pre-training assessment that will happen one time | Manual Quiz | **Questions and Quizzes > View All Quizzes > Add New Quiz > Quiz Type = ‘Manual’** |
| 2      | A quiz (with the same questions) that can be taken multiple times before a minimum score is achieved. All quiz takers get the same questions in the same order | Manual Quiz with Multiple Attempts | **Questions and Quizzes > View All Quizzes > Add New Quiz > Quiz Type = ‘Manual’ and check the ‘Allow multiple attempts' checkbox.** |
| 3      | A quiz with a timer | Manual Quiz with Timer | **Questions and Quizzes > View All Quizzes > Add New Quiz > Quiz Type = ‘Manual’ and check the ‘Enable timer?’ checkbox.** |
| 4      | A quiz with random questions from a set of categories/tags | Manual Quiz with questions shared randomly to learners from selected questions/tags | **Questions and Quizzes > View All Quizzes > Add New Quiz > Quiz Type = ‘Manual’ and check the ‘Randomly Assign Questions’ checkbox > Fill the number of questions per quiz > Check the 'Randomize Questions by Tag' checkbox** |
| 5      | A quiz with a pass/fail condition, which can be used for certification assessments | Manual Quiz with 'Pass/Fail' condition | **Questions and Quizzes > View All Quizzes > Add New Quiz > Quiz Type = ‘Manual’ and check the ‘Enable Pass/Fail’ checkbox > Fill the pass percentage threshold** |