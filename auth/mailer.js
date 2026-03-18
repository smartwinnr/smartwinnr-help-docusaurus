'use strict';

const mailgun = require('mailgun-js');
const config = require('./config');
const { renderMagicLinkEmail } = require('./emailTemplate');

let mg = null;

function getMailgun() {
  if (!mg) {
    if (!config.mailgunApiKey) {
      throw new Error('MAILGUN_API_KEY is not configured');
    }
    mg = mailgun({
      apiKey: config.mailgunApiKey,
      domain: config.mailgunDomain,
    });
  }
  return mg;
}

/**
 * Send a magic link email to the given address.
 */
async function sendMagicLinkEmail(toEmail, magicLinkUrl) {
  const { html, text } = renderMagicLinkEmail(magicLinkUrl);

  const data = {
    from: config.mailgunFrom,
    to: toEmail,
    subject: 'Sign in to SmartWinnr Help Center',
    html,
    text,
  };

  const client = getMailgun();
  return client.messages().send(data);
}

module.exports = { sendMagicLinkEmail };
