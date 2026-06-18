#!/usr/bin/env node
'use strict';

/**
 * Find wizard-uploaded images under static/img/helpscout/authored/ that
 * aren't referenced by any docs/ article, optionally unlink them locally
 * and enqueue a git-delete via the live server's deploy queue.
 *
 * The same pattern lives at server.js's per-article isImageReferencedElsewhere
 * helper; this script generalises it across the whole authored/ tree so
 * housekeeping doesn't have to wait for an article-delete to fire.
 *
 * Usage:
 *   node scripts/prune-orphan-images.js                  # dry run
 *   node scripts/prune-orphan-images.js --apply          # unlink + enqueue deploy
 *   node scripts/prune-orphan-images.js --apply --local-only
 *                                                       # unlink, skip deploy queue
 *   node scripts/prune-orphan-images.js --apply \
 *     --server=https://help.smartwinnr.com \
 *     --cron-secret=$CRON_SECRET
 *
 * Defaults:
 *   --server          process.env.HELP_SITE_URL or http://localhost:3001
 *   --cron-secret     process.env.CRON_SECRET
 *
 * Exit codes:
 *   0  success (no orphans, or all deletions completed)
 *   1  partial failure (unlinks fine, enqueue failed)
 *   2  bad arguments / config
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(ROOT, 'static', 'img', 'helpscout', 'authored');
const DOCS_ROOT = path.join(ROOT, 'docs');
const STATIC_PREFIX = 'static/';
const URL_PREFIX = '/img/helpscout/authored/';

function parseArgs(argv) {
  const args = {
    apply: false,
    localOnly: false,
    server: process.env.HELP_SITE_URL || 'http://localhost:3001',
    cronSecret: process.env.CRON_SECRET || '',
    yes: false,
  };
  for (const a of argv.slice(2)) {
    if (a === '--apply') args.apply = true;
    else if (a === '--local-only') args.localOnly = true;
    else if (a === '-y' || a === '--yes') args.yes = true;
    else if (a.startsWith('--server=')) args.server = a.slice('--server='.length);
    else if (a.startsWith('--cron-secret=')) args.cronSecret = a.slice('--cron-secret='.length);
    else {
      console.error(`Unknown arg: ${a}`);
      process.exit(2);
    }
  }
  return args;
}

function listAuthoredImages() {
  if (!fs.existsSync(IMAGES_DIR)) return [];
  return fs
    .readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter((e) => e.isFile() && /\.(png|jpe?g|gif|webp)$/i.test(e.name))
    .map((e) => {
      const abs = path.join(IMAGES_DIR, e.name);
      return {
        name: e.name,
        abs,
        rel: path.relative(ROOT, abs).replace(/\\/g, '/'),  // e.g. static/img/helpscout/authored/X.png
        url: URL_PREFIX + e.name,                            //      /img/helpscout/authored/X.png
        size: fs.statSync(abs).size,
        mtimeMs: fs.statSync(abs).mtimeMs,
      };
    });
}

/** Walk docs/ for any .md/.mdx file content. Returns the concatenated body
 *  so a single substring-includes pass per image keeps the scan O(N+M)
 *  instead of O(N*M). */
function readAllDocsBodies() {
  if (!fs.existsSync(DOCS_ROOT)) return '';
  const parts = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
        try { parts.push(fs.readFileSync(p, 'utf8')); }
        catch {/* ignore unreadable */}
      }
    }
  })(DOCS_ROOT);
  return parts.join('\n');
}

function bytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function confirm(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (ans) => { rl.close(); resolve(/^y(es)?$/i.test(ans.trim())); });
  });
}

