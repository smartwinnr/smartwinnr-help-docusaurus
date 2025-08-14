const glob = require('glob');
const path = require('path');
const { transformDocumentTitle } = require('./title-transformer');
const { execSync } = require('child_process');

async function processBatch(pattern, options = {}) {
  console.log(`🚀 Starting batch processing for: ${pattern}`);
  
  try {
    // Find all matching files
    const files = glob.sync(pattern);
    console.log(`📁 Found ${files.length} files to process`);
    
    if (files.length === 0) {
      console.log('❌ No files found matching pattern');
      return { results: [], summary: { processed: 0, transformed: 0, errors: 0 } };
    }
    
    const results = [];
    let transformed = 0;
    let errors = 0;
    
    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`📝 Processing ${i + 1}/${files.length}: ${path.basename(file)}`);
      
      const result = await transformDocumentTitle(file);
      results.push(result);
      
      if (result.status === 'transformed') {
        transformed++;
        console.log(`   ✅ ${result.oldTitle} → ${result.newTitle} (${result.wordCount} words)`);
      } else if (result.status === 'error') {
        errors++;
        console.log(`   ❌ Error: ${result.error}`);
      } else if (result.status === 'no-change') {
        console.log(`   ⚪ No change needed: ${result.title}`);
      } else {
        console.log(`   ⚠️  ${result.status}: ${file}`);
      }
    }
    
    const summary = {
      processed: files.length,
      transformed,
      errors,
      noChange: results.filter(r => r.status === 'no-change').length
    };
    
    console.log('\\n📊 Batch Processing Summary:');
    console.log(`   📄 Files processed: ${summary.processed}`);
    console.log(`   ✅ Titles transformed: ${summary.transformed}`);
    console.log(`   ⚪ No changes needed: ${summary.noChange}`);
    console.log(`   ❌ Errors: ${summary.errors}`);
    
    return { results, summary };
    
  } catch (error) {
    console.error('❌ Batch processing failed:', error.message);
    return { results: [], summary: { processed: 0, transformed: 0, errors: 1 }, error };
  }
}

async function checkViolations(pattern) {
  try {
    console.log(`🔍 Checking style violations for: ${pattern}`);
    const output = execSync(`npm run lint:docs -- "${pattern}" 2>&1`, { encoding: 'utf8' });
    
    // Count violations in output
    const violationLines = output.split('\\n').filter(line => 
      line.includes('MD013/line-length') || 
      line.includes('MD036/no-emphasis-as-heading') ||
      line.includes('MD033/no-inline-html') ||
      line.includes('MD040/fenced-code-language') ||
      line.includes('MD025/single-title')
    );
    
    console.log(`📋 Found ${violationLines.length} violations`);
    return violationLines.length;
    
  } catch (error) {
    console.log('⚠️  Could not check violations:', error.message);
    return 0;
  }
}

async function processWithValidation(pattern) {
  console.log(`🎯 Starting automated transformation pipeline for: ${pattern}`);
  
  // Check violations before
  const violationsBefore = await checkViolations(pattern);
  
  // Process batch
  const { results, summary } = await processBatch(pattern);
  
  // Check violations after
  const violationsAfter = await checkViolations(pattern);
  
  // Calculate improvement
  const improvement = violationsBefore - violationsAfter;
  const improvementPercent = violationsBefore > 0 ? (improvement / violationsBefore * 100).toFixed(1) : 0;
  
  console.log('\\n🎉 Pipeline Complete!');
  console.log(`📊 Style violations: ${violationsBefore} → ${violationsAfter} (${improvement > 0 ? '-' : ''}${improvement})`);
  console.log(`📈 Improvement: ${improvementPercent}%`);
  
  return { 
    results, 
    summary, 
    violations: { before: violationsBefore, after: violationsAfter, improvement, improvementPercent }
  };
}

module.exports = { processBatch, checkViolations, processWithValidation };

// Command line usage
if (require.main === module) {
  const pattern = process.argv[2];
  const validateFlag = process.argv[3] === '--validate';
  
  if (!pattern) {
    console.log('Usage: node batch-processor.js <glob-pattern> [--validate]');
    console.log('Examples:');
    console.log('  node batch-processor.js "docs/getting-started/*.md"');
    console.log('  node batch-processor.js "docs/quizzes/*.md" --validate');
    process.exit(1);
  }
  
  const processFunction = validateFlag ? processWithValidation : processBatch;
  
  processFunction(pattern).then(result => {
    if (result.summary.transformed > 0) {
      console.log('\\n💾 Remember to commit your changes:');
      console.log(`git add "${pattern.replace('*.md', '')}*.md"`);
      console.log('git commit -m "Batch transform titles to action-oriented format"');
    }
  }).catch(error => {
    console.error('💥 Processing failed:', error);
    process.exit(1);
  });
}