/**
 * Docusaurus plugin: emits build/doc-gates.json - a longest-prefix lookup table
 * mapping doc URL prefixes to their AccessGate (roles + privileges).
 *
 * Consumed by server.js URL-guard middleware (shared/access-policy.cjs) so that
 * a hand-typed URL like /administration/users does not bypass the swizzled
 * sidebar gates.
 *
 * Strategy:
 *   1. Read all _category_.json files under docs/ and collect their customProps.
 *      The relative dir from docs/ becomes the URL prefix (URLs use the docs
 *      routeBasePath, currently '/' - adjust here if it changes).
 *   2. Read article frontmatter (`customProps:` block) and emit a per-doc entry
 *      keyed by the resolved slug.
 *   3. Write build/doc-gates.json shaped as:
 *      {
 *        "version": 1,
 *        "prefixes": [ { "prefix": "/modules/quiz",  "gate": {...} }, ... ],
 *        "exact":    { "/modules/quiz/some-article": {...}, ... }
 *      }
 *
 *  The middleware does an exact-match lookup first, then walks the prefix list
 *  longest-first.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = 'docs';
const OUT_FILE = 'doc-gates.json';

/** Read an article's routing identity + access gate from its frontmatter.
 *
 *  Uses a real YAML parser, not regexes. The previous version matched roles
 *  only in inline form (`roles: [a, b]`), but most of the corpus writes the
 *  equivalent block sequence:
 *
 *      customProps:
 *        roles:
 *          - editor
 *
 *  Those articles silently produced NO gate, so the server-side URL guard
 *  fell back to ancestor categories alone and served articles to roles they
 *  explicitly excluded - while the sidebar (which reads the same frontmatter
 *  through Docusaurus' own YAML parsing) correctly hid them. That gap is
 *  precisely what the URL guard exists to close.
 *
 *  The `{}` options arg bypasses gray-matter's content-keyed cache, which
 *  returns `{data:{}}` when re-parsing a string whose first parse threw.
 */
function readFmCustomProps(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  if (!text.startsWith('---')) return null;

  let data;
  try {
    data = matter(text, {}).data || {};
  } catch {
    // Broken YAML: emit no gate rather than a wrong one. `npm run audit:links`
    // fails the build on this, so it can't ship unnoticed.
    return null;
  }

  const out = {};
  if (data.slug != null && String(data.slug).trim()) out.slug = String(data.slug).trim();
  if (data.id != null && String(data.id).trim()) out.id = String(data.id).trim();

  const cp = data.customProps;
  if (cp && typeof cp === 'object') {
    const gate = {};
    const list = (v) => (Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : null);
    const roles = list(cp.roles);
    if (roles && roles.length) gate.roles = roles;
    if (cp.privilege != null && String(cp.privilege).trim()) gate.privilege = String(cp.privilege).trim();
    const any = list(cp.anyPrivilege);
    if (any && any.length) gate.anyPrivilege = any;
    const all = list(cp.allPrivileges);
    if (all && all.length) gate.allPrivileges = all;
    if (Object.keys(gate).length > 0) out.gate = gate;
  }

  return out;
}

function readCategoryJson(filePath) {
  try {
    const obj = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return (obj && obj.customProps) || null;
  } catch {
    return null;
  }
}

function walk(dir, baseDir, out) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, baseDir, out);
    } else if (entry.name === '_category_.json') {
      const gate = readCategoryJson(full);
      if (gate) {
        const rel = path.relative(baseDir, dir).split(path.sep).join('/');
        out.prefixes.push({prefix: '/' + rel, gate});
      }
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      const fm = readFmCustomProps(full);
      if (fm && fm.gate) {
        const rel = path.relative(baseDir, dir).split(path.sep).join('/');
        const base = entry.name.replace(/\.(md|mdx)$/, '');
        const rawSlug = fm.slug || fm.id || base;
        // Absolute slug (starts with "/") wins outright; relative slugs are
        // joined to their containing dir.
        let url;
        if (rawSlug.startsWith('/')) {
          url = rawSlug;
        } else {
          url = '/' + (rel ? rel + '/' : '') + rawSlug;
        }
        url = url.replace(/\/+/g, '/');
        // Drop trailing slash for everything except the root.
        if (url.length > 1) url = url.replace(/\/$/, '');
        out.exact[url] = fm.gate;
      }
    }
  }
}

