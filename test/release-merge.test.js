'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MAX_OPERATIONS,
  changeRevision,
  splitFrontmatter,
  listHeadings,
  parsePatchReply,
  applyPatch,
  findPreservationViolation,
  buildPatchMessages,
  parseUpdateComments,
  stripUpdateComments,
  injectUpdateComments,
  lineDiff,
  diffStats,
} = require('../lib/release-merge');

const ARTICLE = `---
id: abc123
title: "How to read leaderboard data"
slug: read-leaderboard
draft: false
---

> **At a glance** - Use the leaderboard to monitor rankings.

## When to use this

- Check rankings

## Steps

### 1. Open the competition

Open the competition you want to review.

![Open it](/img/a.png)

### 2. Download data

Click **Download** to save the report.

\`\`\`text
## not a heading
\`\`\`

:::note
Scores update every hour.
:::

## Things to know

The leaderboard shows the Time column.`;

const ok = (ops) => {
  const r = applyPatch(ARTICLE, ops);
  assert.equal(r.ok, true, r.error);
  return r.markdown;
};
const fails = (ops, pattern) => {
  const r = applyPatch(ARTICLE, ops);
  assert.equal(r.ok, false);
  assert.match(r.error, pattern);
};

// --- structure ------------------------------------------------------------

test('splitFrontmatter separates head and body', () => {
  const { head, body } = splitFrontmatter(ARTICLE);
  assert.ok(head.startsWith('---\n') && head.endsWith('---\n'));
  assert.ok(body.includes('## Steps') && !body.includes('slug:'));
  assert.equal(splitFrontmatter('no frontmatter').head, '');
});

test('listHeadings ignores headings inside code fences', () => {
  const texts = listHeadings(splitFrontmatter(ARTICLE).body).map((h) => h.text);
  assert.deepEqual(texts, ['When to use this', 'Steps', '1. Open the competition', '2. Download data', 'Things to know']);
});

// --- valid operations -----------------------------------------------------

test('append_to_section lands at the end of that section, before the next heading', () => {
  const out = ok([{ op: 'append_to_section', heading: 'When to use this', markdown: '- Check times' }]);
  assert.ok(out.includes('- Check rankings\n\n- Check times\n\n## Steps'));
});

test('append_to_section on the last section works with no trailing newline', () => {
  const out = ok([{ op: 'append_to_section', heading: 'Things to know', markdown: 'Times show whole seconds.' }]);
  assert.ok(out.endsWith('The leaderboard shows the Time column.\n\nTimes show whole seconds.'));
});

test('append_to_section on an H2 includes its H3 children', () => {
  const out = ok([{ op: 'append_to_section', heading: 'Steps', markdown: 'Extra closing line.' }]);
  assert.ok(out.indexOf('Extra closing line.') > out.indexOf(':::note'));
  assert.ok(out.indexOf('Extra closing line.') < out.indexOf('## Things to know'));
});

test('insert_after_heading lands directly under the heading', () => {
  const out = ok([{ op: 'insert_after_heading', heading: 'Things to know', markdown: 'First note.' }]);
  assert.ok(out.includes('## Things to know\n\nFirst note.\n\nThe leaderboard shows'));
});

test('heading match tolerates case and hash marks, not other text', () => {
  ok([{ op: 'append_to_section', heading: '## THINGS TO KNOW', markdown: 'Note.' }]);
  fails([{ op: 'append_to_section', heading: 'Things you should know', markdown: 'Note.' }], /not found/);
});

test('add_section appends a new H2 and keeps the end-of-file shape', () => {
  const out = ok([{ op: 'add_section', heading: 'Time display', markdown: 'Times show whole seconds.' }]);
  assert.ok(out.endsWith('## Time display\n\nTimes show whole seconds.'));
});

