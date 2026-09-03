---
id: how-to-manage-query-escalation-and-turnaround-times-in-qresolve
title: "How to manage query escalation and turnaround times in QResolve"
description: "Learn how query escalation and turnaround times function in QResolve to ensure timely responses."
slug: how-to-manage-query-escalation-and-turnaround-times-in-qresolve
sidebar_position: 300
last_update:
  date: 2026-09-03
  author: Sandeep Bhuthagaddala
customProps:
  owner: sandeep.b@smartwinnr.com
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
draft: false
tags: ["qresolve"]
---

> **At a glance** - This article explains how query escalation and turnaround times work in QResolve to ensure timely follow-ups.

QResolve utilizes category-based turnaround times and escalation levels to ensure that unanswered queries are promptly addressed by the appropriate Single Points of Contact (SPOCs). Each query category has a defined turnaround time, which dictates how long the assigned SPOC has to respond before the query escalates to the next level.

## When to use this
Use this feature when you need to understand how queries are managed within QResolve, especially in situations like:
- Raising a query that requires timely attention.
- Monitoring response times from SPOCs.
- Understanding the escalation process if a query remains unanswered.
- Configuring turnaround times for different query categories.

## Steps

### 1. Understand Turnaround Time (TAT)
Each query category can have a configured turnaround time. This TAT defines the period within which the assigned SPOC must respond to the query.

### 2. Know the Initial Assignment
When you raise a query, it is first assigned to the relevant SPOC. The SPOC is responsible for reviewing and responding within the configured TAT.

### 3. Follow the Escalation Process
If the assigned SPOC does not respond within the TAT, QResolve triggers an escalation reminder. The escalation process can involve up to three levels:
- **SPOC** – The query is initially assigned to the relevant SPOC.
- **Escalation Level 1** – If there is no response, an escalation reminder is sent to the Level 1 SPOC.
- **Escalation Level 2** – If still unanswered, the query escalates to the Level 2 SPOC.
- **Escalation Level 3** – If configured, the query can escalate to the Level 3 SPOC if the previous levels do not respond.

### 4. Understand Escalation Notifications
An escalation email is sent when a query remains unanswered beyond the configured TAT. For instance, if your manager is set as an escalation-level SPOC and the query is not addressed, they may receive an escalation notification.

## Tips
- Regularly check the TAT configurations for your query categories to ensure timely responses.
- Familiarize yourself with the SPOCs assigned to your queries to facilitate better communication.
- Monitor escalation levels to understand the response dynamics within your organization.

## Things to know
:::caution
The waiting period between escalation levels is configured in the backend and may vary based on the setup.
:::