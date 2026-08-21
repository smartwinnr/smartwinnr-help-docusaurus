#!/usr/bin/env node
/**
 * Repair `last_update.date` on articles whose stamp predates their content.
 *
 * Until server.js started stamping on save, only POST
 * /api/admin/authoring/generate touched `last_update`. Every human edit after
 * that first AI draft - /save from the wizard and /save-raw from the raw
 * editor - wrote the file through with the ORIGINAL date intact. Since
 * docusaurus.config.ts never sets showLastUpdateTime (and the production image
 * carries no .git), frontmatter is the only source the "Updated <date>" chip
 * has (src/components/Article/MetaChip.tsx) - so those articles advertise a
 * date years older than their content.
 *
 * Ground truth for "this content actually shipped on <date>" is the publish
 * branch's bot commits (message prefix "publish: "), the same history the
 * authoring stats dashboard trusts.
 *
 * For each docs article: when the newest `publish:` commit touching it is
 * newer than its frontmatter date by more than --threshold days, set the date
 * to that commit's date. The author is left exactly as it was - a publish
 * commit is authored by the deploy bot, not by the human who wrote the
 * article, so copying it would replace a correct name with a wrong one.
 *
 * Dry run by default - pass --apply to write.
 *
 *   npm run articles:backfill-dates                        # report
 *   npm run articles:backfill-dates -- --threshold=0       # every drift
 *   npm run articles:backfill-dates -- --add-missing       # also stamp
 *                                                          # articles with no
 *                                                          # last_update block
 *   npm run articles:backfill-dates -- --apply
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const matter = require('gray-matter');
const { setLastUpdate } = require('../lib/frontmatter');

const REPO_ROOT = path.join(__dirname, '..');
const DOCS_ROOT = path.join(REPO_ROOT, 'docs');
const APPLY = process.argv.includes('--apply');
const ADD_MISSING = process.argv.includes('--add-missing');
const thresholdArg = process.argv.find((a) => a.startsWith('--threshold='));
// Default 7 days: below that the gap is usually just draft-then-publish
// latency, not a genuinely stale stamp.
const THRESHOLD_DAYS = thresholdArg ? Number(thresholdArg.split('=')[1]) : 7;

const MARK = '\u0000';   // git emits it via %x00; never appears in a path

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.mdx?$/i.test(entry.name)) out.push(p);
  }
  return out;
}

/** repo-relative path -> YYYY-MM-DD of the NEWEST `publish:` commit that
 *  touched it. One `git log` walk over the ~150 publish commits rather than a
 *  process per article; newest-first ordering means the first sighting of a
 *  path wins and older commits for it are ignored. The NUL-byte prefix marks
 *  the commit-header lines so they can never be confused with a file path. */
function publishDatesByPath() {
  const out = execFileSync('git', [
    'log', '--grep=^publish:', '--date=short',
    '--format=%x00%ad', '--name-only',
  ], { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

  const map = new Map();
  let date = null;
  for (const line of out.split('\n')) {
    if (line.startsWith(MARK)) { date = line.slice(1).trim(); continue; }
    const rel = line.trim();
    if (!rel || !date) continue;
    if (!/^docs\/.*\.mdx?$/.test(rel)) continue;
    if (!map.has(rel)) map.set(rel, date);
  }
  return map;
}

/** The frontmatter date as YYYY-MM-DD. YAML hands back a Date for the
 *  unquoted `2026-08-20` form and a string for the legacy
 *  `2022-06-24T00:00:00.000Z` one - normalize both, exactly as MetaChip.tsx
 *  does for the browser. */
function fmDate(data) {
  const v = data && data.last_update && data.last_update.date;
  if (!v) return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 10);
  const m = /^\d{4}-\d{2}-\d{2}/.exec(String(v));
  return m ? m[0] : null;
}

const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

function main() {
  const published = publishDatesByPath();
  const changes = [];
  let noPublishCommit = 0;
  let missingStamp = 0;
  let alreadyFresh = 0;
  let withinThreshold = 0;

  for (const f of walk(DOCS_ROOT)) {
    const rel = path.relative(REPO_ROOT, f).replace(/\\/g, '/');
    const shipped = published.get(rel);
    if (!shipped) { noPublishCommit += 1; continue; }

    const raw = fs.readFileSync(f, 'utf8');
    let data;
    // The options arg bypasses gray-matter's content-keyed cache - see the
    // same note in lib/doc-routes.js.
    try { data = matter(raw, {}).data || {}; } catch {
      console.log(`  SKIP (unparseable frontmatter): ${rel}`);
      continue;
    }

    const current = fmDate(data);
    if (!current) {
      missingStamp += 1;
      if (!ADD_MISSING) continue;
    } else {
      const drift = daysBetween(current, shipped);
      if (drift <= 0) { alreadyFresh += 1; continue; }
      if (drift < THRESHOLD_DAYS) { withinThreshold += 1; continue; }
    }

    const next = setLastUpdate(raw, {
      date: shipped,
      author: data.last_update && data.last_update.author,
    });
    if (next === raw) { alreadyFresh += 1; continue; }
    changes.push({
      file: f,
      current,
      shipped,
      drift: current ? daysBetween(current, shipped) : null,
      next,
    });
  }

  console.log(`${APPLY ? 'Backfilling' : 'Would backfill'} last_update.date from publish-commit dates`);
  console.log(`  threshold:                 ${THRESHOLD_DAYS} day(s)\n`);
  console.log(`  no publish: commit:        ${noPublishCommit}`);
  console.log(`  no last_update.date:       ${missingStamp}${ADD_MISSING ? ' (included)' : ' (skipped - pass --add-missing)'}`);
  console.log(`  stamp already current:     ${alreadyFresh}`);
  console.log(`  drift under threshold:     ${withinThreshold}`);
  console.log(`  to change:                 ${changes.length}\n`);

  for (const c of changes.sort((a, b) => (b.drift || 0) - (a.drift || 0))) {
    const drift = String(c.drift == null ? '-' : c.drift).padStart(5);
    console.log(`  ${drift}d  ${c.current || '(none)'} -> ${c.shipped}  ${path.relative(DOCS_ROOT, c.file)}`);
  }

  if (!APPLY) {
    console.log('\nDry run - no files written. Re-run with --apply to write.');
    return;
  }
  for (const c of changes) fs.writeFileSync(c.file, c.next, 'utf8');
  console.log(`\nWrote ${changes.length} file(s).`);
  console.log('  Review with `git diff --stat docs/`, then commit - the chip only');
  console.log('  updates once the new dates reach the publish branch.');
}

main();
