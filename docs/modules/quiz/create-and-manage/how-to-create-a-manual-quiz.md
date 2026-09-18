---
id: 5fd490113d1d2a5b1c5ea153
title: How to create a manual quiz?
description: >-
  Navigate to **Editor > LEARNING AND KNOWLEDGE > Questions and Quizzes > View
  All Quizzes -> Add New Quiz.**
slug: how-to-create-a-manual-quiz
sidebar_position: 50
last_update:
  date: 2026-09-18
  author: Sruthi Suresh
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
  privilege: quiz
tags:
  - quiz
  - admin
draft: false
---

> **At a glance** - Create a manual quiz, configure its settings, add questions, and assign it to participants.

Navigate to **Editor > LEARNING AND KNOWLEDGE > Questions and Quizzes > View All Quizzes -> Add New Quiz.**

On the **Create New Quiz** page, select **Quiz Type = Manual**.

![On the Create New Quiz page, select Quiz Type = Manual](/img/helpscout/editors/how-to-create-a-manual-quiz-1.png)

You can create three types of manual quizzes.

![We have 3 types of manual quizzes, which are](/img/helpscout/editors/how-to-create-a-manual-quiz-2.png)

* **Regular:**

  This is a standard quiz that you can schedule for the current date and time or for a future date and time. Scores from a Regular quiz can be added to both the **Quiz Leaderboard** and **Competition Leaderboards**.

* **Exam:**

  This quiz type is designed for assessment purposes. Scores from an exam quiz are added only to the **Quiz Leaderboard** and do not contribute to competition leaderboards.

* **Event:**

  This quiz type is intended for live or time-bound events. You can manually open the quiz at the start of the event and close it when the event concludes. This keeps participation limited to the event duration.

## When to use this

Use a manual quiz when you want to control quiz timing, scoring, and participant access.

- Schedule a quiz for a specific date and time.
- Run an assessment that only affects the **Quiz Leaderboard**.
- Host a live event quiz that opens and closes with the event.
- Assign the quiz to selected users or groups.

### Quiz Details

* **Quiz Title:** Enter the title of the quiz. This appears to all users.
* **Quiz Description:** Provide a brief description of the quiz.

![Quiz Details](/img/helpscout/editors/how-to-create-an-automatic-quiz-3.png)

* **Start Date:** Click the calendar icon to select the start date and time of the quiz. The quiz is available to participants from this date and time.
* **End Date:** Click the calendar icon to select the end date and time. After this date and time, the quiz is no longer accessible to participants.
* **Time Zone:** By default, this uses the timezone of the logged-in editor. To set a different timezone, click **Change** and update it.

### Quiz Cover and Thumbnail Images

Here you can set the quiz cover image and thumbnail image.

![Quiz Cover and Thumbnail Images](/img/helpscout/editors/how-to-create-a-manual-quiz-3.png)

### Quiz Settings

![Quiz Settings](/img/helpscout/editors/how-to-create-a-manual-quiz-4.png)

* **Enable Timer:** Select this option to make the quiz time-bound. Specify the number of minutes participants have to complete it.
* **Show Time:** Enable this option if you want each participant's time to appear on the quiz leaderboard.

* **Allow Multiple Attempts for This Quiz:** Enable this option to let participants attempt the quiz multiple times until they achieve the specified minimum score. Enter the required **minimum percentage** in the field provided.
* **Allow Quiz Retake:** Select this option to let participants independently retake the quiz after completing an attempt.
* **Show Quiz Review:** Enable this option to display the correct answers and feedback for each question after a participant successfully completes the quiz. By default, **Show Quiz Review** is enabled for all quizzes.

  SmartWinnr allows you to **lock or unlock** the quiz review option at any time, provided the quiz was created with the review feature enabled. To lock the review for an existing quiz, navigate to:

  **Editor > Questions and Quizzes > View All Quizzes > Select the Quiz > Lock Review**.

![Lock Review Option](/img/helpscout/editors/how-to-create-a-manual-quiz-5.png)

* **Randomly Assign Questions:** Enable this option to assign a random set of questions to each quiz participant. Once selected, you are prompted to specify the **Number of Questions per Quiz**.

  For example, if the number of questions per quiz is set to **10** and the quiz contains **30** questions in total, the system presents **10 randomly selected questions** from the available pool to each participant.

  If you choose the **Randomize Question by tag** option, you can customize the number of questions from each tag.

* **Question skip in Quiz:** Check this option if you want to allow quiz takers to skip questions in this quiz.

![Randomize Question by Tag](/img/helpscout/editors/how-to-create-a-manual-quiz-6.png)

