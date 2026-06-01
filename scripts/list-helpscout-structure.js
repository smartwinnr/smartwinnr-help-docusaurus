#!/usr/bin/env node

'use strict';

/**
 * One-shot Help Scout structure inventory.
 *
 * Walks every Collection → Category → Article so we can hand-curate the
 * `categoryMapping` in migrate-helpscout.js. Outputs both a terminal table
 * (for at-a-glance review) and scripts/helpscout-inventory.json (committed
 * to the repo as an audit trail of "what Help Scout looked like when the
 * mapping was decided").
 *
 * Usage:
 *   HELPSCOUT_API_KEY=... node scripts/list-helpscout-structure.js
 *   npm run helpscout:inventory
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_BASE = 'https://docsapi.helpscout.net/v1';
const API_KEY = process.env.HELPSCOUT_API_KEY;
const OUT_PATH = path.join(__dirname, 'helpscout-inventory.json');

if (!API_KEY) {
  console.error('[inventory] HELPSCOUT_API_KEY not set.');
  process.exit(1);
}

const client = axios.create({
  baseURL: API_BASE,
  auth: { username: API_KEY, password: 'X' },
  timeout: 30000,
});

async function get(url, params) {
  const res = await client.get(url, { params });
  if (res.headers['x-ratelimit-remaining']) {
    const remaining = parseInt(res.headers['x-ratelimit-remaining'], 10);
    if (Number.isFinite(remaining) && remaining < 10) {
      console.warn(`[inventory] Rate-limit low (${remaining}); sleeping 30s.`);
      await new Promise((r) => setTimeout(r, 30000));
    }
  }
  return res.data;
}

async function listCollections() {
  const data = await get('/collections');
  return data.collections?.items || [];
}

async function listCategories(collectionId) {
  const all = [];
  let page = 1;
  let pages = 1;
  do {
    const data = await get(`/collections/${collectionId}/categories`, { page, pageSize: 100 });
    const items = data.categories?.items || [];
    all.push(...items);
    pages = data.categories?.pages || 1;
    page += 1;
    await new Promise((r) => setTimeout(r, 100));
  } while (page <= pages);
  return all;
}

async function countArticles(collectionId) {
  // We only need totals here, so request page 1 and read `pages * pageSize`
  // approximation isn't reliable; iterate to be exact (small overhead).
  let total = 0;
  let page = 1;
  let pages = 1;
  do {
    const data = await get(`/collections/${collectionId}/articles`, {
      page,
      pageSize: 50,
      status: 'all',
    });
    const items = data.articles?.items || [];
    total += items.length;
    pages = data.articles?.pages || 1;
    page += 1;
    await new Promise((r) => setTimeout(r, 100));
  } while (page <= pages);
  return total;
}

function pad(s, n) {
  s = String(s);
  return s.length >= n ? s : s + ' '.repeat(n - s.length);
}

async function main() {
  console.log('[inventory] Fetching collections…');
  const collections = await listCollections();
  console.log(`[inventory] ${collections.length} collections found.\n`);

  const inventory = {
    fetchedAt: new Date().toISOString().split('T')[0],
    apiBase: API_BASE,
    collections: [],
  };

  console.log(pad('COLLECTION ID', 26) + pad('NAME', 40) + pad('ARTICLES', 10) + 'CATEGORIES');
  console.log('-'.repeat(110));

  for (const col of collections) {
    const categories = await listCategories(col.id);
    const articleCount = await countArticles(col.id);

    inventory.collections.push({
      id: col.id,
      name: col.name,
      slug: col.slug || null,
      description: col.description || null,
      articleCount,
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug || null,
      })),
    });

    const catSummary = categories.length
      ? categories.map((c) => c.name).join(', ')
      : '(none)';
    console.log(
      pad(col.id, 26) + pad(col.name, 40) + pad(String(articleCount), 10) + catSummary
    );
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(inventory, null, 2) + '\n', 'utf8');
  console.log(`\n[inventory] Wrote ${OUT_PATH}`);
  console.log('[inventory] Edit migrate-helpscout.js categoryMapping using these IDs.');
}

main().catch((err) => {
  console.error('[inventory] Failed:', err.response?.data || err.message || err);
  process.exit(1);
});
