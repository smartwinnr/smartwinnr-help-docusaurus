#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * AI-Powered Content Enhancer for SmartWinnr Documentation
 * Uses the style guide as a prompt to improve content quality
 */
class AIContentEnhancer {
    constructor() {
        this.styleGuidePrompt = this.loadStyleGuide();
        this.imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    }

    /**
     * Load the style guide to use as AI prompt
     */
    loadStyleGuide() {
        try {
            const styleGuidePath = path.join(__dirname, '../../SmartWinnr-Help-Style-Guide.md');
            return fs.readFileSync(styleGuidePath, 'utf8');
        } catch (error) {
            console.warn('Style guide not found, using embedded version');
            return this.getEmbeddedStyleGuide();
        }
    }

    /**
     * Embedded style guide for fallback
     */
    getEmbeddedStyleGuide() {
        return `
# SmartWinnr Help Document Style Guide

## Key Principles:
1. **Tone**: Friendly but professional, encouraging, solution-oriented
2. **Language**: American English, present tense, active voice, short sentences (15-20 words max)
3. **Structure**: Clear headings, step-by-step instructions, highlighted key actions
4. **Formatting**: Bold UI elements, inline code for commands, descriptive links
5. **Positive framing**: "Remember to..." instead of "Don't forget to..."
6. **Consistent terminology**: Same word for same feature across all docs
        `;
    }

    /**
     * Extract and preserve images with context
     */
    extractImagesWithContext(content) {
        const images = [];
        const lines = content.split('\n');
        
        lines.forEach((line, lineIndex) => {
            const match = line.match(this.imageRegex);
            if (match) {
                // Get surrounding context (previous and next lines)
                const contextBefore = lineIndex > 0 ? lines[lineIndex - 1] : '';
                const contextAfter = lineIndex < lines.length - 1 ? lines[lineIndex + 1] : '';
                
                images.push({
                    original: match[0],
                    alt: match[1] || '',
                    src: match[2],
                    lineIndex,
                    contextBefore,
                    contextAfter,
                    placeholder: `__IMAGE_${images.length}_PLACEHOLDER__`
                });
            }
        });
        
        return images;
    }

    /**
     * Generate improvement prompt for AI
     */
    generateImprovementPrompt(content, filename) {
        return `
You are a technical writing expert improving SmartWinnr help documentation. Follow this style guide exactly:

${this.styleGuidePrompt}

CRITICAL REQUIREMENTS:
1. Preserve ALL image placeholders (__IMAGE_X_PLACEHOLDER__) in their EXACT positions
2. Do NOT move, remove, or modify image placeholders
3. Maintain the same document structure and heading hierarchy
4. Keep all existing frontmatter (---) unchanged

DOCUMENT TO IMPROVE:
Filename: ${filename}

Content with image placeholders:
${content}

IMPROVEMENTS TO MAKE:
1. **Tone & Voice**: Make it friendly but professional, encouraging, solution-oriented
2. **Language**: Convert to active voice, use American English spelling, shorten long sentences
3. **Structure**: Improve step-by-step instructions, add numbered steps where needed
4. **Formatting**: Bold UI elements (buttons, menus, fields), improve readability
5. **Positive Framing**: Change "Don't forget" to "Remember", "Must" to "Need to"
6. **Add Tips/Notes**: Include helpful tips and notes where appropriate

Return ONLY the improved content with image placeholders preserved in their exact positions.
        `;
    }

    /**
     * Simulate AI content improvement (placeholder for actual AI integration)
     */
    simulateAIImprovement(content, filename) {
        console.log(`🤖 Simulating AI enhancement for: ${filename}`);
        
        // This is where you would integrate with Claude API, OpenAI, etc.
        // For now, we'll apply basic improvements manually
        
        let improved = content;
        
        // Basic improvements that an AI would make
        const improvements = [
            // Convert passive to active voice
            { pattern: /can be done by clicking/gi, replacement: 'click' },
            { pattern: /should be entered/gi, replacement: 'enter' },
            { pattern: /will be displayed/gi, replacement: 'displays' },
            
            // Improve UI element formatting
            { pattern: /click on the "([^"]+)" button/gi, replacement: 'click the **$1** button' },
            { pattern: /select the "([^"]+)" option/gi, replacement: 'select **$1**' },
            { pattern: /enter the ([^.]+) in the ([^.]+) field/gi, replacement: 'enter the $1 in the **$2** field' },
            
