#!/usr/bin/env node
/**
 * Audit links that Docusaurus' own broken-link checker cannot see.
 *
 * Docusaurus validates <Link>/markdown links it can resolve at build time. It
 * does NOT catch:
 *   - `href:` literals in React components (the landing-page path tiles) - one
 *     of these pointed at a draft article and 404'd from primary nav
 *   - absolute markdown links that keep a `.md` suffix (`](/a/b.md)`) - only
 *     *relative* links get the extension stripped, so these ship verbatim
 *   - links to `draft: true` articles, which aren't routed in production
 *   - links hardcoding a deploy hostname instead of a site-relative path
 *
 * Exits 1 on any hard error (dead route / draft target / .md suffix).
 * Hardcoded hosts are reported as warnings so they don't block the build.
 *
 * Usage: npm run audit:links
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { getRouteIndex, resolveLiveUrl, resolveDocRoute, normRoute } = require('../lib/doc-routes');

const REPO_ROOT = path.join(__dirname, '..');
const DOCS_ROOT = path.join(REPO_ROOT, 'docs');
const SRC_ROOT = path.join(REPO_ROOT, 'src');

// Hosts that should never appear hardcoded in content - they're this site.
const SELF_HOSTS = [
  /(^|\.)up\.railway\.app$/i,
  /^help\.smartwinnr\.com$/i,
  /^smartwinnr\.helpscoutdocs\.com$/i,
];

function walk(dir, filter, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, filter, out);
    else if (filter(entry.name)) out.push(p);
  }
  return out;
}

function main() {
  const index = getRouteIndex(REPO_ROOT, { force: true });
  const docFiles = walk(DOCS_ROOT, (n) => /\.mdx?$/i.test(n));
  const srcFiles = walk(SRC_ROOT, (n) => /\.(tsx?|jsx?)$/i.test(n));

  // Draft routes: they exist on disk but are not built, so linking one is a 404.
  const draftRoutes = new Set();
  for (const f of docFiles) {
    const raw = fs.readFileSync(f, 'utf8');
    const r = resolveDocRoute(f, DOCS_ROOT, raw);
    if (r.isDraft) draftRoutes.add(r.route);
  }

  const errors = [];
  const warnings = [];
  const rel = (p) => path.relative(REPO_ROOT, p).replace(/\\/g, '/');

  // Frontmatter that doesn't parse fails silently everywhere it matters: the
  // route resolver falls back to filename identity, and the gate emitter drops
  // the article's customProps entirely - so a narrower-than-folder audience is
  // quietly widened. Nothing else in the pipeline reports it, because every
  // consumer swallows the parse error to stay resilient. Catch it here.
  // (`{}` bypasses gray-matter's cache - see lib/doc-routes.js.)
  for (const f of docFiles) {
    try {
      matter(fs.readFileSync(f, 'utf8'), {});
    } catch (e) {
      errors.push(`${rel(f)}: frontmatter is not valid YAML - ${String(e.message).split('\n')[0]}`);
    }
  }

  const checkRoute = (url, where, kind) => {
    const norm = normRoute(url.split(/[?#]/)[0]);
    if (draftRoutes.has(norm)) {
      errors.push(`${where}: links to DRAFT article ${norm} (not built - 404)`);
    } else if (!resolveLiveUrl(url, index)) {
      errors.push(`${where}: ${kind} points at no live route -> ${url}`);
    }
  };

  // --- src/ href literals (landing tiles, nav, custom pages)
  for (const f of srcFiles) {
    const s = fs.readFileSync(f, 'utf8');
    for (const m of s.matchAll(/href:\s*['"](\/[^'"]*)['"]/g)) {
      const url = m[1];
      if (url.includes('${')) continue; // template literal - resolved at runtime
      checkRoute(url, rel(f), 'href literal');
    }
  }

  // --- docs markdown links
  for (const f of docFiles) {
    const s = fs.readFileSync(f, 'utf8');
    for (const m of s.matchAll(/\]\((\/[^)\s]*)\)/g)) {
      const url = m[1];
      if (/\.mdx?($|[?#])/i.test(url)) {
        errors.push(`${rel(f)}: absolute link keeps its .md extension (Docusaurus only strips it on relative links) -> ${url}`);
        continue;
      }
      if (/\.(png|jpe?g|gif|svg|webp|pdf)$/i.test(url)) continue; // asset, not a route
      checkRoute(url, rel(f), 'markdown link');
    }
    for (const m of s.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
      let host;
      try { host = new URL(m[1]).host; } catch { continue; }
      if (SELF_HOSTS.some((re) => re.test(host))) {
        warnings.push(`${rel(f)}: hardcodes ${host} - use a site-relative path instead`);
      }
    }
  }

  const show = (label, rows, cap = 25) => {
    if (!rows.length) return;
    console.log(`\n${label} (${rows.length}):`);
    rows.slice(0, cap).forEach((r) => console.log('  ' + r));
    if (rows.length > cap) console.log(`  ... and ${rows.length - cap} more`);
  };

  console.log(`🔗 checked ${srcFiles.length} src files + ${docFiles.length} docs against ${index.routes.size} live routes`);
  show('❌ BROKEN', errors);
  show('⚠️  WARNING', warnings);

  if (errors.length === 0) {
    console.log(`\n✅ No broken links.${warnings.length ? ` (${warnings.length} warning(s))` : ''}`);
    process.exit(0);
  }
  console.log(`\n❌ ${errors.length} broken link(s).`);
  process.exit(1);
}

main();
