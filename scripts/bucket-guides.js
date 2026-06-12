#!/usr/bin/env node
/**
 * Phase 5 (per the 2026-06-08 decision log entry in plans/help-menu-redesign.md):
 *
 * Re-bucket the legacy `docs/guides/learner/` and `docs/guides/manager/` content
 * into per-module audience sub-folders under `docs/modules/<m>/for-learners/` and
 * `docs/modules/<m>/for-managers/`. A handful of genuinely cross-module articles
 * stay under `docs/guides/`.
 *
 * Mappings are EXPLICIT (not heuristic) because:
 *  - Only 40 articles total - a lookup table is reviewable.
 *  - "How to edit form submission from manager's view" reads ambiguously to a
 *    keyword classifier but unambiguously to a human eye.
 *
 * Usage:
 *   node scripts/bucket-guides.js                # dry run
 *   node scripts/bucket-guides.js --apply        # git mv + emit redirects
 */

'use strict';

const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const REDIRECTS_FILE = path.join(ROOT, 'data', 'redirects.json');
const APPLY = process.argv.includes('--apply');

// ---------------------------------------------------------------------------
// Mapping table - relative-to-docs source path → relative-to-docs target path.
// Targets ending in '/' get the source basename appended. A target of null
// means delete the file (e.g. duplicated index.md). Any source absent here
// gets warned about and left in place.
// ---------------------------------------------------------------------------

const MAP = {
  // --- guides/learner/* (top-level, was docs/user-guide/*) ---
  'guides/learner/how-can-i-answer-a-query.md':                                           'modules/cross-module/for-learners/',
  'guides/learner/how-can-i-submit-a-form-from-chat.md':                                  'modules/forms/for-learners/',
  'guides/learner/how-can-i-submit-a-form-from-left-menu.md':                             'modules/forms/for-learners/',
  'guides/learner/how-can-i-view-a-competition-leaderboard.md':                           'modules/kpi-gamification/for-learners/',
  'guides/learner/how-do-i-like-and-comment-on-a-smartfeed.md':                           'modules/smartfeed/for-learners/',
  'guides/learner/how-do-i-upload-a-coaching-video.md':                                   'modules/video-coaching/for-learners/',
  'guides/learner/how-do-i-view-the-kpi-scorecard.md':                                    'modules/kpi-gamification/for-learners/',
  'guides/learner/how-learners-can-mark-attendance-for-smartpath-learning-session-on-their-own.md':
                                                                                          'modules/smartpath/for-learners/',
  'guides/learner/how-to-access-the-scorm-course-from-the-smartwinnr-app.md':             'modules/cross-module/for-learners/',
  'guides/learner/how-to-add-new-form-submission.md':                                     'modules/forms/for-learners/',
  'guides/learner/how-to-answer-long-answer-type-questions-in-smartwinnr.md':             'modules/quiz/for-learners/',
  'guides/learner/how-to-edit-the-form-submission-from-manager-s-view.md':                'modules/forms/for-managers/',
  'guides/learner/how-to-mark-the-attendance-for-users-in-learning-sessions.md':          'modules/smartpath/for-managers/',
  'guides/learner/how-to-post-a-query-from-the-smartwinnr-app.md':                        'modules/cross-module/for-learners/',
  'guides/learner/how-to-review-field-coaching-from-managers-view-in-mobile.md':          'modules/field-coaching/for-managers/',
  'guides/learner/how-to-take-the-smartpath-assigned-to-me-in-smartwinnr.md':             'modules/smartpath/for-learners/',
  'guides/learner/how-to-update-the-smartwinnr-app-from-web-view.md':                     'guides/learner/',  // stays - generic app-update guide
  'guides/learner/how-to-upload-audio-recording-for-coaching.md':                         'modules/video-coaching/for-learners/',
  'guides/learner/how-to-upload-screen-recording-for-coaching.md':                        'modules/video-coaching/for-learners/',
  'guides/learner/how-to-upload-video-recording-for-coaching.md':                         'modules/video-coaching/for-learners/',
  'guides/learner/how-to-use-khub-in-the-smartwinnr-app.md':                              'modules/knowledge-hub/for-learners/',
  'guides/learner/how-to-use-qresolve-in-the-smartwinnr-app.md':                          'modules/cross-module/for-learners/',
  'guides/learner/how-to-view-notifications.md':                                          'modules/notifications/for-learners/',
  'guides/learner/how-users-can-see-the-evaluation-and-scores-for-long-answer-question.md':
                                                                                          'modules/quiz/for-learners/',
  'guides/learner/understanding-recent-trending-and-latest-khub-items.md':                'modules/knowledge-hub/for-learners/',
  'guides/learner/what-is-qresolve.md':                                                   'modules/cross-module/for-learners/',

  // --- guides/learner/ai-coaching/* (pre-existing legacy sub-category) ---
  'guides/learner/ai-coaching/how-can-a-user-submit-an-ai-coaching-attempt.md':           'modules/ai-coaching/for-learners/',
  'guides/learner/ai-coaching/how-can-a-user-view-feedback-after-submitting-an-ai-coaching.md':
                                                                                          'modules/ai-coaching/for-learners/',
  'guides/learner/ai-coaching/how-to-review-ai-coaching-submissions-as-a-manager.md':     'modules/ai-coaching/for-managers/',
  'guides/learner/ai-coaching/understanding-the-feedback-screen.md':                      'modules/ai-coaching/for-learners/',
  // ai-coaching/index.md was a section landing - drop it; for-learners/ has its own _category_.json.
  'guides/learner/ai-coaching/index.md':                                                  null,
  'guides/learner/ai-coaching/_category_.json':                                           null,

  // --- guides/manager/* ---
  'guides/manager/finding-status-and-scores-for-quizzes-assigned-to-your-team.md':        'modules/quiz/for-managers/',
  'guides/manager/how-do-managers-track-the-kpi-scorecard-results-in-the-smartwinnr-app.md':
                                                                                          'modules/kpi-gamification/for-managers/',
  'guides/manager/how-manager-can-check-the-status-of-the-coachings-assigned-to-my-team.md':
                                                                                          'modules/video-coaching/for-managers/',
  'guides/manager/how-managers-approve-form.md':                                          'modules/forms/for-managers/',
  'guides/manager/how-managers-can-view-the-competition-leaderboards-in-the-smartwinnr-app.md':
                                                                                          'modules/kpi-gamification/for-managers/',
  'guides/manager/how-to-find-the-progress-of-your-team-in-quizzes.md':                   'modules/quiz/for-managers/',
  'guides/manager/quiz-analytics-through-charts.md':                                      'modules/quiz/for-managers/',
  'guides/manager/switching-to-manager-view.md':                                          'guides/manager/',  // stays - generic
  'guides/manager/what-is-my-team-coaching.md':                                           'modules/video-coaching/for-managers/',
};

