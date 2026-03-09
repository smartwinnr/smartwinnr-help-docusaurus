#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const uiTerms = require('./config/ui-terms.json');

// Validation rules
const REQUIRED_FRONTMATTER = ['title', 'description', 'slug', 'sidebar_position', 'last_update'];

/**
 * Validate a single article file.
 */
function validateArticle(filePath, existingTitles = []) {
  const issues = [];
  const warnings = [];

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return { filePath, valid: false, issues: [`Cannot read file: ${err.message}`], warnings: [] };
  }

  // Check for code-fence wrapping around frontmatter
  if (/^\s*```(?:yaml|yml)?/.test(content)) {
    issues.push('Frontmatter wrapped in code fence -- will not be parsed by Docusaurus');
  }

  let frontmatter, body;
  try {
    const parsed = matter(content);
    frontmatter = parsed.data;
    body = parsed.content;
  } catch (err) {
    return { filePath, valid: false, issues: [`Invalid frontmatter: ${err.message}`, ...issues], warnings: [] };
  }

  // 1. Frontmatter validation
  for (const field of REQUIRED_FRONTMATTER) {
    if (field === 'last_update') {
      if (!frontmatter.last_update || !frontmatter.last_update.date) {
        issues.push(`Missing frontmatter field: ${field}.date`);
      }
    } else if (!frontmatter[field] && frontmatter[field] !== 0) {
      issues.push(`Missing frontmatter field: ${field}`);
    }
  }

  const title = frontmatter.title || '';

  // 2. Title format: starts with verb, 5-8 words, Title Case
  if (title) {
    const titleWords = title.split(/\s+/);

    if (titleWords.length < 3 || titleWords.length > 10) {
      warnings.push(
        `Title word count (${titleWords.length}) outside recommended range of 5-8 words: "${title}"`
      );
    }

    // Check Title Case (first letter of major words should be uppercase)
    const minorWords = new Set([
      'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at',
      'to', 'from', 'by', 'in', 'of', 'with', 'as',
    ]);
    for (let i = 0; i < titleWords.length; i++) {
      const word = titleWords[i];
      if (i === 0 || !minorWords.has(word.toLowerCase())) {
        if (word[0] && word[0] !== word[0].toUpperCase()) {
          warnings.push(`Title not in Title Case: "${word}" in "${title}"`);
          break;
        }
      }
    }

    // Check starts with a verb (heuristic: common action verbs)
    const actionVerbs = [
      'access', 'add', 'assign', 'build', 'change', 'check', 'configure', 'connect',
      'create', 'customize', 'delete', 'download', 'edit', 'enable', 'export',
      'filter', 'find', 'generate', 'get', 'import', 'install', 'launch', 'manage',
      'monitor', 'navigate', 'optimize', 'organize', 'publish', 'remove', 'reset',
      'resolve', 'review', 'run', 'schedule', 'search', 'send', 'set', 'setup',
      'share', 'start', 'submit', 'sync', 'track', 'transfer', 'troubleshoot',
      'understand', 'update', 'upgrade', 'upload', 'use', 'view',
    ];
    const firstWord = titleWords[0]?.toLowerCase();
    if (!actionVerbs.includes(firstWord)) {
      warnings.push(
        `Title may not be action-oriented (first word "${firstWord}"): "${title}"`
      );
    }

    // 3. Duplicate title check
    if (existingTitles.includes(title.toLowerCase())) {
      issues.push(`Duplicate title: "${title}" already exists in documentation`);
    }
  }

  // 4. Sentence length check
  const sentences = body
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/^>.*$/gm, '') // Remove blockquotes
    .replace(/^#+\s.*$/gm, '') // Remove headings
    .replace(/^\s*[-*]\s/gm, '') // Remove list markers
    .split(/[.!?]\s+/)
    .filter((s) => s.trim().length > 10);

  const longSentences = sentences.filter(
    (s) => s.split(/\s+/).length > 25
  );
  if (longSentences.length > 0) {
    warnings.push(
      `${longSentences.length} sentence(s) exceed 20 words (max found: ${Math.max(
        ...longSentences.map((s) => s.split(/\s+/).length)
      )} words)`
    );
  }

  // 5. UI terms bold check
  const allUITerms = [
    ...uiTerms.buttons,
    ...uiTerms.navigation,
    ...uiTerms.features,
  ];
  const unboldedTerms = [];
  for (const term of allUITerms) {
    // Check if term appears in body but NOT bolded
    const termRegex = new RegExp(`(?<!\\*\\*)\\b${escapeRegex(term)}\\b(?!\\*\\*)`, 'g');
    const boldRegex = new RegExp(`\\*\\*${escapeRegex(term)}\\*\\*`, 'g');

    const plainMatches = (body.match(termRegex) || []).length;
    const boldMatches = (body.match(boldRegex) || []).length;

    if (plainMatches > 0 && boldMatches === 0) {
      unboldedTerms.push(term);
    }
  }
  if (unboldedTerms.length > 0) {
    warnings.push(
      `UI terms not bolded: ${unboldedTerms.slice(0, 5).join(', ')}${unboldedTerms.length > 5 ? ` (+${unboldedTerms.length - 5} more)` : ''}`
    );
  }

  // 6. Link validation - check that referenced docs exist
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(body)) !== null) {
    const linkTarget = match[2];
    // Only check relative links (not URLs)
    if (!linkTarget.startsWith('http') && !linkTarget.startsWith('#')) {
      const resolvedPath = path.resolve(
        path.dirname(filePath),
        linkTarget
      );
      if (
        !fs.existsSync(resolvedPath) &&
        !fs.existsSync(resolvedPath + '.md') &&
        !fs.existsSync(resolvedPath + '.mdx')
      ) {
        warnings.push(`Broken link: ${linkTarget}`);
      }
    }
  }

  return {
    filePath: path.basename(filePath),
    valid: issues.length === 0,
    issues,
    warnings,
    title,
  };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validate all generated articles in a directory.
 */
function validateAll(articlesDir, docsRoot) {
  // Load existing titles for duplicate detection
  const existingTitles = [];
  if (docsRoot && fs.existsSync(docsRoot)) {
    function walkTitles(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkTitles(fullPath);
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const { data } = matter(content);
            if (data.title) existingTitles.push(data.title.toLowerCase());
          } catch {}
        }
      }
    }
    walkTitles(docsRoot);
  }

  const results = [];
  const dirs = [
    path.join(articlesDir, 'new-articles'),
    path.join(articlesDir, 'enhancements'),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const filePath = path.join(dir, file);
      const result = validateArticle(filePath, existingTitles);
      result.directory = path.basename(dir);
      results.push(result);
    }
  }

  // Write validation report
  const reportPath = path.join(articlesDir, 'validation-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: results.length,
    valid: results.filter((r) => r.valid).length,
    invalid: results.filter((r) => !r.valid).length,
    totalIssues: results.reduce((sum, r) => sum + r.issues.length, 0),
    totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
    results,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Print summary
  console.log('\n--- Validation Summary ---');
  console.log(`Files validated:  ${report.totalFiles}`);
  console.log(`Valid:            ${report.valid}`);
  console.log(`Invalid:          ${report.invalid}`);
  console.log(`Total issues:     ${report.totalIssues}`);
  console.log(`Total warnings:   ${report.totalWarnings}`);

  if (report.invalid > 0) {
    console.log('\nInvalid files:');
    for (const r of results.filter((r) => !r.valid)) {
      console.log(`  ${r.filePath}:`);
      for (const issue of r.issues) {
        console.log(`    - ${issue}`);
      }
    }
  }

  if (report.totalWarnings > 0) {
    console.log('\nWarnings:');
    for (const r of results.filter((r) => r.warnings.length > 0)) {
      console.log(`  ${r.filePath}:`);
      for (const warning of r.warnings) {
        console.log(`    - ${warning}`);
      }
    }
  }

  return report;
}

// CLI usage
if (require.main === module) {
  const articlesDir =
    process.argv[2] || path.join(__dirname, 'output');
  const docsRoot =
    process.argv[3] || path.join(__dirname, '../../docs');

  validateAll(path.resolve(articlesDir), path.resolve(docsRoot));
}

module.exports = { validateArticle, validateAll };
