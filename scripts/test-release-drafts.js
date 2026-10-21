#!/usr/bin/env node
'use strict';

/**
 * Exercises the /api/release-drafts match/refine pipeline end-to-end against
 * a LOCALLY RUNNING server. Costs real OpenAI tokens (each dispatched change
 * runs the authoring model at least once) and WRITES real draft files under
 * docs/ - reset with `git checkout -- docs/` (and `git clean -fd docs/`)
 * between runs.
 *
 * Start the server first:
 *   RELEASE_DRAFTS_SECRET=test node server.js
 * then:
 *   RELEASE_DRAFTS_SECRET=test node scripts/test-release-drafts.js [scenario...]
 *
 * Scenarios (default: create provenance empty-tag multi-module):
 *   create       novel topic -> status created, decision logged
 *   provenance   re-dispatch the same issue id -> updated via provenance,
 *                same file, exactly one comment per absorbed issue
 *   llm          differently-worded subject on an existing topic -> expects
 *                updated via llm (soft assertion - depends on model judgment)
 *   fallback     run the SERVER with RELEASE_MATCH_LLM_DISABLED=1 first;
 *                asserts no dispatch errors and method is never 'llm'
 *   multi-module files spanning competitions+quizzes -> no file created in
 *                the wrong module
 *   empty-tag    tag:'' -> saved file carries tag=untagged and parses
 *   irrelevant   changeType refactor -> skipped-not-relevant (deterministic)
 *   flagged      ambiguous internal-sounding change -> drafted + relevance
 *                flag (soft - depends on model judgment)
 *   relevance-kill-switch  run the SERVER with RELEASE_RELEVANCE_LLM_DISABLED=1;
 *                deterministic skip still fires, nothing gets flagged
 *   rate-limit   run the SERVER with RELEASE_SERVICE_RATE_LIMIT=1; second
 *                change errors (retries next deploy), event says rate-limited
 */

const path = require('path');
const fs = require('fs');

