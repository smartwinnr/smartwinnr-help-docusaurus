#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Content Transformer for SmartWinnr Documentation
 * Uses style guide to improve content while preserving images
 */
class ContentTransformer {
    constructor() {
        this.imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        this.stepRegex = /^(Step\s*\d+:?)/gmi;
        this.headingRegex = /^(#{1,6})\s+(.+)$/gm;
        
        // Style guide patterns
        this.styleGuideRules = {
            tone: {
                // Convert passive to active voice
                passiveToActive: [
                    { pattern: /should be (.+) to/gi, replacement: 'to $1' },
                    { pattern: /can be (.+) by/gi, replacement: 'you can $1 by' },
                    { pattern: /will be (.+)/gi, replacement: 'displays $1' }
                ],
                // Positive framing
                positiveFraming: [
                    { pattern: /don't forget to/gi, replacement: 'remember to' },
                    { pattern: /you can't/gi, replacement: 'you cannot' },
                    { pattern: /won't/gi, replacement: 'will not' }
                ]
            },
            structure: {
                // UI element formatting
                uiElements: [
                    { pattern: /click on the "([^"]+)"/gi, replacement: 'click **$1**' },
                    { pattern: /click on '([^']+)'/gi, replacement: 'click **$1**' },
                    { pattern: /select "([^"]+)"/gi, replacement: 'select **$1**' },
                    { pattern: /select '([^']+)'/gi, replacement: 'select **$1**' }
                ]
            },
            language: {
                // American English
                americanSpelling: [
                    { pattern: /customise/gi, replacement: 'customize' },
                    { pattern: /organise/gi, replacement: 'organize' },
                    { pattern: /colour/gi, replacement: 'color' }
                ],
                // Terminology consistency  
                terminology: [
                    { pattern: /error/gi, replacement: 'issue' },
                    { pattern: /must/gi, replacement: 'need to' }
                ]
            }
        };
    }

    /**
     * Extract and preserve images with their positions
     */
    extractImages(content) {
        const images = [];
        let match;
        
        while ((match = this.imageRegex.exec(content)) !== null) {
            images.push({
                original: match[0],
                alt: match[1],
                src: match[2],
                position: match.index,
                placeholder: `__IMAGE_PLACEHOLDER_${images.length}__`
            });
        }
        
        return images;
    }

    /**
     * Replace images with placeholders for transformation
     */
    replaceImagesWithPlaceholders(content, images) {
        let processedContent = content;
        
        // Replace in reverse order to maintain positions
        for (let i = images.length - 1; i >= 0; i--) {
            const image = images[i];
            processedContent = processedContent.replace(image.original, image.placeholder);
        }
        
        return processedContent;
    }

    /**
     * Restore images from placeholders
     */
    restoreImages(content, images) {
        let restoredContent = content;
        
        images.forEach((image, index) => {
            restoredContent = restoredContent.replace(
                `__IMAGE_PLACEHOLDER_${index}__`,
                image.original
            );
        });
        
        return restoredContent;
    }

    /**
     * Apply style guide rules to content
     */
    applyStyleGuideRules(content) {
        let transformedContent = content;

        // Apply tone improvements
        this.styleGuideRules.tone.passiveToActive.forEach(rule => {
            transformedContent = transformedContent.replace(rule.pattern, rule.replacement);
        });

        this.styleGuideRules.tone.positiveFraming.forEach(rule => {
            transformedContent = transformedContent.replace(rule.pattern, rule.replacement);
        });

        // Apply structure improvements
        this.styleGuideRules.structure.uiElements.forEach(rule => {
            transformedContent = transformedContent.replace(rule.pattern, rule.replacement);
        });

        // Apply language improvements
        this.styleGuideRules.language.americanSpelling.forEach(rule => {
            transformedContent = transformedContent.replace(rule.pattern, rule.replacement);
        });

        this.styleGuideRules.language.terminology.forEach(rule => {
            transformedContent = transformedContent.replace(rule.pattern, rule.replacement);
        });

        return transformedContent;
    }

    /**
     * Improve step formatting
     */
    improveStepFormatting(content) {
        return content.replace(this.stepRegex, (match, step) => {
            // Ensure consistent step formatting
            const stepNumber = step.match(/\d+/)[0];
            return `### Step ${stepNumber}:`;
        });
    }

