#!/usr/bin/env node
/**
 * LLM-rewrite worst-offender articles against the §15.1 canonical template.
 *
 * Pipeline:
 *   1. Read reports/article-audit-<latest>.md, extract files with score ≥ 50
 *      OR with the "Ghost stub" defect.
 *   2. For each, send the original markdown + sibling list to Claude with
 *      prompts/rewrite-article.md as the system prompt.
 *   3. Write the rewrite to rewrites/<same-path>.md (side-by-side diff for
 *      human review).
 *   4. On `--apply`, replace the originals in `docs/` with the rewrites.
 *
 * Requires ANTHROPIC_API_KEY in the environment.
 *
 * Usage:
 *   node scripts/rewrite-articles.js                          # rewrite all worst-offenders into rewrites/
 *   node scripts/rewrite-articles.js docs/modules/quiz        # scope to one path
 *   node scripts/rewrite-articles.js --limit 3                # cap to 3 articles
 *   node scripts/rewrite-articles.js --apply rewrites         # write rewrites/ → docs/
 */

const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const REWRITES = path.join(ROOT, 'rewrites');
const PROMPT_FILE = path.join(ROOT, 'prompts', 'rewrite-article.md');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const LIMIT_FLAG = args.indexOf('--limit');
const LIMIT = LIMIT_FLAG >= 0 ? parseInt(args[LIMIT_FLAG + 1], 10) : null;
const POSITIONAL = args.filter((a, i) => !a.startsWith('--')
  && !(args[i - 1] === '--limit'));
const SCOPE = POSITIONAL[0] ? path.resolve(POSITIONAL[0]) : null;
const MODEL = process.env.REWRITE_MODEL || 'claude-opus-4-7';

const APPLY_FROM_REWRITES = APPLY && SCOPE && fs.existsSync(SCOPE) && SCOPE.includes('/rewrites');

// ───────── Apply mode: copy rewrites/ over docs/ ────────────────────────

function applyFromRewrites() {
  if (!fs.existsSync(REWRITES)) {
    console.error('No rewrites/ directory found. Run without --apply first.');
    process.exit(1);
  }
  let n = 0;
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(p); continue; }
      if (!/\.(md|mdx)$/.test(entry.name)) continue;
      const rel = path.relative(REWRITES, p);
      const target = path.join(DOCS, rel);
      if (!fs.existsSync(target)) {
        console.warn(`Skipping (no target): ${rel}`);
        continue;
      }
      fs.copyFileSync(p, target);
      console.log(`Applied: ${path.relative(ROOT, target)}`);
      n++;
    }
  }
  walk(REWRITES);
  console.log(`\nDone. ${n} articles replaced in docs/.`);
}

if (APPLY_FROM_REWRITES) {
  applyFromRewrites();
  process.exit(0);
}

// ───────── Read worst-offenders from latest audit ───────────────────────

function findLatestAudit() {
  const dir = path.join(ROOT, 'reports');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir)
    .filter((f) => /^article-audit-\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .sort()
    .reverse();
  return files.length ? path.join(dir, files[0]) : null;
}

function readWorstOffenders() {
  const auditFile = findLatestAudit();
  if (!auditFile) {
    console.error('No audit report found. Run `npm run audit:articles` first.');
    process.exit(1);
  }
  const text = fs.readFileSync(auditFile, 'utf8');
  // Lines in the worst-25 section have shape:
  //   ### 1. `docs/modules/...`  [score 86]
  const re = /^### \d+\.\s+`([^`]+)`\s+\[score (\d+)\]/gm;
  const items = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    items.push({file: path.join(ROOT, m[1]), score: parseInt(m[2], 10)});
  }
  // Also include ghost stubs from the full list (table rows mentioning "Ghost stub").
  const tableRe = /^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|([^|]+)\|/gm;
  while ((m = tableRe.exec(text)) !== null) {
    const score = parseInt(m[1], 10);
    const file = path.join(ROOT, m[2]);
    const findings = m[3];
    if (/Ghost stub/i.test(findings) && !items.some((x) => x.file === file)) {
      items.push({file, score});
    }
  }
  return items;
}

// ───────── Build per-article context: siblings + image manifest ──────────

function siblingsFor(filepath) {
  const dir = path.dirname(filepath);
  const me = path.basename(filepath);
  const out = [];
  for (const entry of fs.readdirSync(dir)) {
    if (entry === me) continue;
    if (!/\.(md|mdx)$/.test(entry)) continue;
    const p = path.join(dir, entry);
    try {
      const {data} = matter(fs.readFileSync(p, 'utf8'));
      out.push({
        relPath: './' + entry,
        title: data.title || entry,
        description: data.description || '',
      });
    } catch {/* ignore */}
  }
  return out.slice(0, 12);
}

// ───────── Anthropic SDK call ────────────────────────────────────────────

async function rewriteOne(filepath) {
  const original = fs.readFileSync(filepath, 'utf8');
  const siblings = siblingsFor(filepath);
  const systemPrompt = fs.readFileSync(PROMPT_FILE, 'utf8');

  const Anthropic = require('@anthropic-ai/sdk').default || require('@anthropic-ai/sdk');
  const client = new Anthropic({apiKey: process.env.ANTHROPIC_API_KEY});

  const siblingList = siblings.length
    ? '\n\nSibling articles (for **What\'s next** cross-links):\n' +
      siblings.map((s) => `- \`${s.relPath}\` — ${s.title}${s.description ? ': ' + s.description : ''}`).join('\n')
    : '';

  const userMsg =
    `Rewrite this article against the canonical template in the system prompt.\n\n` +
    `Original article:\n\n` +
    '```markdown\n' + original + '\n```' +
    siblingList;

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 6000,
    system: systemPrompt,
    messages: [{role: 'user', content: userMsg}],
  });

  const text = res.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  return text;
}

// ───────── Main ──────────────────────────────────────────────────────────

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not set in environment. Set it (e.g. in .env) and re-run.');
    process.exit(1);
  }
  if (!fs.existsSync(PROMPT_FILE)) {
    console.error(`Prompt file not found: ${PROMPT_FILE}`);
    process.exit(1);
  }

  let targets = readWorstOffenders();
  if (SCOPE) {
    targets = targets.filter((t) => t.file.startsWith(SCOPE));
  }
  if (LIMIT) targets = targets.slice(0, LIMIT);

  if (!targets.length) {
    console.log('No targets to rewrite. (Re-run after `npm run audit:articles`.)');
    return;
  }

  console.log(`Rewriting ${targets.length} article(s) into rewrites/...`);
  console.log(`Model: ${MODEL}`);
  console.log('');

  let ok = 0;
  let failed = 0;
  for (const t of targets) {
    const rel = path.relative(DOCS, t.file);
    const outPath = path.join(REWRITES, rel);
    process.stdout.write(`  [score ${String(t.score).padStart(2)}] ${rel} ... `);
    try {
      const text = await rewriteOne(t.file);
      fs.mkdirSync(path.dirname(outPath), {recursive: true});
      fs.writeFileSync(outPath, text + '\n', 'utf8');
      console.log('ok');
      ok++;
    } catch (err) {
      console.log(`failed (${err.message})`);
      failed++;
    }
  }

  console.log('');
  console.log(`Done. ${ok} rewritten, ${failed} failed.`);
  console.log(`Review diffs:  git diff --no-index docs/ rewrites/`);
  console.log(`Apply:         node scripts/rewrite-articles.js --apply rewrites/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
