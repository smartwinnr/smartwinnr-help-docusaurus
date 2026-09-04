---
id: create-automatic-quiz
title: "How to create an automatic quiz in SmartWinnr"
description: "Create an automatic quiz that delivers multiple assessments at specified intervals, using a selected question pool for continuous learner engagement."
slug: create-automatic-quiz
sidebar_position: 999
last_update:
  date: 2026-09-04
  author: Sruthi Suresh
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
draft: false
tags: ["quiz"]
---

> **At a glance** - Create an automatic quiz to send multiple quizzes at fixed intervals, using questions from a designated pool.

An automatic quiz in SmartWinnr allows you to send multiple quizzes over a specified period. You can set the frequency of delivery and select questions from a pool based on your chosen settings. This feature is ideal for ongoing assessments and continuous learning, allowing you to assign questions from a larger question bank to learners over a defined period for regular knowledge reinforcement.

## When to use this

Use the automatic quiz feature when you want to:

- Assess learners periodically without manual intervention.
- Ensure consistent engagement through regular quizzes.
- Utilize a diverse set of questions from a pre-defined question pool from your question bank.

## Steps

### 1. Access the Automatic Quiz Feature

Navigate to **Editor > Learning and Knowledge > Questions and Quizzes > View All Quizzes > Add New Quiz** at the top right corner.

On the Create New Quiz page, select **Quiz Type = Automatic**.

![This shows the BU, sub BU and the quiz type details](/img/helpscout/authored/authored-mr3pw7xr.png)

- **Business Unit (BU)**: Select the relevant business unit for the quiz.
- **Sub Business Unit (Sub BU)**: Choose the specific sub-unit if applicable.
- **Quiz Type**: Choose the type as **'Automatic'**.
- **Auto Mode Type**: Choose the mode for your automatic quiz.

You have three different modes available for the automatic quiz:

- **Default Auto Mode (Balanced reinforcement)**: This mode is chosen for general spaced practice, providing a mix of new, wrong, and mastered questions. It is good for ongoing retention without overloading with new content.
- **Quick Auto Mode (Fast coverage of new material)**: This mode is chosen when the goal is to expose users to unseen/unanswered questions quickly (70% from unanswered, 30% incorrect). It retires questions after one correct response.
- **Sequence Question Auto Mode (Ordered/curriculum-style learning)**: This mode is chosen when questions must be seen in a fixed order (e.g., chapter or course sequence). Each delivery gives the next N questions in quiz order, with no random mix.

### 2. Set Quiz Details and Duration

- Add the **Quiz Title**.
- Add the **Quiz Code** (optional).
- Add the **Quiz Description** (optional).
- Set the **quiz duration** by specifying its start and end dates. The quiz will be available to learners and continue running until the defined end date.
- Set the **Availability date** by specifying how long the quizzes will remain available for learners to complete.

![This shows the duration details](/img/helpscout/authored/authored-mr3px8xi.png)

### 3. Choose Delivery Days

Select specific days for quiz delivery. For example, if the frequency is set to every three days for the quizzes, you can exclude weekends by choosing which days the quiz should be delivered to the learners.

![This shows on which dates the auto quiz should be delivered](/img/helpscout/authored/authored-mr3py4by.png)

- **Delivery Days**: Check or uncheck the days of the week on which the quiz should be sent. For instance, you can opt out of Saturdays and Sundays.

### 4. Configure Visual Elements

Set the thumbnail and cover image for the quiz to make it visually appealing. This helps in branding and allows users to recognize the quiz easily.

![Here we can set the thumbnail and cover image](/img/helpscout/authored/authored-mr3q31m7.png)

- **Thumbnail**: Upload a small image that represents the quiz.
- **Cover Image**: Upload a larger image that will be displayed prominently when users access the quiz.

### 5. Adjust Quiz Settings

Choose various settings for the quiz, including options for review and feedback after quiz completion. These settings help customize the learner's experience.

