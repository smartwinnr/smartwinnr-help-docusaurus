#!/usr/bin/env node

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');

const { ingestCSV } = require('./ingest-csv');
const { clusterQueries } = require('./cluster-queries');
const { runGapAnalysis } = require('./gap-analysis');
const { generateArticles } = require('./generate-articles');
const { validateAll } = require('./validate-articles');
const { prepareOutput, generateSummary } = require('./prepare-output');

const program = new Command();

program
  .name('process-freshdesk')
  .description('Process Freshdesk CSV export into help documentation articles')
  .option('-i, --input <path>', 'Path to Freshdesk CSV export file')
  .option('-o, --output <path>', 'Output directory', path.join(__dirname, 'output'))
  .option('-d, --data-dir <path>', 'Intermediate data directory', path.join(__dirname, '../../data'))
  .option('--dry-run', 'Run clustering and gap analysis only, skip article generation')
  .option('--min-cluster <n>', 'Minimum queries per cluster to generate article', '2')
  .option('--skip-covered', 'Skip fully covered clusters (default)', true)
  .option('--include-covered', 'Include covered clusters in generation')
  .option('--gen-model <model>', 'OpenAI model for article generation', 'gpt-4o')
  .option('--cluster-model <model>', 'Claude model for semantic clustering', 'claude-sonnet-4-20250514')
  .option('--skip-ingest', 'Skip CSV ingestion (use existing cleaned-queries.json)')
  .option('--skip-cluster', 'Skip clustering (use existing clusters.json)')
  .option('--skip-gap', 'Skip gap analysis (use existing gap-report.json)')
  .option('--skip-generate', 'Skip article generation')
  .option('--skip-validate', 'Skip validation')
  .option('--no-copy', 'Do not copy articles to docs/ directory')
  .parse(process.argv);

const opts = program.opts();

