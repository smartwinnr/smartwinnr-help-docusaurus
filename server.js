#!/usr/bin/env node

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { spawn } = require('child_process');
const axios = require('axios');
const { ChromaClient } = require('chromadb');

const { initAuth } = require('./auth');
const { requireRole } = require('./auth/requireRole');
const chatLogger = require('./db/chat-logger');
const feedbackLogger = require('./db/feedback-logger');
const digestStore = require('./db/digest-store');
const { sendDigest, previewDigest } = require('./db/digest-send');
const { gradeMarkdown } = require('./db/article-audit');
const { isAllowed } = require('./shared/access-policy.cjs');
const fsSync = require('fs');

const PRIVACY_NOTICE_VERSION = '1.0';

const app = express();
const PORT = process.env.PORT || 3001;
// const PORT = 3001; // Dev

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

// Health check endpoint (public - before auth middleware)
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

// Current user - sole endpoint the React client calls on mount to hydrate
// UserContext for role/privilege-based sidebar gating.
app.get('/api/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  res.json({
    email: req.user.email,
    displayName: req.user.displayName || null,
    roles: req.user.roles || [],
    region: req.user.region || null,
    orgId: req.user.orgId || null,
    orgName: req.user.orgName || null,
    privileges: req.user.privileges || [],
  });
});

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
    const searchResults = await searchDocuments(query, limit, req.user);
    
    // Transform results to match the expected format for the search component
    const results = searchResults.map((doc) => ({
      id: doc.metadata?.source || `doc_${Math.random()}`,
      content: doc.content || '',
      metadata: {
        source: doc.metadata?.source || '',
        title: doc.metadata?.title || (doc.metadata?.source ? doc.metadata.source.replace(/\.md$/, '').replace(/^.*\//, '') : 'Unknown'),
        url: doc.metadata?.url || ''
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
async function searchDocuments(query, limit = 5, user = null) {
  try {
    // Generate embedding for the query
    const embeddingResponse = await axios.post(`http://localhost:${PORT}/api/vector/embed`, {
      text: query,
      model: EMBEDDING_MODEL
    }, {
      headers: {
        'X-Internal-API-Key': process.env.INTERNAL_API_KEY,
      }
    });

    const queryEmbedding = embeddingResponse.data.embedding;

    // Get the collection
    const collection = await chromaClient.getCollection({ name: COLLECTION_NAME });

    // Over-fetch when we'll be gate-filtering, so a few blocked results
    // don't starve the chatbot of context. 2x buffer is enough for typical
    // orgs; if filtering leaves zero docs, callers see an empty array and
    // the chat handler emits its standard "no documentation" refusal.
    const fetchN = user ? Math.max(limit * 2, limit + 4) : limit;

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: fetchN,
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

    // Gate filter - drops docs the viewer can't open so search + chat
    // citations stay consistent with what the URL guard would serve.
    // Doc-shape metadata.url is the canonical path (e.g. /modules/quiz/...).
    // When user is null (internal indexer calls) the filter is skipped.
    const filtered = user
      ? documents.filter((d) => {
          const url = d && d.metadata && d.metadata.url;
          if (!url) return true; // no URL means we can't gate; pass through
          return isUrlAllowedForUser(url, user);
        })
      : documents;

    return filtered.slice(0, limit);
  } catch (error) {
    console.error('❌ Error searching documents:', error.message);
    return [];
  }
}

// Calculate continuous relevance score for logging (0.1–1.0)
function calculateRelevanceScore(searchResults, citations) {
  if (searchResults.length === 0) return 0.1;
  const bestDistance = Math.min(...searchResults.map(r => r.distance));
  const distanceScore = Math.max(0, 1 - bestDistance);
  const citationBonus = Math.min(citations.length / 3, 1) * 0.2;
  const score = (distanceScore * 0.8) + citationBonus;
  return Math.round(score * 100) / 100;
}

// Wynnie's system prompt lives in prompts/wynnie.md so non-engineers can
// iterate on voice without touching server code. Cached at module init -
// changes require a process restart, same as other config.
const WYNNIE_PROMPT_PATH = require('path').join(__dirname, 'prompts', 'wynnie.md');
let _wynniePromptTemplate = null;
function getWynniePromptTemplate() {
  if (_wynniePromptTemplate) return _wynniePromptTemplate;
  try {
    _wynniePromptTemplate = require('fs').readFileSync(WYNNIE_PROMPT_PATH, 'utf8');
  } catch (e) {
    console.error('⚠️  Failed to read prompts/wynnie.md - falling back to inline prompt:', e.message);
    _wynniePromptTemplate =
      'You are Wynnie, SmartWinnr\'s help assistant.\n\n' +
      'CONTEXT (retrieved from SmartWinnr documentation):\n{{CONTEXT}}\n\n' +
      'Answer using ONLY the context. Address the user as "you". If the context\n' +
      'is silent, say "I don\'t have docs on that yet" and suggest where to look.';
  }
  return _wynniePromptTemplate;
}

// How many prior turns of conversation to forward to OpenAI. 6 turns
// (typically 3 user + 3 assistant) threads typical follow-ups
// ("step 2 didn't work") without ballooning prompt-token cost.
const CHAT_HISTORY_TURNS = 6;

// Generate AI response using OpenAI. `history` is the running array of
// {role, content} turns for the conversation; we forward only the tail so
// follow-ups read as a thread instead of isolated answers.
async function generateAIResponse(query, context, history = []) {
  try {
    const openaiApiKey = getOpenAIKey();

    const systemPrompt = getWynniePromptTemplate().replace('{{CONTEXT}}', context);

    const priorTurns = Array.isArray(history)
      ? history
          .slice(-CHAT_HISTORY_TURNS)
          .filter((t) => t && (t.role === 'user' || t.role === 'assistant') && typeof t.content === 'string')
          .map((t) => ({ role: t.role, content: t.content }))
      : [];

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: CHAT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...priorTurns,
          { role: 'user', content: query }
        ],
        temperature: 0.5,
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

    return {
      message: response.data.choices[0].message.content,
      usage: response.data.usage || null,
    };
  } catch (error) {
    console.error('❌ Error generating AI response:', error.response?.data || error.message);
    throw error;
  }
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();
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
    const searchResults = await searchDocuments(message, 5, req.user);

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
    let aiUsage = null;
    let isFallback = false;
    try {
      // `history` already includes the just-pushed user message; slice it
      // off so generateAIResponse appends `query` once, not twice.
      const priorHistory = history.slice(0, -1);
      const aiResult = await generateAIResponse(message, context, priorHistory);
      aiMessage = aiResult.message;
      aiUsage = aiResult.usage;
    } catch (aiError) {
      console.error('❌ AI generation failed, using fallback:', aiError.message);
      isFallback = true;
      aiMessage = `I'm sorry, I'm having trouble accessing my AI capabilities right now. However, I can help you find information in our SmartWinnr documentation. Try browsing our sections on getting started, quiz management, or competitions.`;
    }

    const topDocDistance = searchResults.length > 0
      ? Math.min(...searchResults.map(r => r.distance))
      : null;

    // V2: distinguish a documentation refusal (no useful context found) from
    // an isFallback (OpenAI itself errored, handled above). is_refusal=1 when
    // search returned no results OR every result was too distant to be useful.
    // The chat-handler doesn't know what "useful" means to the model, so we
    // approximate with the same 0.8 distance threshold used for citation
    // inclusion - if nothing crossed that bar, the answer is necessarily a
    // "sorry I don't have docs on that" refusal even if the LLM call succeeded.
    const isRefusal = !isFallback && (
      searchResults.length === 0
      || searchResults.every(r => typeof r.distance !== 'number' || r.distance >= 0.8)
    );

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
      confidence: citations.length > 0 ? 0.8 : 0.4,
      relevanceScore: calculateRelevanceScore(searchResults, citations)
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

    // Async log to SQLite (never blocks the response)
    const responseTimeMs = Date.now() - startTime;
    const exchangeId = assistantMessage.id; // reuse as exchange ID
    process.nextTick(() => {
      chatLogger.logExchange({
        exchangeId,
        conversationId: convId,
        isRefusal,
        userQuery: message,
        aiResponse: aiMessage,
        confidence: response.confidence,
        relevanceScore: response.relevanceScore,
        citations: response.citations,
        numDocsRetrieved: searchResults.length,
        topDocDistance,
        pageUrl: userContext.pageUrl || null,
        responseTimeMs,
        isFallback,
        promptTokens: aiUsage?.prompt_tokens || null,
        completionTokens: aiUsage?.completion_tokens || null,
        userEmail: req.user?.email || null,
        userDisplayName: req.user?.displayName || null,
        orgId: req.user?.orgId || null,
        orgName: req.user?.orgName || null,
        userRoles: Array.isArray(req.user?.roles) ? req.user.roles : null,
        userPrivileges: Array.isArray(req.user?.privileges) ? req.user.privileges : null,
        userAgent: req.headers['user-agent'] || null,
        chatModel: CHAT_MODEL,
        consentVersion: PRIVACY_NOTICE_VERSION,
      });
    });

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

// Rate a chat exchange (no auth required - any chat user can rate)
app.post('/api/chat/:exchangeId/rate', (req, res) => {
  try {
    const { exchangeId } = req.params;
    const { rating } = req.body;
    if (rating !== 1 && rating !== -1) {
      return res.status(400).json({ error: 'Rating must be 1 or -1' });
    }
    const updated = chatLogger.rateExchange(exchangeId, rating);
    if (!updated) {
      return res.status(404).json({ error: 'Exchange not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error rating exchange:', error);
    res.status(500).json({ error: 'Failed to rate exchange' });
  }
});

// Record that a user clicked a citation URL from a chat exchange. V2 input
// to the Article Performance CTR column. Fire-and-forget from the client;
// no auth beyond the normal session cookie (same trust level as /rate).
app.post('/api/chat/:exchangeId/citation-click', (req, res) => {
  try {
    const { exchangeId } = req.params;
    const url = req.body && typeof req.body.url === 'string' ? req.body.url : null;
    if (!url || !url.startsWith('/')) {
      return res.status(400).json({ error: 'url must be a root-relative path' });
    }
    const ok = chatLogger.recordCitationClick(exchangeId, url);
    if (!ok) {
      return res.status(404).json({ error: 'Exchange not found or click not recorded' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error recording citation click:', error);
    res.status(500).json({ error: 'Failed to record citation click' });
  }
});

// ---------------------------------------------------------------------------
// Admin chat-log endpoints (require superadmin role)
// ---------------------------------------------------------------------------

app.use('/api/admin/chat-logs', requireRole('superadmin'));

// Paginated recent exchanges
app.get('/api/admin/chat-logs', (req, res) => {
  try {
    chatLogger.auditLog(req, 'view_logs');
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const offset = parseInt(req.query.offset || '0', 10);
    const exchanges = chatLogger.getRecentExchanges(limit, offset);
    res.json({ exchanges, limit, offset });
  } catch (error) {
    console.error('❌ Error fetching chat logs:', error);
    res.status(500).json({ error: 'Failed to fetch chat logs' });
  }
});

// Low-confidence exchanges
app.get('/api/admin/chat-logs/low-confidence', (req, res) => {
  try {
    chatLogger.auditLog(req, 'view_low_confidence');
    const threshold = parseFloat(req.query.threshold || '0.5');
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const exchanges = chatLogger.getLowConfidenceExchanges(threshold, limit);
    res.json({ exchanges, threshold, limit });
  } catch (error) {
    console.error('❌ Error fetching low-confidence logs:', error);
    res.status(500).json({ error: 'Failed to fetch low-confidence logs' });
  }
});

// Summary stats
app.get('/api/admin/chat-logs/stats', (req, res) => {
  try {
    chatLogger.auditLog(req, 'view_stats');
    const days = parseInt(req.query.days || '30', 10);
    const stats = chatLogger.getStats(days);
    const queryTypes = chatLogger.getQueryTypeStats(days);
    res.json({ stats, queryTypes, days });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Aggregate dashboard data for /admin/analytics/chat - one round trip
// returns everything the page needs. Pulls existing helpers (getStats,
// getQueryTypeStats, getHealth) plus the two new aggregations
// (top unanswered queries, article performance from citations).
app.get('/api/admin/chat-logs/dashboard', (req, res) => {
  try {
    chatLogger.auditLog(req, 'view_dashboard');
    const days = Math.min(Math.max(parseInt(req.query.days || '30', 10), 1), 365);
    const minCitations = Math.max(parseInt(req.query.minCitations || '3', 10), 1);
    // V3 filters: optional. Empty string is treated as "no filter" so the
    // client can send a single param shape for both states.
    const role = (req.query.role && String(req.query.role).trim()) || undefined;
    const orgId = (req.query.orgId && String(req.query.orgId).trim()) || undefined;
    const filter = {role, orgId};
    res.json({
      ok: true,
      windowDays: days,
      filter: {role: role || null, orgId: orgId || null},
      stats: chatLogger.getStats(days, filter),
      queryTypes: chatLogger.getQueryTypeStats(days, filter),
      topUnanswered: chatLogger.getTopUnansweredQueries({days, limit: 25, ...filter}),
      articlePerformance: chatLogger.getArticlePerformance({days, minCitations, limit: 50, ...filter}),
      abandonment: chatLogger.getAbandonmentStats({days, ...filter}),
      availableOrgs: chatLogger.getAvailableOrgs({days}),
      health: chatLogger.getHealth(),
    });
  } catch (error) {
    console.error('❌ Error fetching chat dashboard:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch dashboard data' });
  }
});

// Health & metrics
app.get('/api/admin/chat-logs/health', (req, res) => {
  try {
    chatLogger.auditLog(req, 'view_health');
    const health = chatLogger.getHealth();
    res.json(health);
  } catch (error) {
    console.error('❌ Error fetching health:', error);
    res.status(500).json({ error: 'Failed to fetch health' });
  }
});

// Export (JSON)
app.get('/api/admin/chat-logs/export', (req, res) => {
  try {
    chatLogger.auditLog(req, 'export');
    const { from, to, anonymize } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to query params required (ISO dates)' });
    }
    const data = chatLogger.exportToJSON(from, to, anonymize === 'true');
    res.json({ data, count: data.length, from, to, anonymized: anonymize === 'true' });
  } catch (error) {
    console.error('❌ Error exporting chat logs:', error);
    res.status(500).json({ error: 'Failed to export chat logs' });
  }
});

// GDPR: Delete conversation
app.delete('/api/admin/chat-logs/:conversationId', (req, res) => {
  try {
    chatLogger.auditLog(req, 'delete_conversation');
    const deleted = chatLogger.deleteConversation(req.params.conversationId);
    if (!deleted) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json({ success: true, conversationId: req.params.conversationId });
  } catch (error) {
    console.error('❌ Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// GDPR: Delete by email
app.delete('/api/admin/chat-logs/by-email/:email', (req, res) => {
  try {
    chatLogger.auditLog(req, 'delete_by_email');
    const count = chatLogger.deleteByEmail(req.params.email);
    res.json({ success: true, deletedConversations: count, email: req.params.email });
  } catch (error) {
    console.error('❌ Error deleting by email:', error);
    res.status(500).json({ error: 'Failed to delete by email' });
  }
});

// ---------------------------------------------------------------------------
// Article feedback ("Was this helpful?")
// ---------------------------------------------------------------------------

// Public - any signed-in viewer can vote.
app.post('/api/feedback', (req, res) => {
  try {
    const { slug, vote, comment } = req.body || {};
    if (!slug || (vote !== 'up' && vote !== 'down')) {
      return res.status(400).json({ error: 'Required: slug, vote ("up"|"down")' });
    }
    const result = feedbackLogger.recordVote({
      slug: String(slug).slice(0, 256),
      vote,
      viewerEmail: req.user && req.user.email,
      comment: comment ? String(comment).slice(0, 2000) : null,
      userAgent: req.get('user-agent'),
    });
    if (!result.ok) return res.status(500).json({ error: result.reason });
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error recording feedback:', error);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

// Admin-only - superadmin sees the dashboard.
app.get('/api/admin/feedback-summary', requireRole('superadmin'), (req, res) => {
  const days = parseInt(req.query.days || '30', 10);
  const result = feedbackLogger.summary(days);
  if (!result.ok) return res.status(500).json({ error: result.reason });
  res.json(result);
});

app.get('/api/admin/feedback', requireRole('superadmin'), (req, res) => {
  const slug = req.query.slug;
  if (!slug) return res.status(400).json({ error: 'slug query param required' });
  const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);
  const result = feedbackLogger.forArticle(String(slug), limit);
  if (!result.ok) return res.status(500).json({ error: result.reason });
  res.json(result);
});

// ---------------------------------------------------------------------------
// Analytics digest emails (/admin/digests) - superadmin + cron
// ---------------------------------------------------------------------------
// Subscribe/unsubscribe + a send pipeline that POSTs the rendered MJML
// payload to the main SmartWinnr app's regional instance. See plan in
// .claude/plans/our-help-site-menus-parsed-kernighan.md.
//
//   GET    /api/admin/digests/subscriptions       - list subs
//   POST   /api/admin/digests/subscriptions       - add a sub
//   DELETE /api/admin/digests/subscriptions/:id   - remove a sub
//   GET    /api/admin/digests/log                 - recent sends
//   GET    /api/admin/digests/last-sent           - last send per type (admin cards)
//   POST   /api/admin/digests/send-now            - admin button (requireRole)
//   POST   /api/admin/digests/send                - cron (CRON_SECRET header)

function constantTimeEq(a, b) {
  const aStr = String(a || ''); const bStr = String(b || '');
  if (aStr.length !== bStr.length) return false;
  let diff = 0;
  for (let i = 0; i < aStr.length; i += 1) diff |= aStr.charCodeAt(i) ^ bStr.charCodeAt(i);
  return diff === 0;
}

app.get('/api/admin/digests/subscriptions', requireRole('superadmin'), (req, res) => {
  try {
    const digestType = req.query.type ? String(req.query.type) : undefined;
    res.json({ subscriptions: digestStore.listSubscriptions({ digestType }) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/digests/subscriptions', requireRole('superadmin'), (req, res) => {
  try {
    const { type, email, region } = req.body || {};
    const result = digestStore.addSubscription({
      digestType: type,
      email,
      region,
      addedBy: req.user && req.user.email,
    });
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.json({ ok: true, id: result.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/admin/digests/subscriptions/:id', requireRole('superadmin'), (req, res) => {
  try {
    const result = digestStore.removeSubscription(req.params.id);
    if (!result.ok) return res.status(404).json({ error: 'Subscription not found' });
    res.json({ ok: true, removed: result.removed });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/digests/log', requireRole('superadmin'), (req, res) => {
  try {
    const digestType = req.query.type ? String(req.query.type) : undefined;
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 500);
    res.json({ log: digestStore.getRecentSends({ digestType, limit }) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/digests/last-sent', requireRole('superadmin'), (req, res) => {
  try { res.json({ lastSent: digestStore.getLastSendByType() }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

/** Render the digest HTML through the main app's MJML pipeline WITHOUT
 *  sending. Returns text/html directly so the admin page can `window.open`
 *  the response into a new tab for visual inspection. */
app.get('/api/admin/digests/preview', requireRole('superadmin'), async (req, res) => {
  try {
    const type = String(req.query.type || '');
    if (!digestStore.isValidType(type)) {
      return res.status(400).send('Invalid type. Allowed: ' + digestStore.listValidTypes().join(', '));
    }
    const region = req.query.region ? String(req.query.region) : 'global';
    const result = await previewDigest(type, { region });
    if (!result.ok) return res.status(502).send('Preview failed: ' + result.error);
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(result.html || '<!doctype html><p>Empty render.</p>');
  } catch (e) {
    res.status(500).send('Preview failed: ' + e.message);
  }
});

app.post('/api/admin/digests/send-now', requireRole('superadmin'), async (req, res) => {
  try {
    const type = String(req.query.type || req.body?.type || '');
    if (!digestStore.isValidType(type)) {
      return res.status(400).json({ error: `Invalid type. Allowed: ${digestStore.listValidTypes().join(', ')}` });
    }
    const results = await sendDigest(type);
    res.json({ ok: true, results });
  } catch (e) {
    console.error('❌ digests/send-now failed:', e.message);
    res.status(500).json({ error: e.message });
  }
});

/** Cron trigger. Guarded by a constant-time CRON_SECRET check on the
 *  `x-cron-secret` header rather than requireRole, because the Railway
 *  cron service hits this without a session cookie. The secret lives in
 *  the cron service env and the help-site env; both must match. */
app.post('/api/admin/digests/send', async (req, res) => {
  const expected = process.env.CRON_SECRET || '';
  const got = req.get('x-cron-secret') || '';
  if (!expected || !constantTimeEq(got, expected)) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const type = String(req.query.type || '');
    if (!digestStore.isValidType(type)) {
      return res.status(400).json({ error: `Invalid type. Allowed: ${digestStore.listValidTypes().join(', ')}` });
    }
    const results = await sendDigest(type);
    // Surface any per-region failure as a non-2xx so the cron service marks
    // the run as failed and Railway flags it.
    const anyFailed = results.some((r) => r.status === 'failed');
    res.status(anyFailed ? 500 : 200).json({ ok: !anyFailed, results });
  } catch (e) {
    console.error('❌ digests/send (cron) failed:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
// Authoring skill (/admin/authoring) - superadmin only
// ---------------------------------------------------------------------------
//
// Four endpoints power the in-app authoring wizard. The editor fills two
// short forms + a brain-dump; the model handles structure. See plan §19.
//
//   POST /api/admin/authoring/generate    - LLM call, returns markdown+audit
//   POST /api/admin/authoring/save        - write the markdown as a draft
//   POST /api/admin/authoring/publish     - flip frontmatter draft flag
//   POST /api/admin/authoring/upload      - base64-encoded screenshot upload
//   GET  /api/admin/authoring/drafts      - list draft: true articles
//   GET  /api/admin/authoring/draft       - fetch one draft for editing
//   DELETE /api/admin/authoring/draft     - remove a draft
//
// All paths are sandboxed inside `docs/modules/<m>/<sub>/`. The model is
// reached via the same `getOpenAIKey()` + axios pattern the chat handler
// uses - no new dependency.

const DOCS_ROOT = path.join(__dirname, 'docs');
const MODULES_ROOT = path.join(DOCS_ROOT, 'modules');
const IMAGE_ROOT = path.join(__dirname, 'static', 'img', 'helpscout', 'authored');
const CANONICAL_SUBFOLDERS = new Set([
  'for-learners', 'for-managers', 'create-and-manage', 'assign-and-schedule',
  'features', 'reports-and-analytics', 'settings-and-permissions',
  'best-practices', 'faqs-and-troubleshooting',
]);
const AUTHORING_MODEL = process.env.AUTHORING_MODEL || 'gpt-4o-mini';
const AUTHOR_PROMPT_PATH = path.join(__dirname, 'prompts', 'author-article.md');
// Refine-only overlay. Appended AFTER the base prompt so its
// preserve-all-content rules dominate the base prompt's strip/compact rules
// (later instructions win). Without it, refine reuses the fresh-generate
// prompt and heavily shortens existing articles. See prompts/refine-overlay.md.
const REFINE_OVERLAY_PATH = path.join(__dirname, 'prompts', 'refine-overlay.md');

function readSystemPrompt() {
  return fsSync.readFileSync(AUTHOR_PROMPT_PATH, 'utf8');
}

function readRefineOverlay() {
  return fsSync.readFileSync(REFINE_OVERLAY_PATH, 'utf8');
}

function isValidSlug(s) { return /^[a-z0-9][a-z0-9-]{0,120}$/.test(String(s || '')); }

/** Strip bogus origins the model may prepend to root-relative image URLs.
 *  Our upload endpoint returns paths like `/img/helpscout/authored/X.png`;
 *  the model sometimes "helpfully" rewrites these as
 *  `https://example.com/img/...` or `https://help.smartwinnr.com/img/...`
 *  (sanitized by pass 1), OR mangles them into `https://img/helpscout/...`
 *  where `img` becomes a phantom hostname (sanitized by pass 2). Both
 *  shapes get reduced to the root-relative path Docusaurus actually serves.
 */
function stripBogusImageOrigins(markdown) {
  // Pass 1: well-formed bogus origin. e.g. https://help.smartwinnr.com/img/X.png
  let result = markdown.replace(
    /!\[([^\]]*)\]\(https?:\/\/[^/)]+(\/img\/[^\s)]+)\)/g,
    '![$1]($2)',
  );
  // Pass 2: hostless bogus origin. e.g. https://img/helpscout/authored/X.png
  // The model prepends `https://` to a path that already starts with `/img/`,
  // so the leading slash gets eaten and `img` parses as the hostname. Reattach
  // the leading slash so the URL resolves against the site root.
  result = result.replace(
    /!\[([^\]]*)\]\(https?:\/\/(img\/[^\s)]+)\)/g,
    '![$1](/$2)',
  );
  return result;
}

/** Overwrite `last_update.date` + `last_update.author` in an article's
 *  frontmatter with today's UTC date and the logged-in user's display
 *  name (or email if no display name). The model can't know either,
 *  so we stamp them server-side. */
/** Strip decorative emojis the model may have emitted. The
 *  no-decorative-emojis markdownlint rule (custom-markdownlint-rules.js)
 *  rejects any of these characters and the pre-commit hook then fails
 *  the publish, so we belt-and-suspenders the file before it lands on
 *  disk. Mirrors the lint rule's ranges plus the variation selector
 *  U+FE0F that often hangs off the codepoint. Also collapses the
 *  single trailing space so "📸 Screenshot" becomes "Screenshot", not
 *  " Screenshot". Returns the cleaned markdown. */
function stripDecorativeEmojis(markdown) {
  // Codepoint + optional VS16 + optional single trailing space.
  const re = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}]\u{FE0F}? ?/gu;
  let stripped = 0;
  const out = markdown.replace(re, () => { stripped += 1; return ''; });
  if (stripped > 0) {
    console.log(`[authoring] stripDecorativeEmojis: removed ${stripped} codepoint(s)`);
  }
  return out;
}

function stampLastUpdate(markdown, user) {
  const today = new Date().toISOString().slice(0, 10);
  const author = (user && (user.displayName || user.email)) || 'Authoring Skill';
  const fmMatch = /^---\n([\s\S]*?)\n---/.exec(markdown);
  if (!fmMatch) return markdown;
  const fm = fmMatch[1];
  const stamp = `last_update:\n  date: ${today}\n  author: ${author.replace(/[\r\n]/g, ' ')}`;

  let nextFm;
  if (/^last_update\s*:/m.test(fm)) {
    // Replace the whole `last_update:` block: the `last_update:` line
    // plus any subsequent indented child lines (the YAML mapping body).
    nextFm = fm.replace(
      /^last_update\s*:[^\n]*(?:\n[ \t]+[^\n]*)*/m,
      stamp,
    );
  } else {
    nextFm = fm.trimEnd() + '\n' + stamp;
  }
  return markdown.replace(fmMatch[0], `---\n${nextFm}\n---`);
}

/** Build the docs path for a draft, ensuring it sandboxes inside docs/modules/. */
function resolveDraftPath(moduleSlug, subFolder, articleSlug) {
  if (!isValidSlug(moduleSlug) || !isValidSlug(articleSlug)) {
    throw new Error('Invalid slug');
  }
  if (!CANONICAL_SUBFOLDERS.has(subFolder)) {
    throw new Error('Invalid sub-folder');
  }
  const target = path.join(MODULES_ROOT, moduleSlug, subFolder, `${articleSlug}.md`);
  const real = path.resolve(target);
  if (!real.startsWith(MODULES_ROOT + path.sep)) {
    throw new Error('Path escapes docs/modules/');
  }
  return real;
}

// Per-user LLM rate limit. In-memory ring buffer keyed on email; resets on
// server restart (acceptable - the worst case is a fresh budget). 10/hour
// by default - override via AUTHORING_RATE_LIMIT. See plan §20.1.
const RATE_LIMIT = parseInt(process.env.AUTHORING_RATE_LIMIT || '10', 10);
const RATE_WINDOW_MS = 60 * 60 * 1000;
const generateHits = new Map();
function checkRate(email) {
  const key = email || 'anon';
  const now = Date.now();
  const arr = (generateHits.get(key) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_LIMIT) {
    return {ok: false, retryAfterMs: RATE_WINDOW_MS - (now - arr[0]), used: arr.length};
  }
  arr.push(now);
  generateHits.set(key, arr);
  return {ok: true, remaining: RATE_LIMIT - arr.length};
}

app.post('/api/admin/authoring/generate', requireRole('superadmin'), async (req, res) => {
  // Gate before the LLM call - stuck retry loops can burn tokens fast.
  const rate = checkRate(req.user && req.user.email);
  if (!rate.ok) {
    return res.status(429).json({
      error: 'Rate limit',
      message: `You've used ${rate.used} generates this hour (limit ${RATE_LIMIT}). Try again in ~${Math.ceil(rate.retryAfterMs / 60000)} min.`,
      retryAfterMs: rate.retryAfterMs,
      limit: RATE_LIMIT,
      used: rate.used,
    });
  }
  try {
    const { inputs = {}, refinement, previousMarkdown } = req.body || {};
    const isRefine = !!(refinement && previousMarkdown);
    if (isRefine) {
      // Refine mode: the previous markdown IS the source. Title + description
      // already live in its frontmatter; the editor's note plus that body are
      // what the LLM rewrites against. roughExplanation is a wizard-input
      // concept that doesn't survive into a saved article, so requiring it
      // here would break every edit-mode Refine.
      if (!String(previousMarkdown).trim()) {
        return res.status(400).json({ error: 'previousMarkdown must be non-empty when refining' });
      }
    } else {
      // Fresh-generate mode: the brain-dump + sub-folder are the only
      // signals the LLM strictly needs. Title + description are now
      // OPTIONAL - when empty, the prompt's sub-folder shape table
      // instructs the LLM to invent them, and the editor reviews +
      // edits the result on the preview step before saving.
      if (!inputs.roughExplanation) {
        return res.status(400).json({ error: 'Missing inputs: roughExplanation is required' });
      }
    }
    if (!inputs.module || !inputs.subFolder) {
      return res.status(400).json({ error: 'Missing inputs: module + subFolder required' });
    }
    if (!CANONICAL_SUBFOLDERS.has(inputs.subFolder)) {
      return res.status(400).json({ error: `subFolder must be one of: ${[...CANONICAL_SUBFOLDERS].join(', ')}` });
    }

    // In refine mode, append the overlay so its preserve-all-content rules
    // override the base prompt's strip/compact rules. Fresh-generate uses the
    // base prompt unchanged.
    const systemPrompt = isRefine
      ? readSystemPrompt() + '\n\n' + readRefineOverlay()
      : readSystemPrompt();
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Generate the article from these inputs:\n\n' + JSON.stringify(inputs, null, 2) },
    ];
    if (isRefine) {
      messages.push({ role: 'assistant', content: previousMarkdown });
      messages.push({ role: 'user', content: `Refine the article above following REFINE MODE. Preserve all of its content, steps, and detail - apply only the editor's note plus grammar, wording, and formatting improvements. Do not shorten or drop anything.\n\nEditor's note:\n\n${refinement}` });
    }

    // Long articles must not be truncated when refine preserves their length.
    // Scale the cap to the source size (~/3 chars-per-token with headroom),
    // capped at gpt-4o-mini's 16384-token output ceiling. Fresh-generate keeps
    // the original 4000 cap.
    const maxTokens = isRefine
      ? Math.min(16000, Math.max(4000, Math.ceil(String(previousMarkdown).length / 3)))
      : 4000;

    const openaiApiKey = getOpenAIKey();
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: AUTHORING_MODEL,
        messages,
        temperature: 0.4,
        max_tokens: maxTokens,
      },
      {
        headers: { Authorization: `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
        timeout: 60000,
      },
    );

    let markdown = (response.data?.choices?.[0]?.message?.content || '').trim();

    // GPT-4o sometimes wraps the article in a ```markdown code fence even
    // when the system prompt forbids it. Strip a leading/trailing fence
    // before validating the frontmatter.
    const fenceMatch = /^```(?:markdown|md|mdx)?\s*\n([\s\S]*?)\n```\s*$/i.exec(markdown);
    if (fenceMatch) {
      markdown = fenceMatch[1].trim();
    }
    // Also strip a stray opening fence with no closing one (rare, but seen).
    markdown = markdown.replace(/^```(?:markdown|md|mdx)?\s*\n/i, '').replace(/\n```\s*$/, '');

    if (!markdown.startsWith('---')) {
      return res.status(502).json({
        error: 'Model output is not a markdown article (missing frontmatter)',
        preview: markdown.slice(0, 400),
      });
    }

    // Server-side truth for fields the model can't know: today's date,
    // the logged-in editor's name. Override whatever the model put in
    // `last_update` so we don't ship articles with stale or invented
    // values like "2023-10-11" / "Authoring Skill".
    markdown = stampLastUpdate(markdown, req.user);

    // Strip any bogus origins the model may have prepended to our
    // root-relative image paths (e.g. `https://example.com/img/...`).
    // The upload endpoint returns paths like `/img/helpscout/authored/X`
    // and that's the form Docusaurus expects in markdown.
    markdown = stripBogusImageOrigins(markdown);

    // Belt-and-suspenders: defang any decorative emojis the model
    // emitted despite the prompt. Same character class the markdownlint
    // no-decorative-emojis rule scans for, so the file lands clean and
    // the pre-commit hook doesn't fail the publish.
    markdown = stripDecorativeEmojis(markdown);

    const audit = gradeMarkdown(markdown);
    res.json({
      markdown,
      audit,
      tokens: {
        prompt: response.data?.usage?.prompt_tokens || 0,
        completion: response.data?.usage?.completion_tokens || 0,
      },
    });
  } catch (error) {
    console.error('❌ authoring/generate failed:', error.response?.data || error.message);
    res.status(500).json({ error: 'Generation failed', message: error.response?.data?.error?.message || error.message });
  }
});

/** Per-field LLM suggestion. Lets editors regenerate just the title or
 *  just the description without rewriting the body or other fields. Body
 *  stays UNTOUCHED on the client - the response is a plain string and
 *  the wizard updates only state.inputs[field], no markdown re-splice.
 *
 *  Body: { field: 'title' | 'description', module, subFolder, body,
 *          brainDump?, currentValue? }
 *  Returns: { field, value, tokens }
 *
 *  Same per-superadmin rate limit as /generate (a per-field call costs a
 *  token call too, even if it's tiny). Tight max_tokens (200) so a misbehaving
 *  prompt can't burn budget.
 */
app.post('/api/admin/authoring/suggest-field', requireRole('superadmin'), async (req, res) => {
  const rate = checkRate((req.user || {}).email);
  if (!rate.ok) {
    return res.status(429).json({
      error: 'Rate limit',
      message: `You've used ${rate.used} generates this hour (limit ${RATE_LIMIT}). Try again in ~${Math.ceil(rate.retryAfterMs / 60000)} min.`,
      retryAfterMs: rate.retryAfterMs,
      limit: RATE_LIMIT,
      used: rate.used,
    });
  }
  try {
    const { field, module: moduleSlug, subFolder, body = '', brainDump = '', currentValue = '' } = req.body || {};
    if (field !== 'title' && field !== 'description') {
      return res.status(400).json({ error: "field must be 'title' or 'description'" });
    }
    if (!moduleSlug || !subFolder) {
      return res.status(400).json({ error: 'module + subFolder required' });
    }
    if (!body && !brainDump) {
      return res.status(400).json({ error: 'body or brainDump required for context' });
    }

    // Title-shape guide mirrors the wizard's TITLE_SHAPE_BY_SUBFOLDER
    // table and the per-sub-folder rules in prompts/author-article.md so
    // all three places agree on what a "good" title looks like.
    const titleShape = {
      'create-and-manage':        '"How to <verb> <object>" (e.g. "How to create a manual quiz")',
      'assign-and-schedule':      '"How to assign <object>" or "How to schedule <object>"',
      'for-learners':             '"How to <verb> <object>" in learner-facing tone',
      'for-managers':             '"How to <verb> <object> for your team" in manager-facing tone',
      'features':                 '"What is <feature>" or "Understanding <feature>"',
      'reports-and-analytics':    '"How to read the <report>" or "Understanding the <report> report"',
      'settings-and-permissions': '"Configure <thing>", "Set up <thing>", "Enable <thing>", or "Disable <thing>"',
      'best-practices':           '"Best practices for <topic>"',
      'faqs-and-troubleshooting': 'a question shape ("Why does X happen?", "Can I Y?") or "Troubleshooting <X>"',
    };

    const sys = field === 'title'
      ? `You suggest one help-article title for SmartWinnr. Return ONE line containing JUST the title - no quotes, no markdown, no preamble, no explanation. ` +
        `Shape for sub-folder "${subFolder}": ${titleShape[subFolder] || 'start with an action verb or question word'}. ` +
        `Keep it short (under 80 chars), specific, and use lowercase except for proper nouns and the first word.`
      : `You suggest one help-article description for SmartWinnr. Return ONE line containing JUST the description - no quotes, no markdown, no preamble. ` +
        `Length must be between 60 and 160 characters. Stand-alone first sentence, no "we", no "we have updated", no "this article shows". ` +
        `Mirror the topic of the article body; complete the unspoken phrase "This article shows you how to ..." but without those leading words.`;

    // Provide all available context. Truncate the body so we don't blow
    // through max_tokens on an edge-case 30-page draft.
    const userParts = [
      `Sub-folder: ${subFolder}`,
      `Module: ${moduleSlug}`,
      currentValue ? `Current ${field} (editor wants this regenerated): ${currentValue}` : null,
      brainDump ? `Editor's brain dump:\n${String(brainDump).slice(0, 2000)}` : null,
      body ? `Current article (frontmatter + body):\n${String(body).slice(0, 4000)}` : null,
    ].filter(Boolean);

    const openaiApiKey = getOpenAIKey();
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: AUTHORING_MODEL,
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: userParts.join('\n\n') },
        ],
        temperature: 0.4,
        max_tokens: 200,
      },
      {
        headers: { Authorization: `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
        timeout: 30000,
      },
    );

    // The model still likes to add quotes or markdown fences despite the
    // prompt; strip them. Take only the first line (title + description
    // are single-line).
    let value = String(response.data?.choices?.[0]?.message?.content || '').trim();
    value = value.replace(/^```[^\n]*\n?|\n?```$/g, '').trim();   // strip code fences
    value = value.split('\n')[0].trim();                          // first line only
    value = value.replace(/^["'`“‘]+|["'`”’]+$/g, '').trim();  // strip wrap-quotes

    res.json({
      field,
      value,
      tokens: {
        prompt: response.data?.usage?.prompt_tokens || 0,
        completion: response.data?.usage?.completion_tokens || 0,
      },
    });
  } catch (error) {
    console.error('❌ authoring/suggest-field failed:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Suggest-field failed',
      message: error.response?.data?.error?.message || error.message,
    });
  }
});

app.post('/api/admin/authoring/save', requireRole('superadmin'), (req, res) => {
  try {
    const { markdown, module: moduleSlug, subFolder, slug } = req.body || {};
    if (!markdown) return res.status(400).json({ error: 'markdown required' });

    const audit = gradeMarkdown(markdown);
    const blockers = (audit.findings || []).filter((f) => f.blocking);
    if (blockers.length > 0) {
      return res.status(400).json({
        error: 'Audit blocking - article cannot be saved as-is',
        audit,
      });
    }

    const target = resolveDraftPath(moduleSlug, subFolder, slug);
    // Defang decorative emojis (the no-decorative-emojis markdownlint rule
    // rejects them on the deploy commit). /generate already runs the same
    // strip, but the edit-existing-draft flow may have loaded a legacy
    // file that carries them, and a Refine pass through the LLM that
    // sneaks one in would otherwise survive.
    const cleanedMarkdown = stripDecorativeEmojis(markdown);
    // Force draft:true in frontmatter - defensive override even if the model
    // emitted draft:false somehow.
    const text = cleanedMarkdown.replace(/^draft:\s*(true|false)\s*$/m, 'draft: true');
    const finalText = /^draft:/m.test(text)
      ? text
      : text.replace(/^---/, '---').replace(/^(---[\s\S]*?\n)(---)/, (m, fm, end) => fm + 'draft: true\n' + end);

    fsSync.mkdirSync(path.dirname(target), { recursive: true });
    // If this is the first article ever written into the sub-folder, make
    // sure the gate file lands too. Otherwise audit-gates.js fails on the
    // next build because the sub-folder is ungated.
    const subfolderCreated = ensureSubfolderCategory(moduleSlug, subFolder);
    fsSync.writeFileSync(target, finalText, 'utf8');
    res.json({ ok: true, path: path.relative(__dirname, target), audit, subfolderCreated });
  } catch (error) {
    console.error('❌ authoring/save failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Publish-to-deploy pipeline (plan §20.3 - §20.5)
// ---------------------------------------------------------------------------
//
// Publishing only flips draft:true → false in the file. To make the article
// actually visible to readers, we commit + push the change so Railway
// auto-redeploys. To avoid one-deploy-per-publish cost explosions, we:
//
//   • Batch publishes into a queue (in-memory Set, persisted to
//     data/deploy-state.json across restarts).
//   • Debounce: fire a deploy 30 min after the LAST publish in a burst
//     (resets on each new publish).
//   • Cap: never deploy more often than once per 60 min.
//   • Manual override: "Deploy now" button on /admin/authoring/drafts
//     triggers immediately, but still respects the 60 min minimum.
//
// Git push is done via the GitLab Commits API (POST /repository/commits)
// rather than the git CLI. The container has no .git directory, and the
// API takes a multi-action commit in one round-trip - one commit per
// batch = one Railway redeploy per batch.

const DEPLOY_STATE_PATH = path.join(__dirname, 'data', 'deploy-state.json');
const DEPLOY_DEBOUNCE_MS = parseInt(process.env.AUTHORING_DEPLOY_DEBOUNCE_MS || String(30 * 60 * 1000), 10);
const DEPLOY_MIN_INTERVAL_MS = parseInt(process.env.AUTHORING_DEPLOY_MIN_INTERVAL_MS || String(60 * 60 * 1000), 10);
const GIT_PUSH_ENABLED = process.env.AUTHORING_GIT_PUSH === 'true';
const GIT_PUSH_TOKEN = process.env.GIT_PUSH_TOKEN || '';
// Repo identity: "<owner>/<repo>" - e.g. "smartwinnr/smartwinnr-help-docusaurus".
const GITHUB_REPO = process.env.GITHUB_REPO || '';
const GIT_PUBLISH_BRANCH = process.env.GIT_PUBLISH_BRANCH || 'main';
const GITHUB_API = process.env.GITHUB_API || 'https://api.github.com';

// deployQueue tracks per-path actions so the same pipeline that publishes
// an upserted article can also commit a delete. Map<relPath, 'upsert' | 'delete'>.
const deployQueue = new Map();
let lastDeployTs = 0;
let debounceTimer = null;
let deployInFlight = false;

function enqueueUpsert(relPath) {
  deployQueue.set(relPath, 'upsert');
}

function enqueueDelete(relPath) {
  // If the path was previously queued as an upsert (e.g. published-then-
  // deleted before the deploy fired), the delete supersedes - end state
  // on prod is "absent".
  deployQueue.set(relPath, 'delete');
}

/** Drop queued `upsert` entries whose target file no longer exists on disk -
 *  stale entries left by a prior session, a reverted file, or a branch switch
 *  (the persisted queue in data/deploy-state.json outlives the files). These
 *  can never deploy (fireDeploy skips missing upserts), so a phantom one keeps
 *  the "waiting to deploy" strip + Deploy now button up with nothing real
 *  behind it. `delete` entries are kept - they legitimately target an
 *  already-absent file. Returns how many were pruned; persists if any changed. */
function pruneStaleQueue() {
  let pruned = 0;
  for (const [rel, action] of [...deployQueue]) {
    if (action !== 'upsert') continue;
    if (!fsSync.existsSync(path.join(__dirname, rel))) {
      deployQueue.delete(rel);
      pruned += 1;
      console.warn(`[deploy] pruned stale upsert from queue: ${rel}`);
    }
  }
  if (pruned > 0) persistDeployState();
  return pruned;
}

function loadDeployState() {
  try {
    if (fsSync.existsSync(DEPLOY_STATE_PATH)) {
      const s = JSON.parse(fsSync.readFileSync(DEPLOY_STATE_PATH, 'utf8'));
      lastDeployTs = Number(s.lastDeployTs) || 0;
      for (const item of (s.queue || [])) {
        // Backwards-compat: the old persisted shape was an array of path
        // strings (upserts only). Accept either string or {path, action}.
        if (typeof item === 'string') deployQueue.set(item, 'upsert');
        else if (item && item.path) deployQueue.set(item.path, item.action === 'delete' ? 'delete' : 'upsert');
      }
      console.log(`📦 deploy-state: queue=${deployQueue.size}, lastDeployTs=${lastDeployTs ? new Date(lastDeployTs).toISOString() : 'never'}`);
    }
  } catch (e) {
    console.warn('[deploy] failed to load state:', e.message);
  }
}
function persistDeployState() {
  try {
    fsSync.mkdirSync(path.dirname(DEPLOY_STATE_PATH), { recursive: true });
    fsSync.writeFileSync(DEPLOY_STATE_PATH, JSON.stringify({
      lastDeployTs,
      queue: [...deployQueue].map(([p, action]) => ({ path: p, action })),
    }, null, 2), 'utf8');
  } catch (e) {
    console.warn('[deploy] failed to persist state:', e.message);
  }
}
loadDeployState();

function nextAutoDeployAt() {
  if (deployQueue.size === 0 || !debounceTimer) return null;
  // The actual timer references are opaque, so approximate from lastDeployTs + min-interval.
  return Math.max(
    Date.now() + 1000,  // never report "now or past"
    lastDeployTs + DEPLOY_MIN_INTERVAL_MS,
  );
}
function canDeployNow() {
  return (Date.now() - lastDeployTs) >= DEPLOY_MIN_INTERVAL_MS;
}

function scheduleDeploy() {
  if (debounceTimer) clearTimeout(debounceTimer);
  const minWait = DEPLOY_MIN_INTERVAL_MS - (Date.now() - lastDeployTs);
  const delay = Math.max(DEPLOY_DEBOUNCE_MS, minWait);
  console.log(`[deploy] scheduled in ${Math.round(delay / 60000)} min (queue: ${deployQueue.size})`);
  debounceTimer = setTimeout(() => { fireDeploy().catch((e) => console.error('[deploy] auto-fire failed:', e.message)); }, delay);
}

/** GitHub Git Data API helpers - composes a single atomic commit out of
 *  N file changes by building blobs → tree → commit → ref update. The
 *  fine-grained PAT in GIT_PUSH_TOKEN must have Contents: Read & Write
 *  scoped to ONLY the configured repo. */
function ghHeaders() {
  return {
    Authorization: `Bearer ${GIT_PUSH_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'smartwinnr-help-authoring',
  };
}
async function ghGet(pathSuffix) {
  return axios.get(`${GITHUB_API}/repos/${GITHUB_REPO}${pathSuffix}`, {
    headers: ghHeaders(),
    timeout: 30000,
  });
}
async function ghPost(pathSuffix, body) {
  return axios.post(`${GITHUB_API}/repos/${GITHUB_REPO}${pathSuffix}`, body, {
    headers: ghHeaders(),
    timeout: 60000,
  });
}
async function ghPatch(pathSuffix, body) {
  return axios.patch(`${GITHUB_API}/repos/${GITHUB_REPO}${pathSuffix}`, body, {
    headers: ghHeaders(),
    timeout: 30000,
  });
}

/** Run a deploy: build a single commit out of every queued file via the
 *  GitHub Git Data API. Triggers Railway auto-deploy via the ref update.
 *  Best-effort - on failure the queue is preserved for the next attempt. */
async function fireDeploy() {
  if (deployInFlight) return { ok: false, reason: 'in-flight' };
  if (deployQueue.size === 0) return { ok: false, reason: 'empty-queue' };

  if (!GIT_PUSH_ENABLED) {
    // Local dev or feature off - clear queue without any git work.
    console.log('[deploy] AUTHORING_GIT_PUSH not set - clearing queue as no-op');
    deployQueue.clear();
    lastDeployTs = Date.now();
    persistDeployState();
    if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
    return { ok: true, mode: 'noop' };
  }
  if (!GIT_PUSH_TOKEN || !GITHUB_REPO) {
    return {
      ok: false,
      reason: 'missing-config',
      message: 'GIT_PUSH_TOKEN + GITHUB_REPO required',
    };
  }

  deployInFlight = true;
  // Snapshot the queue into [{rel, action}] so concurrent enqueues don't
  // perturb the in-flight set.
  const queueSnapshot = [...deployQueue].map(([rel, action]) => ({ rel, action }));
  try {
    // Read upsert contents into memory + drop any that have since vanished
    // (the file was deleted between enqueue and now - safe to skip; an
    // explicit delete would be in the queue with action='delete').
    const files = [];
    for (const item of queueSnapshot) {
      if (item.action !== 'upsert') continue;
      const abs = path.join(__dirname, item.rel);
      if (!fsSync.existsSync(abs)) {
        console.warn(`[deploy] skipping missing upsert file: ${item.rel}`);
        continue;
      }
      files.push({ rel: item.rel, content: fsSync.readFileSync(abs, 'utf8') });
    }
    const deletes = queueSnapshot.filter((q) => q.action === 'delete').map((q) => q.rel);

    if (files.length === 0 && deletes.length === 0) {
      deployQueue.clear();
      deployInFlight = false;
      persistDeployState();
      return { ok: false, reason: 'no-files' };
    }

    // Scan upsert article bodies for image references and pull any locally-
    // existing files into the commit. Without this, articles publish but
    // their screenshots stay on the container's ephemeral disk and never
    // reach git → Docusaurus's build-time "image not found" check fails on
    // the next Railway redeploy.
    const IMAGE_PATTERN = /!\[[^\]]*\]\((\/img\/helpscout\/authored\/[^)]+)\)/g;
    const imageRels = new Set();
    for (const f of files) {
      for (const m of f.content.matchAll(IMAGE_PATTERN)) {
        // /img/helpscout/authored/X → static/img/helpscout/authored/X
        const rel = 'static' + m[1];
        imageRels.add(rel);
      }
    }
    const images = [];
    for (const rel of imageRels) {
      const abs = path.join(__dirname, rel);
      if (!fsSync.existsSync(abs)) {
        console.warn(`[deploy] referenced image not on disk, skipping: ${rel}`);
        continue;
      }
      images.push({ rel, data: fsSync.readFileSync(abs) });
    }

    // 1. Look up current branch tip + tree
    const refResp = await ghGet(`/git/refs/heads/${GIT_PUBLISH_BRANCH}`);
    const baseCommitSha = refResp.data.object.sha;
    const baseCommitResp = await ghGet(`/git/commits/${baseCommitSha}`);
    const baseTreeSha = baseCommitResp.data.tree.sha;

    // 2. Upload each upsert file as a blob.
    //    - .md / .mdx → utf-8
    //    - images     → base64 (binary content)
    const treeEntries = [];
    for (const f of files) {
      const blobResp = await ghPost(`/git/blobs`, {
        content: f.content,
        encoding: 'utf-8',
      });
      treeEntries.push({
        path: f.rel,
        mode: '100644',
        type: 'blob',
        sha: blobResp.data.sha,
      });
    }
    for (const img of images) {
      const blobResp = await ghPost(`/git/blobs`, {
        content: img.data.toString('base64'),
        encoding: 'base64',
      });
      treeEntries.push({
        path: img.rel,
        mode: '100644',
        type: 'blob',
        sha: blobResp.data.sha,
      });
    }
    // Deletes: per GitHub Trees API, `sha: null` removes the path from the
    // base_tree. No blob upload needed.
    for (const rel of deletes) {
      treeEntries.push({
        path: rel,
        mode: '100644',
        type: 'blob',
        sha: null,
      });
    }

    // 3. New tree based on the current main tree + our overrides.
    const treeResp = await ghPost(`/git/trees`, {
      base_tree: baseTreeSha,
      tree: treeEntries,
    });

    // 4. Create the commit.
    const changedSlugs = [...files.map((f) => path.basename(f.rel).replace(/\.(md|mdx)$/, '')),
                         ...deletes.map((d) => '-' + path.basename(d).replace(/\.(md|mdx)$/, ''))].slice(0, 3);
    const parts = [];
    if (files.length) parts.push(`${files.length} article${files.length === 1 ? '' : 's'}`);
    if (deletes.length) parts.push(`${deletes.length} delete${deletes.length === 1 ? '' : 's'}`);
    if (images.length) parts.push(`${images.length} image${images.length === 1 ? '' : 's'}`);
    const totalChanges = files.length + deletes.length;
    const message = `publish: ${parts.join(' + ')} (${changedSlugs.join(', ')}${totalChanges > 3 ? '...' : ''})`;
    const commitResp = await ghPost(`/git/commits`, {
      message,
      tree: treeResp.data.sha,
      parents: [baseCommitSha],
    });

    // 5. Fast-forward the branch. (Use force=false explicitly so a
    //    concurrent push since refResp would fail loudly instead of
    //    overwriting.)
    await ghPatch(`/git/refs/heads/${GIT_PUBLISH_BRANCH}`, {
      sha: commitResp.data.sha,
      force: false,
    });

    console.log(`[deploy] pushed ${files.length} upsert(s) + ${deletes.length} delete(s) + ${images.length} image(s) → ${GITHUB_REPO}@${GIT_PUBLISH_BRANCH} (${commitResp.data.sha.slice(0, 7)})`);
    deployQueue.clear();
    lastDeployTs = Date.now();
    persistDeployState();
    if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
    return { ok: true, committed: files.length, deleted: deletes.length, images: images.length, sha: commitResp.data.sha };
  } catch (e) {
    const ghMsg = e.response?.data?.message || e.message;
    console.error('[deploy] GitHub push failed:', ghMsg);
    return { ok: false, reason: 'push-failed', message: ghMsg };
  } finally {
    deployInFlight = false;
  }
}

// ---------------------------------------------------------------------------

app.post('/api/admin/authoring/publish', requireRole('superadmin'), (req, res) => {
  try {
    const { module: moduleSlug, subFolder, slug } = req.body || {};
    const target = resolveDraftPath(moduleSlug, subFolder, slug);
    if (!fsSync.existsSync(target)) return res.status(404).json({ error: 'Draft not found' });

    const raw = fsSync.readFileSync(target, 'utf8');
    const audit = gradeMarkdown(raw);
    const blockers = (audit.findings || []).filter((f) => f.blocking);
    if (blockers.length > 0) {
      return res.status(400).json({ error: 'Audit blocking - fix before publishing', audit });
    }
    const next = raw.replace(/^draft:\s*true\s*$/m, 'draft: false');
    if (next === raw) {
      return res.status(400).json({ error: 'No draft: true flag found in frontmatter' });
    }
    fsSync.writeFileSync(target, next, 'utf8');

    // Queue for deploy + reset the debounce timer (so a burst batches).
    const relPath = path.relative(__dirname, target);
    enqueueUpsert(relPath);
    persistDeployState();
    scheduleDeploy();

    res.json({
      ok: true,
      path: relPath,
      audit,
      queued: true,
      queueSize: deployQueue.size,
    });
  } catch (error) {
    console.error('❌ authoring/publish failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Reverse of /publish: re-draft a published article (draft:false -> true).
// Two cases, decided by whether the publish has deployed yet:
//   • Still queued (published, not yet deployed): cancel the pending publish
//     outright by dropping it from the deploy queue. The repo still holds the
//     pre-publish (draft) version, so nothing needs to ship.
//   • Already live (not in queue): queue the re-draft so the next deploy
//     commits draft:true - production builds hide draft articles, pulling it.
app.post('/api/admin/authoring/unpublish', requireRole('superadmin'), (req, res) => {
  try {
    const { module: moduleSlug, subFolder, slug } = req.body || {};
    const target = resolveDraftPath(moduleSlug, subFolder, slug);
    const relPath = path.relative(__dirname, target);

    if (!fsSync.existsSync(target)) {
      // File is gone. If it's a stale queued upsert, still honor "cancel" by
      // dropping it from the queue (it could never deploy anyway). Otherwise
      // there's genuinely nothing to act on.
      if (deployQueue.get(relPath) === 'upsert') {
        deployQueue.delete(relPath);
        persistDeployState();
        return res.json({
          ok: true,
          path: relPath,
          canceledPendingPublish: true,
          fileMissing: true,
          queueSize: deployQueue.size,
        });
      }
      return res.status(404).json({ error: 'Article not found' });
    }

    const raw = fsSync.readFileSync(target, 'utf8');
    const pendingPublish = deployQueue.get(relPath) === 'upsert';
    const alreadyDraft = /^draft:\s*true\s*$/m.test(raw);

    // Already a draft AND nothing queued -> there's nothing to undo. (If it's
    // a draft but still queued, we fall through to drop the stale queue entry.)
    if (alreadyDraft && !pendingPublish) {
      return res.status(400).json({ error: 'Article is already a draft (nothing to unpublish)' });
    }

    if (!alreadyDraft) {
      // Flip an explicit draft:false, or insert the flag if it's missing
      // entirely (an absent draft flag means published, same as the wizard's
      // wasPublished detection).
      let next = raw.replace(/^draft:\s*false\s*$/m, 'draft: true');
      if (next === raw) {
        next = raw.replace(/^(---[\s\S]*?\n)(---)/, (m, fm, end) => fm + 'draft: true\n' + end);
        if (next === raw) {
          return res.status(400).json({ error: 'Could not parse frontmatter to set draft flag' });
        }
      }
      fsSync.writeFileSync(target, next, 'utf8');
    }

    if (pendingPublish) {
      deployQueue.delete(relPath);
    } else {
      enqueueUpsert(relPath);
    }
    persistDeployState();
    // Only a live-article re-draft needs to ship; a canceled pending publish
    // ships nothing, so don't (re)arm the debounce for it.
    if (!pendingPublish) scheduleDeploy();

    res.json({
      ok: true,
      path: relPath,
      canceledPendingPublish: pendingPublish,
      queued: !pendingPublish,
      queueSize: deployQueue.size,
    });
  } catch (error) {
    console.error('❌ authoring/unpublish failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/authoring/deploy/state', requireRole('superadmin'), (req, res) => {
  // Self-heal: purge phantom upserts (file gone) so the strip + Deploy now
  // reflect only changes that can actually ship.
  pruneStaleQueue();
  const items = [...deployQueue].map(([rel, action]) => {
    const abs = path.join(__dirname, rel);
    let title = path.basename(rel).replace(/\.(md|mdx)$/, '');
    // Deleted files are no longer on disk - keep the slug-derived title.
    if (action !== 'delete') {
      try {
        const t = fsSync.readFileSync(abs, 'utf8');
        const m = /^title:\s*["']?(.+?)["']?\s*$/m.exec(t);
        if (m) title = m[1];
      } catch {/* ignore */}
    }
    return { path: rel, slug: path.basename(rel).replace(/\.(md|mdx)$/, ''), title, action };
  });
  res.json({
    queue: items,
    lastDeployTs,
    nextAutoDeployAt: nextAutoDeployAt(),
    canDeployNow: canDeployNow(),
    minIntervalMs: DEPLOY_MIN_INTERVAL_MS,
    debounceMs: DEPLOY_DEBOUNCE_MS,
    gitPushEnabled: GIT_PUSH_ENABLED,
    configOk: GIT_PUSH_ENABLED && !!GIT_PUSH_TOKEN && !!GITHUB_REPO,
  });
});

app.post('/api/admin/authoring/deploy', requireRole('superadmin'), async (req, res) => {
  if (!canDeployNow()) {
    return res.status(429).json({
      error: 'rate-limited',
      message: `Last deploy was ${Math.round((Date.now() - lastDeployTs) / 60000)} min ago. Next available in ${Math.round((DEPLOY_MIN_INTERVAL_MS - (Date.now() - lastDeployTs)) / 60000)} min.`,
      retryAfterMs: DEPLOY_MIN_INTERVAL_MS - (Date.now() - lastDeployTs),
    });
  }
  const result = await fireDeploy();
  if (!result.ok) return res.status(500).json(result);
  res.json(result);
});

/** Bulk-enqueue delete actions in the deploy queue. Used by
 *  scripts/prune-orphan-images.js (which runs file unlinks locally and
 *  then asks the live server to commit those same removals to git).
 *  Guarded by constant-time CRON_SECRET so the script can run without a
 *  session cookie. Body: { paths: ['static/img/.../X.png', ...] }. */
app.post('/api/admin/authoring/deploy/enqueue-deletes', (req, res) => {
  const expected = process.env.CRON_SECRET || '';
  const got = req.get('x-cron-secret') || '';
  if (!expected || !constantTimeEq(got, expected)) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const { paths } = req.body || {};
  if (!Array.isArray(paths) || paths.length === 0) {
    return res.status(400).json({ error: 'paths must be a non-empty array' });
  }
  let queued = 0;
  for (const p of paths) {
    // Defensive: only accept relative paths inside static/img/helpscout/
    // so a leaked CRON_SECRET can't queue deletion of arbitrary repo files.
    if (typeof p !== 'string') continue;
    const norm = p.replace(/\\/g, '/');
    if (!/^static\/img\/helpscout\/[^/]+\/[^/]+\.(png|jpe?g|gif|webp)$/i.test(norm)) {
      console.warn(`[deploy/enqueue-deletes] rejecting path outside helpscout image tree: ${p}`);
      continue;
    }
    enqueueDelete(norm);
    queued += 1;
  }
  if (queued > 0) {
    persistDeployState();
    scheduleDeploy();
  }
  res.json({ ok: true, queued, queueSize: deployQueue.size });
});

app.post('/api/admin/authoring/upload', requireRole('superadmin'), (req, res) => {
  try {
    const { dataUrl, slug, suffix } = req.body || {};
    if (!dataUrl || !slug) return res.status(400).json({ error: 'dataUrl + slug required' });
    if (!isValidSlug(slug)) return res.status(400).json({ error: 'Invalid slug' });

    const m = /^data:image\/(png|jpe?g|gif|webp);base64,(.+)$/.exec(dataUrl);
    if (!m) return res.status(400).json({ error: 'dataUrl must be a base64 PNG/JPG/GIF/WEBP' });
    const ext = m[1].replace('jpeg', 'jpg');
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length > 5 * 1024 * 1024) {
      return res.status(413).json({ error: 'Image too large (5 MB max)' });
    }

    fsSync.mkdirSync(IMAGE_ROOT, { recursive: true });
    const stamp = Date.now().toString(36);
    const tail = isValidSlug(suffix) ? `-${suffix}` : '';
    const filename = `${slug}${tail}-${stamp}.${ext}`;
    fsSync.writeFileSync(path.join(IMAGE_ROOT, filename), buf);
    res.json({ url: `/img/helpscout/authored/${filename}` });
  } catch (error) {
    console.error('❌ authoring/upload failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/authoring/drafts', requireRole('superadmin'), (req, res) => {
  try {
    const drafts = [];
    function walk(dir) {
      for (const entry of fsSync.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(p);
        else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
          const text = fsSync.readFileSync(p, 'utf8');
          if (!/^draft:\s*true\b/m.test(text)) continue;
          const titleMatch = /^title:\s*["']?(.+?)["']?\s*$/m.exec(text);
          const lastUpdMatch = /^\s*date:\s*(\S+)/m.exec(text);
          drafts.push({
            path: path.relative(__dirname, p),
            slug: path.basename(p).replace(/\.(md|mdx)$/, ''),
            title: titleMatch ? titleMatch[1] : path.basename(p),
            lastUpdate: lastUpdMatch ? lastUpdMatch[1] : null,
          });
        }
      }
    }
    if (fsSync.existsSync(MODULES_ROOT)) walk(MODULES_ROOT);
    drafts.sort((a, b) => String(b.lastUpdate).localeCompare(String(a.lastUpdate)));
    res.json({ drafts });
  } catch (error) {
    console.error('❌ authoring/drafts failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/authoring/draft', requireRole('superadmin'), (req, res) => {
  try {
    const { module: moduleSlug, subFolder, slug } = req.query;
    const target = resolveDraftPath(moduleSlug, subFolder, slug);
    if (!fsSync.existsSync(target)) return res.status(404).json({ error: 'Draft not found' });
    const markdown = fsSync.readFileSync(target, 'utf8');
    res.json({ markdown, path: path.relative(__dirname, target) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/authoring/draft', requireRole('superadmin'), (req, res) => {
  try {
    const { module: moduleSlug, subFolder, slug } = req.query;
    const target = resolveDraftPath(moduleSlug, subFolder, slug);
    if (!fsSync.existsSync(target)) return res.status(404).json({ error: 'Draft not found' });
    const text = fsSync.readFileSync(target, 'utf8');
    if (!/^draft:\s*true\b/m.test(text)) {
      return res.status(400).json({ error: 'Refusing to delete - frontmatter is not marked draft:true' });
    }
    const imageRefs = imagesReferencedBy(text);
    fsSync.unlinkSync(target);
    // Drafts never reached git, so cleanup is local-only - no deploy queue.
    let imagesRemoved = 0;
    for (const imgUrl of imageRefs) {
      if (isImageReferencedElsewhere(imgUrl, target)) continue;
      const imgAbs = path.join(__dirname, 'static' + imgUrl);
      if (fsSync.existsSync(imgAbs)) {
        try { fsSync.unlinkSync(imgAbs); imagesRemoved++; } catch {/* ignore */}
      }
    }
    res.json({ ok: true, imagesRemoved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// Phase B - raw markdown editor support.
//
// `/draft` GET/DELETE above only target draft:true files, gated by the
// 3-part {module, subFolder, slug} key. The raw editor needs to load + save
// ANY article (draft or published) by its docs/ path. These endpoints accept
// `?path=docs/modules/<m>/<sub>/<slug>.md` and validate the path matches the
// same canonical structure as resolveDraftPath, just expressed as a single
// relative path string instead of three components.
// ─────────────────────────────────────────────────────────────────────────

function resolveArticlePath(relPath) {
  if (typeof relPath !== 'string' || !relPath) throw new Error('path required');
  const norm = relPath.replace(/\\/g, '/');
  const m = /^docs\/modules\/([^/]+)\/([^/]+)\/([^/]+)\.(md|mdx)$/.exec(norm);
  if (!m) throw new Error('Path must match docs/modules/<module>/<sub-folder>/<slug>.{md,mdx}');
  const [, moduleSlug, subFolder, slug] = m;
  if (!isValidSlug(moduleSlug) || !isValidSlug(slug)) throw new Error('Invalid slug in path');
  if (!CANONICAL_SUBFOLDERS.has(subFolder)) throw new Error('Sub-folder not canonical');
  const target = path.resolve(__dirname, norm);
  if (!target.startsWith(MODULES_ROOT + path.sep)) throw new Error('Path escapes docs/modules/');
  return target;
}

app.get('/api/admin/authoring/article', requireRole('superadmin'), (req, res) => {
  try {
    const target = resolveArticlePath(req.query.path);
    if (!fsSync.existsSync(target)) return res.status(404).json({ error: 'Article not found' });
    const markdown = fsSync.readFileSync(target, 'utf8');
    res.json({ markdown, path: path.relative(__dirname, target) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/admin/authoring/articles', requireRole('superadmin'), (req, res) => {
  try {
    const { module: moduleSlug, subFolder, filter = 'all' } = req.query;
    if (!isValidSlug(moduleSlug)) return res.status(400).json({ error: 'Invalid module' });
    if (!CANONICAL_SUBFOLDERS.has(subFolder)) return res.status(400).json({ error: 'Invalid sub-folder' });
    const dir = path.join(MODULES_ROOT, moduleSlug, subFolder);
    if (!fsSync.existsSync(dir)) return res.json({ articles: [] });
    const articles = [];
    for (const entry of fsSync.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (!/\.(md|mdx)$/.test(entry.name)) continue;
      const p = path.join(dir, entry.name);
      const text = fsSync.readFileSync(p, 'utf8');
      const isDraft = /^draft:\s*true\b/m.test(text);
      if (filter === 'drafts' && !isDraft) continue;
      if (filter === 'published' && isDraft) continue;
      const titleMatch = /^title:\s*["']?(.+?)["']?\s*$/m.exec(text);
      const lastUpdMatch = /^\s*date:\s*(\S+)/m.exec(text);
      articles.push({
        path: path.relative(__dirname, p),
        slug: path.basename(p).replace(/\.(md|mdx)$/, ''),
        title: titleMatch ? titleMatch[1] : path.basename(p),
        lastUpdate: lastUpdMatch ? lastUpdMatch[1] : null,
        draft: isDraft,
      });
    }
    articles.sort((a, b) => String(b.lastUpdate).localeCompare(String(a.lastUpdate)));
    res.json({ articles });
  } catch (error) {
    console.error('❌ authoring/articles failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/authoring/save-raw', requireRole('superadmin'), (req, res) => {
  try {
    const { path: relPath, markdown } = req.body || {};
    if (!markdown) return res.status(400).json({ error: 'markdown required' });
    const target = resolveArticlePath(relPath);
    // Defang decorative emojis before audit + write. The pre-commit hook
    // would reject them on the next deploy commit anyway; doing it here
    // keeps the saved file consistent with what /save produces and the
    // audit result reflects the on-disk state.
    const cleaned = stripDecorativeEmojis(markdown);
    // Audit runs advisory - the raw editor surfaces findings as warnings, not
    // blockers. The wizard's /save is the strict gate; raw edits trust the
    // superadmin's judgment for surgical fixes.
    const audit = gradeMarkdown(cleaned);
    fsSync.mkdirSync(path.dirname(target), { recursive: true });
    // Same gate-protection as /save: derive {module, subFolder} from the
    // validated path and write the sub-folder _category_.json if missing.
    let subfolderCreated = false;
    const m = /^docs\/modules\/([^/]+)\/([^/]+)\/[^/]+\.(md|mdx)$/.exec(
      path.relative(__dirname, target).replace(/\\/g, '/')
    );
    if (m) subfolderCreated = ensureSubfolderCategory(m[1], m[2]);
    fsSync.writeFileSync(target, cleaned, 'utf8');

    // If this is a published article (draft:false), the raw save needs to
    // reach production. Without enqueueing, the change sits on the
    // container's filesystem - Docusaurus serves the pre-built build/, and
    // the next Railway redeploy rebuilds from git, both of which see the
    // OLD content. Enqueue an upsert so fireDeploy commits the change on
    // the next debounced batch. Drafts skip the enqueue (they never reach
    // git until Publish flips them).
    const relTarget = path.relative(__dirname, target);
    const isDraft = /^draft:\s*true\b/m.test(cleaned);
    let queuedForDeploy = false;
    if (!isDraft) {
      enqueueUpsert(relTarget);
      // If we just wrote a brand-new sub-folder _category_.json (rare on
      // a raw save - the article must already live there - but possible
      // if the dir was scaffolded without the gate), ship it in the same
      // commit so the audit doesn't fail on the deploy.
      if (subfolderCreated && m) {
        enqueueUpsert(path.join('docs', 'modules', m[1], m[2], '_category_.json'));
      }
      persistDeployState();
      scheduleDeploy();
      queuedForDeploy = true;
    }

    res.json({
      ok: true,
      path: relTarget,
      audit,
      subfolderCreated,
      emojisStripped: cleaned !== markdown,
      queuedForDeploy,
      queueSize: deployQueue.size,
    });
  } catch (error) {
    console.error('❌ authoring/save-raw failed:', error.message);
    res.status(400).json({ error: error.message });
  }
});

/** Replace the (indented) `customProps.roles` block in an article's
 *  frontmatter with an inline `roles: [a, b, …]`. Scoped to the frontmatter
 *  block so a stray `roles:` in the body is never touched. Handles both the
 *  inline `[..]` form and the `- item` block-sequence form; inserts a roles
 *  line under `customProps:` if none exists. */
function setFrontmatterRoles(markdown, roles) {
  const fmMatch = /^---\n([\s\S]*?)\n---/.exec(markdown);
  if (!fmMatch) return markdown;
  let fm = fmMatch[1];
  const inline = `  roles: [${roles.join(', ')}]`;
  const rolesRe = /^[ \t]+roles[ \t]*:[^\n]*(?:\n[ \t]+-[ \t]*[^\n]*)*/m;
  if (rolesRe.test(fm)) {
    fm = fm.replace(rolesRe, inline);
  } else if (/^customProps[ \t]*:/m.test(fm)) {
    fm = fm.replace(/^(customProps[ \t]*:[^\n]*\n)/m, `$1${inline}\n`);
  } else {
    fm = fm.replace(/\s*$/, '') + `\ncustomProps:\n${inline}`;
  }
  return markdown.replace(fmMatch[0], `---\n${fm}\n---`);
}

/** Drop the article-level `customProps.privilege:` line so the destination
 *  folder's _category_.json gate governs licensing (gates AND-combine). */
function removeFrontmatterPrivilege(markdown) {
  const fmMatch = /^---\n([\s\S]*?)\n---/.exec(markdown);
  if (!fmMatch) return markdown;
  const fm = fmMatch[1].replace(/^[ \t]+privilege[ \t]*:[^\n]*\n?/m, '');
  return markdown.replace(fmMatch[0], `---\n${fm}\n---`);
}

// Relocate an article to a different module / sub-folder (slug unchanged).
// Writes the new file + unlinks the old; for published articles the rename
// ships as enqueueDelete(old) + enqueueUpsert(new) in one deploy. Images are
// root-relative + shared, so they are never moved or culled. The moved file's
// audience (customProps.roles) is rewritten to the destination folder's default
// and any article-level privilege is dropped, so the destination
// _category_.json gate governs.
app.post('/api/admin/authoring/move', requireRole('superadmin'), (req, res) => {
  try {
    const { fromPath, toModule, toSubFolder } = req.body || {};
    const fromAbs = resolveArticlePath(fromPath);
    const fromRel = path.relative(__dirname, fromAbs);
    const slug = path.basename(fromAbs).replace(/\.(md|mdx)$/, '');
    const toAbs = resolveDraftPath(toModule, toSubFolder, slug);
    const toRel = path.relative(__dirname, toAbs);

    if (fromAbs === toAbs) {
      return res.status(400).json({ error: 'Article is already in that folder.' });
    }
    if (!fsSync.existsSync(fromAbs)) {
      return res.status(404).json({ error: 'Article not found' });
    }
    if (!fsSync.existsSync(path.join(MODULES_ROOT, toModule))) {
      return res.status(400).json({ error: `Unknown module: ${toModule}` });
    }
    if (fsSync.existsSync(toAbs)) {
      return res.status(409).json({ error: `An article with slug "${slug}" already exists in ${toModule}/${toSubFolder}.` });
    }

    const raw = fsSync.readFileSync(fromAbs, 'utf8');
    const wasPublished = !/^draft:\s*true\b/m.test(raw);

    // Re-home the audience to the destination sub-folder's default roles and
    // drop any article-level privilege.
    const tmpl = SUBFOLDER_TEMPLATE.find((s) => s.slug === toSubFolder);
    const destRoles = (tmpl && tmpl.roles) || ALL_ROLES;
    let next = setFrontmatterRoles(raw, destRoles);
    next = removeFrontmatterPrivilege(next);
    next = stripDecorativeEmojis(next);

    // Gate the destination sub-folder before the file lands there.
    const created = ensureSubfolderCategory(toModule, toSubFolder);

    fsSync.mkdirSync(path.dirname(toAbs), { recursive: true });
    fsSync.writeFileSync(toAbs, next, 'utf8');
    fsSync.unlinkSync(fromAbs);

    let queuedForDeploy = false;
    if (wasPublished) {
      enqueueDelete(fromRel);
      enqueueUpsert(toRel);
      if (created) {
        enqueueUpsert(path.join('docs', 'modules', toModule, toSubFolder, '_category_.json'));
      }
      persistDeployState();
      scheduleDeploy();
      queuedForDeploy = true;
    }

    res.json({
      ok: true,
      fromPath: fromRel,
      toPath: toRel,
      roles: destRoles,
      subfolderCreated: created,
      queuedForDeploy,
      queueSize: deployQueue.size,
    });
  } catch (error) {
    console.error('❌ authoring/move failed:', error.message);
    res.status(400).json({ error: error.message });
  }
});

/** Scan an article body for /img/helpscout/authored/... image URLs.
 *  Returns a Set of root-relative URLs (e.g. "/img/helpscout/authored/foo.png"). */
function imagesReferencedBy(markdown) {
  const re = /!\[[^\]]*\]\((\/img\/helpscout\/authored\/[^)\s]+)\)/g;
  const out = new Set();
  for (const m of markdown.matchAll(re)) out.add(m[1]);
  return out;
}

/** Walk docs/modules/ for any .md/.mdx article (other than `excludeAbs`)
 *  that references `imgUrl`. Used to avoid deleting an image another doc
 *  still needs. Sharing is rare with the wizard's random-suffix uploads
 *  but possible if someone hand-edited a path. */
function isImageReferencedElsewhere(imgUrl, excludeAbs) {
  function walk(dir) {
    for (const entry of fsSync.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (walk(p)) return true;
      } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name) && p !== excludeAbs) {
        try {
          if (fsSync.readFileSync(p, 'utf8').includes(imgUrl)) return true;
        } catch {/* ignore */}
      }
    }
    return false;
  }
  return fsSync.existsSync(MODULES_ROOT) ? walk(MODULES_ROOT) : false;
}

app.delete('/api/admin/authoring/article', requireRole('superadmin'), (req, res) => {
  try {
    const target = resolveArticlePath(req.query.path);
    if (!fsSync.existsSync(target)) return res.status(404).json({ error: 'Article not found' });
    // Read frontmatter + image refs BEFORE unlinking. If the article was
    // non-draft (ever published to git) we need to enqueue a delete-commit
    // for the .md AND for the now-orphan images. Drafts never reached git,
    // so a local unlink is sufficient there.
    let wasPublished = false;
    let imageRefs = new Set();
    try {
      const raw = fsSync.readFileSync(target, 'utf8');
      wasPublished = !/^draft:\s*true\b/m.test(raw);
      imageRefs = imagesReferencedBy(raw);
    } catch {/* if unreadable, assume published - safer to over-deploy */ wasPublished = true; }

    fsSync.unlinkSync(target);

    // Cull images this article referenced, but only if no other article
    // still needs them. Locally always; via deploy queue if was-published.
    const imagesRemovedRel = [];
    for (const imgUrl of imageRefs) {
      if (isImageReferencedElsewhere(imgUrl, target)) continue;
      const imgRel = 'static' + imgUrl;  // /img/helpscout/authored/X → static/img/helpscout/authored/X
      const imgAbs = path.join(__dirname, imgRel);
      if (fsSync.existsSync(imgAbs)) {
        try { fsSync.unlinkSync(imgAbs); } catch {/* ignore */}
      }
      imagesRemovedRel.push(imgRel);
    }

    let queued = false;
    if (wasPublished) {
      const relPath = path.relative(__dirname, target);
      enqueueDelete(relPath);
      for (const imgRel of imagesRemovedRel) enqueueDelete(imgRel);
      persistDeployState();
      scheduleDeploy();
      queued = true;
    }
    res.json({
      ok: true,
      queuedForDeploy: queued,
      queueSize: deployQueue.size,
      imagesRemoved: imagesRemovedRel.length,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// Module taxonomy - static/module-overviews.json + add-new endpoint.
//
// static/module-overviews.json is the single source of truth for module
// identity (label + privilege gate + landing-page metadata). It's already
// read by:
//   - src/components/Modules/ModuleOverview.tsx (renders the per-module page)
//   - scripts/audit-gates.js (derives the expected sub-folder gate from
//     the module's privilege)
//
// Adding a module appends to overviews.json AND writes the on-disk skeleton:
//   - docs/modules/<slug>/_category_.json (no privilege - module root is open)
//   - 9 sub-folder _category_.json files (privilege/anyPrivilege inherited
//     from the parent module so audit-gates.js's expected gate matches)
//   - docs/modules/<slug>/index.mdx (renders <ModuleOverview slug=...>)
// ─────────────────────────────────────────────────────────────────────────

const OVERVIEWS_JSON_PATH = path.join(__dirname, 'static', 'module-overviews.json');
const KNOWN_PRIVILEGES_PATH = path.join(__dirname, 'data', 'known-privileges.json');

const ALL_ROLES = ['user', 'manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin'];
const MANAGER_PLUS = ['manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin'];
const EDITOR_PLUS = ['editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin'];

const SUBFOLDER_TEMPLATE = [
  { slug: 'for-learners',             label: 'For Learners',             position: 3, roles: ALL_ROLES },
  { slug: 'for-managers',             label: 'For Managers',             position: 4, roles: MANAGER_PLUS, extraPrivilege: 'managerView' },
  { slug: 'create-and-manage',        label: 'Create & Manage',          position: 3, roles: EDITOR_PLUS },
  { slug: 'assign-and-schedule',      label: 'Assign & Schedule',        position: 4, roles: EDITOR_PLUS },
  { slug: 'features',                 label: 'Features',                 position: 5, roles: EDITOR_PLUS },
  { slug: 'reports-and-analytics',    label: 'Reports & Analytics',      position: 6, roles: EDITOR_PLUS },
  { slug: 'settings-and-permissions', label: 'Settings & Permissions',   position: 7, roles: EDITOR_PLUS },
  { slug: 'best-practices',           label: 'Best Practices',           position: 8, roles: EDITOR_PLUS },
  { slug: 'faqs-and-troubleshooting', label: 'FAQs & Troubleshooting',   position: 9, roles: ALL_ROLES },
];

function loadOverviews() {
  if (!fsSync.existsSync(OVERVIEWS_JSON_PATH)) return { modules: {} };
  return JSON.parse(fsSync.readFileSync(OVERVIEWS_JSON_PATH, 'utf8'));
}

function saveOverviews(doc) {
  fsSync.writeFileSync(OVERVIEWS_JSON_PATH, JSON.stringify(doc, null, 2) + '\n', 'utf8');
}

/** Flatten overviews.modules (object keyed by slug) into the array shape
 *  the wizard + drafts queue dropdowns consume. */
function modulesFromOverviews(doc) {
  const map = (doc && doc.modules) || {};
  return Object.entries(map).map(([slug, meta]) => {
    const out = { slug, label: meta.label || slug };
    if (meta.privilege) out.privilege = meta.privilege;
    if (Array.isArray(meta.anyPrivilege) && meta.anyPrivilege.length) out.anyPrivilege = meta.anyPrivilege;
    if (meta.tagline) out.tagline = meta.tagline;
    return out;
  });
}

function loadKnownPrivileges() {
  if (!fsSync.existsSync(KNOWN_PRIVILEGES_PATH)) return { privileges: [] };
  return JSON.parse(fsSync.readFileSync(KNOWN_PRIVILEGES_PATH, 'utf8'));
}

function saveKnownPrivileges(doc) {
  fsSync.writeFileSync(KNOWN_PRIVILEGES_PATH, JSON.stringify(doc, null, 2) + '\n', 'utf8');
}

function buildCategoryJson({ label, position, roles, privilege, anyPrivilege, allPrivileges, generatedIndexSlug }) {
  const customProps = { roles };
  if (privilege) customProps.privilege = privilege;
  if (anyPrivilege && anyPrivilege.length) customProps.anyPrivilege = anyPrivilege;
  if (allPrivileges && allPrivileges.length) customProps.allPrivileges = allPrivileges;
  const out = { label, position, collapsible: true, collapsed: true };
  if (generatedIndexSlug) {
    out.link = { type: 'generated-index', title: label, slug: generatedIndexSlug };
  }
  out.customProps = customProps;
  return out;
}

/** Inspect docs/modules/* for the max `position` already used on disk. */
function maxModulePositionOnDisk() {
  if (!fsSync.existsSync(MODULES_ROOT)) return 0;
  let max = 0;
  for (const entry of fsSync.readdirSync(MODULES_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const catFile = path.join(MODULES_ROOT, entry.name, '_category_.json');
    if (!fsSync.existsSync(catFile)) continue;
    try {
      const cat = JSON.parse(fsSync.readFileSync(catFile, 'utf8'));
      if (typeof cat.position === 'number' && cat.position > max) max = cat.position;
    } catch {/* ignore parse errors */}
  }
  return max;
}

/** Write docs/modules/<slug>/_category_.json, each sub-folder's
 *  _category_.json, and the module landing index.mdx. Refuses if the
 *  module directory already exists. */
function writeModuleSkeleton({ slug, label, privilege, anyPrivilege, position, tagline }) {
  const moduleDir = path.join(MODULES_ROOT, slug);
  if (fsSync.existsSync(moduleDir)) {
    throw new Error(`docs/modules/${slug}/ already exists on disk`);
  }
  const written = [];

  fsSync.mkdirSync(moduleDir, { recursive: true });
  // Module root carries ALL_ROLES with NO privilege - the landing page must
  // stay reachable so unlicensed users see the upsell. scripts/audit-gates.js
  // enforces this.
  const moduleCategory = buildCategoryJson({ label, position, roles: ALL_ROLES });
  const moduleCategoryPath = path.join(moduleDir, '_category_.json');
  fsSync.writeFileSync(moduleCategoryPath, JSON.stringify(moduleCategory, null, 2) + '\n', 'utf8');
  written.push(path.relative(__dirname, moduleCategoryPath));

  const indexPath = path.join(moduleDir, 'index.mdx');
  fsSync.writeFileSync(indexPath, buildModuleIndexMdx({ slug, label, tagline }), 'utf8');
  written.push(path.relative(__dirname, indexPath));

  for (const sf of SUBFOLDER_TEMPLATE) {
    const sfDir = path.join(moduleDir, sf.slug);
    fsSync.mkdirSync(sfDir, { recursive: true });
    // For-managers gates on managerView AND the parent module's privilege.
    // Other sub-folders inherit the parent's single privilege OR anyPrivilege.
    // scripts/audit-gates.js derives the expected gate from the parent
    // module's privilege in static/module-overviews.json, so writing it
    // here on each sub-folder is what makes the audit pass.
    const sfCategory = sf.extraPrivilege
      ? buildCategoryJson({
          label: sf.label,
          position: sf.position,
          roles: sf.roles,
          privilege: sf.extraPrivilege,
          allPrivileges: privilege ? [privilege] : undefined,
          anyPrivilege,
          generatedIndexSlug: `/modules/${slug}/${sf.slug}`,
        })
      : buildCategoryJson({
          label: sf.label,
          position: sf.position,
          roles: sf.roles,
          privilege,
          anyPrivilege,
          generatedIndexSlug: `/modules/${slug}/${sf.slug}`,
        });
    const sfPath = path.join(sfDir, '_category_.json');
    fsSync.writeFileSync(sfPath, JSON.stringify(sfCategory, null, 2) + '\n', 'utf8');
    written.push(path.relative(__dirname, sfPath));
  }

  return written;
}

/** Ensure docs/modules/<m>/<sub>/_category_.json exists. Called from the
 *  authoring save endpoints so a brand-new sub-folder (created by mkdirSync
 *  when an article lands in a previously-unused sub-folder) doesn't ship
 *  ungated. Derives the gate from SUBFOLDER_TEMPLATE + the module's
 *  privilege/anyPrivilege in static/module-overviews.json. Returns true if
 *  it wrote a new file, false otherwise. */
function ensureSubfolderCategory(moduleSlug, subFolder) {
  if (!moduleSlug || !subFolder) return false;
  const dir = path.join(MODULES_ROOT, moduleSlug, subFolder);
  const target = path.join(dir, '_category_.json');
  if (fsSync.existsSync(target)) return false;

  const tmpl = SUBFOLDER_TEMPLATE.find((s) => s.slug === subFolder);
  if (!tmpl) return false;  // unknown sub-folder name; leave alone

  const overviews = loadOverviews();
  const meta = (overviews.modules || {})[moduleSlug] || {};
  const modulePrivilege    = meta.privilege || null;
  const moduleAnyPrivilege = Array.isArray(meta.anyPrivilege) && meta.anyPrivilege.length
    ? meta.anyPrivilege
    : null;

  const cat = tmpl.extraPrivilege
    ? buildCategoryJson({
        label:    tmpl.label,
        position: tmpl.position,
        roles:    tmpl.roles,
        privilege:    tmpl.extraPrivilege,
        allPrivileges: modulePrivilege ? [modulePrivilege] : undefined,
        anyPrivilege:  moduleAnyPrivilege || undefined,
        generatedIndexSlug: `/modules/${moduleSlug}/${subFolder}`,
      })
    : buildCategoryJson({
        label:    tmpl.label,
        position: tmpl.position,
        roles:    tmpl.roles,
        privilege:    modulePrivilege || undefined,
        anyPrivilege: moduleAnyPrivilege || undefined,
        generatedIndexSlug: `/modules/${moduleSlug}/${subFolder}`,
      });

  fsSync.mkdirSync(dir, { recursive: true });
  fsSync.writeFileSync(target, JSON.stringify(cat, null, 2) + '\n', 'utf8');
  console.log(`[authoring] ensureSubfolderCategory: wrote ${path.relative(__dirname, target)}`);
  return true;
}

function buildModuleIndexMdx({ slug, label, tagline }) {
  // Matches the format of docs/modules/quiz/index.mdx etc. - frontmatter
  // with all 7 roles, no privilege; body just embeds <ModuleOverview/>.
  const desc = (tagline || `${label} - SmartWinnr module.`).replace(/'/g, "''");
  return `---
id: module-${slug}
title: ${label}
description: '${desc}'
slug: /modules/${slug}/
displayed_sidebar: tutorialSidebar
hide_title: true
hide_table_of_contents: true
customProps:
  roles:
    - user
    - manager
    - editor
    - admin
    - orgadmin
    - lamadmin
    - superadmin
tags:
  - ${slug}
---

import ModuleOverview from '@site/src/components/Modules/ModuleOverview';

<ModuleOverview slug="${slug}" />
`;
}

app.get('/api/admin/authoring/modules', requireRole('superadmin'), (req, res) => {
  try {
    const overviews = loadOverviews();
    const privDoc = loadKnownPrivileges();
    res.json({
      modules: modulesFromOverviews(overviews),
      privileges: privDoc.privileges || [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/authoring/modules', requireRole('superadmin'), (req, res) => {
  try {
    const { slug, label, privilege, anyPrivilege, description } = req.body || {};
    if (!isValidSlug(slug)) {
      return res.status(400).json({ error: 'slug must be kebab-case (a-z, 0-9, hyphen)' });
    }
    if (!label || typeof label !== 'string' || !label.trim()) {
      return res.status(400).json({ error: 'label required' });
    }

    const overviews = loadOverviews();
    if (overviews.modules && overviews.modules[slug]) {
      return res.status(409).json({ error: `Module slug "${slug}" already exists in overviews.json` });
    }
    if (fsSync.existsSync(path.join(MODULES_ROOT, slug))) {
      return res.status(409).json({ error: `docs/modules/${slug}/ already exists on disk` });
    }

    let privilegeAdded = false;
    let novelPrivilege = null;
    if (privilege && typeof privilege === 'string' && privilege.trim()) {
      const privDoc = loadKnownPrivileges();
      const list = privDoc.privileges || [];
      if (!list.includes(privilege)) {
        list.push(privilege);
        list.sort((a, b) => a.localeCompare(b));
        privDoc.privileges = list;
        saveKnownPrivileges(privDoc);
        privilegeAdded = true;
        novelPrivilege = privilege;
      }
    }

    const position = maxModulePositionOnDisk() + 10 || 10;
    const labelTrim = label.trim();
    const tagline = (description && String(description).trim()) || `${labelTrim} - SmartWinnr module.`;

    const written = writeModuleSkeleton({
      slug,
      label: labelTrim,
      privilege: privilege || undefined,
      anyPrivilege: Array.isArray(anyPrivilege) && anyPrivilege.length ? anyPrivilege : undefined,
      position,
      tagline,
    });

    // Append to overviews.json AFTER the skeleton writes succeed - that way
    // a half-written skeleton doesn't leave a dangling overviews entry.
    overviews.modules = overviews.modules || {};
    const entry = {
      label: labelTrim,
      tagline,
      description: tagline,
      keyFeatures: [],
      who: '',
      ctaEmail: 'admin@your-org.com',
    };
    if (privilege) entry.privilege = privilege;
    if (Array.isArray(anyPrivilege) && anyPrivilege.length) entry.anyPrivilege = anyPrivilege;
    overviews.modules[slug] = entry;
    saveOverviews(overviews);

    res.json({ ok: true, slug, privilegeAdded, novelPrivilege, paths: written });
  } catch (error) {
    console.error('❌ authoring/modules POST failed:', error.message);
    res.status(400).json({ error: error.message });
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
const fs = require('fs');

// URL-guard middleware: enforce role/privilege gates server-side so a hand-typed
// URL can't bypass the swizzled sidebar. The gate table is emitted by
// plugins/access-gate-emit.js at build time → build/doc-gates.json.
// Falls open if the file is missing (dev with no build, or a build that ran
// before the plugin was added) so we don't break local dev.
let docGates = null;
try {
  const gatesPath = path.join(buildPath, 'doc-gates.json');
  if (fs.existsSync(gatesPath)) {
    docGates = JSON.parse(fs.readFileSync(gatesPath, 'utf8'));
    console.log(
      `🔐 doc-gates.json loaded: ${docGates.prefixes.length} prefix gates, ` +
        `${Object.keys(docGates.exact).length} article gates`
    );
  } else {
    console.log('🔓 doc-gates.json absent - URL guard inactive (build first to enable)');
  }
} catch (e) {
  console.error('⚠️  Failed to load doc-gates.json - URL guard inactive:', e.message);
}

/**
 * Collect EVERY gate that applies to a URL - the exact frontmatter gate plus
 * every ancestor-category prefix gate - and AND-combine them. This matches
 * directory-permission semantics (Unix-style): a deeply-nested article is
 * only accessible when each ancestor allows the viewer.
 *
 * Without this, an article whose frontmatter sets `customProps.roles: [user]`
 * would be reachable even if its parent module requires the `quiz` privilege.
 * The longest-prefix-only lookup let exactly that bug ship.
 */
function lookupGates(reqPath) {
  if (!docGates) return [];
  const normalized = reqPath.replace(/\/+$/, '') || '/';
  const gates = [];
  if (docGates.exact[normalized]) gates.push(docGates.exact[normalized]);
  for (const {prefix, gate} of docGates.prefixes) {
    if (normalized === prefix || normalized.startsWith(prefix + '/')) {
      gates.push(gate);
    }
  }
  return gates;
}

/**
 * URL-guard semantics reused for non-route surfaces (vector search results,
 * chatbot RAG context, chatbot citations). Same AND-of-all-matching-gates
 * logic as the middleware below, so what we feed the LLM and surface as a
 * link stays consistent with what the site would actually serve.
 *
 * Falls open when docGates is absent (mirrors the URL guard) so dev runs
 * without a build still work.
 */
function isUrlAllowedForUser(url, user) {
  if (!docGates) return true;
  const gates = lookupGates(url);
  for (const g of gates) {
    if (!isAllowed(g, user)) return false;
  }
  return true;
}

app.use((req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/auth/')) return next();
  const gates = lookupGates(req.path);
  if (gates.length === 0) return next();
  // AND semantics: every gate along the path must allow the viewer.
  const blocked = gates.some((gate) => !isAllowed(gate, req.user));
  if (!blocked) return next();
  // 403 with a friendly fallback page if one exists.
  const forbidden = path.join(buildPath, '403.html');
  if (fs.existsSync(forbidden)) {
    return res.status(403).sendFile(forbidden);
  }
  return res
    .status(403)
    .send('Forbidden - this section is not available for your role or organization.');
});

// Serve newly uploaded authoring screenshots immediately from `static/`
// without waiting for a rebuild. The upload endpoint writes here; on the
// next `npm run build`, Docusaurus copies the same file into `build/`.
// Mount BEFORE the main `build/` static so freshly uploaded images win
// over any stale build artifact with the same name.
app.use(
  '/img/helpscout/authored',
  express.static(IMAGE_ROOT, {fallthrough: true})
);

app.use(express.static(buildPath));

// Handle client-side routing for non-API routes. Docusaurus pre-builds an
// index.html under every doc dir (e.g. build/overview/index.html), so the
// fallback chain is: <path>/index.html → build/index.html → 404.html → 503.
// This prevents a missing/partial build from crashing the auth flow.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  const candidates = [
    path.join(buildPath, req.path, 'index.html'),
    path.join(buildPath, 'index.html'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return res.sendFile(candidate);
    }
  }

  const notFound = path.join(buildPath, '404.html');
  if (fs.existsSync(notFound)) {
    return res.status(404).sendFile(notFound);
  }

  return res.status(503).json({
    error: 'Build missing or incomplete. Run `npm run build` and restart the server.',
  });
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

  // if (process.env.RUN_INDEXER === 'true') {
    const forceReindex = true;
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
  // }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down');
  process.exit(0);
});