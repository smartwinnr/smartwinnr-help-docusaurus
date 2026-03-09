#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const matter = require('gray-matter');

const STYLE_GUIDE_PATH = path.join(__dirname, '../../SmartWinnr-Help-Style-Guide.md');

/**
 * Load the style guide for article generation prompts.
 */
function loadStyleGuide() {
  try {
    return fs.readFileSync(STYLE_GUIDE_PATH, 'utf8');
  } catch {
    return `
# SmartWinnr Help Document Style Guide
- American English, active voice, present tense
- Action-oriented titles, 5-8 words, Title Case
- Short sentences (15-20 words max)
- Bold all UI elements (**Save**, **Next**)
- Numbered lists for steps, bullets for options
- Tips/Notes boxes for key information
- Positive framing ("Remember to..." not "Don't forget to...")
    `;
  }
}

/**
 * Subcategory keyword mapping for administration articles.
 */
const ADMIN_SUBCATEGORY_MAP = {
  'administration/system-management': ['user', 'login', 'password', 'role', 'permission', 'contact', 'account', 'sso', 'group', 'division', 'organization', 'config'],
  'administration/quiz-module': ['quiz', 'assessment', 'test', 'question', 'score', 'passing'],
  'administration/smartpath-module': ['smartpath', 'learning path', 'training path'],
  'administration/smartfeed-module': ['smartfeed', 'feed', 'microlearning'],
  'administration/video-coaching-module': ['video coaching', 'coaching session', 'ai coach'],
  'administration/field-coaching-module': ['field coaching', 'observation'],
  'administration/survey-module': ['survey', 'feedback', 'poll'],
  'administration/knowledge-hub-module': ['knowledge hub', 'knowledge base'],
  'administration/forms-module': ['form', 'data collection', 'field mapping'],
  'administration/cross-module-features': ['competition', 'gamification', 'leaderboard', 'badge', 'bracket', 'challenge'],
};

/**
 * Determine the subcategory for an administration article based on topic keywords.
 */
function resolveAdminSubcategory(topic) {
  const text = topic.toLowerCase();
  for (const [subcategory, keywords] of Object.entries(ADMIN_SUBCATEGORY_MAP)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return subcategory;
      }
    }
  }
  return 'administration/system-management';
}

/**
 * Sanitize GPT-generated article content to ensure valid Docusaurus frontmatter.
 * Strips code fences, ensures nested last_update, adds slug if missing.
 */