![Detailed screenshot of quiz setting](/img/helpscout/authored/authored-mr3q5u27.png)

Different quiz settings include:

- **Leaderboard Display Settings**: Configure how quiz results appear on leaderboards. You can choose to:
  - Add scores to **all leaderboards**, including quiz leaderboard, competition leaderboard, quarterly leaderboard, global points leaderboard, etc.
  - Add scores **only** to the **quiz leaderboard**.
  - **Exclude** the quiz score from all leaderboards.

![Leaderboard score in Quiz setting](/img/helpscout/authored/how-to-create-an-automatic-quiz-mr4l9xgr.png)

- **Allow Self-Registration**: Quiz where users can have self-registration enabled so that anyone with the quiz link can access the quiz.

- **Send Notification on Assignment**: Enable this option to send a push notification to learners on their mobile devices when a quiz is assigned to them.

- **Send Email on Assignment**: Enable this option to send an email notification to users at their registered email addresses when a quiz is assigned to them.

- **Shuffle Answer Options**: Activate this setting to randomize the order of answer options for questions within the quiz. This helps reduce the chances of learners copying answers during the quiz.

- **Integrate with LMS (xAPI)**: Enable this option to integrate the quiz with your Learning Management System (LMS) using the xAPI standard. This will help report quiz completion status and scoring metrics, maintaining consistent learner records across platforms.

  - On enabling the **Integrate with LMS** option, an additional field will appear - **'LMS Instance Identifier'**. Enter the unique identifier provided by your Learning Management System (LMS) to establish the xAPI connection. This ID ensures data is synchronized with the correct LMS instance. This field is mandatory only if multiple attempts from LMS are enabled.

    ![LMS Instance Identifier](/img/helpscout/authored/how-to-create-an-automatic-quiz-mr4mnqzh.png)

- **Custom Email Subject**: This option allows you to define a custom subject line for the email notification sent to quiz participants. When enabled, you will be prompted to enter the subject text.

  By default, the email subject is “New Quiz Assigned.”

- **Enable Completion Notification**: Turn on this option to enable automated email notifications to designated trainers/stakeholders when learners complete quizzes. This will enable supervisors and trainers to track learning progress in real-time without manual monitoring.

  Once enabled, an additional field will appear where you can enter the email addresses of the recipients. Enter an email address and click **Add Email** to include it in the notification list.

  ![Field to collect the email address](/img/helpscout/authored/how-to-create-an-automatic-quiz-mr4n1gxd.png)

- **Enable Pass/Fail**: Enable this option if you would like to set a pass percentage for each of the quizzes shared in the automated quiz list. Once enabled, you can define the passing criteria and customize the messages displayed to learners based on whether they pass or fail the quiz.

  The following settings are available:

  - **Pass Percent Threshold**: Specify the minimum percentage score required for a learner to pass the quiz.
  - **Message for Passed Users**: Enter a custom message (up to 140 characters) that will be sent to learners who achieve the passing score. This message will be used as the body of the completion email sent to users who pass the quiz.
  - **Message for Failed Users**: Enter a custom message (up to 140 characters) that will be sent to learners who do not meet the passing score. This message will be used as the body of the completion email sent to users who fail the quiz.

  This can be used to encourage learners to review the learning material.

- **Show Score**: Enable or disable the display of scores to participants after quiz completion. This can be used when you want to temporarily disable the score for certification exams or assessments requiring manual evaluation before score disclosure.

- **Show Immediate Answer Feedback**: Enable this option to display the answer along with feedback after submission of each question response in the quiz.

- **Randomize Question by Tag**: Enable this option if you would like to randomize the questions by question tags. This ensures balanced coverage of topics while maintaining question variety. This also ensures learners receive questions across all relevant subject areas.

  When this option is enabled, after selecting the questions for the quiz, a pop-up will appear (as shown below). In this pop-up, you need to specify how many questions should be included from each tag in the quiz.

