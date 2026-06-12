#!/usr/bin/env node
/**
 * CI guard: every customProps.privilege / customProps.anyPrivilege string used
 * in the help site must exist in data/known-privileges.json (the snapshotted
 * LMS privileges enum).
 *
 * Scans:
 *   sidebars.ts                        (string literals after `privilege:` / `anyPrivilege:`)
 *   docs/ ** / _category_.json
 *   docs/ ** / *.md  (YAML frontmatter)
 *
 * Exits non-zero with a list of unknown keys, so it can be wired into prebuild.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const KNOWN_FILE = path.join(ROOT, 'data', 'known-privileges.json');

function readKnown() {
  const json = JSON.parse(fs.readFileSync(KNOWN_FILE, 'utf8'));
  return new Set(json.privileges);
}

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else {
      out.push(full);
    }
  }
}

function extractFromSidebars(text) {
  const found = [];
  const reSingle = /privilege\s*:\s*['"]([A-Za-z0-9_]+)['"]/g;
  const reAny = /anyPrivilege\s*:\s*\[([^\]]*)\]/g;
  let m;
  while ((m = reSingle.exec(text)) !== null) {
    found.push({key: m[1], where: 'sidebars.ts'});
  }
  while ((m = reAny.exec(text)) !== null) {
    const arr = m[1];
    const reItem = /['"]([A-Za-z0-9_]+)['"]/g;
    let n;
    while ((n = reItem.exec(arr)) !== null) {
      found.push({key: n[1], where: 'sidebars.ts (anyPrivilege)'});
    }
  }
  return found;
}

function extractFromCategoryJson(filePath) {
  try {
    const obj = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const cp = obj && obj.customProps;
    if (!cp) return [];
    const found = [];
    if (typeof cp.privilege === 'string') {
      found.push({key: cp.privilege, where: filePath});
    }
    if (Array.isArray(cp.anyPrivilege)) {
      for (const p of cp.anyPrivilege) {
        if (typeof p === 'string') found.push({key: p, where: filePath});
      }
    }
    if (Array.isArray(cp.allPrivileges)) {
      for (const p of cp.allPrivileges) {
        if (typeof p === 'string') found.push({key: p, where: filePath});
      }
    }
    return found;
  } catch {
    return [];
  }
}

function extractFromFrontmatter(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  if (!text.startsWith('---')) return [];
  const end = text.indexOf('\n---', 3);
  if (end === -1) return [];
  const fm = text.slice(3, end);

  const found = [];
  // Single-key: `  privilege: foo` or `  privilege: "foo"`
  const reSingle = /^\s*privilege\s*:\s*["']?([A-Za-z0-9_]+)["']?\s*$/m;
  const ms = reSingle.exec(fm);
  if (ms) found.push({key: ms[1], where: filePath});

  // Array: `  anyPrivilege: [a, b]`
  const reAny = /^\s*anyPrivilege\s*:\s*\[([^\]]*)\]/m;
  const ma = reAny.exec(fm);
  if (ma) {
    const reItem = /["']?([A-Za-z0-9_]+)["']?/g;
    let n;
    while ((n = reItem.exec(ma[1])) !== null) {
      found.push({key: n[1], where: filePath});
    }
  }
  return found;
}

function main() {
  const known = readKnown();

  // Sidebars
  const sidebarPath = path.join(ROOT, 'sidebars.ts');
  const sidebarRefs = fs.existsSync(sidebarPath)
    ? extractFromSidebars(fs.readFileSync(sidebarPath, 'utf8'))
    : [];

  // Docs tree
  const docsRoot = path.join(ROOT, 'docs');
  const docFiles = [];
  if (fs.existsSync(docsRoot)) walk(docsRoot, docFiles);

  const categoryRefs = docFiles
    .filter((f) => path.basename(f) === '_category_.json')
    .flatMap(extractFromCategoryJson);

  const articleRefs = docFiles
    .filter((f) => f.endsWith('.md'))
    .flatMap(extractFromFrontmatter);

  const all = [...sidebarRefs, ...categoryRefs, ...articleRefs];
  const unknown = all.filter((r) => !known.has(r.key));

  if (unknown.length === 0) {
    console.log(
      `validate-privilege-keys: OK — checked ${all.length} privilege reference(s) across ` +
        `sidebars.ts, ${categoryRefs.length} _category_.json files, and ${articleRefs.length} articles.`,
    );
    process.exit(0);
  }

  console.error('validate-privilege-keys: FAIL');
  console.error(`  ${unknown.length} unknown privilege key(s) referenced in the help site.`);
  console.error('  Either fix the typo, or update data/known-privileges.json from the LMS enum.');
  console.error('');
  for (const ref of unknown) {
    const where = path.relative(ROOT, ref.where);
    console.error(`  • ${ref.key}\n      in ${where}`);
  }
  process.exit(1);
}

main();
