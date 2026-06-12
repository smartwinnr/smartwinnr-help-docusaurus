'use strict';

/**
 * Pure-function article audit. Grades a markdown string against the
 * canonical Apple-grade template (STYLE.md + plan §15.1).
 *
 * Exports:
 *   gradeMarkdown(text, opts?) → {score, findings: Finding[]}
 *
 * Finding shape:
 *   { key: string,        // defect catalog key, e.g. 'ghostStub'
 *     label: string,      // canonical human label from DEFECTS
 *     detail?: string,    // optional contextual info ("56 words", filename, …)
 *     blocking: boolean } // refuses save/publish when true
 *
 * Used by:
 *   • scripts/audit-articles.js — walks docs/** and aggregates findings
 *   • server.js — POST /api/admin/authoring/{save,publish} refuses to
 *     write when any blocking finding fires
 */

const matter = require('gray-matter');

// Defect catalog. `weight` adds to the priority score. `blocking` means
// the save/publish endpoints refuse to write when this defect fires.
const DEFECTS = {
  emptyDescription: {weight: 10, blocking: true,  label: 'Empty `description:`'},
  noHeadings:       {weight: 10, blocking: true,  label: 'No h2/h3 headings (text wall)'},
  ghostStub:        {weight:  9, blocking: true,  label: 'Ghost stub (<80 words body)'},
  badAltText:       {weight:  2, blocking: true,  label: 'Image with empty/filename alt'},
  inlineStep:       {weight:  7, blocking: true,  label: 'Inline "Step N:" plain text (should be h3)'},
  emptyTags:        {weight:  5, blocking: false, label: 'Empty `tags: []`'},
  noCrossLink:      {weight:  4, blocking: false, label: 'No relative cross-link to a related article'},
  ledeBoilerplate:  {weight:  3, blocking: false, label: 'Lede starts with throat-clearing'},
  missingPrivilege: {weight:  3, blocking: false, label: 'Missing `customProps.privilege` while parent folder has one'},
  absoluteHelpLink: {weight:  1, blocking: false, label: 'Absolute help.smartwinnr.com link (should be relative)'},
  longSentence:     {weight:  1, blocking: false, label: 'Sentence > 20 words'},
};

const BOILERPLATE_OPENERS = [
  /^this article (will )?(explain|cover|describe|show|guide)/i,
  /^in this (article|guide|tutorial|document)/i,
  /^welcome(,)?\s/i,
  /^let'?s (start|begin|dive)/i,
];

/**
 * Grade an article's markdown.
 *
 * @param {string} text Full markdown content (frontmatter + body).
 * @param {object} [opts]
 * @param {string} [opts.parentPrivilege] If set, missing
 *   `customProps.privilege` fires the `missingPrivilege` finding.
 * @returns {{score: number, findings: Array<{key:string,label:string,detail?:string,blocking:boolean}>}}
 */
function gradeMarkdown(text, opts = {}) {
  const findings = [];
  let score = 0;

  function flag(key, detail) {
    const def = DEFECTS[key];
    if (!def) return;
    score += def.weight;
    findings.push({
      key,
      label: def.label,
      detail: detail || undefined,
      blocking: !!def.blocking,
    });
  }

  let fm = {};
  let body = '';
  try {
    const parsed = matter(text);
    fm = parsed.data || {};
    body = (parsed.content || '').trim();
  } catch {
    findings.push({
      key: 'malformedFrontmatter',
      label: 'Malformed frontmatter (could not parse YAML)',
      blocking: true,
    });
    return {score: 100, findings};
  }

  // Frontmatter checks
  if (!fm.description || String(fm.description).trim() === '') {
    flag('emptyDescription');
  }
  if (!fm.tags || (Array.isArray(fm.tags) && fm.tags.length === 0)) {
    flag('emptyTags');
  }
  if (opts.parentPrivilege && !(fm.customProps && fm.customProps.privilege)) {
    flag('missingPrivilege', `parent declares ${opts.parentPrivilege}`);
  }

  // Body analysis
  const words = body.split(/\s+/).filter(Boolean);
  if (words.length < 80) flag('ghostStub', `${words.length} words`);

  const headingLines = body.split('\n').filter((l) => /^#{2,3}\s/.test(l));
  if (headingLines.length === 0 && words.length > 200) flag('noHeadings');

  // Images
  const imageMatches = [...body.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];
  let badAltCount = 0;
  for (const m of imageMatches) {
    const alt = (m[1] || '').trim();
    const filenameDerived = alt && /^[a-z0-9-]+(\.[a-z]+)?$/.test(alt);
    if (!alt || filenameDerived) badAltCount++;
  }
  if (badAltCount > 0) {
    score += DEFECTS.badAltText.weight * badAltCount;
    findings.push({
      key: 'badAltText',
      label: DEFECTS.badAltText.label,
      detail: `${badAltCount} image(s)`,
      blocking: DEFECTS.badAltText.blocking,
    });
  }

  // Inline "Step N:" plain text
  const stepInline = body.split('\n').filter((l) =>
    /^[^#].*\bStep\s*\d+\s*:/i.test(l),
  ).length;
  if (stepInline > 0) flag('inlineStep', `${stepInline} occurrence(s)`);

  // Lede boilerplate
  const ledeMatch = body.match(/^(?!#|>|!\[)(.+)$/m);
  if (ledeMatch && BOILERPLATE_OPENERS.some((re) => re.test(ledeMatch[1]))) {
    flag('ledeBoilerplate', `"${ledeMatch[1].slice(0, 60)}..."`);
  }

  // Cross-links
  const hasCrossLink =
    /\]\(\.\.?\/[^)]+\.md\)/.test(body) ||
    /\]\(\/modules\/[^)]+\)/.test(body);
  if (!hasCrossLink && words.length > 120) flag('noCrossLink');

  // Absolute help.smartwinnr.com links
  const helpAbs = (body.match(/https?:\/\/help\.smartwinnr\.com\/\S+/g) || []).length;
  if (helpAbs > 0) {
    score += DEFECTS.absoluteHelpLink.weight * Math.min(helpAbs, 5);
    findings.push({
      key: 'absoluteHelpLink',
      label: DEFECTS.absoluteHelpLink.label,
      detail: `${helpAbs} occurrence(s)`,
      blocking: DEFECTS.absoluteHelpLink.blocking,
    });
  }

  // Long sentences (capped at 10 to avoid dominating)
  const sentences = body.replace(/```[\s\S]*?```/g, '').split(/(?<=[.!?])\s+/);
  const longSentences = sentences.filter((s) => s.split(/\s+/).length > 20).length;
  const cappedLong = Math.min(longSentences, 10);
  if (cappedLong > 0) {
    score += DEFECTS.longSentence.weight * cappedLong;
    findings.push({
      key: 'longSentence',
      label: DEFECTS.longSentence.label,
      detail: `${longSentences}${longSentences > 10 ? ' (capped at 10)' : ''}`,
      blocking: DEFECTS.longSentence.blocking,
    });
  }

  return {score, findings};
}

module.exports = {
  gradeMarkdown,
  DEFECTS,
};
