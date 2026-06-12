#!/usr/bin/env node

'use strict';

/**
 * Help Scout → Docusaurus migrator.
 *
 * Pulls every article from every collection in Help Scout and writes one
 * standardized Markdown file per article into docs/<canonical-dir>/.
 * Articles are upserted by `helpscout_id` (preserved in frontmatter as
 * `source.helpscout_id` and surfaced at the top via Docusaurus's `id` field),
 * so re-runs do not duplicate. Images are downloaded into a per-collection
 * bucket under static/img/helpscout/<collection-slug>/.
 *
 * Run modes:
 *   node scripts/migrate-helpscout.js                # full upsert
 *   node scripts/migrate-helpscout.js --test         # first 3 articles only
 *   node scripts/migrate-helpscout.js --allow-relocate   # move articles between dirs when categoryMapping disagrees with on-disk location
 *   node scripts/migrate-helpscout.js --prune        # delete on-disk articles that no longer exist in Help Scout
 *
 * Categorization: hand-curated CATEGORY_MAPPING below. If a Help Scout
 * collection is not mapped, the migrator aborts before writing anything.
 * Run `npm run helpscout:inventory` first to dump current collection IDs.
 *
 * See CLAUDE.md §"Article format (canonical)" for the frontmatter schema.
 */

const axios = require('axios');
const TurndownService = require('turndown');
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const crypto = require('crypto');
const matter = require('gray-matter');
require('dotenv').config();

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const REPO_ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(REPO_ROOT, 'docs');
const IMAGES_ROOT = path.join(REPO_ROOT, 'static', 'img', 'helpscout');

// Canonical directory layout — kept in sync with sidebars.ts.
// The migrator refuses to emit into any dir not listed here.
const CANONICAL_DIRS = new Set([
  'overview',
  'getting-started',
  'announcements',
  'user-guide',
  'user-guide/ai-coaching',
  'help-support',
  'troubleshooting',
  'manager-guide',
  'administration/system-management',
  'administration/access-permissions',
  'administration/quiz-module',
  'administration/smartpath-module',
  'administration/smartfeed-module',
  'administration/video-coaching-module',
  'administration/field-coaching-module',
  'administration/ai-coaching',
  'administration/survey-module',
  'administration/knowledge-hub-module',
  'administration/forms-module',
  'administration/kpi-gamification',
  'administration/reports',
  'administration/notifications',
  'administration/cross-module-features',
]);

