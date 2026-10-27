'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { chunkMarkdownSections } = require('../lib/doc-text');

const para = (word, n) => Array.from({ length: n }, (_, i) => `${word} sentence ${i}.`).join(' ');

test('sections stay whole and carry their heading', () => {
  const md = [
    '---', 'title: "T"', '---',
    'Intro text.',
    '## Tracking changes',
    `Open **Scenario Lifecycle Management** from the **⋮ menu**. ${para('history', 40)}`,
    '## Duplicating a scenario',
    `You can **duplicate** any scenario. ${para('copy', 40)}`,
  ].join('\n');
  const chunks = chunkMarkdownSections(md);
  const dup = chunks.find((c) => c.heading === 'Duplicating a scenario');
  assert.ok(dup, 'duplicate section has its own chunk');
  assert.match(dup.text, /^Duplicating a scenario: You can duplicate any scenario\./);
  assert.doesNotMatch(dup.text, /Lifecycle Management/);
});

test('small neighbouring sections are packed together up to the target', () => {
  const md = ['## Step 1', 'Do one.', '## Step 2', 'Do two.', '## Step 3', 'Do three.'].join('\n');
  const chunks = chunkMarkdownSections(md);
  assert.equal(chunks.length, 1);
  assert.equal(chunks[0].heading, 'Step 1 / Step 2 / Step 3');
  assert.equal(chunks[0].text, 'Step 1: Do one. Step 2: Do two. Step 3: Do three.');
});

test('a section longer than max is split, every piece keeps the heading', () => {
  const md = ['## Long', para('long', 300)].join('\n');
  const chunks = chunkMarkdownSections(md, { target: 1000, max: 2000 });
  assert.ok(chunks.length > 1);
  for (const c of chunks) {
    assert.equal(c.heading, 'Long');
    assert.match(c.text, /^Long: /);
  }
});

test('headings inside fenced code are not section breaks', () => {
  const md = ['Intro.', '```', '## not a heading', '```', 'After.'].join('\n');
  const chunks = chunkMarkdownSections(md);
  assert.equal(chunks.length, 1);
  assert.equal(chunks[0].heading, '');
});

test('empty input gives no chunks', () => {
  assert.deepEqual(chunkMarkdownSections(''), []);
  assert.deepEqual(chunkMarkdownSections('---\ntitle: x\n---\n'), []);
});