            // Positive framing
            { pattern: /don't forget to/gi, replacement: 'remember to' },
            { pattern: /you must/gi, replacement: 'you need to' },
            { pattern: /you can't/gi, replacement: 'you cannot' },
            
            // American English
            { pattern: /customise/gi, replacement: 'customize' },
            { pattern: /colour/gi, replacement: 'color' },
            { pattern: /organise/gi, replacement: 'organize' },
            
            // Better terminology
            { pattern: /error/gi, replacement: 'issue' },
            { pattern: /fail/gi, replacement: 'unable to complete' }
        ];
        
        improvements.forEach(rule => {
            improved = improved.replace(rule.pattern, rule.replacement);
        });
        
        // Add helpful tips if they don't exist
        if (filename.includes('login') && !improved.includes('> **Tip**:')) {
            improved += `\n\n> **Tip**: Keep your login credentials secure and change default passwords immediately after first login.\n`;
        }
        
        if (filename.includes('admin') && !improved.includes('> **Note**:')) {
            improved = improved.replace(
                /(admin|administrator)/gi, 
                '\n> **Note**: This feature requires Administrator permissions.\n\n$1'
            );
        }
        
        return improved;
    }

    /**
     * Transform a document with AI-powered improvements
     */
    async transformDocument(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const filename = path.basename(filePath);
            
            console.log(`🔄 AI-enhancing: ${filename}`);

            // Step 1: Extract images and replace with placeholders
            const images = this.extractImagesWithContext(content);
            console.log(`   📷 Preserving ${images.length} images`);

            let workingContent = content;
            images.forEach(image => {
                workingContent = workingContent.replace(image.original, image.placeholder);
            });

            // Step 2: Apply AI-powered improvements
            const improvedContent = this.simulateAIImprovement(workingContent, filename);

            // Step 3: Restore images at their exact positions
            let finalContent = improvedContent;
            images.forEach(image => {
                finalContent = finalContent.replace(image.placeholder, image.original);
            });

            // Step 4: Validate that all images were restored
            const restoredImageCount = (finalContent.match(this.imageRegex) || []).length;
            if (restoredImageCount !== images.length) {
                throw new Error(`Image preservation failed: Expected ${images.length}, found ${restoredImageCount}`);
            }

            // Step 5: Write improved content back to file
            fs.writeFileSync(filePath, finalContent);
            
            console.log(`   ✅ Enhanced with ${images.length} images preserved`);
            
            return {
                success: true,
                imagesPreserved: images.length,
                originalLength: content.length,
                improvedLength: finalContent.length
            };

        } catch (error) {
            console.error(`   ❌ Error enhancing ${filePath}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create a backup before processing
     */
    createBackup(filePath) {
        const backupPath = `${filePath}.backup-${Date.now()}`;
        fs.copyFileSync(filePath, backupPath);
        return backupPath;
    }
}

/**
 * Batch enhance multiple documents
 */
async function batchEnhanceContent(pattern, options = {}) {
    const glob = require('glob');
    const enhancer = new AIContentEnhancer();
    
    console.log(`🚀 Starting AI-powered content enhancement for: ${pattern}`);
    
    const files = glob.sync(pattern);
    console.log(`📁 Found ${files.length} files to enhance`);

    if (options.createBackups) {
        console.log('📁 Creating backups...');
        files.forEach(file => enhancer.createBackup(file));
    }

    const results = {
        totalFiles: files.length,
        successful: 0,
        failed: 0,
        totalImages: 0,
        errors: []
    };

    for (const file of files) {
        const result = await enhancer.transformDocument(file);
        
        if (result.success) {
            results.successful++;
            results.totalImages += result.imagesPreserved || 0;
        } else {
            results.failed++;
            results.errors.push({ file, error: result.error });
        }
    }

    console.log(`\n📊 AI Content Enhancement Summary:`);
    console.log(`   📄 Files processed: ${results.totalFiles}`);
    console.log(`   ✅ Successfully enhanced: ${results.successful}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   📷 Images preserved: ${results.totalImages}`);
    
    if (results.errors.length > 0) {
        console.log(`\n❌ Errors:`);
        results.errors.forEach(error => {
            console.log(`   ${error.file}: ${error.error}`);
        });
    }

    return results;
}

// CLI usage
if (require.main === module) {
    const pattern = process.argv[2];
    const createBackups = process.argv.includes('--backup');
    
    if (!pattern) {
        console.log('Usage: node ai-content-enhancer.js "docs/**/*.md" [--backup]');
        console.log('\nExample: node ai-content-enhancer.js "docs/getting-started/*.md" --backup');
        process.exit(1);
    }
    
    batchEnhanceContent(pattern, { createBackups }).then(() => {
        console.log('\n💾 Content enhancement complete! Remember to commit your changes.');
        if (createBackups) {
            console.log('📁 Backups created with .backup-[timestamp] extension');
        }
    });
}

module.exports = { AIContentEnhancer, batchEnhanceContent };