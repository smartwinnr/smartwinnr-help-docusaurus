#!/usr/bin/env node
/**
 * Article auto-fix - the cheap, mechanical fixes only. Run after `npm run
 * audit:articles` to see what the script will touch.
 *
 * What it fixes:
 *   1. Empty `description:` → derive from the first paragraph after
 *      frontmatter, strip markdown, condense to ≤160 chars at the nearest
 *      sentence boundary.
 *   2. Empty `tags: []` → seed from directory path + controlled vocab.
 *   3. Empty / filename-derived image alt text → derive from the nearest
 *      preceding heading or paragraph (≤5 lines above), strip markdown,
 *      truncate to 140 chars.
 *   4. Absolute help.smartwinnr.com URLs → rewrite to relative .md when a
 *      matching destination exists in the corpus.
 *
 * Idempotent. Each mutation is a separate hunk in the diff.
 *
 * Usage:
 *   node scripts/article-autofix.js               # dry run, prints what would change
 *   node scripts/article-autofix.js --apply       # writes files in place
 *   node scripts/article-autofix.js --apply docs/modules/quiz   # scope to a dir
 */

const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const SCOPE = args.find((a) => !a.startsWith('--'))
  ? path.resolve(args.find((a) => !a.startsWith('--')))
  : DOCS;

// Controlled tag vocabulary (mirrors STYLE.md).
const TAG_VOCAB = new Set([
  'quiz', 'smartpath', 'smartfeed', 'video-coaching', 'ai-coaching',
  'field-coaching', 'survey', 'knowledge-hub', 'forms', 'kpi',
  'gamification', 'reports', 'notifications', 'settings', 'admin',
  'troubleshooting', 'billing', 'onboarding', 'mobile', 'web', 'integration',
]);

// Map path segments → tags
const PATH_TAG_MAP = {
  'quiz': ['quiz'],
  'smartpath': ['smartpath'],
  'smartfeed': ['smartfeed'],
  'video-coaching': ['video-coaching'],
  'ai-coaching': ['ai-coaching'],
  'field-coaching': ['field-coaching'],
  'survey': ['survey'],
  'knowledge-hub': ['knowledge-hub'],
  'forms': ['forms'],
  'kpi-gamification': ['kpi', 'gamification'],
  'notifications': ['notifications'],
  'cross-module': [],
  'reports-and-analytics': ['reports'],
  'create-and-manage': ['admin'],
  'assign-and-schedule': ['admin'],
  'features': [],
  'settings-and-permissions': ['settings'],
  'faqs-and-troubleshooting': ['troubleshooting'],
  'for-learners': ['onboarding'],
  'for-managers': [],
  'administration': ['admin'],
  'access-permissions': ['admin', 'settings'],
  'system-management': ['admin', 'settings'],
  'integrations': ['integration'],
  'reports': ['reports'],
};

let totalEdits = 0;
let articlesTouched = 0;
const counts = {description: 0, tags: 0, alt: 0, link: 0};

// ───────── Helpers ───────────────────────────────────────────────────────

function listArticles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listArticles(p));
    else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) out.push(p);
  }
  return out;
}

