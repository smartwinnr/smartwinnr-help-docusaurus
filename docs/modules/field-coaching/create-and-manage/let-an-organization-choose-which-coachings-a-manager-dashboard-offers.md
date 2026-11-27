---
id: how-to-configure-coaching-forms-on-the-manager-dashboard
title: "How to configure coaching forms on the manager dashboard"
description: "Choose whether the Field Coaching dashboard shows every team coaching form or only the forms a manager coaches."
slug: how-to-configure-coaching-forms-on-the-manager-dashboard
sidebar_position: 247
last_update:
  date: 2026-11-01
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [field-coaching, settings, admin]
draft: true
---
{/* release-draft: tag=v3.60.10 issue=9799 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9799 */}

The Field Coaching dashboard uses a setting to control which coaching forms appear in the manager dashboard picker.

Leave the setting on **reportees** to show every form used across the manager's team. Set it to **coach** to show only the forms that manager coaches. The change appears the next time you open the Field Coaching dashboard.

## When to use this

Use this setting when different managers need different views of the same coaching dashboard.

- Choose the team-wide view when managers need to see every coaching form used across their team.
- Choose the coach-only view when managers should see only the forms they personally coach.
- Use the setting to match the dashboard to different reporting needs.
- Check the result with real managers before you switch an organization over.

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