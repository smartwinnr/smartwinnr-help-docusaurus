const { execSync } = require('child_process');
const fs = require('fs');

function getViolationCounts() {
  try {
    const output = execSync('npm run lint:docs 2>&1', { encoding: 'utf8' });
    
    // Extract summary line
    const summaryMatch = output.match(/Summary: (\d+) error\(s\)/);
    const totalViolations = summaryMatch ? parseInt(summaryMatch[1]) : 0;
    
    // Count by violation type
    const violationTypes = {
      'line-length': (output.match(/MD013\/line-length/g) || []).length,
      'emphasis-headings': (output.match(/MD036\/no-emphasis-as-heading/g) || []).length,
      'inline-html': (output.match(/MD033\/no-inline-html/g) || []).length,
      'code-language': (output.match(/MD040\/fenced-code-language/g) || []).length,
      'multiple-h1': (output.match(/MD025\/single-title/g) || []).length,
      'other': 0
    };
    
    // Calculate 'other' violations
    const knownViolations = Object.values(violationTypes).reduce((a, b) => a + b, 0) - violationTypes.other;
    violationTypes.other = totalViolations - knownViolations;
    
    return { total: totalViolations, byType: violationTypes };
    
  } catch (error) {
    console.error('Error getting violation counts:', error.message);
    return { total: 0, byType: {} };
  }
}

function calculateProgress() {
  const baseline = 1697; // Initial violation count from audit
  const current = getViolationCounts();
  
  const resolved = baseline - current.total;
  const progressPercent = (resolved / baseline * 100).toFixed(1);
  
  // Estimate documents completed (average 6 violations per doc)
  const estimatedDocsCompleted = Math.floor(resolved / 6);
  const totalDocs = 278;
  const docsProgressPercent = (estimatedDocsCompleted / totalDocs * 100).toFixed(1);
  
  return {
    baseline,
    current: current.total,
    resolved,
    progressPercent,
    estimatedDocsCompleted,
    totalDocs,
    docsProgressPercent,
    violationTypes: current.byType
  };
}

function displayProgress() {
  const progress = calculateProgress();
  const timestamp = new Date().toLocaleString();
  
  console.log(`\\n📊 SmartWinnr Documentation Progress Report`);
  console.log(`🕐 ${timestamp}`);
  console.log(`${'='.repeat(50)}`);
  
  console.log(`\\n🎯 Overall Progress:`);
  console.log(`   📉 Violations: ${progress.current} (was ${progress.baseline})`);
  console.log(`   ✅ Resolved: ${progress.resolved} violations`);
  console.log(`   📈 Progress: ${progress.progressPercent}% complete`);
  
  console.log(`\\n📚 Document Progress:`);
  console.log(`   📄 Estimated completed: ${progress.estimatedDocsCompleted}/${progress.totalDocs} documents`);
  console.log(`   📊 Document progress: ${progress.docsProgressPercent}%`);
  
  console.log(`\\n🔍 Violation Breakdown:`);
  Object.entries(progress.violationTypes).forEach(([type, count]) => {
    if (count > 0) {
      const icon = getViolationIcon(type);
      console.log(`   ${icon} ${type.replace('-', ' ')}: ${count}`);
    }
  });
  
  console.log(`\\n🎉 Next Milestone:`);
  const nextMilestone = getNextMilestone(progress.progressPercent);
  console.log(`   🎯 Target: ${nextMilestone.percent}% (${nextMilestone.description})`);
  console.log(`   📉 Need to resolve: ${Math.ceil((nextMilestone.percent / 100 * progress.baseline) - progress.resolved)} more violations`);
  
  // Performance metrics
  const rate = calculateTransformationRate();
  if (rate.docsPerDay > 0) {
    console.log(`\\n⚡ Performance:`);
    console.log(`   📈 Current rate: ${rate.docsPerDay} docs/day`);
    console.log(`   ⏱️  Time remaining: ${rate.daysToComplete} days estimated`);
  }
  
  console.log(`${'='.repeat(50)}`);
}

function getViolationIcon(type) {
  const icons = {
    'line-length': '📏',
    'emphasis-headings': '📋',
    'inline-html': '🏷️',
    'code-language': '💻',
    'multiple-h1': '🔤',
    'other': '🔧'
  };
  return icons[type] || '•';
}

function getNextMilestone(currentPercent) {
  const milestones = [
    { percent: 25, description: 'Quarter Complete' },
    { percent: 50, description: 'Halfway Point' },
    { percent: 75, description: 'Three Quarters' },
    { percent: 90, description: 'Nearly Complete' },
    { percent: 95, description: 'High Compliance' },
    { percent: 100, description: 'Full Compliance' }
  ];
  
  return milestones.find(m => m.percent > currentPercent) || { percent: 100, description: 'Perfect Compliance' };
}

function calculateTransformationRate() {
  // Simple rate calculation - could be enhanced with historical data
  try {
    const gitLog = execSync('git log --oneline --since="1 day ago" --grep="transform\\|batch" | wc -l', { encoding: 'utf8' });
    const commitsToday = parseInt(gitLog.trim()) || 0;
    
    return {
      docsPerDay: commitsToday * 5, // Estimate 5 docs per transform commit
      daysToComplete: commitsToday > 0 ? Math.ceil((278 - calculateProgress().estimatedDocsCompleted) / (commitsToday * 5)) : 'TBD'
    };
  } catch (error) {
    return { docsPerDay: 0, daysToComplete: 'TBD' };
  }
}

function saveProgressSnapshot() {
  const progress = calculateProgress();
  const snapshot = {
    timestamp: new Date().toISOString(),
    ...progress
  };
  
  // Append to progress log
  const logFile = 'transformation-progress.json';
  let progressLog = [];
  
  try {
    if (fs.existsSync(logFile)) {
      progressLog = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    }
  } catch (error) {
    console.log('Creating new progress log file');
  }
  
  progressLog.push(snapshot);
  
  // Keep only last 100 entries
  if (progressLog.length > 100) {
    progressLog = progressLog.slice(-100);
  }
  
  fs.writeFileSync(logFile, JSON.stringify(progressLog, null, 2));
  console.log(`💾 Progress snapshot saved to ${logFile}`);
}

module.exports = { getViolationCounts, calculateProgress, displayProgress, saveProgressSnapshot };

// Command line usage
if (require.main === module) {
  const action = process.argv[2];
  
  switch (action) {
    case '--save':
      saveProgressSnapshot();
      displayProgress();
      break;
    case '--quiet':
      const progress = calculateProgress();
      console.log(`${progress.progressPercent}% complete (${progress.current} violations remaining)`);
      break;
    default:
      displayProgress();
  }
}