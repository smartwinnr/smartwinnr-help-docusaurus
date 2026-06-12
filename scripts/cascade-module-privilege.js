#!/usr/bin/env node
/**
 * Cascade each module's privilege/anyPrivilege from
 *   docs/modules/<m>/_category_.json
 * onto every sub-folder's
 *   docs/modules/<m>/<sub>/_category_.json
 *
 * Why: the server-side URL guard uses longest-prefix match. Without this
 * cascade, an article like /modules/video-coaching/for-learners/<slug>
 * matches the `for-learners` sub-folder gate (no privilege) before it can
 * see the parent module's privilege gate - and so a user with the wrong
 * privilege passes through.
 *
 * Idempotent - running twice leaves the tree unchanged. Removes
 * privilege/anyPrivilege if the parent has none (to keep cross-module
 * clean).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.resolve(__dirname, '..', 'docs', 'modules');
const OVERVIEWS_PATH = path.resolve(__dirname, '..', 'static', 'module-overviews.json');

let updated = 0;
let unchanged = 0;
let missingParent = 0;

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n');
}

// Source of truth for each module's privilege identity.
const overviews = readJson(OVERVIEWS_PATH).modules || {};

for (const mod of fs.readdirSync(MODULES_DIR, {withFileTypes: true})) {
  if (!mod.isDirectory()) continue;
  const moduleRootCat = path.join(MODULES_DIR, mod.name, '_category_.json');
  if (!fs.existsSync(moduleRootCat)) {
    missingParent += 1;
    continue;
  }
  const meta = overviews[mod.name] || {};
  const parentPrivilege = meta.privilege || null;
  const parentAnyPrivilege = Array.isArray(meta.anyPrivilege) ? meta.anyPrivilege : null;

  for (const sub of fs.readdirSync(path.join(MODULES_DIR, mod.name), {withFileTypes: true})) {
    if (!sub.isDirectory()) continue;
    const subCat = path.join(MODULES_DIR, mod.name, sub.name, '_category_.json');
    if (!fs.existsSync(subCat)) continue;
    const cat = readJson(subCat);
    const cp = cat.customProps || {};
    const before = JSON.stringify(cp);

    // Strip any stale values first so we can re-derive cleanly.
    delete cp.privilege;
    delete cp.anyPrivilege;

    if (sub.name === 'for-managers') {
      // for-managers needs BOTH managerView AND the parent module's
      // privilege. Express the AND with `allPrivileges` (for single-priv
      // modules) or carry the parent's `anyPrivilege` forward as an AND'd
      // OR-group.
      cp.privilege = 'managerView';
      if (parentPrivilege) {
        cp.allPrivileges = [parentPrivilege];
      }
      if (parentAnyPrivilege && parentAnyPrivilege.length > 0) {
        cp.anyPrivilege = parentAnyPrivilege;
      }
    } else {
      if (parentPrivilege) cp.privilege = parentPrivilege;
      if (parentAnyPrivilege && parentAnyPrivilege.length > 0) {
        cp.anyPrivilege = parentAnyPrivilege;
      }
    }

    cat.customProps = cp;
    const after = JSON.stringify(cat.customProps);

    if (before === after) {
      unchanged += 1;
    } else {
      writeJson(subCat, cat);
      const rel = path.relative(path.dirname(MODULES_DIR), subCat);
      console.log('+ ' + rel + '  →  ' + JSON.stringify(cp));
      updated += 1;
    }
  }
}

console.log('');
console.log(`cascade-module-privilege: ${updated} updated, ${unchanged} unchanged, ${missingParent} modules missing root _category_.json`);