const SERVER = process.env.TEST_SERVER_URL || 'http://localhost:3000';
const SECRET = process.env.RELEASE_DRAFTS_SECRET;
if (!SECRET) {
  console.error('Set RELEASE_DRAFTS_SECRET to the same value the running server uses.');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
let failures = 0;

function check(ok, label, detail) {
  if (ok) {
    console.log(`  PASS  ${label}`);
  } else {
    failures++;
    console.error(`  FAIL  ${label}${detail ? ` - ${detail}` : ''}`);
  }
}

async function dispatch(changes, tag = 'vtest.0.1') {
  const res = await fetch(`${SERVER}/api/release-drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-release-shared-secret': SECRET },
    body: JSON.stringify({
      tag,
      deployedAt: new Date().toISOString(),
      deployer: 'test-release-drafts.js',
      audience: 'client',
      changes,
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`dispatch HTTP ${res.status}: ${JSON.stringify(body)}`);
  return body;
}

function change(overrides) {
  return {
    issueId: overrides.issueId,
    issueUrl: `https://git.example.com/issues/${overrides.issueId}`,
    changeType: 'enhancement',
    subject: overrides.subject,
    sections: {
      'What changed': overrides.whatChanged || overrides.subject,
      'Why': 'Requested by customers.',
      'How to use': overrides.howToUse || 'Open the module and use the new option.',
    },
    files: overrides.files,
    ...overrides,
  };
}

function provenanceComments(relPath) {
  const text = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  const re = /\{\/\*\s*release-draft:\s*tag=(\S*?)\s+issue=(\S+)\s+url=(\S+)\s*\*\/\}/g;
  return [...text.matchAll(re)].map((m) => ({ tag: m[1], issueId: m[2], url: m[3] }));
}

const scenarios = {
  async create() {
    const r = await dispatch([change({
      issueId: 990001,
      subject: 'Add holographic projection mode for quiz podium ceremonies (#990001)',
      files: ['modules/quizzes'],
    })]);
    const res = r.results[0];
    check(res.status === 'created', 'novel topic -> created', JSON.stringify(res));
    check(res.match && res.match.method !== undefined, 'decision attached to result', JSON.stringify(res.match));
    if (res.path) {
      const prov = provenanceComments(res.path);
      check(prov.length === 1 && prov[0].issueId === '990001', 'one provenance comment with the issue id', JSON.stringify(prov));
    }
    return res.path;
  },

  async provenance() {
    const first = await dispatch([change({
      issueId: 990002,
      subject: 'Add chrono-sync scheduling for survey reminder cadences (#990002)',
      files: ['modules/surveys'],
    })], 'vtest.0.1');
    const created = first.results[0];
    check(created.status === 'created', 'first dispatch -> created', JSON.stringify(created));
    const second = await dispatch([change({
      issueId: 990002,
      subject: 'Fix chrono-sync scheduling skipping reminders across timezones (#990002)',
      changeType: 'bug',
      files: ['modules/surveys'],
    })], 'vtest.0.2');
    const updated = second.results[0];
    check(updated.status === 'updated', 're-dispatch same issue -> updated', JSON.stringify(updated));
    check(updated.match && updated.match.method === 'provenance', 'matched via provenance', JSON.stringify(updated.match));
    check(updated.path === created.path, 'same file updated', `${created.path} vs ${updated.path}`);
    if (updated.path) {
      const prov = provenanceComments(updated.path);
      check(prov.length === 1 && prov[0].issueId === '990002', 'same issue deduped to one comment', JSON.stringify(prov));
      check(prov[0] && prov[0].tag === 'vtest.0.2', 'newest tag kept', JSON.stringify(prov));
    }
  },

  async llm() {
    // Reworded commit subject on a topic the docs already cover. Pick a real
    // article topic from the target module before relying on this scenario.
    const r = await dispatch([change({
      issueId: 990003,
      subject: 'Include archived coachings when downloading the coaching-wise report (#990003)',
      files: ['modules/coachings'],
      howToUse: 'Download the coaching-wise report; archived coachings now appear when the filter is on.',
    })]);
    const res = r.results[0];
    console.log(`  info  method=${res.match && res.match.method} path=${res.path || res.slug}`);
    check(res.status === 'updated' && res.match.method === 'llm',
      'semantic match via llm (soft - model judgment)', JSON.stringify(res.match));
  },

  async fallback() {
    // Server must be running with RELEASE_MATCH_LLM_DISABLED=1.
    const r = await dispatch([change({
      issueId: 990004,
      subject: 'Include archived coachings when downloading the coaching-wise report (#990004)',
      files: ['modules/coachings'],
    })]);
    const res = r.results[0];
    check(res.status === 'created' || res.status === 'updated', 'dispatch never errors from matching', JSON.stringify(res));
    check(res.match && res.match.method !== 'llm', 'llm not used while disabled', JSON.stringify(res.match));
    check(!res.match || !res.match.llm || res.match.llm.skipped === true || res.match.candidatesConsidered === 0,
      'decision records the skip', JSON.stringify(res.match));
  },

  async 'multi-module'() {
    const r = await dispatch([change({
      issueId: 990005,
      subject: 'Set a separate answer timer for each quiz question in competitions (#990005)',
      files: ['modules/competitions', 'modules/quizzes'],
    })]);
    const res = r.results[0];
    console.log(`  info  status=${res.status} module=${res.module} method=${res.match && res.match.method}`);
    check(res.status !== 'error', 'multi-module dispatch succeeds', JSON.stringify(res));
    if (res.status === 'updated') {
      check(res.path && res.path.includes(`/modules/${res.module}/`), 'update written into the matched module', res.path);
    } else {
      check(res.module === 'competition', 'fresh create lands in the first mapped module', JSON.stringify(res));
    }
  },

  async irrelevant() {
    // changeType refactor trips the deterministic pre-check - no LLM needed,
    // so this scenario also passes with RELEASE_RELEVANCE_LLM_DISABLED=1.
    const r = await dispatch([change({
      issueId: 990007,
      changeType: 'refactor',
      subject: 'Refactor session-lock retry into a shared service (#990007)',
      files: ['modules/quizzes'],
    })]);
    const res = r.results[0];
    check(res.status === 'skipped-not-relevant', 'refactor -> skipped-not-relevant', JSON.stringify(res));
    check(res.relevance && res.relevance.source === 'deterministic', 'deterministic verdict recorded', JSON.stringify(res.relevance));
    check(!res.path, 'no draft file written', JSON.stringify(res));
  },

  async flagged() {
    // Internal-sounding change in a product module: the LLM should judge it
    // not-relevant but (usually) below high confidence -> drafted + flagged.
    // Soft assertion - depends on model judgment.
    const r = await dispatch([change({
      issueId: 990008,
      changeType: 'bug',
      subject: 'Fix quiz leaderboard cache warming running twice on deploy (#990008)',
      files: ['modules/quizzes'],
      whatChanged: 'The leaderboard cache warm-up job ran twice after each deploy, doubling load briefly.',
      howToUse: 'No user action. Leaderboards behave exactly as before; the duplicate warm-up simply no longer happens behind the scenes.',
    })]);
    const res = r.results[0];
    console.log(`  info  status=${res.status} relevance=${JSON.stringify(res.relevance || null)}`);
    if (res.status === 'skipped-not-relevant') {
      console.log('  info  model judged it high-confidence irrelevant - acceptable alternative outcome');
      check(true, 'classified not-relevant (skipped at high confidence)');
      return;
    }
    check(res.status === 'created' || res.status === 'updated', 'ambiguous change still drafts', JSON.stringify(res));
    check(res.relevance && res.relevance.verdict === 'not-relevant', 'flagged not-relevant on the result (soft - model judgment)', JSON.stringify(res.relevance));
    if (res.path && res.relevance) {
      const text = fs.readFileSync(path.join(ROOT, res.path), 'utf8');
      check(/release-relevance:/.test(text), 'relevance comment present in the draft file');
      const drafts = await (await fetch(`${SERVER}/api/admin/authoring/drafts`, { headers: { Cookie: process.env.TEST_ADMIN_COOKIE || '' } })).json().catch(() => null);
      if (drafts && drafts.drafts) {
        const row = drafts.drafts.find((d) => d.path === res.path);
        check(row && row.relevanceFlag, 'drafts API surfaces relevanceFlag', JSON.stringify(row));
      } else {
        console.log('  info  drafts API check skipped (set TEST_ADMIN_COOKIE to a superadmin swhelp_session cookie to enable)');
      }
    }
  },

  async 'relevance-kill-switch'() {
    // Server must be running with RELEASE_RELEVANCE_LLM_DISABLED=1.
    const refactor = await dispatch([change({
      issueId: 990009,
      changeType: 'refactor',
      subject: 'Refactor survey mailer configuration loading (#990009)',
      files: ['modules/surveys'],
    })]);
    check(refactor.results[0].status === 'skipped-not-relevant', 'deterministic check still skips with LLM disabled', JSON.stringify(refactor.results[0]));
    const normal = await dispatch([change({
      issueId: 990010,
      subject: 'Add a shimmer-finish theme option to quiz certificates (#990010)',
      files: ['modules/quizzes'],
    })]);
    const res = normal.results[0];
    check(res.status === 'created' || res.status === 'updated', 'non-refactor drafts normally', JSON.stringify(res));
    check(!res.relevance, 'no flag attached while the relevance LLM is disabled', JSON.stringify(res.relevance || null));
  },

  async 'rate-limit'() {
    // Server must be running with RELEASE_SERVICE_RATE_LIMIT=1.
    const r = await dispatch([
      change({ issueId: 990011, subject: 'Add aurora borealis backdrop to the forms gallery (#990011)', files: ['modules/forms'] }),
      change({ issueId: 990012, subject: 'Add tectonic-drift animation to the forms gallery (#990012)', files: ['modules/forms'] }),
    ]);
    const statuses = r.results.map((x) => x.status).sort();
    check(statuses.includes('error'), 'second change rate-limits as error (marker will retry it)', JSON.stringify(r.results));
    check(statuses.includes('created') || statuses.includes('updated'), 'first change still drafts', JSON.stringify(r.results));
  },

  async 'empty-tag'() {
    const r = await dispatch([change({
      issueId: 990006,
      subject: 'Add a plasma-field intensity dial to form submission review (#990006)',
      files: ['modules/forms'],
    })], '');
    const res = r.results[0];
    check(res.status === 'created' || res.status === 'updated', 'empty-tag dispatch succeeds', JSON.stringify(res));
    if (res.path) {
      const prov = provenanceComments(res.path);
      check(prov.length >= 1, 'comment still parses with empty tag', JSON.stringify(prov));
      check(prov[0] && prov[0].tag === 'untagged', 'empty tag normalized to untagged', JSON.stringify(prov));
    }
  },
};

(async () => {
  const requested = process.argv.slice(2);
  const toRun = requested.length ? requested : ['create', 'provenance', 'empty-tag', 'multi-module', 'irrelevant'];
  for (const name of toRun) {
    if (!scenarios[name]) {
      console.error(`Unknown scenario "${name}". Available: ${Object.keys(scenarios).join(', ')}`);
      process.exit(1);
    }
    console.log(`\n== ${name} ==`);
    try {
      await scenarios[name]();
    } catch (e) {
      failures++;
      console.error(`  FAIL  scenario threw: ${e.message}`);
    }
  }
  console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAILURE(S)`}`);
  console.log('Reset test drafts with: git checkout -- docs/ && git clean -fd docs/');
  process.exit(failures === 0 ? 0 : 1);
})();
