#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity');

const categoryKeywords = require('./config/category-keywords.json');
const { resolveAdminSubcategory } = require('./generate-articles');

// Type-to-category mapping based on Freshdesk Type field
const TYPE_CATEGORY_MAP = {
  'User Mgmt': ['administration', 'getting-started'],
  'Config': ['administration'],
  'Knowledge Provided': null, // Needs keyword-based sub-clustering
  'Setup Change': ['administration'],
  'Reports': ['reports', 'analytics-reporting'],
  'Integration': ['administration'],
  'Data': ['administration', 'reports'],
};

/**
 * Score a query against a category's keywords.
 * Returns a score 0-1 indicating match strength.
 */
function scoreCategory(query, categoryName) {
  const config = categoryKeywords[categoryName];
  if (!config) return 0;

  const text = `${query.subject} ${query.cleanedDescription || ''}`.toLowerCase();
  let matchCount = 0;
  let totalWeight = 0;

  for (const keyword of config.keywords) {
    totalWeight++;
    if (text.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }

  return totalWeight > 0 ? matchCount / totalWeight : 0;
}

/**
 * Find the best matching category for a query using keywords.
 */
function findBestCategory(query) {
  let bestCategory = null;
  let bestScore = 0;

  for (const categoryName of Object.keys(categoryKeywords)) {
    const score = scoreCategory(query, categoryName);
    if (score > bestScore) {
      bestScore = score;
      bestCategory = categoryName;
    }
  }

  return { category: bestCategory, score: bestScore };
}

/**
 * Pass 1: Rule-based pre-clustering using Type field and keyword matching.
 */
function ruleBasedClustering(queries) {
  const clusters = new Map(); // topic -> cluster data
  const uncategorized = [];

  for (const query of queries) {
    const type = query.type || '';
    let assignedCategory = null;

    // Try Type-based mapping first
    if (TYPE_CATEGORY_MAP[type]) {
      assignedCategory = TYPE_CATEGORY_MAP[type][0];
    }

    // For "Knowledge Provided" or unmapped types, use keyword matching
    if (!assignedCategory || type === 'Knowledge Provided') {
      const { category, score } = findBestCategory(query);
      if (score >= 0.05) {
        assignedCategory = category;
      }
    }

    if (!assignedCategory) {
      uncategorized.push(query);
      continue;
    }

    // Create sub-topic key from subject normalization
    const topicKey = normalizeTopicKey(query.subject, assignedCategory);

    if (!clusters.has(topicKey)) {
      const topicName = generateTopicName(query.subject);
      clusters.set(topicKey, {
        topic: topicName,
        category: assignedCategory,
        subcategory: assignedCategory === 'administration'
          ? resolveAdminSubcategory(topicName)
          : null,
        queryIds: [],
        queries: [],
        queryCount: 0,
        representativeQuery: query.subject,
        type: type,
      });
    }

    const cluster = clusters.get(topicKey);
    cluster.queryIds.push(query.id);
    cluster.queries.push({
      id: query.id,
      subject: query.subject,
      description: query.cleanedDescription?.substring(0, 500),
      originalQuestion: query.originalQuestion?.substring(0, 500),
    });
    cluster.queryCount++;
  }

  return { clusters, uncategorized };
}

/**
 * Normalize a subject line into a topic key for clustering similar queries.
 */
function normalizeTopicKey(subject, category) {
  return `${category}::${subject
    .toLowerCase()
    .replace(/^re:\s*/i, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 6)
    .join(' ')}`;
}

/**
 * Generate a human-readable topic name from a subject line.
 */
function generateTopicName(subject) {
  return subject
    .replace(/^(?:Re|Fw|Fwd):\s*/gi, '')
    .replace(/\s*\[.*?\]\s*/g, '')
    .trim();
}

/**
 * Pass 2: AI-based semantic clustering for uncategorized queries.
 * Calls Claude API in batches.
 */
async function aiClustering(uncategorized, options = {}) {
  if (uncategorized.length === 0) return [];

  const model = options.clusterModel || 'claude-sonnet-4-20250514';
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.log(
      'ANTHROPIC_API_KEY not set. Skipping AI clustering. Uncategorized queries will be placed in "uncategorized" cluster.'
    );
    return [
      {
        topic: 'Uncategorized Support Queries',
        category: 'uncategorized',
        queryIds: uncategorized.map((q) => q.id),
        queries: uncategorized.map((q) => ({
          id: q.id,
          subject: q.subject,
          description: q.cleanedDescription?.substring(0, 500),
        })),
        queryCount: uncategorized.length,
        representativeQuery: uncategorized[0]?.subject,
        type: 'mixed',
      },
    ];
  }

  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey });
  const aiClusters = [];

  // Process in batches of 25
  const batchSize = 25;
  for (let i = 0; i < uncategorized.length; i += batchSize) {
    const batch = uncategorized.slice(i, i + batchSize);
    const querySummaries = batch
      .map((q) => `- [${q.id}] ${q.subject}: ${(q.originalQuestion || q.cleanedDescription || '').substring(0, 200)}`)
      .join('\n');

    const categories = Object.keys(categoryKeywords).join(', ');

    console.log(
      `AI clustering batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(uncategorized.length / batchSize)} (${batch.length} queries)...`
    );

    try {
      const response = await client.messages.create({
        model,
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `You are analyzing customer support queries for SmartWinnr, a sales enablement platform. Group these queries into coherent documentation topics.

Available KB categories: ${categories}

Queries:
${querySummaries}

For each group, respond in this exact JSON format (no markdown, just JSON array):
[
  {
    "topic": "Short descriptive topic name",
    "category": "best matching category from the list above, or 'uncategorized'",
    "query_ids": ["id1", "id2"],
    "representative_query": "Most representative query subject"
  }
]`,
          },
        ],
      });

      const responseText = response.content[0]?.text || '[]';
      // Extract JSON from response (handle potential markdown wrapping)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        for (const group of parsed) {
          const matchingQueries = batch.filter((q) =>
            group.query_ids.includes(q.id)
          );
          const groupCategory = group.category || 'uncategorized';
          aiClusters.push({
            topic: group.topic,
            category: groupCategory,
            subcategory: groupCategory === 'administration'
              ? resolveAdminSubcategory(group.topic)
              : null,
            queryIds: group.query_ids,
            queries: matchingQueries.map((q) => ({
              id: q.id,
              subject: q.subject,
              description: q.cleanedDescription?.substring(0, 500),
            })),
            queryCount: group.query_ids.length,
            representativeQuery: group.representative_query,
            type: 'ai-clustered',
          });
        }
      }
    } catch (err) {
      console.error(`AI clustering batch failed: ${err.message}`);
      // Fallback: put remaining in uncategorized
      aiClusters.push({
        topic: 'Uncategorized Support Queries',
        category: 'uncategorized',
        queryIds: batch.map((q) => q.id),
        queries: batch.map((q) => ({
          id: q.id,
          subject: q.subject,
          description: q.cleanedDescription?.substring(0, 500),
        })),
        queryCount: batch.length,
        representativeQuery: batch[0]?.subject,
        type: 'fallback',
      });
    }
  }

  return aiClusters;
}