// Hand-curated: Help Scout collectionId → { defaultRoles, categories: { categoryId → { dir, roles?, privilege? } } }.
//
// HOW TO POPULATE:
//   1. Run `npm run helpscout:inventory` to dump scripts/helpscout-inventory.json
//   2. For each (collection, category), decide:
//        - `dir`        : one of CANONICAL_DIRS above
//        - `roles`      : optional override of defaultRoles for this category
//        - `privilege`  : optional org-privilege key (must match the enum in
//                          smartwinnr_prd/modules/organizations/.../organizations.server.model.js)
//   3. Commit this map. The migrator aborts on any unmapped (collectionId, categoryId)
//      so misfiling never happens silently.
//
// Categories below match scripts/helpscout-inventory.json snapshot (3 collections, 38 categories).
const CATEGORY_MAPPING = {
  // ===== Editors =====
  '5fcc5d85de1bfa158fb55b98': {
    name: 'Editors',
    defaultRoles: ['editor', 'admin'],
    categories: {
      '697b27a7e2f586b8fadaba11': { dir: 'administration/ai-coaching',           privilege: 'aiCoaching' },
      '5fcf76b4471dc000c9affdd2': { dir: 'administration/smartfeed-module',      privilege: 'content' },
      '5fcf7646388c5a0089e64978': { dir: 'administration/quiz-module',           privilege: 'quiz' },
      '5fd44c833d1d2a5b1c5ea0f9': { dir: 'administration/quiz-module',           privilege: 'quiz' },
      '5fd49b7c3d1d2a5b1c5ea166': { dir: 'administration/survey-module',         privilege: 'survey' },
      '5fd6f6fb36980410c9123b3e': { dir: 'administration/smartpath-module',      privilege: 'smartpaths' },
      '5fdae8757129911ba1b21de0': { dir: 'administration/knowledge-hub-module',  privilege: 'khub' },
      '5fd72017c868cb6df3a813be': { dir: 'administration/video-coaching-module', privilege: 'coaching' },
      '6778cfa092cf3a0bf0d585fd': { dir: 'administration/field-coaching-module', privilege: 'fCoaching' },
      '5fd8c0197129911ba1b21234': { dir: 'administration/forms-module',          privilege: 'forms' },
      '5fd9ac5627288b7f895d5e08': { dir: 'administration/kpi-gamification',      privilege: 'competitions' },
      '5fdb0b97a5d295659b369c5c': { dir: 'administration/kpi-gamification',      privilege: 'kpi' },
      '5fdb4ce0a5d295659b369d91': { dir: 'administration/kpi-gamification',      privilege: 'achievements' },
      '5fdae18927288b7f895d64d3': { dir: 'administration/reports',               privilege: 'learnerReport' },
      '5fdaf55227288b7f895d650b': { dir: 'administration/notifications',         privilege: 'chat' },
      '5fda5502b624c71b7985a2ca': { dir: 'administration/system-management',     privilege: 'groups' },
      '5fdb07e87129911ba1b21e3a': { dir: 'administration/notifications',         privilege: 'customNotifications' },
      '5fdb74717129911ba1b2202c': { dir: 'administration/access-permissions',    roles: ['admin'] },
      '5fd4e5943d1d2a5b1c5ea1c8': { dir: 'administration/cross-module-features' },
      '5fcc5d85de1bfa158fb55b99': { dir: 'administration/cross-module-features' },
    },
  },
  // ===== Managers and Team Members =====
  '5fcdfed6d580ce55a38b4d1e': {
    name: 'Managers and Team Members',
    defaultRoles: ['user', 'manager', 'editor', 'admin'],
    categories: {
      '6970fbc900f8607fae245db9': { dir: 'user-guide/ai-coaching', privilege: 'aiCoaching' },
      '5fdb40670b11ce44f6393294': { dir: 'user-guide' },
      '5fce0238de1bfa158fb55e2b': { dir: 'getting-started' },
      '5fd98ea8b624c71b79859ee5': { dir: 'manager-guide', roles: ['manager', 'editor', 'admin'], privilege: 'managerView' },
      '5fce313bd580ce55a38b4e15': { dir: 'user-guide', privilege: 'forms' },
      '5fcdfed6d580ce55a38b4d1f': { dir: 'user-guide' },
    },
  },
  // ===== Admins =====
  '60017766b9a8501b295d0ce6': {
    name: 'Admins',
    defaultRoles: ['admin'],
    categories: {
      '60017e19c64fe14d0e1fb416': { dir: 'administration/system-management' },
      '60017b141c64ad47e4b6f9bc': { dir: 'administration/quiz-module',           privilege: 'quiz' },
      '60017917cfe30d219ccd8220': { dir: 'administration/system-management',     privilege: 'auditLog' },
      '60017a3f2e764327f87bf07d': { dir: 'administration/system-management',     privilege: 'contacts' },
      '60017cd41c64ad47e4b6f9c3': { dir: 'administration/system-management' },
      '6001c9f2cfe30d219ccd840f': { dir: 'administration/system-management' },
      '601546636867724dfc6edbff': { dir: 'administration/video-coaching-module', privilege: 'coaching' },
      '6001c9bb1c64ad47e4b6fba7': { dir: 'administration/reports',               privilege: 'learnerReport' },
      '60017b782e764327f87bf085': { dir: 'administration/system-management' },
      '60a8932213fd125a39b465a8': { dir: 'administration/field-coaching-module', privilege: 'fCoaching' },
      '60017766b9a8501b295d0ce7': { dir: 'administration/system-management' },
    },
  },
};

// ---------------------------------------------------------------------------
// Migrator
// ---------------------------------------------------------------------------

