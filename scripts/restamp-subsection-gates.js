#!/usr/bin/env node
/**
 * Stamp the canonical role gate on every docs/modules/<m>/<sub>/_category_.json.
 *
 * Per plans/help-menu-redesign.md §5 (the 2026-06-08 decision log):
 *   for-learners            → ALL_ROLES
 *   for-managers            → MANAGER_PLUS_ROLES + privilege: managerView
 *   faqs-and-troubleshooting → ALL_ROLES   (cross-audience Q&A)
 *   everything else         → EDITOR_PLUS_ROLES   (authoring)
 *
 * Idempotent - overwrites customProps to match the table above.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.resolve(__dirname, '..', 'docs', 'modules');

const ALL_ROLES = ['user', 'manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin'];
const MANAGER_PLUS_ROLES = ['manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin'];
const EDITOR_PLUS_ROLES = ['editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin'];

const GATE_BY_SUBSECTION = {
  'for-learners':             {roles: ALL_ROLES},
  'for-managers':             {roles: MANAGER_PLUS_ROLES, privilege: 'managerView'},
  'faqs-and-troubleshooting': {roles: ALL_ROLES},
  'overview':                 {roles: ALL_ROLES},
  'quickstart':               {roles: ALL_ROLES},
  'create-and-manage':        {roles: EDITOR_PLUS_ROLES},
  'assign-and-schedule':      {roles: EDITOR_PLUS_ROLES},
  'features':                 {roles: EDITOR_PLUS_ROLES},
  'reports-and-analytics':    {roles: EDITOR_PLUS_ROLES},
  'settings-and-permissions': {roles: EDITOR_PLUS_ROLES},
  'best-practices':           {roles: EDITOR_PLUS_ROLES},
};

let touched = 0;
let unchanged = 0;
let unknown = [];

for (const mod of fs.readdirSync(MODULES_DIR, {withFileTypes: true})) {
  if (!mod.isDirectory()) continue;
  const moduleDir = path.join(MODULES_DIR, mod.name);

  for (const sub of fs.readdirSync(moduleDir, {withFileTypes: true})) {
    if (!sub.isDirectory()) continue;
    const gate = GATE_BY_SUBSECTION[sub.name];
    if (!gate) {
      unknown.push(`${mod.name}/${sub.name}`);
      continue;
    }

    const catPath = path.join(moduleDir, sub.name, '_category_.json');
    if (!fs.existsSync(catPath)) continue;
    const obj = JSON.parse(fs.readFileSync(catPath, 'utf8'));
    const before = JSON.stringify(obj.customProps || null);
    obj.customProps = gate;
    const after = JSON.stringify(obj.customProps);

    if (before === after) {
      unchanged += 1;
      continue;
    }
    fs.writeFileSync(catPath, JSON.stringify(obj, null, 2) + '\n');
    console.log(`+ stamped ${path.relative(path.dirname(MODULES_DIR), catPath)}`);
    touched += 1;
  }
}

console.log('');
console.log(`Stamped ${touched} file(s); ${unchanged} already correct.`);
if (unknown.length) {
  console.log('');
  console.log('Skipped (unknown sub-section name - extend GATE_BY_SUBSECTION):');
  for (const u of unknown) console.log('  ' + u);
}
