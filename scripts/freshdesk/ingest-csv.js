#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const stringSimilarity = require('string-similarity');

const columnMapping = require('./config/column-mapping.json');

// Patterns for cleaning email content
const CLEANING_PATTERNS = {
  // Email signatures
  signatures: [
    /(?:^|\n)\s*(?:Regards|Best regards|Best|Thanks|Thank you|Cheers|Kind regards|Warm regards|Sincerely),?\s*\n[\s\S]*$/im,
    /(?:^|\n)\s*--\s*\n[\s\S]*$/m,
    /(?:^|\n)\s*Sent from (?:my iPhone|my iPad|Mail for Windows|Outlook for (?:iOS|Android))[\s\S]*$/im,
  ],
  // CID image references
  cidImages: /\[cid:[^\]]+\]/g,
  // HTML tags
  htmlTags: /<[^>]+>/g,
  // URLs with angle bracket notation
  urlBrackets: /<(?:https?|mailto):[^>]+>/g,
  // GDPR / legal disclaimers
  gdprDisclaimer: /In accordance with the provisions of the General Data Protection Regulation[\s\S]*$/im,
  // Confidentiality notices
  confidentiality: /(?:This email|This message|This communication) (?:and any|is intended)[\s\S]*?(?:intended recipient|delete this|notify the sender)[\s\S]*$/im,
  // CAUTION banners
  cautionBanner: /CAUTION:?\s*This email originated from outside[\s\S]*?(?:\n\n|\n(?=[A-Z]))/gi,
  // Phone numbers in signature blocks
  phoneBlock: /(?:\+\d[\d\s\-()]{8,}(?:\s*\((?:Cell|Text|Desk|Office|Mobile|Work)\))?)/g,
  // Auto-generated image descriptions
  autoImageDesc: /\[(?:Text |Image |Logo |Icon )?Description automatically generated[^\]]*\]/gi,
  // Email thread markers
  threadMarkers: /(?:^|\n)On\s+(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[^]+?wrote:\s*/gm,
  // Forwarded message headers
  forwardedHeaders: /(?:^|\n)[-]+\s*(?:Forwarded|Original)\s+(?:message|Message)[\s\S]*?(?:Subject|From|To|Date):[^\n]+\n/gm,
  // Multiple consecutive newlines
  multipleNewlines: /\n{3,}/g,
  // Website URLs
  websiteUrls: /(?:www\.[^\s<>]+|https?:\/\/[^\s<>]+)/g,
};

// Subjects/descriptions that indicate non-documentable tickets
const SKIP_PATTERNS = [
  /^A new issue message has been sent by a user\.?$/i,
  /^Re:\s*Re:\s*Re:/i, // deeply nested reply chains
];

// Types to exclude from article generation
const EXCLUDE_TYPES = ['Bug', 'Feature Request'];
const BUG_TYPES = ['Bug'];
const FEATURE_TYPES = ['Feature Request'];

/**
 * Extract the original customer question from an email thread.
 * Looks for the first non-SmartWinnr message in the reply chain.
 */
function extractOriginalQuestion(description, subject) {
  if (!description || description.trim().length === 0) {
    return subject || '';
  }

  // Split by common reply chain delimiters
  const replyDelimiters = [
    /On\s+(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[^]*?wrote:\s*/g,
    /From:\s+[^\n]+\n(?:Sent|Date):\s+[^\n]+\n(?:To|Subject):\s+[^\n]+\n/g,
    /[-]{3,}\s*(?:Original Message|Forwarded message)\s*[-]{3,}/gi,
  ];

  let parts = [description];
  for (const delimiter of replyDelimiters) {
    const newParts = [];
    for (const part of parts) {
      newParts.push(...part.split(delimiter));
    }
    parts = newParts;
  }

  // Find the last part (original message) that isn't from SmartWinnr
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i].trim();
    if (
      part.length > 20 &&
      !part.includes('@smartwinnr.com') &&
      !part.toLowerCase().includes('smartwinnr team')
    ) {
      return part;
    }
  }

  // Fallback: return first part
  return parts[0]?.trim() || subject || '';
}

/**
 * Clean a description field by stripping email artifacts.
 */
