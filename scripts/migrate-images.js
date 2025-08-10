#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

class ImageMigrator {
  constructor() {
    this.baseDir = path.join(__dirname, '..');
    this.docsDir = path.join(this.baseDir, 'docs');
    this.staticDir = path.join(this.baseDir, 'static');
    this.imgDir = path.join(this.staticDir, 'img');
    this.mappingFile = path.join(this.imgDir, 'image-mapping.json');
    
    this.imageMapping = {
      version: '1.0.0',
      generated: new Date().toISOString(),
      images: []
    };

    this.helpscoutPattern = /!\[([^\]]*)\]\((https:\/\/s3\.amazonaws\.com\/helpscout\.net[^)]+)\)/g;
    this.lhPattern = /!\[([^\]]*)\]\((https:\/\/lh[0-9]\.googleusercontent\.com[^)]+)\)/g;
    this.supportPattern = /!\[([^\]]*)\]\((https:\/\/support\.smartwinnr\.com[^)]+)\)/g;
  }

  async init() {
    console.log('🚀 Starting image migration...');
    
    // Create directory structure
    this.createDirectories();
    
    // Find all markdown files
    const mdFiles = this.findMarkdownFiles(this.docsDir);
    console.log(`📄 Found ${mdFiles.length} markdown files to process`);
    
    // Process each file
    for (const file of mdFiles) {
      await this.processFile(file);
    }
    
    // Save mapping file
    this.saveMappingFile();
    
    console.log('✅ Image migration completed!');
    console.log(`📊 Total images processed: ${this.imageMapping.images.length}`);
    console.log(`🗺️  Mapping file saved: ${this.mappingFile}`);
  }

  createDirectories() {
    const dirs = [
      'getting-started',
      'quizzes', 
      'learning',
      'coaching',
      'competitions',
      'surveys',
      'reports',
      'admin',
      'troubleshooting',
      'common' // for shared images
    ];

    // Create static/img directory
    if (!fs.existsSync(this.imgDir)) {
      fs.mkdirSync(this.imgDir, { recursive: true });
    }

    // Create subdirectories
    dirs.forEach(dir => {
      const dirPath = path.join(this.imgDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Created directory: ${dirPath}`);
      }
    });
  }

  findMarkdownFiles(dir, files = []) {
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.findMarkdownFiles(fullPath, files);
      } else if (entry.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async processFile(filePath) {
    const relativePath = path.relative(this.baseDir, filePath);
    console.log(`🔄 Processing: ${relativePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Process different image URL patterns
    content = await this.processImagePattern(content, this.helpscoutPattern, filePath, 'helpscout');
    content = await this.processImagePattern(content, this.lhPattern, filePath, 'google');
    content = await this.processImagePattern(content, this.supportPattern, filePath, 'support');
    
    // Save file if changes were made
    if (content !== fs.readFileSync(filePath, 'utf8')) {
      fs.writeFileSync(filePath, content);
      console.log(`✏️  Updated: ${relativePath}`);
    }
  }

  async processImagePattern(content, pattern, filePath, source) {
    const matches = [...content.matchAll(pattern)];
    
    for (const match of matches) {
      const [fullMatch, altText, imageUrl] = match;
      
      try {
        const localImageInfo = await this.downloadAndSaveImage(imageUrl, altText, filePath, source);
        
        if (localImageInfo) {
          // Replace the image reference
          const newImageRef = `![${altText}](${localImageInfo.localPath})`;
          content = content.replace(fullMatch, newImageRef);
          
          // Add to mapping
          this.imageMapping.images.push({
            ...localImageInfo,
            original_match: fullMatch,
            alt_text: altText
          });
        }
      } catch (error) {
        console.warn(`⚠️  Failed to process image: ${imageUrl}`, error.message);
      }
    }
    
    return content;
  }

  async downloadAndSaveImage(imageUrl, altText, filePath, source) {
    return new Promise((resolve, reject) => {
      // Determine category based on file path
      const category = this.getCategoryFromPath(filePath);
      
      // Generate filename
      const filename = this.generateFilename(imageUrl, altText, source);
      const localPath = `/img/${category}/${filename}`;
      const fullLocalPath = path.join(this.imgDir, category, filename);
      
      // Skip if file already exists
      if (fs.existsSync(fullLocalPath)) {
        console.log(`📋 Skipping existing file: ${localPath}`);
        resolve({
          localPath,
          filename,
          category,
          source,
          original_url: imageUrl,
          used_in: [path.relative(this.baseDir, filePath)],
          file_size: fs.statSync(fullLocalPath).size,
          downloaded_at: new Date().toISOString()
        });
        return;
      }
      
      console.log(`⬇️  Downloading: ${imageUrl}`);
      
      const file = fs.createWriteStream(fullLocalPath);
      
      https.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          const stats = fs.statSync(fullLocalPath);
          
          console.log(`✅ Downloaded: ${localPath} (${this.formatBytes(stats.size)})`);
          
          resolve({
            localPath,
            filename,
            category,
            source,
            original_url: imageUrl,
            used_in: [path.relative(this.baseDir, filePath)],
            file_size: stats.size,
            downloaded_at: new Date().toISOString(),
            content_type: response.headers['content-type'] || 'unknown'
          });
        });
        
        file.on('error', (err) => {
          fs.unlink(fullLocalPath, () => {}); // Clean up failed download
          reject(err);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  getCategoryFromPath(filePath) {
    const relativePath = path.relative(this.docsDir, filePath);
    const parts = relativePath.split(path.sep);
    
    if (parts.length > 0 && parts[0]) {
      return parts[0];
    }
    
    return 'common';
  }

  generateFilename(imageUrl, altText, source) {
    // Extract original filename if available
    const urlParts = imageUrl.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    
    // Get file extension
    let extension = '.png'; // default
    if (lastPart.includes('.')) {
      const ext = lastPart.split('.').pop().toLowerCase();
      if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
        extension = `.${ext}`;
      }
    }
    
    // Generate descriptive name from alt text
    let name = 'image';
    if (altText && altText.trim()) {
      name = altText
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Remove duplicate hyphens
        .substring(0, 50); // Limit length
    }
    
    // Add source prefix
    name = `${source}-${name}`;
    
    // Generate hash to ensure uniqueness
    const hash = crypto.createHash('md5').update(imageUrl).digest('hex').substring(0, 8);
    
    return `${name}-${hash}${extension}`;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  saveMappingFile() {
    // Sort images by category and filename
    this.imageMapping.images.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.filename.localeCompare(b.filename);
    });
    
    // Add summary statistics
    this.imageMapping.summary = {
      total_images: this.imageMapping.images.length,
      categories: [...new Set(this.imageMapping.images.map(img => img.category))],
      sources: [...new Set(this.imageMapping.images.map(img => img.source))],
      total_size_bytes: this.imageMapping.images.reduce((sum, img) => sum + (img.file_size || 0), 0)
    };
    
    fs.writeFileSync(this.mappingFile, JSON.stringify(this.imageMapping, null, 2));
  }
}

// Run the migration
if (require.main === module) {
  const migrator = new ImageMigrator();
  migrator.init().catch(console.error);
}

module.exports = ImageMigrator;