// ---------------------------------------------------------------------------

function listAllSourceFiles() {
  const out = [];
  for (const sub of ['guides/learner', 'guides/manager']) {
    const dir = path.join(DOCS, sub);
    if (!fs.existsSync(dir)) continue;
    const walk = (d) => {
      for (const e of fs.readdirSync(d, {withFileTypes: true})) {
        if (e.name.startsWith('.')) continue;
        const full = path.join(d, e.name);
        if (e.isDirectory()) walk(full);
        else out.push(path.relative(DOCS, full).split(path.sep).join('/'));
      }
    };
    walk(dir);
  }
  return out;
}

function loadRedirects() {
  if (!fs.existsSync(REDIRECTS_FILE)) return [];
  return JSON.parse(fs.readFileSync(REDIRECTS_FILE, 'utf8')).redirects || [];
}

function saveRedirects(redirects) {
  fs.writeFileSync(REDIRECTS_FILE, JSON.stringify({version: 1, redirects}, null, 2) + '\n');
}

function main() {
  const sources = listAllSourceFiles();
  const unknown = sources.filter((s) => !(s in MAP));
  const planned = sources
    .filter((s) => s in MAP)
    .map((s) => ({src: s, dst: MAP[s]}));

  console.log(`bucket-guides: ${APPLY ? 'APPLY' : 'DRY RUN'}`);
  console.log(`  source files: ${sources.length}`);
  console.log(`  mapped:       ${planned.length}`);
  console.log(`  unmapped:     ${unknown.length}`);
  if (unknown.length) {
    console.log('');
    console.log('UNMAPPED (will be skipped - extend MAP table):');
    for (const u of unknown) console.log('  ' + u);
  }
  console.log('');

  const byTarget = {};
  for (const p of planned) {
    const t = p.dst === null ? '<delete>' : p.dst;
    byTarget[t] = (byTarget[t] || 0) + 1;
  }
  console.log('Target distribution:');
  for (const [t, c] of Object.entries(byTarget).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(c).padStart(3)}  ${t}`);
  }

  if (!APPLY) {
    console.log('');
    console.log('Re-run with --apply.');
    return;
  }

  const redirects = loadRedirects();
  let moved = 0, deleted = 0;
  for (const {src, dst} of planned) {
    const srcAbs = path.join(DOCS, src);
    if (!fs.existsSync(srcAbs)) {
      console.warn(`  ! missing source: ${src}`);
      continue;
    }
    if (dst === null) {
      execSync(`git rm "${srcAbs}"`, {cwd: ROOT, stdio: 'pipe'});
      deleted += 1;
      continue;
    }
    // Same-location no-op (file stays put)
    if (dst === path.posix.dirname(src) + '/') continue;

    const basename = path.basename(src);
    const dstRel = dst.endsWith('/') ? dst + basename : dst;
    const dstAbs = path.join(DOCS, dstRel);
    if (!fs.existsSync(path.dirname(dstAbs))) fs.mkdirSync(path.dirname(dstAbs), {recursive: true});

    try {
      execSync(`git mv "${srcAbs}" "${dstAbs}"`, {cwd: ROOT, stdio: 'pipe'});
      moved += 1;
      const stem = (s) => s.replace(/\.md$/, '');
      redirects.push({
        from: '/' + stem(src),
        to:   '/' + stem(dstRel),
      });
    } catch (e) {
      console.error(`  ! failed: ${src} → ${dstRel}\n      ${e.message.split('\n')[0]}`);
    }
  }

  saveRedirects(redirects);
  console.log('');
  console.log(`Moved ${moved} file(s), deleted ${deleted}.  data/redirects.json now has ${redirects.length} entries.`);
}

main();
