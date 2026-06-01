---
id: 5fd490113d1d2a5b1c5ea153
title: "How to create a manual quiz?"
description: ""
slug: how-to-create-a-manual-quiz
sidebar_position: 50
last_update:
  date: 2026-01-21
  author: HelpScout Migration
source:
  helpscout_id: 5fd490113d1d2a5b1c5ea153
  helpscout_url: https://help.smartwinnr.com/article/50-how-to-create-a-manual-quiz
customProps:
  roles: [editor, admin]
  privilege: quiz
tags: []
---
Navigate to **Editor > LEARNING AND KNOWLEDGE > Questions and Quizzes > View All Quizzes -> Add New Quiz.**

On the '**Create New Quiz**' page, select **Quiz Type = Manual**.

![](/img/helpscout/editors/how-to-create-a-manual-quiz-1.png)

We have 3 types of manual quizzes, which are,

![](/img/helpscout/editors/how-to-create-a-manual-quiz-2.png)

* **Regular:**

    This is a standard quiz that can be scheduled for the current date and time or for a future date and time. Scores obtained in a Regular quiz can be added to both the **Quiz Leaderboard** and **Competition Leaderboards**.

* **Exam:**

    This quiz type is designed for assessment purposes. Scores from an exam quiz are added **only** to the **Quiz Leaderboard** and do not contribute to competition leaderboards.

* **Event:**

    This quiz type is intended for live or time-bound events. The editor can manually open the quiz at the start of the event and close it when the event concludes, ensuring participation is restricted to the event duration.

* **Quiz Title:** Enter the title of the quiz. This will be visible to all users.
* **Quiz Description:** Provide a brief description of the quiz.

