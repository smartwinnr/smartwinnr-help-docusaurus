---
id: let-an-organization-choose-which-coachings-a-manager-dashboard-offers
title: "Let an organization choose which coachings a manager dashboard offers"
description: "Choose whether the Field Coaching dashboard shows all team coachings or only the coachings a manager runs."
slug: let-an-organization-choose-which-coachings-a-manager-dashboard-offers
sidebar_position: 247
last_update:
  date: 2026-10-30
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [field-coaching, settings, admin]
draft: true
---
{/* release-draft: tag=v3.60.08 issue=9799 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9799 */}

The Field Coaching dashboard can show coachings in two ways. You can keep the team-wide view, or narrow the picker to coachings a manager runs themselves.

Use this setting when different managers need different views of the same dashboard. One view helps you review team development across all sessions. The other helps you focus on a manager's own coaching work.

## When to use this

Use this setting when you want the coaching form picker on the Field Coaching dashboard to match how your organization uses coaching.

- Choose the team-wide view when managers need to see every coaching form used across their team.
- Choose the coach-only view when managers should see only the forms they personally coach.
- Use the setting to align one dashboard with different reporting needs.
- Check the result with real managers before you switch the organization over.

## Steps

### 1. Open the Field Coaching settings
Go to **Organization Configurations** and open the **Field Coaching** group. Find **Coaching Forms on the Manager Dashboard**.

### 2. Choose the dashboard behavior
Leave **Coaching Forms on the Manager Dashboard** set to **reportees** to keep the team-wide view. Set it to **coach** to show only the forms that manager coaches.

### 3. Review the dashboard
Open the Field Coaching dashboard again. The coaching form picker updates on the next load.

## Things to know

:::note
If the setting contains an unrecognized value, the dashboard uses the team-wide view.
:::

:::note
Only the coaching form picker follows this setting. The other dashboard panels still reflect the manager's whole team.
:::

:::caution
A manager who coaches nobody sees an empty dashboard when the setting is set to **coach**.
:::