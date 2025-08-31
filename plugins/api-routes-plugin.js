const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

module.exports = function (context, options) {
  return {
    name: 'api-routes-plugin',
    
    async loadContent() {
      // This runs during the build process
      return null;
    },

    configureWebpack(config, isServer, utils) {
      if (isServer) {
        return {};
      }
      
      return {
        resolve: {
          alias: {
            '@api': path.resolve(__dirname, '../services/docusaurus/src/api')
          }
        }
      };
    },

    async contentLoaded({ content, actions }) {
      // This runs after content is loaded
    },

    getThemePath() {
      return path.resolve(__dirname, './api-theme');
    },

    getClientModules() {
      return [];
    },

    // This is where we add Express middleware to Docusaurus dev server
    configureServer(app) {
      console.log('🔧 Configuring API routes plugin...');
      
      // Import services dynamically
      let VectorService, ChatService, configService;
      
      try {
        // Dynamic import for ES modules
        const vectorServicePath = path.join(__dirname, '../services/docusaurus/src/api/vectorService.ts');
        const chatServicePath = path.join(__dirname, '../services/docusaurus/src/api/chatService.ts');
        const configServicePath = path.join(__dirname, '../services/docusaurus/src/api/config/configService.ts');
        
        // For now, we'll create a simplified version since TypeScript imports are complex in plugins
        console.log('📝 Setting up API routes...');
        
        // In-memory conversation storage
        const conversations = new Map();
        
        // CORS middleware for API routes
        app.use('/api/*', cors({
          origin: true, // Allow all origins for development
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        }));

        // Health check endpoint
        app.get('/api/health', (req, res) => {
          res.json({ 
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'docusaurus-integrated-api',
            version: '1.0.0'
          });
        });

        // Chat endpoint (simplified for now)
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

            // Simple echo response for now (we'll enhance this)
            const response = {
              message: `Echo: ${message}`,
              citations: [],
              relatedLinks: [],
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
        
        console.log('✅ API routes configured successfully');
        
      } catch (error) {
        console.error('❌ Failed to configure API routes:', error);
      }
    }
  };
};