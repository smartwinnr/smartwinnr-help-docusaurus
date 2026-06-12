#!/usr/bin/env node
/**
 * For every docs/modules/<m>/<sub>/ directory that contains at least one
 * article, write a _category_.json with the canonical label + sidebar position.
 *
 * Idempotent — running twice does nothing new.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.resolve(__dirname, '..', 'docs', 'modules');

const ALL_ROLES = ['user', 'manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin'];
const MANAGER_PLUS_ROLES = ['manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin'];

const SUBSECTIONS = [
  {dir: 'overview',                 label: 'Overview',                 position: 1},
  {dir: 'quickstart',               label: 'Quickstart',               position: 2},
  // Audience leaves come first so learners hit them before authoring noise.
  {dir: 'for-learners',             label: 'For Learners',             position: 3, customProps: {roles: ALL_ROLES}},
  {dir: 'for-managers',             label: 'For Managers',             position: 4, customProps: {roles: MANAGER_PLUS_ROLES, privilege: 'managerView'}},
  {dir: 'create-and-manage',        label: 'Create & Manage',          position: 5},
  {dir: 'assign-and-schedule',      label: 'Assign & Schedule',        position: 6},
  {dir: 'features',                 label: 'Features',                 position: 7},
  {dir: 'reports-and-analytics',    label: 'Reports & Analytics',      position: 8},
  {dir: 'settings-and-permissions', label: 'Settings & Permissions',   position: 9},
  {dir: 'best-practices',           label: 'Best Practices',           position: 10},
  {dir: 'faqs-and-troubleshooting', label: 'FAQs & Troubleshooting',   position: 11},
];

const modules = fs
  .readdirSync(MODULES_DIR, {withFileTypes: true})
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

let written = 0;
let skipped = 0;

for (const mod of modules) {
  for (const s of SUBSECTIONS) {
    const subDir = path.join(MODULES_DIR, mod, s.dir);
    if (!fs.existsSync(subDir)) continue;
    const hasMd = fs.readdirSync(subDir).some((f) => f.endsWith('.md'));
    if (!hasMd) continue;
    const target = path.join(subDir, '_category_.json');
    if (fs.existsSync(target)) {
      skipped += 1;
      continue;
    }
    const obj = {
      label: s.label,
      position: s.position,
      collapsible: true,
      collapsed: true,
    };
    if (s.customProps) obj.customProps = s.customProps;
    fs.writeFileSync(target, JSON.stringify(obj, null, 2) + '\n');
    written += 1;
    console.log(`+ ${path.relative(path.dirname(MODULES_DIR), target)}`);
  }
}

console.log('');
console.log(`Wrote ${written} _category_.json file(s); skipped ${skipped} pre-existing.`);
