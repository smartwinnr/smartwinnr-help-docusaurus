---
id: 5fd48497c868cb6df3a81016
title: How to upload questions in bulk using 'Import Questions'.
description: "Here are the steps to import questions in bulk."
slug: how-to-upload-questions-in-bulk-using-import-questions
sidebar_position: 46
last_update:
  date: 2026-07-29
  author: Sandeep Bhuthagaddala
source:
  helpscout_id: 5fd48497c868cb6df3a81016
  helpscout_url: 'https://help.smartwinnr.com/article/46-how-to-use-import-questions'
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
  privilege: quiz
tags:
  - quiz
  - admin
draft: false
---

> **At a glance** - This article outlines the steps to import questions in bulk using the 'Import Questions' feature.

You can efficiently upload multiple questions to your quiz by using the 'Import Questions' feature. This process involves downloading a CSV template, filling it with your questions, and then uploading it back to the platform.

## When to use this

Use the bulk upload feature when you have a large number of questions to add to your quiz. This method is ideal for:

- Streamlining the question creation process.
- Ensuring consistency in question formatting.
- Saving time compared to adding questions individually.

## Steps

### 1. Download CSV Template

The first step in the bulk upload is to download the CSV template to create questions. Follow the steps below to download the CSV template:

Go to **Questions and Quizzes** under **LEARNING AND KNOWLEDGE** in the left menu > **Question Bank**. Click on the **hamburger** icon and select '**Import Questions**'.

![Download the CSV template from the Import Questions page](https://s3.amazonaws.com/helpscout.net/docs/assets/5fcc5d22d580ce55a38b4a61/images/5fd489854eb32171b80374ac/file-oFELKX2pBw.png)

Now, on the import questions page, click on the **Download Template** button at the top right corner. This downloads the CSV template successfully to your computer.

![CSV template download button](https://s3.amazonaws.com/helpscout.net/docs/assets/5fcc5d22d580ce55a38b4a61/images/5fd489a423119734ee37eda1/file-QXxeYElTyE.png)

Double-click on the CSV file to open it. You can open a CSV file with your Excel application.

This is how a sample CSV file will look:

![Sample CSV file](https://s3.amazonaws.com/helpscout.net/docs/assets/5fcc5d22d580ce55a38b4a61/images/5fd489a423119734ee37eda1/file-QXxeYElTyE.png)

It provides sample questions that you can create through this method.

### 2. Add questions to the CSV

Open the downloaded CSV file and fill all the fields in it. Here are the various fields in the CSV file and how you can fill them out:

- **Question Text:** This field contains the question text.
- **Categories:** This field contains the category that a question belongs to. Every question must be assigned to a category.
- **Question Type:** This field indicates what type a particular question is: MultiSelect, Fill in the blanks, or Matching.
- **Answer Options:** These fields contain the answer options for a question.
- **Correct Option:** This field contains the correct answer to a question.
- **Matching Left and Matching Right:** This field contains the left and right matching answers for a matching question.
- **Distractors:** This field contains distractors (additional choices on the right side) for a matching question.
- **Feedback:** You can fill this field with any additional information that you may want to provide about a question.
- **Language:** This field contains the language in which you want to create the question.

Certain mandatory fields must be filled to upload the CSV file successfully. The mandatory fields are: Question Text, Categories, Question Type, Answer Options (depends on question type), Correct Answers (depends on question type), Matching Left and Matching Right (depends on the question type).

**Here are Do's and Don'ts to keep in mind while creating the CSV file:**

**Do's:**

1. Ensure all mandatory fields in the CSV are filled.
2. Verify that the values you fill are correct and align with the predefined categories.

**Don'ts:**

1. Do not add or remove a column.
2. Do not change the order of the columns.
3. Keep the column headers as they are.

Once the CSV file is filled with all the questions and necessary information, it will be ready for upload.

### 3. Upload CSV

To upload the CSV file, click on the **Choose File** button and select the CSV file to be uploaded. Then, click on the **Upload** button.

![Upload the CSV file](https://s3.amazonaws.com/helpscout.net/docs/assets/5fcc5d22d580ce55a38b4a61/images/5fd489a423119734ee37eda1/file-QXxeYElTyE.png)

On successful upload, you will see the list of questions in the file in the **User Upload Status** section.

![User Upload Status section](https://s3.amazonaws.com/helpscout.net/docs/assets/5fcc5d22d580ce55a38b4a61/images/5fd489a423119734ee37eda1/file-QXxeYElTyE.png)

You can view a question by clicking on the **View Question** button.

### Common Error Codes

If there are any missing or incorrect values in the CSV file, errors will display while uploading it. You will see the list of errors in the file in the **Validation Errors During Upload** section.

![Validation errors during upload](https://s3.amazonaws.com/helpscout.net/docs/assets/5fcc5d22d580ce55a38b4a61/images/5fd489a423119734ee37eda1/file-QXxeYElTyE.png)

### View Logs and Check Questions

You can view the log status by clicking on the **View Logs** button.

![View Logs button](https://s3.amazonaws.com/helpscout.net/docs/assets/5fcc5d22d580ce55a38b4a61/images/5fd489ee36980410c912383b/file-Ie7QamTmvr.png)

This opens the following page:

![Log status page](https://s3.amazonaws.com/helpscout.net/docs/assets/5fcc5d22d580ce55a38b4a61/images/5fd489ee36980410c912383b/file-Ie7QamTmvr.png)

Here, you can see the uploaded questions or errors of a particular entry. Click on the **View Questions** button to see all the questions. Below is a screenshot of how the questions will be displayed.

![Uploaded questions display](https://s3.amazonaws.com/helpscout.net/docs/assets/5fcc5d22d580ce55a38b4a61/images/5fd48a244eb32171b80374ae/file-hNgPmhfRDl.png)

Click on the **View Errors** button to view the errors in the file. Below is a screenshot of how the errors will be displayed.

![View Errors button](https://s3.amazonaws.com/helpscout.net/docs/assets/5fcc5d22d580ce55a38b4a61/images/5fd48a4ac868cb6df3a8101c/file-UoiRaZBe6C.png)
