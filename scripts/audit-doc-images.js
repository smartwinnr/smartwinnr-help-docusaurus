#!/usr/bin/env node
/**
 * Inventory every image referenced by docs/ and report which ones a reader
 * would actually see.
 *
 * Local images (/img/...) are checked against static/ on disk. External images
 * are HTTP-checked, because a large share of the Help Scout migration still
 * points at third-party hosts that no longer serve the file - the reader gets
 * a broken-image icon in the middle of a procedure.
 *
 * REPORT ONLY - this script never edits an article. It writes a markdown
 * report you can triage from.
 *
 * Usage:
 *   npm run audit:images:external              # check external hosts (network)
 *   npm run audit:images:external -- --local   # skip network, local files only
 *   npm run audit:images:external -- --out report.md
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const REPO_ROOT = path.join(__dirname, '..');
const DOCS_ROOT = path.join(REPO_ROOT, 'docs');
const STATIC_ROOT = path.join(REPO_ROOT, 'static');
const CONCURRENCY = 8;
const TIMEOUT_MS = 10_000;

const args = process.argv.slice(2);
const localOnly = args.includes('--local');
const outIdx = args.indexOf('--out');
const outFile = outIdx !== -1 ? args[outIdx + 1] : path.join(REPO_ROOT, 'data', 'image-audit-report.md');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.mdx?$/i.test(entry.name)) out.push(p);
  }
  return out;
}

/** Every image reference in docs/, as {article, url, kind}. */
function collectRefs() {
  const refs = [];
  for (const f of walk(DOCS_ROOT)) {
    const article = path.relative(DOCS_ROOT, f).replace(/\\/g, '/');
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) {
      refs.push({ article, url: m[1], kind: /^https?:/i.test(m[1]) ? 'external' : 'local' });
    }
    for (const m of src.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
      refs.push({ article, url: m[1], kind: /^https?:/i.test(m[1]) ? 'external' : 'local' });
    }
  }
  return refs;
}

function checkUrl(url) {
  return new Promise((resolve) => {
    let lib;
    try { lib = new URL(url).protocol === 'http:' ? http : https; } catch { return resolve('BAD_URL'); }
    const req = lib.request(url, { method: 'GET', timeout: TIMEOUT_MS }, (res) => {
      res.destroy(); // headers are all we need
      resolve(res.statusCode);
    });
    req.on('error', (e) => resolve(`ERR_${e.code || 'UNKNOWN'}`));
    req.on('timeout', () => { req.destroy(); resolve('TIMEOUT'); });
    req.end();
  });
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }));
  return results;
}

function isOk(status) {
  return typeof status === 'number' && status >= 200 && status < 400;
}

async function main() {
  const refs = collectRefs();
  const local = refs.filter((r) => r.kind === 'local');
  const external = refs.filter((r) => r.kind === 'external');

  const localMissing = local.filter((r) => !fs.existsSync(path.join(STATIC_ROOT, r.url.split(/[?#]/)[0])));
  console.log(`🖼️  ${refs.length} image refs: ${local.length} local (${localMissing.length} missing), ${external.length} external`);

  const byHost = {};
  for (const r of external) {
    let host = 'unparseable';
    try { host = new URL(r.url).host; } catch { /* keep */ }
    (byHost[host] = byHost[host] || []).push(r);
  }
  console.log('   external hosts:');
  for (const [h, list] of Object.entries(byHost).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`     ${String(list.length).padStart(4)}  ${h}`);
  }

  let statuses = new Map();
  if (!localOnly && external.length) {
    const unique = [...new Set(external.map((r) => r.url))];
    console.log(`\n🌐 checking ${unique.length} unique external URLs (concurrency ${CONCURRENCY})...`);
    const results = await mapLimit(unique, CONCURRENCY, checkUrl);
    unique.forEach((u, i) => statuses.set(u, results[i]));
  }

  const brokenExternal = external.filter((r) => statuses.has(r.url) && !isOk(statuses.get(r.url)));

  // ---- report
  const lines = [];
  lines.push('# Doc image audit', '');
  lines.push(`- Total image references: **${refs.length}**`);
  lines.push(`- Local: **${local.length}** (missing on disk: **${localMissing.length}**)`);
  lines.push(`- External: **${external.length}**` + (localOnly ? ' (not checked - --local)' : ` (broken: **${brokenExternal.length}**)`));
  lines.push('');

  if (localMissing.length) {
    lines.push('## Local images missing from static/', '');
    lines.push('| Article | Path |', '|---|---|');
    for (const r of localMissing) lines.push(`| ${r.article} | ${r.url} |`);
    lines.push('');
  }

  if (!localOnly) {
    lines.push('## External images by host', '');
    lines.push('| Host | Refs | Broken |', '|---|---|---|');
    for (const [h, list] of Object.entries(byHost).sort((a, b) => b[1].length - a[1].length)) {
      const broken = list.filter((r) => !isOk(statuses.get(r.url))).length;
      lines.push(`| ${h} | ${list.length} | ${broken} |`);
    }
    lines.push('');

    if (brokenExternal.length) {
      lines.push('## Broken external images (per article)', '');
      const byArticle = {};
      for (const r of brokenExternal) (byArticle[r.article] = byArticle[r.article] || []).push(r);
      for (const [article, list] of Object.entries(byArticle).sort((a, b) => b[1].length - a[1].length)) {
        lines.push(`### ${article} (${list.length})`, '');
        for (const r of list) lines.push(`- \`${statuses.get(r.url)}\` ${r.url}`);
        lines.push('');
      }
    }
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, lines.join('\n'));
  console.log(`\n📄 report written to ${path.relative(REPO_ROOT, outFile)}`);

  if (localMissing.length) {
    console.log(`\n❌ ${localMissing.length} local image(s) missing from static/`);
    process.exit(1);
  }
  if (brokenExternal.length) {
    console.log(`\n⚠️  ${brokenExternal.length} external image ref(s) are broken for readers (report only - no exit failure)`);
  } else if (!localOnly) {
    console.log('\n✅ Every image reference resolves.');
  }
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Image audit failed:', e.message);
  process.exit(2);
});