module.exports = function accessGateEmitPlugin(_context, _options) {
  return {
    name: 'access-gate-emit',

    async postBuild({siteDir, outDir}) {
      const docsRoot = path.join(siteDir, DOCS_DIR);
      const out = {version: 1, prefixes: [], exact: {}};

      if (fs.existsSync(docsRoot)) {
        walk(docsRoot, docsRoot, out);
      }

      // Sort prefixes longest-first so the middleware can stop at the first match.
      out.prefixes.sort((a, b) => b.prefix.length - a.prefix.length);

      const outPath = path.join(outDir, OUT_FILE);
      fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
      console.log(
        `access-gate-emit: wrote ${outPath} ` +
          `(${out.prefixes.length} prefix gates, ${Object.keys(out.exact).length} article gates)`,
      );

      // Also emit landing-modules.json - drives the "Recommended modules" tile
      // grid on src/pages/index.tsx. One row per docs/modules/<m>/ with that
      // module's privilege and which audience sub-folders are present. The
      // landing component filters this by the viewer's role + privileges.
      const modulesRoot = path.join(docsRoot, 'modules');
      // Per-module taglines drive the tile sub-header on the landing page.
      let overviewMeta = {};
      try {
        const ov = JSON.parse(
          fs.readFileSync(path.join(siteDir, 'static', 'module-overviews.json'), 'utf8'),
        );
        overviewMeta = ov.modules || {};
      } catch {/* no overviews: tiles fall back to no sub-header */}
      const modulesOut = {version: 1, modules: []};
      if (fs.existsSync(modulesRoot)) {
        const moduleNames = fs
          .readdirSync(modulesRoot, {withFileTypes: true})
          .filter((e) => e.isDirectory())
          .map((e) => e.name);
        for (const mod of moduleNames) {
          const catPath = path.join(modulesRoot, mod, '_category_.json');
          let label = mod;
          let privilege = null;
          let anyPrivilege = null;
          if (fs.existsSync(catPath)) {
            try {
              const cat = JSON.parse(fs.readFileSync(catPath, 'utf8'));
              if (cat.label) label = cat.label;
              if (cat.customProps) {
                privilege = cat.customProps.privilege || null;
                anyPrivilege = cat.customProps.anyPrivilege || null;
              }
            } catch {/* ignore */}
          }
          const subs = fs
            .readdirSync(path.join(modulesRoot, mod), {withFileTypes: true})
            .filter((e) => e.isDirectory())
            .map((e) => e.name);
          modulesOut.modules.push({
            slug: mod,
            label,
            tagline: (overviewMeta[mod] && overviewMeta[mod].tagline) || '',
            privilege,
            anyPrivilege,
            hasLearner: subs.includes('for-learners'),
            hasManager: subs.includes('for-managers'),
            hasEditor: subs.some((s) =>
              ['create-and-manage', 'assign-and-schedule', 'features',
                'reports-and-analytics', 'settings-and-permissions',
                'best-practices'].includes(s),
            ),
            hasFaqs: subs.includes('faqs-and-troubleshooting'),
            url: '/modules/' + mod + '/',
          });
        }
      }
      const landingOut = path.join(outDir, 'landing-modules.json');
      fs.writeFileSync(landingOut, JSON.stringify(modulesOut, null, 2));
      console.log(
        `access-gate-emit: wrote ${landingOut} ` +
          `(${modulesOut.modules.length} modules)`,
      );

      // Also emit article-graph.json - consumed by RelatedStrip on every
      // article. One entry per article with {label, blurb, folder, position,
      // tags} so the strip can pick 3 nearest siblings without re-parsing
      // markdown at runtime.
      //
      // gray-matter (imported at the top) does the YAML parsing - many
      // articles use folded block syntax for `description: >-` and a
      // hand-rolled regex captures the literal ">-" instead of the value.
      const articles = [];
      function visitArticles(dir) {
        for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
          if (entry.name.startsWith('.')) continue;
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            visitArticles(full);
          } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
            let fmData;
            try {
              // Options arg bypasses gray-matter's content-keyed cache (a
              // re-parse of a string that threw returns `{data:{}}`), so a
              // file with broken YAML behaves the same on every call.
              fmData = matter(fs.readFileSync(full, 'utf8'), {}).data;
            } catch {
              continue;
            }
            if (!fmData || Object.keys(fmData).length === 0) continue;

            const title = fmData.title ? String(fmData.title).trim() : '';
            const description = fmData.description
              ? String(fmData.description).replace(/\s+/g, ' ').trim()
              : '';
            const slug = fmData.slug ? String(fmData.slug).trim() : '';
            const idVal = fmData.id ? String(fmData.id).trim() : '';
            const position = Number.isFinite(fmData.sidebar_position)
              ? fmData.sidebar_position
              : 9999;
            const tags = Array.isArray(fmData.tags)
              ? fmData.tags.map((t) => String(t).trim()).filter(Boolean)
              : [];

            // Resolve the URL - same logic as the gates emit above.
            const rel = path.relative(docsRoot, path.dirname(full)).split(path.sep).join('/');
            const base = entry.name.replace(/\.(md|mdx)$/, '');
            const rawSlug = slug || idVal || base;
            let url;
            if (rawSlug.startsWith('/')) {
              url = rawSlug;
            } else {
              url = '/' + (rel ? rel + '/' : '') + rawSlug;
            }
            url = url.replace(/\/+/g, '/');
            if (url.length > 1) url = url.replace(/\/$/, '');

            articles.push({
              url,
              title,
              description,
              folder: '/' + rel,
              position,
              tags,
            });
          }
        }
      }
      if (fs.existsSync(docsRoot)) visitArticles(docsRoot);
      const articleGraphOut = path.join(outDir, 'article-graph.json');
      fs.writeFileSync(articleGraphOut, JSON.stringify({version: 1, articles}, null, 2));
      console.log(
        `access-gate-emit: wrote ${articleGraphOut} ` +
          `(${articles.length} articles)`,
      );
    },
  };
};
