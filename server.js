#!/usr/bin/env node

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { spawn } = require('child_process');
const axios = require('axios');
const { ChromaClient } = require('chromadb');

const { initAuth, closeAllConnections } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS setup for API routes only
app.use('/api/*', cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Health check endpoint (public — before auth middleware)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'docusaurus-integrated-api',
    version: '1.0.0'
  });
});

// Auth routes (public) + auth middleware (protects everything below)
initAuth(app);

// In-memory conversation storage (replace with database in production)
const conversations = new Map();

// Initialize ChromaDB client
const CHROMA_HOST = process.env.CHROMA_HOST || 'localhost';
const CHROMA_PORT = Number(process.env.CHROMA_PORT || 8000);
const CHROMA_SSL = (process.env.CHROMA_SSL || 'false').toLowerCase() === 'true';

const chromaClient = new ChromaClient({
  host: CHROMA_HOST,
  port: CHROMA_PORT,
  ssl: CHROMA_SSL,
});

const COLLECTION_NAME = process.env.COLLECTION_NAME || 'smartwinnr_docs';
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
const CHAT_MODEL = process.env.CHAT_MODEL || 'gpt-3.5-turbo';

// Get OpenAI API key
const getOpenAIKey = () => {
  const apiKey = process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not found in environment variables');
  }
  return apiKey;
};

console.log('🚀 Starting SmartWinnr Help Center with integrated ChatBot API...');

// API Routes

