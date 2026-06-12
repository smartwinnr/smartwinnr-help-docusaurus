#!/usr/bin/env node
/**
 * Article audit - walks docs/** and grades every article against the
 * canonical Apple-grade template (STYLE.md + plan §15.1).
 *
 * Output: `reports/article-audit-<YYYY-MM-DD>.md` (path passed as arg, or
 * derived from today's date). Read-only on the corpus - no markdown edits.
 *
 * Usage:
 *   node scripts/audit-articles.js                       # default report path
 *   node scripts/audit-articles.js reports/custom.md      # explicit path
 */

const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');

// ───────── Defect catalog (weight = priority points; higher = worse) ─────
const DEFECTS = {
  emptyDescription:   {weight: 10, label: 'Empty `description:`'},
  noHeadings:         {weight: 10, label: 'No h2/h3 headings (text wall)'},
  ghostStub:          {weight:  9, label: 'Ghost stub (<80 words body)'},
  badAltText:         {weight:  2, label: 'Image with empty/filename alt'}, // per image
  inlineStep:         {weight:  7, label: 'Inline "Step N:" plain text (should be h3)'},
  emptyTags:          {weight:  5, label: 'Empty `tags: []`'},
  noCrossLink:        {weight:  4, label: 'No relative cross-link to a related article'},
  ledeBoilerplate:    {weight:  3, label: 'Lede starts with throat-clearing'},
  missingPrivilege:   {weight:  3, label: 'Missing `customProps.privilege` while parent folder has one'},
  absoluteHelpLink:   {weight:  1, label: 'Absolute help.smartwinnr.com link (should be relative)'}, // per link
  longSentence:       {weight:  1, label: 'Sentence > 20 words'}, // per sentence - capped
};

const BOILERPLATE_OPENERS = [
  /^this article (will )?(explain|cover|describe|show|guide)/i,
  /^in this (article|guide|tutorial|document)/i,
  /^welcome(,)?\s/i,
  /^let'?s (start|begin|dive)/i,
];

const CONTROLLED_TAGS = new Set([
  'quiz', 'smartpath', 'smartfeed', 'video-coaching', 'ai-coaching',
  'field-coaching', 'survey', 'knowledge-hub', 'forms', 'kpi',
  'gamification', 'reports', 'notifications', 'settings', 'admin',
  'troubleshooting', 'billing', 'onboarding', 'mobile', 'web', 'integration',
]);

// ───────── Helpers ───────────────────────────────────────────────────────

function listArticles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listArticles(p));
    } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name) && entry.name !== '_category_.json') {
      out.push(p);
    }
  }
  return out;
}

function readParent(filepath) {
  let dir = path.dirname(filepath);
  while (dir.startsWith(DOCS)) {
    const cat = path.join(dir, '_category_.json');
    if (fs.existsSync(cat)) {
      try { return JSON.parse(fs.readFileSync(cat, 'utf8')); } catch { return null; }
    }
    dir = path.dirname(dir);
  }
  return null;
}