/**
 * Merge similar clusters based on topic similarity.
 */
function mergeSimilarClusters(clusters, threshold = 0.6) {
  const merged = [];
  const used = new Set();

  const clusterArray = Array.from(clusters);

  for (let i = 0; i < clusterArray.length; i++) {
    if (used.has(i)) continue;

    let current = { ...clusterArray[i] };
    used.add(i);

    for (let j = i + 1; j < clusterArray.length; j++) {
      if (used.has(j)) continue;

      const other = clusterArray[j];
      if (current.category !== other.category) continue;

      const similarity = stringSimilarity.compareTwoStrings(
        current.topic.toLowerCase(),
        other.topic.toLowerCase()
      );

      if (similarity > threshold) {
        // Merge
        current.queryIds = [...current.queryIds, ...other.queryIds];
        current.queries = [...current.queries, ...other.queries];
        current.queryCount += other.queryCount;
        used.add(j);
      }
    }

    merged.push(current);
  }

  return merged;
}

/**
 * Assign priority based on query count and type.
 */
function assignPriority(cluster) {
  if (cluster.queryCount >= 10) return 'critical';
  if (cluster.queryCount >= 5) return 'high';
  if (cluster.queryCount >= 3) return 'medium';
  return 'low';
}

/**
 * Main clustering function.
 */
async function clusterQueries(inputPath, outputDir, options = {}) {
  console.log(`Loading cleaned queries from: ${inputPath}`);
  const queries = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  console.log(`Loaded ${queries.length} queries`);

  // Pass 1: Rule-based clustering
  console.log('\n--- Pass 1: Rule-based clustering ---');
  const { clusters: ruleBasedClusters, uncategorized } =
    ruleBasedClustering(queries);
  console.log(
    `Rule-based: ${ruleBasedClusters.size} clusters, ${uncategorized.length} uncategorized`
  );

  // Pass 2: AI clustering for uncategorized
  console.log('\n--- Pass 2: AI semantic clustering ---');
  const aiClusters = await aiClustering(uncategorized, options);
  console.log(`AI clustering: ${aiClusters.length} additional clusters`);

  // Combine all clusters
  const allClusters = [
    ...Array.from(ruleBasedClusters.values()),
    ...aiClusters,
  ];

  // Merge similar clusters
  console.log('\n--- Merging similar clusters ---');
  const mergedClusters = mergeSimilarClusters(allClusters);
  console.log(
    `After merging: ${mergedClusters.length} clusters (from ${allClusters.length})`
  );

  // Assign priorities and sort
  const finalClusters = mergedClusters
    .map((cluster) => ({
      ...cluster,
      priority: assignPriority(cluster),
      existingDocMatch: null, // Will be filled by gap-analysis
    }))
    .sort((a, b) => b.queryCount - a.queryCount);

  // Write output
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'clusters.json');
  fs.writeFileSync(outputPath, JSON.stringify(finalClusters, null, 2));
  console.log(`\nWrote ${finalClusters.length} clusters to ${outputPath}`);

  // Summary by category
  console.log('\n--- Cluster Summary by Category ---');
  const byCat = {};
  for (const c of finalClusters) {
    byCat[c.category] = (byCat[c.category] || 0) + 1;
  }
  for (const [cat, count] of Object.entries(byCat).sort(
    (a, b) => b[1] - a[1]
  )) {
    console.log(`  ${cat}: ${count} clusters`);
  }

  // Summary by priority
  console.log('\n--- Cluster Summary by Priority ---');
  const byPri = {};
  for (const c of finalClusters) {
    byPri[c.priority] = (byPri[c.priority] || 0) + 1;
  }
  for (const pri of ['critical', 'high', 'medium', 'low']) {
    if (byPri[pri]) console.log(`  ${pri}: ${byPri[pri]} clusters`);
  }

  return finalClusters;
}

// CLI usage
if (require.main === module) {
  const inputPath =
    process.argv[2] || path.join(__dirname, '../../data/cleaned-queries.json');
  const outputDir = process.argv[3] || path.join(__dirname, '../../data');

  clusterQueries(path.resolve(inputPath), path.resolve(outputDir)).catch(
    (err) => {
      console.error('Clustering failed:', err);
      process.exit(1);
    }
  );
}

module.exports = { clusterQueries, ruleBasedClustering, findBestCategory };
