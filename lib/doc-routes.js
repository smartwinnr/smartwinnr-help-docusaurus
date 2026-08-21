/**
 * Single source of truth for "what URL does this docs/ file actually serve at".
 *
 * Docusaurus routes an article by its frontmatter `slug` (falling back to the
 * filename stem), NOT by its path on disk. Anything that derives a URL from the
 * file path alone gets it wrong for the ~23% of articles whose slug differs from
 * their filename - which is exactly how the chatbot ended up citing
 * /modules/video-coaching/features/what-is-embedded-screen-sharing-in-coachings
 * for an article that lives at .../embedded-screen-sharing-coachings.
 *
 * Consumers: server.js (deploy pre-flight + citation/search URL validation) and
 * scripts/internal-indexer.js (the URL stored in ChromaDB metadata).
 *
 * docusaurus.config.ts (buildDocUrlMap) and plugins/access-gate-emit.js still
 * carry their own copies of this walk; they run at build time under different
 * module systems. Keep them in sync with resolveDocRoute below.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

/** Canonical route form. Keep in sync with normPath in docusaurus.config.ts. */
function normRoute(p) {
  let n = String(p).replace(/\/index$/, '');
  if (n.length > 1) n = n.replace(/\/$/, '');
  return n || '/';
}

/**
 * Resolve one markdown file to the route Docusaurus serves it at.
 *
 * Real YAML parse (not a regex): frontmatter routinely uses block scalars
 * (slug: >-) that line-based regexes misread. Malformed YAML falls back to
 * filename-derived identity.
 *
 * @param {string} absPath  absolute path to the .md/.mdx file
 * @param {string} docsRoot absolute path to docs/
 * @param {string} content  file contents (read by the caller - both callers
 *                          already have it, so we don't re-read here)
 * @returns {{route: string, slug: string, id: string, isDraft: boolean, dirRel: string, relDocs: string}}
 */
function resolveDocRoute(absPath, docsRoot, content) {
  let fm = {};
  // The `{}` is load-bearing: gray-matter caches by content string, and a
  // SECOND parse of a string whose first parse threw returns `{data: {}}`
  // instead of throwing again. Passing options bypasses that cache, so a file
  // with broken YAML fails the same way on every call rather than sometimes
  // looking like an article with no frontmatter at all.
  try { fm = matter(content, {}).data || {}; } catch { /* fall back below */ }
  const relDocs = path.relative(docsRoot, absPath).replace(/\\/g, '/');
  const dirRel = relDocs.replace(/\/?[^/]+\.(md|mdx)$/i, '');
  const base = path.basename(absPath).replace(/\.(md|mdx)$/i, '');
  const slug = typeof fm.slug === 'string' && fm.slug.trim() ? fm.slug.trim() : base;
  const url = slug.startsWith('/') ? slug : '/' + (dirRel ? dirRel + '/' : '') + slug;
  return {
    route: normRoute(url.replace(/\/+/g, '/')),
    slug,
    id: fm.id != null && String(fm.id).trim() ? String(fm.id).trim() : base,
    isDraft: fm.draft === true,
    dirRel,
    relDocs,
  };
}

/** Walk docs/ deriving every article's route the way Docusaurus does.
 *  Returns [{rel, route, dirRel, id, isDraft}], rel repo-relative. */
function buildLocalDocEntries(repoRoot) {
  const docsRoot = path.join(repoRoot, 'docs');
  const entries = [];
  if (!fs.existsSync(docsRoot)) return entries;
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(p); continue; }
      if (!/\.(md|mdx)$/i.test(entry.name)) continue;
      let content;
      try { content = fs.readFileSync(p, 'utf8'); } catch { continue; }
      const resolved = resolveDocRoute(p, docsRoot, content);
      entries.push({
        rel: path.relative(repoRoot, p).replace(/\\/g, '/'),
        route: resolved.route,
        dirRel: resolved.dirRel,
        id: resolved.id,
        isDraft: resolved.isDraft,
      });
    }
  })(docsRoot);
  return entries;
}

