---
id: 5fd8c043b624c71b798599c8
title: How to Create a form?
description: >-
  To create a form in SmartWinnr, go to Editor >> PERFORMANCE >> Forms >>
  View All Forms.
slug: how-to-create-a-form
sidebar_position: 999
last_update:
  date: 2026-09-01
  author: Sruthi Suresh
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
  privilege: forms
tags:
  - forms
  - admin
draft: false
---

> **At a glance** - Creating a form in SmartWinnr involves specifying details, selecting form types, adding components, and assigning users.

To create a form in SmartWinnr, go to **Editor** >> **PERFORMANCE** >> **Forms** >> **View All Forms**. This will take you to a page where you can see the list of forms created by you.

Click on the **Create Form** option at the top-right corner to create a new form. This opens the **Create Form** page.

![how to create a form](/img/helpscout/authored/how-to-create-a-form-mt43kwdr.png)

You will be directed to the following screen where you will fill in the details for the form.

## Step 1: Add Name, Description, and Dates to the Form

Give a catchy name to your form and add a description. Also, set the start date and end date for your form. The form will become inactive and not be visible to users once the end date has passed.

![Give a catchy name to your form and add a description. Also, set the start date and end date for your form. The form will become inactive an](/img/helpscout/editors/how-to-create-a-form-2.png)

## Form Type

SmartWinnr allows you to create two different types of forms. The following are the two types of forms:

![tyoeforms](/img/helpscout/authored/how-to-create-a-form-mtiicken.png)

* Acknowledgement
* KPI Value Submit Form

### Acknowledgement Form

The Acknowledgment Form is a declaration form that may be used to authenticate official documents.

### KPI Value Submit Form

The KPI Value Submit Form is used to submit KPIs at multiple levels to evaluate their success in reaching targets. You can also select the competition in which the data should be added. Once you add the competition, you will be able to display this form's KPI data in the competition leaderboards.

![Select KPI mapping](/img/helpscout/authored/how-to-create-a-form-mt41kvef.png)

Selecting the KPI Value Submit Form enables the fields shown above, where the user needs to select the appropriate mapping for the KPI.

**Checklist Form**

This will help the editors create a form that enables fields with scores. The scores of the fields can be calculated and displayed in the form itself.

The fields below will be enabled for all types of forms. Select the appropriate fields for use.

![fieldof use](/img/helpscout/authored/how-to-create-a-form-mt4b3uy0.png)

**Is Edit Allowed:** If the form submission needs to be updated after submission, select this checkbox.

**Needs Approval:** Check this option if you would like to add an approver to the form submitted by users. You can make any editors or the corresponding manager of each user the approver.

**Generate PDF:** This option enables you to generate the form submission into a PDF format. You can also send the PDF automatically to the user by checking the option 'Send PDF To User Automatically'.

**Allow Visibility of Submissions:** This option helps the editor see the form submissions of users.

**Allow Comments:** This option allows editors, approvers, and managers to give feedback on their form submissions.

**Show Comments to User:** Check this option if you would like to show the feedback provided for the submissions to the users who made the form submission.

**Allow Bulk Submission:** This option helps users submit multiple forms under the same set instead of submitting one by one.

**Show Submissions To Managers:** By checking this option, the respective managers of the users will be able to see the submissions of their reportees.

**Editor Can Submit The Form:** This option allows you to submit a representative's form in case any of them face difficulty in submitting the form.

**Allow Submissions By Manager:** This allows managers to submit the form on behalf of their reportees.

**Show After Expiry in User View:** This helps to show this form in the user view even after the end date of the form has passed.

**Show After Expiry in Manager View:** This helps to show this form in the manager view even after the end date of the form has passed.

**Allow Form Submission QR-Code:** This option is for users who want to scan and submit the form.

**Allow User to Change Status:** This allows users to change the status (Pending, Approved, Rejected) of the form.

**Enable Disclaimer:** This option helps to add a disclaimer to the form. Users need to respond to the disclaimer before starting to submit the form.

**Default Date Filter:** This option allows you to set a default date range for the date filter. By default, the submissions within the specified date range will be visible to the approvers.

![Default Date Filter](/img/helpscout/editors/how-to-create-a-form-6.png)

### Submission Rules

The user needs to select the submission type, whether the submission will be of the type none, Frequency, or Count.

![The user needs to select the submission type, whether the submission will be of the type none, Frequency, or Count.](/img/helpscout/editors/how-to-create-a-form-7.png)

If you select Frequency as the Submission Type, then you have to select the submission frequency and the number of submissions allowed within that frequency.

