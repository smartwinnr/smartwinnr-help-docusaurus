'use strict';

/**
 * Maps a digestType to {templateName, subject, data}. Subjects are
 * stamped with the cadence-window end date so the recipient can scan
 * for the week at a glance.
 *
 * The main app's MJML renderer treats `templateName` as the lookup key
 * for its template registry. Add a new digest type here AND ship the
 * matching .mjml template in the main app.
 */

const digestData = require('./digest-data');

function fmtDate(iso) { return String(iso).slice(0, 10); }

function buildPayload(digestType, window) {
  const w = window || digestData.weekWindow();
  switch (digestType) {
    case 'editor-gap': {
      const data = digestData.collectEditorGap(w);
      return {
        templateName: 'help-digest-editor-gap',
        subject:      `Help site - editor gap report - week ending ${fmtDate(w.end)}`,
        data,
      };
    }
    case 'ops-snapshot': {
      const data = digestData.collectOpsSnapshot(w);
      return {
        templateName: 'help-digest-ops-snapshot',
        subject:      `Help site - ops snapshot - week ending ${fmtDate(w.end)}`,
        data,
      };
    }
    case 'module-overview': {
      const data = digestData.collectModuleOverview(w);
      return {
        templateName: 'help-digest-module-overview',
        subject:      `Help site - module overview - week ending ${fmtDate(w.end)}`,
        data,
      };
    }
    default:
      throw new Error(`Unknown digest type: ${digestType}`);
  }
}

/** Returns true when there's enough signal to send; false = skip the
 *  send and log status='no-data'. Keeps quiet weeks quiet. */
function hasUsefulData(digestType, data) {
  if (!data) return false;
  if (digestType === 'editor-gap') {
    return (data.topUnanswered && data.topUnanswered.length > 0)
        || (data.lowCtrArticles && data.lowCtrArticles.length > 0)
        || (data.thumbsDown && data.thumbsDown.length > 0);
  }
  if (digestType === 'ops-snapshot') {
    return (data.volume && (data.volume.exchanges > 0 || data.volume.conversations > 0));
  }
  if (digestType === 'module-overview') {
    return Array.isArray(data.modules) && data.modules.some((m) => m.queryCount > 0);
  }
  return true;
}

/** Summarise the payload for digest_send_log.meta_json so operators can
 *  read the log without re-querying. Tiny shape on purpose. */
function summarizePayload(digestType, data) {
  if (!data) return {};
  if (digestType === 'editor-gap') {
    return {
      topUnansweredCount: (data.topUnanswered || []).length,
      lowCtrCount:        (data.lowCtrArticles || []).length,
      thumbsDownCount:    (data.thumbsDown || []).length,
    };
  }
  if (digestType === 'ops-snapshot') {
    return {
      exchanges:     data.volume?.exchanges,
      conversations: data.volume?.conversations,
      refusalPct:    data.quality?.refusalRate?.currentPct,
    };
  }
  if (digestType === 'module-overview') {
    return {
      modulesWithSignal: (data.modules || []).filter((m) => m.queryCount > 0).length,
    };
  }
  return {};
}

module.exports = {
  buildPayload,
  hasUsefulData,
  summarizePayload,
};
