---
id: how-to-manually-update-competition-leaderboard-scores
title: "How to Manually Update Competition Leaderboard Scores"
description: "Update participant or team scores on a competition leaderboard when a score needs correction."
slug: how-to-manually-update-competition-leaderboard-scores
sidebar_position: 30
last_update:
  date: 2026-09-29
  author: Sandeep Bhuthagaddala
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: ["competition"]
draft: true
---

> **At a glance** - Use **Fix Leaderboard** to correct a competition score for one participant or one team. Choose the competition, pick the leaderboard view, update the score, and save.

Competition leaderboards usually update automatically from competition activities and scoring rules. Use manual updates when you need to correct a participant score or adjust a team score.


This article explains how to: 

- Understand automated vs. manual competition scoring 
- Update scores in the Participants Leaderboard 
- Update scores in the Team Wise Leaderboard 
- Modify or correct an existing score 
- Understand the available leaderboard operations 

## 1. Competition Leaderboard Scoring 

In SmartWinnr, competition scores are generally calculated and updated automatically based on the activities and scoring criteria configured for the competition. 

As participants complete the relevant activities and earn points, their scores are reflected on the competition leaderboard. 

SmartWinnr provides two leaderboard views: 

## Participants Leaderboard 

The Participants Leaderboard displays the score of each individual participant in the competition. 

It allows administrators to view the performance and score of individual users participating in the competition. 


## Team Wise Leaderboard 

The Team Wise Leaderboard displays the combined score of participants belonging to each Group. 

The team score is calculated based on the scores earned by the participants assigned to that group. 

**Note:** Team scores are automatically calculated based on the scores of the participants assigned to the respective team. No separate score calculation is required after teams and participants have been configured. 


## 2. Automated Scoring vs. Manual Score Updates 

There are two ways competition leaderboard scores can be managed: 

## Automated Scoring 

In the standard competition flow, scores are updated automatically based on the activities performed by participants and the scoring rules configured for the competition. 

For example, if a participant completes an activity that is configured to award 10 points, the participant's score is automatically updated accordingly. 

This is the recommended approach when the competition is configured to calculate scores based on SmartWinnr activities. 

### Manual Score Update 

Administrators can manually modify leaderboard scores when an existing score needs to be corrected or adjusted. 

For example, manual score updates may be required when: 
- A participant's score needs to be corrected. 
- A score needs to be adjusted based on an external validation. 
- A team or participant has received an incorrect score. 
- An administrator needs to make a specific leaderboard correction. 

Manual updates can be performed for both: 
- Participants Leaderboard – individual participant scores 
- Team Wise Leaderboard – Group-level scores 

 ## 3. Manually Updating a Participant's Score 

To manually update the score of an individual participant: 

**Step 1:** Navigate to Fix Leaderboard 

Go to: Admin → Fix Leaderboard 


**Step 2:** Select the Leaderboard Type 

On the Fix Leaderboard page, select the leaderboard type that you want to modify. 

Since the score needs to be updated for a competition, 

 select: Leaderboard Type → Competition Leaderboard.

**Step 3:** Select the Competition 

After selecting Competition Leaderboard, select the competition for which the score needs to be modified. 

Select: **Competition → [Required Competition]** 

The leaderboard options associated with the selected competition will then be displayed. 

Under Leaderboard, you will find the available leaderboard views for the selected competition: 

**By Participants–** used to manage individual participant scores 

**By Team–** used to manage team-level scores 

To update an individual participant's score,  

select: By Participants  

**Step 4: Select the Participant** 

After selecting Participants Leaderboard, the list of participants associated with the competition will be displayed. 

Select the participant whose score needs to be updated by clicking the edit next to the user name. 

After selecting the participant, the Edit Leaderboard – [Participant Name] section will be displayed. 

Under Operations, you will find options to define how the leaderboard data should be modified. 

The available fields include: 
- **Operation Type**
- **Data Operation Type**

Select the appropriate operation based on the required score correction. 

For example: 

**Operation Type → Update** 

**Data Operation Type → Update Score** 

This option can be used when you want to update the participant's existing score. 

**Step 5: Update the Score** 

After selecting: 

**Operation Type → Update** 

and 

**Data Operation Type → Update Score** 

the Scores section will be displayed, allowing you to modify the participant's existing score.  

Enter the required updated score in the Scores field. 

*Example:*

For Vikrant Kasthurirangan, the existing score is 150. If the score needs to be increased by 1 point, update the score from 150 to 151. 

After entering the updated score, review the value and proceed to save the changes. 

**Step 6: Save the Changes** 

After entering the required score, save/update the leaderboard information. 

The updated score will be reflected for the selected participant in the competition leaderboard. 


**Important:** Manual leaderboard updates modify the competition leaderboard data for the selected participant. Verify the participant and score before saving the changes. 
 

## 4. Manually Updating a Group Score

The same process can be used to update scores at the group level. 

To update a team's competition leaderboard score: 

**Step 1:** Navigate to Fix Leaderboard 

Go to: Admin → Fix Leaderboard 

**Step 2:** Select Competition Leaderboard 

Under Leaderboard Type, select:**Competition Leaderboard** 

**Step 3: Select the Competition** 

Select the competition for which the team score needs to be updated. 

Competition → [Required Competition] 

**Step 4: Select Team Wise Leaderboard** 

Under Leaderboard, select: **Group Wise Leaderboard** 

This option allows you to manage leaderboard data at the team level. 

**Step 5: Select the Team** 

After selecting Team Wise Leaderboard, the teams associated with the selected competition will be displayed. 

Select the team for which the score needs to be modified. 

**Step 6: Select the Required Operation** 

After selecting the team, the Edit Leaderboard – [Group Name] section will be displayed. 

Under Operations, select the required options. 

For example: 

**Operation Type → Update**

**Data Operation Type → Update Score** 

**Step 7: Update the Team Score** 

Under the Scores section, enter the required score value. 

Review the updated value and save the changes. 

The updated score will then be reflected in the selected team's competition leaderboard. 

:::warning
Manual leaderboard updates change the selected leaderboard entry directly. Verify the participant, team, and score before you save.
:::

:::note
Team scores are based on the scores of participants assigned to that group.
:::