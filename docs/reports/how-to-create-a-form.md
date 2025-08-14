---
title: "How to Create a form?"
description: ""
slug: how-to-create-a-form
sidebar_position: 93
last_update:
  date: 2025-08-10
  author: HelpScout Migration
helpscout_id: 5fd8c043b624c71b798599c8
helpscout_url: https://help.smartwinnr.com/article/93-how-to-create-a-form
---
To create a form in SmartWinnr, go to Editor >>PERFORMANCE >> Forms >> View All Forms. It will take you to the following page where you can see the list of forms created by you.

Click on Create Form option at the top-right corner to create a new one. It opens the Create Form page.

![](/img/reports/helpscout-image-f1e3b615.png)

It will take you to the following screen where you will fill in the details for the Form.

### Step-1: Add Name, Description, and Dates to the Form

Give a catchy name to your form and add a description. Also, set the start date and end date for your form. The form will become inactive and not be visible to the users once the end date is passed.

![](/img/reports/helpscout-image-2a0ccac7.png)

## Form Type

SmartWinnr allows you to create two different types of forms. Following are the two types of forms:

* Acknowledgement
* KPI Value Submit Form

### Acknowledgement Form

Acknowledgment Form is a declaration form that may be used to authenticate official documents.

![](/img/reports/helpscout-image-0421f800.png)

### **KPI Value Submit Form**

KPI Value Submit Form is a type of Form which is used to submit KPIs at multiple levels to evaluate their success at reaching targets

![](https://support.smartwinnr.com/api/v1/attachments/1033)

Selecting the KPI Value Submit Form enables the above-shown fields where the user needs to select the appropriate mapping for the KPI.

The below fields will be enabled for both Acknowledgement Form type as well as KPI Value Submit Form type

Select the appropriate fields of use.

![](/img/reports/helpscout-image-26d8775a.png)

**Needs Approval:** Check this option, if you would like to add an approver to the form submitted by users. You can make any editors or the corresponding manager of each user as the approver.

**Generate PDF:** This option enables you to generate the form submission into a PDF format. Also, you can send the PDF automatically to the user by checking the option 'Send PDF To User Automatically'.

**Allow Visibility of Submissions:** This option helps the editor to see the form submissions of users.

**Allow Comments:** This option allows editors, approvers and managers to give feedback on their form submissions.

**Show Comments to User:** Check this option if you would like to show the feedbacks provided for the submissions to the users who made the form submission.

**Allow Bulk Submission:** This option helps the users to submit a number of forms under the same set together instead of submitting one by one.

**Show Submissions To Managers:** By checking this option, the respective managers of the users will be able to see the submissions of their reporters.

**Editor Can Submit The Form:** This option allows you to submit a representative's form in case if any of them face any difficulty in submitting the form.

**Default Date Filter:** This option allows you to set a default date range for the date filter. By default, the submissions within the specified date range will be visible to the approvers.

![](/img/reports/helpscout-image-fd7853ad.png)

### Submission Rules

The user needs to select the submission type, whether the submission will be of the type none, Frequency, or Count.

                                                                  ![](/img/reports/helpscout-image-e563e9eb.png)  

If you select Frequency as the Submission Type, then you have to select the submission frequency and the number of submissions allowed within the frequency.

![](/img/reports/helpscout-image-f5a4b7a0.png)  
If you select 'Count' as the Submission Type, then you need to provide the maximum number of submissions allowed by each user for the Form.

![](/img/reports/helpscout-image-8e9fcaac.png)

### Notification Setting

This feature enables you to notify the users and approvers with comments or the status of their form submissions. ![](https://support.smartwinnr.com/api/v1/attachments/1026) Select the type of notification from the drop-down list.

There are three types of notifications :

                                                                           ![](https://support.smartwinnr.com/api/v1/attachments/1027)

**Notification:** If you need to notify the users through a push notification, select the type as 'Notification' then you have to choose a trigger. For example, if you choose 'Approved' as the notification trigger, then the users will be notified every time when the approver approves their forms.

**Email:** You can also notify the users through email by choosing the 'Email' option as the notification type.

![](/img/reports/helpscout-image-808e9066.png)

More than one notification type can be added by clicking on the Add More option.

### Step-2: Add Form Components

Once you have completed the first step in creating a Form, it will take you to the following page where you can add fields to the form.

![](/img/reports/helpscout-image-85b9b941.png)  

Users can specify the components of the form here.

The user can also add the fields by clicking on the 'Add Field' option on the top right corner.

**Field Type:**

Forms support different types of fields like textbox, dropdown, date picker, etc, This contains various field types as shown below.

                                                                   \\          ![](https://support.smartwinnr.com/api/v1/attachments/1016)

**Data Type:**

This contains the various data type for the field selected.

                                                                              ![](https://support.smartwinnr.com/api/v1/attachments/1017)

**Advanced Form Options**

Click on Advanced in the Form components

You get the following:

![](https://support.smartwinnr.com/api/v1/attachments/1042)**Type**

This is the type of data, whether it will be Blank, Pre Populated, Lookup Field.

This will have the following  options  :

                                                                   ![](https://support.smartwinnr.com/api/v1/attachments/1043)**Data Source**

This will contain the source of data for the fields.

                                                                        ![](https://support.smartwinnr.com/api/v1/attachments/1044)**Data Field**

This is the type of data field

                                                                         ![](https://support.smartwinnr.com/api/v1/attachments/1045)

In the advance section, you can also find the option to set the visibility and value override option for the selected field.

![](https://support.smartwinnr.com/api/v1/attachments/1046)

Default Value Override: This option allow the users to override the prepopluated values of the field.

Field Visibility: Field visibility conditions allow you to display the selected field to users while making a form submission.

List Visibility: This option allows you to display the selected field to users in the form submission list page.

Admin Visibility: Admin visibility allows you to display the selected field to admins in the form analytics page.

Keep Previous Value: This option will prepopulate the value which you selected in your previous form submission.

### Form Location

Select the Form  data location

![](https://support.smartwinnr.com/api/v1/attachments/1029)

This field is for the data location of the form.

SmartWinnr provides you two ways to make a form submission:

1. Via Left Menu >> Forms
2. Via Chat

If the user Selects the Chat option, few more fields related to the chat gets triggered, as shown below

![](https://support.smartwinnr.com/api/v1/attachments/1030)Form Submission Message

Select the Form Submission Message type.

                                                             ![](https://support.smartwinnr.com/api/v1/attachments/1031)

You can choose either a Pop-up message or a Sticky header to pass the users on their successful submission.

Pop-up message: Pop-up is simply a notification that communicates certain events to the user.

Sticky header: A sticky header is a navigation tool that fixes the menu to the top of the screen as the user scrolls down a page.

![](/img/reports/helpscout-image-7a49bf1f.png)

![](/img/reports/helpscout-image-31894796.png)

After Filing the appropriate fields, click on the ' **Save'** button.

### Step-3: Assign Users to the Form

The next step is to assign users to the form.Select the desired participants and add them to the form.

![](/img/reports/helpscout-image-ce7738c7.png)

You can filter these users based on the Business Unit, Country, Group, Name, Email, and Meta Tags. Once you have selected the users, click on the " **Send to Selected People**" button.