/**
 * Top-level section landings declared in src/nav-sections.ts.
 *
 * sidebars.ts turns each NAV_SECTIONS entry into a sidebar category whose
 * `link` is a generated-index at that entry's `slug` (or a doc, when
 * `linkDocId` is set). Those routes - /get-started, /reports-and-analytics,
 * ... - exist in the built site but appear in NEITHER a docs/ walk nor a
 * _category_.json `link`, so anything deriving routes from disk alone must
 * add them explicitly or it will call a redirect to a section landing
 * dangling.
 *
 * Read by regex rather than imported: this module is CommonJS and loaded by
 * server.js at runtime, while nav-sections.ts is TypeScript compiled only by
 * the Docusaurus build. The slugs are plain string literals, so a regex is
 * sufficient and keeps the two module systems apart.
 */
function buildNavSectionRoutes(repoRoot) {
  const routes = new Set();
  const file = path.join(repoRoot, 'src', 'nav-sections.ts');
  let src;
  try { src = fs.readFileSync(file, 'utf8'); } catch { return routes; }
  // Skip the `slug: string;` in the NavSection type - only quoted literals.
  for (const m of src.matchAll(/^\s*slug:\s*['"`](\/[^'"`]*)['"`]/gm)) {
    routes.add(normRoute(m[1]));
  }
  return routes;
}

/** Non-doc routes a redirect may legitimately target: custom pages under
 *  src/pages, category landings declared via _category_.json `link`, the
 *  top-level section landings from nav-sections.ts, and the site root.
 *  Generated listings (tags, search) are deliberately absent - no redirect
 *  should target those. */
function buildNonDocRouteSet(repoRoot) {
  const docsRoot = path.join(repoRoot, 'docs');
  const routes = new Set(['/']);
  for (const r of buildNavSectionRoutes(repoRoot)) routes.add(r);
  const pagesRoot = path.join(repoRoot, 'src', 'pages');
  if (fs.existsSync(pagesRoot)) {
    (function walk(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) { walk(p); continue; }
        if (entry.name.startsWith('_')) continue;
        if (!/\.(jsx?|tsx?|md|mdx)$/i.test(entry.name)) continue;
        const rel = path.relative(pagesRoot, p).replace(/\\/g, '/').replace(/\.(jsx?|tsx?|md|mdx)$/i, '');
        routes.add(normRoute('/' + rel));
      }
    })(pagesRoot);
  }
  if (fs.existsSync(docsRoot)) {
    (function walk(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) { walk(p); continue; }
        if (entry.name !== '_category_.json') continue;
        try {
          const doc = JSON.parse(fs.readFileSync(p, 'utf8'));
          if (!doc || !doc.link) continue;
          const dirRel = path.relative(docsRoot, dir).replace(/\\/g, '/');
          routes.add(normRoute('/' + dirRel));
          if (typeof doc.link.slug === 'string') {
            const s = doc.link.slug;
            routes.add(normRoute(s.startsWith('/') ? s : '/' + dirRel + '/' + s));
          }
        } catch { /* malformed gate file - caught elsewhere */ }
      }
    })(docsRoot);
  }
  return routes;
}

/** data/redirects.json as a normalized Map<from, to>. */
function loadRedirectMap(repoRoot) {
  const map = new Map();
  const file = path.join(repoRoot, 'data', 'redirects.json');
  if (!fs.existsSync(file)) return map;
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const r of parsed.redirects || []) {
      if (!r || typeof r.from !== 'string' || typeof r.to !== 'string') continue;
      const from = normRoute(r.from);
      const to = normRoute(r.to);
      if (from === to) continue;
      if (!map.has(from)) map.set(from, to);
    }
  } catch { /* a broken redirects file must not take down search */ }
  return map;
}

/**
 * Routes from build/sitemap.xml - the built site's own account of what it
 * serves. It covers what a docs/ walk cannot infer: autogenerated category
 * index pages (/administration, /get-started, ...) and tag listings. Absent in
 * dev with no build, in which case the walk alone stands in.
 */
function loadSitemapRoutes(repoRoot) {
  const routes = new Set();
  const file = path.join(repoRoot, 'build', 'sitemap.xml');
  if (!fs.existsSync(file)) return routes;
  try {
    const xml = fs.readFileSync(file, 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      try {
        routes.add(normRoute(new URL(m[1]).pathname));
      } catch { /* skip malformed loc */ }
    }
  } catch { /* an unreadable sitemap must not take down search */ }
  return routes;
}

const MAX_REDIRECT_HOPS = 5;

/**
 * Build the lookup used to validate an outbound link (chatbot citation,
 * vector-search hit). `routes` holds every live article route plus the
 * non-doc routes a link may legitimately point at; drafts are excluded
 * because they aren't routed in a production build.
 */
function buildRouteIndex(repoRoot) {
  const entries = buildLocalDocEntries(repoRoot);
  const routes = buildNonDocRouteSet(repoRoot);
  const sitemapRoutes = loadSitemapRoutes(repoRoot);
  for (const r of sitemapRoutes) routes.add(r);
  let draftCount = 0;
  for (const e of entries) {
    if (e.isDraft) { draftCount += 1; continue; }
    routes.add(e.route);
  }
  // Deliberately a union, not an intersection: the set errs toward keeping a
  // link. The sitemap can lag docs/ (an article published between deploys),
  // and the walk can't see generated category pages. What we're catching is a
  // URL present in NEITHER - i.e. a route that never existed, which is what a
  // path-derived (rather than slug-derived) URL looks like.
  return {
    routes,
    redirects: loadRedirectMap(repoRoot),
    articleCount: entries.length - draftCount,
    draftCount,
    sitemapCount: sitemapRoutes.size,
  };
}

/**
 * Return the live URL for `url`, repairing it through data/redirects.json when
 * the article has moved, or null when nothing resolves. Callers drop the link
 * on null rather than shipping a 404 to the user.
 */
function resolveLiveUrl(url, index) {
  if (!url || typeof url !== 'string' || !index) return null;
  // Off-site links (the migrated help.smartwinnr.com URLs) aren't ours to check.
  if (/^https?:\/\//i.test(url)) return url;
  let current = normRoute(url.split(/[?#]/)[0]);
  if (index.routes.has(current)) return current;
  for (let hop = 0; hop < MAX_REDIRECT_HOPS; hop++) {
    const next = index.redirects.get(current);
    if (!next) return null;
    if (index.routes.has(next)) return next;
    current = next;
  }
  return null;
}

/**
 * Process-wide cached index. docs/ is mutated between deploys by the publish
 * bot (and by the authoring journal on boot), so the cache expires rather than
 * being built once - a rescan of ~330 files is cheap next to an OpenAI call.
 */
const DEFAULT_TTL_MS = 60_000;
let cached = null;
let cachedAt = 0;
let cachedRoot = null;

function getRouteIndex(repoRoot, { ttlMs = DEFAULT_TTL_MS, force = false } = {}) {
  const now = Date.now();
  if (!force && cached && cachedRoot === repoRoot && now - cachedAt < ttlMs) return cached;
  cached = buildRouteIndex(repoRoot);
  cachedAt = now;
  cachedRoot = repoRoot;
  return cached;
}

/** Drop the cache so the next getRouteIndex rebuilds (used after a publish). */
function invalidateRouteIndex() {
  cached = null;
  cachedAt = 0;
}

module.exports = {
  normRoute,
  resolveDocRoute,
  buildLocalDocEntries,
  buildNavSectionRoutes,
  buildNonDocRouteSet,
  loadRedirectMap,
  loadSitemapRoutes,
  buildRouteIndex,
  resolveLiveUrl,
  getRouteIndex,
  invalidateRouteIndex,
};