// OpenAI embedding endpoint (used by indexer)
app.post('/api/vector/embed', async (req, res) => {
  try {
    const { text, model = EMBEDDING_MODEL } = req.body;
    
    if (!text) {
      console.log('⚠️text: ', text, 'model: ', model);
      return res.status(400).json({ error: 'Text is required for embedding' });
    }

    const openaiApiKey = getOpenAIKey();
    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        input: text,
        model: model
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000
      }
    );

    const embedding = response.data.data[0].embedding;
    res.json({ embedding });
  } catch (error) {
    console.error('❌ Error generating embedding:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate embedding',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

// Vector search endpoint (returns list of matching documents)
app.post('/api/vector/search', async (req, res) => {
  try {
    const { query, limit = 8 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required for search' });
    }

    console.log(`🔍 Document search query: "${query}"`);
    
    // Search documents using the same function as chat
    const searchResults = await searchDocuments(query, limit);
    
    // Transform results to match the expected format for the search component
    const results = searchResults.map((doc) => ({
      id: doc.metadata?.source || `doc_${Math.random()}`,
      content: doc.content || '',
      metadata: {
        source: doc.metadata?.source || '',
        title: doc.metadata?.title || (doc.metadata?.source ? doc.metadata.source.replace(/\.md$/, '').replace(/^.*\//, '') : 'Unknown')
      },
      distance: doc.distance || 0
    }));

    console.log(`📄 Found ${results.length} matching documents`);
    
    res.json({ 
      results,
      query,
      total: results.length
    });
  } catch (error) {
    console.error('❌ Error in vector search:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// AI search function
async function searchDocuments(query, limit = 5) {
  try {
    // Generate embedding for the query
    const embeddingResponse = await axios.post(`http://localhost:${PORT}/api/vector/embed`, {
      text: query,
      model: EMBEDDING_MODEL
    });
    
    const queryEmbedding = embeddingResponse.data.embedding;
    
    // Get the collection
    const collection = await chromaClient.getCollection({ name: COLLECTION_NAME });
    
    // Search for similar documents
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: limit,
      include: ['documents', 'metadatas', 'distances']
    });
    
    // Format results
    const documents = [];
    if (results.documents && results.documents[0]) {
      for (let i = 0; i < results.documents[0].length; i++) {
        documents.push({
          content: results.documents[0][i],
          metadata: results.metadatas[0][i],
          distance: results.distances[0][i]
        });
      }
    }
    
    return documents;
  } catch (error) {
    console.error('❌ Error searching documents:', error.message);
    return [];
  }
}

// Generate AI response using OpenAI
async function generateAIResponse(query, context) {
  try {
    const openaiApiKey = getOpenAIKey();
    
    const systemPrompt = `You are the SmartWinnr Help Assistant — a concise, knowledgeable guide to SmartWinnr's features and configuration.

CONTEXT (retrieved from SmartWinnr documentation):
${context}

RESPONSE RULES:
1. Answer using ONLY the context above. If the context lacks the information, say "I don't have specific documentation on that" and suggest where the user might look.
2. Detect the query intent:
   - **How-to / setup query** → respond with numbered step-by-step instructions.
   - **Conceptual / "what is" query** → respond with a brief explanation (2-4 sentences), then key details as bullet points.
   - **Troubleshooting query** → list likely causes and fixes.
3. Keep answers focused and succinct — no filler, no repetition of the question.
4. Format with markdown: use **bold** for UI labels/menu items, \`code\` for field names/values, and headings (###) only when the answer has distinct sections.
5. End with a single actionable follow-up suggestion if appropriate (e.g., "To configure this further, check [Feature Name] settings.").
6. Never fabricate features or settings not present in the context.`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: CHAT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.3,
        max_tokens: 750
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('❌ Error generating AI response:', error.response?.data || error.message);
    throw error;
  }
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId, userContext = {} } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation
    const convId = conversationId || uuidv4();
    const history = conversations.get(convId) || [];

    // Add user message to history
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    history.push(userMessage);

    // Search for relevant documents
    console.log('🔍 Searching for relevant documents...');
    const searchResults = await searchDocuments(message);
    
    // Build context from search results
    let context = '';
    const citations = [];
    
    if (searchResults.length > 0) {
      context = searchResults.map((result, index) => {
        // Add to citations if it's a good match (distance < 0.8)
        if (result.distance < 0.8 && result.metadata) {
          citations.push({
            title: result.metadata.title || 'SmartWinnr Documentation',
            url: result.metadata.url || '/',
            snippet: result.content.substring(0, 150) + '...',
            source: result.metadata.source || 'help.smartwinnr.com'
          });
        }
        
        return `Document ${index + 1}:
Title: ${result.metadata?.title || 'Untitled'}
Content: ${result.content.substring(0, 750)}...
---`;
      }).join('\n\n');
    } else {
      context = 'No specific documentation found for this query.';
    }

    // Generate AI response
    console.log('🤖 Generating AI response...');
    let aiMessage;
    try {
      aiMessage = await generateAIResponse(message, context);
    } catch (aiError) {
      console.error('❌ AI generation failed, using fallback:', aiError.message);
      aiMessage = `I'm sorry, I'm having trouble accessing my AI capabilities right now. However, I can help you find information in our SmartWinnr documentation. Try browsing our sections on getting started, quiz management, or competitions.`;
    }

    const response = {
      message: aiMessage,
      citations: citations.slice(0, 3), // Limit to top 3 citations
      relatedLinks: [
        {
          title: 'Getting Started Guide',
          url: '/administration',
          description: 'Learn the basics of SmartWinnr administration'
        },
        {
          title: 'Quiz Management',
          url: '/quiz',
          description: 'Create and manage quizzes'
        }
      ],
      confidence: citations.length > 0 ? 0.8 : 0.4
    };

    // Add AI response to history
    const assistantMessage = {
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

// Remove public indexing endpoint for security

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

// Serve static files from Docusaurus build
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

// Handle client-side routing - serve index.html for non-API routes
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  res.sendFile(path.join(buildPath, 'index.html'));
});

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SmartWinnr Help Center running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`📚 Documentation: http://localhost:${PORT}/`);
  console.log('');
  console.log('🎉 No more CORS issues - ChatBot API is now integrated!');

  console.log(`[DEBUG] RUN_INDEXER = "${process.env.RUN_INDEXER}" (type: ${typeof process.env.RUN_INDEXER})`);

  if (process.env.RUN_INDEXER === 'true') {
    const forceReindex = process.env.FORCE_FULL_REINDEX === 'true';
    console.log(`🗂️  Spawning internal indexer...${forceReindex ? ' (FORCE_FULL_REINDEX)' : ''}`);
    const indexer = spawn('node', ['scripts/internal-indexer.js'], {
      stdio: 'inherit',
      env: { ...process.env }
    });
    indexer.on('exit', (code) => {
      if (code === 0) {
        console.log('✅ Internal indexer completed successfully');
      } else {
        console.error(`❌ Internal indexer exited with code ${code}`);
      }
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  await closeAllConnections();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  await closeAllConnections();
  process.exit(0);
});