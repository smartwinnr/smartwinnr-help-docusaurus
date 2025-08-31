#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { spawn } = require('child_process');

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

// In-memory conversation storage (replace with database in production)
const conversations = new Map();

console.log('🚀 Starting SmartWinnr Help Center with integrated ChatBot API...');

// API Routes
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'docusaurus-integrated-api',
    version: '1.0.0'
  });
});

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

    // For now, provide a helpful response about SmartWinnr
    const response = {
      message: `Thank you for your question about "${message}". I'm the SmartWinnr Help Assistant. This is a basic echo response - full AI integration will be added shortly. Your question has been logged.`,
      citations: [
        {
          title: 'SmartWinnr Help Documentation',
          url: '/',
          snippet: 'Comprehensive help documentation for SmartWinnr users',
          source: 'help.smartwinnr.com'
        }
      ],
      relatedLinks: [
        {
          title: 'Getting Started Guide',
          url: '/administration',
          description: 'Learn the basics of SmartWinnr administration'
        }
      ],
      confidence: 0.8
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
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});