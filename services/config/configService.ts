import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface AppConfig {
  openaiApiKey: string;
  chromaHost: string;
  chromaPort: number;
  apiPort: number;
  corsOrigin: string;
  collectionName: string;
  embeddingModel: string;
  chatModel: string;
  nodeEnv: string;
  logLevel: string;
}

class ConfigService {
  private config: AppConfig | null = null;

  constructor() {
    // Configuration from environment variables
  }

  private isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  private isLocal(): boolean {
    return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local';
  }

  async initialize(): Promise<AppConfig> {
    if (this.config) {
      return this.config;
    }

    console.log(`🔧 Initializing configuration for ${process.env.NODE_ENV} environment...`);

    try {
      // Get OpenAI API key from environment variable
      const openaiApiKey = this.getSecretFromEnv();

      this.config = {
        openaiApiKey,
        chromaHost: process.env.CHROMA_HOST || 'localhost',
        chromaPort: parseInt(process.env.CHROMA_PORT || '8000'),
        apiPort: parseInt(process.env.API_PORT || '3002'),
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
        collectionName: process.env.COLLECTION_NAME || 'smartwinnr_docs',
        embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
        chatModel: process.env.CHAT_MODEL || 'gpt-4o-mini',
        nodeEnv: process.env.NODE_ENV || 'development',
        logLevel: process.env.LOG_LEVEL || 'info'
      };

      console.log('✅ Configuration initialized successfully');
      console.log(`📍 Environment: ${this.config.nodeEnv}`);
      console.log(`🤖 Chat Model: ${this.config.chatModel}`);
      console.log(`🔍 Embedding Model: ${this.config.embeddingModel}`);
      console.log(`💾 Collection: ${this.config.collectionName}`);

      return this.config;

    } catch (error) {
      console.error('❌ Failed to initialize configuration:', error);
      throw error;
    }
  }

  private getSecretFromEnv(): string {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      throw new Error(
        'OPENAI_API_KEY environment variable is required. ' +
        'Please set it in your environment variables or .env file for local development.'
      );
    }

    if (openaiApiKey.startsWith('sk-') && openaiApiKey.length < 20) {
      console.warn('⚠️ OpenAI API key appears to be incomplete');
    }

    console.log('✅ OpenAI API key loaded from environment variable');
    return openaiApiKey;
  }


  getConfig(): AppConfig {
    if (!this.config) {
      throw new Error('Configuration not initialized. Call initialize() first.');
    }
    return this.config;
  }

  // Utility methods for common config values
  getOpenAIApiKey(): string {
    return this.getConfig().openaiApiKey;
  }

  isProductionEnvironment(): boolean {
    return this.getConfig().nodeEnv === 'production';
  }

  // Method to validate configuration
  validateConfig(): void {
    const config = this.getConfig();
    
    const requiredFields = [
      'openaiApiKey',
      'chromaHost', 
      'chromaPort',
      'apiPort',
      'corsOrigin',
      'collectionName',
      'embeddingModel',
      'chatModel'
    ];

    for (const field of requiredFields) {
      if (!config[field as keyof AppConfig]) {
        throw new Error(`Required configuration field missing: ${field}`);
      }
    }

    // Validate OpenAI API key format
    if (!config.openaiApiKey.startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key format');
    }

    // Validate port numbers
    if (config.chromaPort < 1 || config.chromaPort > 65535) {
      throw new Error('Invalid ChromaDB port number');
    }

    if (config.apiPort < 1 || config.apiPort > 65535) {
      throw new Error('Invalid API port number');
    }

    console.log('✅ Configuration validation passed');
  }


  // Method to mask sensitive values for logging
  getConfigForLogging(): Partial<AppConfig> {
    const config = this.getConfig();
    return {
      ...config,
      openaiApiKey: config.openaiApiKey.substring(0, 8) + '...' + config.openaiApiKey.substring(config.openaiApiKey.length - 4)
    };
  }
}

// Export singleton instance
export const configService = new ConfigService();
export default configService;