    /**
     * Improve heading structure based on style guide
     */
    improveHeadings(content) {
        return content.replace(this.headingRegex, (match, hashes, title) => {
            // Apply title case and ensure proper formatting
            const level = hashes.length;
            let improvedTitle = title.trim();
            
            // For H2/H3, ensure they follow "How to..." pattern when appropriate
            if (level >= 2 && !improvedTitle.startsWith('Step') && !improvedTitle.startsWith('How to') && !improvedTitle.includes('Troubleshooting')) {
                // Check if it should be a "How to" heading
                if (improvedTitle.includes('Login') || improvedTitle.includes('Access') || improvedTitle.includes('Enter')) {
                    improvedTitle = `How to ${improvedTitle}`;
                }
            }
            
            return `${hashes} ${improvedTitle}`;
        });
    }

    /**
     * Add helpful tips and notes sections
     */
    addTipsAndNotes(content) {
        // Add tips for common patterns
        let enhancedContent = content;

        // Add security tip for password sections
        if (content.toLowerCase().includes('password') && !content.includes('> **Tip**:')) {
            enhancedContent += `\n\n> **Tip**: Use a strong, unique password for enhanced security.\n`;
        }

        // Add note for admin-only features
        if (content.toLowerCase().includes('admin') && !content.includes('> **Note**:') && content.toLowerCase().includes('only')) {
            enhancedContent = enhancedContent.replace(
                /(only.*admin.*can|admin.*only)/gi,
                '\n> **Note**: This feature is available only to Admin users.\n\n$1'
            );
        }

        return enhancedContent;
    }

    /**
     * Transform a single document
     */
    transformDocument(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            console.log(`🔄 Processing: ${path.basename(filePath)}`);

            // Step 1: Extract and preserve images
            const images = this.extractImages(content);
            console.log(`   📷 Found ${images.length} images to preserve`);

            // Step 2: Replace images with placeholders
            let workingContent = this.replaceImagesWithPlaceholders(content, images);

            // Step 3: Apply style guide transformations
            workingContent = this.applyStyleGuideRules(workingContent);
            workingContent = this.improveStepFormatting(workingContent);
            workingContent = this.improveHeadings(workingContent);
            workingContent = this.addTipsAndNotes(workingContent);

            // Step 4: Restore images at their original positions
            const finalContent = this.restoreImages(workingContent, images);

            // Step 5: Write back to file
            fs.writeFileSync(filePath, finalContent);
            console.log(`   ✅ Content improved while preserving ${images.length} images`);

            return {
                success: true,
                imagesPreserved: images.length,
                transformations: this.countTransformations(content, finalContent)
            };

        } catch (error) {
            console.error(`   ❌ Error processing ${filePath}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Count the number of transformations applied
     */
    countTransformations(originalContent, transformedContent) {
        let count = 0;
        
        // Count all rule applications
        Object.values(this.styleGuideRules).forEach(category => {
            Object.values(category).forEach(rules => {
                rules.forEach(rule => {
                    const matches = originalContent.match(rule.pattern);
                    if (matches) count += matches.length;
                });
            });
        });

        return count;
    }
}

/**
 * Batch process multiple documents
 */
async function batchTransformContent(pattern) {
    const glob = require('glob');
    const transformer = new ContentTransformer();
    
    console.log(`🚀 Starting content transformation for: ${pattern}`);
    
    const files = glob.sync(pattern);
    console.log(`📁 Found ${files.length} files to transform`);

    const results = {
        totalFiles: files.length,
        successful: 0,
        failed: 0,
        totalImages: 0,
        totalTransformations: 0
    };

    for (const file of files) {
        const result = transformer.transformDocument(file);
        
        if (result.success) {
            results.successful++;
            results.totalImages += result.imagesPreserved || 0;
            results.totalTransformations += result.transformations || 0;
        } else {
            results.failed++;
        }
    }

    console.log(`\n📊 Content Transformation Summary:`);
    console.log(`   📄 Files processed: ${results.totalFiles}`);
    console.log(`   ✅ Successful: ${results.successful}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   📷 Images preserved: ${results.totalImages}`);
    console.log(`   🔄 Transformations applied: ${results.totalTransformations}`);

    return results;
}

// CLI usage
if (require.main === module) {
    const pattern = process.argv[2];
    if (!pattern) {
        console.log('Usage: node content-transformer.js "docs/**/*.md"');
        process.exit(1);
    }
    
    batchTransformContent(pattern).then(() => {
        console.log('\n💾 Remember to commit your changes!');
    });
}

module.exports = { ContentTransformer, batchTransformContent };