---
id: 5fdb15d60b11ce44f63931e1
title: How to create an Individual Challenge?
description: "Create an individual challenge in KPI Gamification by following the outlined steps to engage users and effectively track their performance."
slug: how-to-create-an-individual-challenge
sidebar_position: 179
last_update:
  date: 2026-08-21
  author: Anagha Isal
source:
  helpscout_id: 5fdb15d60b11ce44f63931e1
  helpscout_url: >-
    /modules/kpi-gamification/create-and-manage/how-to-create-an-individual-challenge
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
  privilege: kpi
tags:
  - kpi
  - gamification
  - admin
draft: false
---

> **At a glance** - This article outlines the steps to create an individual challenge in the KPI Gamification module.

Creating an individual challenge allows you to engage participants in a competitive environment based on different activities such as KPIs, Quizzes, Scorecard points or Achievement Percentage. Follow these steps to set up an individual challenge effectively.

## When to use this
Use this feature when you want to:
- Create a competition between individual users.
- Set specific KPIs for tracking performance.
- Engage participants through gamification strategies.

## Steps

### 1. Navigate to Challenges
Go to **EDITOR → PERFORMANCE → Challenges**. Click on the **Create Challenge** button. This will open the page where you can fill in the details of the challenge.

![This screenshot shows the Create Challenge page](/img/helpscout/authored/how-to-create-an-individual-challenge-mt1s9i2d.png)
### 2. Fill in Challenge Details
- **Challenge Name:** Give the name of the challenge.
- **Challenge Description:** Provide a description of the challenge.
- **Send Custom Notification:**  If you would like to send notification with a custom message (instead of the default system notification) to the challenge players, you can check this checkbox and a new field comes up, where you can fill in the notification message.

![customer notification](/img/helpscout/authored/how-to-create-an-individual-challenge-mt1shs0u.png)

### 3. Fill in the Settings for your challenge

- **Challenge Type:** Specify the type of challenge. Choose 'User' to create an individual challenge, where users/individuals are paired up for the challenge.
- **Meta Tag type:** Choose the desired metatag value that should display along with the name of the player.
- **Assignment Type:** This option allows you to choose whether the challenge should be made available to players immediately or scheduled for a future date and time.
    - Send Now: Select this option to make the challenge active immediately. Players will receive a notification about the challenge as soon as it is assigned.
    - Schedule for Later:Select this option to schedule the challenge for a future date and time. When you select this option, an additional Schedule on field will appear. Select the date and time when you want the challenge notification to be sent to the players.

You can select any date from the current date up to the selected start date of the challenge. This allows you to notify players in advance while ensuring that the challenge becomes active only on its configured start date.

- **Start Date and End Date:** Specify the start and end dates for the challenge. Points or data during this date range will be considered for the challenge.

![Challenge settings](/img/helpscout/authored/how-to-create-an-individual-challenge-mt1skn9v.png)

### 4. Add activities to the challenge.

Choose the activities that you would like to include for the challenge.
![Add challenge astivities](/img/helpscout/authored/how-to-create-an-individual-challenge-mt1ua0a0.png) 

You can add different type of activities to the challenge:

![Activity type](/img/helpscout/authored/how-to-create-an-individual-challenge-mt1ubgac.png)

- **Quiz**: You can add multiple quizzes to the challeges. Points obtained by players for this quiz will be considered for the challenge.
- **KPI**: You can add multiple KPIs to the challeges. Data obtained for the selected KPIs will be considered for the challenge.
- **Scorecard points**: You can add multiple scorecards to the challenge. Total scores obtained from the selected scorecard will be considered for the challenge
- **Scorecard Achi %**: You can add multiple scorecards to the challenge. Total achieved % from the selected scorecard will be considered for the challenge.

To add more activities to your challenge, click on the '**Add**' option to the right side:

![Add more activities](/img/helpscout/authored/how-to-create-an-individual-challenge-mt1uoi2i.png)

### 4. Choose the challenge processing option

A challenge must be processed to finalize the winners. Until the challenge is processed, SmartWinnr continues to consider the points or scores earned by participants for the activities completed during the challenge period when determining the winner of each pair.

Once the challenge is processed, the results are finalized, and any additional points or scores received after processing will not be considered for determining the winners.

Processing the challenge also triggers a notification to all participants in the challenge pairs, informing them that the final winners have been announced.

You can choose from the following processing options:

- **Manually**: Select this option if you want the Editor to manually process the challenge. This allows the Editor to review and validate the available scores or KPI data for each participant before processing the challenge and announcing the winners.
- **Scheduled**: Select this option to automatically process the challenge at a specified date and time. This eliminates the need for manual intervention from the Editor and ensures that the winners are finalized and announced automatically at the scheduled time.

![process challenge](/img/helpscout/authored/how-to-create-an-individual-challenge-mt1us92b.png)

### 4. Set the Scoring rule for the challenge.

You have two options available for the scoring rule in challenge:

- **Points:** You can define the points that should be awarded for each possible outcome of the challenge:
    - **Win:** Specify the points to be awarded to the winning participant.
    - **Lose:** Specify the points to be awarded to the losing participant.
    - **Draw:** Specify the points to be awarded when both participants have the same score.
    - **No Points:** Specify the points to be given if player does not score any points/data in the challenge.

Note: Challege points will be visible only if the challengs are part of any competition. This if a user wins, points will be available in competition leaderboard after the challenge is processed.

![points for challanges](/img/helpscout/authored/how-to-create-an-individual-challenge-mt1vbv6g.png)

- **KPI:** Use this option when you want to award KPI values based on the outcome of the challenge. You can configure the KPI value to be awarded to the winner, loser, or participants in case of a draw or no-score outcome. This option allows the challenge results to contribute directly to the selected KPI.

![KPi data for challenge](/img/helpscout/authored/how-to-create-an-individual-challenge-mt1vei8z.png)

### 5. Select Challenge Pairs

The **Challenge Pairs** section allows you to select the participants who will compete against each other in the challenge.

![Challenge pairs](/img/helpscout/authored/how-to-create-an-individual-challenge-mt1vrw81.png)

Click **Add Pair** to create a new pair of competitors. You can then select the participants who will compete against each other. Once you have selected the two participants, click **Add** to add the pair to the challenge.

![Add Pair](/img/helpscout/authored/how-to-create-an-individual-challenge-mt1vudyq.png)
Since you have selected Challenge Type as User, you can select individual users as the participants for each pair.

You can create multiple pairs by uploading pairs in bulk using the **'Upload Pairs'** Option. All the pairs added to the challenge will be displayed in this section, where you can review the participants before creating the challenge.

You can use the following options to manage the pairs:

- Add Pair: Add a new pair of participants to the challenge.
- Upload Pairs: Upload multiple challenge pairs at once.
- Remove All: Remove all the pairs added to the challenge.
- Delete: Remove an individual pair from the list.

Note: Each pair represents two participants who will compete against each other. Make sure all the required pairs are added correct before clicking Create to set up the challenge.

### 6. Create the Challenge
Finally, click on the **Create** button at the bottom, which will successfully create the challenge.