#!/usr/bin/env node
/**
 * Bucket module articles into the 8 canonical sub-folders.
 *
 * After scripts/migrate-ia.js moves articles wholesale into docs/modules/<m>/,
 * this script classifies each article by filename keywords and `git mv`s it
 * into the right sub-folder. Redirects from the old (module-root) URL to the
 * new (sub-section) URL are appended to data/redirects.json.
 *
 * The 8 canonical sub-folders (see plans/help-menu-redesign.md §5):
 *   create-and-manage/        Authoring tasks
 *   assign-and-schedule/      Distribution
 *   features/                 Feature reference (question types, scoring, etc.)
 *   reports-and-analytics/    Data & reporting
 *   settings-and-permissions/ Configuration
 *   best-practices/           Opinion / guidance
 *   faqs-and-troubleshooting/ Common questions, errors
 *
 * Plus two root-level files: overview.md, quickstart.md.
 *
 * Heuristic priority (first match wins):
 *   1. Filename starts with troubleshoot / how-many / what-is-the-difference /
 *      how-import-x-is-different / why-* → faqs-and-troubleshooting
 *   2. Contains "report", "analytics", "dashboard", "track-improvement",
 *      "view-submission", "view-attempt" → reports-and-analytics
 *   3. Contains "best-practice", "tips" → best-practices
 *   4. Contains "setting", "permission", "configure", "enable", "disable",
 *      "allow", "access" → settings-and-permissions
 *   5. Starts with "how-to-assign", "how-to-schedule", "how-to-publish",
 *      "how-to-distribute", "how-to-send" → assign-and-schedule
 *   6. Starts with "how-to-create-<question-type>", "understanding-",
 *      "what-are-", "<thing>-types", "question-bank" → features
 *   7. Starts with "how-to-create", "how-to-add", "how-to-edit",
 *      "how-to-update", "how-to-duplicate", "how-to-delete", "how-to-archive",
 *      "how-to-upload", "how-to-import", "how-to-clone", "how-to-make" → create-and-manage
 *   8. Default → features (broad reference catch-all)
 *
 * Usage:
 *   node scripts/bucket-articles.js                # dry run
 *   node scripts/bucket-articles.js --apply        # do the moves
 */

'use strict';

const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const MODULES_DIR = path.join(ROOT, 'docs', 'modules');
const REDIRECTS_FILE = path.join(ROOT, 'data', 'redirects.json');

const APPLY = process.argv.includes('--apply');

const FEATURE_QUESTION_TYPES = [
  'multiple-choice', 'fill-in-the-blank', 'hotspot-question',
  'matching-question', 'missing-words', 'long-answer', 'short-answer',
  'true-or-false', 'drag-and-drop', 'sorting-question', 'audio',
  'video-to-a-question', 'image-to-the-question', 'audio-file-to-a-question',
];