test('replace_sentence swaps exactly one sentence', () => {
  const out = ok([{ op: 'replace_sentence', find: 'Scores update every hour.', replace: 'Scores update every minute.' }]);
  assert.ok(out.includes('Scores update every minute.') && !out.includes('every hour'));
  assert.ok(out.includes(':::note\nScores'));
});

test('several operations apply together and in listed order at one point', () => {
  const out = ok([
    { op: 'append_to_section', heading: 'Things to know', markdown: 'One.' },
    { op: 'append_to_section', heading: 'Things to know', markdown: 'Two.' },
    { op: 'replace_sentence', find: 'Open the competition you want to review.', replace: 'Open any competition you want to review.' },
    { op: 'add_section', heading: 'Limits', markdown: 'Three.' },
  ]);
  assert.ok(out.indexOf('One.') < out.indexOf('Two.'));
  assert.ok(out.includes('Open any competition'));
  assert.ok(out.endsWith('## Limits\n\nThree.'));
});

test('frontmatter, headings, images and untouched text survive every valid patch', () => {
  const out = ok([{ op: 'append_to_section', heading: 'Steps', markdown: 'More.' }]);
  assert.equal(splitFrontmatter(out).head, splitFrontmatter(ARTICLE).head);
  assert.ok(out.includes('![Open it](/img/a.png)') && out.includes('## not a heading'));
});

test('an article with no frontmatter can still be patched', () => {
  const r = applyPatch('## A\n\nBody text.\n', [{ op: 'append_to_section', heading: 'A', markdown: 'More.' }]);
  assert.equal(r.ok, true, r.error);
  assert.equal(r.markdown, '## A\n\nBody text.\n\nMore.\n');
});

// --- rejected operations --------------------------------------------------

test('rejects an empty, missing or oversized operation list', () => {
  fails([], /no operations/);
  assert.equal(applyPatch(ARTICLE, null).ok, false);
  fails(Array(MAX_OPERATIONS + 1).fill({ op: 'append_to_section', heading: 'Steps', markdown: 'x' }), /too many/);
});

test('rejects unknown operations and null entries', () => {
  fails([{ op: 'rewrite_article', markdown: 'x' }], /unknown operation/);
  fails([null], /unknown operation/);
});

test('rejects a duplicate heading target', () => {
  const dup = '---\ntitle: x\n---\n\n## Notes\n\nA.\n\n## Notes\n\nB.\n';
  const r = applyPatch(dup, [{ op: 'append_to_section', heading: 'Notes', markdown: 'C.' }]);
  assert.equal(r.ok, false);
  assert.match(r.error, /more than once/);
});

test('rejects replace_sentence that is missing, repeated, too short, multi-line or a deletion', () => {
  fails([{ op: 'replace_sentence', find: 'This sentence is not there.', replace: 'New sentence here.' }], /not found/);
  const twice = '---\ntitle: x\n---\n\nThe same sentence.\n\nThe same sentence.\n';
  assert.match(applyPatch(twice, [{ op: 'replace_sentence', find: 'The same sentence.', replace: 'Other text.' }]).error, /more than once/);
  fails([{ op: 'replace_sentence', find: 'Scores', replace: 'Totals' }], /too short/);
  fails([{ op: 'replace_sentence', find: 'Scores update\nevery hour.', replace: 'x' }], /one line/);
  fails([{ op: 'replace_sentence', find: 'Scores update every hour.', replace: '   ' }], /delete/);
});

test('rejects editing a heading or an image through replace_sentence', () => {
  fails([{ op: 'replace_sentence', find: '## Things to know', replace: '## Other title' }], /heading/);
  fails([{ op: 'replace_sentence', find: '![Open it](/img/a.png)', replace: 'gone from here' }], /image/);
});

test('rejects two replacements of overlapping text', () => {
  fails([
    { op: 'replace_sentence', find: 'Scores update every hour.', replace: 'Scores update daily now.' },
    { op: 'replace_sentence', find: 'update every hour.', replace: 'update weekly now.' },
  ], /overlapping/);
});