function cleanDescription(rawDescription) {
  if (!rawDescription) return '';

  let cleaned = rawDescription;

  // Remove CAUTION banners first
  cleaned = cleaned.replace(CLEANING_PATTERNS.cautionBanner, '');

  // Remove CID image references
  cleaned = cleaned.replace(CLEANING_PATTERNS.cidImages, '');

  // Remove auto-generated image descriptions
  cleaned = cleaned.replace(CLEANING_PATTERNS.autoImageDesc, '');

  // Remove HTML tags
  cleaned = cleaned.replace(CLEANING_PATTERNS.htmlTags, '');

  // Remove URL bracket notation (keep the URL text only)
  cleaned = cleaned.replace(CLEANING_PATTERNS.urlBrackets, '');

  // Remove website URLs
  cleaned = cleaned.replace(CLEANING_PATTERNS.websiteUrls, '');

  // Remove GDPR disclaimers
  cleaned = cleaned.replace(CLEANING_PATTERNS.gdprDisclaimer, '');

  // Remove confidentiality notices
  cleaned = cleaned.replace(CLEANING_PATTERNS.confidentiality, '');

  // Remove forwarded message headers
  cleaned = cleaned.replace(CLEANING_PATTERNS.forwardedHeaders, '');

  // Remove phone number blocks
  cleaned = cleaned.replace(CLEANING_PATTERNS.phoneBlock, '');

  // Trim email signatures (try each pattern)
  for (const sigPattern of CLEANING_PATTERNS.signatures) {
    cleaned = cleaned.replace(sigPattern, '');
  }

  // Clean up whitespace
  cleaned = cleaned.replace(CLEANING_PATTERNS.multipleNewlines, '\n\n');
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Check if a ticket should be skipped entirely.
 */
function shouldSkipTicket(ticket) {
  const desc = ticket.description || '';
  const subject = ticket.subject || '';

  // Skip generic notification descriptions
  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(desc) || pattern.test(subject)) {
      return { skip: true, reason: 'generic_notification' };
    }
  }

  // Skip if both subject and description are empty/minimal
  if (subject.trim().length < 5 && desc.trim().length < 20) {
    return { skip: true, reason: 'insufficient_content' };
  }

  return { skip: false };
}

/**
 * Detect non-English content.
 */
function detectNonEnglish(text) {
  if (!text) return false;
  // Simple heuristic: check for common non-ASCII character blocks
  const nonLatinRatio =
    (text.match(/[^\x00-\x7F]/g) || []).length / text.length;
  return nonLatinRatio > 0.3;
}

/**
 * Deduplicate tickets using fuzzy string matching.
 */
function deduplicateTickets(tickets, threshold = 0.7) {
  const unique = [];
  const duplicateMap = new Map(); // ticketId -> duplicateOfId

  for (const ticket of tickets) {
    const compareStr = `${ticket.subject} ${ticket.cleanedDescription}`.toLowerCase();
    let isDuplicate = false;

    for (const existing of unique) {
      const existingStr = `${existing.subject} ${existing.cleanedDescription}`.toLowerCase();
      const similarity = stringSimilarity.compareTwoStrings(
        compareStr.substring(0, 500),
        existingStr.substring(0, 500)
      );

      if (similarity > threshold) {
        isDuplicate = true;
        duplicateMap.set(ticket.id, existing.id);
        // Increment count on the existing ticket
        existing.duplicateCount = (existing.duplicateCount || 1) + 1;
        break;
      }
    }

    if (!isDuplicate) {
      ticket.duplicateCount = 1;
      unique.push(ticket);
    }
  }

  return { unique, duplicateMap };
}

/**
 * Main ingestion function.
 */
