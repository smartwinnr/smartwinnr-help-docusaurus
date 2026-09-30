---
id: how-to-create-field-coaching
title: "How to create field coaching"
description: "Set up field coaching sessions, ratings, sections, and notifications for structured manager coaching."
slug: how-to-create-field-coaching
sidebar_position: 30
last_update:
  date: 2026-09-30
  author: Manaswini V
customProps:
  owner: manaswini.v@smartwinnr.com
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: ["field-coaching"]
draft: false
---

> **At a glance** - Follow these steps to create field coaching in SmartWinnr, ensuring that you have the necessary editor role.

 Only the user with the editor role can create field coaching. Follow the steps below to set up your field coaching in the SmartWinnr account.

 ## When to use this
 Use this guide when you need to create field coaching for your organization. This process is essential for setting up coaching sessions that facilitate performance tracking and development.

## Steps

## 1. Open Field Coaching
Go to **Editor > Coaching > Field Coaching > Coaching** from the left menu.
![kindly click on create new ](/img/helpscout/authored/how-to-create-field-coaching-munooi8p.png)
On the right side, click **Create New** to start setting up a new coaching.

## 2. Choose a coaching template

On the **Create a Coaching** page, select a template based on how you want the coaching session to be conducted.
* **Inline Ratings:** Rate competencies during the session.
* **Coaching With No Ratings:** Complete fields without ratings or scoring.
* **Self Assessment:** Allows the coachee to rate their own performance.
* **Development Plan:** Create a longer-term development plan.
* **Baseline and Focus Areas:** Set a baseline and select competencies to focus on.

Select the template you want, then click **Next**.
![kindly select the template and then click on next](/img/helpscout/authored/how-to-create-field-coaching-mumiy3du.png)
## 3. Enter coaching details
Under basic info,Open **Overview** and enter the **Coaching Name**, **Business Unit**, and **Description**.

If you need another language, click **Change Language**, choose the language, and enter the translated content in the matching fields.
![kindly enter coaching details](/img/helpscout/authored/how-to-create-field-coaching-mumizd1g.png)
## 4. Set the schedule
Open **Schedule** and configure the timing for the coaching sessions.

Set the **Start Date**, **End Date**, **Time Zone**, **Frequency**, **Starts On Day**, and **Repeat Every** values that fit your schedule. Then click **Next**.
![kindly set the schedule](/img/helpscout/authored/how-to-create-field-coaching-mumj31th.png)
## 5. Configure ratings and competencies
Select a **Rating Scale** and define the rating levels coaches will use.

You can add a **Rating Description**, add or delete rating levels,
![Configure ratings and competencies](/img/helpscout/authored/how-to-create-field-coaching-mumm1dlx.png)
Then open **Competencies** and select an existing competency or click **Add Competency** to create a new one.
![kindly select the competencies](/img/helpscout/authored/how-to-create-field-coaching-mumj5441.png)
For each competency, you can set:

- **Mandatory**
- **Overall Description**
- **Rating Level** descriptions
- **Advanced Settings**
- **In completion email**
- **Visibility**
![kindly add the description and click on next](/img/helpscout/authored/how-to-create-field-coaching-mumje0g5.png)
Click **Add Visibility Rule** to add a visibility condition. Select the required criteria, such as **Division**, **Meta Tag**, or **Group**, and then select the corresponding value.
![kindly click on add visibility rule](/img/helpscout/authored/how-to-create-field-coaching-mummlo6u.png)

## 6. Set up sections
Open **Sections** to define the fields that appear during the coaching session.

Choose the **Number of Steps** from **1 to 10**. Each step appears as a separate tab. You can also enter **Step Names** to label the tabs.
![kindly select number of steps](/img/helpscout/authored/how-to-create-field-coaching-mumjjw1e.png)
Click **Add Section** to create a section inside a step. Then enter a **Section Name**, an optional **Description**, and choose who can see it under **Visible to**.

If you want multiple copies of the same section, enable **Allow adding more of this section during a session**. Then name each copy and choose who can add it: **Coach**, **Coachee**, or both.
![kindly add section details](/img/helpscout/authored/how-to-create-field-coaching-mumjl9hu.png)
### Add fields to the section

Click **Add Field** and configure the field:

* Enter the **Field Label** and select the **Field Type**.

The **Field Type** options include **Text, Long Text, Formatted Text, Number, Date, Dropdown, Checklist, and Image**.
![kindly select the field type](/img/helpscout/authored/how-to-create-field-coaching-mumjlyhz.png)

* Mark the field as **Required**, if needed, and add **Placeholder Text**.
* Set who can **view** and **edit** the field.
* Select the **steps** where the field is visible and editable.

#### Advanced Settings

* **Where the value comes from:** Choose whether the value is entered during the session or filled automatically.
* Enable **Include in the completion email**, **Repeat in the overall summary**, or **Limit how much can be typed**, as needed.
* Under **Visibility**, select **Division**, **Meta Tag**, or **Group**, and choose the required value.
![kindly add fields](/img/helpscout/authored/how-to-create-field-coaching-mumjlkkx.png)

## 7. Configure Settings
### 1.Rating & Competency Behavior

* **How a rating is picked:** Choose how ratings are selected:
  * **Stars:** Displays the rating images configured for each rating level.
  * **Dropdown:** Displays the rating level names in a drop-down list.
