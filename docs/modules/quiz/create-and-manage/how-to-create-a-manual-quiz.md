---
id: 5fd490113d1d2a5b1c5ea153
title: How to create a manual quiz?
description: >-
  Navigate to Editor > LEARNING AND KNOWLEDGE > Questions and Quizzes > View All
  Quizzes -> Add New Quiz.
slug: how-to-create-a-manual-quiz
sidebar_position: 50
last_update:
  date: 2026-07-09
  author: Sruthi Suresh
source:
  helpscout_id: 5fd490113d1d2a5b1c5ea153
  helpscout_url: 'https://help.smartwinnr.com/article/50-how-to-create-a-manual-quiz'
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
  privilege: quiz
tags:
  - quiz
  - admin
draft: false
---

> **At a glance** - This article explains how to create a manual quiz, including setting options and adding questions.

Navigate to **Editor > LEARNING AND KNOWLEDGE > Questions and Quizzes > View All Quizzes -> Add New Quiz.**

On the '**Create New Quiz**' page, select **Quiz Type = Manual**.

![On the 'Create New Quiz' page, select Quiz Type = Manual.](/img/helpscout/editors/how-to-create-a-manual-quiz-1.png)

We have three types of manual quizzes:

![We have 3 types of manual quizzes, which are,](/img/helpscout/editors/how-to-create-a-manual-quiz-2.png)

* **Regular:**

    This is a standard quiz that can be scheduled for the current date and time or for a future date and time. Scores obtained in a Regular quiz can be added to both the **Quiz Leaderboard** and **Competition Leaderboards**.

* **Exam:**

    This quiz type is designed for assessment purposes. Scores from an exam quiz are added **only** to the **Quiz Leaderboard** and do not contribute to competition leaderboards.

* **Event:**

    This quiz type is intended for live or time-bound events. The editor can manually open the quiz at the start of the event and close it when the event concludes, ensuring participation is restricted to the event duration.

### Quiz Details

* **Quiz Title:** Enter the title of the quiz. This will be visible to all users.
* **Quiz Description:** Provide a brief description of the quiz.

![Quiz Details](/img/helpscout/editors/how-to-create-an-automatic-quiz-3.png)

* **Start Date:** Click the calendar icon to select the start date and time of the quiz. The quiz will be available to participants from this specified date and time.
* **End Date:** Click the calendar icon to select the end date and time of the quiz. After this date and time, the quiz will no longer be accessible to participants.
* **Time Zone:** By default, it will be the timezone of the editor who has logged in. If the editor needs to set a different timezone, they can click on the **Change** button and update it.

### Quiz Cover and Thumbnail Images

Here you can set the quiz cover image and thumbnail image.

![Quiz Cover and Thumbnail Images](/img/helpscout/editors/how-to-create-a-manual-quiz-3.png)

### Quiz Settings

![Quiz Settings](/img/helpscout/editors/how-to-create-a-manual-quiz-4.png)

* **Enable Timer:** Select this option to make the quiz time-bound. Specify the number of minutes within which participants must complete the quiz.
* **Show Time:** Enable this option if you want the time taken by each participant to be displayed on the quiz leaderboard.

* **Allow Multiple Attempts for This Quiz:** Enable this option to allow participants to attempt the quiz multiple times until they achieve a specified minimum score. Enter the required **minimum percentage** in the field provided.
* **Allow Quiz Retake:** Select this option to allow participants to independently retake the quiz after completing an attempt.
* **Show Quiz Review:** Enable this option to display the correct answers and feedback for each question once a participant successfully completes the quiz. By default, the **Show Quiz Review** option is enabled for all quizzes.

    SmartWinnr allows you to **lock or unlock** the quiz review option at any time, provided the quiz was created with the review feature enabled. To lock the review for an existing quiz, navigate to:

    **Editor > Questions and Quizzes > View All Quizzes > Select the Quiz > Lock Review**.

![Lock Review Option](/img/helpscout/editors/how-to-create-a-manual-quiz-5.png)

* **Randomly Assign Questions:** Enable this option to assign a random set of questions to each quiz participant. Once selected, you will be prompted to specify the **Number of Questions per Quiz**.

    For example, if the number of questions per quiz is set to **10** and the quiz contains **30** questions in total, the system will automatically present **10 randomly selected questions** from the available pool to each participant.

    If you choose the **Randomize Question by tag** option, this will allow you to customize the number of questions from each tag.

