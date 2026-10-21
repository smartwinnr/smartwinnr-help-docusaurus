'use strict';

/**
 * Pure logic for classifying a release-pipeline change as customer-relevant
 * article material vs internal noise. The I/O wrapper (llmClassifyRelevance)
 * lives in server.js beside llmPickMatchingArticle; everything here is
 * side-effect-free and unit-testable.
 *
 * Verdict shape everywhere: { verdict: 'relevant'|'not-relevant',
 * confidence: 'high'|'medium'|'low', reason, source: 'deterministic'|'llm' }.
 */

// Top-level source areas (as touched-areas.js reports them: 'modules/<dir>'
// or the first path segment) that can never produce a customer-visible
// change on their own. A change touching ONLY these is internal by
// construction. Deliberately conservative - anything ambiguous goes to the
// LLM instead of being auto-rejected.
const NON_PRODUCT_AREAS = new Set([
  'tools', 'scripts', 'deploy', 'config', 'test', 'tests', 'docs',
  'migrations', '.gitlab-ci.yml', '.github',
]);

const VERDICTS = new Set(['relevant', 'not-relevant']);
const CONFIDENCES = new Set(['high', 'medium', 'low']);

/**
 * Cheap checks that need no LLM. Returns a high-confidence not-relevant
 * verdict, or null for "unknown - ask the LLM".
 */
function deterministicVerdict(change) {
  if (change && change.changeType === 'refactor') {
    return {
      verdict: 'not-relevant',
      confidence: 'high',
      reason: 'Change-Type refactor means behavior is unchanged - never customer-facing. If customers would notice it, the commit should say enhancement or bug.',
      source: 'deterministic',
    };
  }
  const files = (change && Array.isArray(change.files)) ? change.files : [];
  // Merge commits reach the dispatcher with an EMPTY files list
  // (touched-areas.js runs `git show` without -m) - empty means unknown,
  // never "all non-product".
  if (files.length > 0 && files.every((f) => NON_PRODUCT_AREAS.has(String(f)))) {
    return {
      verdict: 'not-relevant',
      confidence: 'high',
      reason: `Only touches non-product areas (${files.join(', ')}) - tooling, config, or tests customers never see.`,
      source: 'deterministic',
    };
  }
  return null;
}

/** Chat messages for the LLM relevance call. */
function buildRelevanceMessages(change, title) {
  return [
    {
      role: 'system',
      content:
        'You decide whether a code change to the SmartWinnr platform is relevant to CUSTOMERS reading the public help site. ' +
        'Relevant = a customer would notice the change in the product UI or behavior, or would plausibly ask support about it. ' +
        'NOT relevant = internal tooling, developer-only changes, infrastructure, performance work with no visible effect, or routine fixes of defects customers never saw or reported. ' +
        'Respond with ONLY a JSON object: {"verdict": "relevant"|"not-relevant", "confidence": "high"|"medium"|"low", "reason": "<one sentence>"}.',
    },
    {
      role: 'user',
      content: JSON.stringify({
        subject: title,
        changeType: change.changeType,
        sections: change.sections || {},
        files: change.files || [],
      }, null, 2),
    },
  ];
}

/** Parses the LLM's reply. Returns a verdict object or null on garbage. */
function parseRelevanceVerdict(text) {
  try {
    const cleaned = String(text || '').trim()
      .replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed || !VERDICTS.has(parsed.verdict) || !CONFIDENCES.has(parsed.confidence)) return null;
    return {
      verdict: parsed.verdict,
      confidence: parsed.confidence,
      reason: typeof parsed.reason === 'string' ? parsed.reason.slice(0, 500) : '',
      source: 'llm',
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// The relevance flag on a flagged draft lives IN the article file, as a
// second machine-managed MDX comment next to the release-draft provenance
// comment. File-resident so it survives DB retention, journal restores and
// renames, and travels with the draft until a human resolves it. Like the
// provenance comment, the server strips it before any markdown reaches the
// LLM and re-injects it after.

const RELEVANCE_COMMENT_RE = /\{\/\*\s*release-relevance:\s*verdict=(\S+)\s+confidence=(\S+)\s+reason="([^"]*)"\s*\*\/\}/g;

function parseRelevanceComment(markdown) {
  for (const m of String(markdown || '').matchAll(RELEVANCE_COMMENT_RE)) {
    return { verdict: m[1], confidence: m[2], reason: m[3] };
  }
  return null;
}

function stripRelevanceComments(markdown) {
  return String(markdown || '').replace(new RegExp(RELEVANCE_COMMENT_RE.source + '[ \\t]*\\n?', 'g'), '');
}

/** Inserts the flag comment right after the closing frontmatter fence (so
 *  it lands next to the provenance stack); no-op when flag is null. */
function injectRelevanceComment(markdown, flag) {
  if (!flag || !flag.verdict) return markdown;
  const reason = String(flag.reason || '').replace(/"/g, "'").slice(0, 300);
  const comment = `{/* release-relevance: verdict=${flag.verdict} confidence=${flag.confidence || 'low'} reason="${reason}" */}`;
  const fenceEnd = markdown.indexOf('\n---', markdown.indexOf('---') + 3);
  if (fenceEnd === -1) return markdown;
  const insertAt = fenceEnd + 4;
  return markdown.slice(0, insertAt) + '\n' + comment + markdown.slice(insertAt);
}

module.exports = {
  NON_PRODUCT_AREAS,
  deterministicVerdict,
  buildRelevanceMessages,
  parseRelevanceVerdict,
  parseRelevanceComment,
  stripRelevanceComments,
  injectRelevanceComment,
};
