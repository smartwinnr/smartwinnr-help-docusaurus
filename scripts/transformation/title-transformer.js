const fs = require('fs').promises;
const path = require('path');

// Title transformation patterns
const titleTransformations = [
  // Question patterns to action verbs
  { pattern: /^How can I (.+)\?$/, replacement: (match, action) => action.charAt(0).toUpperCase() + action.slice(1) },
  { pattern: /^How do I (.+)\?$/, replacement: (match, action) => action.charAt(0).toUpperCase() + action.slice(1) },
  { pattern: /^How to (.+)$/, replacement: (match, action) => action.charAt(0).toUpperCase() + action.slice(1) },
  
  // What questions to About format
  { pattern: /^What is (.+)\?$/, replacement: (match, subject) => `About ${subject}` },
  { pattern: /^What are (.+)\?$/, replacement: (match, subject) => `About ${subject}` },
  
  // Common action verb starters
  { pattern: /^(.+) a (.+)$/, replacement: (match, verb, object) => `${verb.charAt(0).toUpperCase()}${verb.slice(1)} ${object.charAt(0).toUpperCase()}${object.slice(1)}` }
];

function transformTitle(title) {
  // Remove quotes if present
  let cleanTitle = title.replace(/^"(.*)"$/, '$1');
  
  // Apply transformation patterns
  for (const { pattern, replacement } of titleTransformations) {
    if (pattern.test(cleanTitle)) {
      cleanTitle = cleanTitle.replace(pattern, replacement);
      break;
    }
  }
  
  // Ensure proper title case for first word
  cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  
  // Clean up common issues
  cleanTitle = cleanTitle
    .replace(/\s+/g, ' ')           // Multiple spaces to single
    .replace(/\s+\?$/, '')          // Remove trailing question marks
    .replace(/^(a|an|the)\s+/i, '') // Remove leading articles
    .trim();
  
  return cleanTitle;
}

async function transformDocumentTitle(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Find title line
    const titleLineIndex = lines.findIndex(line => line.startsWith('title:'));
    
    if (titleLineIndex === -1) {
      return { status: 'no-title', file: filePath };
    }
    
    const titleLine = lines[titleLineIndex];
    const titleMatch = titleLine.match(/title:\s*"([^"]+)"/);
    
    if (!titleMatch) {
      return { status: 'no-match', file: filePath, line: titleLine };
    }
    
    const oldTitle = titleMatch[1];
    const newTitle = transformTitle(oldTitle);
    
    // Only update if title actually changed
    if (oldTitle !== newTitle) {
      lines[titleLineIndex] = `title: "${newTitle}"`;
      await fs.writeFile(filePath, lines.join('\n'));
      return { 
        status: 'transformed', 
        file: filePath, 
        oldTitle, 
        newTitle,
        wordCount: newTitle.split(' ').length
      };
    }
    
    return { status: 'no-change', file: filePath, title: oldTitle };
    
  } catch (error) {
    return { status: 'error', file: filePath, error: error.message };
  }
}

module.exports = { transformTitle, transformDocumentTitle };

// Command line usage
if (require.main === module) {
  const targetFile = process.argv[2];
  if (!targetFile) {
    console.log('Usage: node title-transformer.js <file-path>');
    process.exit(1);
  }
  
  transformDocumentTitle(targetFile).then(result => {
    console.log(JSON.stringify(result, null, 2));
  });
}