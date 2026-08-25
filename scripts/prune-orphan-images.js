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
 * WHERE YOU RUN THIS MATTERS. Drafts live only on the server's volume and
 * never reach git, so a scan of a local checkout cannot see them and will
 * report a draft's screenshots as abandoned. --remote asks the live server
 * for the list instead, which is the only answer safe to act on; a local
 * scan is a rough estimate and refuses --apply without --force-local.
 *
 * Usage:
 *   npm run audit:images                                 # local dry run (estimate)
 *   node scripts/prune-orphan-images.js --remote \
 *     --server=https://help.smartwinnr.com \
 *     --cron-secret=$CRON_SECRET                         # authoritative report
 *   node scripts/prune-orphan-images.js --remote --apply --server=... --cron-secret=...
 *                                                       # report, then queue the deletes
 *   node scripts/prune-orphan-images.js --json           # machine-readable
 *
 * Defaults:
 *   --server          process.env.HELP_SITE_URL or http://localhost:3001
 *   --cron-secret     process.env.CRON_SECRET
 *   --min-age-days    1 (an upload younger than this is mid-edit, not abandoned)
 *
 * Flags:
 *   --remote          ask the live server (sees drafts) instead of scanning here
 *   --apply           act on the findings (unlink locally / queue git deletes)
 *   --local-only      with --apply: unlink here, don't touch the deploy queue
 *   --force-local     allow --apply on a local scan - only when you know this
 *                     checkout has every draft the server has
 *   --json            print JSON, skip the prose report
 *   -y / --yes        skip the confirmation prompt
 *
 * Exit codes:
 *   0  success (no orphans, or all deletions completed)
 *   1  partial failure (unlinks fine, enqueue failed)
 *   2  bad arguments / config / unsafe --apply
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
    remote: false,
    forceLocal: false,
    json: false,
    minAgeDays: 1,
    server: process.env.HELP_SITE_URL || 'http://localhost:3001',
    cronSecret: process.env.CRON_SECRET || '',
    yes: false,
  };
  for (const a of argv.slice(2)) {
    if (a === '--apply') args.apply = true;
    else if (a === '--local-only') args.localOnly = true;
    else if (a === '--remote') args.remote = true;
    else if (a === '--force-local') args.forceLocal = true;
    else if (a === '--json') args.json = true;
    else if (a.startsWith('--min-age-days=')) args.minAgeDays = Math.max(0, parseFloat(a.slice('--min-age-days='.length)) || 0);
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

/** Upload time from the filename's base36 stamp (the upload route writes
 *  Date.now().toString(36) into it). mtime is worthless for this: the server
 *  rebuilds its disk on every deploy, and a git checkout stamps files with
 *  the clone time. Mirrors authoredImageUploadedTs in server.js. */
function uploadedTsOf(name, fallbackMs) {
  const stamp = name.replace(/\.[a-z0-9]+$/i, '').split('-').pop();
  if (!/^[0-9a-z]{7,10}$/.test(stamp)) return fallbackMs;
  const ms = parseInt(stamp, 36);
  if (!Number.isFinite(ms) || ms < 1704067200000 || ms > Date.now() + 86400000) return fallbackMs;
  return ms;
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
        uploadedTs: uploadedTsOf(e.name, fs.statSync(abs).mtimeMs),
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

async function httpJson(method, url, body, headers) {
  const { URL: NodeURL } = require('url');
  const u = new NodeURL(url);
  const lib = u.protocol === 'https:' ? require('https') : require('http');
  return new Promise((resolve, reject) => {
    const req = lib.request(u, { method, headers: headers || {} }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let data = null;
        try { data = JSON.parse(text); } catch { /* leave null */ }
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data, text });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
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
  const say = (...m) => { if (!args.json) console.log(...m); };

  // Gather. Remote is authoritative (the server sees drafts); local is an
  // estimate of the same thing from whatever this checkout happens to hold.
  let orphans;
  let scanned;
  let tooFresh = 0;
  if (args.remote) {
    const url = `${args.server.replace(/\/$/, '')}/api/admin/authoring/orphan-images?minAgeDays=${args.minAgeDays}`;
    say(`Asking ${args.server} for its abandoned-image list…`);
    let resp;
    try {
      resp = await httpJson('GET', url, null, args.cronSecret ? { 'x-cron-secret': args.cronSecret } : {});
    } catch (e) {
      console.error(`Network error contacting ${args.server}: ${e.message}`);
      process.exit(1);
    }
    if (!resp.ok) {
      console.error(`Server returned ${resp.status}: ${resp.text || '(no body)'}`);
      if (resp.status === 401) console.error('Set CRON_SECRET (or pass --cron-secret=...) to match the server env.');
      process.exit(1);
    }
    scanned = resp.data.scanned;
    tooFresh = resp.data.orphans.tooFresh;
    orphans = resp.data.orphans.files.map((f) => ({
      rel: f.path,
      abs: path.join(ROOT, f.path),
      size: f.bytes,
      mtimeMs: f.mtime,
      uploadedTs: f.uploadedTs || uploadedTsOf(path.basename(f.path), f.mtime),
    }));
  } else {
    const images = listAuthoredImages();
    if (images.length === 0) {
      say(`No images in ${path.relative(ROOT, IMAGES_DIR)}.`);
      if (args.json) console.log(JSON.stringify({ source: 'local', scanned: 0, orphans: [] }, null, 2));
      return;
    }
    say(`Scanned ${images.length} image(s) in ${path.relative(ROOT, IMAGES_DIR)}.`);
    say('Reading docs/ references…');
    const corpus = readAllDocsBodies();
    scanned = images.length;
    const cutoff = Date.now() - args.minAgeDays * 86400000;
    orphans = [];
    for (const img of images) {
      // Substring-includes is fine here: filenames carry a random suffix so
      // accidental collisions across articles are negligible.
      if (corpus.includes(img.url)) continue;
      if (img.uploadedTs > cutoff) { tooFresh += 1; continue; }
      orphans.push(img);
    }
  }

  const orphanSize = orphans.reduce((a, i) => a + i.size, 0);

  if (args.json) {
    console.log(JSON.stringify({
      source: args.remote ? args.server : 'local-checkout',
      authoritative: args.remote,
      scanned,
      minAgeDays: args.minAgeDays,
      tooFresh,
      orphanCount: orphans.length,
      orphanBytes: orphanSize,
      orphans: orphans.map((o) => ({
        path: o.rel,
        bytes: o.size,
        uploaded: new Date(o.uploadedTs).toISOString(),
        ageDays: +((Date.now() - o.uploadedTs) / 86400000).toFixed(1),
      })),
    }, null, 2));
  } else {
    console.log('');
    console.log(`  Source:     ${args.remote ? args.server + ' (sees drafts)' : 'local checkout (ESTIMATE - cannot see server drafts)'}`);
    console.log(`  Scanned:    ${scanned}`);
    console.log(`  Abandoned:  ${orphans.length} (${bytes(orphanSize)})`);
    if (tooFresh) console.log(`  Too fresh:  ${tooFresh} (under ${args.minAgeDays}d old - may still be mid-edit)`);
  }

  if (orphans.length === 0) {
    say('\nNothing to do.');
    return;
  }

  if (!args.json) {
    console.log('\nAbandoned files (largest first, first 30):');
    for (const o of orphans.slice(0, 30)) {
      const age = (Date.now() - o.uploadedTs) / 86400000;
      console.log(`  ${o.rel}  (${bytes(o.size)}, ${age.toFixed(1)}d old)`);
    }
    if (orphans.length > 30) console.log(`  …and ${orphans.length - 30} more.`);
  }

  if (!args.apply) {
    say(args.remote
      ? '\nReport only. Add --apply to queue these for deletion.'
      : '\nReport only, and local scans are an estimate. Re-run with --remote --server=... --cron-secret=... before deleting anything.');
    return;
  }

  // A local scan cannot see server-side drafts, so its orphan list may
  // include screenshots an unpublished article is actively using.
  if (!args.remote && !args.forceLocal) {
    console.error('\nRefusing --apply on a local scan: drafts on the server are invisible here,');
    console.error('so this list can contain images an unpublished article still uses.');
    console.error('Use --remote --server=... --cron-secret=..., or --force-local if this');
    console.error('checkout genuinely holds every draft the server has.');
    process.exit(2);
  }

  if (!args.yes) {
    const tail = args.localOnly ? '' : ' AND enqueue them for the next deploy commit';
    const ok = await confirm(`\nUnlink ${orphans.length} file(s) locally${tail}? [y/N] `);
    if (!ok) { console.log('Aborted.'); return; }
  }

  // 1. Unlink locally. With --remote the list came from the server, so most
  //    of these won't exist in this checkout - that's expected, not an error.
  let unlinked = 0;
  let absent = 0;
  for (const o of orphans) {
    if (!fs.existsSync(o.abs)) { absent += 1; continue; }
    try { fs.unlinkSync(o.abs); unlinked += 1; }
    catch (e) { console.warn(`  failed to unlink ${o.rel}: ${e.message}`); }
  }
  console.log(`\nUnlinked ${unlinked}/${orphans.length} file(s) here${absent ? ` (${absent} not in this checkout)` : ''}.`);

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