![If you select Frequency as the Submission Type, then you have to select the submission frequency and the number of submissions allowed withi](/img/helpscout/editors/how-to-create-a-form-8.png)

If you select 'Count' as the Submission Type, then you need to provide the maximum number of submissions allowed by each user for the form.

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

- **Textbox:** Used when users need to enter a short text response, such as a few words or a brief value.
- **Textarea:** Used when users need to enter a sentence, paragraph, or detailed text response.
- **Dropdown:** Used when users need to select one value from a predefined list of options.
- **Multi Select:** Used when users need to select multiple values from a predefined list of options.
- **Time Picker:** Used when users need to select and submit a specific time.
- **Date Picker:** Used when users need to select and submit a specific date.
- **Date Time Picker:** Used when users need to select and submit both a specific date and time.
- **Heading:** Used to add a heading or title to a section and organize the content within a form or session.
- **Formula:** Used to create a field that automatically calculates a value based on a predefined formula.
- **Image:** Used when users need to upload and submit an image file.
- **PDF:** Used when users need to upload and submit a document in PDF format.
- **File:** Used when users need to upload and submit a file in any supported format.
- **Signature:** Used when users need to provide and submit their digital signature.
- **Video:** Used when users need to upload and submit a video file.

**Data Type:**

This contains the various data types for the selected field.

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

**Keep Previous Value:** This option will prepopulate the value that you selected in your previous form submission.

**Approver Can Edit:** This option will let the approver edit the field value while approving or rejecting the submission.

**Convert To Upper Case:** This will convert the value to upper case.

Once you create all the fields, you can save the form with field details. If you want to select the form submission and the pop-up, follow the steps below.

### Form Location

Select the form data location.

![create form](/img/helpscout/authored/how-to-create-a-form-mt48b6gq.png)

This field is for the data location of the form.

SmartWinnr provides you two ways to make a form submission:

1. Via **Left Menu** >> **Forms**
2. Via **Chat**

If the user selects the Chat option, a few more fields related to the chat will be triggered, as shown below.

![Select the chat settings](/img/helpscout/authored/how-to-create-a-form-mt48opb3.png)

Select the Form Submission Message type.

You can choose either a pop-up message or a sticky header to notify users of their successful submission.

**Form Submission Message**

- **Pop-up message:** A pop-up is simply a notification that communicates certain events to the user.
- **Sticky header:** A sticky header is a navigation tool that fixes the menu to the top of the screen as the user scrolls down a page.

![Sticky header: A sticky header is a navigation tool that fixes the menu to the top of the screen as the user scrolls down a page.](/img/helpscout/editors/how-to-create-a-form-24.png)

![Sticky header: A sticky header is a navigation tool that fixes the menu to the top of the screen as the user scrolls down a page.](/img/helpscout/editors/how-to-create-a-form-25.png)

After filling in the appropriate fields, click on the **Save** button.

### Adding Logic to Fields

If you want to add logic to fields, click on the **Manage Logic** button next to the field.

![enarfiled](/img/helpscout/authored/how-to-create-a-form-mtic6mdc.png)

After clicking, the following pop-up will open.

![popup](/img/helpscout/authored/how-to-create-a-form-mtic975d.png)

Then click on the **Add** button in the top right corner to add logic.

![top_right](/img/helpscout/authored/how-to-create-a-form-mticchr3.png)

If you want to pop up this field only when a reason given is equal to fever, you have to give the reason as shown below.

![fevercondition](/img/helpscout/authored/how-to-create-a-form-mticfri8.png)

If you want to make that field mandatory, check the **Make Mandatory** checkbox.

We have a list of operators as shown below:

![operators](/img/helpscout/authored/how-to-create-a-form-mtichv5x.png)

We have match types: string, number, and date.

![numberdate](/img/helpscout/authored/how-to-create-a-form-mticj2yg.png)

If you want to give multiple logic conditions, you can click **Add** to add different logics as needed. If you have more than one logic, you can use AND and OR. Use AND if both conditions need to be true to show one field, and use OR if any one logic should be true.

![dlogicaloperator](/img/helpscout/authored/how-to-create-a-form-mticypr7.png)

After adding those, click on the **Save** button.

### Step 3: Assign Users to the Form

The next step is to assign users to the form. Select the desired participants and add them to the form.

![Assign to the users](/img/helpscout/authored/how-to-create-a-form-mt48hxww.png)

You can filter these users based on the Business Unit, Country, Group, Name, Email, and Meta Tags. Once you have selected the users, click on the **Send to Selected People** button.