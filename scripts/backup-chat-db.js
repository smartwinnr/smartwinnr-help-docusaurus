#!/usr/bin/env node

'use strict';

/**
 * Backup the chat-logs SQLite database using the safe .backup() API.
 *
 * Usage:
 *   node scripts/backup-chat-db.js                    # backup to ./data/backups/
 *   node scripts/backup-chat-db.js --output /tmp/     # custom destination
 *
 * Set BACKUP_S3_BUCKET env var to also upload to S3/R2 (requires aws-sdk).
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.CHAT_LOG_DB_PATH || '/app/data/chat-logs.db';

// Parse CLI args
const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

async function main() {
  if (!fs.existsSync(DB_PATH)) {
    console.log(`[backup] No database found at ${DB_PATH} — nothing to back up.`);
    process.exit(0);
  }

  const outputDir = getArg('output') || path.join(path.dirname(DB_PATH), 'backups');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilename = `chat-logs-backup-${timestamp}.db`;
  const backupPath = path.join(outputDir, backupFilename);

  // Use better-sqlite3 .backup() for a safe, consistent copy
  const Database = require('better-sqlite3');
  const db = new Database(DB_PATH, { readonly: true });

  try {
    await db.backup(backupPath);
    const stats = fs.statSync(backupPath);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`[backup] Created ${backupPath} (${sizeMb} MB)`);
  } finally {
    db.close();
  }

  // Optional S3 upload
  const bucket = process.env.BACKUP_S3_BUCKET;
  if (bucket) {
    try {
      const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
      const s3 = new S3Client({});
      const body = fs.readFileSync(backupPath);
      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: `chat-log-backups/${backupFilename}`,
        Body: body,
      }));
      console.log(`[backup] Uploaded to s3://${bucket}/chat-log-backups/${backupFilename}`);
    } catch (err) {
      console.error(`[backup] S3 upload failed:`, err.message);
    }
  }
}

main().catch(err => {
  console.error('[backup] Failed:', err);
  process.exit(1);
});