* **Allow skipping a rating:** Allows the coach to leave a competency unrated.
* **Show average rating:** Displays the coachee’s average rating across competencies in their summary.
![set up ratings and competencies](/img/helpscout/authored/how-to-create-field-coaching-mumk6rqv.png)

### 2. Coach Assignment Rules

* Select how coaches are assigned to coachees.
* **Allow 1st or 2nd line manager to coach:** Assigns the session to the coachee’s 1st or 2nd line manager.
* **Allow immediate manager to coach:** Assigns the session to the coachee’s immediate manager.
* **Allow any manager to coach:** Allows any of the coachee’s managers to conduct the session.
* If all options are off, assign a coach to each coachee on the **Assignment** page.
![kindly set coachin assignment rules](/img/helpscout/authored/how-to-create-field-coaching-mumk7co7.png)
### 3. Session Behavior

* **Enable ad hoc sessions:** Allows coaches to start additional sessions outside the regular schedule.
* **Allow managers to delete expired, uncompleted ad hoc sessions:** Appears when ad hoc sessions are enabled and allows managers to delete expired, uncompleted sessions.
* **Enable session duplication:** Allows coaches to duplicate a completed session as a starting point for a new one.
* **Enable auto save:** Automatically saves the coach’s progress.
![kindly set session behavior](/img/helpscout/authored/how-to-create-field-coaching-mumk82av.png)
### 4. Coaching Date

* **Enable coaching date:** Allows a date to be recorded for the coaching session.
* **Allow a future date:** Allows the coach to select a future date.
* **Allow a past date:** Allows the coach to select a past date.
* **Only the coach decides the coaching date:** Allows only the coach to set or change the date.
* Configure the position of the **Coaching Date** in **Visibility Settings**.
![kindly set coaching date](/img/helpscout/authored/how-to-create-field-coaching-mumk8l2x.png)
### 5. Visibility Settings

* **Type:** Select **Coaching Date**, **Ratings**, or **Competencies**.
* **Place to show:** Select **Top of the page** or **Bottom of the page**.
* Click **Add Visibility Setting** to configure another element.
![kindly set visibility settings](/img/helpscout/authored/how-to-create-field-coaching-mummz1rr.png)
### 6. Submission & Workflow

* **Enable step-by-step submission:** Allows the coaching to be submitted one step at a time.
* When enabled, **Who can submit** appears. Select **Coach** or **Coachee**.
* **Allow custom statuses:** Adds custom statuses to **Not Started**, **In Progress**, and **Completed**.
* **Grace Period:** Set how long the session remains open after its scheduled period using **Days**, **Weeks**, or **Hours**.
![kindly set Submission & Workflow settings](/img/helpscout/authored/how-to-create-field-coaching-munzc9rm.png)
### 7. Completion & Sign-off

* **Require coachee acknowledgement:** Requires the coachee to confirm the **Acknowledgement Text** before the session is closed.
* **Require coachee acknowledgement after completion:** Allows the coachee to rate the completed session out of **5** and provide a review. When enabled, the **Hide the coachee's acknowledgement from the coach** option appears.
* **Hide the coachee's acknowledgement from the coach:** Hides the coachee's rating and review from the coach.

* **Send email to coach after completion:** Sends an email to the coach when the session is completed.
* **Notify an external coach on completion:** Sends a completion email to an external coach. Enter the **External Coach Name** and **External Coach Email**.
![kindly set Completion & Sign-off settings](/img/helpscout/authored/how-to-create-field-coaching-mumkanu9.png)
### 8. Notification Settings

* **Reason:** Select **Assigned**, **Started**, **Completed**, **Acknowledged by the coachee**, or **Step submitted**.
* **Send to:** Select **Coach** or **Coachee**.
* **Type:** Select **Email** or **In-app notification**.
* Click **Add Notification** to add another notification.
![kindly set Notification Settings](/img/helpscout/authored/how-to-create-field-coaching-mumn19ew.png)
### 9. Reminder Settings
* **Reminder Type:** Select **Email** or **In-app notification**.
* **Reminder Reason:** Select **Not acknowledged** or **Not completed**.
* **Send to:** Select **Coach** or **Coachee**.
* **Reminder Format:** Select **On a set frequency** or **On a custom schedule (cron)**.
* **Frequency:** Select **Daily**, **Weekly**, **Fortnightly**, **Monthly**, or **Yearly** when using a set frequency.
* **Hour of Day:** Set the reminder time from **0–23**.
* Click **Add Reminder** to add another reminder.

**Note:** The exact next reminder dates are calculated after saving and are not previewed in the wizard.
![kindly set Reminder Settings](/img/helpscout/authored/how-to-create-field-coaching-mumkbvpf.png)
### 10. Scoring Qualification

* **Enable scoring in fields:** Allows field responses to contribute to the coaching score based on defined rules.
* Click **Add Rule** to define which field responses are included in scoring
and to define the scoring conditions.
![kindly set Scoring Qualification settings](/img/helpscout/authored/how-to-create-field-coaching-mumkcl6n.png)
After completing all the required settings, click **Publish**. A confirmation message appears asking you to confirm the publication.

Click **Publish** in the confirmation window to publish the coaching.


![kindly click on publish](/img/helpscout/authored/how-to-create-field-coaching-mumkdeox.png)

## Things to know

* You can change the template until the coaching is saved for the first time.
* The exact next reminder dates are calculated after you save the settings and are not previewed in the wizard.
* If you leave a step name blank, SmartWinnr uses the default step name.
