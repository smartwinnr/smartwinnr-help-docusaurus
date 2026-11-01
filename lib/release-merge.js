'use strict';

const crypto = require('crypto');

/**
 * Pure logic for applying a release-pipeline change to an EXISTING article as
 * a small patch, instead of asking the model to re-emit the whole article.
 * Whole-article rewrites lost steps, images, titles and slugs even with the
 * refine overlay's "preserve everything" rules (v3.60.08: #9831, #9871, #9704),
 * so here the model only proposes operations and the server applies them.
 * The I/O wrapper (llmPatchArticle) lives in server.js beside
 * llmPickMatchingArticle; everything here is side-effect-free.
 *
 * Operations, all validated against the ORIGINAL body:
 *   { op: 'insert_after_heading', heading, markdown }  top of a section
 *   { op: 'append_to_section', heading, markdown }     end of a section
 *   { op: 'add_section', heading, markdown }           new H2 at the end
 *   { op: 'replace_sentence', find, replace }          one stale sentence
 *
 * Reply shape: { operations: [...], summary: '<one sentence>' }. An empty
 * operations list means "the article needs no change".
 */

const MAX_OPERATIONS = 8;
const MIN_FIND_LENGTH = 12;
const SUMMARY_MAX = 300;

// Internal identifiers the reader can't act on: camelCase, snake_case, script
// paths. Only flagged when the article doesn't already use the exact token.
// Two leading lowercase letters, so product words like iPad or eLearning pass.
const INTERNAL_TOKEN_RE = /\b[a-z]{2,}[A-Z][a-zA-Z0-9]*\b|\b[a-z0-9]+_[a-z0-9_]+\b|\b(?:scripts|modules|tools)\/[\w./-]+/g;

const IMAGE_RE = /!\[[^\]]*\]\([^)\s]+[^)]*\)/g;

/** Splits off the frontmatter block. head includes the closing fence. */
function splitFrontmatter(markdown) {
  const text = String(markdown || '');
  const m = /^---\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/.exec(text);
  if (!m) return { head: '', body: text };
  return { head: m[0], body: text.slice(m[0].length) };
}

/** Headings outside code fences: { level, text, key, start, end }, where
 *  start/end are the offsets of the heading line in `body`. */