function ingestCSV(csvPath, outputDir) {
  console.log(`Reading CSV from: ${csvPath}`);

  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    relax_quotes: true,
  });

  console.log(`Parsed ${records.length} tickets from CSV`);

  const stats = {
    total: records.length,
    skipped: 0,
    bugs: 0,
    featureRequests: 0,
    nonEnglish: 0,
    duplicates: 0,
    processed: 0,
  };

  const skippedTickets = [];
  const bugTickets = [];
  const featureTickets = [];
  const processedTickets = [];

  for (const record of records) {
    const ticket = {
      id: record[columnMapping.ticketId],
      subject: (record[columnMapping.subject] || '').replace(/^Re:\s*/i, '').trim(),
      rawDescription: record[columnMapping.description] || '',
      status: record[columnMapping.status],
      type: record[columnMapping.type],
      agent: record[columnMapping.agent],
      group: record[columnMapping.group],
      createdTime: record[columnMapping.createdTime],
      closedTime: record[columnMapping.closedTime],
      agentInteractions: record[columnMapping.agentInteractions],
      customer: record[columnMapping.tags] || '', // Tags = customer org names
      email: record[columnMapping.email],
    };

    // Route bugs and feature requests to separate reports
    if (BUG_TYPES.includes(ticket.type)) {
      bugTickets.push(ticket);
      stats.bugs++;
      continue;
    }
    if (FEATURE_TYPES.includes(ticket.type)) {
      featureTickets.push(ticket);
      stats.featureRequests++;
      continue;
    }

    // Check if ticket should be skipped
    const skipCheck = shouldSkipTicket(ticket);
    if (skipCheck.skip) {
      skippedTickets.push({ ...ticket, skipReason: skipCheck.reason });
      stats.skipped++;
      continue;
    }

    // Clean the description
    ticket.cleanedDescription = cleanDescription(ticket.rawDescription);

    // Extract original customer question
    ticket.originalQuestion = extractOriginalQuestion(
      ticket.cleanedDescription,
      ticket.subject
    );

    // Flag non-English content
    ticket.nonEnglish = detectNonEnglish(ticket.originalQuestion);
    if (ticket.nonEnglish) {
      stats.nonEnglish++;
    }

    // Remove rawDescription to save space in output
    delete ticket.rawDescription;

    processedTickets.push(ticket);
  }

  // Deduplicate
  const { unique, duplicateMap } = deduplicateTickets(processedTickets);
  stats.duplicates = processedTickets.length - unique.length;
  stats.processed = unique.length;

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Write outputs
  const outputPath = path.join(outputDir, 'cleaned-queries.json');
  fs.writeFileSync(outputPath, JSON.stringify(unique, null, 2));
  console.log(`Wrote ${unique.length} cleaned queries to ${outputPath}`);

  if (bugTickets.length > 0) {
    const bugPath = path.join(outputDir, 'bug-tickets.json');
    fs.writeFileSync(bugPath, JSON.stringify(bugTickets, null, 2));
    console.log(`Wrote ${bugTickets.length} bug tickets to ${bugPath}`);
  }

  if (featureTickets.length > 0) {
    const featurePath = path.join(outputDir, 'feature-requests.json');
    fs.writeFileSync(featurePath, JSON.stringify(featureTickets, null, 2));
    console.log(`Wrote ${featureTickets.length} feature requests to ${featurePath}`);
  }

  // Write stats
  console.log('\n--- Ingestion Summary ---');
  console.log(`Total tickets:      ${stats.total}`);
  console.log(`Processed (unique): ${stats.processed}`);
  console.log(`Skipped:            ${stats.skipped}`);
  console.log(`Duplicates removed: ${stats.duplicates}`);
  console.log(`Bugs (separate):    ${stats.bugs}`);
  console.log(`Feature Reqs:       ${stats.featureRequests}`);
  console.log(`Non-English flagged:${stats.nonEnglish}`);

  return {
    cleanedQueries: unique,
    bugTickets,
    featureTickets,
    skippedTickets,
    stats,
    duplicateMap: Object.fromEntries(duplicateMap),
  };
}

// CLI usage
if (require.main === module) {
  const csvPath = process.argv[2];
  const outputDir = process.argv[3] || path.join(__dirname, '../../data');

  if (!csvPath) {
    console.log('Usage: node ingest-csv.js <csv-path> [output-dir]');
    console.log('Example: node ingest-csv.js freshdesk/tickets.csv data/');
    process.exit(1);
  }

  const resolvedPath = path.resolve(csvPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  ingestCSV(resolvedPath, path.resolve(outputDir));
}

module.exports = { ingestCSV, cleanDescription, extractOriginalQuestion };
