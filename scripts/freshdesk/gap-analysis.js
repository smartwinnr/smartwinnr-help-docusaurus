#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const stringSimilarity = require('string-similarity');

const DOCS_ROOT = path.join(__dirname, '../../docs');

/**
 * Load all existing doc metadata from frontmatter.
 */
function loadExistingDocs(docsRoot) {
  const docs = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const { data: frontmatter, content: body } = matter(content);
          docs.push({
            path: path.relative(docsRoot, fullPath),
            fullPath,
            title: frontmatter.title || entry.name.replace(/\.mdx?$/, ''),
            description: frontmatter.description || '',
            slug: frontmatter.slug || '',
            category: path.relative(docsRoot, dir).split(path.sep)[0],
            // Extract first 500 chars of body for keyword matching
            bodyPreview: body.replace(/[#*_\[\]()]/g, '').substring(0, 500).toLowerCase(),
          });
        } catch (err) {
          // Skip files that can't be parsed
        }
      }
    }
  }

  walk(docsRoot);
  return docs;
}

/**
 * Search for matching existing docs for a cluster.
 */
function findMatchingDocs(cluster, existingDocs) {
  const matches = [];
  const clusterTerms = `${cluster.topic} ${cluster.representativeQuery || ''}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  for (const doc of existingDocs) {
    // 1. Exact title match
    const titleSimilarity = stringSimilarity.compareTwoStrings(
      cluster.topic.toLowerCase(),
      doc.title.toLowerCase()
    );

    // 2. Keyword overlap with doc body
    const docText = `${doc.title} ${doc.description} ${doc.bodyPreview}`.toLowerCase();
    const matchingTerms = clusterTerms.filter((term) =>
      docText.includes(term)
    );
    const keywordScore =
      clusterTerms.length > 0 ? matchingTerms.length / clusterTerms.length : 0;

    // Combined score
    const combinedScore = titleSimilarity * 0.6 + keywordScore * 0.4;

    if (combinedScore > 0.25) {
      matches.push({
        docPath: doc.path,
        docTitle: doc.title,
        titleSimilarity: Math.round(titleSimilarity * 100) / 100,
        keywordScore: Math.round(keywordScore * 100) / 100,
        combinedScore: Math.round(combinedScore * 100) / 100,
        matchingTerms,
      });
    }
  }

  return matches.sort((a, b) => b.combinedScore - a.combinedScore);
}

/**
 * Classify a cluster's coverage status.
 */
function classifyCoverage(cluster, matches) {
  if (matches.length === 0) {
    return {
      status: 'GAP',
      reason: 'No existing doc covers this topic',
      bestMatch: null,
    };
  }

  const bestMatch = matches[0];

  if (bestMatch.combinedScore > 0.7) {
    return {
      status: 'COVERED',
      reason: `Existing doc "${bestMatch.docTitle}" fully addresses this topic`,
      bestMatch,
      improvementCandidate:
        cluster.queryCount >= 3
          ? 'High query volume suggests doc may be unclear or hard to find'
          : null,
    };
  }

  if (bestMatch.combinedScore > 0.4) {
    return {
      status: 'PARTIALLY_COVERED',
      reason: `Existing doc "${bestMatch.docTitle}" touches this topic but may miss the specific angle`,
      bestMatch,
    };
  }

  return {
    status: 'GAP',
    reason: 'No existing doc adequately covers this topic',
    bestMatch,
  };
}

/**
 * Run gap analysis on clusters against existing docs.
 */
function runGapAnalysis(clustersPath, outputDir, docsRoot) {
  docsRoot = docsRoot || DOCS_ROOT;

  console.log('Loading existing docs...');
  const existingDocs = loadExistingDocs(docsRoot);
  console.log(`Found ${existingDocs.length} existing documentation files`);

  console.log('Loading clusters...');
  const clusters = JSON.parse(fs.readFileSync(clustersPath, 'utf8'));
  console.log(`Analyzing ${clusters.length} clusters`);

  const results = [];

  for (const cluster of clusters) {
    const matches = findMatchingDocs(cluster, existingDocs);
    const coverage = classifyCoverage(cluster, matches);

    results.push({
      topic: cluster.topic,
      category: cluster.category,
      queryCount: cluster.queryCount,
      priority: cluster.priority,
      coverage: coverage.status,
      reason: coverage.reason,
      bestMatch: coverage.bestMatch,
      improvementCandidate: coverage.improvementCandidate || null,
      topMatches: matches.slice(0, 3),
      queryIds: cluster.queryIds,
      representativeQuery: cluster.representativeQuery,
      queries: cluster.queries,
    });
  }

  // Stats
  const stats = {
    total: results.length,
    gap: results.filter((r) => r.coverage === 'GAP').length,
    partiallyCovered: results.filter((r) => r.coverage === 'PARTIALLY_COVERED')
      .length,
    covered: results.filter((r) => r.coverage === 'COVERED').length,
    improvementCandidates: results.filter((r) => r.improvementCandidate)
      .length,
  };

  // Write JSON report
  fs.mkdirSync(outputDir, { recursive: true });
  const jsonPath = path.join(outputDir, 'gap-report.json');
  fs.writeFileSync(
    jsonPath,
    JSON.stringify({ stats, results }, null, 2)
  );
  console.log(`\nWrote gap report to ${jsonPath}`);

  // Write human-readable markdown report
  const mdReport = generateMarkdownReport(results, stats);
  const mdPath = path.join(outputDir, 'FRESHDESK-GAP-ANALYSIS.md');
  fs.writeFileSync(mdPath, mdReport);
  console.log(`Wrote gap analysis report to ${mdPath}`);

  // Summary
  console.log('\n--- Gap Analysis Summary ---');
  console.log(`Total clusters:        ${stats.total}`);
  console.log(`GAP (new article):     ${stats.gap}`);
  console.log(`PARTIALLY_COVERED:     ${stats.partiallyCovered}`);
  console.log(`COVERED:               ${stats.covered}`);
  console.log(`Improvement candidates:${stats.improvementCandidates}`);

  return { stats, results };
}

/**
 * Generate markdown report.
 */
function generateMarkdownReport(results, stats) {
  const lines = [
    '# Freshdesk Gap Analysis Report',
    '',
    `Generated: ${new Date().toISOString().split('T')[0]}`,
    '',
    '## Summary',
    '',
    `| Metric | Count |`,
    `|--------|-------|`,
    `| Total Clusters | ${stats.total} |`,
    `| New Articles Needed (GAP) | ${stats.gap} |`,
    `| Enhancement Needed (PARTIAL) | ${stats.partiallyCovered} |`,
    `| Already Covered | ${stats.covered} |`,
    `| Improvement Candidates | ${stats.improvementCandidates} |`,
    '',
    '---',
    '',
  ];

  // GAP section
  const gaps = results.filter((r) => r.coverage === 'GAP');
  if (gaps.length > 0) {
    lines.push('## New Articles Needed (GAP)');
    lines.push('');
    lines.push(
      'These topics are not covered by existing documentation and need new articles.'
    );
    lines.push('');

    for (const gap of gaps.sort((a, b) => b.queryCount - a.queryCount)) {
      lines.push(
        `### ${gap.topic} [${gap.priority.toUpperCase()}] (${gap.queryCount} queries)`
      );
      lines.push('');
      lines.push(`- **Category**: ${gap.category}`);
      lines.push(`- **Representative query**: ${gap.representativeQuery}`);
      if (gap.bestMatch) {
        lines.push(
          `- **Closest existing doc**: ${gap.bestMatch.docTitle} (score: ${gap.bestMatch.combinedScore})`
        );
      }
      lines.push('');
    }
  }

  // PARTIALLY_COVERED section
  const partial = results.filter((r) => r.coverage === 'PARTIALLY_COVERED');
  if (partial.length > 0) {
    lines.push('## Enhancement Needed (PARTIALLY COVERED)');
    lines.push('');
    lines.push(
      'These topics have related docs but need enhancement to fully address user queries.'
    );
    lines.push('');

    for (const p of partial.sort((a, b) => b.queryCount - a.queryCount)) {
      lines.push(
        `### ${p.topic} [${p.priority.toUpperCase()}] (${p.queryCount} queries)`
      );
      lines.push('');
      lines.push(`- **Category**: ${p.category}`);
      lines.push(`- **Existing doc**: ${p.bestMatch?.docPath || 'N/A'}`);
      lines.push(`- **Match score**: ${p.bestMatch?.combinedScore || 'N/A'}`);
      lines.push(`- **Representative query**: ${p.representativeQuery}`);
      lines.push('');
    }
  }

  // COVERED with improvement candidates
  const improvable = results.filter(
    (r) => r.coverage === 'COVERED' && r.improvementCandidate
  );
  if (improvable.length > 0) {
    lines.push('## Improvement Candidates (COVERED but high query volume)');
    lines.push('');
    lines.push(
      'These topics are covered but receive many queries, suggesting the docs may be unclear or hard to find.'
    );
    lines.push('');

    for (const imp of improvable) {
      lines.push(`- **${imp.topic}** (${imp.queryCount} queries) - Doc: ${imp.bestMatch?.docPath}`);
      lines.push(`  - ${imp.improvementCandidate}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// CLI usage
if (require.main === module) {
  const clustersPath =
    process.argv[2] || path.join(__dirname, '../../data/clusters.json');
  const outputDir = process.argv[3] || path.join(__dirname, 'output');

  runGapAnalysis(path.resolve(clustersPath), path.resolve(outputDir));
}

module.exports = { runGapAnalysis, loadExistingDocs, findMatchingDocs };
