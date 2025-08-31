const fs = require('fs');
const path = require('path');
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
    const CHATBOT_URL = process.env.RAILWAY_SERVICE_CHATBOT_API_URL || 'chatbot-api.railway.internal';
    const CHATBOT_PORT = process.env.CHATBOT_API_PORT || '8080';
    const apiUrl = `http://${CHATBOT_URL}:${CHATBOT_PORT}/api/vector/embed`;
    
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
   * Process markdown files and extract content
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
    
    return {
      id: `doc_${Buffer.from(filePath).toString('base64')}`,
      content: content.replace(/^---[\s\S]*?---\n/, ''), // Remove frontmatter
      metadata: {
        title,
        source: filePath,
        url,
        lastModified: stats.mtime.toISOString(),
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
   * Index all documents to ChromaDB
   */
  async indexDocuments() {
    try {
      console.log('🚀 Starting internal document indexing...');
      
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
      
      // Clear existing documents
      const existingCount = await collection.count();
      if (existingCount > 0) {
        console.log(`🗑️  Clearing ${existingCount} existing documents...`);
        // Note: ChromaDB doesn't have a clear method, so we'll delete and recreate
        await this.chromaClient.deleteCollection({ name: this.collectionName });
        collection = await this.chromaClient.createCollection({ name: this.collectionName });
      }
      
      // Process documents in batches
      const batchSize = 10;
      let indexed = 0;
      
      for (let i = 0; i < docFiles.length; i += batchSize) {
        const batch = docFiles.slice(i, i + batchSize);
        const documents = [];
        const embeddings = [];
        const metadatas = [];
        const ids = [];
        
        console.log(`📄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(docFiles.length/batchSize)}`);
        
        for (const filePath of batch) {
          try {
            const doc = this.processMarkdownFile(filePath);
            
            // Generate embedding via internal API
            const embedding = await this.generateEmbedding(doc.content);
            
            documents.push(doc.content);
            embeddings.push(embedding);
            metadatas.push(doc.metadata);
            ids.push(doc.id);
            
            indexed++;
            console.log(`  ✅ ${path.basename(filePath)}`);
          } catch (error) {
            console.error(`  ❌ Failed to process ${filePath}:`, error.message);
          }
        }
        
        // Add batch to collection
        if (documents.length > 0) {
          await collection.add({
            documents,
            embeddings,
            metadatas,
            ids
          });
        }
      }
      
      console.log(`🎉 Indexing completed! Indexed ${indexed}/${docFiles.length} documents`);
      
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