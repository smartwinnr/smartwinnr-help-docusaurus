'use strict';

/**
 * Deploy-time guard for static/module-overviews.json.
 *
 * The server's only writer of that file (POST /api/admin/authoring/modules)
 * loads the copy on its own disk, adds one module, and queues the WHOLE file.
 * If that disk copy is stale - an older journal copy materialized over the
 * image, or the publish branch was edited by hand since boot - shipping it
 * silently reverts the branch. That is how eaca9598 dropped `actionplanning`
 * while adding `content-center`, which then failed audit-gates on every
 * actionplanning sub-folder.
 *
 * The server never removes or edits an existing module entry, so the only
 * change it may legitimately ship is modules IT created. mergeModuleOverviews()
 * therefore starts from the publish branch's copy and layers on only those.
 * `onlyAdd` names them (the server's pendingModuleAdds): a local key that is
 * missing from the branch but NOT in onlyAdd was removed on the branch on
 * purpose, and is left out rather than resurrected.
 *
 * @param {string} localRaw   the queued (server-disk) file content
 * @param {string|null} branchRaw  the publish branch's content, null if absent
 * @param {{onlyAdd?: Iterable<string>}} [opts]  omit to accept every new key
 * @returns {{content: string, added: string[], restored: string[], kept: string[], ignored: string[]}}
 *   added    - new modules shipped from the local copy
 *   restored - branch modules the local copy had dropped (put back)
 *   kept     - modules whose local entry differed; the branch entry won
 *   ignored  - local-only modules not in onlyAdd (removed on the branch)
 * @throws if either side is not valid JSON - the caller aborts the deploy
 */
function mergeModuleOverviews(localRaw, branchRaw, opts = {}) {
  const local = parseOverviews(localRaw, 'queued');
  if (branchRaw == null) {
    return { content: localRaw, added: Object.keys(local.modules || {}), restored: [], kept: [], ignored: [] };
  }
  const branch = parseOverviews(branchRaw, 'publish-branch');
  const localMods = local.modules || {};
  const branchMods = branch.modules || {};

  const allow = opts.onlyAdd ? new Set(opts.onlyAdd) : null;
  const localOnly = Object.keys(localMods).filter((k) => !(k in branchMods));
  const added = allow ? localOnly.filter((k) => allow.has(k)) : localOnly;
  const ignored = allow ? localOnly.filter((k) => !allow.has(k)) : [];
  const restored = Object.keys(branchMods).filter((k) => !(k in localMods));
  const kept = Object.keys(branchMods).filter(
    (k) => k in localMods && JSON.stringify(localMods[k]) !== JSON.stringify(branchMods[k]),
  );

  const merged = { ...branch, modules: { ...branchMods } };
  for (const k of added) merged.modules[k] = localMods[k];
  return { content: JSON.stringify(merged, null, 2) + '\n', added, restored, kept, ignored };
}

function parseOverviews(raw, which) {
  let doc;
  try {
    doc = JSON.parse(raw);
  } catch {
    throw new Error(`static/module-overviews.json (${which} copy) is not valid JSON`);
  }
  if (!doc || typeof doc !== 'object' || (doc.modules != null && typeof doc.modules !== 'object')) {
    throw new Error(`static/module-overviews.json (${which} copy) has no "modules" object`);
  }
  return doc;
}

module.exports = { mergeModuleOverviews };
