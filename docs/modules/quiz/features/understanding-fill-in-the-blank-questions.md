---
id: 5fd4623dc868cb6df3a80fe9
title: "Understanding fill-in-the-blank questions"
description: "Learn to create 'Fill-In-The-Blank' questions in SmartWinnr, allowing participants to provide specific text answers for assessment."
slug: how-to-create-fill-in-the-blank-questions
sidebar_position: 41
last_update:
  date: 2026-06-28
  author: Anagha Isal
source:
  helpscout_id: 5fd4623dc868cb6df3a80fe9
  helpscout_url: >-
    https://help.smartwinnr.com/article/41-how-to-create-fill-in-the-blank-question
customProps:
  roles:
    - editor
    - admin
  privilege: quiz
tags: ["quiz"]
draft: false
---

> **At a glance** - Fill-in-the-blank questions allow participants to provide specific text answers. This article explains how to create and configure these questions in SmartWinnr.

**The fill-in-the-blanks question allows participants to write text answers.** Please note that the answers given by the participants need to exactly match the correct answers provided.

**Here is how you can create a 'Fill in the Blanks' question.**

## When to use this
Use this feature when you want to assess learners' knowledge by requiring them to provide specific text answers. This question type is suitable for testing recall of facts or concepts.

## Steps

### 1. Navigate to the Question Bank
Navigate to **EDITOR > LEARNING AND KNOWLEDGE > Questions and Quizzes > Question Bank.**

### 2. Add a New Question
Click on the **'Add New Question'** button at the _top right corner_.

![Click on the 'Add New Question' button at the top right corner](/img/helpscout/editors/how-to-create-multiple-choice-questions-1.png)

### 3. Select Question Type and Scoring
On the **'Create new Question'** page, select the **'Question Type'** as **‘Fill-in-the-blank’.** Also, select the scoring, whether default or partial. Use **Default Scoring** when the question has only one correct answer. Use **Partial Scoring** when the question has multiple correct answers. In **Partial Scoring**, the total score is distributed equally among all correct answer options.

![Select the 'Question Type' as ‘Fill-in-the-blank’. Also, select the scoring, whether default or partial.](/img/helpscout/editors/how-to-create-fill-in-the-blank-questions-1.png)

### 4. Enter the Question
Enter your question in the **‘Question’** field.

![Enter your question in the ‘Question’ field.](/img/helpscout/editors/how-to-create-fill-in-the-blank-questions-2.png)

### 5. Provide Answers
Enter the appropriate answers for the question in the **‘Items’** field.

![Enter the appropriate answers for the question in the ‘Items’ field.](/img/helpscout/editors/how-to-create-fill-in-the-blank-questions-3.png)

