#!/usr/bin/env node
/**
 * Ally eval: does retrieval put the right article in front of the model, and
 * does the answer say the right thing, the same way, every time?
 *
 * Runs the questions in test/fixtures/chat-eval.json against a running
 * server.js (local by default) as a minted superadmin session:
 *
 *   node scripts/eval-chat.js                       # retrieval only (no answer-model spend)
 *   node scripts/eval-chat.js --answer --runs 3     # + full /api/chat, 3 fresh conversations per case
 *   node scripts/eval-chat.js --only duplicate-scenario-1,sheet-file-size --verbose
 *   node scripts/eval-chat.js --answer --label gpt-6-luna --out eval-luna.json
 *   node scripts/eval-chat.js --answer --skip-retrieval   # server without the preview endpoint
 *
 * Retrieval uses POST /api/admin/chat-logs/retrieval-preview, the exact
 * condense + retrieve path /api/chat uses. The answer model is whatever
 * CHAT_MODEL the server was started with; to compare models, restart the
 * server with another CHAT_MODEL and rerun with a different --label.
 *
 * Needs HELP_JWT_SECRET in .env (same as scripts/dev-mint-cookie.js). Against
 * production pass --server and --cookie <swhelp_session value> instead.
 */
'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const axios = require('axios');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) out[key] = true;
    else { out[key] = next; i++; }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const SERVER = String(args.server || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '');
const RUNS = Math.max(1, Number(args.runs) || 3);
const FIXTURE = path.resolve(args.fixture || path.join(__dirname, '..', 'test', 'fixtures', 'chat-eval.json'));
const ONLY = args.only ? new Set(String(args.only).split(',').map((s) => s.trim())) : null;

function sessionCookie() {
  if (typeof args.cookie === 'string') return args.cookie;
  const { signSessionToken } = require('../auth/jwt');
  return signSessionToken({
    email: 'eval@smartwinnr.com',
    displayName: 'Eval',
    roles: ['superadmin'],
    region: 'local',
    orgId: 'eval',
    orgName: 'Eval',
    privileges: [],
  });
}

const { COOKIE_NAME } = require('../auth/jwt');
const http = axios.create({
  baseURL: SERVER,
  headers: { Cookie: `${COOKIE_NAME}=${sessionCookie()}`, 'Content-Type': 'application/json' },
  timeout: 90000,
  validateStatus: () => true,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const re = (s) => new RegExp(s, 'i');

function tokens(text) {
  return new Set(String(text || '').toLowerCase().match(/[a-z0-9]+/g) || []);
}
function jaccard(a, b) {
  const A = tokens(a);
  const B = tokens(b);
  if (!A.size && !B.size) return 1;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / (A.size + B.size - inter);
}

async function evalRetrieval(c) {
  const res = await http.post('/api/admin/chat-logs/retrieval-preview', { message: c.question, as: c.as });
  if (res.status !== 200) throw new Error(`retrieval-preview HTTP ${res.status}: ${JSON.stringify(res.data).slice(0, 200)}`);
  const { queries, results, trace } = res.data;
  const sources = results.map((r) => r.source);
  const ranks = c.expect.map((e) => sources.indexOf(e)).filter((i) => i >= 0);
  const firstRank = ranks.length ? Math.min(...ranks) + 1 : null;
  // Where did the expected articles go if they weren't used?
  const missed = c.expect
    .filter((e) => !sources.includes(e))
    .map((e) => {
      const t = trace.find((x) => x.source === e);
      return t ? `${e} (${t.status} @ ${t.distance})` : `${e} (not retrieved)`;
    });
  return { queries, firstRank, hit: firstRank !== null, used: results, missed };
}

async function evalAnswers(c, bannedEverywhere) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) {
    // No conversationId: every run is a fresh first message, like a new widget.
    // Infrastructure failures (index outage, OpenAI unreachable -> the fallback
    // message) say nothing about answer quality: retry them, and if they keep
    // failing record the run as an error rather than a wrong answer.
    let res;
    for (let attempt = 0; attempt < 3; attempt++) {
      res = await http.post('/api/chat', { message: c.question, userContext: { pageUrl: '/eval' } });
      await sleep(1100); // /api/chat allows ~1 request per second per user
      const infraFail = res.status !== 200 || res.data?.response?.unavailable
        || /having trouble accessing my AI capabilities/.test(res.data?.response?.message || '');
      if (!infraFail) break;
      res = { status: res.status === 200 ? 599 : res.status };
      await sleep(5000);
    }
    if (res.status !== 200) {
      runs.push({ error: `HTTP ${res.status}` });
      continue;
    }
    const text = res.data?.response?.message || '';
    const factsMissing = (c.facts || []).filter((f) => !re(f).test(text));
    const bannedHit = [...(c.banned || []), ...bannedEverywhere].filter((b) => re(b).test(text));
    runs.push({ text, factsMissing, bannedHit, ok: factsMissing.length === 0 && bannedHit.length === 0 });
  }
  const texts = runs.filter((r) => !r.error).map((r) => r.text);
  let minSim = 1;
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) minSim = Math.min(minSim, jaccard(texts[i], texts[j]));
  }
  const okCount = runs.filter((r) => r.ok).length;
  const answered = runs.filter((r) => !r.error).length;
  return {
    runs,
    okCount,
    errors: runs.length - answered,
    // Consistent = every answered run passed, or none did.
    consistent: okCount === 0 || okCount === answered,
    minSimilarity: Math.round(minSim * 100) / 100,
  };
}

