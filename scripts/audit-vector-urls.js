#!/usr/bin/env node
/**
 * Audit every URL stored in the ChromaDB collection against the live docs
 * tree, so a citation link that would 404 is caught here rather than by a user
 * clicking it in Ally.
 *
 * Reports three buckets:
 *   dead     - URL resolves to nothing, even after data/redirects.json
 *   stale    - URL only resolves via a redirect (article moved since indexing)
 *   drafted  - indexed article is now draft:true (no prod route)
 *
 * Exit code 1 if any dead or drafted record is found. Fix with
 * `npm run index-internal` (or FORCE_FULL_REINDEX=true for a clean rebuild).
 *
 * Usage: npm run audit:vector-urls
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { ChromaClient } = require('chromadb');
const { getRouteIndex, resolveLiveUrl, normRoute } = require('../lib/doc-routes');

const REPO_ROOT = path.join(__dirname, '..');
const DOCS_ROOT = path.join(REPO_ROOT, 'docs');

async function main() {
  const CHROMA_HOST = process.env.CHROMA_HOST || 'localhost';
  const CHROMA_PORT = Number(process.env.CHROMA_PORT || 8000);
  const CHROMA_SSL = (process.env.CHROMA_SSL || 'false').toLowerCase() === 'true';
  const collectionName = process.env.COLLECTION_NAME || 'smartwinnr_docs';

  const client = new ChromaClient({ host: CHROMA_HOST, port: CHROMA_PORT, ssl: CHROMA_SSL });

  let collection;
  try {
    collection = await client.getCollection({ name: collectionName });
  } catch (e) {
    console.error(`❌ Could not open collection "${collectionName}": ${e.message}`);
    console.error('   Is ChromaDB running, and has the indexer been run at least once?');
    process.exit(2);
  }

  const results = await collection.get({ include: ['metadatas'] });
  const metadatas = results.metadatas || [];
  console.log(`📊 ${metadatas.length} indexed records in "${collectionName}"`);

  const index = getRouteIndex(REPO_ROOT, { force: true });
  console.log(`🗺️  ${index.routes.size} live routes (${index.articleCount} articles, ${index.draftCount} drafts excluded)`);

  const dead = [];
  const stale = [];
  const drafted = [];
  const missingUrl = [];

  for (const m of metadatas) {
    if (!m) continue;
    const url = m.url;
    const source = m.source || '(unknown source)';
    if (!url) { missingUrl.push(source); continue; }

    // A record whose file is now draft:true has no prod route by definition.
    const abs = path.join(DOCS_ROOT, source);
    if (source && fs.existsSync(abs)) {
      const raw = fs.readFileSync(abs, 'utf8');
      if (/^\s*draft:\s*true\s*$/m.test(raw)) { drafted.push({ source, url }); continue; }
    }

    const live = resolveLiveUrl(url, index);
    if (!live) dead.push({ source, url });
    else if (live !== normRoute(url)) stale.push({ source, url, live });
  }

  const report = (label, rows, fmt) => {
    if (rows.length === 0) return;
    console.log(`\n${label} (${rows.length}):`);
    for (const r of rows.slice(0, 50)) console.log('  ' + fmt(r));
    if (rows.length > 50) console.log(`  ... and ${rows.length - 50} more`);
  };

  report('❌ DEAD - URL resolves to no live route', dead, (r) => `${r.url}   ← ${r.source}`);
  report('⚠️  DRAFT - indexed article is draft:true', drafted, (r) => `${r.url}   ← ${r.source}`);
  report('↪️  STALE - only reachable via a redirect', stale, (r) => `${r.url} → ${r.live}   ← ${r.source}`);
  report('⚠️  NO URL in metadata', missingUrl, (r) => r);

  const broken = dead.length + drafted.length;
  if (broken === 0 && stale.length === 0 && missingUrl.length === 0) {
    console.log('\n✅ Every indexed URL points at a live route.');
  } else if (broken === 0) {
    console.log(`\n✅ No dead URLs. ${stale.length} record(s) rely on a redirect - reindex to clean up.`);
  } else {
    console.log(`\n❌ ${broken} record(s) would produce a broken link. Run: npm run index-internal`);
  }
  process.exit(broken > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('❌ Audit failed:', e.message);
  process.exit(2);
});
