import { ChromaClient } from 'chromadb';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    title: string;
    section?: string;
    url: string;
    lastModified: string;
  };
}

export interface SearchResult {
  content: string;
  metadata: DocumentChunk['metadata'];
  similarity: number;
}

export class VectorService {
  private client: ChromaClient;
  private collection: any | null = null;
  private openai: OpenAI;
  private embeddingModel: string;

  constructor(openaiApiKey: string, chromaHost?: string, chromaPort?: number, embeddingModel?: string) {
    const CHROMA_HOST = chromaHost || process.env.CHROMA_HOST || 'localhost';
    const CHROMA_PORT = chromaPort || Number(process.env.CHROMA_PORT || 8000);
    const CHROMA_SSL = (process.env.CHROMA_SSL || 'false').toLowerCase() === 'true';

    console.log(`[Chroma] Connecting with host=${CHROMA_HOST} port=${CHROMA_PORT} ssl=${CHROMA_SSL}`);

    this.client = new ChromaClient({
      host: CHROMA_HOST,
      port: CHROMA_PORT,
      ssl: CHROMA_SSL,
    });

    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.embeddingModel = embeddingModel || 'text-embedding-3-small';
  }

  private async waitForChroma(tries = 30, ms = 1000): Promise<void> {
    for (let i = 0; i < tries; i++) {
      try {
        await this.client.listCollections();
        console.log('[Chroma] reachable');
        return;
      } catch (error) {
        console.log(`[Chroma] attempt ${i + 1}/${tries} failed, retrying in ${ms}ms...`);
        await new Promise(r => setTimeout(r, ms));
      }
    }
    throw new Error('Chroma not reachable after waiting.');
  }

