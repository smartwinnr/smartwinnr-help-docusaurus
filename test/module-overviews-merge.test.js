'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { mergeModuleOverviews } = require('../lib/module-overviews-merge');

const doc = (modules, extra = {}) => JSON.stringify({ _comment: 'c', ...extra, modules }, null, 2) + '\n';
const AP = { label: 'Action Planning', privilege: 'actionPlanning' };
const CC = { label: 'Content Center', privilege: 'contentCenter' };
const QUIZ = { label: 'Quiz', privilege: 'quiz' };

test('stale local copy that dropped a module gets it restored (the eaca9598 case)', () => {
  const branch = doc({ quiz: QUIZ, actionplanning: AP });
  const local = doc({ quiz: QUIZ, 'content-center': CC });
  const r = mergeModuleOverviews(local, branch);
  const out = JSON.parse(r.content);
  assert.deepEqual(Object.keys(out.modules), ['quiz', 'actionplanning', 'content-center']);
  assert.deepEqual(out.modules.actionplanning, AP);
  assert.deepEqual(r.added, ['content-center']);
  assert.deepEqual(r.restored, ['actionplanning']);
  assert.deepEqual(r.kept, []);
});

test('stale local copy cannot revert a hand edit on the branch', () => {
  const branch = doc({ quiz: { ...QUIZ, label: 'Quizzes' } });
  const local = doc({ quiz: QUIZ, 'content-center': CC });
  const r = mergeModuleOverviews(local, branch);
  const out = JSON.parse(r.content);
  assert.equal(out.modules.quiz.label, 'Quizzes');
  assert.deepEqual(out.modules['content-center'], CC);
  assert.deepEqual(r.kept, ['quiz']);
});

test('non-module keys come from the branch', () => {
  const r = mergeModuleOverviews(doc({ quiz: QUIZ }, { _comment: 'old' }), doc({ quiz: QUIZ }, { _comment: 'new' }));
  assert.equal(JSON.parse(r.content)._comment, 'new');
});

test('an up-to-date local copy is shipped unchanged', () => {
  const branch = doc({ quiz: QUIZ });
  const local = doc({ quiz: QUIZ, actionplanning: AP });
  const r = mergeModuleOverviews(local, branch);
  assert.equal(r.content, local);
  assert.deepEqual([r.restored, r.kept], [[], []]);
});

test('no branch copy yet ships the local file as-is', () => {
  const local = doc({ quiz: QUIZ });
  const r = mergeModuleOverviews(local, null);
  assert.equal(r.content, local);
  assert.deepEqual(r.added, ['quiz']);
});

test('onlyAdd: a module removed on the branch is not resurrected from a stale disk copy', () => {
  const branch = doc({ quiz: QUIZ });
  const local = doc({ quiz: QUIZ, actionplanning: AP, 'content-center': CC });
  const r = mergeModuleOverviews(local, branch, { onlyAdd: new Set(['content-center']) });
  assert.deepEqual(Object.keys(JSON.parse(r.content).modules), ['quiz', 'content-center']);
  assert.deepEqual(r.added, ['content-center']);
  assert.deepEqual(r.ignored, ['actionplanning']);
});

test('onlyAdd empty: nothing local-only ships', () => {
  const r = mergeModuleOverviews(doc({ quiz: QUIZ, zappy: CC }), doc({ quiz: QUIZ }), { onlyAdd: [] });
  assert.deepEqual(Object.keys(JSON.parse(r.content).modules), ['quiz']);
  assert.deepEqual([r.added, r.ignored], [[], ['zappy']]);
});

test('invalid JSON on either side throws instead of guessing', () => {
  assert.throws(() => mergeModuleOverviews('{nope', doc({})), /queued copy\) is not valid JSON/);
  assert.throws(() => mergeModuleOverviews(doc({}), '{nope'), /publish-branch copy\) is not valid JSON/);
});
