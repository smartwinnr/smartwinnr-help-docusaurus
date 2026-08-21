---
id: 5fdb1646a5d295659b369c8d
title: How to create a Group Challenge?
description: "Create a group challenge in SmartWinnr by following the outlined steps to foster teamwork and motivation among employees."
slug: how-to-create-a-group-challenge
sidebar_position: 180
last_update:
  date: 2026-08-21
  author: Anagha Isal
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
  privilege: kpi
tags:
  - kpi
  - gamification
  - admin
draft: false
---

> **At a glance** - This article outlines the steps to create a group challenge in the SmartWinnr platform.

Creating a group challenge allows you to engage teams in a competitive environment, fostering motivation and performance. Follow the steps below to set up a group challenge effectively.

## When to use this
Use this feature when you want to:
- Encourage teamwork and collaboration through challenges.
- Motivate employees to achieve specific KPIs.
- Create a competitive atmosphere within your organization.

## Steps

### 1. Navigate to the Challenges page
Go to **EDITOR > PERFORMANCE > Challenges**. Click on the **Create Challenge** button. This will open the page where you can fill in the details of the challenge.

![This screenshot shows the Create Challenge page](/img/helpscout/authored/how-to-create-a-group-challenge-mt2ten3v.png)

### 2. Fill in Challenge Details

- **Challenge Name:** Give the name of the challenge.
- **Challenge Description:** Provide a description of the challenge.
- **Send Custom Notification:**  If you would like to send notification with a custom message (instead of the default system notification) to the challenge players, you can check this checkbox and a new field comes up, where you can fill in the notification message.

![customer notification](/img/helpscout/authored/how-to-create-an-individual-challenge-mt1shs0u.png)


### 3. Fill in the Settings for your challenge

- **Challenge Type**: Specify the type of challenge you are creating. You have three options: User, Manager, and Group. Select **Group** to create a group challenge, where teams/groups are paired up for the challenge.
- **Calculation Type**:For team challenge, you can define whether the score for each team will be based on the sum of scores or average of scores. When we have uneven number of members in each team/group, you can choose the calculation type as 'Average'.
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

### 5. Choose the challenge processing option

A challenge must be processed to finalize the winners. Until the challenge is processed, SmartWinnr continues to consider the points or scores earned by participants for the activities completed during the challenge period when determining the winner of each pair.

Once the challenge is processed, the results are finalized, and any additional scores or KPI value received after processing will not be considered for determining the winners.

Processing the challenge also triggers a notification to all participants in the challenge pairs, informing them that the final winners have been announced.

You can choose from the following processing options:

- **Manually**: Select this option if you want the Editor to manually process the challenge. This allows the Editor to review and validate the available scores or KPI data for each team before processing the challenge and announcing the winners.

- **Scheduled**: Select this option to automatically process the challenge at a specified date and time. This eliminates the need for manual intervention from the Editor and ensures that the winners are finalized and announced automatically at the scheduled time.

![process challenge](/img/helpscout/authored/how-to-create-an-individual-challenge-mt1us92b.png)

### 6. Set the Scoring rule for the challenge.

![Scoring for group challenge](/img/helpscout/authored/how-to-create-a-group-challenge-mt3368du.png)

You have two options available for the scoring rule in challenge:

- **Points:** You can define the points that should be for each possible outcome of the challenge:
    - **Win:** Specify the points to be awarded to the winning team.
    - **Lose:** Specify the points to be awarded to the losing team.
    - **Draw:** Specify the points to be awarded when both teams have the same score.
    - **No Points:** Specify the points to be given if team does not score any points/data in the challenge.

Note: Challege points will be visible only if the challengs are part of any competition. This if a team wins, points will be available in competition leaderboard after the challenge is processed.

- **KPI:** Use this option when you want to award KPI values based on the outcome of the challenge. You can configure the KPI value to be awarded to the winner, loser, or team in case of a draw or no-score outcome. This option allows the challenge results to contribute directly to the selected KPI.

![assign points](/img/helpscout/authored/how-to-create-a-manager-challenge-mt38mfu9.png)

**Assign Points To**: This is an option available for Team challenge where you can define whether the points/KPI value should be awared to all team members or members who have scored in the challenge activities.

![Assign points to field](/img/helpscout/authored/how-to-create-a-group-challenge-mt338ruv.png)

### 7. Select Challenge Pairs

The **Challenge Pairs** section allows you to select the teams/groups who will compete against each other in the challenge.

![Challenge pairs](/img/helpscout/authored/how-to-create-a-group-challenge-mt35juz1.png)

Click **Add Pair** to create a new pair of teams. You can then select the teams who will compete against each other. Once you have selected the two teams, click **Add** to add the pair to the challenge.

![Add pairs](/img/helpscout/authored/how-to-create-a-group-challenge-mt35ltzd.png)

Since you have selected Challenge Type as Group, you can select groups/teams as the players for each pair.

You can create multiple pairs by uploading pairs in bulk using the **'Upload Pairs'** Option. All the pairs added to the challenge will be displayed in this section, where you can review the pairs before creating the challenge.

You can use the following options to manage the pairs:

- Add Pair: Add a new pair of teams to the challenge.
- Upload Pairs: Upload multiple challenge pairs at once.
- Remove All: Remove all the pairs added to the challenge.
- Delete: Remove an individual pair from the list.

When you need to create a challenge with a large number of teams, its best to add pairs using the the **'Upload Pairs'** option.

Following is how you can upload pairs for the challenge:

Select **Upload Pair** option under the section 'Select Challenge Pairs'.

![Upload pairs](/img/helpscout/authored/how-to-create-an-individual-challenge-mt35b587.png)

It will open the following pop-up window where you can download the sample template and upload the pairs for the challenge.

![Upload challenge pairs.](/img/helpscout/authored/how-to-create-an-individual-challenge-mt35f2wp.png)

- Challenge Type: Displays the type of challenge such as User, Group or Manager.
- CSV Delimiter: Select the delimiter used in your CSV file.
- Sample CSV: Click Sample CSV to download a sample file and use it as a reference when preparing your upload file.
- Choose File: Select the prepared CSV file containing the challenge pairs from your device. Ensure that the column heading matches with the sample CSV downloaded.
- Upload: Upload the selected CSV file and validate the pair information.
- Add: Once the file has been uploaded successfully, click Add to add the pairs to the challenge.

Note: Make sure the CSV file follows the required format and uses the selected delimiter before uploading it.

Note: Each pair represents two teams who will compete against each other. Make sure all the required pairs are added correct before clicking Create to set up the challenge.

### 8. Create the Challenge
Finally, click on the **Create** button at the bottom, which will successfully create the challenge.