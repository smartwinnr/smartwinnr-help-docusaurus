---
id: 5fd8c043b624c71b798599c8
title: How to Create a form?
description: >-
  To create a form in SmartWinnr, go to Editor >> PERFORMANCE >> Forms >>
  View All Forms.
slug: how-to-create-a-form
sidebar_position: 999
last_update:
  date: 2026-08-22
  author: Aswani TK
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
  privilege: forms
tags:
  - forms
  - admin
draft: false
---

> **At a glance** - Creating a form in SmartWinnr involves specifying details, selecting form types, adding components, and assigning users.

To create a form in SmartWinnr, go to **Editor** >> **PERFORMANCE** >> **Forms** >> **View All Forms**. It will take you to the following page where you can see the list of forms created by you.

Click on the **Create Form** option at the top-right corner to create a new one. It opens the **Create Form** page.

![how to create a form](/img/helpscout/authored/how-to-create-a-form-mt43kwdr.png)

It will take you to the following screen where you will fill in the details for the form.

## Step 1: Add Name, Description, and Dates to the Form

Give a catchy name to your form and add a description. Also, set the start date and end date for your form. The form will become inactive and not be visible to the users once the end date has passed.

![Give a catchy name to your form and add a description. Also, set the start date and end date for your form. The form will become inactive an](/img/helpscout/editors/how-to-create-a-form-2.png)

## Form Type

SmartWinnr allows you to create two different types of forms. The following are the two types of forms:

* Acknowledgement
* KPI Value Submit Form

### Acknowledgement Form

The Acknowledgement Form is a declaration form that may be used to authenticate official documents.

![Acknowledgment Form is a declaration form that may be used to authenticate official documents.](/img/helpscout/editors/how-to-create-a-form-3.png)

### KPI Value Submit Form

The KPI Value Submit Form is used to submit KPIs at multiple levels to evaluate their success in reaching targets. You can also select the competition in which the data should be added. Once you add the competition, you will be able to display this form KPI data in the competition leaderboards.

![Select KPI mapping](/img/helpscout/authored/how-to-create-a-form-mt41kvef.png)

Selecting the KPI Value Submit Form enables the above-shown fields where the user needs to select the appropriate mapping for the KPI.

The fields below will be enabled for both Acknowledgement Form type and KPI Value Submit Form type. Select the appropriate fields of use.

![Form Settings](/img/helpscout/authored/how-to-create-a-form-mt41qtni.png)

**Is Edit Allowed:** If the form submission needs to be updated after submission, then select this checkbox.

**Needs Approval:** Check this option if you would like to add an approver to the form submitted by users. You can make any editors or the corresponding manager of each user the approver.

**Generate PDF:** This option enables you to generate the form submission into a PDF format. You can also send the PDF automatically to the user by checking the option 'Send PDF To User Automatically'.

**Allow Visibility of Submissions:** This option helps the editor to see the form submissions of users.

**Allow Comments:** This option allows editors, approvers, and managers to give feedback on their form submissions.

**Show Comments to User:** Check this option if you would like to show the feedback provided for the submissions to the users who made the form submission.

**Allow Bulk Submission:** This option helps users submit a number of forms under the same set together instead of submitting one by one.

**Show Submissions To Managers:** By checking this option, the respective managers of the users will be able to see the submissions of their reporters.

**Editor Can Submit The Form:** This option allows you to submit a representative's form in case any of them face difficulty in submitting the form.

**Allow Submissions By Manager:** It allows managers to submit the form on behalf of their reportees.

**Show After Expiry in User View:** It helps to show this form in the user view even after the end date of the form has passed.

**Show After Expiry in Manager View:** It helps to show this form in the manager view even after the end date of the form has passed.

**Allow Form Submission QR-Code:** This option is for users who want to scan and submit the form.

**Allow User to Change Status:** It allows users to change the status (Pending, Approved, Rejected) of the form.

**Enable Disclaimer:** This option helps to add a disclaimer in the form. The users need to respond to the disclaimer before starting to submit the form.

**Default Date Filter:** This option allows you to set a default date range for the date filter. By default, the submissions within the specified date range will be visible to the approvers.

![Default Date Filter](/img/helpscout/editors/how-to-create-a-form-6.png)

### Submission Rules

The user needs to select the submission type, whether the submission will be of the type none, Frequency, or Count.

![The user needs to select the submission type, whether the submission will be of the type none, Frequency, or Count.](/img/helpscout/editors/how-to-create-a-form-7.png)

If you select Frequency as the Submission Type, then you have to select the submission frequency and the number of submissions allowed within the frequency.

![If you select Frequency as the Submission Type, then you have to select the submission frequency and the number of submissions allowed withi](/img/helpscout/editors/how-to-create-a-form-8.png)

If you select 'Count' as the Submission Type, then you need to provide the maximum number of submissions allowed by each user for the Form.