class HelpScoutMigrator {
  constructor({ testMode = false, allowRelocate = false, prune = false } = {}) {
    this.apiKey = process.env.HELPSCOUT_API_KEY;
    if (!this.apiKey) {
      throw new Error('HELPSCOUT_API_KEY not set');
    }
    this.baseUrl = 'https://docsapi.helpscout.net/v1';
    this.testMode = testMode;
    this.allowRelocate = allowRelocate;
    this.prune = prune;

    this.turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });

    // Built lazily on first call to `loadExistingIndex`.
    this.existingByHelpscoutId = new Map(); // helpscout_id → absolute file path
    this.allSeenHelpscoutIds = new Set();   // populated during migration; used for --prune

    // Per-run image download cache keyed by source URL.
    this.imageCache = new Map(); // url → /img/helpscout/<col-slug>/<name>.<ext>

    this.results = [];
    this.unmappedArticles = []; // articles whose categories[] didn't intersect the mapping
  }

  // -------------------------------------------------------------------------
  // Help Scout API
  // -------------------------------------------------------------------------

  async get(endpoint, params = {}) {
    const res = await axios.get(`${this.baseUrl}${endpoint}`, {
      auth: { username: this.apiKey, password: 'X' },
      params,
      timeout: 30000,
    });
    const remaining = parseInt(res.headers['x-ratelimit-remaining'], 10);
    if (Number.isFinite(remaining) && remaining < 10) {
      console.warn(`[migrate] Rate-limit low (${remaining}); sleeping 30s`);
      await sleep(30000);
    }
    return res.data;
  }

  async fetchCollections() {
    const data = await this.get('/collections');
    return data.collections?.items || [];
  }

  async fetchArticlesFromCollection(collectionId) {
    const all = [];
    let page = 1;
    let pages = 1;
    do {
      const data = await this.get(`/collections/${collectionId}/articles`, {
        page,
        pageSize: 50,
        status: 'all',
      });
      const items = data.articles?.items || [];
      all.push(...items);
      pages = data.articles?.pages || 1;
      page += 1;
      await sleep(100);
    } while (page <= pages);
    return all;
  }

  async fetchArticleDetails(articleId) {
    const data = await this.get(`/articles/${articleId}`);
    return data.article;
  }

  async fetchCategoriesForCollection(collectionId) {
    const all = [];
    let page = 1;
    let pages = 1;
    do {
      const data = await this.get(`/collections/${collectionId}/categories`, {
        page,
        pageSize: 100,
      });
      const items = data.categories?.items || [];
      all.push(...items);
      pages = data.categories?.pages || 1;
      page += 1;
      await sleep(100);
    } while (page <= pages);
    return all;
  }

  // -------------------------------------------------------------------------
  // Pre-flight + on-disk index
  // -------------------------------------------------------------------------

  async validateMapping(collections) {
    // 1. Every Help Scout collection must be in CATEGORY_MAPPING
    const unmappedCollections = collections.filter((c) => !CATEGORY_MAPPING[c.id]);
    if (unmappedCollections.length > 0) {
      console.error('\n[migrate] ABORT: the following Help Scout collections are not in CATEGORY_MAPPING:');
      unmappedCollections.forEach((c) => console.error(`  - ${c.id}  ${c.name}`));
      console.error('\nAdd them to scripts/migrate-helpscout.js CATEGORY_MAPPING then re-run.');
      console.error('Run `npm run helpscout:inventory` if you need a fresh dump of IDs.\n');
      process.exit(1);
    }

    // 2. Every dir referenced in CATEGORY_MAPPING must be a CANONICAL_DIR
    const invalidDirs = [];
    for (const [colId, col] of Object.entries(CATEGORY_MAPPING)) {
      for (const [catId, cat] of Object.entries(col.categories || {})) {
        if (!CANONICAL_DIRS.has(cat.dir)) {
          invalidDirs.push(`${colId}/${catId} → ${cat.dir}`);
        }
      }
    }
    if (invalidDirs.length > 0) {
      console.error('\n[migrate] ABORT: CATEGORY_MAPPING contains non-canonical dirs:');
      invalidDirs.forEach((d) => console.error(`  - ${d}`));
      console.error('Valid dirs are listed in CANONICAL_DIRS at the top of this file.\n');
      process.exit(1);
    }

    // 3. Every Help Scout category must be in CATEGORY_MAPPING (fetched live)
    const unmappedCategories = [];
    for (const col of collections) {
      const colMap = CATEGORY_MAPPING[col.id];
      const liveCats = await this.fetchCategoriesForCollection(col.id);
      for (const cat of liveCats) {
        if (!colMap.categories[cat.id]) {
          unmappedCategories.push(`${col.name} / ${cat.name} (${col.id}/${cat.id})`);
        }
      }
    }
    if (unmappedCategories.length > 0) {
      console.error('\n[migrate] ABORT: the following Help Scout categories are not in CATEGORY_MAPPING.categories:');
      unmappedCategories.forEach((line) => console.error(`  - ${line}`));
      console.error('\nAdd them to scripts/migrate-helpscout.js CATEGORY_MAPPING.<collectionId>.categories then re-run.\n');
      process.exit(1);
    }
  }

  /**
   * Resolve the (collectionId, categoryId, mapping) for a Help Scout article.
   * An article carries `categories: [<categoryId>, ...]`; we pick the FIRST
   * categoryId in that array that has a mapping under the given collection.
   * Returns null if none match — caller decides how to handle.
   */
  resolveCategoryForArticle(article, collectionId) {
    const colMap = CATEGORY_MAPPING[collectionId];
    if (!colMap) return null;
    const articleCategories = Array.isArray(article.categories) ? article.categories : [];
    for (const catId of articleCategories) {
      const cat = colMap.categories[catId];
      if (cat) {
        const merged = {
          dir: cat.dir,
          roles: cat.roles || colMap.defaultRoles,
          privilege: cat.privilege,
          categoryId: catId,
          collectionId,
        };
        return merged;
      }
    }
    return null;
  }

  async loadExistingIndex() {
    const walk = async (dir) => {
      if (!fs.existsSync(dir)) return [];
      const out = [];
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          out.push(...(await walk(full)));
        } else if (e.isFile() && full.endsWith('.md')) {
          out.push(full);
        }
      }
      return out;
    };
    const files = await walk(DOCS_DIR);
    for (const f of files) {
      try {
        const raw = await fs.readFile(f, 'utf8');
        const parsed = matter(raw);
        const hsId =
          parsed.data?.source?.helpscout_id ??
          parsed.data?.helpscout_id ??
          parsed.data?.id;
        if (hsId) this.existingByHelpscoutId.set(String(hsId), f);
      } catch (err) {
        console.warn(`[migrate] Could not parse ${f}: ${err.message}`);
      }
    }
    console.log(`[migrate] Indexed ${this.existingByHelpscoutId.size} existing articles by helpscout_id`);
  }

  // -------------------------------------------------------------------------
  // Frontmatter + body
  // -------------------------------------------------------------------------

  createSlug(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 96);
  }

  formatDate(epochSecondsOrIso) {
    if (!epochSecondsOrIso) return new Date().toISOString().split('T')[0];
    const d = typeof epochSecondsOrIso === 'number'
      ? new Date(epochSecondsOrIso * 1000)
      : new Date(epochSecondsOrIso);
    if (Number.isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    return d.toISOString().split('T')[0];
  }

  buildFrontmatter({ article, mapping, slug, preservedSidebarPosition }) {
    const id = String(article.id);
    const lastUpdateDate = this.formatDate(article.updatedAt || article.modifiedAt || article.createdAt);
    const description = (article.preview || '').replace(/\s+/g, ' ').trim().slice(0, 160);

    const lines = [
      '---',
      `id: ${id}`,
      `title: ${yamlString(article.name || 'Untitled')}`,
      `description: ${yamlString(description)}`,
      `slug: ${slug}`,
      `sidebar_position: ${preservedSidebarPosition ?? article.number ?? 1}`,
      'last_update:',
      `  date: ${lastUpdateDate}`,
      '  author: HelpScout Migration',
      'source:',
      `  helpscout_id: ${id}`,
      `  helpscout_url: ${article.publicUrl || ''}`,
      'customProps:',
      `  roles: [${mapping.roles.map((r) => r).join(', ')}]`,
    ];
    if (mapping.privilege) {
      lines.push(`  privilege: ${mapping.privilege}`);
    }
    const tags = Array.isArray(article.tags) ? article.tags.map((t) => String(t).toLowerCase()) : [];
    lines.push(`tags: [${tags.join(', ')}]`);
    lines.push('---');
    lines.push('');
    return lines.join('\n');
  }

  // -------------------------------------------------------------------------
  // Images
  // -------------------------------------------------------------------------

  async processImages(html, { collectionSlug, articleSlug }) {
    const $ = cheerio.load(html, null, false);
    const imgs = $('img').toArray();
    if (imgs.length === 0) return $.html();

    const collectionDir = path.join(IMAGES_ROOT, collectionSlug);
    await fs.ensureDir(collectionDir);

    let index = 0;
    await Promise.all(
      imgs.map(async (el) => {
        const $el = $(el);
        const src = $el.attr('src');
        if (!src || !/^https?:\/\//i.test(src)) return;

        if (this.imageCache.has(src)) {
          $el.attr('src', this.imageCache.get(src));
          return;
        }

        const ext = inferExt(src);
        const n = ++index;
        const filename = `${articleSlug}-${n}${ext}`;
        const localFs = path.join(collectionDir, filename);
        const webPath = `/img/helpscout/${collectionSlug}/${filename}`;

        try {
          if (!fs.existsSync(localFs) || fs.statSync(localFs).size === 0) {
            const res = await axios.get(src, { responseType: 'arraybuffer', timeout: 30000 });
            await fs.writeFile(localFs, Buffer.from(res.data));
          }
          this.imageCache.set(src, webPath);
          $el.attr('src', webPath);
        } catch (err) {
          console.warn(`[migrate] Image download failed: ${src} — ${err.message}`);
          // Leave the original src; markdown will still render (broken externally).
        }
      })
    );
    return $.html();
  }

  // -------------------------------------------------------------------------
  // Convert + write
  // -------------------------------------------------------------------------

  async convertAndWrite(article, collection, mapping) {
    const slug = this.createSlug(article.name);
    const collectionSlug = this.createSlug(collection.name);

    // Strip raw HTML `style="..."` attrs up-front. Turndown preserves block-level
    // HTML (iframe, div…) verbatim, and MDX parses it as JSX where `style` must
    // be an object, not a string. Help Scout style attrs are decorative; safe to drop.
    const html = (article.text || '').replace(/\s+style="[^"]*"/gi, '');
    const processedHtml = await this.processImages(html, { collectionSlug, articleSlug: slug });
    let markdown = this.turndown.turndown(processedHtml).trim();
    // Trim trailing whitespace per line and ensure final newline
    markdown = markdown.split('\n').map((l) => l.replace(/\s+$/g, '')).join('\n');
    // MDX rejects [alt](<https://...>) and bare CommonMark autolinks like
    // <https://foo> or <email@x>. In each case `<https...` / `<email...` reads
    // as a JSX tag opening, then `/` or `@` inside breaks the parse. CommonMark
    // wrappers are only needed when the URL has spaces or parens — Help Scout
    // URLs and emails don't — so we can flatten them.
    markdown = markdown
      .replace(/\]\(<(https?:\/\/[^>\s]+)>\)/g, ']($1)')
      .replace(/<(https?:\/\/[^>\s]+)>/g, '$1')
      .replace(/<_?([\w.+-]+@[\w.-]+\.[A-Za-z]{2,})>_?/g, '[$1](mailto:$1)');

    const hsId = String(article.id);
    const existingPath = this.existingByHelpscoutId.get(hsId);

    let preservedSidebarPosition;
    if (existingPath) {
      try {
        const raw = await fs.readFile(existingPath, 'utf8');
        const parsed = matter(raw);
        if (typeof parsed.data?.sidebar_position === 'number') {
          preservedSidebarPosition = parsed.data.sidebar_position;
        }
      } catch (_) {
        // best-effort; fall through to article.number
      }
    }

    const frontmatter = this.buildFrontmatter({
      article,
      mapping,
      slug,
      preservedSidebarPosition,
    });
    const content = frontmatter + markdown + '\n';

    const targetDir = path.join(DOCS_DIR, mapping.dir);
    await fs.ensureDir(targetDir);
    const targetPath = path.join(targetDir, `${slug}.md`);

    // Relocation: existing file lives in a different dir than the new mapping
    if (existingPath && path.dirname(existingPath) !== targetDir) {
      if (this.allowRelocate) {
        console.log(`[migrate] Relocating ${hsId}: ${path.relative(DOCS_DIR, existingPath)} → ${path.relative(DOCS_DIR, targetPath)}`);
        await fs.remove(existingPath);
      } else {
        console.warn(`[migrate] SKIP RELOCATE ${hsId}: lives at ${path.relative(DOCS_DIR, existingPath)} but mapping says ${mapping.dir}/. Re-run with --allow-relocate to move.`);
        await fs.writeFile(existingPath, content, 'utf8');
        this.allSeenHelpscoutIds.add(hsId);
        return { id: hsId, title: article.name, path: existingPath, status: 'updated-in-place' };
      }
    }

    await fs.writeFile(targetPath, content, 'utf8');
    this.existingByHelpscoutId.set(hsId, targetPath);
    this.allSeenHelpscoutIds.add(hsId);
    return {
      id: hsId,
      title: article.name,
      path: targetPath,
      status: existingPath ? 'updated' : 'created',
    };
  }

  // -------------------------------------------------------------------------
  // Prune
  // -------------------------------------------------------------------------

  async maybePrune() {
    const orphans = [];
    for (const [hsId, filePath] of this.existingByHelpscoutId.entries()) {
      if (!this.allSeenHelpscoutIds.has(hsId)) orphans.push({ hsId, filePath });
    }
    if (orphans.length === 0) return;

    if (!this.prune) {
      console.log(`\n[migrate] ${orphans.length} on-disk articles no longer exist in Help Scout. Re-run with --prune to delete them.`);
      orphans.forEach((o) => console.log(`  - ${o.hsId} ${path.relative(REPO_ROOT, o.filePath)}`));
      return;
    }
    console.log(`\n[migrate] Pruning ${orphans.length} orphans…`);
    for (const o of orphans) {
      await fs.remove(o.filePath);
      console.log(`  - removed ${path.relative(REPO_ROOT, o.filePath)}`);
    }
  }

  // -------------------------------------------------------------------------
  // Orchestration
  // -------------------------------------------------------------------------

  async run() {
    console.log('[migrate] Starting Help Scout migration');
    await fs.ensureDir(DOCS_DIR);
    await fs.ensureDir(IMAGES_ROOT);

    const collections = await this.fetchCollections();
    console.log(`[migrate] Found ${collections.length} collections`);
    await this.validateMapping(collections);

    await this.loadExistingIndex();

    let processed = 0;
    for (const collection of collections) {
      const colMap = CATEGORY_MAPPING[collection.id];
      console.log(`\n[migrate] Collection: ${collection.name} (default roles: [${colMap.defaultRoles.join(', ')}])`);
      const articleSummaries = await this.fetchArticlesFromCollection(collection.id);
      console.log(`[migrate]   ${articleSummaries.length} article(s)`);

      const slice = this.testMode ? articleSummaries.slice(0, 3) : articleSummaries;
      for (const summary of slice) {
        processed += 1;
        try {
          const article = await this.fetchArticleDetails(summary.id);
          const mapping = this.resolveCategoryForArticle(article, collection.id);
          if (!mapping) {
            console.warn(`  [${processed}] UNMAPPED ${article.id}: '${article.name}' — categories=[${(article.categories || []).join(', ')}]`);
            this.unmappedArticles.push({
              id: String(article.id),
              title: article.name,
              collection: collection.name,
              categories: article.categories || [],
            });
            continue;
          }
          const result = await this.convertAndWrite(article, collection, mapping);
          this.results.push({ ...result, collection: collection.name });
          console.log(`  [${processed}] ${result.status.padEnd(18)} ${result.path ? path.relative(DOCS_DIR, result.path) : ''}`);
        } catch (err) {
          console.error(`  [${processed}] FAILED ${summary.id}: ${err.message}`);
          this.results.push({
            id: String(summary.id),
            title: summary.name || 'Unknown',
            status: 'failed',
            error: err.message,
            collection: collection.name,
          });
        }
        await sleep(150);
      }
      if (this.testMode) break;
    }

    await this.maybePrune();

    const counts = this.results.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});
    console.log('\n[migrate] Done.');
    Object.entries(counts).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
    if (this.unmappedArticles.length > 0) {
      console.warn(`\n[migrate] ${this.unmappedArticles.length} article(s) skipped — no category in CATEGORY_MAPPING matched:`);
      this.unmappedArticles.forEach((u) =>
        console.warn(`  - ${u.collection} / ${u.id} '${u.title}' — categories=[${u.categories.join(', ')}]`)
      );
    }

    const reportPath = path.join(__dirname, 'migration-report.json');
    await fs.writeFile(
      reportPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString().split('T')[0],
          counts,
          unmappedCount: this.unmappedArticles.length,
          unmapped: this.unmappedArticles,
          results: this.results,
        },
        null,
        2
      ),
      'utf8'
    );
    console.log(`[migrate] Report → ${path.relative(REPO_ROOT, reportPath)}`);

    if (this.unmappedArticles.length > 0) {
      process.exit(2);
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function yamlString(s) {
  // Always double-quote; escape backslashes + double quotes.
  const escaped = String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${escaped}"`;
}

function inferExt(url) {
  const m = url.split('?')[0].match(/\.(png|jpe?g|gif|webp|svg|bmp)$/i);
  return m ? `.${m[1].toLowerCase()}` : '.png';
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  const argv = process.argv.slice(2);
  const opts = {
    testMode: argv.includes('--test'),
    allowRelocate: argv.includes('--allow-relocate'),
    prune: argv.includes('--prune'),
  };
  new HelpScoutMigrator(opts).run().catch((err) => {
    console.error('[migrate] Fatal:', err.message || err);
    process.exit(1);
  });
}

module.exports = HelpScoutMigrator;