function sanitizeArticleContent(content, cluster) {
  let raw = content;

  // Strip code fence wrapping around frontmatter (```yaml ... ```)
  raw = raw.replace(/^\s*```(?:yaml|yml)?\s*\n(---[\s\S]*?---)\s*\n```/, '$1');
  // Also handle case where ``` wraps the entire file start
  raw = raw.replace(/^\s*```(?:yaml|yml)?\s*\n/, '');
  // Remove trailing ``` that was closing the frontmatter fence
  if (!raw.startsWith('---')) {
    // If still no frontmatter delimiter, try to find it
    const fmMatch = raw.match(/(---[\s\S]*?---)/);
    if (fmMatch) {
      const before = raw.substring(0, raw.indexOf(fmMatch[0]));
      const after = raw.substring(raw.indexOf(fmMatch[0]));
      raw = after.replace(/```\s*$/, '');
    }
  }

  let parsed;
  try {
    parsed = matter(raw);
  } catch {
    // If frontmatter still can't be parsed, build minimal frontmatter
    const titleSlug = slugify(cluster.topic, { lower: true, strict: true });
    const minimalFm = {
      title: cluster.topic,
      description: '',
      slug: titleSlug,
      sidebar_position: 999,
      last_update: {
        date: new Date().toISOString().split('T')[0],
        author: 'Freshdesk Analysis',
      },
    };
    return matter.stringify(raw, minimalFm);
  }

  const data = parsed.data;

  // Always derive slug from cluster.topic to match the filename
  data.slug = slugify(cluster.topic, { lower: true, strict: true });

  // Ensure description exists
  if (!data.description) {
    data.description = '';
  }

  // Ensure sidebar_position exists
  if (data.sidebar_position === undefined) {
    data.sidebar_position = 999;
  }

  // Fix last_update: ensure it's nested with date and author
  // gray-matter parses bare dates as Date objects, so check for that too
  const isNestedLastUpdate = data.last_update
    && typeof data.last_update === 'object'
    && !(data.last_update instanceof Date)
    && (data.last_update.date || data.last_update.author);

  if (!isNestedLastUpdate) {
    let flatDate;
    if (data.last_update instanceof Date) {
      flatDate = data.last_update.toISOString().split('T')[0];
    } else if (typeof data.last_update === 'string') {
      flatDate = data.last_update;
    } else {
      flatDate = new Date().toISOString().split('T')[0];
    }
    data.last_update = {
      date: flatDate,
      author: data.author || 'Freshdesk Analysis',
    };
  } else {
    if (!data.last_update.date) {
      data.last_update.date = new Date().toISOString().split('T')[0];
    }
    if (data.last_update.date instanceof Date) {
      data.last_update.date = data.last_update.date.toISOString().split('T')[0];
    }
    if (!data.last_update.author) {
      data.last_update.author = data.author || 'Freshdesk Analysis';
    }
  }

  // Move top-level author into last_update.author if present
  if (data.author) {
    data.last_update.author = data.author;
    delete data.author;
  }

  return matter.stringify(parsed.content, data);
}

/**
 * Build the article generation prompt for a GAP cluster.
 */
function buildNewArticlePrompt(cluster, styleGuide) {
  const querySummaries = (cluster.queries || [])
    .map((q) => `- ${q.subject}: ${(q.originalQuestion || q.description || '').substring(0, 300)}`)
    .join('\n');

  return `You are a technical writer for SmartWinnr's help documentation.

STYLE GUIDE RULES:
${styleGuide}

CONTEXT:
- Topic: ${cluster.topic}
- Category: ${cluster.category}
- Number of user queries on this topic: ${cluster.queryCount}
- User queries:
${querySummaries}

Generate a complete help article with:
1. Frontmatter as bare YAML between --- delimiters (NOT inside a code block). Use exactly this structure:
---
title: "Your Title Here"
description: "One sentence description."
slug: your-title-here
sidebar_position: 999
last_update:
  date: ${new Date().toISOString().split('T')[0]}
  author: "Freshdesk Analysis"
---
2. Overview section - what this is and why users need it (2-3 sentences)
3. Prerequisites (if applicable) - what the user needs before starting
4. Step-by-step instructions solving the problem - numbered steps with bold UI elements
5. "Why This Works" section - brief explanation of the reasoning/benefits
6. Troubleshooting section with 2-3 common variations or issues
7. Related Topics section with placeholder links

IMPORTANT:
- Use American English, active voice, present tense
- Keep sentences to 15-20 words max
- Bold all UI element names (**Save**, **Submit**, **Settings**)
- Use numbered lists for sequential steps
- Add > **Tip**: and > **Note**: boxes where helpful
- Use positive framing ("Remember to..." not "Don't forget to...")
- Do NOT include screenshots or image placeholders
- Do NOT wrap the frontmatter in \`\`\`yaml code fences. Start the file directly with ---

Return ONLY the complete markdown article content including the frontmatter.`;
}

/**
 * Build the enhancement prompt for a PARTIALLY_COVERED cluster.
 */
function buildEnhancementPrompt(cluster, existingDocPath, styleGuide) {
  let existingContent = '';
  try {
    const fullPath = path.join(__dirname, '../../docs', existingDocPath);
    existingContent = fs.readFileSync(fullPath, 'utf8');
  } catch {
    existingContent = '(Could not load existing document)';
  }

  const querySummaries = (cluster.queries || [])
    .map((q) => `- ${q.subject}: ${(q.originalQuestion || q.description || '').substring(0, 300)}`)
    .join('\n');

  return `You are a technical writer for SmartWinnr's help documentation.

STYLE GUIDE:
${styleGuide}

TASK: Enhance an existing document to better cover a topic that users are asking about.

EXISTING DOCUMENT:
${existingContent.substring(0, 3000)}

USER QUERIES NOT FULLY ADDRESSED:
${querySummaries}

Generate an enhancement patch that includes:
1. A new section (H2 or H3) addressing the gap identified by user queries
2. Step-by-step instructions for the specific scenario users are asking about
3. A troubleshooting tip if applicable

Format your response as:
---
PLACEMENT: After section "[section name]" (or "At end of document")
---

[Your new markdown section content here]

IMPORTANT:
- Match the existing document's style and tone
- Use American English, active voice, present tense
- Bold UI elements, numbered steps for procedures
- Keep it focused - add only what's missing, don't rewrite existing content`;
}

/**
 * Generate articles using OpenAI API.
 */
async function generateArticles(gapReportPath, outputDir, options = {}) {
  const model = options.genModel || 'gpt-4o';
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error(
      'OPENAI_API_KEY not set. Cannot generate articles. Set it and re-run.'
    );
    process.exit(1);
  }

  const OpenAI = require('openai');
  const client = new OpenAI({ apiKey });

  const styleGuide = loadStyleGuide();
  const gapReport = JSON.parse(fs.readFileSync(gapReportPath, 'utf8'));
  const results = gapReport.results || [];

  const skipCovered = options.skipCovered !== false;
  const minCluster = options.minCluster || 2;

  // Filter to actionable clusters
  const gaps = results.filter(
    (r) =>
      r.coverage === 'GAP' && r.queryCount >= minCluster
  );
  const partials = results.filter(
    (r) => r.coverage === 'PARTIALLY_COVERED' && r.queryCount >= minCluster
  );

  console.log(
    `Generating: ${gaps.length} new articles, ${partials.length} enhancements`
  );

  // Create output directories
  const newArticlesDir = path.join(outputDir, 'new-articles');
  const enhancementsDir = path.join(outputDir, 'enhancements');
  fs.mkdirSync(newArticlesDir, { recursive: true });
  fs.mkdirSync(enhancementsDir, { recursive: true });

  const generationResults = {
    newArticles: [],
    enhancements: [],
    errors: [],
  };

  // Generate new articles for GAP clusters
  for (let i = 0; i < gaps.length; i++) {
    const cluster = gaps[i];
    console.log(
      `[${i + 1}/${gaps.length}] Generating article: ${cluster.topic}`
    );

    try {
      const prompt = buildNewArticlePrompt(cluster, styleGuide);
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
        temperature: 0.3,
      });

      const articleContent = response.choices[0]?.message?.content || '';
      const sanitized = sanitizeArticleContent(articleContent, cluster);

      // Generate filename
      const slug = slugify(cluster.topic, {
        lower: true,
        strict: true,
        replacement: '-',
      });
      const filename = `${slug}.md`;
      const filePath = path.join(newArticlesDir, filename);

      fs.writeFileSync(filePath, sanitized);
      console.log(`  -> Saved: ${filename}`);

      // Determine subcategory for administration articles
      const subcategory = cluster.category === 'administration'
        ? resolveAdminSubcategory(cluster.topic)
        : null;

      generationResults.newArticles.push({
        topic: cluster.topic,
        category: cluster.category,
        subcategory,
        filename,
        queryCount: cluster.queryCount,
        priority: cluster.priority,
      });
    } catch (err) {
      console.error(`  -> Error: ${err.message}`);
      generationResults.errors.push({
        topic: cluster.topic,
        type: 'new-article',
        error: err.message,
      });
    }

    // Rate limiting
    if (i < gaps.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // Generate enhancements for PARTIALLY_COVERED clusters
  for (let i = 0; i < partials.length; i++) {
    const cluster = partials[i];
    const existingDocPath = cluster.bestMatch?.docPath;
    if (!existingDocPath) continue;

    console.log(
      `[${i + 1}/${partials.length}] Generating enhancement for: ${cluster.topic}`
    );

    try {
      const prompt = buildEnhancementPrompt(
        cluster,
        existingDocPath,
        styleGuide
      );
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.3,
      });

      const patchContent = response.choices[0]?.message?.content || '';
      const slug = slugify(cluster.topic, {
        lower: true,
        strict: true,
        replacement: '-',
      });
      const filename = `enhance-${slug}.md`;
      const filePath = path.join(enhancementsDir, filename);

      // Prepend metadata about where this enhancement goes
      const fullContent = `<!-- Enhancement for: ${existingDocPath} -->\n<!-- Topic: ${cluster.topic} -->\n<!-- Queries: ${cluster.queryCount} -->\n\n${patchContent}`;
      fs.writeFileSync(filePath, fullContent);
      console.log(`  -> Saved: ${filename}`);

      generationResults.enhancements.push({
        topic: cluster.topic,
        targetDoc: existingDocPath,
        filename,
        queryCount: cluster.queryCount,
      });
    } catch (err) {
      console.error(`  -> Error: ${err.message}`);
      generationResults.errors.push({
        topic: cluster.topic,
        type: 'enhancement',
        error: err.message,
      });
    }

    if (i < partials.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // Write generation results
  const resultsPath = path.join(outputDir, 'generation-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(generationResults, null, 2));

  console.log('\n--- Generation Summary ---');
  console.log(`New articles generated: ${generationResults.newArticles.length}`);
  console.log(`Enhancements generated: ${generationResults.enhancements.length}`);
  console.log(`Errors: ${generationResults.errors.length}`);

  return generationResults;
}

// CLI usage
if (require.main === module) {
  const gapReportPath =
    process.argv[2] ||
    path.join(__dirname, 'output/gap-report.json');
  const outputDir = process.argv[3] || path.join(__dirname, 'output');

  const options = {
    genModel: process.argv.includes('--model')
      ? process.argv[process.argv.indexOf('--model') + 1]
      : 'gpt-4o',
    minCluster: process.argv.includes('--min-cluster')
      ? parseInt(process.argv[process.argv.indexOf('--min-cluster') + 1])
      : 2,
    skipCovered: !process.argv.includes('--include-covered'),
  };

  generateArticles(
    path.resolve(gapReportPath),
    path.resolve(outputDir),
    options
  ).catch((err) => {
    console.error('Generation failed:', err);
    process.exit(1);
  });
}

module.exports = { generateArticles, buildNewArticlePrompt, buildEnhancementPrompt, sanitizeArticleContent, resolveAdminSubcategory, ADMIN_SUBCATEGORY_MAP };