async function httpJsonPost(url, body, headers) {
  const { URL: NodeURL } = require('url');
  const u = new NodeURL(url);
  const lib = u.protocol === 'https:' ? require('https') : require('http');
  return new Promise((resolve, reject) => {
    const req = lib.request(
      u,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          ...headers,
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let data = null;
          try { data = JSON.parse(text); } catch {/* leave null */}
          if (res.statusCode >= 200 && res.statusCode < 300) resolve({ ok: true, status: res.statusCode, data, text });
          else resolve({ ok: false, status: res.statusCode, data, text });
        });
      },
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const args = parseArgs(process.argv);
  const images = listAuthoredImages();
  if (images.length === 0) {
    console.log(`No images in ${path.relative(ROOT, IMAGES_DIR)}.`);
    return;
  }

  console.log(`Scanned ${images.length} image(s) in ${path.relative(ROOT, IMAGES_DIR)}.`);
  console.log(`Reading docs/ references…`);
  const corpus = readAllDocsBodies();

  const used = [];
  const orphans = [];
  for (const img of images) {
    // Substring-includes is fine here: filenames carry a random suffix so
    // accidental collisions across articles are negligible.
    if (corpus.includes(img.url)) used.push(img);
    else orphans.push(img);
  }

  const totalSize = images.reduce((a, i) => a + i.size, 0);
  const orphanSize = orphans.reduce((a, i) => a + i.size, 0);

  console.log('');
  console.log(`  Referenced: ${used.length} (${bytes(totalSize - orphanSize)})`);
  console.log(`  Orphans:    ${orphans.length} (${bytes(orphanSize)})`);

  if (orphans.length === 0) {
    console.log('\nNothing to do.');
    return;
  }

  console.log('\nOrphan files (first 30):');
  for (const o of orphans.slice(0, 30)) {
    const age = (Date.now() - o.mtimeMs) / 1000 / 60 / 60 / 24;
    console.log(`  ${o.rel}  (${bytes(o.size)}, ${age.toFixed(1)}d old)`);
  }
  if (orphans.length > 30) console.log(`  …and ${orphans.length - 30} more.`);

  if (!args.apply) {
    console.log('\nDry run. Add --apply to unlink + enqueue git delete.');
    return;
  }

  if (!args.yes) {
    const tail = args.localOnly ? '' : ' AND enqueue them for the next deploy commit';
    const ok = await confirm(`\nUnlink ${orphans.length} file(s) locally${tail}? [y/N] `);
    if (!ok) { console.log('Aborted.'); return; }
  }

  // 1. Unlink locally.
  let unlinked = 0;
  for (const o of orphans) {
    try { fs.unlinkSync(o.abs); unlinked += 1; }
    catch (e) { console.warn(`  failed to unlink ${o.rel}: ${e.message}`); }
  }
  console.log(`\nUnlinked ${unlinked}/${orphans.length} file(s).`);

  if (args.localOnly) {
    console.log('--local-only: skipping deploy-queue enqueue.');
    console.log('Note: a Railway rebuild will restore these files from git unless you also commit the delete.');
    return;
  }

  // 2. Enqueue git delete via the live server.
  if (!args.cronSecret) {
    console.error('\nNo --cron-secret / CRON_SECRET env var. Cannot enqueue git delete.');
    console.error('Files are unlinked locally but git still holds them; next rebuild will restore.');
    process.exit(1);
  }
  console.log(`Enqueueing ${orphans.length} file(s) for git delete via ${args.server}…`);
  let result;
  try {
    result = await httpJsonPost(
      args.server + '/api/admin/authoring/deploy/enqueue-deletes',
      JSON.stringify({ paths: orphans.map((o) => o.rel) }),
      { 'x-cron-secret': args.cronSecret },
    );
  } catch (e) {
    console.error(`Network error contacting ${args.server}: ${e.message}`);
    process.exit(1);
  }
  if (!result.ok) {
    console.error(`Server returned ${result.status}: ${result.text || '(no body)'}`);
    process.exit(1);
  }
  console.log(`Server queued ${(result.data && result.data.queued) || 0} file(s) for the next deploy.`);
  console.log('Trigger the deploy now from /admin/authoring/drafts or wait for the debounce timer.');
}

main().catch((err) => { console.error(err); process.exit(1); });
