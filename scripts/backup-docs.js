#!/usr/bin/env node

'use strict';

/**
 * Tarball backup of the current docs tree before a Help Scout re-sync.
 * Packs:
 *   - docs/                       (markdown content)
 *   - static/img/helpscout/       (associated images)
 *   - sidebars.ts                 (current frontmatter ↔ sidebar relationship)
 *
 * Output: ./data/backups/docs-backup-{YYYY-MM-DDTHH-MM-SS}.tar.gz
 *
 * Usage:
 *   node scripts/backup-docs.js
 *   node scripts/backup-docs.js --output /tmp/
 *
 * Refuses to overwrite an existing tarball at the same path (timestamp makes
 * collisions effectively impossible). Modeled on scripts/backup-chat-db.js.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const TARGETS = ['docs', 'static/img/helpscout', 'sidebars.ts'];

function getArg(name) {
  const args = process.argv.slice(2);
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function main() {
  const outputDir = getArg('output') || path.join(REPO_ROOT, 'data', 'backups');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const presentTargets = TARGETS.filter((t) => fs.existsSync(path.join(REPO_ROOT, t)));
  if (presentTargets.length === 0) {
    console.error('[backup-docs] None of the expected targets exist — nothing to back up.');
    process.exit(1);
  }
  const missing = TARGETS.filter((t) => !presentTargets.includes(t));
  if (missing.length > 0) {
    console.warn(`[backup-docs] Skipping missing targets: ${missing.join(', ')}`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `docs-backup-${timestamp}.tar.gz`;
  const outPath = path.join(outputDir, filename);

  if (fs.existsSync(outPath)) {
    console.error(`[backup-docs] Refusing to overwrite existing archive: ${outPath}`);
    process.exit(1);
  }

  console.log(`[backup-docs] Packing ${presentTargets.join(', ')} → ${outPath}`);
  const result = spawnSync('tar', ['-czf', outPath, ...presentTargets], {
    cwd: REPO_ROOT,
    stdio: ['ignore', 'inherit', 'inherit'],
  });

  if (result.status !== 0) {
    console.error(`[backup-docs] tar exited with code ${result.status}`);
    if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    process.exit(result.status || 1);
  }

  const stats = fs.statSync(outPath);
  console.log(`[backup-docs] Created ${outPath} (${formatBytes(stats.size)})`);
  console.log(`[backup-docs] To restore: tar -xzf ${path.relative(REPO_ROOT, outPath)} -C .`);
}

try {
  main();
} catch (err) {
  console.error('[backup-docs] Failed:', err.message || err);
  process.exit(1);
}
