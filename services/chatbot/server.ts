import express from 'express';
import cors from 'cors';
import path from 'path';
import { VectorService } from './vectorService.js';
import { ChatService, ChatMessage, UserContext } from './chatService.js';
import { configService } from '../config/configService.js';
import { v4 as uuidv4 } from 'uuid';

const app = express();

// Basic middleware setup (must be before route definitions)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS setup - must be before routes
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Additional CORS handling for preflight requests
app.options('*', cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Global services
let vectorService: VectorService;
let chatService: ChatService;

// In-memory conversation storage (replace with database in production)
const conversations = new Map<string, ChatMessage[]>();

// Initialize services
async function initializeServices() {
  try {
    console.log('🚀 Initializing AI Chatbot Services...');
    
    // Initialize configuration (handles both local env vars and AWS Secrets Manager)
    const config = await configService.initialize();
    
    // Validate configuration
    configService.validateConfig();
    

    // Initialize vector service
    vectorService = new VectorService(
      config.openaiApiKey,
      config.chromaHost,
      config.chromaPort,
      config.embeddingModel
    );
    await vectorService.initialize();

    // Initialize chat service
    chatService = new ChatService(config.openaiApiKey, vectorService);

    console.log('✅ AI Chatbot Services initialized successfully');
    
    // Log configuration (with masked sensitive data)
    const logConfig = configService.getConfigForLogging();
    console.log('📋 Configuration loaded:', {
      environment: logConfig.nodeEnv,
      chatModel: logConfig.chatModel,
      embeddingModel: logConfig.embeddingModel,
      openaiApiKey: logConfig.openaiApiKey,
      apiPort: logConfig.apiPort
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    
    // Provide specific error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('OPENAI_API_KEY')) {
        console.error('\n💡 Quick fix: Add your OpenAI API key to the .env file:');
        console.error('   OPENAI_API_KEY=your_api_key_here\n');
      } else if (error.message.includes('AWS')) {
        console.error('\n💡 AWS Setup required for production:');
        console.error('   1. Create secret in AWS Secrets Manager');
        console.error('   2. Configure IAM permissions');
        console.error('   3. Set AWS_REGION and AWS_SECRET_NAME environment variables\n');
      }
    }
    
    process.exit(1);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  const config = configService.getConfig();
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    services: {
      vectorService: vectorService ? 'ready' : 'not initialized',
      chatService: chatService ? 'ready' : 'not initialized',
      configService: 'ready'
    },
    version: '1.0.0'
  });
});

// Configuration endpoint (for debugging - exclude in production)
app.get('/api/config', (req, res) => {
  try {
    const config = configService.getConfig();
    
    // Only allow in development
    if (config.nodeEnv === 'production') {
      return res.status(403).json({ error: 'Config endpoint not available in production' });
    }
    
    const safeConfig = configService.getConfigForLogging();
    res.json(safeConfig);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get configuration' });
  }
});

// Get collection info
app.get('/api/vector/info', async (req, res) => {
  try {
    const info = await vectorService.getCollectionInfo();
    res.json(info);
  } catch (error) {
    console.error('❌ Error getting collection info:', error);
    res.status(500).json({ error: 'Failed to get collection info' });
  }
});

// Index documentation
app.post('/api/vector/index', async (req, res) => {
  try {
    const docsPath = path.join(process.cwd(), 'docs');
    await vectorService.indexDocumentationFiles(docsPath);
    
    const info = await vectorService.getCollectionInfo();
    res.json({ 
      message: 'Documentation indexed successfully',
      collection: info
    });
  } catch (error) {
    console.error('❌ Error indexing documentation:', error);
    res.status(500).json({ error: 'Failed to index documentation' });
  }
});

// Clear collection
app.delete('/api/vector/clear', async (req, res) => {
  try {
    await vectorService.clearCollection();
    res.json({ message: 'Collection cleared successfully' });
  } catch (error) {
    console.error('❌ Error clearing collection:', error);
    res.status(500).json({ error: 'Failed to clear collection' });
  }
});

// Search documents
app.post('/api/vector/search', async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const results = await vectorService.searchSimilar(query, limit);
    res.json({ results });
  } catch (error) {
    console.error('❌ Error searching documents:', error);
    res.status(500).json({ error: 'Failed to search documents' });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { 
      message, 
      conversationId, 
      userContext = {} 
    }: {
      message: string;
      conversationId?: string;
      userContext?: UserContext;
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation
    const convId = conversationId || uuidv4();
    const history = conversations.get(convId) || [];

    // Add user message to history
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    history.push(userMessage);

    // Generate AI response
    const response = await chatService.generateResponse(
      message,
      userContext,
      history
    );

    // Add AI response to history
    const assistantMessage: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
      citations: response.citations
    };
    history.push(assistantMessage);

    // Store updated conversation
    conversations.set(convId, history);

    res.json({
      conversationId: convId,
      response: response,
      message: assistantMessage
    });

  } catch (error) {
    console.error('❌ Error in chat endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      message: 'I apologize, but I encountered an error. Please try again.'
    });
  }
});

// Get conversation history
app.get('/api/chat/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const history = conversations.get(conversationId) || [];
    
    res.json({
      conversationId,
      messages: history,
      messageCount: history.length
    });
  } catch (error) {
    console.error('❌ Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// Clear conversation
app.delete('/api/chat/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    conversations.delete(conversationId);
    
    res.json({ message: 'Conversation cleared successfully' });
  } catch (error) {
    console.error('❌ Error clearing conversation:', error);
    res.status(500).json({ error: 'Failed to clear conversation' });
  }
});

// Get conversation summary
app.get('/api/chat/:conversationId/summary', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const history = conversations.get(conversationId) || [];
    
    if (history.length === 0) {
      return res.json({ summary: 'No conversation history' });
    }

    const summary = await chatService.getConversationSummary(history);
    res.json({ summary });
  } catch (error) {
    console.error('❌ Error getting conversation summary:', error);
    res.status(500).json({ error: 'Failed to get conversation summary' });
  }
});


// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Unhandled error:', error);
  
  const config = configService.getConfig();
  res.status(500).json({ 
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
async function startServer() {
  // Start the HTTP server first so health endpoint is available
  const config = await configService.initialize();
  
  app.listen(config.apiPort, () => {
    console.log(`🚀 Chatbot API server running on http://localhost:${config.apiPort}`);
    console.log(`📊 Health check: http://localhost:${config.apiPort}/health`);
    console.log(`💬 Chat endpoint: http://localhost:${config.apiPort}/api/chat`);
    console.log(`🔍 Vector search: http://localhost:${config.apiPort}/api/vector/search`);
    
    if (config.nodeEnv === 'development') {
      console.log(`⚙️  Config endpoint: http://localhost:${config.apiPort}/api/config`);
    }
    
    // Initialize services in background after server is running
    initializeServices().catch(error => {
      console.error('❌ Failed to initialize services (server still running):', error);
    });
  });
}

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`🛑 ${signal} received, shutting down gracefully`);
  
  // Close server and cleanup resources
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch(console.error);
}

export default app;