  async initialize(): Promise<void> {
    try {
      // Wait for ChromaDB to be available
      await this.waitForChroma();
      
      const collectionName = process.env.COLLECTION_NAME || 'smartwinnr_docs';
      
      // Try to get existing collection or create new one
      try {
        this.collection = await this.client.getCollection({ 
          name: collectionName 
        });
        console.log(`✅ Connected to existing collection: ${collectionName}`);
      } catch (error) {
        this.collection = await this.client.createCollection({
          name: collectionName,
          metadata: {
            description: 'SmartWinnr Documentation Embeddings',
            created: new Date().toISOString()
          },
          embeddingFunction: null // We'll handle embeddings manually with OpenAI
        });
        console.log(`✅ Created new collection: ${collectionName}`);
      }
    } catch (error) {
      console.error('❌ Failed to initialize vector service:', error);
      throw error;
    }
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: text,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('❌ Failed to create embedding:', error);
      throw error;
    }
  }

  async addDocuments(documents: DocumentChunk[]): Promise<void> {
    if (!this.collection) {
      throw new Error('Vector service not initialized');
    }

    try {
      // Create embeddings for all documents
      const embeddings = await Promise.all(
        documents.map(doc => this.createEmbedding(doc.content))
      );

      // Prepare data for ChromaDB
      const ids = documents.map(doc => doc.id);
      const contents = documents.map(doc => doc.content);
      const metadatas = documents.map(doc => ({
        source: doc.metadata.source,
        title: doc.metadata.title,
        section: doc.metadata.section || '',
        url: doc.metadata.url,
        lastModified: doc.metadata.lastModified
      }));

      await this.collection.add({
        ids,
        documents: contents,
        metadatas,
        embeddings
      });
      
      console.log(`✅ Added ${documents.length} documents to vector database`);
    } catch (error) {
      console.error('❌ Failed to add documents:', error);
      throw error;
    }
  }

  async searchSimilar(
    query: string, 
    limit: number = 5,
    filters?: Record<string, any>
  ): Promise<SearchResult[]> {
    try {
      // Refresh collection reference to avoid stale UUID references
      const collectionName = process.env.COLLECTION_NAME || 'smartwinnr_docs';
      const collection = await this.client.getCollection({ name: collectionName });
      
      // Create embedding for the query
      const queryEmbedding = await this.createEmbedding(query);

      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
        where: filters
      });

      if (!results.documents?.[0] || !results.metadatas?.[0] || !results.distances?.[0]) {
        return [];
      }

      const searchResults: SearchResult[] = [];
      
      for (let i = 0; i < results.documents[0].length; i++) {
        const content = results.documents[0][i];
        const metadata = results.metadatas[0][i] as DocumentChunk['metadata'];
        const distance = results.distances[0][i];
        
        // Convert distance to similarity (higher is better)
        const similarity = Math.max(0, 1 - distance);

        searchResults.push({
          content,
          metadata,
          similarity
        });
      }

      return searchResults.sort((a, b) => b.similarity - a.similarity);
    } catch (error) {
      console.error('❌ Failed to search documents:', error);
      throw error;
    }
  }

  async indexDocumentationFiles(docsPath: string): Promise<void> {
    console.log('🔄 Starting documentation indexing...');
    
    const documents: DocumentChunk[] = [];
    
    // Recursively read markdown files
    const readMarkdownFiles = (dirPath: string, baseUrl: string = '') => {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          const subUrl = baseUrl + '/' + entry.name;
          readMarkdownFiles(fullPath, subUrl);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const relativePath = path.relative(docsPath, fullPath);
          
          // Extract title from frontmatter or first heading
          const titleMatch = content.match(/^#\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1] : entry.name.replace('.md', '');
          
          // Create URL from file path
          const urlPath = relativePath
            .replace(/\.md$/, '')
            .replace(/\/index$/, '')
            .replace(/\\/g, '/');
          const url = baseUrl + '/' + urlPath;
          
          // Split content into chunks (simple approach - by paragraphs)
          const chunks = this.splitIntoChunks(content, title);
          
          chunks.forEach((chunk, index) => {
            documents.push({
              id: uuidv4(),
              content: chunk,
              metadata: {
                source: relativePath,
                title,
                section: index > 0 ? `${title} - Part ${index + 1}` : title,
                url,
                lastModified: fs.statSync(fullPath).mtime.toISOString()
              }
            });
          });
        }
      }
    };

    readMarkdownFiles(docsPath);
    
    if (documents.length > 0) {
      await this.addDocuments(documents);
      console.log(`✅ Indexed ${documents.length} document chunks from ${docsPath}`);
    } else {
      console.log('⚠️ No documents found to index');
    }
  }

  private splitIntoChunks(content: string, title: string): string[] {
    // Remove frontmatter
    const cleanContent = content.replace(/^---[\s\S]*?---\n/, '');
    
    // Split by double newlines (paragraphs)
    const paragraphs = cleanContent.split(/\n\s*\n/);
    
    const chunks: string[] = [];
    let currentChunk = `# ${title}\n\n`;
    const maxChunkSize = 1500; // characters
    
    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (!trimmed) continue;
      
      // If adding this paragraph would exceed max size, start new chunk
      if (currentChunk.length + trimmed.length > maxChunkSize && currentChunk.length > 100) {
        chunks.push(currentChunk.trim());
        currentChunk = `# ${title}\n\n`;
      }
      
      currentChunk += trimmed + '\n\n';
    }
    
    // Add final chunk
    if (currentChunk.trim().length > 100) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks.length > 0 ? chunks : [cleanContent];
  }

  async clearCollection(): Promise<void> {
    if (!this.collection) {
      throw new Error('Vector service not initialized');
    }

    try {
      await this.client.deleteCollection({
        name: process.env.COLLECTION_NAME || 'smartwinnr_docs'
      });
      console.log('✅ Cleared vector database collection');
      
      // Reinitialize
      await this.initialize();
    } catch (error) {
      console.error('❌ Failed to clear collection:', error);
      throw error;
    }
  }

  async getCollectionInfo(): Promise<any> {
    try {
      // Refresh collection reference to avoid stale UUID references
      const collectionName = process.env.COLLECTION_NAME || 'smartwinnr_docs';
      const collection = await this.client.getCollection({ name: collectionName });
      
      const count = await collection.count();
      return {
        name: collectionName,
        documentCount: count,
        embeddingModel: this.embeddingModel
      };
    } catch (error) {
      console.error('❌ Failed to get collection info:', error);
      throw error;
    }
  }
}