test('rejects added text carrying frontmatter, comments, images or H1/H2 headings', () => {
  fails([{ op: 'append_to_section', heading: 'Steps', markdown: '---\nslug: other\n---' }], /fence/);
  fails([{ op: 'append_to_section', heading: 'Steps', markdown: '{/* release-draft: x */}' }], /comments/);
  fails([{ op: 'append_to_section', heading: 'Steps', markdown: '![x](/img/b.png)' }], /images/);
  fails([{ op: 'append_to_section', heading: 'Steps', markdown: '## Sneaky' }], /heading/);
  fails([{ op: 'add_section', heading: 'New', markdown: '# Sneaky' }], /heading/);
  fails([{ op: 'append_to_section', heading: 'Steps', markdown: '   ' }], /empty/);
});

test('rejects add_section when the section already exists', () => {
  fails([{ op: 'add_section', heading: 'Things to know', markdown: 'x' }], /already exists/);
  fails([{ op: 'add_section', heading: '', markdown: 'x' }], /required/);
});

test('rejects internal identifiers the article does not already use', () => {
  fails([{ op: 'append_to_section', heading: 'Steps', markdown: 'Uses startHours from the rule.' }], /startHours/);
  fails([{ op: 'append_to_section', heading: 'Steps', markdown: 'Reads average_score here.' }], /average_score/);
  fails([{ op: 'append_to_section', heading: 'Steps', markdown: 'Run scripts/reindex.js once.' }], /scripts\/reindex/);
});

test('allows an identifier the article already contains, and ordinary words', () => {
  const src = '---\ntitle: x\n---\n\n## A\n\nThe dayWise rule applies.\n';
  assert.equal(applyPatch(src, [{ op: 'append_to_section', heading: 'A', markdown: 'The dayWise rule also repeats.' }]).ok, true);
  ok([{ op: 'append_to_section', heading: 'Steps', markdown: 'Click **Download** on an iPad or PowerPoint file.' }]);
});

test('a failed patch never returns partial output', () => {
  const r = applyPatch(ARTICLE, [
    { op: 'append_to_section', heading: 'Steps', markdown: 'Fine.' },
    { op: 'append_to_section', heading: 'Missing', markdown: 'Bad.' },
  ]);
  assert.equal(r.ok, false);
  assert.equal(r.markdown, undefined);
});

// --- preservation check (the v3.60.08 failures) -----------------------------

test('flags a changed title or slug', () => {
  const next = ARTICLE.replace('slug: read-leaderboard', 'slug: time-display');
  assert.match(findPreservationViolation(ARTICLE, next), /frontmatter/);
});

