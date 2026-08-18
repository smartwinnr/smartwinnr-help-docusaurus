---
id: how-to-create-bracket-competition
title: "How to create Bracket Competition?"
description: "Create a bracket competition to organize challenges between paired participants, defining rounds and winner logic based on participant numbers."
slug: how-to-create-bracket-competition
sidebar_position: 999
last_update:
  date: 2026-08-18
  author: Anagha Isal
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
  privilege: competitions
tags: [competiition, challenge, bracket]
draft: false
---

> **At a glance** - Create a bracket competition to run challenges between paired participants, defining rounds based on participant numbers.

A bracket competition allows you to organize challenges with a fixed number of participants, typically in powers of two (e.g., 128, 64, 32). Participants compete in pairs, with winners advancing to the next round until a final winner is determined. You can set up rules for how winners are decided, including tie-breaker logic based on KPI data.

## When to use this

Use bracket competitions when you want to:

- Organize challenges with a clear elimination format.
- Pair participants based on predefined rounds.
- Manage competitions using KPI and Scorecard data.

## Before you start

Ensure you have the necessary permissions to create competitions and access to the relevant participant data.

## Steps

### 1. Navigate to the competition creation page

Access the **Create Competition** page to start setting up your bracket competition.

![How to reach to create a new competition page](/img/helpscout/authored/how-to-create-bracket-competition-mqhzxk07.png)

### 2. Select the bracket competition type

Choose the **Bracket** option to specify the type of competition you want to create. This selection sets the foundation for how participants will be paired and compete.

![How to create a bracket type of competition](/img/helpscout/authored/how-to-create-bracket-competition-mqhqomuj.png)

### 3. Define rounds and winner logic

Set the number of rounds for the competition and configure how winners will be determined. You can establish specific criteria for winning, including any tie-breaker rules that may apply. This ensures that every match has a clear outcome, even in the event of a tie.

![How to decide the number of rounds and winner logic setup](/img/helpscout/authored/how-to-create-bracket-competition-mqhqorpf.png)

### 4. Enable wildcard feature (optional)

In the winner logic section, you can enable the **Wildcard** checkbox. This feature allows you to bypass the standard requirement of having a power of two participants. With the wildcard feature, you can add any even number of participants to the competition.

After the first round, you have the flexibility to decide the pairings and even introduce new participants if needed. This flexibility is useful for accommodating last-minute entries or adjusting the competition format based on participant availability. However, note that only the final round cannot have additional participants, ensuring a clear path to determine the ultimate winner.

### 5. Add participants as pairs

Upload or manually add participants in pairs, which can include users, managers, or groups. Ensure that each pair is correctly matched to facilitate smooth progression through the rounds.

![How to add participants as pairs in bracket competition](/img/helpscout/authored/how-to-create-bracket-competition-mqhqouk6.png)

## Tips

- Ensure the number of participants is a power of two unless using the wildcard feature.
- Regularly update the KPI data to reflect accurate scores for decision-making.
- Consider using different tie-breaker KPIs based on the competition's requirements.

Once the competition is set up and live for the players, after each round is completed based on the date range fixed for each round, you need to process the round to publish the winners. Once the round is processed, the winners from the processed round will be moved to the next round of the game.

![Process round](/img/helpscout/authored/how-to-create-bracket-competition-msylf09b.png)

Following is how the pairs and winners find the game leaderboard in their SmartWinnr account in user view:

![Describe this screenshot](/img/helpscout/authored/how-to-create-bracket-competition-msylvwv5.png)