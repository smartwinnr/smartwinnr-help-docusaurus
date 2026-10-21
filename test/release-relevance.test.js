'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  deterministicVerdict,
  buildRelevanceMessages,
  parseRelevanceVerdict,
  parseRelevanceComment,
  stripRelevanceComments,
  injectRelevanceComment,
} = require('../lib/release-relevance');

// --- deterministicVerdict -------------------------------------------------

test('refactor is always high-confidence not-relevant', () => {
  const v = deterministicVerdict({ changeType: 'refactor', files: ['modules/quizzes'] });
  assert.equal(v.verdict, 'not-relevant');
  assert.equal(v.confidence, 'high');
  assert.equal(v.source, 'deterministic');
});

test('all-non-product files are high-confidence not-relevant', () => {
  const v = deterministicVerdict({ changeType: 'bug', files: ['scripts', 'tools'] });
  assert.equal(v.verdict, 'not-relevant');
  assert.equal(v.confidence, 'high');
});

test('EMPTY files means unknown, never not-relevant (merge commits dispatch with no files)', () => {
  assert.equal(deterministicVerdict({ changeType: 'bug', files: [] }), null);
  assert.equal(deterministicVerdict({ changeType: 'feature' }), null);
});

test('a product module file defers to the LLM', () => {
  assert.equal(deterministicVerdict({ changeType: 'bug', files: ['modules/quizzes', 'scripts'] }), null);
});

// --- parseRelevanceVerdict ------------------------------------------------

test('parses a clean verdict', () => {
  const v = parseRelevanceVerdict('{"verdict":"relevant","confidence":"high","reason":"Visible in the quiz UI."}');
  assert.deepEqual(v, { verdict: 'relevant', confidence: 'high', reason: 'Visible in the quiz UI.', source: 'llm' });
});

test('parses a fenced verdict', () => {
  const v = parseRelevanceVerdict('```json\n{"verdict":"not-relevant","confidence":"medium","reason":"Internal."}\n```');
  assert.equal(v.verdict, 'not-relevant');
  assert.equal(v.confidence, 'medium');
});

test('garbage and bad enums return null', () => {
  assert.equal(parseRelevanceVerdict('I think this is relevant.'), null);
  assert.equal(parseRelevanceVerdict('{"verdict":"maybe","confidence":"high","reason":"x"}'), null);
  assert.equal(parseRelevanceVerdict('{"verdict":"relevant","confidence":"certain","reason":"x"}'), null);
  assert.equal(parseRelevanceVerdict(''), null);
  assert.equal(parseRelevanceVerdict(null), null);
});

// --- relevance comment round-trip ------------------------------------------

const MD = '---\ntitle: "X"\ndraft: true\n---\n\nBody text.';

test('inject/parse/strip round-trip', () => {
  const flag = { verdict: 'not-relevant', confidence: 'medium', reason: 'Probably internal "tooling".' };
  const withFlag = injectRelevanceComment(MD, flag);
  assert.ok(withFlag.includes('release-relevance:'));
  const parsed = parseRelevanceComment(withFlag);
  assert.equal(parsed.verdict, 'not-relevant');
  assert.equal(parsed.confidence, 'medium');
  // Double quotes in the reason are normalized so the comment stays parseable.
  assert.ok(parsed.reason.includes("'tooling'"));
  const stripped = stripRelevanceComments(withFlag);
  assert.equal(stripped, MD);
  assert.equal(parseRelevanceComment(stripped), null);
});

test('null flag is a no-op; comment lands after the frontmatter fence', () => {
  assert.equal(injectRelevanceComment(MD, null), MD);
  const withFlag = injectRelevanceComment(MD, { verdict: 'not-relevant', confidence: 'low', reason: 'r' });
  const fenceEnd = withFlag.indexOf('\n---') + 4;
  assert.ok(withFlag.slice(fenceEnd).trimStart().startsWith('{/* release-relevance:'));
});

test('an LLM-copied comment is removed by strip (the server re-injects its own)', () => {
  const sneaky = MD + '\n{/* release-relevance: verdict=relevant confidence=high reason="invented" */}\n';
  assert.ok(!stripRelevanceComments(sneaky).includes('release-relevance'));
});

// --- messages shape ---------------------------------------------------------

test('buildRelevanceMessages carries subject, sections and files', () => {
  const msgs = buildRelevanceMessages(
    { changeType: 'bug', sections: { Why: 'because' }, files: ['modules/quizzes'] },
    'Fix the quiz timer',
  );
  assert.equal(msgs.length, 2);
  assert.equal(msgs[0].role, 'system');
  const payload = JSON.parse(msgs[1].content);
  assert.equal(payload.subject, 'Fix the quiz timer');
  assert.deepEqual(payload.files, ['modules/quizzes']);
  assert.equal(payload.sections.Why, 'because');
});
