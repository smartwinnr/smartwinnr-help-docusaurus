'use strict';

/**
 * Pulls the analytics each digest type needs out of the chat-logs DB
 * (via db/chat-logger.js getters) and the feedback DB (db/feedback-logger.js).
 * Each `collect*` function returns the JSON-serialisable `data` payload
 * the main app's MJML template binds against.
 */

const path = require('path');
const fs = require('fs');
const chatLogger = require('./chat-logger');
const feedbackLogger = require('./feedback-logger');

/** Default cadence is weekly. windowEndIso defaults to "now"; windowStartIso
 *  is windowEndIso - 7 days. The same shape is reused for the "prior week"
 *  delta on ops-snapshot + editor-gap. */
function weekWindow(endIso, days = 7) {
  const end = endIso ? new Date(endIso) : new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
    days,
  };
}

function priorWindow(window) {
  const end = new Date(window.start);
  const start = new Date(end.getTime() - window.days * 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString(), days: window.days };
}

function deltaPct(current, prior) {
  if (prior === null || prior === undefined || prior === 0) return null;
  return Math.round(((current - prior) / prior) * 100);
}

/** Load module-overviews.json so the module-overview digest carries human
 *  labels alongside the slugs. */
function loadModuleOverviews() {
  const p = path.resolve(__dirname, '..', 'static', 'module-overviews.json');
  try { return JSON.parse(fs.readFileSync(p, 'utf8')).modules || {}; }
  catch { return {}; }
}

// ─────────────────────────────────────────────────────────────────────────
// 1. Editor gap report
// ─────────────────────────────────────────────────────────────────────────

