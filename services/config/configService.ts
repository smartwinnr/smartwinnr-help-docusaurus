import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
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
  awsRegion?: string;
  secretName?: string;
}

class ConfigService {
  private config: AppConfig | null = null;
  private secretsClient: SecretsManagerClient | null = null;

  constructor() {
    // Initialize AWS Secrets Manager client for production
    if (this.isProduction()) {
      const region = process.env.AWS_REGION || 'us-east-1';
      this.secretsClient = new SecretsManagerClient({ region });
    }
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
      let openaiApiKey: string;

      if (this.isProduction()) {
        // Production: Get from AWS Secrets Manager
        openaiApiKey = await this.getSecretFromAWS();
      } else {
        // Local/Development: Get from environment variable
        openaiApiKey = this.getSecretFromEnv();
      }

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
        logLevel: process.env.LOG_LEVEL || 'info',
        awsRegion: process.env.AWS_REGION,
        secretName: process.env.AWS_SECRET_NAME
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
        'OPENAI_API_KEY environment variable is required for local development. ' +
        'Please add your OpenAI API key to the .env file:\n' +
        'OPENAI_API_KEY=your_api_key_here'
      );
    }

    if (openaiApiKey.startsWith('sk-') && openaiApiKey.length < 20) {
      console.warn('⚠️ OpenAI API key appears to be incomplete');
    }

    console.log('✅ OpenAI API key loaded from environment variable');
    return openaiApiKey;
  }

  private async getSecretFromAWS(): Promise<string> {
    if (!this.secretsClient) {
      throw new Error('AWS Secrets Manager client not initialized');
    }

    const secretName = process.env.AWS_SECRET_NAME || 'smartwinnr/openai-api-key';
    const secretKey = process.env.AWS_SECRET_KEY || 'OPENAI_API_KEY';

    console.log(`🔐 Retrieving secret from AWS Secrets Manager: ${secretName}`);

    try {
      const command = new GetSecretValueCommand({
        SecretId: secretName,
      });

      const response = await this.secretsClient.send(command);
      
      if (!response.SecretString) {
        throw new Error('Secret value is empty or not found');
      }

      // Parse JSON secret if it contains multiple keys
      let secretValue: string;
      try {
        const secrets = JSON.parse(response.SecretString);
        secretValue = secrets[secretKey];
        
        if (!secretValue) {
          throw new Error(`Key '${secretKey}' not found in secret`);
        }
      } catch (parseError) {
        // If not JSON, treat as plain text secret
        secretValue = response.SecretString;
      }

      if (!secretValue.startsWith('sk-')) {
        throw new Error('Retrieved secret does not appear to be a valid OpenAI API key');
      }

      console.log('✅ OpenAI API key loaded from AWS Secrets Manager');
      return secretValue;

    } catch (error: any) {
      console.error('❌ Failed to retrieve secret from AWS Secrets Manager:', error);
      
      // Provide helpful error messages
      if (error.name === 'ResourceNotFoundException') {
        throw new Error(
          `AWS Secret not found: ${secretName}. ` +
          'Please create the secret in AWS Secrets Manager with your OpenAI API key.'
        );
      }
      
      if (error.name === 'AccessDenied' || error.name === 'UnauthorizedOperation') {
        throw new Error(
          'Access denied to AWS Secrets Manager. Please ensure the IAM role/user has the required permissions:\n' +
          '- secretsmanager:GetSecretValue\n' +
          '- secretsmanager:DescribeSecret'
        );
      }

      throw error;
    }
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

  // Method to refresh secrets (useful for production rotation)
  async refreshSecrets(): Promise<void> {
    if (this.isProduction()) {
      console.log('🔄 Refreshing secrets from AWS Secrets Manager...');
      this.config = null;
      await this.initialize();
    } else {
      console.log('ℹ️ Secret refresh only available in production environment');
    }
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