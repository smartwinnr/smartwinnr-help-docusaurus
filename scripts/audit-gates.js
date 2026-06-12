#!/usr/bin/env node
/**
 * Verify that every docs/modules/<m>/<sub>/_category_.json carries the
 * canonical role gate from plans/help-menu-redesign.md §5, and that every
 * module under docs/modules/ has an index.md (the universal landing).
 *
 * Run from the repo root:
 *   node scripts/audit-gates.js
 *
 * Exits 0 with a green summary if everything matches; exits 1 with a list
 * of mismatches otherwise. Designed to be wired into `prebuild` alongside
 * `validate-privilege-keys.js`.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MODULES_DIR = path.join(ROOT, 'docs', 'modules');

const ALL_ROLES = ['user', 'manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin'];
const MANAGER_PLUS_ROLES = ['manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin'];
const EDITOR_PLUS_ROLES = ['editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin'];

/** Canonical gate per sub-folder name. Module root is handled separately. */
const SUBFOLDER_GATES = {
  // Audience leaves
  'for-learners':             {roles: ALL_ROLES},
  'for-managers':             {roles: MANAGER_PLUS_ROLES, privilege: 'managerView'},
  // ALL_ROLES (universal info)
  'overview':                 {roles: ALL_ROLES},
  'quickstart':               {roles: ALL_ROLES},
  'faqs-and-troubleshooting': {roles: ALL_ROLES},
  // EDITOR_PLUS_ROLES (authoring + admin reporting)
  'create-and-manage':        {roles: EDITOR_PLUS_ROLES},
  'assign-and-schedule':      {roles: EDITOR_PLUS_ROLES},
  'features':                 {roles: EDITOR_PLUS_ROLES},
  'reports-and-analytics':    {roles: EDITOR_PLUS_ROLES},
  'settings-and-permissions': {roles: EDITOR_PLUS_ROLES},
  'best-practices':           {roles: EDITOR_PLUS_ROLES},
};

const failures = [];
const warnings = [];

function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

function gatesEqual(actual, expected) {
  if (!actual) return false;
  if (!arraysEqual(actual.roles, expected.roles)) return false;
  // Privilege: both must agree, treating undefined === null
  const aPriv = actual.privilege || null;
  const ePriv = expected.privilege || null;
  if (aPriv !== ePriv) return false;
  // anyPrivilege: must agree if expected has it OR actual has it
  const aAny = Array.isArray(actual.anyPrivilege) ? actual.anyPrivilege : null;
  const eAny = Array.isArray(expected.anyPrivilege) ? expected.anyPrivilege : null;
  if (aAny && eAny) {
    if (!arraysEqual(aAny, eAny)) return false;
  } else if (aAny !== eAny) {
    return false;
  }
  // allPrivileges: same rule — agree if either side has it
  const aAll = Array.isArray(actual.allPrivileges) ? actual.allPrivileges : null;
  const eAll = Array.isArray(expected.allPrivileges) ? expected.allPrivileges : null;
  if (aAll && eAll) {
    if (!arraysEqual(aAll, eAll)) return false;
  } else if (aAll !== eAll) {
    return false;
  }
  return true;
}

/**
 * Compose the EXPECTED gate for a sub-folder by combining the base canonical
 * gate (from SUBFOLDER_GATES) with the module's privilege/anyPrivilege.
 *
 * Special-case: `for-managers` requires BOTH `managerView` AND the parent
 * module's privilege. Express the AND with `allPrivileges` for single-priv
 * modules, or carry the parent's `anyPrivilege` forward as an AND'd
 * OR-group for modules that use anyPrivilege.
 */
function expectedGateFor(subName, parentPrivilege, parentAnyPrivilege) {
  const base = SUBFOLDER_GATES[subName];
  if (!base) return null;
  if (subName === 'for-managers') {
    const out = {roles: base.roles, privilege: 'managerView'};
    if (parentPrivilege) out.allPrivileges = [parentPrivilege];
    if (parentAnyPrivilege && parentAnyPrivilege.length > 0) {
      out.anyPrivilege = parentAnyPrivilege;
    }
    return out;
  }
  const out = {roles: base.roles};
  if (parentPrivilege) out.privilege = parentPrivilege;
  if (parentAnyPrivilege && parentAnyPrivilege.length > 0) {
    out.anyPrivilege = parentAnyPrivilege;
  }
  return out;
}

function describeGate(g) {
  if (!g) return '(none)';
  const bits = [];
  if (g.roles) bits.push('roles=[' + g.roles.join(',') + ']');
  if (g.privilege) bits.push('privilege=' + g.privilege);
  if (g.anyPrivilege) bits.push('anyPrivilege=[' + g.anyPrivilege.join(',') + ']');
  return '{' + bits.join(', ') + '}';
}

