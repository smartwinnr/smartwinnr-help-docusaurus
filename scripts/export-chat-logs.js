#!/usr/bin/env node

'use strict';

/**
 * CLI script to export chat logs as JSON or CSV.
 *
 * Usage:
 *   node scripts/export-chat-logs.js --from 2026-01-01 --to 2026-03-31 --format json
 *   node scripts/export-chat-logs.js --from 2026-01-01 --to 2026-03-31 --format csv --anonymize
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Parse CLI args
const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return args[idx + 1];
}
const hasFlag = (name) => args.includes(`--${name}`);

const fromDate = getArg('from');
const toDate = getArg('to');
const format = getArg('format') || 'json';
const anonymize = hasFlag('anonymize');
const outputPath = getArg('output');

if (!fromDate || !toDate) {
  console.error('Usage: node scripts/export-chat-logs.js --from YYYY-MM-DD --to YYYY-MM-DD [--format json|csv] [--anonymize] [--output path]');
  process.exit(1);
}

// Normalise dates to ISO strings
const startDate = new Date(fromDate).toISOString();
const endDate = new Date(toDate + 'T23:59:59.999Z').toISOString();

const chatLogger = require('../db/chat-logger');
const data = chatLogger.exportToJSON(startDate, endDate, anonymize);

if (data.length === 0) {
  console.log('No records found in the specified date range.');
  process.exit(0);
}

let output;
let ext;

if (format === 'csv') {
  ext = 'csv';
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  for (const row of data) {
    const values = headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    });
    csvRows.push(values.join(','));
  }
  output = csvRows.join('\n');
} else {
  ext = 'json';
  output = JSON.stringify(data, null, 2);
}

const dest = outputPath || `chat-logs-${fromDate}-to-${toDate}${anonymize ? '-anon' : ''}.${ext}`;
fs.writeFileSync(dest, output, 'utf-8');

console.log(`Exported ${data.length} records to ${dest}${anonymize ? ' (anonymized)' : ''}`);