* **Integrate with LMS (xAPI):** Enable this option to integrate the quiz with an LMS using the **xAPI** standard.
* **Send by Generic Name:** Select this option to distribute the quiz using a **generic sender name** instead of a specific user or entity.
* **Allow Self-Registration:** Enable this option so that anyone with the quiz link can access the quiz.
* **Shuffle Answer Options:** Activate this setting to **randomize the order of answer options** for questions within the quiz.
* **Enable Completion Notification:** Turn on this option to send a **notification upon quiz completion**.
* **Enable Question Skipping:** Allow participants to **skip questions** and return to them later during the quiz.
* **Leaderboard Display Settings:** Configure how quiz results appear on leaderboards. You can choose to:
  * Add scores to **all leaderboards**
  * Add scores **only to the quiz leaderboard**
  * **Exclude** the quiz from all leaderboards

![Leaderboard Display Settings](/img/helpscout/editors/how-to-create-a-automatic-quiz-5.png)

* **Send Notification on Assignment:** Enable this option to send a notification to users when a quiz is assigned to them.
* **Custom Email Subject:** This option lets you define a custom subject line for the email notification sent to quiz participants. When enabled, you are prompted to enter the subject text. By default, the email subject is **New Quiz Assigned**.

![Custom Email Subject](/img/helpscout/editors/how-to-create-a-manual-quiz-7.png)

* **Display message on completion:** Enable this option to customize the pop-up message shown to participants when they complete the quiz. When selected, you are prompted to enter a custom completion message. By default, the message displayed is **You have successfully completed this quiz.**

![Completion Message](/img/helpscout/editors/how-to-create-a-manual-quiz-8.png)

* **Show Score:** Enable or disable the display of scores to participants during or after the quiz.
* **Show Immediate Answer Feedback:** Enable this option to display answer feedback immediately after a participant attempts a question.
* **Enable Decimal Scoring:** Activate this setting to allow scores to display with decimal values.
* **Send Digest Email:** Enable this option to send a summary digest email to users.
* **Hide Correct Answer for Incorrect Responses:** Select this option to hide the correct answer when a participant responds incorrectly.
* **Quiz Background:** Use this option to customize the background of the quiz. By default, a standard background image is applied. Editors can change the background image by clicking **Change**.

![Quiz Background](/img/helpscout/editors/how-to-create-a-manual-quiz-9.png)

* **Completion Certificate:** Enable this option to award a **certificate or badge** upon successful completion of the quiz. To select a certificate or badge, click **Click Here**. This opens a selection page where you can choose the desired badge or certificate and save your selection.

  Once a participant completes the quiz, the selected badge or certificate is automatically assigned to them.

![Completion Certificate](/img/helpscout/editors/how-to-create-a-manual-quiz-10.png)

* **Set Reminder:** This feature lets you configure and schedule reminders to notify quiz participants about the status of the quiz.

![Set Reminder](/img/helpscout/editors/how-to-create-a-manual-quiz-11.png)

* **Quiz Badge Settings:**
  Users will receive badges based on the scores they achieve.

  * **Gold Badge Score Threshold:** Set this decimal value to define the minimum score ratio for a gold badge. At **0.9**, users must score at least 90% to earn a gold badge.
  * **Silver Badge Score Threshold:** Set this decimal value to define the minimum score ratio for a silver badge. At **0.75**, a score of 75% or higher, but below 90%, earns a silver badge.
  * **Bronze Badge Score Threshold:** Set this decimal value to define the minimum score ratio for a bronze badge. At **0.6**, a score of 60% or higher, but below 75%, earns a bronze badge.

  Users who score below the bronze threshold do not receive a badge. These badges appear on the quiz scoreboard, user profile, and notification feeds.

### Adding Questions to the Quiz

Once you complete the steps to create a quiz, you can add questions to the quiz. Select questions by searching with the different search criteria and checking the checkbox to the left of each question.

![Adding Questions to the Quiz](/img/helpscout/editors/how-to-create-a-manual-quiz-12.png)

After selecting the questions, click **Save**. You can then proceed to assign the quiz to participants.

### Assigning the Quiz to Participants

Once you complete the quiz creation process and add the required questions, you can assign the quiz to individual participants or groups.

* Use the available **search and filter criteria** to identify the users you want to assign the quiz to.
* Select the checkboxes next to the names of the participants.
* After selecting the participants, click **Save** at the bottom of the page to complete the assignment.

You can also assign the quiz to a **specific group of users** such as North Zone instead of individual participants.

![Assigning the Quiz to Participants](/img/helpscout/editors/how-to-create-a-manual-quiz-13.png)

After you assign the quiz to participants, a success popup message appears.

![Success Popup Message](/img/helpscout/editors/how-to-create-a-manual-quiz-14.png)

## Things to know

:::note
The article includes detailed quiz settings, question selection, and participant assignment options.
:::