#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const REPO_ROOT = path.join(__dirname, '..');
const DOCS_ROOT = path.join(REPO_ROOT, 'docs');
const REPORTS_DIR = path.join(REPO_ROOT, 'reports');
const OUTPUT_FILE = path.join(REPORTS_DIR, 'article-inventory.csv');

function walkDocs(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDocs(fullPath));
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }
  return files;
}

function humanizeFilename(filename) {
  const base = filename.replace(/\.mdx?$/, '');
  return base
    .split('-')
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function deriveSlug(relPath, frontmatterSlug) {
  if (frontmatterSlug) return frontmatterSlug;
  let url = relPath.replace(/\\/g, '/').replace(/\.mdx?$/, '');
  url = url.replace(/\/index$/, '');
  return `/docs/${url}`;
}

function buildRow(fullPath) {
  const raw = fs.readFileSync(fullPath, 'utf8');
  const { data: fm } = matter(raw);

  const relFromDocs = path.relative(DOCS_ROOT, fullPath).split(path.sep).join('/');
  const segments = relFromDocs.split('/');
  const filename = segments[segments.length - 1];
  const dirSegments = segments.slice(0, -1);

  const module = dirSegments[0] || '(root)';
  const subSegments = dirSegments.slice(1);
  const subModule = subSegments.join(' > ');

  const title = (fm.title && String(fm.title).trim()) || humanizeFilename(filename);
  const description = fm.description ? String(fm.description) : '';
  const slug = deriveSlug(relFromDocs, fm.slug ? String(fm.slug) : '');
  const repoPath = `docs/${relFromDocs}`;

  return { title, module, subModule, repoPath, slug, description };
}

function csvEscape(value) {
  const s = value == null ? '' : String(value);
  return `"${s.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
}

function toCsv(rows) {
  const header = ['Title', 'Module', 'Sub-Module', 'File Path', 'Slug / URL', 'Description'];
  const lines = [header.map(csvEscape).join(',')];
  for (const r of rows) {
    lines.push(
      [r.title, r.module, r.subModule, r.repoPath, r.slug, r.description]
        .map(csvEscape)
        .join(',')
    );
  }
  return lines.join('\n') + '\n';
}

function printSummary(rows) {
  const counts = new Map();
  for (const r of rows) {
    counts.set(r.module, (counts.get(r.module) || 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const pad = Math.max(...sorted.map(([m]) => m.length));
  console.log(`\nTotal articles: ${rows.length}`);
  console.log(`Modules: ${sorted.length}\n`);
  console.log(`${'Module'.padEnd(pad)}  Count`);
  console.log(`${'-'.repeat(pad)}  -----`);
  for (const [mod, n] of sorted) {
    console.log(`${mod.padEnd(pad)}  ${String(n).padStart(5)}`);
  }
}

function main() {
  if (!fs.existsSync(DOCS_ROOT)) {
    console.error(`docs/ not found at ${DOCS_ROOT}`);
    process.exit(1);
  }

  const files = walkDocs(DOCS_ROOT);
  const rows = files.map(buildRow);

  rows.sort((a, b) => {
    if (a.module !== b.module) return a.module.localeCompare(b.module);
    if (a.subModule !== b.subModule) return a.subModule.localeCompare(b.subModule);
    return a.title.localeCompare(b.title);
  });

  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_FILE, toCsv(rows), 'utf8');

  printSummary(rows);
  console.log(`\nWrote ${rows.length} rows to ${path.relative(REPO_ROOT, OUTPUT_FILE)}`);
}

main();