async function main() {
  const fixture = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
  const cases = fixture.cases.filter((c) => !ONLY || ONLY.has(c.id));
  const bannedEverywhere = fixture.bannedEverywhere || [];
  const report = { label: args.label || null, server: SERVER, at: new Date().toISOString(), cases: [] };

  console.log(`Ally eval: ${cases.length} case(s) against ${SERVER}${args.answer ? `, ${RUNS} answer run(s) each` : ''}\n`);
  for (const c of cases) {
    const row = { id: c.id, gap: !!c.gap };
    try {
      if (!args['skip-retrieval']) row.retrieval = await evalRetrieval(c);
      if (args.answer) row.answers = await evalAnswers(c, bannedEverywhere);
    } catch (e) {
      row.error = e.message;
    }
    report.cases.push(row);

    const r = row.retrieval;
    const parts = [
      row.error ? 'ERROR' : (!r ? '  -  ' : (r.hit ? `hit@${r.firstRank}` : 'MISS ')),
      row.gap ? '[gap]' : '     ',
      c.id.padEnd(28),
    ];
    if (row.answers) {
      parts.push(`answers ${row.answers.okCount}/${RUNS} ok`, row.answers.consistent ? 'consistent' : 'INCONSISTENT', `sim ${row.answers.minSimilarity}`);
      if (row.answers.errors) parts.push(`(${row.answers.errors} infra error${row.answers.errors === 1 ? '' : 's'})`);
    }
    console.log(parts.join('  '));
    if (row.error) console.log(`      ${row.error}`);
    if (r && (args.verbose || !r.hit)) {
      if (r.queries.length !== 1 || r.queries[0] !== c.question) console.log(`      queries: ${JSON.stringify(r.queries)}`);
      for (const m of r.missed) console.log(`      expected: ${m}`);
      if (args.verbose) for (const u of r.used) console.log(`      used ${u.distance.toFixed(3)} ${u.source}#${u.chunk} ${u.heading ? `[${u.heading}]` : ''}`);
    }
    if (row.answers && (args.verbose || row.answers.okCount < RUNS)) {
      row.answers.runs.forEach((run, i) => {
        if (run.error) return console.log(`      run ${i + 1}: ${run.error}`);
        const why = [...run.factsMissing.map((f) => `missing /${f}/`), ...run.bannedHit.map((b) => `banned /${b}/`)].join(', ');
        console.log(`      run ${i + 1}: ${run.ok ? 'ok' : why} | ${run.text.replace(/\s+/g, ' ').slice(0, 160)}`);
      });
    }
  }

  const scored = report.cases.filter((r) => !r.gap && r.retrieval);
  const hits = scored.filter((r) => r.retrieval.hit).length;
  report.summary = { retrievalHits: hits, retrievalScored: scored.length };
  console.log(`\nRetrieval: ${hits}/${scored.length} expected articles reached the model (gap cases excluded)`);
  if (args.answer) {
    const answered = report.cases.filter((r) => r.answers);
    const allOk = answered.filter((r) => r.answers.okCount === RUNS).length;
    const consistent = answered.filter((r) => r.answers.consistent).length;
    report.summary.answersAllRunsOk = allOk;
    report.summary.answersConsistent = consistent;
    report.summary.answered = answered.length;
    console.log(`Answers:   ${allOk}/${answered.length} passed every run; ${consistent}/${answered.length} consistent across ${RUNS} runs`);
  }
  if (args.out) {
    fs.writeFileSync(path.resolve(String(args.out)), JSON.stringify(report, null, 2));
    console.log(`Report written to ${args.out}`);
  }
}

main().catch((e) => {
  console.error(`eval-chat failed: ${e.message}`);
  process.exit(1);
});