* **Question skip in Quiz:** Check this option if you want to allow quiz takers to skip questions in this quiz.

![Randomize Question by Tag](/img/helpscout/editors/how-to-create-a-manual-quiz-6.png)

* **Integrate with LMS (xAPI):** Enable this option to integrate the quiz with an LMS using the **xAPI** standard.
* **Send by Generic Name:** Select this option to distribute the quiz using a **generic sender name** instead of a specific user or entity.
* **Allow Self-Registration:** Quiz where users can have self-registration enabled so that anyone with the quiz link can access the quiz.
* **Shuffle Answer Options:** Activate this setting to **randomize the order of answer options** for questions within the quiz.
* **Enable Completion Notification:** Turn on this option to send a **notification upon quiz completion**.
* **Enable Question Skipping:** Allow participants to **skip questions** and return to them later during the quiz.
* **Leaderboard Display Settings:** Configure how quiz results appear on leaderboards. You can choose to:
  * Add scores to **all leaderboards**
  * Add scores **only to the quiz leaderboard**
  * **Exclude** the quiz from all leaderboards

![Leaderboard Display Settings](/img/helpscout/editors/how-to-create-an-automatic-quiz-5.png)

* **Send Notification on Assignment:** Enable this option to send a notification to users when a quiz is assigned to them.
* **Custom Email Subject:** This option allows you to define a custom subject line for the email notification sent to quiz participants. When enabled, you will be prompted to enter the subject text. By default, the email subject is **“New Quiz Assigned.”**

![Custom Email Subject](/img/helpscout/editors/how-to-create-a-manual-quiz-7.png)

* **Display message on completion:** Enable this option to customize the pop-up message shown to participants upon completing the quiz. When selected, you will be prompted to enter a custom completion message. By default, the message displayed is **“You have successfully completed this quiz.”**

![Completion Message](/img/helpscout/editors/how-to-create-a-manual-quiz-8.png)

* **Show Score:** Enable or disable the display of scores to participants during or after the quiz.
* **Show Immediate Answer Feedback:** Enable this option to display answer feedback immediately after a participant attempts a question.
* **Enable Decimal Scoring:** Activate this setting to allow scores to be displayed with decimal values.
* **Send Digest Email:** Enable this option to send a summary (digest) email to users.
* **Hide Correct Answer for Incorrect Responses:** Select this option to hide the correct answer when a participant responds incorrectly.
* **Quiz Background:** Use this option to customize the background of the quiz. By default, a standard background image is applied. Editors can change the background image by clicking the **Change** button.

![Quiz Background](/img/helpscout/editors/how-to-create-a-manual-quiz-9.png)

* **Completion Certificate:** Enable this option to award a **certificate or badge** upon successful completion of the quiz. To select a certificate or badge, click the **“Click Here”** button. This will open a selection page where you can choose the desired badge or certificate and save your selection.

    Once a participant completes the quiz, the selected badge or certificate will be automatically assigned to them.

![Completion Certificate](/img/helpscout/editors/how-to-create-a-manual-quiz-10.png)

* **Set Reminder:** This feature allows you to configure and schedule reminders to notify quiz participants about the status of the quiz.

![Set Reminder](/img/helpscout/editors/how-to-create-a-manual-quiz-11.png)

### Adding Questions to the Quiz

Once you have completed the steps to create a quiz, you can now add questions to the quiz. Select questions by searching with the different search criteria and checking the checkbox to the left of each question.

![Adding Questions to the Quiz](/img/helpscout/editors/how-to-create-a-manual-quiz-12.png)

After selecting the questions, click **Save**. You can then proceed to assign the quiz to participants.

### Assigning the Quiz to Participants

Once you have completed the quiz creation process and added the required questions, you can assign the quiz to individual participants or groups.

* Use the available **search and filter criteria** to identify the users you want to assign the quiz to.
* Select the checkboxes next to the names of the participants.
* After selecting the participants, click the **Save** button at the bottom of the page to complete the assignment.

You may also choose to assign the quiz to a **specific group of users** (e.g., North Zone) instead of individual participants.

![Assigning the Quiz to Participants](/img/helpscout/editors/how-to-create-a-manual-quiz-13.png)

On assigning the quiz to participants, a success popup message will display.

![Success Popup Message](/img/helpscout/editors/how-to-create-a-manual-quiz-14.png)