function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, '')      // fenced code
    .replace(/`([^`]+)`/g, '$1')          // inline code
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/^\s*#{1,6}\s+/gm, '')        // headings
    .replace(/^\s*[-*+>]\s+/gm, '')         // list / quote
    .replace(/\*\*([^*]+)\*\*/g, '$1')     // bold
    .replace(/\*([^*]+)\*/g, '$1')          // italic
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')  // _italics_
    .replace(/<[^>]+>/g, '')                // raw HTML
    .replace(/\s+/g, ' ')
    .trim();
}

function condenseTo160(text) {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= 160) return clean;
  // Cut at the last sentence boundary within 160 chars.
  const truncated = clean.slice(0, 160);
  const boundary = truncated.search(/[.!?]\s/g);
  // Prefer last boundary, not first; search from the right.
  let lastBoundary = -1;
  const m = truncated.matchAll(/[.!?]\s/g);
  for (const x of m) lastBoundary = x.index;
  if (lastBoundary > 80) return truncated.slice(0, lastBoundary + 1).trim();
  // No nice boundary - cut at word and add ellipsis.
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.slice(0, lastSpace > 0 ? lastSpace : 160).trim() + '…';
}

function deriveDescription(body) {
  // First non-empty paragraph that isn't a heading, image, or blockquote.
  const lines = body.split('\n');
  let para = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (para) return condenseTo160(stripMarkdown(para));
      continue;
    }
    if (/^#{1,6}\s/.test(line)) { para = ''; continue; }
    if (/^!\[/.test(line)) { para = ''; continue; }
    if (line.startsWith('>')) { para = ''; continue; }
    if (line.startsWith(':::')) { para = ''; continue; }
    para = para ? para + ' ' + line : line;
  }
  return para ? condenseTo160(stripMarkdown(para)) : '';
}

function deriveTags(filepath) {
  const rel = path.relative(DOCS, filepath).split(path.sep);
  const set = new Set();
  for (const seg of rel) {
    const tags = PATH_TAG_MAP[seg];
    if (tags) tags.forEach((t) => set.add(t));
  }
  // Cap at 4 to keep it tight.
  return [...set].filter((t) => TAG_VOCAB.has(t)).slice(0, 4);
}

function deriveAltText(lines, imageLine) {
  // Walk up to 5 lines back for context.
  for (let i = imageLine - 1; i >= Math.max(0, imageLine - 5); i--) {
    const line = lines[i].trim();
    if (!line) continue;
    // Heading
    const hMatch = /^#{2,4}\s+(.+)$/.exec(line);
    if (hMatch) return stripMarkdown(hMatch[1]).slice(0, 140);
    // Numbered list item
    const liMatch = /^\d+\.\s+(.+)$/.exec(line);
    if (liMatch) return stripMarkdown(liMatch[1]).slice(0, 140);
    // Plain paragraph
    if (!/^[!#>\-*+]/.test(line)) {
      const stripped = stripMarkdown(line);
      if (stripped) return stripped.slice(0, 140);
    }
  }
  return '';
}

function isFilenameAlt(alt) {
  return !alt || /^[a-z0-9-]+(\.[a-z]+)?$/.test(alt);
}

// ───────── Apply fixes to one file ───────────────────────────────────────

function fixFile(filepath) {
  const raw = fs.readFileSync(filepath, 'utf8');
  const {data: fm, content} = matter(raw);
  let changed = false;
  const fixes = [];

  // 1. Description
  if (!fm.description || String(fm.description).trim() === '') {
    const derived = deriveDescription(content);
    if (derived && derived.length >= 20) {
      fm.description = derived;
      fixes.push(`description ← "${derived.slice(0, 60)}..."`);
      counts.description++;
      changed = true;
    }
  }

  // 2. Tags
  if (!fm.tags || (Array.isArray(fm.tags) && fm.tags.length === 0)) {
    const tags = deriveTags(filepath);
    if (tags.length) {
      fm.tags = tags;
      fixes.push(`tags ← [${tags.join(', ')}]`);
      counts.tags++;
      changed = true;
    }
  }

  // 3. Image alt text
  const lines = content.split('\n');
  let altFixed = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const newLine = line.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (full, alt, src) => {
      if (!isFilenameAlt(alt)) return full;
      const derived = deriveAltText(lines, i);
      if (!derived) return full;
      altFixed++;
      return `![${derived}](${src})`;
    });
    if (newLine !== line) {
      lines[i] = newLine;
      changed = true;
    }
  }
  if (altFixed > 0) {
    fixes.push(`${altFixed} image alt(s) derived`);
    counts.alt += altFixed;
  }

  // 4. Absolute help.smartwinnr.com → relative when destination exists.
  //    Conservative: only rewrite when we can locate the article by slug
  //    in the current corpus.
  let linkFixed = 0;
  const newLines = lines.map((line) =>
    line.replace(/https?:\/\/help\.smartwinnr\.com\/article\/\d+-([a-z0-9-]+)/gi, (full, slug) => {
      const candidate = articleBySlug.get(slug);
      if (!candidate) return full;
      const relPath = path.relative(path.dirname(filepath), candidate);
      const rel = relPath.startsWith('.') ? relPath : './' + relPath;
      linkFixed++;
      return rel;
    }),
  );
  if (linkFixed > 0) {
    fixes.push(`${linkFixed} absolute link(s) → relative .md`);
    counts.link += linkFixed;
    // commit the line rewrites
    for (let i = 0; i < newLines.length; i++) lines[i] = newLines[i];
    changed = true;
  }

  if (!changed) return null;

  totalEdits += fixes.length;
  articlesTouched++;

  const newContent = lines.join('\n');
  // gray-matter's stringify preserves key order; pass the original data
  // and the (possibly mutated) content.
  const out = matter.stringify(newContent, fm);

  if (APPLY) fs.writeFileSync(filepath, out, 'utf8');
  return {file: path.relative(ROOT, filepath), fixes};
}

// ───────── Build slug → file map ────────────────────────────────────────

const articleBySlug = new Map();
function buildSlugMap() {
  for (const f of listArticles(DOCS)) {
    try {
      const {data} = matter(fs.readFileSync(f, 'utf8'));
      if (data.slug) {
        const slug = String(data.slug).replace(/^\/+/, '').split('/').pop();
        articleBySlug.set(slug, f);
      }
    } catch {/* ignore */}
  }
}

// ───────── Run ───────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(SCOPE)) {
    console.error(`Scope path not found: ${SCOPE}`);
    process.exit(1);
  }
  console.log(`Scanning ${path.relative(ROOT, SCOPE) || 'docs'}${APPLY ? ' (applying)' : ' (dry run - pass --apply to write)'}\n`);

  buildSlugMap();

  const files = fs.statSync(SCOPE).isDirectory()
    ? listArticles(SCOPE)
    : [SCOPE];

  for (const f of files) {
    const result = fixFile(f);
    if (result) {
      console.log(`✏  ${result.file}`);
      for (const fix of result.fixes) console.log(`    • ${fix}`);
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Articles touched: ${articlesTouched}`);
  console.log(`Total fixes:      ${totalEdits}`);
  console.log(`  description:    ${counts.description}`);
  console.log(`  tags:           ${counts.tags}`);
  console.log(`  alt text:       ${counts.alt}`);
  console.log(`  absolute links: ${counts.link}`);
  if (!APPLY) console.log('\n(Dry run; pass --apply to write changes.)');
}

main();
