---
id: 5fd48e84c868cb6df3a8101f
title: Troubleshoot for common error code
description: >-
  Here is a list of possible errors that you might encounter while uploading a
  CSV file and how you can fix them:
slug: troubleshoot-for-common-error-code
sidebar_position: 999
last_update:
  date: 2026-08-31
  author: Anagha Isal
customProps:
  roles: [user, manager, editor, admin, orgadmin, lamadmin, superadmin]
  privilege: quiz
tags:
  - quiz
  - troubleshooting
draft: false
---

> **At a glance** - This article outlines common error codes encountered when uploading a CSV file and provides detailed solutions for each.

When uploading a CSV file, you may encounter various errors. Understanding these errors and how to resolve them can help ensure a smooth upload process. Below is a list of common errors, their causes, and solutions.

## Common Errors and Solutions

### 1. Question text can't be empty
**Why does this error occur?**  
This error occurs if you leave the question text column blank.

**How can you fix the error?**  
Enter the question text in the appropriate column to resolve this error.

### 2. Internals is not a correct category for this division
**Why does this error occur?**  
This error arises when the given categories do not exist in the selected division.

**How can you fix the error?**  
Change the categories to those that exist in the selected division or the default division (if there is only one division).

### 3. Categories column value can't be blank
**Why does this error occur?**  
This error occurs if you leave the categories column blank.

**How can you fix the error?**  
Enter at least one category in the categories column to fix this issue.

### 4. Question type is incorrect. Required values are: [multiselect, fill in the blanks, matching]
**Why does this error occur?**  
This error occurs when the question type does not match any of the required values: [multiselect, fill in the blanks, matching].

**How can you fix the error?**  
Ensure that the question type is one of the following: [multiselect, fill in the blanks, matching].

### 5. Correct Answer number does not match with given answer options
**Why does this error occur?**  
This error occurs if the number of answer options is less than what is specified as the correct option. For example, if there are only three answer options but you attempt to set the fourth option as the correct answer.

**How can you fix the error?**  
Check the number of answer options and ensure that the correct option index number corresponds to the available options.

### 6. Matching left and right side options should be of equal length
**Why does this error occur?**  
This error occurs when the question type is Matching, and there is an unequal number of left and right side options.

**How can you fix the error?**  
Ensure that the number of left side options matches the number of right side options.

### 7. French language is not allowed in this division
**Why does this error occur?**  
This error occurs when the specified language is not permitted for the user uploading the CSV.

**How can you fix the error?**  
Use an allowed language or leave the language field empty. By default, it takes the language of the user.