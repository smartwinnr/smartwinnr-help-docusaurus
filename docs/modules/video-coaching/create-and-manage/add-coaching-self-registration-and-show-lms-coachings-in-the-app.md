---
id: add-coaching-self-registration-and-show-lms-coachings-in-the-app
title: "Add coaching self registration and show LMS coachings in the app"
description: "Let learners join a coaching from a shared link and make LMS coachings visible in the SmartWinnr app."
slug: add-coaching-self-registration-and-show-lms-coachings-in-the-app
sidebar_position: 316
last_update:
  date: 2026-09-10
  author: release-pipeline@smartwinnr.com
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: [video-coaching]
draft: true
---
{/* release-draft: tag=v3.58.94 issue=9586 url=https://git.mobillionlabs.com/quizprompt/newquiz/-/issues/9586 */}

> **At a glance** - Use self registration when you want learners to join a coaching from a shared link. Use the LMS app setting when you want assigned learners to see a coaching in the SmartWinnr app too.

Self registration lets learners join a coaching without being assigned one by one. You can share a coaching link, and learners in the coaching's division who open it are enrolled as participants automatically. You can also choose where their coaches come from and limit registration to specific sub-divisions.

For LMS-integrated coachings, you can choose to show the coaching in the SmartWinnr app as well as in the LMS. That helps assigned learners start from the app while keeping the LMS integration in place.

## When to use this

Use self registration when you want a simple way to open a coaching to a group of learners.

- You are running an onboarding session.
- You are launching a product and want one link for everyone.
- You want learners to join from their own division without manual assignment.
- You want assigned learners to open an LMS coaching in the app too.

## Before you start

- The coaching option may not be visible to everyone. If you do not see it, contact SmartWinnr support.

## Steps

### 1. Open the coaching settings
Go to **Coaching** and open an existing coaching, or create a new one. On step 1, expand **Extras and integrations** to find the **Self Registration** section.

![Coaching settings with Extras and integrations on step 1](<image url>)

### 2. Turn on self registration
Select **Allow Self Registration** to let learners join from the coaching link. When someone in the coaching's division opens the link, SmartWinnr enrolls them as a normal participant automatically.

### 3. Choose registration coaches
Under **Assign Registration Coaches**, choose where the coaches for a registering learner come from. You can use the default coach only, named coaches only, the reporting manager, or the manager plus named coaches.

If you add named coaches, list them in the order you want them assigned.

### 4. Open more options
Open **More Options** to set a fallback coach and limit registration to specific sub-divisions. Use this when you want tighter control over who can join and who gets assigned.

### 5. Save the coaching
Select **Save** to apply the self registration settings.

### 6. Copy the coaching link
Open the coaching's view page and select **Coaching Link** to copy the link. Share it with the learners you want to register.

![Coaching view page with Coaching Link button](<image url>)

### 7. Show an LMS coaching in the app
For an LMS-integrated coaching, turn on **Integrate with LMS** and select **Show Coaching in App**. Save the coaching to make it visible in the SmartWinnr app for assigned learners who have not started yet.

## Things to know

:::note
Self-registered learners appear with a **Self Registered** badge on the **Coaches** and **Participants** pages.
:::

:::note
Each coach receives a notification when someone joins through self registration.
:::

:::note
The number of coaches assigned to a self-registered learner depends on your organization limit.
:::

:::note
**Show Coaching in App** affects learners who have not started yet. Learners who already started or finished keep their current visibility.
:::

:::note
Self registration and LMS integration serve different purposes. Use self registration for open enrollment, and use LMS integration for catalog-based delivery.
:::