---
title: "Troubleshoot for common error code"
description: ""
slug: troubleshoot-for-common-error-code
sidebar_position: 47
last_update:
  date: 2025-08-10
  author: HelpScout Migration
helpscout_id: 5fd48e84c868cb6df3a8101f
helpscout_url: https://help.smartwinnr.com/article/47-troubleshoot-for-common-error-code
---
Here is a list of possible errors that you might encounter while uploading a CSV file and how you can fix them:

**1\. Error:** Question text can't be empty

**Why does this error occur**?:- If you leave a question text column blank.

**How can you fix the error?:-** Enter the question text

**2\. Error:** Internals is not a correct category for this division

**Why does this error occur**?:- If the given categories do not exist in the division

**How can you fix the error?:-** Change the categories, that exists in the selected division or default division (if there is only one division)

**3\. Error:** Only one tag is allowed from each category for a division

**Why does this error occur**?:- You can't select more than one tags from a single category

**How can you fix the error?:-** Keep only one tag from each category.

**4\. Error:** Categories column value can't be blank

**Why does this error occur**?:- If you leave a categories column blank.

**How can you fix the error?:-** Enter at least one category

**5\. Error:** Question type is incorrect. Required values are: \[multiselect, fill in the blanks, matching\]

**Why does this error occur**?:- If question type does not match from \[multiselect, fill in the blanks, matching\]

**How can you fix the error?:-** Enter question type from \[multiselect, fill in the blanks, matching\]

**6\. Error:** Correct Answer number does not match with given answer options.

**Why does this error occur**?:- If answer options are only 3 and trying to keep the 4th option as the correct option

**How can you fix the error?:-** Check your number of answer options and the correct option index number

**7\. Error:** Matching left and right side options should be of equal length

**Why does this error occur**?:- If the question type is Matching and you have an unequal number of left and right side options

**How can you fix the error?:-** Enter the equal number of matching left and right side options

**8\. Error: French language is not allowed in this division.**

**Why does this error occur?:-** Specified language is not allowed for the user who is uploading the CSV

**How can you fix the error?:-** Enter the allowed language or leave it empty (By default it takes the language of the user)