function gradeArticle(filepath) {
  const raw = fs.readFileSync(filepath, 'utf8');
  const {data: fm, content} = matter(raw);
  const findings = [];
  let score = 0;

  function flag(key, detail) {
    const def = DEFECTS[key];
    if (!def) return;
    score += def.weight;
    findings.push(detail ? `${def.label} - ${detail}` : def.label);
  }

  // Frontmatter checks
  if (!fm.description || String(fm.description).trim() === '') {
    flag('emptyDescription');
  }
  if (!fm.tags || (Array.isArray(fm.tags) && fm.tags.length === 0)) {
    flag('emptyTags');
  }
  const parentCat = readParent(filepath);
  const parentPriv = parentCat?.customProps?.privilege;
  const articlePriv = fm.customProps?.privilege;
  if (parentPriv && !articlePriv) {
    flag('missingPrivilege', `parent declares ${parentPriv}`);
  }

  // Body analysis
  const body = content.trim();
  const words = body.split(/\s+/).filter(Boolean);
  if (words.length < 80) {
    flag('ghostStub', `${words.length} words`);
  }

  // Headings: count h2/h3 lines
  const headingLines = body.split('\n').filter((l) => /^#{2,3}\s/.test(l));
  if (headingLines.length === 0 && words.length > 200) {
    flag('noHeadings');
  }

  // Images
  const imageMatches = [...body.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];
  let badAltCount = 0;
  for (const m of imageMatches) {
    const alt = (m[1] || '').trim();
    const filenameDerived = alt && /^[a-z0-9-]+(\.[a-z]+)?$/.test(alt);
    if (!alt || filenameDerived) badAltCount++;
  }
  for (let i = 0; i < badAltCount; i++) flag('badAltText');
  if (badAltCount > 0) {
    // Replace the per-image entries with a single summarized one.
    const matchCount = findings.filter((f) => f === DEFECTS.badAltText.label).length;
    if (matchCount > 1) {
      const first = findings.findIndex((f) => f === DEFECTS.badAltText.label);
      findings.splice(first, matchCount, `${DEFECTS.badAltText.label} × ${badAltCount}`);
    }
  }

  // Inline "Step N:" plain text outside headings
  const stepInline = body.split('\n').filter((l) => /^[^#].*\bStep\s*\d+\s*:/i.test(l)).length;
  if (stepInline > 0) {
    flag('inlineStep', `${stepInline} occurrence(s)`);
  }

  // Lede boilerplate - first non-empty, non-blockquote, non-heading paragraph
  const ledeMatch = body.match(/^(?!#|>|!\[)(.+)$/m);
  if (ledeMatch && BOILERPLATE_OPENERS.some((re) => re.test(ledeMatch[1]))) {
    flag('ledeBoilerplate', `"${ledeMatch[1].slice(0, 60)}..."`);
  }

  // Cross-link to a related article (relative .md or sub-path under modules/)
  const hasCrossLink = /\]\(\.\.?\/[^)]+\.md\)/.test(body)
    || /\]\(\/modules\/[^)]+\)/.test(body);
  if (!hasCrossLink && words.length > 120) {
    flag('noCrossLink');
  }

  // Absolute help.smartwinnr.com links
  const helpAbsCount = (body.match(/https?:\/\/help\.smartwinnr\.com\/\S+/g) || []).length;
  for (let i = 0; i < Math.min(helpAbsCount, 5); i++) flag('absoluteHelpLink');
  if (helpAbsCount > 1) {
    const first = findings.findIndex((f) => f === DEFECTS.absoluteHelpLink.label);
    if (first >= 0) {
      const matchCount = findings.filter((f) => f === DEFECTS.absoluteHelpLink.label).length;
      findings.splice(first, matchCount, `${DEFECTS.absoluteHelpLink.label} × ${helpAbsCount}`);
    }
  }

  // Long sentences (cap contribution at 10 points so this doesn't dominate)
  const sentences = body.replace(/```[\s\S]*?```/g, '').split(/(?<=[.!?])\s+/);
  const longSentenceCount = sentences.filter((s) => s.split(/\s+/).length > 20).length;
  const capped = Math.min(longSentenceCount, 10);
  for (let i = 0; i < capped; i++) flag('longSentence');
  if (longSentenceCount > 1) {
    const first = findings.findIndex((f) => f === DEFECTS.longSentence.label);
    if (first >= 0) {
      const matchCount = findings.filter((f) => f === DEFECTS.longSentence.label).length;
      findings.splice(first, matchCount, `${DEFECTS.longSentence.label} × ${longSentenceCount}${longSentenceCount > 10 ? ' (capped)' : ''}`);
    }
  }

  return {
    file: path.relative(ROOT, filepath),
    title: fm.title || '(no title)',
    wordCount: words.length,
    headingCount: headingLines.length,
    imageCount: imageMatches.length,
    badAltCount,
    score,
    findings,
  };
}

function folderOf(file) {
  // docs/modules/quiz/create-and-manage/<file>.md → docs/modules/quiz/create-and-manage/
  return path.dirname(file).split(path.sep).slice(0, -0).join('/') + '/';
}

function pad(s, n) { s = String(s); return s + ' '.repeat(Math.max(0, n - s.length)); }

function buildReport(results, outPath) {
  results.sort((a, b) => b.score - a.score);
  const totalArticles = results.length;
  const clean = results.filter((r) => r.findings.length === 0).length;
  const withFindings = totalArticles - clean;
  const avgScore = (results.reduce((s, r) => s + r.score, 0) / totalArticles).toFixed(1);

  const lines = [];
  const date = new Date().toISOString().slice(0, 10);
  lines.push(`# Article audit - ${date}`);
  lines.push('');
  lines.push(`${totalArticles} articles scanned · ${clean} clean · ${withFindings} with findings · Average score ${avgScore}`);
  lines.push('');
  lines.push('Scoring: each defect adds weight points (see `scripts/audit-articles.js`). Higher score = more urgent. Companion: STYLE.md and plan §15.1.');
  lines.push('');

  // Worst N
  lines.push('## Worst 25 articles (highest priority)');
  lines.push('');
  for (let i = 0; i < Math.min(25, results.length); i++) {
    const r = results[i];
    if (r.findings.length === 0) break;
    lines.push(`### ${i + 1}. \`${r.file}\`  [score ${r.score}]`);
    lines.push(`${r.title} · ${r.wordCount} words · ${r.headingCount} headings · ${r.imageCount} images`);
    lines.push('');
    for (const f of r.findings) lines.push(`- ${f}`);
    lines.push('');
  }

  // Sub-folder roll-ups
  const folders = new Map();
  for (const r of results) {
    const folder = path.dirname(r.file);
    if (!folders.has(folder)) folders.set(folder, []);
    folders.get(folder).push(r);
  }
  const rollups = [...folders.entries()]
    .map(([folder, arts]) => ({
      folder,
      count: arts.length,
      clean: arts.filter((a) => a.findings.length === 0).length,
      avgScore: (arts.reduce((s, a) => s + a.score, 0) / arts.length).toFixed(1),
    }))
    .sort((a, b) => parseFloat(b.avgScore) - parseFloat(a.avgScore));

  lines.push('## Sub-folder roll-ups');
  lines.push('');
  lines.push('| Folder | Articles | Clean | Avg score |');
  lines.push('|---|:-:|:-:|:-:|');
  for (const r of rollups) {
    lines.push(`| \`${r.folder}/\` | ${r.count} | ${r.clean} | ${r.avgScore} |`);
  }
  lines.push('');

  // Defect totals
  const totals = {};
  for (const r of results) {
    for (const f of r.findings) {
      // Strip the trailing " - detail" or " × N" so the key is the defect label.
      const key = f.replace(/\s+-\s+.+$/, '').replace(/\s+×\s+\d+.*$/, '');
      totals[key] = (totals[key] || 0) + 1;
    }
  }
  lines.push('## Defect totals (article-level counts)');
  lines.push('');
  for (const [label, count] of Object.entries(totals).sort((a, b) => b[1] - a[1])) {
    lines.push(`- ${label}: ${count}`);
  }
  lines.push('');

  // Full article list (compact)
  lines.push('## All articles (full list, ordered by score)');
  lines.push('');
  lines.push('| Score | File | Findings |');
  lines.push('|--:|---|---|');
  for (const r of results) {
    const findingsSummary = r.findings.length
      ? r.findings.map((f) => f.split(' - ')[0]).slice(0, 4).join('; ') + (r.findings.length > 4 ? '; …' : '')
      : '-';
    lines.push(`| ${r.score} | \`${r.file}\` | ${findingsSummary} |`);
  }

  fs.mkdirSync(path.dirname(outPath), {recursive: true});
  fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
  return {totalArticles, clean, withFindings, avgScore};
}

function main() {
  const arg = process.argv[2];
  const date = new Date().toISOString().slice(0, 10);
  const outPath = arg
    ? path.resolve(arg)
    : path.join(ROOT, 'reports', `article-audit-${date}.md`);

  console.log(`Auditing articles under ${DOCS}...`);
  const articles = listArticles(DOCS).filter((f) => !f.endsWith('/index.mdx') || /docs\/modules\/[^/]+\/index\.mdx$/.test(f));
  const results = articles.map((f) => gradeArticle(f));

  const summary = buildReport(results, outPath);
  console.log(`Done. Wrote ${outPath}`);
  console.log(`Summary: ${summary.totalArticles} articles · ${summary.clean} clean · ${summary.withFindings} with findings · avg ${summary.avgScore}`);
}

main();