### 6. Select Match Type
You can select the **‘Match Type’** to be either _‘Exact Match’, ‘Partial Match’, or ‘Ordered Partial Match’_. For a detailed explanation, [click here](#matchType).

### 7. Set Points
The total score for the question should be added here. Select the “Shuffle Last Option” checkbox to randomize the position of the last answer option in the question.

### 8. Provide Feedback
This section can be used to provide **additional information or clarification** related to the topic or concept covered in the question. The feedback will be available to learners **after they complete the quiz**.

**Correct answer feedback** will be shown to users who answer the question correctly, while **incorrect answer feedback** will be displayed to users who answer the question incorrectly.

![Provide additional information or clarification related to the topic or concept covered in the question.](/img/helpscout/editors/how-to-create-multiple-choice-questions-10.png)

### 9. Select Categories
In SmartWinnr, every question requires at least one category. Categories are pre-defined by your administrator. You can select one or more categories that best define a question.

![Select one or more categories that best define a question.](/img/helpscout/editors/how-to-create-multiple-choice-questions-12.png)

## Note on Copying Questions from Microsoft Word
Microsoft Word adds certain hidden characters and markups to every document. If you directly copy text from a Word document, these hidden artifacts can create problems, especially on mobile devices. To avoid this issue, if you are copying any question from a Word document, please follow these steps:

1. Copy the text from the Word Document into Notepad. This removes all hidden markups.
2. Then copy the text from Notepad into SmartWinnr → Question box.

## Question Content
Questions can incorporate a variety of content elements, including plain text, videos, images, hyperlinks, and audio, to enhance clarity, engagement, and learning effectiveness.

### Match Type Options
The **Match Type** option determines how the answer provided by the quiz taker is matched with the correct answer provided for the question. There are three different match types provided for a fill-in-the-blank question:

* **Exact Match** - When the _Exact Match_ option is enabled for a fill-in-the-blank question, participants are awarded points only if their response exactly matches the predefined correct answer. This includes strict adherence to spelling, capitalization, and formatting.

    For example, if the correct answer is **“Delhi”**, responses such as **“delhi”** or **“New Delhi”** will not be considered correct.

* **Partial Match** - When the _Partial Match_ option is selected, participants receive points if their response sufficiently matches the correct answer. This option requires you to define a **Match Threshold**, which represents the minimum percentage similarity required between the participant’s response and the correct answer.

    For example, if the correct answer is **“Delhi”** and the Match Threshold is set to **60%**, responses such as **“Delhi”** or **“New Delhi”** will be accepted as correct.

You can check if variations of the answer provided will be valid or invalid with the check option against the item.

![Check if variations of the answer provided will be valid or invalid with the check option against the item.](/img/helpscout/editors/how-to-create-fill-in-the-blank-questions-4.png)

* **Ordered Partial Match** - When the Ordered Partial Match option is enabled for a fill-in-the-blank question, participants are awarded points only if their response matches the correct answer and preserves the correct word order. In addition, the response must meet the configured Match Threshold, which defines the minimum required percentage similarity. For example, if the correct answer is **United States of America** and the Match Threshold is set to **85%**, responses such as **“The United States”** or **“America”** will be considered correct. However, a response like **“United States America,”** which does not maintain the correct word order, will be marked as incorrect.

## Additional Content Options
* **Text** - If it's just a text question, then you can simply write it in the box.

* **Videos** - You can pose a question through a video as well. Choose videos of products, product demonstrations, customer feedback, customer stories, and ask questions based on that. Click on the video icon. You can add your own videos to the question or videos from YouTube, Box, and Brainshark.

    [Learn how to add different videos to a question](https://smartwinnr-help-docusaurus-production.up.railway.app/modules/quiz/features/how-to-add-a-video-to-a-question)

* **Images** - Images or pictures can be sent with a question by clicking on the image icon. Then click on the 'Choose File' button to select the required files from the computer.

    [Learn how to add an image to the question](https://smartwinnr-help-docusaurus-production.up.railway.app/modules/quiz/features/how-to-add-an-image-to-the-question)

* **Links** - You can also insert a link with the question by clicking on the links icon.

    [Learn how to embed a link into the question](https://smartwinnr-help-docusaurus-production.up.railway.app/modules/quiz/features/how-to-embed-a-link-into-the-question)

* **Audio** - You can also send an audio file with the question by clicking on the Audio icon.

    [Learn how to embed an audio file into the question](https://smartwinnr-help-docusaurus-production.up.railway.app/modules/quiz/features/how-to-add-an-audio-file-to-a-question)

## Change Language
You can change the language of the question by clicking on the "Change Language" button at the top right corner of this section. It will open the following popup:

![Change the language of the question by clicking on the "Change Language" button.](/img/helpscout/editors/how-to-create-multiple-choice-questions-13.png)

Choose the language to which you want to change and then click on the "Save" button.

Once you have filled in the required details of the question, click on the **'Save New Question'** button to save the question.

## How do the participants see the question?
This is an example of how the participants see the fill-in-the-blank question in the User View.

![How do the participants see the question?](/img/helpscout/editors/how-to-create-fill-in-the-blank-questions-5.png)