function collectEditorGap(window) {
  const days = window.days;
  const topUnanswered = chatLogger.getTopUnansweredQueries({ days, limit: 20 }).map((q) => ({
    query:        q.exampleQuery,
    count:        q.count,
    users:        q.distinctUsers,
    module:       q.module || null,
    avgRelevance: q.avgRelevance,
    lastAsked:    q.lastAskedAt,
  }));

  // Articles with most thumbs-down on the chat side (proxy: helpfulPct low).
  const lowestHelpful = chatLogger.getArticlePerformance({ days, minCitations: 3, limit: 30 })
    .filter((a) => a.helpfulPct !== null)
    .sort((a, b) => a.helpfulPct - b.helpfulPct || b.thumbsDown - a.thumbsDown)
    .slice(0, 10)
    .map((a) => ({ title: a.title, url: a.url, helpfulPct: a.helpfulPct, thumbsDown: a.thumbsDown }));

  // High citation count + low CTR. CTR null when no clicks tracked, skip those.
  const lowCtrArticles = chatLogger.getArticlePerformance({ days, minCitations: 5, limit: 50 })
    .filter((a) => a.ctrPct !== null)
    .sort((a, b) => a.ctrPct - b.ctrPct || b.citationCount - a.citationCount)
    .slice(0, 10)
    .map((a) => ({ title: a.title, url: a.url, citations: a.citationCount, ctrPct: a.ctrPct }));

  // Article-side thumbs-down with comments, from the "Was this helpful?" widget.
  let thumbsDown = [];
  try {
    const summ = feedbackLogger.summary(days);
    if (summ.ok && Array.isArray(summ.perArticle)) {
      thumbsDown = summ.perArticle
        .filter((r) => r.down > 0)
        .sort((a, b) => b.down - a.down || a.helpfulPct - b.helpfulPct)
        .slice(0, 10)
        .map((r) => ({ slug: r.slug, down: r.down, up: r.up, helpfulPct: r.helpfulPct }));
    }
  } catch { /* feedback DB absent or disabled - skip section */ }

  // Refusal rate WoW.
  const cur = chatLogger.getStats(days);
  const prev = chatLogger.getStats(days * 2);
  // getStats over `2*days` is "this 2-week window"; subtract `cur` to get the prior week alone.
  const prevTotal = (prev.total_exchanges || 0) - (cur.total_exchanges || 0);
  const prevRefusal = (prev.refusal_count || 0) - (cur.refusal_count || 0);
  const currentPct = cur.total_exchanges > 0
    ? Math.round((cur.refusal_count / cur.total_exchanges) * 1000) / 10
    : 0;
  const priorPct = prevTotal > 0
    ? Math.round((prevRefusal / prevTotal) * 1000) / 10
    : 0;

  return {
    window: { start: window.start, end: window.end, days: window.days },
    topUnanswered,
    lowestHelpful,
    lowCtrArticles,
    thumbsDown,
    refusalRate: {
      currentPct,
      priorPct,
      deltaPct: deltaPct(currentPct, priorPct),
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────
// 2. Ops snapshot
// ─────────────────────────────────────────────────────────────────────────

function collectOpsSnapshot(window) {
  const days = window.days;
  const cur  = chatLogger.getStats(days);
  const prev = chatLogger.getStats(days * 2);
  const prevTotal     = (prev.total_exchanges     || 0) - (cur.total_exchanges     || 0);
  const prevConv      = (prev.total_conversations || 0) - (cur.total_conversations || 0);
  const prevRefusal   = (prev.refusal_count       || 0) - (cur.refusal_count       || 0);
  const prevFallback  = (prev.fallback_count      || 0) - (cur.fallback_count      || 0);

  const refusalCurPct  = cur.total_exchanges > 0 ? Math.round((cur.refusal_count  / cur.total_exchanges) * 1000) / 10 : 0;
  const fallbackCurPct = cur.total_exchanges > 0 ? Math.round((cur.fallback_count / cur.total_exchanges) * 1000) / 10 : 0;
  const refusalPriorPct  = prevTotal > 0 ? Math.round((prevRefusal  / prevTotal) * 1000) / 10 : 0;
  const fallbackPriorPct = prevTotal > 0 ? Math.round((prevFallback / prevTotal) * 1000) / 10 : 0;

  const qt = chatLogger.getQueryTypeStats(days).slice(0, 3);
  const health = chatLogger.getHealth();

  return {
    window: { start: window.start, end: window.end, days: window.days },
    volume: {
      conversations: cur.total_conversations,
      exchanges:     cur.total_exchanges,
      conversationsDeltaPct: deltaPct(cur.total_conversations, prevConv),
      exchangesDeltaPct:     deltaPct(cur.total_exchanges,     prevTotal),
    },
    quality: {
      refusalRate:    { currentPct: refusalCurPct,  priorPct: refusalPriorPct,  deltaPct: deltaPct(refusalCurPct,  refusalPriorPct) },
      fallbackRate:   { currentPct: fallbackCurPct, priorPct: fallbackPriorPct, deltaPct: deltaPct(fallbackCurPct, fallbackPriorPct) },
      avgResponseMs:  cur.avg_response_time_ms || 0,
      avgRelevance:   cur.avg_relevance_score || 0,
    },
    topQueryTypes: qt.map((r) => ({ type: r.query_type || '(none)', count: r.count })),
    health: {
      dbSizeMb:           health.db_size_mb,
      totalConversations: health.total_conversations,
      totalExchanges:     health.total_exchanges,
      oldestRecord:       health.oldest_record,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────
// 3. Module overview
// ─────────────────────────────────────────────────────────────────────────

function collectModuleOverview(window) {
  const days = window.days;
  const overviews = loadModuleOverviews();
  // Top unanswered per module, derived from the same getter the editor-gap
  // section uses (so the module tagging logic is single-source).
  const allUnanswered = chatLogger.getTopUnansweredQueries({ days, limit: 200 });
  const byModule = new Map();
  for (const q of allUnanswered) {
    const slug = q.module;
    if (!slug) continue;
    if (!byModule.has(slug)) byModule.set(slug, []);
    byModule.get(slug).push({
      query: q.exampleQuery,
      count: q.count,
      users: q.distinctUsers,
    });
  }

  const modules = Object.entries(overviews).map(([slug, meta]) => {
    const unanswered = byModule.get(slug) || [];
    const queryCount = unanswered.reduce((acc, q) => acc + q.count, 0);
    return {
      slug,
      label: meta.label || slug,
      queryCount,
      unansweredCount: unanswered.length,
      topUnanswered: unanswered.slice(0, 5),
    };
  });
  modules.sort((a, b) => b.queryCount - a.queryCount);

  return {
    window: { start: window.start, end: window.end, days: window.days },
    modules,
  };
}

module.exports = {
  weekWindow,
  priorWindow,
  collectEditorGap,
  collectOpsSnapshot,
  collectModuleOverview,
};