![Randomize Question by Tag](/img/helpscout/authored/how-to-create-an-automatic-quiz-mr4t7zvj.png)

- **Mandatory Category Selection**: Enable this option if you want to specify a set of question tags that must appear in every auto quiz delivery. Configure tag counts on the Questions page (Step 2) once the quiz is created.

Once the questions are selected and saved in Step 2, go to the **Configure** option under Mandatory categories and specify the minimum number of questions to be included from each tag available in the selected question pool for every quiz.

![Mandatory Category Selection](/img/helpscout/authored/how-to-create-an-automatic-quiz-mr4tr3r3.png)

- **Send Digest Email**: Enable this option to send a summary (digest) email to learners upon completing the quiz. This provides a comprehensive performance report via email containing a PDF of quiz responses with incorrect answers highlighted. It enables self-review and targeted learning focus before potential quiz reattempts.

- **Self-Activated Quiz Assignment**: This allows learners to start assigned quizzes at their own pace. Quiz delivery begins only when the learner starts the quiz. If the learner stops responding before completing the assigned quizzes, the delivery of subsequent quizzes is automatically paused until they resume.

- **Schedule by Last Completion Date**: When this option is enabled, learners will automatically receive quizzes based on the last completion date. This ensures that the learner is consistently engaged.

- **Send by Generic Name**: Enable this option to send quiz notifications from a generic sender name, rather than displaying your name (or the name of the trainer/editor who assigned the quiz). This helps maintain a consistent sender identity across all quiz notifications.

![Send by Generic Name](/img/helpscout/authored/how-to-create-an-automatic-quiz-mr4u4v6b.png)

### 6. Set Review Options

Define how learners can review their answers after completing the quiz. This includes options for immediate feedback or a summary of results.

- **Show Quiz Review**: Enabling the quiz review option allows the learner to review their answers after completing the quiz.
- **Hide Correct Answer for Incorrect Responses**: Enable this option to hide the correct answer when a learner selects an incorrect option. On the review page, learners will only be informed that their selected answer is incorrect, without revealing the correct answer.

### 7. Configure Automatic Quiz Specifics

In an **automatic quiz**, SmartWinnr automatically delivers targeted questions to each participant based on their past response history. This approach is particularly useful when managing a large question bank and aiming to distribute a limited number of questions per quiz over time while gradually covering the entire question set.

It is important to configure settings specific to the automatic quiz based on the selected Auto Mode Type. These configurations dictate how questions are presented to learners.

![These are the specific settings for Automatic quiz](/img/helpscout/authored/authored-mr3q8l5z.png)

The editor can configure various settings for an automatic quiz, including:

- **Frequency of Quiz Delivery in Days**: Number of days between successive quiz deliveries. For example, if set to 2, SmartWinnr will send a quiz to all the learners assigned to the quiz every 2 days.

- **The Number of Questions per Quiz**: Determines how many questions should be sent in each quiz.

- **The Number of Correct Responses for a Question to Stop It from Being Repeated**: Specify how many times a learner must answer a question correctly before it is removed from future quizzes in the series. For example, if set to 1, the question will no longer appear once the learner answers it correctly once.

- **Percentage of Questions Assigned**: Options 4–7 allow you to define the percentage of questions to be selected from each category—**Unanswered, Incorrectly Answered, Partially Correctly Answered, and Correctly Answered**—when generating quizzes. This enables adaptive quiz generation based on the learner's previous responses.

- **Number of Incorrect Responses for a Question to Stop It from Being Repeated**: Specify the maximum number of times a learner can answer a question incorrectly before it stops appearing in subsequent quizzes.

Based on the **Auto Mode Type** selected for your automated quiz, SmartWinnr suggests certain values for each of these configurations, allowing you to set up the quiz in the most effective way.

Following is how each of the auto mode types works for the configuration values:

