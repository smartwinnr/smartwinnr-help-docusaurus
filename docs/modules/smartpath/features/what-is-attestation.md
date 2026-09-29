---
id: what-is-attestation
title: "What is Attestation"
description: "Set up an attestation in SmartPath so learners formally confirm required training with a signed record."
slug: what-is-attestation
sidebar_position: 328
last_update:
  date: 2026-09-29
  author: Hari Reddy
customProps:
  owner: sai.charanreddyt@smartwinnr.com
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

## Steps

### 1. Add an attestation
Open the SmartPath where you want the sign-off. Add **Attestation** as either a module item or a SmartPath-level item.

![After selecting Attestation from the Segment Type dropdown and entering the Name and Points, you will be redirected to the Attestation Create page. Select the required settings and click Save to create the attestation](/img/helpscout/authored/authored-mumpodu2.png)

### 2. Set the learner details
Enter a **Title** and **Description** so learners know what they are confirming. Add a thumbnail image if you want the attestation to display with the rest of the SmartPath content.

### 3. Write the statement
Add the statement the learner will read and agree to. You can write a custom statement or use your organization’s default statement.

### 4. Choose identity verification
Turn on identity confirmation when you need the learner to verify themselves before signing. They can confirm with their password or a one-time code, depending on how they normally log in.

### 5. Decide on re-signing
Choose whether learners can sign the same attestation again later. When re-signing is allowed, each signature is saved as a separate record.

### 6. Set points and languages
Award points if you want attestation to count toward learner progress or recognition. You can also provide the title, description, and statement in multiple languages.

### 7. Save the attestation
Select **Save** to create the attestation and add it to the SmartPath.

### 8. Review learner results
Open the attestation report to see who has signed and who has not. For signed learners, you can review the signing time, identity method, signing history, and certificate download.

![you can see the attestation segment status of each assigned user in analytics](/img/helpscout/authored/authored-mumpyz1i.png)

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