test('flags a removed section, as in #9831', () => {
  const next = ARTICLE.replace(/## Steps[\s\S]*?(?=## Things to know)/, '');
  assert.match(findPreservationViolation(ARTICLE, next), /Steps/);
});

test('flags a removed image, as in #9871', () => {
  assert.match(findPreservationViolation(ARTICLE, ARTICLE.replace('![Open it](/img/a.png)', 'Screenshot.')), /image/);
});

test('flags an article that shrank with its headings intact', () => {
  const next = ARTICLE.replace('Open the competition you want to review.', '').replace('Click **Download** to save the report.', '');
  assert.match(findPreservationViolation(ARTICLE, next), /shorter/);
});

test('passes an unchanged article', () => {
  assert.equal(findPreservationViolation(ARTICLE, ARTICLE), null);
});

// --- parsePatchReply ------------------------------------------------------

test('parses plain and fenced JSON', () => {
  assert.equal(parsePatchReply('{"operations":[],"summary":"Nothing."}').summary, 'Nothing.');
  const fenced = parsePatchReply('```json\n{"operations":[{"op":"x"}],"summary":"S"}\n```');
  assert.equal(fenced.operations.length, 1);
});

test('returns null on garbage or a missing operations list', () => {
  assert.equal(parsePatchReply('I would add a section.'), null);
  assert.equal(parsePatchReply('{"summary":"x"}'), null);
  assert.equal(parsePatchReply('{"operations":"none"}'), null);
  assert.equal(parsePatchReply(''), null);
  assert.equal(parsePatchReply(null), null);
});

test('a missing summary becomes an empty string', () => {
  assert.equal(parsePatchReply('{"operations":[]}').summary, '');
});

// --- buildPatchMessages ---------------------------------------------------

test('messages carry the headings, the article and the change', () => {
  const body = splitFrontmatter(ARTICLE).body;
  const msgs = buildPatchMessages({ changeType: 'bug', sections: { 'What changed': 'X' } }, 'Subject', body);
  assert.equal(msgs.length, 2);
  const user = JSON.parse(msgs[1].content);
  assert.ok(user.articleHeadings.includes('## Things to know'));
  assert.equal(user.article, body);
  assert.equal(user.change.sections['What changed'], 'X');
});

test('the retry adds the previous error', () => {
  const msgs = buildPatchMessages({}, 'S', 'body', 'heading "X" not found');
  assert.equal(msgs.length, 3);
  assert.match(msgs[2].content, /heading "X" not found/);
});

// --- update comments ------------------------------------------------------

test('update comments round-trip, one per issue, after the frontmatter', () => {
  const out = injectUpdateComments(ARTICLE, [
    { issueId: '9871', summary: 'Says commas stay in values.' },
    { issueId: '9871', summary: 'Duplicate is dropped.' },
    { issueId: '9704', summary: 'Adds the "metatag" filter.' },
  ]);
  assert.deepEqual(parseUpdateComments(out), [
    { issueId: '9871', summary: 'Says commas stay in values.' },
    { issueId: '9704', summary: "Adds the 'metatag' filter." },
  ]);
  assert.ok(out.indexOf('release-update') > out.indexOf('draft: false'));
  assert.equal(stripUpdateComments(out), ARTICLE);
});

test('a summary cannot break out of the comment', () => {
  const out = injectUpdateComments(ARTICLE, [{ issueId: '1', summary: 'bad */} {/* text' }]);
  assert.equal(parseUpdateComments(out).length, 1);
  assert.equal(stripUpdateComments(out), ARTICLE);
});

test('no notes is a no-op', () => {
  assert.equal(injectUpdateComments(ARTICLE, []), ARTICLE);
  assert.equal(injectUpdateComments(ARTICLE, null), ARTICLE);
  assert.equal(injectUpdateComments('no frontmatter', [{ issueId: '1', summary: 's' }]), 'no frontmatter');
});

// --- lineDiff -------------------------------------------------------------

test('lineDiff marks added and removed lines and keeps reading order', () => {
  const lines = lineDiff('a\nb\nc', 'a\nx\nc\nd');
  assert.deepEqual(lines.map((l) => `${l.type}:${l.text}`), ['same:a', 'remove:b', 'add:x', 'same:c', 'add:d']);
  assert.deepEqual(diffStats(lines), { added: 2, removed: 1 });
});

test('lineDiff handles identical and empty input, and stats skip blank lines', () => {
  assert.ok(lineDiff('a\nb', 'a\nb').every((l) => l.type === 'same'));
  assert.deepEqual(diffStats(lineDiff('', 'a\n\nb')), { added: 2, removed: 0 });
});

test('changeRevision is stable for a re-send and changes with a newer commit', () => {
  const change = { issueId: '1', subject: 'Add x (#1)', sections: { 'What changed': 'a' }, body: 'full', tag: 'v1' };
  assert.equal(changeRevision(change), changeRevision({ ...change, tag: 'v2' }));
  assert.match(changeRevision(change), /^[0-9a-f]{12}$/);
  assert.notEqual(changeRevision(change), changeRevision({ ...change, body: 'follow-up' }));
  assert.notEqual(changeRevision(change), changeRevision({ ...change, sections: { 'What changed': 'b' } }));
});
