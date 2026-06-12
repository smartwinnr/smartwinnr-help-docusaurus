#!/usr/bin/env node
/**
 * Collapse redirect chains.
 *
 * scripts/migrate-ia.js emitted:   /administration/quiz-module/foo  →  /modules/quiz/foo
 * scripts/bucket-articles.js emit: /modules/quiz/foo                →  /modules/quiz/create-and-manage/foo
 *
 * Docusaurus does not chain client-side redirects, so the first redirect now
 * points at a path that does not resolve. Rewrite the first redirect to point
 * at the bucketed final URL.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const FILE = path.resolve(__dirname, '..', 'data', 'redirects.json');
const obj = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const redirects = obj.redirects || [];

const fromToFinal = new Map();
for (const r of redirects) fromToFinal.set(r.from, r.to);

function resolve(url, seen = new Set()) {
  if (seen.has(url)) return url; // cycle guard
  seen.add(url);
  const next = fromToFinal.get(url);
  if (!next) return url;
  return resolve(next, seen);
}

const rewritten = redirects.map((r) => ({from: r.from, to: resolve(r.to)}));

// De-dupe and drop no-ops.
const seen = new Set();
const out = [];
for (const r of rewritten) {
  if (r.from === r.to) continue;
  const key = r.from + '→' + r.to;
  if (seen.has(key)) continue;
  seen.add(key);
  out.push(r);
}

fs.writeFileSync(FILE, JSON.stringify({version: 1, redirects: out}, null, 2) + '\n');
console.log(`compact-redirects: ${redirects.length} → ${out.length} entries`);
