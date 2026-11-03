'use strict';

/**
 * Pure-function article audit. Grades a markdown string against the
 * canonical Apple-grade template (STYLE.md + plan §15.1).
 *
 * Exports:
 *   gradeMarkdown(text, opts?) → {score, findings: Finding[]}
 *
 * Finding shape:
 *   { key: string,          // defect catalog key, e.g. 'ghostStub'
 *     label: string,        // canonical human label from DEFECTS
 *     detail?: string,      // optional contextual info ("56 words", filename, …)
 *     blocking: boolean,    // refuses save/publish when true
 *     buildBreaking: bool } // would hard-fail the production build (MDX/YAML/
 *                           // privilege) - enforced even where style findings
 *                           // are advisory (save-raw, deploy pre-flight)
 *
 * Used by:
 *   • scripts/audit-articles.js - walks docs/** and aggregates findings
 *   • server.js - POST /api/admin/authoring/{save,publish} refuses to
 *     write when any blocking finding fires; save-raw and the deploy
 *     pre-flight refuse only on buildBreaking findings
 */

const matter = require('gray-matter');

// Defect catalog. `weight` adds to the priority score. `blocking` means
// the save/publish endpoints refuse to write when this defect fires.
// `build` means the defect would hard-fail the Railway production build.
const DEFECTS = {
  mdxCompileError:  {weight: 10, blocking: true,  build: true, label: 'MDX compile error (breaks the production build)'},
  unknownPrivilege: {weight: 10, blocking: true,  build: true, label: 'Unknown privilege key (fails prebuild validate-privilege-keys)'},
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
 * @param {(body: string) => void} [opts.compileMdx] If set, called with the
 *   post-frontmatter body; a throw fires `mdxCompileError` with the message.
 * @param {Set<string>} [opts.knownPrivileges] If set (non-empty), frontmatter
 *   `customProps.privilege`/`anyPrivilege` keys outside the set fire
 *   `unknownPrivilege`.
 * @returns {{score: number, findings: Array<{key:string,label:string,detail?:string,blocking:boolean,buildBreaking:boolean,line?:number,column?:number}>}}
 *   `line`/`column` (1-based) are positions in the FULL `text` (frontmatter
 *   included), so editors can jump straight to the offending line.
 */
function gradeMarkdown(text, opts = {}) {
  const findings = [];
  let score = 0;

  function flag(key, detail, pos) {
    const def = DEFECTS[key];
    if (!def) return;
    score += def.weight;
    findings.push({
      key,
      label: def.label,
      detail: detail || undefined,
      blocking: !!def.blocking,
      buildBreaking: !!def.build,
      ...(pos && pos.line ? {line: pos.line, ...(pos.column ? {column: pos.column} : {})} : {}),
    });
  }

  let fm = {};
  let body = '';
  // Lines in `text` that precede the trimmed body, so a body-relative MDX
  // error line can be reported as the line the author sees in the editor.
  let bodyLineOffset = 0;
  try {
    const parsed = matter(text);
    fm = parsed.data || {};
    const content = parsed.content || '';
    body = content.trim();
    let bodyStart = text.endsWith(content)
      ? text.length - content.length + (content.length - content.trimStart().length)
      : text.indexOf(body);
    if (bodyStart < 0) bodyStart = 0;
    bodyLineOffset = (text.slice(0, bodyStart).match(/\n/g) || []).length;
  } catch (e) {
    // js-yaml marks are 0-based within the YAML block, which starts on the
    // line after the opening `---` (file line 2).
    const mark = e && e.mark;
    const line = mark && Number.isInteger(mark.line) ? mark.line + 2 : undefined;
    const reason = (e && (e.reason || e.message)) || '';
    findings.push({
      key: 'malformedFrontmatter',
      label: 'Malformed frontmatter (could not parse YAML)',
      detail: reason ? `${reason}${line ? ` (line ${line})` : ''}` : undefined,
      blocking: true,
      buildBreaking: true,
      ...(line ? {line, ...(Number.isInteger(mark.column) ? {column: mark.column + 1} : {})} : {}),
    });
    return {score: 100, findings};
  }

  // Build-physics checks - these mirror what the Railway build enforces, so
  // they must catch problems BEFORE a commit ships.
  if (typeof opts.compileMdx === 'function') {
    try {
      opts.compileMdx(body);
    } catch (e) {
      const line = e.line ? e.line + bodyLineOffset : undefined;
      const column = line && e.column ? e.column : undefined;
      const place = line ? ` (line ${line}${column ? `:${column}` : ''})` : '';
      flag('mdxCompileError', `${e.reason || e.message}${place}`, {line, column});
    }
  }
  if (opts.knownPrivileges instanceof Set && opts.knownPrivileges.size > 0) {
    const cp = fm.customProps || {};
    const keys = [
      ...(typeof cp.privilege === 'string' ? [cp.privilege] : []),
      ...(Array.isArray(cp.anyPrivilege) ? cp.anyPrivilege : []),
    ];
    const unknown = keys.filter((k) => !opts.knownPrivileges.has(String(k)));
    if (unknown.length > 0) {
      // Point at the frontmatter line that declares the privilege.
      const fmEnd = bodyLineOffset;
      const lines = text.split('\n');
      let line;
      for (let i = 1; i < Math.min(fmEnd, lines.length); i++) {
        if (/^\s*(privilege|anyPrivilege)\s*:/.test(lines[i])) { line = i + 1; break; }
      }
      flag('unknownPrivilege', unknown.join(', ') + (line ? ` (line ${line})` : ''), {line});
    }
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

  // Images. An alt is bad when it's empty, still the editor's insertion
  // placeholder, or clearly the file's name rather than a description.
  // A short human word ("dashboard") is NOT flagged - authors kept hitting
  // false positives when any lowercase alt counted as filename-derived.
  const imageMatches = [...body.matchAll(/!\[([^\]]*)\]\(\s*([^)\s]+)\s*\)/g)];
  const badAltImages = [];
  for (const m of imageMatches) {
    const alt = (m[1] || '').trim();
    const url = m[2] || '';
    const base = url.split('/').pop() || '';
    const baseNoExt = base.replace(/\.[a-z0-9]+$/i, '');
    const looksLikeFilename = alt
      && (/\.(png|jpe?g|gif|webp|svg)$/i.test(alt)
        || alt.toLowerCase() === base.toLowerCase()
        || alt.toLowerCase() === baseNoExt.toLowerCase()
        || (/^[a-z0-9-]+$/.test(alt) && /\d/.test(alt)));
    if (!alt || alt === 'describe this screenshot' || looksLikeFilename) {
      badAltImages.push(base || url);
    }
  }
  if (badAltImages.length > 0) {
    score += DEFECTS.badAltText.weight * badAltImages.length;
    const shown = badAltImages.slice(0, 3).join(', ')
      + (badAltImages.length > 3 ? `, +${badAltImages.length - 3} more` : '');
    findings.push({
      key: 'badAltText',
      label: DEFECTS.badAltText.label,
      detail: `${badAltImages.length} image(s) need a short description inside the square brackets, e.g. ![Login screen](...) - ${shown}`,
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
