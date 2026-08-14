const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const matter = require('gray-matter');
const { ChromaClient } = require('chromadb');
const { resolveDocRoute } = require('../lib/doc-routes');
const { toIndexableText, synthesizeFromFrontmatter, chunkIndexableText } = require('../lib/doc-text');

const REPO_ROOT = path.join(__dirname, '..');
const DOCS_ROOT = path.join(REPO_ROOT, 'docs');

// Cosine distance, not Chroma's default L2. server.js thresholds (the 0.8
// citation/refusal cutoff, the 1-distance relevance score) were written for
// cosine distances in [0, 2]; against squared-L2 in [0, 4] they were far
// stricter than intended. Applies on collection CREATION only - an existing
// L2 collection keeps its space until FORCE_FULL_REINDEX recreates it.
const COLLECTION_METADATA = { 'hnsw:space': 'cosine' };

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
    
    if (!process.env.INTERNAL_API_KEY) {
      throw new Error('INTERNAL_API_KEY environment variable is required for the indexer');
    }

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
    // Use same-host API - no more cross-service communication!
    // Since internal-indexer runs within the same Docusaurus container
    const API_HOST = process.env.API_HOST || 'localhost';
    const API_PORT = process.env.PORT || process.env.DOCUSAURUS_PORT || '8080'; // Railway uses 8080
    const apiUrl = `http://${API_HOST}:${API_PORT}/api/vector/embed`;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[Embedding] Calling ${apiUrl} (attempt ${attempt}/${retries})`);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-API-Key': process.env.INTERNAL_API_KEY,
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
        console.log('error: ', error);
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
    const relativePath = path.relative(DOCS_ROOT, filePath).replace(/\\/g, '/');

    // Real YAML parse - line regexes misread block scalars (slug: >-), and a
    // misread slug means a citation link to a route that doesn't exist.
    let fm = {};
    try {
      fm = matter(content).data || {};
    } catch (e) {
      console.log(`  ⚠️  Unparseable frontmatter, using filename identity: ${relativePath}`);
    }

    // Drafts aren't routed in a production build - indexing one guarantees a
    // dead citation. Returning null drops it from currentDocs, so the normal
    // delete diff also evicts any vector indexed before the draft flag flipped.
    if (fm.draft === true) {
      console.log(`  ⏭️  Skipping (draft): ${relativePath}`);
      return null;
    }

    // Extract title: prefer frontmatter title, then first heading, then filename
    const headingMatch = content.match(/^#\s+(.+)$/m);
    const fmTitle = typeof fm.title === 'string' && fm.title.trim() ? fm.title.trim() : null;
    const title = fmTitle
      || (headingMatch ? headingMatch[1] : path.basename(filePath).replace(/\.(md|mdx)$/i, ''));

    // The live route, resolved the way Docusaurus resolves it: frontmatter
    // `slug` wins over the filename. Deriving this from the file path is what
    // made the chatbot cite 404s for the ~23% of articles where they differ.
    const { route: url, slug } = resolveDocRoute(filePath, DOCS_ROOT, content);

    // Reduce the body to plain prose. Storing the raw source meant search
    // results and chat citations previewed articles as their own MDX -
    // `import ModuleOverview from '@site/...'` - and the same text was
    // embedded and fed to the model as documentation.
    const body = content.replace(/^---[\s\S]*?---\n/, '').trim();
    let cleanContent = toIndexableText(body);

    // Module landing pages and persona paths are a component invocation and
    // nothing else - their prose is rendered client-side from a manifest. Index
    // their frontmatter instead, so searching "video coaching" can still find
    // the Video Coaching page.
    let synthesized = false;
    if (!cleanContent) {
      cleanContent = synthesizeFromFrontmatter(fm);
      synthesized = !!cleanContent;
    }

    // Skip files with no meaningful body content
    if (!cleanContent) {
      console.log(`  ⏭️  Skipping (no body content): ${relativePath}`);
      return null;
    }
    if (synthesized) {
      console.log(`  ℹ️  Indexing from frontmatter (no prose body): ${relativePath}`);
    }

    // One vector per ~1500-char chunk, not per article: a whole-article
    // embedding averages every topic the article covers, so specific
    // questions matched long articles poorly, and the chat handler could only
    // forward a truncated head of the matched text.
    const chunks = chunkIndexableText(cleanContent);

    // Hash body AND the identity we store alongside it. Hashing the body alone
    // meant a re-slug or re-title never re-embedded the doc, so a stale URL
    // survived every incremental run until someone forced a full reindex.
    const contentHash = this.generateContentHash([cleanContent, title, url].join('\u0000'));

    return {
      id: `doc_${Buffer.from(relativePath).toString('base64')}`, // Use relative path for cross-machine consistency
      content: cleanContent,
      chunks,
      hash: contentHash,
      filePath: relativePath, // Store relative path for tracking
      metadata: {
        title,
        source: relativePath,
        url,
        slug,
        // Frontmatter description - a reliable one-line summary for the UI to
        // show, independent of whatever the body happens to start with.
        description: typeof fm.description === 'string' ? fm.description.trim() : '',
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
        // Delete by source rather than by id: a doc owns one vector per chunk
        // (ids `<docId>::c<n>`), and entries indexed before chunking used the
        // bare `<docId>`. Matching on metadata.source evicts all of them.
        await collection.delete({ where: { source: doc.filePath } });
        console.log(`  ✅ Removed: ${doc.filePath}`);
      } catch (error) {
        console.error(`  ❌ Failed to remove ${doc.filePath}:`, error.message);
      }
      await this.pace();
    }
  }

  /** Pause between HTTP calls. The indexer shares its container (and, for
   *  embeddings, its HTTP server) with the live site - back-to-back calls
   *  starve the authoring endpoints for the whole run. A small gap keeps the
   *  site responsive; a typical post-deploy batch still finishes in seconds. */
  pace(ms) {
    const delay = ms ?? (parseInt(process.env.INDEXER_EMBED_DELAY_MS, 10) || 250);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Process and upsert new/changed documents, one vector per chunk.
   *
   * Per-doc all-or-nothing: if any chunk's embedding fails after retries, none
   * of the doc's chunks are written. A partial write would carry the doc's
   * contentHash into the collection, so the next incremental run would see
   * "unchanged" and never repair the missing chunks. Skipping the whole doc
   * leaves no (or stale) vectors, and the next run retries it as new/changed.
   *
   * Docs flagged `stale` (changed docs, whose vectors already exist) have
   * their old vectors deleted by source right before the upsert - chunk
   * counts can shrink, and upsert alone would leave the surplus chunk ids
   * (and any pre-chunking bare-id entry) serving stale content forever.
   */
  async processChangedDocuments(collection, documents) {
    if (documents.length === 0) return 0;

    console.log(`📝 Processing ${documents.length} new/changed documents...`);

    const batchSize = 10; // docs per upsert
    let processed = 0;

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const batchDocuments = [];
      const batchEmbeddings = [];
      const batchMetadatas = [];
      const batchIds = [];
      const staleSources = [];

      console.log(`📄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(documents.length/batchSize)}`);

      for (const doc of batch) {
        const chunks = (doc.chunks && doc.chunks.length) ? doc.chunks : [doc.content];
        try {
          // Embed every chunk before queuing any of them (see all-or-nothing
          // note above). The embedded text is title-prefixed while the STORED
          // text stays the bare chunk: a mid-article chunk like "Assign
          // Participants: select the users..." says nothing about which
          // feature it belongs to, so without its title it drifts away from
          // queries like "how to create video coaching" that its article
          // should win.
          const title = doc.metadata && doc.metadata.title ? String(doc.metadata.title).trim() : '';
          const embeddings = [];
          for (const chunk of chunks) {
            embeddings.push(await this.generateEmbedding(title ? `${title} - ${chunk}` : chunk));
            await this.pace();
          }

          chunks.forEach((chunk, ci) => {
            batchDocuments.push(chunk);
            batchEmbeddings.push(embeddings[ci]);
            batchMetadatas.push({ ...doc.metadata, chunkIndex: ci, chunkCount: chunks.length });
            batchIds.push(`${doc.id}::c${ci}`);
          });
          if (doc.stale) staleSources.push(doc.filePath);

          processed++;
          console.log(`  ✅ ${doc.filePath} (${chunks.length} chunk${chunks.length === 1 ? '' : 's'})`);
        } catch (error) {
          console.error(`  ❌ Failed to process ${doc.filePath}:`, error.message);
        }
      }

      // Evict the changed docs' old vectors, then upsert the new set.
      for (const source of staleSources) {
        try {
          await collection.delete({ where: { source } });
        } catch (error) {
          console.error(`  ❌ Failed to clear old vectors for ${source}:`, error.message);
        }
        await this.pace();
      }
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
        // Create collection without embedding function since we handle embeddings manually
        collection = await this.chromaClient.createCollection({
          name: this.collectionName,
          metadata: COLLECTION_METADATA
        });
        console.log('✅ Created new collection');
      }
      
      // Get all document files
      const docsDir = DOCS_ROOT;
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
      for (let fi = 0; fi < docFiles.length; fi += 1) {
        try {
          const doc = this.processMarkdownFile(docFiles[fi]);
          if (doc) currentDocs.push(doc);
        } catch (error) {
          console.error(`❌ Failed to process ${docFiles[fi]}:`, error.message);
        }
        // Read+hash of 300+ files back-to-back is a solid IO burst that
        // competes with the live server's own disk reads - break it up.
        if ((fi + 1) % 20 === 0) await this.pace(50);
      }
      
      // Handle force full reindex
      if (forceFullReindex) {
        console.log('🗑️  Performing full reindex - clearing existing collection...');
        const existingCount = await collection.count();
        if (existingCount > 0) {
          await this.chromaClient.deleteCollection({ name: this.collectionName });
          // Create collection without embedding function since we handle embeddings manually
          collection = await this.chromaClient.createCollection({
            name: this.collectionName,
            metadata: COLLECTION_METADATA
          });
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
      
      // 2. Process new and changed documents. Changed docs are flagged so
      //    their existing vectors get evicted before the new chunks land.
      changes.changed.forEach((doc) => { doc.stale = true; });
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