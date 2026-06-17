'use strict';

/**
 * Group recipients by region, POST to each region's main-app instance,
 * record one row per region to digest_send_log. Used by both the cron
 * endpoint and the admin "Send now" button.
 *
 * Region routing: `MAIN_APP_URLS_JSON` env var (JSON object: slug -> base
 * URL) overrides the built-in map. Unknown regions fall back to `global`.
 * Add a new region by appending to that env var on Railway.
 */

const axios = require('axios');
const digestStore = require('./digest-store');
const { buildPayload, hasUsefulData, summarizePayload } = require('./digest-payload');

const DEFAULT_REGION_URLS = {
  'global':     'https://app.smartwinnr.com',
  'ap-south-1': 'https://ap-south-1.smartwinnr.com',
};

function regionUrlMap() {
  const map = { ...DEFAULT_REGION_URLS };
  if (process.env.MAIN_APP_URLS_JSON) {
    try { Object.assign(map, JSON.parse(process.env.MAIN_APP_URLS_JSON)); }
    catch (e) { console.warn('[digest] MAIN_APP_URLS_JSON not valid JSON:', e.message); }
  }
  return map;
}

function urlForRegion(region) {
  const map = regionUrlMap();
  return map[region] || map.global;
}

async function sendDigest(digestType) {
  const subs = digestStore.getSubscribersByType(digestType);
  if (subs.length === 0) {
    digestStore.logSend({ digestType, recipientCount: 0, status: 'no-recipients' });
    return [{ region: 'all', status: 'no-recipients' }];
  }

  let payload;
  try {
    payload = buildPayload(digestType);
  } catch (e) {
    digestStore.logSend({ digestType, recipientCount: 0, status: 'failed', error: e.message });
    return [{ region: 'all', status: 'failed', error: e.message }];
  }

  if (!hasUsefulData(digestType, payload.data)) {
    digestStore.logSend({
      digestType,
      recipientCount: subs.length,
      status: 'no-data',
      metaJson: JSON.stringify(summarizePayload(digestType, payload.data)),
    });
    return [{ region: 'all', status: 'no-data' }];
  }

  // Group subscribers by region.
  const byRegion = new Map();
  for (const s of subs) {
    const r = s.region || 'global';
    if (!byRegion.has(r)) byRegion.set(r, []);
    byRegion.get(r).push(s.email);
  }

  const results = [];
  const summary = summarizePayload(digestType, payload.data);
  const sharedSecret = process.env.MAIN_APP_SHARED_SECRET || '';

  for (const [region, emails] of byRegion.entries()) {
    const url = urlForRegion(region) + '/api/help/send-digest';
    const body = {
      templateName: payload.templateName,
      to:           emails,
      subject:      payload.subject,
      fromName:     'SmartWinnr Help Analytics',
      data:         payload.data,
    };
    try {
      const resp = await axios.post(url, body, {
        headers: {
          'Content-Type':           'application/json',
          'x-help-shared-secret':   sharedSecret,
        },
        timeout: 30000,
        // Treat any 2xx as success; raise on the rest below.
        validateStatus: (s) => s >= 200 && s < 300,
      });
      digestStore.logSend({
        digestType,
        recipientCount: emails.length,
        status:         'sent',
        metaJson:       JSON.stringify({ region, messageId: resp.data && resp.data.messageId, ...summary }),
      });
      results.push({ region, status: 'sent', recipientCount: emails.length });
    } catch (e) {
      const errMsg = (e.response && e.response.data && e.response.data.error)
        || e.message
        || 'unknown error';
      console.error(`[digest] ${digestType} -> ${region} (${url}) FAILED:`, errMsg);
      digestStore.logSend({
        digestType,
        recipientCount: emails.length,
        status:         'failed',
        error:          errMsg,
        metaJson:       JSON.stringify({ region, ...summary }),
      });
      results.push({ region, status: 'failed', error: errMsg, recipientCount: emails.length });
    }
  }
  return results;
}

module.exports = {
  sendDigest,
  urlForRegion,
  regionUrlMap,
};
