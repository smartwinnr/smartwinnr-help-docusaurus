#!/usr/bin/env node
/**
 * Chat-logger schema heal - manual-rescue path when getDb()'s automatic
 * ensureSchemaColumns hasn't run or didn't recover the schema.
 *
 * Usage:
 *   node scripts/heal-chat-logger.js          # default path
 *   CHAT_LOG_DB_PATH=/path/to/db node scripts/heal-chat-logger.js
 *   npm run db:heal
 *
 * What it does:
 *   1. Opens the SQLite file at CHAT_LOG_DB_PATH (defaults to /app/data/...
 *      to match the running server).
 *   2. Prints the current column set for `conversations` and
 *      `chat_exchanges`.
 *   3. ALTERs in every column declared in REQUIRED_COLUMNS that's missing.
 *      Skips columns that already exist (logs `=` for those).
 *   4. Re-prints the final column set so the operator can verify.
 *
 * Keep REQUIRED_COLUMNS in sync with the same constant in db/chat-logger.js
 * - both are the authoritative list of post-v1 columns. When a future
 * migration adds a column, update both places.
 */

'use strict';

const DB_PATH = process.env.CHAT_LOG_DB_PATH || '/app/data/chat-logs.db';

// Must mirror REQUIRED_COLUMNS in db/chat-logger.js. Format:
//   [table, columnName, columnSqlType]
const REQUIRED_COLUMNS = [
  // v2 (identity context)
  ['conversations',  'user_display_name', 'TEXT'],
  ['conversations',  'org_id',            'TEXT'],
  ['conversations',  'org_name',          'TEXT'],
  ['conversations',  'user_roles',        'TEXT'],
  ['conversations',  'user_privileges',   'TEXT'],
  ['chat_exchanges', 'chat_model',           'TEXT'],
  // v3 (Group B quality signals - V2 chat analytics)
  ['chat_exchanges', 'is_refusal',           'INTEGER DEFAULT 0'],
  ['chat_exchanges', 'citation_clicks_json', 'TEXT'],
];

function tableColumns(db, table) {
  try {
    return db.prepare(`PRAGMA table_info(${table})`).all().map((r) => r.name);
  } catch {
    return null;
  }
}

function main() {
  let Database;
  try {
    Database = require('better-sqlite3');
  } catch (err) {
    console.error('[heal-chat-logger] better-sqlite3 not installed:', err.message);
    process.exit(2);
  }

  let db;
  try {
    db = new Database(DB_PATH);
  } catch (err) {
    console.error(`[heal-chat-logger] failed to open ${DB_PATH}:`, err.message);
    process.exit(2);
  }

  console.log(`[heal-chat-logger] opened ${DB_PATH}`);

  const tables = Array.from(new Set(REQUIRED_COLUMNS.map(([t]) => t)));

  console.log('\nBefore:');
  for (const t of tables) {
    const cols = tableColumns(db, t);
    if (!cols) console.error(`  ${t}: table missing or unreadable`);
    else console.log(`  ${t}: [${cols.join(', ')}]`);
  }

  console.log('\nApplying:');
  let added = 0;
  let skipped = 0;
  let failed = 0;
  for (const [table, col, type] of REQUIRED_COLUMNS) {
    const existing = tableColumns(db, table);
    if (!existing) {
      console.error(`  ! ${table}.${col}: table missing - skipping`);
      failed += 1;
      continue;
    }
    if (existing.includes(col)) {
      console.log(`  = ${table}.${col} already exists`);
      skipped += 1;
      continue;
    }
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
      console.log(`  + ${table}.${col} added`);
      added += 1;
    } catch (err) {
      console.error(`  ! ${table}.${col} FAILED: ${err.message}`);
      failed += 1;
    }
  }

  console.log('\nAfter:');
  for (const t of tables) {
    const cols = tableColumns(db, t);
    if (!cols) console.error(`  ${t}: table missing or unreadable`);
    else console.log(`  ${t}: [${cols.join(', ')}]`);
  }

  console.log(`\nSummary: ${added} added, ${skipped} already present, ${failed} failed.`);

  db.close();
  process.exit(failed > 0 ? 1 : 0);
}

main();
