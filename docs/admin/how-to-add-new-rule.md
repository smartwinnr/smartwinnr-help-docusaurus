---
title: "How to Add new rule?"
description: ""
slug: how-to-add-new-rule
sidebar_position: 140
last_update:
  date: 2025-08-10
  author: HelpScout Migration
helpscout_id: 5fdadd747129911ba1b21dc5
helpscout_url: https://help.smartwinnr.com/article/140-how-to-add-new-rule
---
 Go to Admin>> Rules>>Add Rule.

![](https://support.smartwinnr.com/api/v1/attachments/1100)

It will open the following page.

![](https://support.smartwinnr.com/api/v1/attachments/1091)

## Rule

Object Type: It is the Object for which rule is being created, it could be a "Form Submission" or "Form" Object Type.

Admin needs to select the "Object Type" from the drop-down for which the rule has to be set.

For example On form submission, the user gets a certain number of points.

Event: It is the set of actions based on which notifications would be triggered.

Different types of events are shown below.

                                                                 ![](https://support.smartwinnr.com/api/v1/attachments/1092)

Based on the Selected Object type, "Event" dropdown elements will be loaded from which the Admin has to select the required event.

Example: For every from being created an email notification will be sent.

Status:

Rules will only be triggered if the status type is active.

Admin needs to select the status type:

* Active
* Inactive

Selected Object:

Clicking on "Selected Object " will open  the following  page

![](https://support.smartwinnr.com/api/v1/attachments/1093)

The editor needs to select the object For which the Rule is to be created.

For example, if the Selected object is Declaration form then, on submission of each "Declaration Form " email notification would be sent out to certain editors.

## Action Type

This will determine the type of action that will be triggered for an active rule. For example, sending Email notifications on each Declaration form submission or assigning certain points on successful submission of a declaration form.

Admin needs to select the "Action Type", which can be an "email" or it can be an "Assign" type where furthermore the user needs to select the Object Type:

* Point
* Badge

And fill the fields corresponding to each Object type.

## Conditions

These are the specific set of rules within rules.

![](https://support.smartwinnr.com/api/v1/attachments/1094)Field Keys

Field Key: "Approval Status" and Comparator: "Equals" and value: "OK", An email notification can be sent out or a certain number of points can be assigned.

Admin needs to select the field keys, along with the comparator type, and specify the value type.

Admin can add more than Conditions by clicking on the "Add".

After all the Fields required fields are filled, click on "Add Rule" new Rule be Added.