[https://s3.amazonaws.com/helpscout.net/docs/assets/5fcc5d22d580ce55a38b4a61/images/5ff0aed96451e825e3b8f99e/file-ISUiWtvPFW.png](https://s3.amazonaws.com/helpscout.net/docs/assets/5fcc5d22d580ce55a38b4a61/images/5ff0aed96451e825e3b8f99e/file-ISUiWtvPFW.png)

* **Start Date:** Click the calendar icon to select the start date and time of the quiz. The quiz will be available to participants from this specified date and time.
* **End Date:** Click the calendar icon to select the end date and time of the quiz. After this date and time, the quiz will no longer be accessible to participants.
* **Time Zone:** By default, it will be the timezone of the editor who has logged in. If the editor need to set a different timezone, they can click on **Change** button and update it.

### **Quiz Cover and Thumbnail Images:**

Here you can set the quiz cover image and thumbnail image.

![](/img/helpscout/editors/how-to-create-an-automatic-quiz-3.png)

**Quiz Settings**

![](/img/helpscout/editors/how-to-create-a-manual-quiz-3.png)

* **Enable Timer:** Select this option to make the quiz time-bound. Specify the number of minutes within which participants must complete the quiz.
* **Show Time:** Enable this option if you want the time taken by each participant to be displayed on the quiz leaderboard.

![](/img/helpscout/editors/how-to-create-a-manual-quiz-4.png)

* **Allow Multiple Attempts for This Quiz:** Enable this option to allow participants to attempt the quiz multiple times until they achieve a specified minimum score. Enter the required **minimum percentage** in the field provided.
* **Allow Quiz Retake:** Select this option to allow participants to independently retake the quiz after completing an attempt.
* **Show Quiz Review:** Enable this option to display the correct answers and feedback for each question once a participant successfully completes the quiz. By default, the **Show Quiz Review** option is enabled for all quizzes.

    SmartWinnr allows you to **lock or unlock** the quiz review option at any time, provided the quiz was created with the review feature enabled. To lock the review for an existing quiz, navigate to:

    **Editor > Questions and Quizzes > View All Quizzes > Select the Quiz > Lock Review**.

[https://s3.amazonaws.com/helpscout.net/docs/assets/5fcc5d22d580ce55a38b4a61/images/5ffc652166df373cab708121/file-4OZXikL4en.png](https://s3.amazonaws.com/helpscout.net/docs/assets/5fcc5d22d580ce55a38b4a61/images/5ffc652166df373cab708121/file-4OZXikL4en.png)

* **Randomly Assign Questions:** Enable this option to assign a random set of questions to each quiz participant. Once selected, you will be prompted to specify the **Number of Questions per Quiz**.

    For example, if the number of questions per quiz is set to **10** and the quiz contains **30** questions in total, the system will automatically present **10 randomly selected questions** from the available pool to each participant.

    [![](/img/helpscout/editors/how-to-create-a-manual-quiz-5.png)](https://s3.amazonaws.com/helpscout.net/docs/assets/5fcc5d22d580ce55a38b4a61/images/5ffc663766df373cab708123/file-IlqCvP2diA.png)

    If you choose the Randomize Question by tag option, this will allow you to customize the number of questions from each tag.

* **Question skip in Quiz:** Check this option if you want to allow quiz takers to skip questions in this quiz.

    ![](/img/helpscout/editors/how-to-create-a-manual-quiz-6.png)

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

![](/img/helpscout/editors/how-to-create-an-automatic-quiz-5.png)

* **Send Notification on Assignment:** Enable this option to send a notification to users when a quiz is assigned to them.
* **Custom Email Subject:** This option allows you to define a custom subject line for the email notification sent to quiz participants. When enabled, you will be prompted to enter the subject text.
* By default, the email subject is **“New Quiz Assigned.”**

![](/img/helpscout/editors/how-to-create-a-manual-quiz-7.png)

* **Display message on completion:** Enable this option to customize the pop-up message shown to participants upon completing the quiz. When selected, you will be prompted to enter a custom completion message. By default, the message displayed is **“You have successfully completed this quiz.”**

    ![](/img/helpscout/editors/how-to-create-a-manual-quiz-8.png)

* **Show Score:** Enable or disable the display of scores to participants during or after the quiz.
* **Show Immediate Answer Feedback:** Enable this option to display answer feedback immediately after a participant attempts a question.
* **Enable Decimal Scoring:** Activate this setting to allow scores to be displayed with decimal values.
* **Send Digest Email:** Enable this option to send a summary (digest) email to users.
* **Hide Correct Answer for Incorrect Responses:** Select this option to hide the correct answer when a participant responds incorrectly.
* **Quiz Background:** Use this option to customize the background of the quiz. By default, a standard background image is applied. Editors can change the background image by clicking the **Change** button.

![](/img/helpscout/editors/how-to-create-a-manual-quiz-9.png)

* **Completion Certificate:** Enable this option to award a **certificate or badge** upon successful completion of the quiz. To select a certificate or badge, click the **“Click Here”** button. This will open a selection page where you can choose the desired badge or certificate and save your selection.

    Once a participant completes the quiz, the selected badge or certificate will be automatically assigned to them.

![](/img/helpscout/editors/how-to-create-a-manual-quiz-10.png)

* **Set Reminder:** This feature allows you to configure and schedule reminders to notify quiz participants about the status of the quiz.

![](/img/helpscout/editors/how-to-create-a-manual-quiz-11.png)

* ### [Learn How to Add a Reminder for your Quiz](https://smartwinnr.helpscoutdocs.com/article/219-how-to-set-reminder-for-quiz-survey)

  ### **Add Questions to Quiz**Once you have completed the steps to create a quiz, you can now add questions to the quiz. Select questions by searching with the different search criteria and checking the checkbox to the left of each question.  [https://s3.amazonaws.com/helpscout.net/docs/assets/5fcc5d22d580ce55a38b4a61/images/5ff0af2a495a886ca7829557/file-s5rdXN2cMA.png](https://s3.amazonaws.com/helpscout.net/docs/assets/5fcc5d22d580ce55a38b4a61/images/5ff0af2a495a886ca7829557/file-s5rdXN2cMA.png)

## **Adding Questions to the Quiz**

Once the quiz has been created, you can proceed to add questions:

* Use the available **search and filter criteria** to find relevant questions.
* Select the questions by checking the checkbox to the left of each question you want to include in the quiz.

![](/img/helpscout/editors/how-to-create-a-manual-quiz-12.png)

After selecting the questions, click **Save**. You can then proceed to assign the quiz to participants.

## Assigning the Quiz to Participants

Once you have completed the quiz creation process and added the required questions, you can assign the quiz to individual participants or groups.

* Use the available **search and filter criteria** to identify the users you want to assign the quiz to.
* Select the checkboxes next to the names of the participants.
* After selecting the participants, click the **Save** button at the bottom of the page to complete the assignment.

You may also choose to assign the quiz to a **specific group of users** (Ex: North Zone)instead of individual participants.

![](/img/helpscout/editors/how-to-create-a-manual-quiz-13.png)

[https://s3.amazonaws.com/helpscout.net/docs/assets/5fcc5d22d580ce55a38b4a61/images/5ff0af01f24ccf588e3fffb1/file-0xsIlrpkDV.png](https://s3.amazonaws.com/helpscout.net/docs/assets/5fcc5d22d580ce55a38b4a61/images/5ff0af01f24ccf588e3fffb1/file-0xsIlrpkDV.png)

On assigning the quiz to participants, a success popup message like this will show.

![](/img/helpscout/editors/how-to-create-a-manual-quiz-14.png)