![If you select 'Count' as the Submission Type, then you need to provide the maximum number of submissions allowed by each user for the Form.](/img/helpscout/editors/how-to-create-a-form-9.png)

### Notification Setting

This feature enables you to notify users and approvers with comments or the status of their form submissions.

![Notification Settings](/img/helpscout/authored/how-to-create-a-form-mt435vs6.png)

There are two types of notifications:

**Notification:** If you need to notify users through a push notification, select the type as 'Notification', then you have to choose a trigger. For example, if you choose 'Approved' as the notification trigger, then users will be notified every time the approver approves their forms.

**Email:** You can also notify users through email by choosing the 'Email' option as the notification type.

More than one notification type can be added by clicking on the **Add More** option.

### Step 2: Add Form Components

Once you have completed the first step in creating a form, it will take you to the following page where you can add fields to the form.

![Add fields](/img/helpscout/authored/how-to-create-a-form-mt438ztb.png)

Users can specify the components of the form here. You can also add fields by clicking on the **Add Field** option at the top right corner.

**Field Type:**

Forms support different types of fields like textbox, dropdown, date picker, etc. This contains various field types as shown below.

![field types](/img/helpscout/authored/how-to-create-a-form-mt43fpxe.png)

**Data Type:**

This contains the various data types for the field selected.

![data types](/img/helpscout/authored/how-to-create-a-form-mt43g6br.png)

**Advanced Form Options**

Click on **Advanced** in the form components. You will see the following options:

**Type**

This is the type of data, whether it will be Blank, Pre Populated, or Lookup Field.

![Data population- Types](/img/helpscout/authored/how-to-create-a-form-mt43smhl.png)

- **Blank:** Select this if the user wants to input the values by typing, selecting dropdown values, selecting and submitting files, etc.
- **Pre Populated:** Select this if the system needs to select and display any profile details of the users.
- **Lookup Field:** If the values need to be taken from contact data uploaded to the system.
- **Combine Field Data with Date:** If the data needs to be combined with the date.

![Data Source](/img/helpscout/authored/how-to-create-a-form-mt478kt7.png)

Data source can be:

- **User:** If the details should come from the user profile.
- **Date:** If the data is a date.
- **Constant:** If the data is a constant value.
- **System Generated:** If the data needs to be any random value that the system generates.
- **Contact:** If the data should come from contact data.

![Data Field](/img/helpscout/authored/how-to-create-a-form-mt47n3bs.png)

This will have the user profile details if you want to select which field to be displayed in the textbox.

![Advanced options](/img/helpscout/authored/how-to-create-a-form-mt47t1n0.png)

**Default Value Override:** This option allows users to override the prepopulated values of the field.

**Field Visibility:** Field visibility conditions allow you to display the selected field to users while making a form submission.

**List Visibility:** This option allows you to display the selected field to users in the form submission list page.

**Admin Visibility:** Admin visibility allows you to display the selected field to admins in the form analytics page.

**Keep Previous Value:** This option will prepopulate the value which you selected in your previous form submission.

**Approver Can Edit:** This option will let the approver edit the field value while approving or rejecting the submission.

**Convert To Upper Case:** This will convert the value to upper case.

Once you create all the fields, you can save the form with field details. If you want to select the form submission and the pop-up, follow the below steps.

### Form Location

Select the form data location.

![create form](/img/helpscout/authored/how-to-create-a-form-mt48b6gq.png)

This field is for the data location of the form.

SmartWinnr provides you two ways to make a form submission:

1. Via **Left Menu** >> **Forms**
2. Via **Chat**

If the user selects the Chat option, a few more fields related to the chat get triggered, as shown below.

![Select the chat settings](/img/helpscout/authored/how-to-create-a-form-mt48opb3.png)

Select the Form Submission Message type.

You can choose either a pop-up message or a sticky header to notify users of their successful submission.

**Form Submission Message**

- **Pop-up message:** A pop-up is simply a notification that communicates certain events to the user.
- **Sticky header:** A sticky header is a navigation tool that fixes the menu to the top of the screen as the user scrolls down a page.

![Sticky header: A sticky header is a navigation tool that fixes the menu to the top of the screen as the user scrolls down a page.](/img/helpscout/editors/how-to-create-a-form-24.png)

![Sticky header: A sticky header is a navigation tool that fixes the menu to the top of the screen as the user scrolls down a page.](/img/helpscout/editors/how-to-create-a-form-25.png)

After filling in the appropriate fields, click on the **Save** button.

### Step 3: Assign Users to the Form

The next step is to assign users to the form. Select the desired participants and add them to the form.

![Assign to the users](/img/helpscout/authored/how-to-create-a-form-mt48hxww.png)

You can filter these users based on the Business Unit, Country, Group, Name, Email, and Meta Tags. Once you have selected the users, click on the **Send to Selected People** button.