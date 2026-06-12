#!/usr/bin/env node
/**
 * Walk every sub-folder _category_.json under docs/modules/<m>/<sub>/ and add
 * `link: {type: 'generated-index'}` if missing. Without it, navigating to
 * `/modules/<m>/<sub>/` 404s - which is what the ModuleOverview "Get started"
 * cards do today (see plan §12.13).
 *
 * Idempotent. Run from repo root: `node scripts/add-generated-index-links.js`.
 */
const fs = require('node:fs');
const path = require('node:path');

const MODULES_DIR = path.join(__dirname, '..', 'docs', 'modules');
let touched = 0;
let skipped = 0;

for (const mod of fs.readdirSync(MODULES_DIR)) {
  const modPath = path.join(MODULES_DIR, mod);
  if (!fs.statSync(modPath).isDirectory()) continue;

  for (const sub of fs.readdirSync(modPath)) {
    const subPath = path.join(modPath, sub);
    if (!fs.statSync(subPath).isDirectory()) continue;

    const catFile = path.join(subPath, '_category_.json');
    if (!fs.existsSync(catFile)) continue;

    const json = JSON.parse(fs.readFileSync(catFile, 'utf8'));
    const wantedSlug = `/modules/${mod}/${sub}`;
    if (json.link && json.link.slug === wantedSlug) {
      skipped++;
      continue;
    }

    // Preserve key order: label, position, collapsible, collapsed, link, then the rest.
    const ordered = {};
    if ('label' in json) ordered.label = json.label;
    if ('position' in json) ordered.position = json.position;
    if ('collapsible' in json) ordered.collapsible = json.collapsible;
    if ('collapsed' in json) ordered.collapsed = json.collapsed;
    ordered.link = {
      type: 'generated-index',
      title: json.label || sub,
      // Without an explicit slug Docusaurus would emit /category/<sub>-<n>/.
      // We want the natural URL /modules/<m>/<sub>/ so ModuleOverview's cards
      // and direct typing both resolve.
      slug: `/modules/${mod}/${sub}`,
    };
    for (const k of Object.keys(json)) {
      if (!(k in ordered)) ordered[k] = json[k];
    }

    fs.writeFileSync(catFile, JSON.stringify(ordered, null, 2) + '\n', 'utf8');
    touched++;
    console.log(`+ link: docs/modules/${mod}/${sub}/_category_.json`);
  }
}

console.log(`\nDone. Added link to ${touched} sub-folder _category_.json files. Skipped ${skipped} (already had link).`);