function bucket(stem) {
  const s = stem.toLowerCase();

  // 1. FAQs / troubleshooting
  if (
    s.startsWith('troubleshoot') ||
    s.startsWith('how-many') ||
    s.startsWith('how-can-i-find') ||
    s.startsWith('how-can-i-know') ||
    s.startsWith('why-') ||
    s.startsWith('can-i-') ||
    s.startsWith('what-is-the-difference') ||
    s.startsWith('what-happens-if') ||
    /\bnot-working\b/.test(s) ||
    /\berror\b/.test(s) ||
    /\bfaq\b/.test(s) ||
    /-is-different-from-/.test(s)
  ) return 'faqs-and-troubleshooting';

  // 2. Reports & analytics
  if (
    /\breport\b/.test(s) ||
    /\banalytics\b/.test(s) ||
    /\bdashboard\b/.test(s) ||
    /\btrack-improvement/.test(s) ||
    /\btrack-progress/.test(s) ||
    /\bview-submissions?\b/.test(s) ||
    /\bview-attempts?\b/.test(s) ||
    /\bview-feedback\b/.test(s) ||
    /\bview-the-completion\b/.test(s) ||
    /\bevaluate-/.test(s) ||
    /\binsights\b/.test(s) ||
    /\bstatistics\b/.test(s) ||
    /\boverview-analysis\b/.test(s) ||
    /\bparticipation\b/.test(s)
  ) return 'reports-and-analytics';

  // 3. Best practices
  if (
    /\bbest-practice/.test(s) ||
    /\bguideline/.test(s) ||
    /\btips\b/.test(s) ||
    /\brecommend/.test(s)
  ) return 'best-practices';

  // 4. Settings & permissions
  if (
    /\bpermission\b/.test(s) ||
    s.startsWith('how-to-configure') ||
    s.startsWith('how-to-set-') ||
    s.startsWith('how-to-enable') ||
    s.startsWith('how-to-disable') ||
    s.startsWith('how-to-activate') ||
    s.startsWith('how-to-deactivate') ||
    s.startsWith('how-to-allow') ||
    /\baccess-/.test(s) ||
    /-settings\b/.test(s) ||
    /\bcustomize\b/.test(s) ||
    /\bautomatic-reminders?\b/.test(s) ||
    /\breminders?\b/.test(s) ||
    /\bnotification\b/.test(s) ||
    /\bobserver\b/.test(s) ||
    /\bsuppress\b/.test(s)
  ) return 'settings-and-permissions';

  // 5. Assign & schedule
  if (
    s.startsWith('how-to-assign') ||
    s.startsWith('how-to-schedule') ||
    s.startsWith('how-to-publish') ||
    s.startsWith('how-to-distribute') ||
    s.startsWith('how-to-send') ||
    s.startsWith('how-to-share') ||
    /\bassignment\b/.test(s)
  ) return 'assign-and-schedule';

  // 6. Features (question/content types, taxonomies, explanatory)
  if (
    FEATURE_QUESTION_TYPES.some((kw) => s.includes(kw)) ||
    s.startsWith('understanding-') ||
    s.startsWith('what-are-') ||
    s.startsWith('what-is-') ||
    /-types?$/.test(s) ||
    /-types\b/.test(s) ||
    s === 'question-bank' ||
    s.startsWith('question-bank') ||
    /\bknowledge-categor/.test(s) ||
    /\bquiz-types/.test(s) ||
    /\bskill-?(definition|generator)?/.test(s) ||
    /\bai-character/.test(s) ||
    /\bai-role/.test(s) ||
    /\bcompetenc/.test(s)
  ) return 'features';

  // 7. Create & manage (authoring CRUD)
  if (
    s.startsWith('how-to-create') ||
    s.startsWith('how-can-i-create') ||
    s.startsWith('how-to-add') ||
    s.startsWith('how-to-edit') ||
    s.startsWith('how-to-update') ||
    s.startsWith('how-to-duplicate') ||
    s.startsWith('how-can-i-duplicate') ||
    s.startsWith('how-to-clone') ||
    s.startsWith('how-to-delete') ||
    s.startsWith('how-to-archive') ||
    s.startsWith('how-to-upload') ||
    s.startsWith('how-to-import') ||
    s.startsWith('how-to-make') ||
    s.startsWith('how-to-build') ||
    s.startsWith('how-to-reset') ||
    s.startsWith('how-to-review') ||
    s.startsWith('how-to-attach') ||
    s.startsWith('how-to-remove') ||
    s.startsWith('how-to-rename') ||
    s.startsWith('how-to-copy') ||
    s.startsWith('how-editors')
  ) return 'create-and-manage';

  // 8. Default catch-all
  return 'features';
}

function listArticles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md' &&
        entry.name !== 'overview.md' && entry.name !== 'quickstart.md') {
      out.push(entry.name);
    }
  }
  return out;
}

function loadRedirects() {
  if (!fs.existsSync(REDIRECTS_FILE)) return [];
  const j = JSON.parse(fs.readFileSync(REDIRECTS_FILE, 'utf8'));
  return j.redirects || [];
}

function saveRedirects(redirects) {
  fs.writeFileSync(REDIRECTS_FILE, JSON.stringify({version: 1, redirects}, null, 2) + '\n');
}

function main() {
  const modules = fs.readdirSync(MODULES_DIR, {withFileTypes: true})
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  const plan = []; // {module, src, dst, urlFrom, urlTo}
  const counts = {};

  for (const mod of modules) {
    const dir = path.join(MODULES_DIR, mod);
    const articles = listArticles(dir);
    for (const file of articles) {
      const stem = file.replace(/\.md$/, '');
      const bucketName = bucket(stem);
      counts[bucketName] = (counts[bucketName] || 0) + 1;

      const src = path.join(dir, file);
      const dst = path.join(dir, bucketName, file);
      const urlFrom = `/modules/${mod}/${stem}`;
      const urlTo = `/modules/${mod}/${bucketName}/${stem}`;
      plan.push({module: mod, src, dst, urlFrom, urlTo, bucketName});
    }
  }

  console.log(`bucket-articles: ${APPLY ? 'APPLY' : 'DRY RUN'} - ${plan.length} article(s) across ${modules.length} module(s)`);
  console.log('');
  console.log('Bucket totals:');
  for (const [b, c] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${b.padEnd(28)} ${c}`);
  }
  console.log('');

  if (!APPLY) {
    console.log('Sample (first 12):');
    for (const p of plan.slice(0, 12)) {
      console.log(`  ${p.module}: ${path.basename(p.src)}  →  ${p.bucketName}/`);
    }
    console.log('');
    console.log('Re-run with --apply to perform git mv + emit redirects.');
    return;
  }

  // Apply: git mv + record redirect
  const redirects = loadRedirects();
  let moved = 0;
  for (const p of plan) {
    const dstDir = path.dirname(p.dst);
    if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, {recursive: true});
    try {
      execSync(`git mv "${p.src}" "${p.dst}"`, {cwd: ROOT, stdio: 'pipe'});
      redirects.push({from: p.urlFrom, to: p.urlTo});
      moved += 1;
    } catch (e) {
      console.error(`  ! failed: ${p.src} → ${p.dst}: ${e.message.split('\n')[0]}`);
    }
  }

  saveRedirects(redirects);
  console.log(`Moved ${moved}/${plan.length} articles. Appended ${moved} redirect(s) → data/redirects.json`);
}

main();
