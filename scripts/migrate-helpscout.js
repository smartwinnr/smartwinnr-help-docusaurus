#!/usr/bin/env node
const axios = require('axios');
const TurndownService = require('turndown');
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
require('dotenv').config();

class HelpScoutMigrator {
  constructor() {
    this.apiKey = process.env.HELPSCOUT_API_KEY;
    this.baseUrl = 'https://docsapi.helpscout.net/v1';
    this.outputDir = path.join(__dirname, '../docs');
    this.imagesDir = path.join(__dirname, '../static/img/helpscout');
    
    if (!this.apiKey) {
      throw new Error('HELPSCOUT_API_KEY not found in environment variables');
    }
    
    // Initialize Turndown service for HTML to Markdown conversion
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });
    
    // Category mapping from HelpScout to your folder structure
    this.categoryMapping = {
      // Add your HelpScout category IDs to folder mappings here
      // Example: 'category-id': 'folder-name'
    };
    
    console.log('HelpScout Migrator initialized');
  }

  async makeRequest(endpoint, params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        auth: {
          username: this.apiKey,
          password: 'X' // HelpScout uses API key as username, any password
        },
        params
      });
      
      // Respect rate limits
      if (response.headers['x-ratelimit-remaining']) {
        const remaining = parseInt(response.headers['x-ratelimit-remaining']);
        if (remaining < 10) {
          console.log('Rate limit approaching, waiting 30 seconds...');
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
      }
      
      return response.data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async fetchCollections() {
    console.log('Fetching collections from HelpScout...');
    const data = await this.makeRequest('/collections');
    return data.collections?.items || [];
  }

  async fetchArticlesFromCollection(collectionId) {
    console.log(`Fetching articles from collection ${collectionId}...`);
    let allArticles = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const data = await this.makeRequest(`/collections/${collectionId}/articles`, { 
        page, 
        status: 'all',
        pageSize: 50 
      });
      
      if (data.articles && data.articles.items) {
        allArticles = allArticles.concat(data.articles.items);
        
        // Check if there are more pages
        hasMore = data.articles.page < data.articles.pages;
        page++;
      } else {
        hasMore = false;
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return allArticles;
  }

  async fetchAllArticles() {
    console.log('Fetching all articles from HelpScout...');
    let allArticles = [];
    
    // First get all collections
    const collections = await this.fetchCollections();
    console.log(`Found ${collections.length} collections`);
    
    // Then fetch articles from each collection
    for (const collection of collections) {
      console.log(`Processing collection: ${collection.name}`);
      const articles = await this.fetchArticlesFromCollection(collection.id);
      
      // Add collection info to each article for better categorization
      articles.forEach(article => {
        article.collectionName = collection.name;
        article.collectionId = collection.id;
      });
      
      allArticles = allArticles.concat(articles);
    }

    console.log(`Fetched ${allArticles.length} articles total`);
    return allArticles;
  }

  async fetchArticleDetails(articleId) {
    console.log(`Fetching details for article ${articleId}...`);
    const data = await this.makeRequest(`/articles/${articleId}`);
    return data.article;
  }

  async downloadImage(imageUrl, filename) {
    try {
      const response = await axios.get(imageUrl, { responseType: 'stream' });
      await fs.ensureDir(this.imagesDir);
      const imagePath = path.join(this.imagesDir, filename);
      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(imagePath));
        writer.on('error', reject);
      });
    } catch (error) {
      console.warn(`Failed to download image ${imageUrl}:`, error.message);
      return null;
    }
  }

  async processImages(html, articleSlug) {
    const $ = cheerio.load(html);
    const images = [];
    
    $('img').each(async (index, element) => {
      const src = $(element).attr('src');
      if (src && src.startsWith('http')) {
        const filename = `${articleSlug}-${index}.${src.split('.').pop().split('?')[0]}`;
        const localPath = await this.downloadImage(src, filename);
        
        if (localPath) {
          $(element).attr('src', `/img/helpscout/${filename}`);
          images.push({ original: src, local: filename });
        }
      }
    });
    
    return { html: $.html(), images };
  }

  determineFolderForArticle(article) {
    // Try to map by category if available
    if (article.collectionId && this.categoryMapping[article.collectionId]) {
      return this.categoryMapping[article.collectionId];
    }
    
    // Fallback: analyze article title/content for keywords
    const title = article.name.toLowerCase();
    const text = article.text ? article.text.toLowerCase() : '';
    
    if (title.includes('quiz') || text.includes('quiz')) return 'quiz';
    if (title.includes('microlearning') || text.includes('microlearning')) return 'microlearning';
    if (title.includes('survey') || text.includes('survey')) return 'surveys';
    if (title.includes('competition') || text.includes('competition')) return 'competitions';
    if (title.includes('kpi') || title.includes('gamification')) return 'kpi-gamification';
    if (title.includes('smartpath') || title.includes('smart path')) return 'smartpath';
    if (title.includes('coaching') || text.includes('coaching')) return 'coaching';
    if (title.includes('report') || text.includes('report')) return 'reports';
    if (title.includes('user') || title.includes('admin')) return 'users';
    if (title.includes('form') || text.includes('form')) return 'forms';
    
    // Default folder
    return 'getting-started';
  }

  createSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async convertArticleToMarkdown(article) {
    console.log(`Converting article: ${article.name}`);
    
    // Process images first
    const { html: processedHtml, images } = await this.processImages(article.text, this.createSlug(article.name));
    
    // Convert to markdown
    const markdown = this.turndown.turndown(processedHtml);
    
    // Create frontmatter
    const lastUpdateDate = article.modifiedAt ? new Date(article.modifiedAt * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    const frontmatter = [
      '---',
      `title: "${article.name.replace(/"/g, '\\"')}"`,
      `description: "${(article.preview || '').replace(/"/g, '\\"')}"`,
      `slug: ${this.createSlug(article.name)}`,
      `sidebar_position: ${article.number || 1}`,
      `last_update:`,
      `  date: ${lastUpdateDate}`,
      `  author: HelpScout Migration`,
      `helpscout_id: ${article.id}`,
      `helpscout_url: ${article.publicUrl || ''}`,
      '---',
      ''
    ].join('\n');
    
    return {
      content: frontmatter + markdown,
      folder: this.determineFolderForArticle(article),
      filename: `${this.createSlug(article.name)}.md`,
      images
    };
  }

  async migrateArticle(articleSummary) {
    try {
      // Fetch full article details
      const article = await this.fetchArticleDetails(articleSummary.id);
      
      // Convert to markdown
      const { content, folder, filename, images } = await this.convertArticleToMarkdown(article);
      
      // Ensure target directory exists
      const targetDir = path.join(this.outputDir, folder);
      await fs.ensureDir(targetDir);
      
      // Write markdown file
      const filePath = path.join(targetDir, filename);
      await fs.writeFile(filePath, content, 'utf8');
      
      console.log(`✓ Migrated: ${article.name} → ${folder}/${filename}`);
      
      return {
        id: article.id,
        title: article.name,
        folder,
        filename,
        images: images.length,
        status: 'success'
      };
    } catch (error) {
      console.error(`✗ Failed to migrate article ${articleSummary.id}:`, error.message);
      return {
        id: articleSummary.id,
        title: articleSummary.name || 'Unknown',
        status: 'failed',
        error: error.message
      };
    }
  }

  async run(testMode = false) {
    console.log('🚀 Starting HelpScout migration...\n');
    
    try {
      // Create necessary directories
      await fs.ensureDir(this.outputDir);
      await fs.ensureDir(this.imagesDir);
      
      // Fetch all articles
      const articles = await this.fetchAllArticles();
      
      if (articles.length === 0) {
        console.log('No articles found in HelpScout');
        return;
      }
      
      // Limit to 3 articles for testing
      const articlesToProcess = testMode ? articles.slice(0, 3) : articles;
      
      console.log(`\n📝 Starting migration of ${articlesToProcess.length} articles${testMode ? ' (test mode)' : ''}...\n`);
      
      const results = [];
      for (let i = 0; i < articlesToProcess.length; i++) {
        const article = articlesToProcess[i];
        console.log(`[${i + 1}/${articlesToProcess.length}] Processing: ${article.name}`);
        
        const result = await this.migrateArticle(article);
        results.push(result);
        
        // Small delay between articles
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Generate migration report
      const successful = results.filter(r => r.status === 'success');
      const failed = results.filter(r => r.status === 'failed');
      
      console.log('\n📊 Migration Summary:');
      console.log(`✓ Successful: ${successful.length}`);
      console.log(`✗ Failed: ${failed.length}`);
      
      if (failed.length > 0) {
        console.log('\nFailed articles:');
        failed.forEach(f => console.log(`  - ${f.title}: ${f.error}`));
      }
      
      // Save migration report
      const reportPath = path.join(__dirname, 'migration-report.json');
      await fs.writeFile(reportPath, JSON.stringify({ 
        summary: { successful: successful.length, failed: failed.length },
        results 
      }, null, 2));
      
      console.log(`\n📄 Migration report saved to: ${reportPath}`);
      console.log('\n🎉 Migration completed!');
      
    } catch (error) {
      console.error('💥 Migration failed:', error.message);
      process.exit(1);
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  const migrator = new HelpScoutMigrator();
  const testMode = process.argv.includes('--test');
  migrator.run(testMode).catch(console.error);
}

module.exports = HelpScoutMigrator;