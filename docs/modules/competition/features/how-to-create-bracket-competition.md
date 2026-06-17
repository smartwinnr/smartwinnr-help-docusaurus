---
id: how-to-create-bracket-competition
title: "How to create Bracket Competition"
description: "We can create bracket competition, where we can run challenges against paired participants. We can define some predefined rounds based on participants numbers."
slug: how-to-create-bracket-competition
sidebar_position: 999
last_update:
  date: 2026-06-17
  author: Vivek Kumar
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

## Steps

### 1. Navigate to the competition creation page
Access the **Create Competition** page to start setting up your bracket competition.

![How to reach to create a new competition page](/img/helpscout/authored/how-to-create-bracket-competition-mqhzxk07.png)

### 2. Select the bracket competition type
Choose the **Bracket** option to specify the type of competition you want to create.

![How to create a bracket type of competition](/img/helpscout/authored/how-to-create-bracket-competition-mqhqomuj.png)

### 3. Define rounds and winner logic
Set the number of rounds and configure how winners will be determined, including any tie-breaker rules.

![How to decide the number of rounds and winner logic setup](/img/helpscout/authored/how-to-create-bracket-competition-mqhqorpf.png)

### 4. Enable wildcard feature (optional)
In the winner logic section, you can enable the **Wildcard** checkbox. This feature allows you to bypass the standard requirement of having a power of two participants. With the wildcard feature, you can add any even number of participants to the competition. 

After the first round, you can decide the pairings and even introduce new participants if needed. This flexibility is useful for accommodating last-minute entries or adjusting the competition format based on participant availability. However, note that only the final round cannot have additional participants, ensuring a clear path to determine the ultimate winner.

### 5. Add participants as pairs
Upload or manually add participants in pairs, which can include users, managers, or groups.

![How to add participants as pairs in bracket competition](/img/helpscout/authored/how-to-create-bracket-competition-mqhqouk6.png)

## Tips
- Ensure the number of participants is a power of two unless using the wildcard feature.
- Regularly update the KPI data to reflect accurate scores for decision-making.
- Consider using different tie-breaker KPIs based on the competition's requirements.