- **Default Mode**: Standard mode for automatic quizzes, where correctly answered, incorrectly answered, and unanswered questions will be repeated based on the configured settings.
- **Quick Auto Mode**: Optimized for faster learning by not repeating correctly answered questions. Only unanswered and incorrectly answered questions are repeated according to the configured settings.
- **Sequence Question Auto Mode**: Questions are presented in a specific sequence. Each question is presented only once, with no repetition regardless of the learner's response.

Thus, after entering all the required details to create the quiz, click **Save and Add Questions**.

The SmartWinnr platform supports an auto quiz spaced repetition feature through three predefined algorithm presets that control how questions are selected and delivered over time to users. These presets are configured under **quiz_auto_mode_settings1**, **quiz_auto_mode_settings2**, and **quiz_auto_mode_settings3**. Here's a summary of how the spaced repetition works and the current settings for your organization:

- **Preset 1 (quiz_auto_mode_settings1)**: This is a balanced spaced repetition setting. It delivers quizzes every 7 days with 5 questions per quiz. Questions are drawn from four buckets with these weightages: 40% unanswered, 30% incorrectly answered, 20% partially correct, and 10% correctly answered. A question is retired after being answered correctly twice. Incorrect questions can be reassigned up to three times.
- **Preset 2 (quiz_auto_mode_settings2)**: This preset also delivers quizzes every 7 days with 5 questions per quiz. It prioritizes new questions more heavily with 70% unanswered and 30% incorrectly answered, but excludes partially correct and correctly answered buckets. Questions retire after one correct answer, and the incorrect question reassignment limit is three.
- **Preset 3 (quiz_auto_mode_settings3)**: This is a sequence-based preset where questions are delivered in a fixed order rather than weighted buckets. It delivers quizzes every 7 days with 5 questions per quiz. Questions retire after one correct answer. The weighted bucket settings are stored but not used in this mode.

These presets define the spaced repetition logic by controlling how often quizzes are delivered, how many questions are included, how questions are selected based on previous user performance, and when questions are retired from the pool. Your organization currently has these presets configured with the values described above, which means your auto quizzes follow a weekly cadence with a small set of questions focused on reinforcing learning through spaced repetition.

If you want to adjust the spaced repetition behavior, you can modify these presets' parameters such as quiz frequency, question counts, bucket weightages, and retirement thresholds. Changing these will affect how frequently users see quizzes and how the question selection adapts to their performance over time.

### 8. Select Questions for the Quiz

Choose the questions from your pool that will be included in the automated quiz.

![This is the second step for auto quiz where the entire list questions for the quiz are selected](/img/helpscout/authored/authored-mr3qd08u.png)

- **Question Pool**: Browse through the available questions and select those you want to include.
- **Search Functionality**: Use search filters to find specific questions quickly.

### 9. Update Questions as Needed

Once the questions are selected, you can update them anytime by adding new questions, removing existing ones, or swapping questions. This flexibility allows you to keep the quiz content fresh and relevant.

![Once the questions are selected and saved, we can still go ahead and update the questions](/img/helpscout/authored/authored-mr3qk7xk.png)

- **Add Questions**: Include new questions in the quiz.
- **Remove Questions**: Delete any questions that are no longer relevant.
- **Swap Questions**: Replace existing questions with new ones.
- **Tagging**: Add or remove questions based on tags for better organization.

[Learn more on how to update the questions for a running automatic quiz](/modules/quiz/create-and-manage/create-automatic-quiz/)

### 10. Add Users to the Quiz

Finally, add users who will participate in the quiz. This step allows you to assign the quiz to specific learners or groups, ensuring targeted delivery.

![You can now add users to the quiz as the final step](/img/helpscout/authored/authored-mr3qnyrr.png)

- **User Selection**: Choose individual users or groups to receive the quiz.

## Tips

- Regularly review the question pool to keep quizzes fresh and relevant.
- Monitor quiz performance to adjust frequency and content as needed.
- Use the visual elements in questions to enhance engagement and recognition.