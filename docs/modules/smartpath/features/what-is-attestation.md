---
id: what-is-attestation
title: "What is Attestation"
description: "Set up an attestation in SmartPath so learners formally confirm required training with a signed record."
slug: what-is-attestation
sidebar_position: 999
last_update:
  date: 2026-10-26
  author: Sandeep Bhuthagaddala
customProps:
  roles: [editor, admin, orgadmin, lamadmin, superadmin]
tags: ["smartpath"]
draft: false
---

> **At a glance** - Attestation lets you collect a formal learner signature for required training. Use it when a completion record is not enough and you need a verifiable sign-off.

Attestation adds a signed confirmation step to a SmartPath. You can use it for a single module or for the full SmartPath, depending on what the learner must complete before signing.

It is useful for compliance training, policy acknowledgements, and any workflow where you need a clear record of who confirmed understanding and when.

## When to use this

Use attestation when you need a stronger record than completion alone.

- You need a learner to confirm required training in their own name.
- You need identity verification before the signature counts.
- You need one sign-off per module or one final sign-off for the full SmartPath.
- You need a certificate and signing history for audits or follow-up.

## Before you start

Before creating an attestation, make sure that:

- The **Attestation in SmartPath** setting is enabled for your organization.
- You have access to the Editor Portal.
- The required module has been created in SmartPath.

:::note
Attestation is disabled by default and must be enabled under your organization's SmartPath configuration.
:::

## Steps

### 1. Open the module
Log in to the Editor Portal and go to **EDITOR → LEARNING AND KNOWLEDGE → SmartPaths → View All Modules**.

Open the module where you want to add the attestation.

### 2. Add a new segment
Select **Add Segment** at the top-right corner of the module page.

![NewSegmentAttestation](/img/helpscout/authored/what-is-attestation-mvp35zlg.png)
Choose **Attestation** as the segment type and enter a name for the segment.

Configure the point distribution if the option is available for the segment, then select **Create**.

![After selecting Attestation from the Segment Type dropdown and entering the Name and Points, you will be redirected to the Attestation Create page. Select the required settings and click Save to create the attestation](/img/helpscout/authored/authored-mumpodu2.png)

### 3. Configure the attestation statement
Configure the statement that learners must acknowledge when signing the attestation.

You can use either:

- **Default Statement**: Use the organization's default attestation statement.
- **Custom Statement**: Enter a statement specific to the training or learning program.

The statement supports multiple languages. Make sure the wording clearly explains what the learner is acknowledging.

For example:

"I confirm that I have completed the assigned training and understood the information presented."

### 4. Configure the signing options
Configure the available attestation settings according to your requirements.

**Allow the learner to sign again**: Enable this option if learners should be allowed to sign the attestation again. If disabled, learners cannot sign it again after completing the signing process.

**Ask the learner to confirm their identity when signing**: Enable this option when learners must confirm their identity during signing.

When identity confirmation is enabled:

- Learners signing in with a password are asked to enter their password.
- Learners using single sign-on (SSO) or a one-time code can be asked to verify their identity using a code sent by SMS, depending on the available verification details.

Review the configuration before saving the attestation.

### 5. Save the attestation
Complete the required configuration and save the attestation segment.

The attestation appears in the module alongside the other learning segments.

### 6. Arrange the segment sequence
Place the attestation in the appropriate position in the module.

For example, add it after the required training materials, quizzes, or other learning activities so learners acknowledge the training after completing it.

The attestation remains locked until the required preceding segments are completed.

### 7. Learn how learners sign an attestation
Learners must use the SmartWinnr Web App (PWA) through a browser to sign an attestation. Signing is not available in the iOS and Android apps until the relevant app release supports it.

The learner follows these steps:

- Log in to SmartWinnr through a browser.
- Open the assigned SmartPath and module.
- Complete the required preceding segments.
- Open the attestation segment.
- Review the attestation statement.
- Enter or confirm their full name in the signing field.
- Complete the identity verification step if prompted.
- Select the checkbox to acknowledge the statement.
- Submit the signature.

After signing successfully, the learner can view and download the Certificate of Attestation.

### 8. Review learner results
Open the attestation report to see who has signed and who has not. For signed learners, you can review the signing time, identity method, signing history, and certificate download.

![You can see the attestation segment status of each assigned user in analytics](/img/helpscout/authored/authored-mumpyz1i.png)

## Tips

- Use a custom statement when the attestation needs training-specific wording.
- Place the attestation after the learning content it confirms.
- Enable identity confirmation when you need a stronger signing record.
- Use multiple languages when learners need to read the statement in their preferred language.

## Things to know

:::note
A learner must finish the required module or the full SmartPath before the attestation unlocks.
:::

:::note
Points are awarded the first time a learner signs. Re-signing does not add more points.
:::

:::note
If you update the default statement, SmartWinnr keeps the statement version tied to each signature record.
:::