async function main() {
  const dataDir = path.resolve(opts.dataDir);
  const outputDir = path.resolve(opts.output);
  const docsRoot = path.join(__dirname, '../../docs');

  // Track stats across pipeline
  const pipelineStats = {};

  console.log('=== Freshdesk to Help Articles Pipeline ===\n');
  console.log(`Data dir:   ${dataDir}`);
  console.log(`Output dir: ${outputDir}`);
  console.log(`Dry run:    ${opts.dryRun || false}`);
  console.log(`Min cluster:${opts.minCluster}`);
  console.log('');

  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });

  // ---- Stage 1: Ingestion ----
  const cleanedPath = path.join(dataDir, 'cleaned-queries.json');

  if (!opts.skipIngest) {
    if (!opts.input) {
      // Try to find CSV in freshdesk/ directory
      const freshdeskDir = path.join(__dirname, '../../freshdesk');
      if (fs.existsSync(freshdeskDir)) {
        const csvFiles = fs.readdirSync(freshdeskDir).filter((f) => f.endsWith('.csv'));
        if (csvFiles.length > 0) {
          opts.input = path.join(freshdeskDir, csvFiles[0]);
          console.log(`Auto-detected CSV: ${opts.input}\n`);
        }
      }
    }

    if (!opts.input) {
      console.error('Error: No input CSV specified and none found in freshdesk/ directory.');
      console.error('Use --input <path> to specify the CSV file.');
      process.exit(1);
    }

    console.log('=== Stage 1: CSV Ingestion ===\n');
    const ingestionResult = ingestCSV(path.resolve(opts.input), dataDir);
    pipelineStats.ingestion = ingestionResult.stats;
  } else {
    console.log('=== Stage 1: Skipped (using existing data) ===\n');
  }

  // ---- Stage 2: Clustering ----
  const clustersPath = path.join(dataDir, 'clusters.json');

  if (!opts.skipCluster) {
    console.log('\n=== Stage 2: Topic Clustering ===\n');
    const clusters = await clusterQueries(cleanedPath, dataDir, {
      clusterModel: opts.clusterModel,
    });
    pipelineStats.clustering = { total: clusters.length };
  } else {
    console.log('=== Stage 2: Skipped (using existing clusters) ===\n');
  }

  // ---- Stage 3: Gap Analysis ----
  const gapReportPath = path.join(outputDir, 'gap-report.json');

  if (!opts.skipGap) {
    console.log('\n=== Stage 3: Gap Analysis ===\n');
    const gapResult = runGapAnalysis(clustersPath, outputDir, docsRoot);
    pipelineStats.gapAnalysis = gapResult.stats;

    // Also copy gap report to data dir for prepare-output
    fs.copyFileSync(gapReportPath, path.join(dataDir, 'gap-report.json'));
  } else {
    console.log('=== Stage 3: Skipped (using existing gap report) ===\n');
  }

  // ---- Dry run stops here ----
  if (opts.dryRun) {
    console.log('\n=== DRY RUN COMPLETE ===');
    console.log('Gap analysis and clustering done. Review:');
    console.log(`  - Clusters: ${clustersPath}`);
    console.log(`  - Gap report: ${gapReportPath}`);
    console.log(`  - Gap analysis: ${path.join(outputDir, 'FRESHDESK-GAP-ANALYSIS.md')}`);
    console.log('\nRe-run without --dry-run to generate articles.');

    // Save stats
    fs.writeFileSync(
      path.join(outputDir, 'pipeline-stats.json'),
      JSON.stringify(pipelineStats, null, 2)
    );
    generateSummary(outputDir, pipelineStats);
    return;
  }

  // ---- Stage 4: Article Generation ----
  if (!opts.skipGenerate) {
    console.log('\n=== Stage 4: Article Generation ===\n');
    const genResult = await generateArticles(gapReportPath, outputDir, {
      genModel: opts.genModel,
      minCluster: parseInt(opts.minCluster),
      skipCovered: !opts.includeCovered,
    });
    pipelineStats.generation = {
      newArticles: genResult.newArticles.length,
      enhancements: genResult.enhancements.length,
      errors: genResult.errors.length,
    };
  } else {
    console.log('=== Stage 4: Skipped ===\n');
  }

  // ---- Stage 5: Validation ----
  if (!opts.skipValidate) {
    console.log('\n=== Stage 5: Validation ===\n');
    const valReport = validateAll(outputDir, docsRoot);
    pipelineStats.validation = {
      valid: valReport.valid,
      invalid: valReport.invalid,
      totalWarnings: valReport.totalWarnings,
    };
  } else {
    console.log('=== Stage 5: Skipped ===\n');
  }

  // ---- Stage 6: Prepare Output ----
  console.log('\n=== Stage 6: Prepare Output ===\n');

  // Save pipeline stats for summary generation
  fs.writeFileSync(
    path.join(outputDir, 'pipeline-stats.json'),
    JSON.stringify(pipelineStats, null, 2)
  );

  prepareOutput(outputDir, {
    docsRoot,
    dryRun: opts.noCopy || false,
    dataDir,
  });

  console.log('\n=== Pipeline Complete ===');
  console.log(`\nOutput files:`);
  console.log(`  - New articles:      ${path.join(outputDir, 'new-articles/')}`);
  console.log(`  - Enhancements:      ${path.join(outputDir, 'enhancements/')}`);
  console.log(`  - Gap analysis:      ${path.join(outputDir, 'FRESHDESK-GAP-ANALYSIS.md')}`);
  console.log(`  - Recommendations:   ${path.join(outputDir, 'KB-STRUCTURE-RECOMMENDATIONS.md')}`);
  console.log(`  - Processing summary:${path.join(outputDir, 'FRESHDESK-PROCESSING-SUMMARY.md')}`);
  console.log(`  - Validation report: ${path.join(outputDir, 'validation-report.json')}`);
}

main().catch((err) => {
  console.error('\nPipeline failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