function checkModuleRoot(moduleDir, moduleName) {
  const catFile = path.join(moduleDir, '_category_.json');
  if (!fs.existsSync(catFile)) {
    failures.push(`docs/modules/${moduleName}/_category_.json: file missing`);
    return;
  }
  const cat = JSON.parse(fs.readFileSync(catFile, 'utf8'));
  const cp = cat.customProps || {};
  if (!arraysEqual(cp.roles, ALL_ROLES)) {
    failures.push(
      `docs/modules/${moduleName}/_category_.json: roles should be ALL_ROLES ` +
        `(so every user can land on the module index and see the upsell). Got ${describeGate(cp)}.`,
    );
  }
  if (cp.privilege || (cp.anyPrivilege && cp.anyPrivilege.length > 0)) {
    failures.push(
      `docs/modules/${moduleName}/_category_.json: must NOT carry privilege/anyPrivilege ` +
        `(it would block users from the upsell page). Privilege identity belongs in ` +
        `static/module-overviews.json. Got ${describeGate(cp)}.`,
    );
  }
  // Module index landing
  const indexFile = path.join(moduleDir, 'index.md');
  const indexMdx = path.join(moduleDir, 'index.mdx');
  if (!fs.existsSync(indexFile) && !fs.existsSync(indexMdx)) {
    failures.push(`docs/modules/${moduleName}/index.md(x): missing — needed for the per-module overview + upsell`);
  }
}

function checkSubfolder(moduleDir, moduleName, subName, parentPrivilege, parentAnyPrivilege) {
  const catFile = path.join(moduleDir, subName, '_category_.json');
  if (!fs.existsSync(catFile)) {
    // No _category_.json — sub-folder exists but has no gate. That's a gap.
    failures.push(`docs/modules/${moduleName}/${subName}/_category_.json: missing — sub-folder is ungated`);
    return;
  }
  const cat = JSON.parse(fs.readFileSync(catFile, 'utf8'));
  const cp = cat.customProps;
  const expected = expectedGateFor(subName, parentPrivilege, parentAnyPrivilege);
  if (!expected) {
    warnings.push(`docs/modules/${moduleName}/${subName}/: unknown sub-folder name (not in canonical table)`);
    return;
  }
  if (!gatesEqual(cp, expected)) {
    failures.push(
      `docs/modules/${moduleName}/${subName}/_category_.json: gate mismatch.\n` +
        `      expected ${describeGate(expected)}\n` +
        `      actual   ${describeGate(cp)}`,
    );
  }
}

function audit() {
  if (!fs.existsSync(MODULES_DIR)) {
    console.error('docs/modules/ not found — wrong working directory?');
    process.exit(2);
  }

  const modules = fs
    .readdirSync(MODULES_DIR, {withFileTypes: true})
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  // Each module's privilege identity lives in static/module-overviews.json
  // (the canonical registry). The module's _category_.json must NOT carry
  // privilege — it stays open so the module index page is universally
  // reachable for the upsell flow.
  const overviewsPath = path.resolve(__dirname, '..', 'static', 'module-overviews.json');
  const overviews = fs.existsSync(overviewsPath)
    ? JSON.parse(fs.readFileSync(overviewsPath, 'utf8')).modules || {}
    : {};

  for (const mod of modules) {
    const moduleDir = path.join(MODULES_DIR, mod);
    checkModuleRoot(moduleDir, mod);
    const meta = overviews[mod] || {};
    const parentPrivilege = meta.privilege || null;
    const parentAnyPrivilege = Array.isArray(meta.anyPrivilege) ? meta.anyPrivilege : null;
    const subs = fs
      .readdirSync(moduleDir, {withFileTypes: true})
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
    for (const sub of subs) {
      checkSubfolder(moduleDir, mod, sub, parentPrivilege, parentAnyPrivilege);
    }
  }

  console.log(`audit-gates: checked ${modules.length} modules`);
  if (warnings.length) {
    console.log('');
    console.log(`warnings: ${warnings.length}`);
    for (const w of warnings) console.log('  ⚠  ' + w);
  }
  if (failures.length === 0) {
    console.log('');
    console.log('✓ all module gates match the canonical table');
    process.exit(0);
  }
  console.log('');
  console.log(`✗ ${failures.length} gate failure(s):`);
  console.log('');
  for (const f of failures) console.log('  • ' + f);
  console.log('');
  console.log('See plans/help-menu-redesign.md §12.13 for the canonical gate table.');
  process.exit(1);
}

audit();
