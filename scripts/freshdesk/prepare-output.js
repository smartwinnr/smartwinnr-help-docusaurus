#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const slugify = require('slugify');

const { ADMIN_SUBCATEGORY_MAP, resolveAdminSubcategory } = require('./generate-articles');

const DOCS_ROOT = path.join(__dirname, '../../docs');

/**
 * Copy new articles to their target category directories in docs/.
 */
function copyNewArticles(articlesDir, docsRoot, dryRun = false) {
  const newArticlesDir = path.join(articlesDir, 'new-articles');
  if (!fs.existsSync(newArticlesDir)) return [];

  const copied = [];
  const files = fs.readdirSync(newArticlesDir).filter((f) => f.endsWith('.md'));

  for (const file of files) {
    const filePath = path.join(newArticlesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    let category = 'uncategorized';
    try {
      // Try to read category from generation-results
      const resultsPath = path.join(articlesDir, 'generation-results.json');
      if (fs.existsSync(resultsPath)) {
        const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
        const match = results.newArticles?.find((a) => a.filename === file);
        if (match?.category) category = match.category;
      }
    } catch {}

    // Fallback: try frontmatter slug for category hint
    try {
      const { data } = matter(content);
      if (data.category) category = data.category;
    } catch {}

    // For administration articles, route to the correct subdirectory
    let targetCategory = category;
    if (category === 'administration') {
      // First check if generation-results has a subcategory
      let subcategory = null;
      try {
        const resultsPath2 = path.join(articlesDir, 'generation-results.json');
        if (fs.existsSync(resultsPath2)) {
          const results2 = JSON.parse(fs.readFileSync(resultsPath2, 'utf8'));
          const match2 = results2.newArticles?.find((a) => a.filename === file);
          if (match2?.subcategory) subcategory = match2.subcategory;
        }
      } catch {}

      // Fallback: resolve from title/filename keywords
      if (!subcategory) {
        const titleText = file.replace(/-/g, ' ').replace('.md', '');
        subcategory = resolveAdminSubcategory(titleText);
      }

      targetCategory = subcategory;
    }

    const targetDir = path.join(docsRoot, targetCategory);
    const targetPath = path.join(targetDir, file);

    if (dryRun) {
      console.log(`[DRY RUN] Would copy: ${file} -> ${path.relative(docsRoot, targetPath)}`);
    } else {
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(targetPath, content);
      console.log(`Copied: ${file} -> ${path.relative(docsRoot, targetPath)}`);
    }

    copied.push({
      source: file,
      target: path.relative(docsRoot, targetPath),
      category,
    });
  }

  return copied;
}

/**
 * Generate KB structure recommendations based on cluster analysis.
 */
function generateRecommendations(gapReportPath, outputDir) {
  const gapReport = JSON.parse(fs.readFileSync(gapReportPath, 'utf8'));
  const results = gapReport.results || [];

  const lines = [
    '# KB Structure Recommendations',
    '',
    `Generated: ${new Date().toISOString().split('T')[0]}`,
    '',
    'Based on analysis of Freshdesk support tickets against existing documentation.',
    '',
  ];

  // 1. High-frequency topics needing prominent placement
  const highFreq = results
    .filter((r) => r.queryCount >= 5)
    .sort((a, b) => b.queryCount - a.queryCount);

  if (highFreq.length > 0) {
    lines.push('## High-Demand Topics');
    lines.push('');
    lines.push('These topics have 5+ support queries and need prominent placement or dedicated sections.');
    lines.push('');
    lines.push('| Topic | Queries | Category | Status |');
    lines.push('|-------|---------|----------|--------|');
    for (const r of highFreq) {
      lines.push(
        `| ${r.topic} | ${r.queryCount} | ${r.category} | ${r.coverage} |`
      );
    }
    lines.push('');
  }

  // 2. Category gaps
  const categoryCounts = {};
  for (const r of results) {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + r.queryCount;
  }
  const uncategorizedCount = categoryCounts['uncategorized'] || 0;

  if (uncategorizedCount > 10) {
    lines.push('## Category Gap Detected');
    lines.push('');
    lines.push(
      `${uncategorizedCount} queries fall outside existing categories. Consider creating new documentation sections for these topics.`
    );
    lines.push('');
  }

  // 3. Cross-category topics
  const topicCategories = {};
  for (const r of results) {
    const key = r.topic.toLowerCase().split(' ').slice(0, 3).join(' ');
    if (!topicCategories[key]) topicCategories[key] = new Set();
    topicCategories[key].add(r.category);
  }
  const crossCategory = Object.entries(topicCategories).filter(
    ([_, cats]) => cats.size > 1
  );

  if (crossCategory.length > 0) {
    lines.push('## Cross-Category Topics');
    lines.push('');
    lines.push(
      'These topics span multiple categories. Consider a "Common Workflows" section.'
    );
    lines.push('');
    for (const [topic, cats] of crossCategory) {
      lines.push(`- **${topic}**: spans ${Array.from(cats).join(', ')}`);
    }
    lines.push('');
  }

  // 4. FAQ candidates (single-query clusters with simple answers)
  const faqCandidates = results.filter(
    (r) => r.queryCount <= 2 && r.coverage === 'GAP'
  );
  if (faqCandidates.length > 5) {
    lines.push('## FAQ Section Candidates');
    lines.push('');
    lines.push(
      `${faqCandidates.length} topics have 1-2 queries each. Consider consolidating into an FAQ page instead of individual articles.`
    );
    lines.push('');
    for (const faq of faqCandidates.slice(0, 15)) {
      lines.push(`- ${faq.topic} (${faq.representativeQuery})`);
    }
    if (faqCandidates.length > 15) {
      lines.push(`- ... and ${faqCandidates.length - 15} more`);
    }
    lines.push('');
  }

  // 5. Category distribution
  lines.push('## Query Distribution by Category');
  lines.push('');
  lines.push('| Category | Total Queries | Clusters |');
  lines.push('|----------|---------------|----------|');
  const catEntries = Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1]
  );
  for (const [cat, count] of catEntries) {
    const clusterCount = results.filter((r) => r.category === cat).length;
    lines.push(`| ${cat} | ${count} | ${clusterCount} |`);
  }
  lines.push('');

  const content = lines.join('\n');
  const outputPath = path.join(outputDir, 'KB-STRUCTURE-RECOMMENDATIONS.md');
  fs.writeFileSync(outputPath, content);
  console.log(`Wrote recommendations to ${outputPath}`);

  return content;
}

