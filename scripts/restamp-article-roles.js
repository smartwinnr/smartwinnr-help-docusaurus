#!/usr/bin/env node
/**
 * Reconcile every article's `customProps.roles` with its folder's gate.
 *
 * The folder gate is the source of truth for audience: `_category_.json`
 * defines who a leaf is for, and the URL guard AND-combines an article's gate
 * with every ancestor category's. An article stamped NARROWER than its folder
 * is therefore invisible to readers the folder exists to serve.
 *
 * Two things produced that drift, neither of them a per-article decision:
 *   - scripts/migrate-helpscout.js stamped roles from a hand-curated
 *     CATEGORY_MAPPING written for the old Help Scout IA, before the current
 *     module leaf template (and orgadmin/lamadmin/superadmin) existed
 *   - the authoring wizard pre-filled roles from the folder but let the LLM
 *     write the frontmatter, with nothing verifying it copied them
 *
 * The wizard now reconciles on save via destinationRoles(); this script fixes
 * the articles written before that.
 *
 * Dry run by default - pass --apply to write.
 *
 *   npm run articles:restamp-roles            # report
 *   npm run articles:restamp-roles -- --apply # write
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { setFrontmatterRoles } = require('../lib/frontmatter');

const REPO_ROOT = path.join(__dirname, '..');
const DOCS_ROOT = path.join(REPO_ROOT, 'docs');
const APPLY = process.argv.includes('--apply');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.mdx?$/i.test(entry.name)) out.push(p);
  }
  return out;
}

/** The audience the article's location actually implies: the AND of every
 *  ancestor category gate, which is exactly how the URL guard combines them.
 *
 *  Walking ancestors (not just the immediate directory) matters because plenty
 *  of folders have no _category_.json of their own - e.g.
 *  docs/administration/system-management inherits from docs/administration.
 *  Looking only one level up silently skipped those articles. */
function folderRoles(fileAbs) {
  let dir = path.dirname(fileAbs);
  let allowed = null;
  while (dir.startsWith(DOCS_ROOT)) {
    const cat = path.join(dir, '_category_.json');
    if (fs.existsSync(cat)) {
      try {
        const roles = JSON.parse(fs.readFileSync(cat, 'utf8'))?.customProps?.roles;
        if (Array.isArray(roles) && roles.length) {
          allowed = allowed === null
            ? roles.slice()
            : allowed.filter((r) => roles.includes(r));
        }
      } catch { /* malformed gate - audit-gates reports it */ }
    }
    if (dir === DOCS_ROOT) break;
    dir = path.dirname(dir);
  }
  return allowed && allowed.length ? allowed : null;
}

function main() {
  const changes = [];
  let skippedNoGate = 0, alreadyOk = 0;

  for (const f of walk(DOCS_ROOT)) {
    const folder = folderRoles(f);
    if (!folder) { skippedNoGate++; continue; }

    const raw = fs.readFileSync(f, 'utf8');
    let fm;
    // `{}` bypasses gray-matter's content cache - see lib/doc-routes.js.
    try { fm = matter(raw, {}).data || {}; } catch {
      console.log(`  SKIP (unparseable frontmatter): ${path.relative(REPO_ROOT, f)}`);
      continue;
    }
    const current = fm.customProps && fm.customProps.roles;
    if (!Array.isArray(current) || !current.length) { skippedNoGate++; continue; }

    const missing = folder.filter((r) => !current.includes(r));
    const extra = current.filter((r) => !folder.includes(r));
    if (!missing.length && !extra.length) { alreadyOk++; continue; }

    const next = setFrontmatterRoles(raw, folder);
    if (next === raw) { alreadyOk++; continue; }
    changes.push({ file: f, current, folder, missing, extra, next });
  }

  console.log(`${APPLY ? 'Restamping' : 'Would restamp'} article roles to the folder gate\n`);
  console.log(`  already consistent:        ${alreadyOk}`);
  console.log(`  no article/folder gate:    ${skippedNoGate}`);
  console.log(`  to change:                 ${changes.length}\n`);

  const byPattern = {};
  for (const c of changes) {
    const key = `${c.missing.length ? '+' + c.missing.join(',') : ''}${c.extra.length ? ' -' + c.extra.join(',') : ''}`.trim();
    (byPattern[key] = byPattern[key] || []).push(c);
  }
  for (const [pattern, list] of Object.entries(byPattern).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${String(list.length).padStart(4)}  ${pattern}`);
    for (const c of list.slice(0, APPLY ? 0 : 3)) {
      console.log(`          ${path.relative(DOCS_ROOT, c.file)}`);
      console.log(`            ${JSON.stringify(c.current)} -> ${JSON.stringify(c.folder)}`);
    }
  }

  if (!APPLY) {
    console.log('\nDry run - no files written. Re-run with --apply to write.');
    return;
  }
  for (const c of changes) fs.writeFileSync(c.file, c.next, 'utf8');
  console.log(`\n✅ wrote ${changes.length} file(s).`);
  console.log('   Rebuild so build/doc-gates.json picks up the new gates.');
}

main();