function listHeadings(body) {
  const headings = [];
  let inFence = false;
  let offset = 0;
  for (const line of String(body).split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const m = !inFence && /^(#{1,6})[ \t]+(.+?)[ \t]*#*[ \t]*\r?$/.exec(line);
    if (m) {
      headings.push({
        level: m[1].length,
        text: m[2],
        key: normalizeHeading(m[2]),
        start: offset,
        end: offset + line.length,
      });
    }
    offset += line.length + 1;
  }
  return headings;
}

function normalizeHeading(s) {
  return String(s || '')
    .replace(/^#+\s*/, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function imagesIn(text) {
  return String(text || '').match(IMAGE_RE) || [];
}

/** Parses the model's reply. Returns { operations, summary } or null. */
function parsePatchReply(text) {
  try {
    const cleaned = String(text || '').trim()
      .replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed || !Array.isArray(parsed.operations)) return null;
    return {
      operations: parsed.operations,
      summary: typeof parsed.summary === 'string' ? parsed.summary.trim().slice(0, SUMMARY_MAX) : '',
    };
  } catch {
    return null;
  }
}

function checkAddedText(added, source, label) {
  const text = String(added || '');
  if (!text.trim()) return `${label}: empty text`;
  if (/^\s*---\s*$/m.test(text)) return `${label}: may not contain a horizontal rule or frontmatter fence`;
  if (text.includes('{/*')) return `${label}: may not contain MDX comments`;
  if (imagesIn(text).length > 0) return `${label}: may not add images`;
  for (const token of text.match(INTERNAL_TOKEN_RE) || []) {
    if (!source.includes(token)) return `${label}: names an internal identifier "${token}"`;
  }
  return null;
}

/** End of the section opened by `heading`: the next heading at the same or a
 *  higher level, else the end of the body. */
function sectionEnd(body, headings, heading) {
  const next = headings.find((h) => h.start > heading.start && h.level <= heading.level);
  return next ? next.start : body.length;
}

function block(text) {
  return String(text).replace(/^\s*\n/, '').replace(/\s+$/, '');
}

/**
 * Applies operations to `markdown`. Returns { ok: true, markdown, applied } or
 * { ok: false, error }. Never partially applies: one bad operation rejects
 * the whole patch so the retry sees a clean article again.
 */
function applyPatch(markdown, operations) {
  const { head, body } = splitFrontmatter(markdown);
  if (!Array.isArray(operations)) return { ok: false, error: 'operations must be an array' };
  if (operations.length === 0) return { ok: false, error: 'no operations' };
  if (operations.length > MAX_OPERATIONS) return { ok: false, error: `too many operations (max ${MAX_OPERATIONS})` };

  const headings = listHeadings(body);
  const edits = [];
  const appended = [];

  const findHeading = (wanted, label) => {
    const key = normalizeHeading(wanted);
    const hits = headings.filter((h) => h.key === key);
    if (hits.length === 0) return { error: `${label}: heading "${wanted}" not found` };
    if (hits.length > 1) return { error: `${label}: heading "${wanted}" appears more than once` };
    return { heading: hits[0] };
  };

  for (let i = 0; i < operations.length; i += 1) {
    const op = operations[i] || {};
    const label = `operation ${i + 1} (${op.op})`;

    if (op.op === 'insert_after_heading' || op.op === 'append_to_section') {
      const { heading, error } = findHeading(op.heading, label);
      if (error) return { ok: false, error };
      const bad = checkAddedText(op.markdown, markdown, label);
      if (bad) return { ok: false, error: bad };
      if (/^#{1,2}[ \t]/m.test(op.markdown)) return { ok: false, error: `${label}: may not add a level 1 or 2 heading, use add_section` };
      if (op.op === 'insert_after_heading') {
        edits.push({ start: heading.end, end: heading.end, text: `\n\n${block(op.markdown)}` });
      } else {
        const end = sectionEnd(body, headings, heading);
        const trimmedEnd = body.slice(0, end).replace(/\s+$/, '').length;
        edits.push({ start: trimmedEnd, end: trimmedEnd, text: `\n\n${block(op.markdown)}` });
      }
    } else if (op.op === 'add_section') {
      const title = String(op.heading || '').replace(/^#+\s*/, '').trim();
      if (!title) return { ok: false, error: `${label}: heading is required` };
      if (headings.some((h) => h.key === normalizeHeading(title))) {
        return { ok: false, error: `${label}: heading "${title}" already exists, use append_to_section` };
      }
      const bad = checkAddedText(op.markdown, markdown, label);
      if (bad) return { ok: false, error: bad };
      if (/^#{1,2}[ \t]/m.test(op.markdown)) return { ok: false, error: `${label}: body may not contain a level 1 or 2 heading` };
      appended.push(`## ${title}\n\n${block(op.markdown)}`);
    } else if (op.op === 'replace_sentence') {
      const find = String(op.find || '');
      const replace = String(op.replace || '');
      if (find.trim().length < MIN_FIND_LENGTH) return { ok: false, error: `${label}: find text is too short to be a sentence` };
      if (/\n/.test(find) || /\n/.test(replace)) return { ok: false, error: `${label}: may only touch one line` };
      if (!replace.trim()) return { ok: false, error: `${label}: may not delete text` };
      const start = body.indexOf(find);
      if (start === -1) return { ok: false, error: `${label}: text not found in the article` };
      if (body.indexOf(find, start + 1) !== -1) return { ok: false, error: `${label}: text appears more than once` };
      if (headings.some((h) => start < h.end && start + find.length > h.start)) {
        return { ok: false, error: `${label}: may not edit a heading` };
      }
      if (imagesIn(find).length > 0) return { ok: false, error: `${label}: may not edit an image` };
      const bad = checkAddedText(replace, markdown, label);
      if (bad) return { ok: false, error: bad };
      edits.push({ start, end: start + find.length, text: replace });
    } else {
      return { ok: false, error: `${label}: unknown operation` };
    }
  }

  const replaces = edits.filter((e) => e.end > e.start).sort((a, b) => a.start - b.start);
  for (let i = 1; i < replaces.length; i += 1) {
    if (replaces[i].start < replaces[i - 1].end) return { ok: false, error: 'two operations replace overlapping text' };
  }

  // Back to front so earlier offsets stay valid; a stable sort keeps two
  // inserts at one point in the order the model listed them.
  let next = body;
  const ordered = edits.map((e, i) => ({ ...e, i })).sort((a, b) => (b.start - a.start) || (b.i - a.i));
  for (const e of ordered) next = next.slice(0, e.start) + e.text + next.slice(e.end);
  if (appended.length > 0) {
    const tail = /\n$/.test(next) ? '\n' : '';
    next = `${next.replace(/\s+$/, '')}\n\n${appended.join('\n\n')}${tail}`;
  }

  const merged = head + next;
  const violation = findPreservationViolation(markdown, merged);
  if (violation) return { ok: false, error: violation };
  return { ok: true, markdown: merged, applied: operations.length };
}

/** Independent check of the promise this module makes, whatever the code
 *  above did: frontmatter byte-identical, every heading and image kept, and
 *  the article did not shrink. Returns a reason string or null. */
function findPreservationViolation(previous, next) {
  const a = splitFrontmatter(previous);
  const b = splitFrontmatter(next);
  if (a.head !== b.head) return 'frontmatter changed';
  const nextKeys = new Set(listHeadings(b.body).map((h) => h.key));
  for (const h of listHeadings(a.body)) {
    if (!nextKeys.has(h.key)) return `heading "${h.text}" was removed`;
  }
  for (const img of imagesIn(a.body)) {
    if (!b.body.includes(img)) return `image ${img} was removed`;
  }
  if (b.body.length < a.body.length * 0.95) return 'article got materially shorter';
  return null;
}

/** Chat messages for the patch call. `previousError` feeds the one retry. */
function buildPatchMessages(change, title, body, previousError) {
  const headings = listHeadings(body).map((h) => `${'#'.repeat(h.level)} ${h.text}`);
  const messages = [
    {
      role: 'system',
      content:
        'You update an existing SmartWinnr help article for a product change. You do NOT rewrite the article. You return the smallest set of edits that adds what a reader now needs to know. ' +
        'Respond with ONLY a JSON object: {"operations": [...], "summary": "<one plain sentence naming what the edits add or correct for the reader>"}. ' +
        'Operations: {"op":"insert_after_heading","heading":"<exact heading>","markdown":"<text>"}, {"op":"append_to_section","heading":"<exact heading>","markdown":"<text>"}, ' +
        '{"op":"add_section","heading":"<new heading>","markdown":"<text>"}, {"op":"replace_sentence","find":"<exact sentence copied from the article>","replace":"<corrected sentence>"}. ' +
        'Rules: ' +
        'Prefer append_to_section. Use replace_sentence only when the change makes an existing sentence wrong, and copy that sentence character for character. ' +
        'Use add_section only when no existing section fits; "Things to know" is the usual home for a behavior note. ' +
        'Never restate or tidy text that is still correct. Never add images. Max 8 operations, and most changes need 1 or 2. ' +
        'Write for the customer in present tense, American English, active voice, with UI names in bold. Describe how the product behaves now. Do not mention bugs, fixes, releases, "previously", "now", or engineering work. ' +
        'Never write role or permission names, field names, code identifiers, file paths, or scripts. ' +
        'If the change alters nothing a reader of THIS article would see or do, or the article stays accurate as it is, return {"operations": [], "summary": "<why no edit is needed>"}.',
    },
    {
      role: 'user',
      content: JSON.stringify({
        change: { subject: title, changeType: change.changeType, sections: change.sections || {} },
        articleHeadings: headings,
        article: body,
      }, null, 2),
    },
  ];
  if (previousError) {
    messages.push({
      role: 'user',
      content: `Your previous reply could not be applied: ${previousError}. Reply again with corrected JSON. Copy headings and sentences exactly from the article.`,
    });
  }
  return messages;
}

// ---------------------------------------------------------------------------
// The reviewer's note lives IN the article file beside the provenance stack,
// one per absorbed issue, until a human publishes it. It says what the bot
// meant to change; the diff against the live version shows what it did.

// Marks a draft the pipeline created from scratch. Drafts from before these
// notes carry neither kind, so the queue can't claim either for them.
const NEW_ARTICLE_NOTE = 'New article';

const UPDATE_COMMENT_RE = /\{\/\*\s*release-update:\s*issue=(\S+)\s+summary="([^"]*)"\s*\*\/\}/g;

function parseUpdateComments(markdown) {
  const found = [];
  for (const m of String(markdown || '').matchAll(UPDATE_COMMENT_RE)) {
    found.push({ issueId: m[1], summary: m[2] });
  }
  return found;
}

function stripUpdateComments(markdown) {
  return String(markdown || '').replace(new RegExp(UPDATE_COMMENT_RE.source + '[ \\t]*\\n?', 'g'), '');
}

/** Inserts the note comments right after the frontmatter, one per issue. */
function injectUpdateComments(markdown, notes) {
  const list = (notes || []).filter((n) => n && n.issueId);
  if (list.length === 0) return markdown;
  const { head, body } = splitFrontmatter(markdown);
  if (!head) return markdown;
  const seen = new Set();
  const lines = [];
  for (const n of list) {
    if (seen.has(String(n.issueId))) continue;
    seen.add(String(n.issueId));
    const summary = String(n.summary || '').replace(/"/g, "'").replace(/\*\//g, '').replace(/\s+/g, ' ').trim().slice(0, SUMMARY_MAX);
    lines.push(`{/* release-update: issue=${n.issueId} summary="${summary}" */}`);
  }
  const sep = head.endsWith('\n') ? '' : '\n';
  return `${head}${sep}${lines.join('\n')}\n${body}`;
}

// ---------------------------------------------------------------------------
// Line diff for the reviewer. Articles are a few hundred lines, so a plain
// LCS table is simple and fast enough.

/** Returns [{ type: 'same'|'add'|'remove', text }], in reading order. */
function lineDiff(previous, next) {
  const a = String(previous || '').split('\n');
  const b = String(next || '').split('\n');
  const table = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const lines = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { lines.push({ type: 'same', text: a[i] }); i += 1; j += 1; }
    else if (table[i + 1][j] >= table[i][j + 1]) { lines.push({ type: 'remove', text: a[i] }); i += 1; }
    else { lines.push({ type: 'add', text: b[j] }); j += 1; }
  }
  while (i < a.length) { lines.push({ type: 'remove', text: a[i] }); i += 1; }
  while (j < b.length) { lines.push({ type: 'add', text: b[j] }); j += 1; }
  return lines;
}

/** Added and removed line counts, ignoring blank lines. */
function diffStats(lines) {
  let added = 0;
  let removed = 0;
  for (const l of lines) {
    if (!l.text.trim()) continue;
    if (l.type === 'add') added += 1;
    if (l.type === 'remove') removed += 1;
  }
  return { added, removed };
}

/** Short fingerprint of what a commit says, stored in the provenance comment.
 *  The dispatcher sends one change per issue (the newest commit), with no
 *  sha, so a new fingerprint means a newer commit on the issue while a re-send
 *  of the same commit always matches. */
function changeRevision(change) {
  const { subject, sections, body } = change || {};
  return crypto.createHash('sha1').update(JSON.stringify([subject, sections, body])).digest('hex').slice(0, 12);
}

module.exports = {
  MAX_OPERATIONS,
  changeRevision,
  NEW_ARTICLE_NOTE,
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
};