/**
 * Generate processing summary.
 */
function generateSummary(outputDir, stats) {
  const lines = [
    '# Freshdesk Processing Summary',
    '',
    `Generated: ${new Date().toISOString().split('T')[0]}`,
    '',
    '## Pipeline Statistics',
    '',
    `| Stage | Metric | Value |`,
    `|-------|--------|-------|`,
  ];

  if (stats.ingestion) {
    lines.push(`| Ingestion | Total tickets | ${stats.ingestion.total} |`);
    lines.push(`| Ingestion | Processed | ${stats.ingestion.processed} |`);
    lines.push(`| Ingestion | Skipped | ${stats.ingestion.skipped} |`);
    lines.push(`| Ingestion | Bugs (excluded) | ${stats.ingestion.bugs} |`);
    lines.push(`| Ingestion | Feature Requests (excluded) | ${stats.ingestion.featureRequests} |`);
    lines.push(`| Ingestion | Duplicates removed | ${stats.ingestion.duplicates} |`);
  }

  if (stats.clustering) {
    lines.push(`| Clustering | Total clusters | ${stats.clustering.total} |`);
  }

  if (stats.gapAnalysis) {
    lines.push(`| Gap Analysis | GAP (new articles) | ${stats.gapAnalysis.gap} |`);
    lines.push(`| Gap Analysis | PARTIALLY_COVERED | ${stats.gapAnalysis.partiallyCovered} |`);
    lines.push(`| Gap Analysis | COVERED | ${stats.gapAnalysis.covered} |`);
  }

  if (stats.generation) {
    lines.push(`| Generation | New articles | ${stats.generation.newArticles} |`);
    lines.push(`| Generation | Enhancements | ${stats.generation.enhancements} |`);
    lines.push(`| Generation | Errors | ${stats.generation.errors} |`);
  }

  if (stats.validation) {
    lines.push(`| Validation | Valid | ${stats.validation.valid} |`);
    lines.push(`| Validation | Invalid | ${stats.validation.invalid} |`);
    lines.push(`| Validation | Warnings | ${stats.validation.totalWarnings} |`);
  }

  lines.push('');

  const content = lines.join('\n');
  const outputPath = path.join(outputDir, 'FRESHDESK-PROCESSING-SUMMARY.md');
  fs.writeFileSync(outputPath, content);
  console.log(`Wrote processing summary to ${outputPath}`);

  return content;
}

/**
 * Main prepare-output function.
 */
function prepareOutput(outputDir, options = {}) {
  const docsRoot = options.docsRoot || DOCS_ROOT;
  const dryRun = options.dryRun || false;

  console.log('\n--- Preparing Output ---');

  // 1. Copy new articles to docs/
  if (!dryRun) {
    const copied = copyNewArticles(outputDir, docsRoot, dryRun);
    console.log(`\nCopied ${copied.length} new articles to docs/`);
  } else {
    console.log('\n[DRY RUN] Skipping article copy to docs/');
    copyNewArticles(outputDir, docsRoot, true);
  }

  // 2. Generate recommendations
  const gapReportPath = path.join(
    options.dataDir || path.join(__dirname, '../../data'),
    'gap-report.json'
  );
  if (fs.existsSync(gapReportPath)) {
    generateRecommendations(gapReportPath, outputDir);
  }

  // 3. Generate summary
  const statsPath = path.join(outputDir, 'pipeline-stats.json');
  const stats = fs.existsSync(statsPath)
    ? JSON.parse(fs.readFileSync(statsPath, 'utf8'))
    : {};
  generateSummary(outputDir, stats);

  console.log('\nOutput preparation complete.');
}

// CLI usage
if (require.main === module) {
  const outputDir =
    process.argv[2] || path.join(__dirname, 'output');
  const dryRun = process.argv.includes('--dry-run');

  prepareOutput(path.resolve(outputDir), { dryRun });
}

module.exports = { prepareOutput, copyNewArticles, generateRecommendations, generateSummary };
