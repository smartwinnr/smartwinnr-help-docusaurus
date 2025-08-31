const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ChromaClient } = require('chromadb');

/**
 * Internal Document Indexer
 * Runs ONLY within Railway's internal network
 * No public API exposure
 */
class InternalIndexer {
  constructor() {
    // Use same environment variables as chatbot-api service
    const CHROMA_HOST = process.env.CHROMA_HOST || 'localhost';
    const CHROMA_PORT = Number(process.env.CHROMA_PORT || 8000);
    const CHROMA_SSL = (process.env.CHROMA_SSL || 'false').toLowerCase() === 'true';

    console.log(`[Chroma] Indexer connecting with host=${CHROMA_HOST} port=${CHROMA_PORT} ssl=${CHROMA_SSL}`);
    
    this.chromaClient = new ChromaClient({
      host: CHROMA_HOST,
      port: CHROMA_PORT,
      ssl: CHROMA_SSL,
    });
    
    this.collectionName = process.env.COLLECTION_NAME || 'smartwinnr_docs';
    this.embeddingModel = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
    
    console.log('🔒 Internal Indexer initialized for Railway internal network only');
  }

  /**
   * Get OpenAI API key from environment
   */
  getOpenAIKey() {
    const apiKey = process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }
    return apiKey;
  }

  /**
   * Generate embedding via internal chatbot-api service
   */
  async generateEmbedding(text, retries = 3) {
    // Use Railway service URL for internal communication
    const CHATBOT_URL = process.env.RAILWAY_SERVICE_CHATBOT_API_URL || 'chatbot-api.railway.internal';
    const apiUrl = `https://${CHATBOT_URL}/api/vector/embed`;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[Embedding] Calling ${apiUrl} (attempt ${attempt}/${retries})`);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, model: this.embeddingModel }),
          timeout: 30000 // 30 second timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result.embedding;
        
      } catch (error) {
        console.error(`❌ Embedding attempt ${attempt}/${retries} failed:`, error.message);
        
        if (attempt < retries) {
          const delay = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Generate content hash for change detection
   */
  generateContentHash(content) {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  }

  /**
   * Process markdown files and extract content with change detection
   */
  processMarkdownFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const stats = fs.statSync(filePath);
    
    // Extract title from first heading or filename
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.md');
    
    // Create relative URL path
    const relativePath = path.relative(path.join(process.cwd(), 'docs'), filePath);
    const url = `/${relativePath.replace(/\.md$/, '').replace(/\\/g, '/')}`;
    
    // Remove frontmatter for processing but include in hash
    const cleanContent = content.replace(/^---[\s\S]*?---\n/, '');
    const contentHash = this.generateContentHash(cleanContent);
    
    return {
      id: `doc_${Buffer.from(filePath).toString('base64')}`, // Use full file path for backward compatibility with existing IDs
      content: cleanContent,
      hash: contentHash,
      filePath: relativePath, // Store relative path for tracking
      metadata: {
        title,
        source: relativePath, // Keep relative path in metadata for consistency
        url,
        lastModified: stats.mtime.toISOString(),
        contentHash,
        type: 'documentation'
      }
    };
  }

  /**
   * Get all markdown files from docs directory
   */
  getDocumentFiles(docsDir) {
    const files = [];
    
    function scanDirectory(dir) {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
          files.push(fullPath);
        }
      }
    }
    
    scanDirectory(docsDir);
    return files;
  }

  /**
   * Get existing documents from ChromaDB with their hashes
   */
  async getExistingDocuments(collection) {
    try {
      const results = await collection.get({
        include: ['metadatas']
      });
      
      const existingDocs = new Map();
      if (results.metadatas) {
        for (let i = 0; i < results.metadatas.length; i++) {
          const metadata = results.metadatas[i];
          if (metadata.source && metadata.contentHash) {
            existingDocs.set(metadata.source, {
              contentHash: metadata.contentHash,
              title: metadata.title,
              url: metadata.url
            });
          }
        }
      }
      
      console.log(`📊 Found ${existingDocs.size} existing documents in collection`);
      return existingDocs;
    } catch (error) {
      console.log('ℹ️  No existing documents found (collection might be empty)');
      return new Map();
    }
  }

  /**
   * Analyze changes between current files and existing documents
   */
  analyzeChanges(currentDocs, existingDocs) {
    const changes = {
      new: [],
      changed: [],
      unchanged: [],
      deleted: []
    };

    // Check current documents against existing ones
    for (const doc of currentDocs) {
      const existing = existingDocs.get(doc.filePath);
      
      if (!existing) {
        changes.new.push(doc);
      } else if (existing.contentHash !== doc.hash) {
        changes.changed.push(doc);
      } else {
        changes.unchanged.push(doc);
      }
    }

    // Find deleted documents (exist in ChromaDB but not in current files)
    const currentFilePaths = new Set(currentDocs.map(doc => doc.filePath));
    for (const [filePath, docInfo] of existingDocs.entries()) {
      if (!currentFilePaths.has(filePath)) {
        changes.deleted.push({
          filePath,
          ...docInfo
        });
      }
    }

    return changes;
  }

  /**
   * Remove deleted documents from ChromaDB
   */
  async removeDeletedDocuments(collection, deletedDocs) {
    if (deletedDocs.length === 0) return;
    
    console.log(`🗑️  Removing ${deletedDocs.length} deleted documents...`);
    
    for (const doc of deletedDocs) {
      try {
        // Convert relative path back to full path for ID consistency
        const fullPath = path.join(process.cwd(), 'docs', doc.filePath);
        const docId = `doc_${Buffer.from(fullPath).toString('base64')}`;
        await collection.delete({ ids: [docId] });
        console.log(`  ✅ Removed: ${doc.filePath}`);
      } catch (error) {
        console.error(`  ❌ Failed to remove ${doc.filePath}:`, error.message);
      }
    }
  }

  /**
   * Process and upsert new/changed documents
   */
  async processChangedDocuments(collection, documents) {
    if (documents.length === 0) return 0;
    
    console.log(`📝 Processing ${documents.length} new/changed documents...`);
    
    const batchSize = 10;
    let processed = 0;
    
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const batchDocuments = [];
      const batchEmbeddings = [];
      const batchMetadatas = [];
      const batchIds = [];
      
      console.log(`📄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(documents.length/batchSize)}`);
      
      for (const doc of batch) {
        try {
          // Generate embedding via internal API
          const embedding = await this.generateEmbedding(doc.content);
          
          batchDocuments.push(doc.content);
          batchEmbeddings.push(embedding);
          batchMetadatas.push(doc.metadata);
          batchIds.push(doc.id);
          
          processed++;
          console.log(`  ✅ ${doc.filePath}`);
        } catch (error) {
          console.error(`  ❌ Failed to process ${doc.filePath}:`, error.message);
        }
      }
      
      // Upsert batch to collection (this will add new or update existing)
      if (batchDocuments.length > 0) {
        try {
          await collection.upsert({
            documents: batchDocuments,
            embeddings: batchEmbeddings,
            metadatas: batchMetadatas,
            ids: batchIds
          });
        } catch (error) {
          console.error(`❌ Failed to upsert batch:`, error.message);
        }
      }
    }
    
    return processed;
  }

  /**
   * Index documents to ChromaDB using incremental updates
   */
  async indexDocuments() {
    try {
      console.log('🚀 Starting incremental document indexing...');
      
      // Check for force full reindex flag
      const forceFullReindex = process.env.FORCE_FULL_REINDEX === 'true';
      if (forceFullReindex) {
        console.log('🔄 Force full reindex requested');
      }
      
      // Wait for ChromaDB to be ready
      await this.waitForChroma();
      
      // Get or create collection
      let collection;
      try {
        collection = await this.chromaClient.getCollection({ name: this.collectionName });
        console.log('✅ Connected to existing collection');
      } catch (error) {
        collection = await this.chromaClient.createCollection({ name: this.collectionName });
        console.log('✅ Created new collection');
      }
      
      // Get all document files
      const docsDir = path.join(process.cwd(), 'docs');
      if (!fs.existsSync(docsDir)) {
        throw new Error(`Docs directory not found: ${docsDir}`);
      }
      
      const docFiles = this.getDocumentFiles(docsDir);
      console.log(`📁 Found ${docFiles.length} document files`);
      
      if (docFiles.length === 0) {
        console.log('⚠️  No documents found to index');
        return;
      }
      
      // Process all current documents and generate hashes
      console.log('🔍 Processing current documents...');
      const currentDocs = [];
      for (const filePath of docFiles) {
        try {
          const doc = this.processMarkdownFile(filePath);
          currentDocs.push(doc);
        } catch (error) {
          console.error(`❌ Failed to process ${filePath}:`, error.message);
        }
      }
      
      // Handle force full reindex
      if (forceFullReindex) {
        console.log('🗑️  Performing full reindex - clearing existing collection...');
        const existingCount = await collection.count();
        if (existingCount > 0) {
          await this.chromaClient.deleteCollection({ name: this.collectionName });
          collection = await this.chromaClient.createCollection({ name: this.collectionName });
        }
        
        const processed = await this.processChangedDocuments(collection, currentDocs);
        console.log(`🎉 Full reindex completed! Processed ${processed}/${currentDocs.length} documents`);
        
        const finalCount = await collection.count();
        console.log(`📊 Collection now contains ${finalCount} documents`);
        return;
      }
      
      // Get existing documents from ChromaDB
      const existingDocs = await this.getExistingDocuments(collection);
      
      // Analyze changes
      const changes = this.analyzeChanges(currentDocs, existingDocs);
      
      // Log change summary
      console.log('📊 Change Analysis:');
      console.log(`  📄 New documents: ${changes.new.length}`);
      console.log(`  📝 Changed documents: ${changes.changed.length}`);
      console.log(`  ✅ Unchanged documents: ${changes.unchanged.length}`);
      console.log(`  🗑️  Deleted documents: ${changes.deleted.length}`);
      
      // Check if any changes exist
      const totalChanges = changes.new.length + changes.changed.length + changes.deleted.length;
      if (totalChanges === 0) {
        console.log('✨ No changes detected - indexing complete!');
        return;
      }
      
      // Apply incremental changes
      let totalProcessed = 0;
      
      // 1. Remove deleted documents
      if (changes.deleted.length > 0) {
        await this.removeDeletedDocuments(collection, changes.deleted);
      }
      
      // 2. Process new and changed documents
      const documentsToProcess = [...changes.new, ...changes.changed];
      if (documentsToProcess.length > 0) {
        totalProcessed = await this.processChangedDocuments(collection, documentsToProcess);
      }
      
      console.log(`🎉 Incremental indexing completed!`);
      console.log(`  📊 Total processed: ${totalProcessed}/${documentsToProcess.length} documents`);
      console.log(`  ⚡ Efficiency: Skipped ${changes.unchanged.length} unchanged documents`);
      
      // Verify collection
      const finalCount = await collection.count();
      console.log(`📊 Collection now contains ${finalCount} documents`);
      
    } catch (error) {
      console.error('❌ Indexing failed:', error);
      throw error;
    }
  }

  /**
   * Wait for ChromaDB to be reachable
   */
  async waitForChroma(maxRetries = 30, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.chromaClient.listCollections();
        console.log('✅ ChromaDB is reachable');
        return;
      } catch (error) {
        console.log(`⏳ Waiting for ChromaDB... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('ChromaDB not reachable after waiting');
  }
}

// Export for use in build scripts
module.exports = { InternalIndexer };

// If run directly, execute indexing
if (require.main === module) {
  const indexer = new InternalIndexer();
  indexer.indexDocuments()
    .then(() => {
      console.log('✅ Internal indexing completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Internal indexing failed:', error);
      process.exit(1);
    });
}