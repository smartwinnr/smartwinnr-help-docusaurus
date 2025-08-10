import { VectorService } from './vectorService.mjs';
import { configService } from '../config/configService.mjs';
import path from 'path';

export async function indexDocumentation() {
  try {
    console.log('🚀 Starting documentation indexing...');
    
    // Initialize configuration (handles both local env vars and AWS Secrets Manager)
    const config = await configService.initialize();
    configService.validateConfig();

    // Initialize vector service
    const vectorService = new VectorService(
      config.openaiApiKey,
      config.chromaHost,
      config.chromaPort,
      config.embeddingModel
    );
    await vectorService.initialize();

    // Index documentation files
    const docsPath = path.join(process.cwd(), 'docs');
    console.log(`📁 Indexing documentation from: ${docsPath}`);
    
    await vectorService.indexDocumentationFiles(docsPath);
    
    // Get collection info
    const info = await vectorService.getCollectionInfo();
    console.log('✅ Indexing completed successfully!');
    console.log(`📊 Collection: ${info.name}`);
    console.log(`📄 Documents: ${info.documentCount}`);
    console.log(`🤖 Embedding Model: ${info.embeddingModel}`);
    
  } catch (error) {
    console.error('❌ Failed to index documentation:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  indexDocumentation().catch(console.error);
}