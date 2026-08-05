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
const matter = require('gray-matter');
const fsSync = require('fs');
// Shared docs-path -> live-route resolver (also used by the internal indexer).
const docRoutes = require('./lib/doc-routes');
const { normRoute, resolveLiveUrl } = docRoutes;
const { setFrontmatterRoles, removeFrontmatterPrivilege } = require('./lib/frontmatter');

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

// In-memory conversation storage (replace with database in production).
// Entries are {owner, messages, touchedAt}. `owner` is what makes a
// conversation private: the id alone used to be enough to read or delete
// anyone's transcript. Bounded so a long-lived process can't grow forever -
// durable history lives in SQLite via db/chat-logger.js, this Map is only the
// working set for follow-up turns.
const conversations = new Map();
const CONVERSATION_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const MAX_CONVERSATIONS = 500;

/** Stable identity for conversation ownership. */
function conversationOwner(user) {
  if (!user) return 'anonymous';
  return `${user.orgId || 'no-org'}:${(user.email || 'unknown').toLowerCase()}`;
}

/** Evict expired conversations, then the oldest if we're still over cap. */
function pruneConversations() {
  const cutoff = Date.now() - CONVERSATION_TTL_MS;
  for (const [id, c] of conversations) {
    if (!c || c.touchedAt < cutoff) conversations.delete(id);
  }
  if (conversations.size <= MAX_CONVERSATIONS) return;
  const byAge = [...conversations.entries()].sort((a, b) => a[1].touchedAt - b[1].touchedAt);
  for (const [id] of byAge.slice(0, conversations.size - MAX_CONVERSATIONS)) {
    conversations.delete(id);
  }
}

/** Fetch a conversation only if this user owns it. Returns null otherwise,
 *  so callers can 404 rather than confirm the id exists. */
function getOwnedConversation(convId, user) {
  const c = conversations.get(convId);
  if (!c) return null;
  return c.owner === conversationOwner(user) ? c : null;
}

// Per-user token bucket for the two expensive endpoints. Each /api/chat and
// /api/vector/search call costs an OpenAI embedding (and chat completion), and
// nothing else throttles them - a stuck client or a held-down key could spend
// real money in a loop.
const RATE_LIMIT_CAPACITY = 30;      // burst
const RATE_LIMIT_REFILL_PER_SEC = 1; // sustained
const rateBuckets = new Map();

function takeRateToken(user) {
  const key = conversationOwner(user);
  const now = Date.now();
  let b = rateBuckets.get(key);
  if (!b) {
    b = { tokens: RATE_LIMIT_CAPACITY, at: now };
    rateBuckets.set(key, b);
  }
  b.tokens = Math.min(
    RATE_LIMIT_CAPACITY,
    b.tokens + ((now - b.at) / 1000) * RATE_LIMIT_REFILL_PER_SEC
  );
  b.at = now;
  if (rateBuckets.size > 5000) {
    for (const [k, v] of rateBuckets) if (now - v.at > 3600_000) rateBuckets.delete(k);
  }
  if (b.tokens < 1) return false;
  b.tokens -= 1;
  return true;
}

/** Longest question / query we accept. Anything past this is a paste, not a
 *  question - and an over-length embedding request just errors out anyway. */
const MAX_QUERY_CHARS = 2000;

/** Generic "where to go next" links offered alongside a chat answer. Every one
 *  is route-checked and role-checked before it reaches the user (see the
 *  relatedLinks mapping in /api/chat), so a retired page drops out on its own. */
const RELATED_LINK_CANDIDATES = [
  {
    title: 'Getting Started',
    url: '/get-started/overview',
    description: 'Sign in, find your way around, and set up the basics',
  },
  {
    title: 'Quiz Module',
    url: '/modules/quiz',
    description: 'Create, assign, and report on quizzes',
  },
];

/** Thrown by searchDocuments when the index itself is unreachable, so callers
 *  can say "search is down" instead of "that article doesn't exist". */
class SearchUnavailableError extends Error {
  constructor(cause) {
    super('Documentation search is unavailable');
    this.name = 'SearchUnavailableError';
    this.cause = cause;
  }
}

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
    if (typeof query !== 'string' || query.length > MAX_QUERY_CHARS) {
      return res.status(400).json({ error: `Query must be a string of at most ${MAX_QUERY_CHARS} characters` });
    }
    if (!takeRateToken(req.user)) {
      return res.status(429).json({ error: 'Too many searches - please slow down.' });
    }

    console.log(`🔍 Document search query: "${query}"`);
    
    // Search documents using the same function as chat
    const searchResults = await searchDocuments(query, limit, req.user);
    
    // Transform results to match the expected format for the search component.
    // Results whose URL no longer resolves are dropped rather than rendered as
    // a dead link (see resolveCitationUrl).
    const results = searchResults
      .filter((doc) => doc.liveUrl)
      .map((doc) => ({
        id: doc.metadata?.source || `doc_${Math.random()}`,
        content: doc.content || '',
        metadata: {
          source: doc.metadata?.source || '',
          title: doc.metadata?.title || (doc.metadata?.source ? doc.metadata.source.replace(/\.mdx?$/, '').replace(/^.*\//, '') : 'Unknown'),
          url: doc.liveUrl
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
    if (error instanceof SearchUnavailableError) {
      // 503 so the client can say "search is down" instead of "no results".
      return res.status(503).json({ error: 'Documentation search is temporarily unavailable' });
    }
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

    // Format results. liveUrl is the URL callers may actually link to: the
    // stored metadata.url resolved against the current docs tree and repaired
    // through data/redirects.json, or null when it resolves to nothing. See
    // resolveCitationUrl below.
    const documents = [];
    if (results.documents && results.documents[0]) {
      for (let i = 0; i < results.documents[0].length; i++) {
        const metadata = results.metadatas[0][i];
        documents.push({
          content: results.documents[0][i],
          metadata,
          liveUrl: resolveCitationUrl(metadata && metadata.url, metadata && metadata.source),
          distance: results.distances[0][i]
        });
      }
    }

    // Gate filter - drops docs the viewer can't open so search + chat
    // citations stay consistent with what the URL guard would serve.
    // Gate the RESOLVED url: a stale/nonexistent path matches no exact gate
    // entry, so gating it directly would inherit only its ancestor prefixes
    // and wave it through. When user is null (internal indexer calls) the
    // filter is skipped.
    const filtered = user
      ? documents.filter((d) => {
          const url = d.liveUrl || (d.metadata && d.metadata.url);
          if (!url) return true; // no URL means we can't gate; pass through
          return isUrlAllowedForUser(url, user);
        })
      : documents;

    return filtered.slice(0, limit);
  } catch (error) {
    // Do NOT swallow this into an empty array. An unreachable ChromaDB or a
    // failing embedding call used to look exactly like "no article matched",
    // so users were told the documentation didn't exist, and the exchange was
    // logged as a content gap. Callers turn this into an explicit outage
    // message (chat) or a 503 (search).
    console.error('❌ Error searching documents:', error.message);
    throw new SearchUnavailableError(error);
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

// Ally's system prompt lives in prompts/ally.md so non-engineers can
// iterate on voice without touching server code. Cached at module init -
// changes require a process restart, same as other config.
const ALLY_PROMPT_PATH = require('path').join(__dirname, 'prompts', 'ally.md');
let _allyPromptTemplate = null;
function getAllyPromptTemplate() {
  if (_allyPromptTemplate) return _allyPromptTemplate;
  try {
    _allyPromptTemplate = require('fs').readFileSync(ALLY_PROMPT_PATH, 'utf8');
  } catch (e) {
    console.error('⚠️  Failed to read prompts/ally.md - falling back to inline prompt:', e.message);
    _allyPromptTemplate =
      'You are Ally, SmartWinnr\'s help assistant.\n\n' +
      'CONTEXT (retrieved from SmartWinnr documentation):\n{{CONTEXT}}\n\n' +
      'Answer using ONLY the context. Address the user as "you". If the context\n' +
      'is silent, say "I don\'t have docs on that yet" and suggest where to look.';
  }
  return _allyPromptTemplate;
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

    const systemPrompt = getAllyPromptTemplate().replace('{{CONTEXT}}', context);

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
    if (typeof message !== 'string' || message.length > MAX_QUERY_CHARS) {
      return res.status(400).json({ error: `Message must be a string of at most ${MAX_QUERY_CHARS} characters` });
    }
    if (!takeRateToken(req.user)) {
      return res.status(429).json({ error: 'Too many messages - please slow down.' });
    }

    // Get or create conversation. A client-supplied conversationId is only
    // honored when this user owns it; otherwise we start a fresh conversation
    // rather than appending to (and later replying with) someone else's thread.
    const owned = conversationId ? getOwnedConversation(conversationId, req.user) : null;
    const convId = owned ? conversationId : uuidv4();
    const conversation = owned || { owner: conversationOwner(req.user), messages: [], touchedAt: Date.now() };
    const history = conversation.messages;

    // Add user message to history
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    history.push(userMessage);

    // Search for relevant documents. An index outage is NOT a content gap:
    // answer honestly instead of letting Ally say the docs don't cover it.
    console.log('🔍 Searching for relevant documents...');
    let searchResults;
    try {
      searchResults = await searchDocuments(message, 5, req.user);
    } catch (searchError) {
      if (!(searchError instanceof SearchUnavailableError)) throw searchError;
      return res.status(503).json({
        conversationId: convId,
        message: { id: uuidv4(), role: 'assistant', timestamp: new Date() },
        response: {
          message: "I can't reach the documentation index right now, so I don't want to guess. Please try again in a moment - if it keeps happening, let your SmartWinnr admin know.",
          citations: [],
          relatedLinks: [],
          confidence: 0,
          relevanceScore: 0,
          unavailable: true,
        },
      });
    }

    // Build context from search results
    let context = '';
    const citations = [];

    if (searchResults.length > 0) {
      context = searchResults.map((result, index) => {
        // Add to citations if it's a good match (distance < 0.8) AND its URL
        // still resolves to a live route. A doc with a dead URL still feeds
        // the LLM its context below - we just don't hand the user a link we
        // know is broken.
        if (result.distance < 0.8 && result.metadata && result.liveUrl) {
          citations.push({
            title: result.metadata.title || 'SmartWinnr Documentation',
            url: result.liveUrl,
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
      // Same two rules as citations: the URL must resolve to a live route, and
      // the viewer must be allowed to open it. The previous hardcoded pair
      // failed both - /administration is admin-gated (a `user` following it
      // gets a 403) and /quiz has never existed.
      relatedLinks: RELATED_LINK_CANDIDATES
        .map((l) => ({ ...l, url: resolveCitationUrl(l.url, 'relatedLinks') }))
        .filter((l) => l.url && isUrlAllowedForUser(l.url, req.user)),
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

    // Store updated conversation (owner-tagged, TTL/size bounded)
    conversation.touchedAt = Date.now();
    conversations.set(convId, conversation);
    pruneConversations();

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

// Get conversation history. Owner-only: a conversation is a transcript of
// someone's own questions, and the id used to be the only thing standing
// between any signed-in user and any other user's session. 404 rather than 403
// so a non-owner can't even confirm the id exists.
app.get('/api/chat/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = getOwnedConversation(conversationId, req.user);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      conversationId,
      messages: conversation.messages,
      messageCount: conversation.messages.length
    });
  } catch (error) {
    console.error('❌ Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// Clear conversation - owner-only, same reasoning as the GET above.
app.delete('/api/chat/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!getOwnedConversation(conversationId, req.user)) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
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
// Human-readable list for error messages, in template order.
const CANONICAL_SUBFOLDER_LIST = [...CANONICAL_SUBFOLDERS].join(', ');
/** Reason string when a module sub-folder is not canonical, or null when it
 *  is. Modules draw ALL their leaves from CANONICAL_SUBFOLDERS - custom
 *  folders (e.g. `editors`, `reports-analytics`) are rejected so the tree
 *  stays uniform and audit-gates.js stays clean. Sections (docs/<section>/)
 *  are NOT subject to this - they may have arbitrary sub-folders. */
function canonicalSubfolderError(sub) {
  if (CANONICAL_SUBFOLDERS.has(sub)) return null;
  return `"${sub}" is not a standard module folder. Modules use a fixed set: ${CANONICAL_SUBFOLDER_LIST}.`;
}
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
  // Pass 3: whitespace padding inside the parens. `]( /img/X.png )` is valid
  // CommonMark so Docusaurus renders it, but padded URLs are easy for
  // downstream scanners to miss - normalize to the canonical tight form.
  result = result.replace(
    /!\[([^\]]*)\]\(\s+(\/img\/[^\s)]+)\s*\)/g,
    '![$1]($2)',
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

/** Surgically set `sidebar_position` in the frontmatter, leaving everything
 *  else byte-identical. Returns null when the document has no frontmatter
 *  block (caller should refuse to reorder that file). */
function setSidebarPosition(markdown, position) {
  const fmMatch = /^---\n([\s\S]*?)\n---/.exec(markdown);
  if (!fmMatch) return null;
  const fm = fmMatch[1];
  const line = `sidebar_position: ${position}`;
  const nextFm = /^sidebar_position\s*:/m.test(fm)
    ? fm.replace(/^sidebar_position\s*:[^\n]*/m, line)
    : fm.trimEnd() + '\n' + line;
  return markdown.replace(fmMatch[0], `---\n${nextFm}\n---`);
}

/** Build the docs path for a draft, ensuring it sandboxes inside docs/modules/. */
function resolveDraftPath(moduleSlug, subFolder, articleSlug) {
  if (!isValidSlug(moduleSlug) || !isValidSlug(articleSlug) || !isValidSlug(subFolder)) {
    throw new Error('Invalid slug');
  }
  const target = path.join(MODULES_ROOT, moduleSlug, subFolder, `${articleSlug}.md`);
  const real = path.resolve(target);
  if (!real.startsWith(MODULES_ROOT + path.sep)) {
    throw new Error('Path escapes docs/modules/');
  }
  // Only canonical module sub-folders are allowed - reject anything else even
  // if a stray directory already exists on disk (belt-and-suspenders with the
  // /folders creation guard).
  const subErr = canonicalSubfolderError(subFolder);
  if (subErr) throw new Error(subErr);
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

// Hold authoring requests until the boot reconcile has put journaled content
// back on disk - otherwise an editor saving seconds after a restart writes
// onto pre-restore state and the journal then flushes a stale-base commit.
// Never blocks forever: the reconcile's GitHub calls carry their own
// timeouts, and both settle paths fall through to next().
app.use('/api/admin/authoring', (req, res, next) => {
  journalBootPromise.then(() => next(), () => next());
});

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
    // Destination: either a dir (any docs section or module sub-folder -
    // the resolver enforces the deny-list and canonical module rules) or the
    // legacy module + subFolder pair.
    if (inputs.dir) {
      try {
        // A canonical module leaf with no articles yet is a valid destination -
        // scaffold it rather than dead-ending the author's brain dump.
        ensureCanonicalModuleLeaf(inputs.dir);
        resolveAnyDocDir(inputs.dir);
      } catch (e) {
        return res.status(400).json({ error: "That folder doesn't exist any more - pick another destination." });
      }
    } else {
      if (!inputs.module || !inputs.subFolder) {
        return res.status(400).json({ error: 'Pick a destination folder first.' });
      }
      if (!CANONICAL_SUBFOLDERS.has(inputs.subFolder)) {
        return res.status(400).json({ error: `subFolder must be one of: ${[...CANONICAL_SUBFOLDERS].join(', ')}` });
      }
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

    const audit = gradeMarkdown(markdown, auditOpts());
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
    const { field, dir, module: moduleSlug, subFolder, body = '', brainDump = '', currentValue = '' } = req.body || {};
    if (field !== 'title' && field !== 'description') {
      return res.status(400).json({ error: "field must be 'title' or 'description'" });
    }
    if (dir) {
      try {
        resolveAnyDocDir(dir);
      } catch (e) {
        return res.status(400).json({ error: "That folder doesn't exist any more." });
      }
    } else if (!moduleSlug || !subFolder) {
      return res.status(400).json({ error: 'A destination folder is required.' });
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

    const shapeHint = (subFolder && titleShape[subFolder]) || 'start with an action verb or question word';
    const sys = field === 'title'
      ? `You suggest one help-article title for SmartWinnr. Return ONE line containing JUST the title - no quotes, no markdown, no preamble, no explanation. ` +
        `Title shape: ${shapeHint}. ` +
        `Keep it short (under 80 chars), specific, and use lowercase except for proper nouns and the first word.`
      : `You suggest one help-article description for SmartWinnr. Return ONE line containing JUST the description - no quotes, no markdown, no preamble. ` +
        `Length must be between 60 and 160 characters. Stand-alone first sentence, no "we", no "we have updated", no "this article shows". ` +
        `Mirror the topic of the article body; complete the unspoken phrase "This article shows you how to ..." but without those leading words.`;

    // Provide all available context. Truncate the body so we don't blow
    // through max_tokens on an edge-case 30-page draft.
    const userParts = [
      dir ? `Destination folder: ${dir}` : null,
      subFolder ? `Sub-folder: ${subFolder}` : null,
      moduleSlug ? `Module: ${moduleSlug}` : null,
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

app.post('/api/admin/authoring/save', requireRole('superadmin'), async (req, res) => {
  try {
    const { markdown, dir, module: moduleSlug, subFolder, slug, baseHash, fromPath } = req.body || {};
    if (!markdown) return res.status(400).json({ error: 'markdown required' });

    // Saving always writes draft:true, so it must NOT block on content-quality
    // findings (empty description, <80-word body, missing headings). Those are
    // exactly what an unfinished draft looks like - refusing to save them lost
    // real in-progress work. Only refuse on build-physics findings (bad
    // MDX/YAML, unknown privilege keys) that would hard-fail the Railway build.
    // The full `blocking` quality gate still applies at /publish. Warnings are
    // returned via `audit` so the wizard can surface them without discarding work.
    const audit = gradeMarkdown(markdown, auditOpts());
    const buildBlockers = (audit.findings || []).filter((f) => f.buildBreaking);
    if (buildBlockers.length > 0) {
      return res.status(400).json({
        error: 'This content would break the production build - fix before saving',
        audit,
      });
    }

    // Destination: a dir (any docs section or module sub-folder) + slug, or
    // the legacy module + subFolder + slug triple.
    let target;
    if (dir) {
      if (!isValidSlug(slug)) return res.status(400).json({ error: 'Invalid slug' });
      // Materialize a canonical module leaf on first use so it isn't a dead end.
      ensureCanonicalModuleLeaf(dir);
      target = path.join(resolveAnyDocDir(dir), `${slug}.md`);
    } else {
      target = resolveDraftPath(moduleSlug, subFolder, slug);
    }
    // The article this edit session opened, when the client told us. A title
    // change moves the route, and without this the save writes a SECOND file
    // and leaves the original live - the wizard seeds its slug from
    // frontmatter, which differs from the filename for ~a fifth of the corpus.
    let previous = null;
    if (fromPath) {
      try {
        previous = resolveAnyDocPath(fromPath);
      } catch {
        return res.status(400).json({ error: 'fromPath is not an editable article path' });
      }
      if (!fsSync.existsSync(previous)) previous = null;
    }

    // Refuse to write on top of an article this session didn't open. The
    // baseHash check below only fires when the client supplies one, and the
    // new-article flow never does - so two authors writing "How to create a
    // quiz" used to silently overwrite each other's live article and re-draft
    // it, with the original recoverable only from git history.
    if (!previous && fsSync.existsSync(target) && !baseHash) {
      return res.status(409).json({
        error: 'article-exists',
        message: `"${path.relative(__dirname, target)}" already exists. Open that article to edit it, or change the title so this one gets its own address.`,
        path: path.relative(__dirname, target),
      });
    }

    // Optimistic concurrency: when the client says which version it loaded
    // (baseHash from GET /draft), refuse to clobber a newer server copy -
    // another editor saved in between. Clients that omit baseHash keep the
    // old last-write-wins behavior (the wizard's new-article flow).
    const hashTarget = previous || target;
    if (baseHash && fsSync.existsSync(hashTarget)) {
      const current = fsSync.readFileSync(hashTarget, 'utf8');
      const currentHash = contentHash(current);
      if (currentHash !== baseHash) {
        return res.status(409).json({
          error: 'stale-base',
          message: 'This article changed on the server after you loaded it (another editor saved). Reload it, or save again to overwrite their version.',
          currentHash,
          markdown: current,
        });
      }
    }
    // Defang decorative emojis (the no-decorative-emojis markdownlint rule
    // rejects them on the deploy commit). /generate already runs the same
    // strip, but the edit-existing-draft flow may have loaded a legacy
    // file that carries them, and a Refine pass through the LLM that
    // sneaks one in would otherwise survive.
    const cleanedMarkdown = stripDecorativeEmojis(stripBogusImageOrigins(markdown));
    // Force draft:true in frontmatter - defensive override even if the model
    // emitted draft:false somehow.
    const text = cleanedMarkdown.replace(/^draft:\s*(true|false)\s*$/m, 'draft: true');
    const withDraft = /^draft:/m.test(text)
      ? text
      : text.replace(/^---/, '---').replace(/^(---[\s\S]*?\n)(---)/, (m, fm, end) => fm + 'draft: true\n' + end);

    // Two things the model must not be the authority on:
    //  - audience: reconcile customProps.roles against the destination
    //    folder's gate, exactly as /move does. An article stamped narrower
    //    than its folder is invisible to the readers the folder is for, and
    //    the superadmin author previewing it can never notice (privilege
    //    bypass). Article-level `privilege` is dropped - the folder gate owns it.
    //  - sidebar order: the prompt used to hardcode `sidebar_position: 999`,
    //    so every new article tied and Docusaurus fell back to alphabetical.
    const targetDirRel = path.relative(__dirname, path.dirname(target)).replace(/\\/g, '/');
    const destRoles = destinationRoles(targetDirRel);
    let staged = destRoles ? setFrontmatterRoles(withDraft, destRoles) : withDraft;
    staged = removeFrontmatterPrivilege(staged);
    const finalText = ensureSidebarPosition(staged, path.dirname(target), previous || target);

    fsSync.mkdirSync(path.dirname(target), { recursive: true });
    // If this is the first article ever written into a MODULE sub-folder,
    // make sure the gate file lands too - otherwise audit-gates.js fails on
    // the next build because the sub-folder is ungated. Section folders
    // already exist with their own gates (resolveAnyDocDir enforces
    // existence), so this correctly no-ops for them.
    const targetRel = path.relative(__dirname, target).replace(/\\/g, '/');
    const modMatch = /^docs\/modules\/([a-z0-9-]+)\/([a-z0-9-]+)\//.exec(targetRel);
    const subfolderCreated = modMatch ? ensureSubfolderCategory(modMatch[1], modMatch[2]) : false;
    fsSync.writeFileSync(target, finalText, 'utf8');
    journalRecordUpsert(targetRel, req.user?.email);
    if (subfolderCreated && modMatch) {
      journalRecordUpsert(path.join('docs', 'modules', modMatch[1], modMatch[2], '_category_.json'), req.user?.email);
    }

    // The title changed enough to move the article: retire the old file and
    // leave a redirect behind, the way /save-raw already handles a slug edit.
    // Without this the wizard left the original published at its old URL and
    // a duplicate claiming the same doc id, which then 409s at publish.
    let renamedFrom = null;
    let redirectsUpdated = false;
    if (previous && path.resolve(previous) !== path.resolve(target)) {
      const prevRel = path.relative(__dirname, previous).replace(/\\/g, '/');
      const prevRaw = fsSync.readFileSync(previous, 'utf8');
      const wasPublished = !/^draft:\s*true\s*$/m.test(prevRaw);
      fsSync.unlinkSync(previous);
      journalRecordDelete(prevRel, req.user?.email);
      renamedFrom = prevRel;

      const oldRoute = docRoutes.resolveDocRoute(previous, DOCS_ROOT, prevRaw).route;
      const newRoute = docRoutes.resolveDocRoute(target, DOCS_ROOT, finalText).route;
      // Only a live article needs a redirect - a draft was never reachable.
      if (wasPublished && oldRoute !== newRoute) {
        redirectsUpdated = await updateRedirectsForMove(oldRoute, newRoute);
        enqueueDelete(prevRel);
        if (redirectsUpdated) {
          enqueueUpsert(path.relative(__dirname, REDIRECTS_PATH));
        }
        persistDeployState();
      }
    }

    res.json({
      ok: true,
      path: path.relative(__dirname, target),
      audit,
      subfolderCreated,
      renamedFrom,
      redirectsUpdated,
      hash: contentHash(finalText),
    });
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

// Write-through durability journal: every runtime file mutation is committed
// to a machine-owned branch within seconds of the save, so authored content
// survives restarts, redeploys, and even volume loss. Deploys to the publish
// branch are untouched - the journal is durability, not publishing.
const JOURNAL_BRANCH = process.env.AUTHORING_JOURNAL_BRANCH || 'authoring-wip';
const JOURNAL_DEBOUNCE_MS = parseInt(process.env.AUTHORING_JOURNAL_DEBOUNCE_MS || '5000', 10);
const JOURNAL_ENABLED = process.env.AUTHORING_JOURNAL === 'true'
  && process.env.AUTHORING_GIT_PUSH === 'true'
  && !!process.env.GIT_PUSH_TOKEN && !!process.env.GITHUB_REPO;
const JOURNAL_MANIFEST_PATH = '.authoring/journal.json';

// deployQueue tracks per-path actions so the same pipeline that publishes
// an upserted article can also commit a delete. Map<relPath, 'upsert' | 'delete'>.
const deployQueue = new Map();
let lastDeployTs = 0;
let debounceTimer = null;
let deployInFlight = false;
// Rels captured by the in-flight deploy's snapshot. An unpublish for one of
// these must NOT just drop the queue entry - the snapshot ships the
// published version regardless, so the re-draft has to ship afterwards.
let inFlightSnapshotRels = new Set();

// Route hints for queued doc deletes: rel → route at deletion time
// (frontmatter-slug aware). The deploy pre-flight uses these to subtract
// vacated routes; the filename-derived fallback is wrong when the article
// carried a custom slug. Persisted alongside the queue in deploy-state.json.
const deletedRouteHints = new Map();

// Last pre-flight failure, surfaced via GET /deploy/state so the drafts UI
// can explain why an auto-deploy is stuck. Cleared on the next green push.
let lastValidationError = null;

// Articles the last deploy refused to ship (missing image, build-breaking
// markdown, route/doc-id collision). They stay queued awaiting an author fix,
// but until now the only record was a console.error on the container: the
// author saw a green "Publishing N update(s)" toast and their article silently
// never went live. Surfaced via GET /deploy/state; an entry clears when that
// article next ships or leaves the queue.
let lastHeldBack = [];

// Queued-but-unshipped content lives on the container's EPHEMERAL disk
// (docs/, static/img/) - only data/ sits on the Railway volume. Any restart
// before the batch ships (crash, env-var change, redeploy) resets those
// files to the image's last-committed state, so the queue would then commit
// stale bytes or skip vanished files. Snapshot every queued upsert (plus the
// authored images its body references) under data/pending-files/ at enqueue
// time and restore the snapshots over the fresh disk on boot.
const PENDING_FILES_DIR = path.join(__dirname, 'data', 'pending-files');
// Tolerate whitespace inside the parens - `]( /img/...)` is valid CommonMark
// (Docusaurus resolves it), so a scanner that misses it ships articles
// without their screenshots and breaks every subsequent production build.
const AUTHORED_IMAGE_PATTERN = /!\[[^\]]*\]\(\s*(\/img\/helpscout\/authored\/[^)\s]+)\s*\)/g;

function snapshotQueuedFile(relPath) {
  try {
    const src = path.join(__dirname, relPath);
    if (!fsSync.existsSync(src)) return;
    const dst = path.join(PENDING_FILES_DIR, relPath);
    fsSync.mkdirSync(path.dirname(dst), { recursive: true });
    fsSync.copyFileSync(src, dst);
    if (/\.(md|mdx)$/i.test(relPath)) {
      const body = fsSync.readFileSync(src, 'utf8');
      for (const m of body.matchAll(AUTHORED_IMAGE_PATTERN)) {
        const imgRel = 'static' + m[1];
        const imgSrc = path.join(__dirname, imgRel);
        if (!fsSync.existsSync(imgSrc)) continue;
        const imgDst = path.join(PENDING_FILES_DIR, imgRel);
        fsSync.mkdirSync(path.dirname(imgDst), { recursive: true });
        fsSync.copyFileSync(imgSrc, imgDst);
      }
    }
  } catch (e) {
    console.warn(`[deploy] failed to snapshot ${relPath}:`, e.message);
  }
}

/** Copy pending-file snapshots back over the (fresh-from-image) disk for
 *  every queued upsert, plus any snapshotted authored images the disk is
 *  missing. Runs once on boot, before anything can prune or ship the queue. */
function restoreQueuedSnapshots() {
  let restored = 0;
  for (const [rel, action] of deployQueue) {
    if (action !== 'upsert') continue;
    try {
      const snap = path.join(PENDING_FILES_DIR, rel);
      if (!fsSync.existsSync(snap)) continue;
      const live = path.join(__dirname, rel);
      const snapBytes = fsSync.readFileSync(snap);
      if (fsSync.existsSync(live) && snapBytes.equals(fsSync.readFileSync(live))) continue;
      fsSync.mkdirSync(path.dirname(live), { recursive: true });
      fsSync.writeFileSync(live, snapBytes);
      restored += 1;
    } catch (e) {
      console.warn(`[deploy] failed to restore snapshot ${rel}:`, e.message);
    }
  }
  // Authored images: restore only what the disk lacks (identical names are
  // never re-uploaded with different bytes - uploads get random suffixes).
  const imgSnapRoot = path.join(PENDING_FILES_DIR, 'static');
  (function walk(dir) {
    if (!fsSync.existsSync(dir)) return;
    for (const entry of fsSync.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(p); continue; }
      const rel = path.relative(PENDING_FILES_DIR, p);
      const live = path.join(__dirname, rel);
      try {
        if (!fsSync.existsSync(live)) {
          fsSync.mkdirSync(path.dirname(live), { recursive: true });
          fsSync.copyFileSync(p, live);
          restored += 1;
        }
      } catch (e) {
        console.warn(`[deploy] failed to restore snapshot ${rel}:`, e.message);
      }
    }
  })(imgSnapRoot);
  if (restored > 0) console.log(`[deploy] restored ${restored} pending file(s) from data/pending-files/`);
}

/** Keep data/pending-files/ in step with the queue: drop snapshots for
 *  articles no longer queued, and wipe the whole tree (images included)
 *  once no upserts remain. Called from persistDeployState so every queue
 *  mutation path stays covered. */
function syncQueueSnapshots() {
  try {
    if (!fsSync.existsSync(PENDING_FILES_DIR)) return;
    if (![...deployQueue.values()].includes('upsert')) {
      fsSync.rmSync(PENDING_FILES_DIR, { recursive: true, force: true });
      return;
    }
    (function walk(dir) {
      for (const entry of fsSync.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) { walk(p); continue; }
        const rel = path.relative(PENDING_FILES_DIR, p);
        // Images are shared across queued articles; they go with the final wipe.
        if (rel.replace(/\\/g, '/').startsWith('static/')) continue;
        if (deployQueue.get(rel) !== 'upsert') fsSync.unlinkSync(p);
      }
    })(PENDING_FILES_DIR);
  } catch (e) {
    console.warn('[deploy] failed to sync pending-file snapshots:', e.message);
  }
}

function enqueueUpsert(relPath) {
  deployQueue.set(relPath, 'upsert');
  snapshotQueuedFile(relPath);
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
  // With the journal enabled, a missing file is only PROVABLY stale after a
  // clean boot reconcile - before that (or after a failed one) the file may
  // simply not have been restored yet, and pruning would destroy publish
  // intent that the journal could still recover.
  if (JOURNAL_ENABLED && (!journalStatus.bootCompleted || journalStatus.lastError)) return 0;
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
      for (const [rel, route] of Object.entries(s.deletedRoutes || {})) {
        deletedRouteHints.set(rel, route);
      }
      lastValidationError = s.lastValidationError || null;
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
      deletedRoutes: Object.fromEntries(deletedRouteHints),
      lastValidationError,
    }, null, 2), 'utf8');
  } catch (e) {
    console.warn('[deploy] failed to persist state:', e.message);
  }
  syncQueueSnapshots();
}
loadDeployState();
// The queue survives restarts (volume) but its content and timer do not:
// put the queued bytes back on disk, then re-arm the auto-deploy timer -
// without this, a restart leaves the batch "waiting to deploy" forever
// (until the next publish or a manual Deploy now).
restoreQueuedSnapshots();
if (deployQueue.size > 0) scheduleDeploy();

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
  // Null the handle as the timer fires. nextAutoDeployAt() reports a countdown
  // whenever debounceTimer is truthy, and the paths that bail out of fireDeploy
  // (invalid redirects, dangling targets, everything held back) never re-arm -
  // so a stale handle left the drafts page promising a publish that would
  // never happen. fireDeploy re-arms itself when there's something to retry.
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    fireDeploy().catch((e) => console.error('[deploy] auto-fire failed:', e.message));
  }, delay);
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
// Fine-grained PATs report their expiry on every API response. Capture it
// so the UI can warn WEEKS before the token dies - an expired token silently
// froze all deploys (and would freeze journal backups) once already.
let ghTokenExpiresAt = null; // ms epoch, or null when unknown
function captureTokenExpiry(resp) {
  const h = resp?.headers?.['github-authentication-token-expiration'];
  if (!h) return;
  // Header format: "2027-07-16 07:20:50 UTC"
  const t = Date.parse(String(h).replace(' UTC', 'Z').replace(' ', 'T'));
  if (!Number.isNaN(t)) ghTokenExpiresAt = t;
}
async function ghGet(pathSuffix) {
  const resp = await axios.get(`${GITHUB_API}/repos/${GITHUB_REPO}${pathSuffix}`, {
    headers: ghHeaders(),
    timeout: 30000,
  });
  captureTokenExpiry(resp);
  return resp;
}
async function ghPost(pathSuffix, body) {
  const resp = await axios.post(`${GITHUB_API}/repos/${GITHUB_REPO}${pathSuffix}`, body, {
    headers: ghHeaders(),
    timeout: 60000,
  });
  captureTokenExpiry(resp);
  return resp;
}
async function ghPatch(pathSuffix, body) {
  const resp = await axios.patch(`${GITHUB_API}/repos/${GITHUB_REPO}${pathSuffix}`, body, {
    headers: ghHeaders(),
    timeout: 30000,
  });
  captureTokenExpiry(resp);
  return resp;
}

/** Fetch a file's content from the publish branch (or `ref`). Returns the
 *  utf-8 string, or null on 404; rethrows anything else (auth/rate-limit/
 *  network) so callers can distinguish "absent" from "unknown". */
async function ghFetchFile(rel, ref = GIT_PUBLISH_BRANCH) {
  try {
    const resp = await ghGet(`/contents/${rel.split('/').map(encodeURIComponent).join('/')}?ref=${ref}`);
    return Buffer.from(resp.data.content, 'base64').toString('utf8');
  } catch (e) {
    if (e.response?.status === 404) return null;
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Authoring durability journal (write-through to the JOURNAL_BRANCH)
// ---------------------------------------------------------------------------
// docs/ and static/ are ephemeral container disk; only data/ is a volume.
// Durability used to arrive only when the batched deploy shipped to the
// publish branch - a restart inside that window destroyed authored work.
// The journal makes content durable at SAVE time: every mutation is recorded
// here and flushed (debounced a few seconds, coalesced) as a commit on
// JOURNAL_BRANCH. Invariant: the branch tip tree = publish-branch tree at
// `baseMainSha` + every runtime-dirty file + the manifest. The branch is
// MACHINE-OWNED: post-deploy rebases force-update it, clobbering any manual
// pushes. The in-branch manifest (.authoring/journal.json) records which
// paths are dirty, so recovery works even after total volume loss.

/** Resolve a branch's tip commit sha, or null when the branch doesn't exist. */
async function ghGetRef(branch) {
  try {
    const resp = await ghGet(`/git/refs/heads/${branch}`);
    return resp.data.object.sha;
  } catch (e) {
    if (e.response?.status === 404) return null;
    throw e;
  }
}

/** Create a branch at `sha`. A 422 "already exists" (racing create) is fine. */
async function ghCreateRef(branch, sha) {
  try {
    await ghPost('/git/refs', { ref: `refs/heads/${branch}`, sha });
  } catch (e) {
    if (e.response?.status !== 422) throw e;
  }
}

/** Full recursive tree of a commit as Map<path, blobSha>. */
async function ghGetTreeRecursive(commitSha) {
  const commitResp = await ghGet(`/git/commits/${commitSha}`);
  const treeResp = await ghGet(`/git/trees/${commitResp.data.tree.sha}?recursive=1`);
  if (treeResp.data.truncated) {
    console.warn(`[journal] tree listing for ${commitSha.slice(0, 7)} was truncated by GitHub - reconcile may miss paths`);
  }
  const map = new Map();
  for (const entry of treeResp.data.tree || []) {
    if (entry.type === 'blob') map.set(entry.path, entry.sha);
  }
  return map;
}

/** Raw blob bytes (handles binaries; the Contents API caps JSON at 1 MB). */
async function ghGetBlob(sha) {
  const resp = await ghGet(`/git/blobs/${sha}`);
  return Buffer.from(resp.data.content, 'base64');
}

/** Git's blob object id for a buffer - lets boot reconcile compare disk
 *  content against tree entries without downloading the blob. */
function gitBlobShaOf(buf) {
  return require('crypto').createHash('sha1')
    .update(`blob ${buf.length}\0`).update(buf).digest('hex');
}

// rel → {action:'upsert'|'delete', ts, seq, author}. Entries leave the map
// only after the commit that carries them lands (seq-guarded, so a write
// racing an in-flight flush survives to the next one).
const journalDirty = new Map();
let journalSeq = 0;
let journalFlushTimer = null;
let journalRetryDelayMs = 0;
// Single promise-chain mutex over EVERY journal-branch ref mutation
// (flush, post-deploy rebase, boot repair) - they must never interleave.
let journalChain = Promise.resolve();
let journalBootPromise = Promise.resolve();
const journalStatus = {
  enabled: JOURNAL_ENABLED,
  lastCommitTs: 0,
  lastCommitSha: null,
  lastError: null,
  bootRestored: 0,
  conflicts: [],
  // True once the boot reconcile ran to completion. While false (still
  // running, or it failed - e.g. GitHub down), queue pruning is unsafe:
  // files may be "missing" only because they haven't been restored yet.
  bootCompleted: false,
};

/** Paths the journal will record AND materialize on restore. Enforced on
 *  both sides so a tampered manifest can't write outside authored trees. */
function journalPathAllowed(rel) {
  return /^docs\//.test(rel)
    || /^static\/img\/helpscout\/authored\//.test(rel)
    || rel === 'static/module-overviews.json'
    || rel === 'data/redirects.json'
    || rel === 'data/known-privileges.json';
}

function journalRecord(rel, action, author) {
  if (!JOURNAL_ENABLED) return;
  const norm = String(rel).replace(/\\/g, '/');
  if (!journalPathAllowed(norm)) {
    console.warn(`[journal] refusing to record path outside authored trees: ${norm}`);
    return;
  }
  journalDirty.set(norm, { action, ts: Date.now(), seq: ++journalSeq, author: author || null });
  scheduleJournalFlush();
}
function journalRecordUpsert(rel, author) { journalRecord(rel, 'upsert', author); }
function journalRecordDelete(rel, author) { journalRecord(rel, 'delete', author); }

function scheduleJournalFlush(delayMs = JOURNAL_DEBOUNCE_MS) {
  if (journalFlushTimer) clearTimeout(journalFlushTimer);
  journalFlushTimer = setTimeout(() => {
    journalFlushTimer = null;
    journalChain = journalChain
      .then(() => journalFlushOnce())
      .catch((e) => console.error('[journal] flush failed:', e.message));
  }, delayMs);
}

function parseJournalManifest(raw) {
  try {
    const doc = JSON.parse(raw);
    if (doc && typeof doc === 'object' && doc.entries && typeof doc.entries === 'object') return doc;
  } catch { /* fall through */ }
  return null;
}

/** Commit everything currently dirty onto the journal branch. Failures leave
 *  the entries in place and re-arm with backoff - a save is never blocked or
 *  failed by GitHub being down (disk + pending-files remain the floor). */
async function journalFlushOnce() {
  if (!JOURNAL_ENABLED || journalDirty.size === 0) return;
  const captured = [...journalDirty.entries()].map(([rel, e]) => [rel, { ...e }]);
  try {
    // Branch tip (create from the publish branch tip on first use).
    let tipSha = await ghGetRef(JOURNAL_BRANCH);
    if (!tipSha) {
      const mainSha = await ghGetRef(GIT_PUBLISH_BRANCH);
      if (!mainSha) throw new Error(`publish branch ${GIT_PUBLISH_BRANCH} not found`);
      await ghCreateRef(JOURNAL_BRANCH, mainSha);
      tipSha = (await ghGetRef(JOURNAL_BRANCH)) || mainSha;
    }
    const tipTree = await ghGetTreeRecursive(tipSha);

    // Current manifest (fresh one on first commit).
    let manifest = null;
    const manifestSha = tipTree.get(JOURNAL_MANIFEST_PATH);
    if (manifestSha) manifest = parseJournalManifest((await ghGetBlob(manifestSha)).toString('utf8'));
    if (!manifest) manifest = { version: 1, baseMainSha: tipSha, rebasedTs: Date.now(), entries: {} };

    const treeEntries = [];
    const slugs = [];
    for (const [rel, entry] of captured) {
      if (entry.action === 'upsert') {
        const abs = path.join(__dirname, rel);
        if (!fsSync.existsSync(abs)) {
          console.warn(`[journal] dirty upsert vanished from disk, skipping: ${rel}`);
          continue;
        }
        const buf = fsSync.readFileSync(abs);
        const isText = /\.(md|mdx|json)$/i.test(rel);
        const blobResp = await ghPost('/git/blobs', isText
          ? { content: buf.toString('utf8'), encoding: 'utf-8' }
          : { content: buf.toString('base64'), encoding: 'base64' });
        treeEntries.push({ path: rel, mode: '100644', type: 'blob', sha: blobResp.data.sha });
      } else if (tipTree.has(rel)) {
        // Trees API errors on sha:null for a path absent from base_tree.
        treeEntries.push({ path: rel, mode: '100644', type: 'blob', sha: null });
      }
      manifest.entries[rel] = { action: entry.action, ts: entry.ts, seq: entry.seq, author: entry.author };
      slugs.push((entry.action === 'delete' ? '-' : '') + path.basename(rel));
    }

    const manifestBlob = await ghPost('/git/blobs', {
      content: JSON.stringify(manifest, null, 2) + '\n',
      encoding: 'utf-8',
    });
    treeEntries.push({ path: JOURNAL_MANIFEST_PATH, mode: '100644', type: 'blob', sha: manifestBlob.data.sha });

    const tipCommit = await ghGet(`/git/commits/${tipSha}`);
    const treeResp = await ghPost('/git/trees', { base_tree: tipCommit.data.tree.sha, tree: treeEntries });
    const message = `journal: ${captured.length} file(s) (${slugs.slice(0, 3).join(', ')}${captured.length > 3 ? '...' : ''})`;
    const commitResp = await ghPost('/git/commits', { message, tree: treeResp.data.sha, parents: [tipSha] });
    try {
      await ghPatch(`/git/refs/heads/${JOURNAL_BRANCH}`, { sha: commitResp.data.sha, force: false });
    } catch (e) {
      // Tip moved under us (manual push - the mutex rules out our own
      // writers). Leave entries dirty; the re-armed flush retries on the
      // new tip.
      throw new Error(`ref update rejected (${e.response?.status || e.message}) - will retry`);
    }

    for (const [rel, entry] of captured) {
      const current = journalDirty.get(rel);
      if (current && current.seq === entry.seq) journalDirty.delete(rel);
    }
    journalStatus.lastCommitTs = Date.now();
    journalStatus.lastCommitSha = commitResp.data.sha;
    journalStatus.lastError = null;
    journalRetryDelayMs = 0;
    console.log(`[journal] committed ${captured.length} file(s) → ${JOURNAL_BRANCH} (${commitResp.data.sha.slice(0, 7)})`);
    if (journalDirty.size > 0) scheduleJournalFlush();
  } catch (e) {
    const msg = e.response?.data?.message || e.message;
    journalStatus.lastError = { ts: Date.now(), message: msg };
    journalRetryDelayMs = Math.min(Math.max(journalRetryDelayMs * 2, 10000), 5 * 60 * 1000);
    console.error(`[journal] flush failed (${msg}) - retrying in ${Math.round(journalRetryDelayMs / 1000)}s`);
    scheduleJournalFlush(journalRetryDelayMs);
  }
}

/** After a green deploy to the publish branch: drop shipped paths from the
 *  manifest and rebuild the journal branch on the new tip, so its tree stays
 *  "new main + still-dirty files" instead of accumulating stale layers.
 *  Failure here is harmless - the stale branch still holds correct content,
 *  just with redundant entries; the next flush or rebase repairs it. */
async function journalRebaseAfterDeploy(newMainSha, shippedRels) {
  if (!JOURNAL_ENABLED) return;
  try {
    const tipSha = await ghGetRef(JOURNAL_BRANCH);
    if (!tipSha) return;
    const tipTree = await ghGetTreeRecursive(tipSha);
    const manifestSha = tipTree.get(JOURNAL_MANIFEST_PATH);
    let manifest = manifestSha
      ? parseJournalManifest((await ghGetBlob(manifestSha)).toString('utf8'))
      : null;
    if (!manifest) manifest = { version: 1, baseMainSha: newMainSha, rebasedTs: Date.now(), entries: {} };

    for (const rel of shippedRels) delete manifest.entries[rel.replace(/\\/g, '/')];
    manifest.baseMainSha = newMainSha;
    manifest.rebasedTs = Date.now();

    const mainCommit = await ghGet(`/git/commits/${newMainSha}`);
    const mainTree = await ghGetTreeRecursive(newMainSha);
    const treeEntries = [];
    for (const [rel, entry] of Object.entries(manifest.entries)) {
      if (!journalPathAllowed(rel)) { delete manifest.entries[rel]; continue; }
      if (entry.action === 'upsert') {
        const abs = path.join(__dirname, rel);
        if (!fsSync.existsSync(abs)) {
          console.warn(`[journal] rebase: dirty upsert missing from disk, dropping: ${rel}`);
          delete manifest.entries[rel];
          continue;
        }
        const buf = fsSync.readFileSync(abs);
        const isText = /\.(md|mdx|json)$/i.test(rel);
        const blobResp = await ghPost('/git/blobs', isText
          ? { content: buf.toString('utf8'), encoding: 'utf-8' }
          : { content: buf.toString('base64'), encoding: 'base64' });
        treeEntries.push({ path: rel, mode: '100644', type: 'blob', sha: blobResp.data.sha });
      } else if (mainTree.has(rel)) {
        treeEntries.push({ path: rel, mode: '100644', type: 'blob', sha: null });
      }
    }
    const manifestBlob = await ghPost('/git/blobs', {
      content: JSON.stringify(manifest, null, 2) + '\n',
      encoding: 'utf-8',
    });
    treeEntries.push({ path: JOURNAL_MANIFEST_PATH, mode: '100644', type: 'blob', sha: manifestBlob.data.sha });

    const treeResp = await ghPost('/git/trees', { base_tree: mainCommit.data.tree.sha, tree: treeEntries });
    const commitResp = await ghPost('/git/commits', {
      message: `journal: rebase onto ${newMainSha.slice(0, 7)}`,
      tree: treeResp.data.sha,
      parents: [newMainSha],
    });
    // force: the branch is machine-owned; the rebase intentionally rewrites it.
    await ghPatch(`/git/refs/heads/${JOURNAL_BRANCH}`, { sha: commitResp.data.sha, force: true });
    console.log(`[journal] rebased ${JOURNAL_BRANCH} onto ${newMainSha.slice(0, 7)} (${Object.keys(manifest.entries).length} dirty file(s) kept)`);
  } catch (e) {
    const msg = e.response?.data?.message || e.message;
    journalStatus.lastError = { ts: Date.now(), message: `rebase: ${msg}` };
    console.error('[journal] post-deploy rebase failed:', msg);
  }
}

/** Boot reconcile: materialize every manifest entry from the journal branch
 *  onto the fresh-from-image disk. Runs AFTER the (sync, volume-local)
 *  pending-files restore - the journal is a superset with >= freshness, so
 *  layering it second converges and degrades safely when GitHub is down. */
async function journalBootReconcile() {
  if (!JOURNAL_ENABLED) return;
  const tipSha = await ghGetRef(JOURNAL_BRANCH);
  if (!tipSha) { journalStatus.bootCompleted = true; return; } // first boot: branch appears lazily on first flush
  const wipTree = await ghGetTreeRecursive(tipSha);
  const manifestSha = wipTree.get(JOURNAL_MANIFEST_PATH);
  if (!manifestSha) { journalStatus.bootCompleted = true; return; }
  const manifest = parseJournalManifest((await ghGetBlob(manifestSha)).toString('utf8'));
  if (!manifest) { journalStatus.bootCompleted = true; return; }

  const mainSha = await ghGetRef(GIT_PUBLISH_BRANCH);
  // Always fetch the publish-branch tree: the reconcile compares per-path
  // blobs against it, and the queue self-heal below needs it even when the
  // journal base is current.
  const mainTree = await ghGetTreeRecursive(mainSha);
  const prunable = [];
  const conflicts = [];
  let restored = 0;

  for (const [rel, entry] of Object.entries(manifest.entries)) {
    if (!journalPathAllowed(rel)) {
      console.warn(`[journal] boot: ignoring manifest entry outside authored trees: ${rel}`);
      continue;
    }
    try {
      const abs = path.join(__dirname, rel);
      if (entry.action === 'delete') {
        // Only unlink inside trees whose files the wizard alone owns.
        if ((/^docs\//.test(rel) || /^static\/img\/helpscout\/authored\//.test(rel)) && fsSync.existsSync(abs)) {
          fsSync.unlinkSync(abs);
          restored += 1;
        }
        if (mainTree && !mainTree.has(rel)) prunable.push(rel);
        continue;
      }
      const wipSha = wipTree.get(rel);
      if (!wipSha) {
        console.warn(`[journal] boot: manifest/tree drift for ${rel} - no blob on ${JOURNAL_BRANCH}`);
        continue;
      }
      {
        const mainBlobSha = mainTree.get(rel);
        if (mainBlobSha === wipSha) { prunable.push(rel); continue; } // already durable on main
        // A dirty file DIFFERING from main is the normal state of an
        // unshipped edit - only a publish branch that MOVED since the edit
        // was journaled can mean someone else changed it underneath.
        if (mainBlobSha && manifest.baseMainSha !== mainSha) conflicts.push(rel); // wip wins on disk, but surface it
      }
      if (fsSync.existsSync(abs) && gitBlobShaOf(fsSync.readFileSync(abs)) === wipSha) continue;
      const bytes = await ghGetBlob(wipSha);
      fsSync.mkdirSync(path.dirname(abs), { recursive: true });
      fsSync.writeFileSync(abs, bytes);
      restored += 1;
    } catch (e) {
      console.warn(`[journal] boot: failed to reconcile ${rel}:`, e.message);
    }
  }

  journalStatus.bootRestored = restored;
  journalStatus.conflicts = conflicts;
  console.log(`[journal] boot reconcile: restored=${restored}, prunable=${prunable.length}, conflicts=${conflicts.length}`);
  if (prunable.length > 0 || (mainSha && manifest.baseMainSha !== mainSha)) {
    journalChain = journalChain
      .then(() => journalRebaseAfterDeploy(mainSha, prunable))
      .catch((e) => console.error('[journal] boot rebase failed:', e.message));
  }

  // Queue self-heal: publish intent lives in data/deploy-state.json on the
  // volume - if that file is lost or corrupted, queued changes are forgotten
  // even though their content is safe here. Re-derive the queue from the
  // manifest: a published (draft:false) article, a gate file, or the
  // redirects doc whose journal blob differs from main should be queued;
  // a manifest delete whose path still exists on main should ship too.
  // Images and module-skeleton files are excluded - they ship bundled with
  // (or alongside) their articles, never on their own.
  const prunedSet = new Set(prunable);
  let requeued = 0;
  for (const [rel, entry] of Object.entries(manifest.entries)) {
    if (!journalPathAllowed(rel) || prunedSet.has(rel)) continue;
    try {
      if (entry.action === 'delete') {
        if (mainTree.has(rel) && !deployQueue.has(rel)) { enqueueDelete(rel); requeued += 1; }
        continue;
      }
      const isArticle = /^docs\/.+\.(md|mdx)$/i.test(rel);
      const isGateOrRedirects = /_category_\.json$/.test(rel) || rel === 'data/redirects.json';
      if (!isArticle && !isGateOrRedirects) continue;
      const abs = path.join(__dirname, rel);
      if (!fsSync.existsSync(abs)) continue;
      if (isArticle && /^draft:\s*true\b/m.test(fsSync.readFileSync(abs, 'utf8'))) continue; // drafts never ship
      const wipSha = wipTree.get(rel);
      if (wipSha && mainTree.get(rel) === wipSha) continue; // already durable on main
      if (!deployQueue.has(rel)) { enqueueUpsert(rel); requeued += 1; }
    } catch (e) {
      console.warn(`[journal] boot: queue self-heal skipped ${rel}:`, e.message);
    }
  }
  if (requeued > 0) {
    console.log(`[journal] boot: re-derived ${requeued} deploy-queue entr${requeued === 1 ? 'y' : 'ies'} from the manifest`);
    persistDeployState();
    scheduleDeploy();
  }
  journalStatus.bootCompleted = true;
}

// Runs at module load, right after the pending-files restore above (file
// order), and before app.listen - the /api/admin/authoring gate awaits it.
journalBootPromise = journalBootReconcile().catch((e) => {
  journalStatus.lastError = { ts: Date.now(), message: `boot: ${e.message}` };
  console.error('[journal] boot reconcile failed:', e.message);
});

// ---------------------------------------------------------------------------
// Audit build-physics plumbing
// ---------------------------------------------------------------------------
// @mdx-js/mdx (a Docusaurus dep) is ESM-only, so CJS code loads it once via
// dynamic import and injects a sync compiler into gradeMarkdown. Until the
// import resolves (first moments of boot) the MDX check silently no-ops -
// the deploy pre-flight re-runs it, so nothing build-breaking slips through.
let compileMdx = null;
import('@mdx-js/mdx')
  .then((m) => { compileMdx = (src) => m.compileSync(src, { format: 'mdx' }); })
  .catch((e) => console.warn('[audit] @mdx-js/mdx unavailable - MDX pre-checks disabled:', e.message));

const KNOWN_PRIVILEGES_PATH = path.join(__dirname, 'data', 'known-privileges.json');

/** Known privilege keys as a Set, or an empty Set when unavailable. The
 *  Railway volume at /app/data shadows the repo's known-privileges.json, so
 *  ensureKnownPrivilegesSeeded() copies it down from the publish branch. */
function knownPrivilegesSet() {
  try {
    const doc = JSON.parse(fsSync.readFileSync(KNOWN_PRIVILEGES_PATH, 'utf8'));
    return new Set(doc.privileges || []);
  } catch {
    return new Set();
  }
}

async function ensureKnownPrivilegesSeeded() {
  if (fsSync.existsSync(KNOWN_PRIVILEGES_PATH)) return;
  if (!GIT_PUSH_ENABLED || !GIT_PUSH_TOKEN || !GITHUB_REPO) return;
  try {
    const content = await ghFetchFile('data/known-privileges.json');
    if (content === null) return;
    fsSync.mkdirSync(path.dirname(KNOWN_PRIVILEGES_PATH), { recursive: true });
    fsSync.writeFileSync(KNOWN_PRIVILEGES_PATH, content, 'utf8');
    console.log('[audit] seeded data/known-privileges.json from publish branch');
  } catch (e) {
    console.warn('[audit] could not seed known-privileges.json:', e.message);
  }
}
ensureKnownPrivilegesSeeded();

/** Options bundle wiring the build-physics checks into gradeMarkdown. An
 *  empty privilege set disables that check rather than flagging everything. */
function auditOpts() {
  return { compileMdx, knownPrivileges: knownPrivilegesSet() };
}

// ---------------------------------------------------------------------------
// Deploy pre-flight validation
// ---------------------------------------------------------------------------
// The Railway build hard-fails on integrity violations (redirects targeting
// missing routes, uncompilable MDX, duplicate ids, unknown privilege keys) -
// and a broken production build also strands every subsequent server fix, so
// nothing may reach GitHub unvalidated. fireDeploy validates the exact
// content it is about to commit against the local docs tree, which every
// authoring endpoint keeps in sync with post-commit state.

// The docs-path -> live-route walk these two used to inline now lives in
// lib/doc-routes.js, shared with scripts/internal-indexer.js so the URL the
// chatbot cites is derived exactly like the route the site serves. Thin
// wrappers keep the deploy pre-flight call sites below unchanged.

/** Walk docs/ deriving every article's route the way Docusaurus does.
 *  Returns [{rel, route, dirRel, id, isDraft}], rel repo-relative. */
function buildLocalDocEntries() {
  return docRoutes.buildLocalDocEntries(__dirname);
}

/** Non-doc routes a redirect may legitimately target: custom pages under
 *  src/pages, category landings declared via _category_.json `link`, and
 *  the site root. Generated listings (tags, search) are deliberately
 *  absent - no redirect should target those. */
function buildNonDocRouteSet() {
  return docRoutes.buildNonDocRouteSet(__dirname);
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
    deletedRouteHints.clear();
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
  inFlightSnapshotRels = new Set(queueSnapshot.map((q) => q.rel));
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
      deletedRouteHints.clear();
      deployInFlight = false;
      persistDeployState();
      return { ok: false, reason: 'no-files' };
    }

    // Scan upsert article bodies for image references and pull any locally-
    // existing files into the commit. Without this, articles publish but
    // their screenshots stay on the container's ephemeral disk and never
    // reach git → Docusaurus's build-time "image not found" check fails on
    // the next Railway redeploy.
    //
    // An image that is neither on disk NOR already in the repo would ship as
    // a dangling reference and break every subsequent production build, so
    // articles with such references are held back in the queue instead of
    // committed. Re-uploading the screenshot (or removing the reference)
    // unblocks them on the next deploy.
    // Whitespace-tolerant (`]( /img/...)` is valid CommonMark) - a miss here
    // means the image is neither bundled nor held back, and CI breaks.
    const IMAGE_PATTERN = /!\[[^\]]*\]\(\s*(\/img\/helpscout\/authored\/[^)\s]+)\s*\)/g;
    const repoHasCache = new Map();
    async function repoHasFile(rel) {
      if (repoHasCache.has(rel)) return repoHasCache.get(rel);
      let has = false;
      try {
        await ghGet(`/contents/${rel.split('/').map(encodeURIComponent).join('/')}?ref=${GIT_PUBLISH_BRANCH}`);
        has = true;
      } catch (e) {
        // 404 = definitively absent. Anything else (auth, rate-limit,
        // network) is inconclusive - rethrow so the deploy aborts with the
        // queue intact rather than guessing.
        if (e.response?.status !== 404) throw e;
      }
      repoHasCache.set(rel, has);
      return has;
    }

    // Pre-flight, pass 1 - per-file problems. Articles with problems are
    // HELD BACK (stay queued, author fixes and redeploys); problems in the
    // shared redirects.json ABORT the whole deploy - there is no way to
    // ship "part of" that file safely.
    const perFile = new Map(); // rel → {missingImages, errors, bundle}
    for (const f of files) {
      const status = { missingImages: [], errors: [], bundle: [] };
      perFile.set(f.rel, status);
      const relNorm = f.rel.replace(/\\/g, '/');
      if (/^docs\/.+\.(md|mdx)$/i.test(relNorm)) {
        for (const m of f.content.matchAll(IMAGE_PATTERN)) {
          // /img/helpscout/authored/X → static/img/helpscout/authored/X
          const rel = 'static' + m[1];
          if (fsSync.existsSync(path.join(__dirname, rel))) {
            status.bundle.push(rel);
          } else if (!(await repoHasFile(rel))) {
            status.missingImages.push(rel);
          }
          // else: not on disk but already in the repo - nothing to upload.
        }
        // Build-physics: anything gradeMarkdown marks buildBreaking (bad
        // YAML, uncompilable MDX, unknown privilege key) hard-fails the
        // Railway build, so it must not ship.
        const audit = gradeMarkdown(f.content, auditOpts());
        for (const finding of audit.findings || []) {
          if (finding.buildBreaking) {
            status.errors.push(finding.detail ? `${finding.label}: ${finding.detail}` : finding.label);
          }
        }
      } else if (/_category_\.json$/.test(relNorm)) {
        try {
          const cp = (JSON.parse(f.content) || {}).customProps || {};
          const known = knownPrivilegesSet();
          const keys = [
            ...(typeof cp.privilege === 'string' ? [cp.privilege] : []),
            ...(Array.isArray(cp.anyPrivilege) ? cp.anyPrivilege : []),
            ...(Array.isArray(cp.allPrivileges) ? cp.allPrivileges : []),
          ];
          const unknown = known.size > 0 ? keys.filter((k) => !known.has(String(k))) : [];
          if (unknown.length > 0) {
            status.errors.push(`Unknown privilege key(s) (fails prebuild): ${unknown.join(', ')}`);
          }
        } catch {
          status.errors.push('Invalid JSON');
        }
      }
    }

    // Pass 2 - batch-level route/doc-id collisions. Two published docs on
    // one route make routing nondeterministic; two files in one directory
    // with one doc id fail the build. Hold every queued party - the author
    // picks the winner. Collisions with no queued party can't be shipped
    // from here (the last green build proves the repo copy is clean), so
    // they only warn.
    const docEntries = buildLocalDocEntries();
    {
      const reportCollision = (a, b, what) => {
        let queuedAny = false;
        for (const e of [a, b]) {
          const status = perFile.get(e.rel);
          if (status) {
            status.errors.push(`Collides with ${e === a ? b.rel : a.rel} (${what})`);
            queuedAny = true;
          }
        }
        if (!queuedAny) console.warn(`[deploy] pre-existing collision outside this batch: ${a.rel} vs ${b.rel} (${what})`);
      };
      const byRoute = new Map();
      const byDirId = new Map();
      for (const e of docEntries) {
        if (!e.isDraft) {
          const prior = byRoute.get(e.route);
          if (prior) reportCollision(prior, e, `route ${e.route}`);
          else byRoute.set(e.route, e);
        }
        const idKey = `${e.dirRel} ${e.id}`;
        const priorId = byDirId.get(idKey);
        if (priorId) reportCollision(priorId, e, `doc id "${e.id}"`);
        else byDirId.set(idKey, e);
      }
    }

    const heldRels = new Set(
      [...perFile].filter(([, s]) => s.missingImages.length > 0 || s.errors.length > 0).map(([rel]) => rel)
    );

    // Pass 3 - redirect integrity. The build hard-fails when a client
    // redirect targets a route that won't exist after this commit (the
    // config only shields draft targets). Validate the redirects file that
    // will be in effect - the queued copy, else the publish branch's -
    // against the post-commit route set.
    {
      const queuedRedirects = files.find((f) => f.rel.replace(/\\/g, '/') === 'data/redirects.json' && !heldRels.has(f.rel));
      // A non-404 fetch error throws → the outer catch aborts with the
      // queue intact, same policy as repoHasFile.
      const redirectsRaw = queuedRedirects ? queuedRedirects.content : await ghFetchFile('data/redirects.json');
      let redirectDoc = null;
      if (redirectsRaw) {
        try {
          redirectDoc = JSON.parse(redirectsRaw);
        } catch {
          deployInFlight = false;
          lastValidationError = { ts: Date.now(), errors: [{ check: 'redirects-json', message: 'data/redirects.json is not valid JSON' }] };
          persistDeployState();
          return {
            ok: false,
            reason: 'validation-failed',
            message: 'data/redirects.json is not valid JSON - fix it, then deploy again. Nothing was committed.',
            errors: lastValidationError.errors,
          };
        }
      }
      if (redirectDoc) {
        const validRoutes = new Set();
        const draftRoutes = new Set();
        for (const e of docEntries) (e.isDraft ? draftRoutes : validRoutes).add(e.route);
        // Held-back NEW articles won't exist on prod - drop their routes.
        // A held-back EDIT keeps its repo copy live, so its route stays.
        for (const e of docEntries) {
          if (heldRels.has(e.rel) && !(await repoHasFile(e.rel))) {
            validRoutes.delete(e.route);
            draftRoutes.delete(e.route);
          }
        }
        // Queued doc deletes vacate their routes.
        for (const rel of deletes) {
          const relNorm = rel.replace(/\\/g, '/');
          if (!/^docs\/.+\.(md|mdx)$/i.test(relNorm)) continue;
          const fallback = normRoute('/' + relNorm.replace(/^docs\//, '').replace(/\.(md|mdx)$/i, ''));
          const vacated = deletedRouteHints.get(relNorm) || fallback;
          validRoutes.delete(vacated);
          draftRoutes.delete(vacated);
        }
        const nonDocRoutes = buildNonDocRouteSet();
        const badTargets = [];
        for (const r of (redirectDoc.redirects || [])) {
          if (!r || typeof r.to !== 'string' || typeof r.from !== 'string') continue;
          if (!r.to.startsWith('/')) continue; // external URL - plugin skips
          const to = normRoute(r.to.split(/[?#]/)[0]);
          // Draft targets are fine: docusaurus.config drops those entries
          // before they reach the plugin's target-exists check.
          if (validRoutes.has(to) || draftRoutes.has(to) || nonDocRoutes.has(to)) continue;
          badTargets.push({ from: r.from, to: r.to });
        }
        if (badTargets.length > 0) {
          deployInFlight = false;
          lastValidationError = {
            ts: Date.now(),
            errors: badTargets.map((b) => ({
              check: 'redirect-target',
              message: `Redirect ${b.from} → ${b.to} targets a route that won't exist after this deploy`,
            })),
          };
          persistDeployState();
          console.error(`[deploy] ABORT - ${badTargets.length} redirect(s) would dangle:`, badTargets.map((b) => `${b.from} → ${b.to}`).join('; '));
          return {
            ok: false,
            reason: 'validation-failed',
            message: `${badTargets.length} redirect(s) in data/redirects.json would point at routes that won't exist after this deploy. Fix or remove them, then deploy again. Nothing was committed.`,
            errors: lastValidationError.errors,
            held: [...heldRels].map((rel) => ({ path: rel, missingImages: perFile.get(rel).missingImages, errors: perFile.get(rel).errors })),
          };
        }
      }
    }

    // Finalize: split files into shippable vs held-back, bundling only the
    // images that shippable articles reference.
    const images = [];
    const imageRelsAdded = new Set();
    const heldBack = [];
    const shippable = [];
    for (const f of files) {
      const s = perFile.get(f.rel);
      if (heldRels.has(f.rel)) {
        const why = [
          s.missingImages.length ? `missing image(s): ${s.missingImages.join(', ')}` : '',
          ...s.errors,
        ].filter(Boolean).join('; ');
        console.error(`[deploy] holding back ${f.rel} - ${why}`);
        heldBack.push({ rel: f.rel, missing: s.missingImages, errors: s.errors });
        continue;
      }
      shippable.push(f);
      for (const rel of s.bundle) {
        if (imageRelsAdded.has(rel)) continue;
        imageRelsAdded.add(rel);
        images.push({ rel, data: fsSync.readFileSync(path.join(__dirname, rel)) });
      }
    }

    // Record what's being held so the drafts UI can explain it. Written on
    // BOTH the all-held and partial-hold paths - a partial hold used to be
    // completely invisible, because the batch technically succeeded.
    lastHeldBack = heldBack.map((h) => ({
      path: h.rel,
      missingImages: h.missing,
      errors: h.errors,
      ts: Date.now(),
    }));

    if (shippable.length === 0 && deletes.length === 0) {
      // Everything upsertable is held back - nothing safe to commit.
      deployInFlight = false;
      persistDeployState();
      return {
        ok: false,
        reason: 'held-back',
        message: 'Every queued article has a problem that would break the production build (see held list). Fix them, then deploy again.',
        held: heldBack.map((h) => ({ path: h.rel, missingImages: h.missing, errors: h.errors })),
      };
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
    for (const f of shippable) {
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
    const changedSlugs = [...shippable.map((f) => path.basename(f.rel).replace(/\.(md|mdx)$/, '')),
                         ...deletes.map((d) => '-' + path.basename(d).replace(/\.(md|mdx)$/, ''))].slice(0, 3);
    const parts = [];
    if (shippable.length) parts.push(`${shippable.length} article${shippable.length === 1 ? '' : 's'}`);
    if (deletes.length) parts.push(`${deletes.length} delete${deletes.length === 1 ? '' : 's'}`);
    if (images.length) parts.push(`${images.length} image${images.length === 1 ? '' : 's'}`);
    const totalChanges = shippable.length + deletes.length;
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

    console.log(`[deploy] pushed ${shippable.length} upsert(s) + ${deletes.length} delete(s) + ${images.length} image(s) → ${GITHUB_REPO}@${GIT_PUBLISH_BRANCH} (${commitResp.data.sha.slice(0, 7)})${heldBack.length ? `; held back ${heldBack.length} article(s) with build-breaking problems` : ''}`);
    // Remove ONLY what this deploy snapshotted - and only if the queued
    // action hasn't changed since. A publish/delete that arrived during the
    // multi-second GitHub round-trips stays queued for the next batch;
    // a blanket clear() here silently destroyed that publish intent.
    for (const { rel, action } of queueSnapshot) {
      if (deployQueue.get(rel) === action) deployQueue.delete(rel);
      if (action === 'delete' && !deployQueue.has(rel)) {
        deletedRouteHints.delete(rel.replace(/\\/g, '/'));
      }
    }
    lastValidationError = null;
    // Re-base rule: once the batch's accumulated redirects.json ships, drop
    // the local copy so the next batch layers onto fresh publish-branch
    // state (loadRedirectsBase re-fetches it, picking up this push plus any
    // manual repo edits made between batches).
    if (shippable.some((f) => f.rel.replace(/\\/g, '/') === 'data/redirects.json')) {
      try { fsSync.unlinkSync(REDIRECTS_PATH); } catch { /* already absent */ }
    }
    // Held-back articles stay queued so a fixed screenshot/markdown ships
    // them on the next deploy. lastHeldBack (set above) keeps the reason
    // visible in the drafts UI until the fix lands - a partially successful
    // batch is exactly the case that used to look like a clean success.
    for (const h of heldBack) deployQueue.set(h.rel, 'upsert');
    lastDeployTs = Date.now();
    persistDeployState();
    if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
    // Changes that arrived mid-deploy survived the per-rel cleanup above -
    // re-arm the timer so they ship on the next batch without waiting for
    // another publish. (Held-back items alone don't re-arm: they need an
    // author fix first, and re-deploying them unchanged would fail again.)
    const heldSet = new Set(heldBack.map((h) => h.rel));
    if ([...deployQueue.keys()].some((rel) => !heldSet.has(rel))) scheduleDeploy();
    // Everything just shipped is durable on the publish branch - drop it
    // from the journal manifest and rebuild the journal branch on the new
    // tip. Chained so it can't interleave with an in-flight journal flush.
    {
      const shippedRels = [...shippable.map((f) => f.rel), ...deletes, ...images.map((i) => i.rel)];
      const newMainSha = commitResp.data.sha;
      journalChain = journalChain
        .then(() => journalRebaseAfterDeploy(newMainSha, shippedRels))
        .catch((e) => console.error('[journal] post-deploy rebase failed:', e.message));
    }
    return {
      ok: true,
      committed: shippable.length,
      deleted: deletes.length,
      images: images.length,
      sha: commitResp.data.sha,
      held: heldBack.map((h) => ({ path: h.rel, missingImages: h.missing, errors: h.errors })),
    };
  } catch (e) {
    const ghMsg = e.response?.data?.message || e.message;
    console.error('[deploy] GitHub push failed:', ghMsg);
    return { ok: false, reason: 'push-failed', message: ghMsg };
  } finally {
    deployInFlight = false;
    inFlightSnapshotRels = new Set();
  }
}

// ---------------------------------------------------------------------------

app.post('/api/admin/authoring/publish', requireRole('superadmin'), (req, res) => {
  try {
    const { module: moduleSlug, subFolder, slug, path: relIn } = req.body || {};
    const target = relIn ? resolveAnyDocPath(relIn) : resolveDraftPath(moduleSlug, subFolder, slug);
    if (!fsSync.existsSync(target)) return res.status(404).json({ error: 'Draft not found' });

    const raw = fsSync.readFileSync(target, 'utf8');
    const audit = gradeMarkdown(raw, auditOpts());
    const blockers = (audit.findings || []).filter((f) => f.blocking);
    if (blockers.length > 0) {
      return res.status(400).json({ error: 'Audit blocking - fix before publishing', audit });
    }
    const conflict = findSlugOrIdCollision(target, raw);
    if (conflict) {
      return res.status(409).json({
        error: `Cannot publish: "${conflict}" in the same folder claims the same route slug or doc id, which would break the production build. Delete or re-slug it first.`,
      });
    }
    const next = raw.replace(/^draft:\s*true\s*$/m, 'draft: false');
    if (next === raw) {
      return res.status(400).json({ error: 'No draft: true flag found in frontmatter' });
    }
    fsSync.writeFileSync(target, next, 'utf8');

    // Queue for deploy + reset the debounce timer (so a burst batches).
    const relPath = path.relative(__dirname, target);
    journalRecordUpsert(relPath, req.user?.email);
    enqueueUpsert(relPath);
    // Ship the folder's gate file together with the article. For a freshly
    // author-created folder this is its first trip to the publish branch
    // (an empty category alone could break the site build); for existing
    // folders it's an identical-content no-op in the commit.
    const catAbs = path.join(path.dirname(target), '_category_.json');
    if (fsSync.existsSync(catAbs)) {
      enqueueUpsert(path.relative(__dirname, catAbs));
    }
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
//
// Redirect safety: unpublish needs NO redirect reconciliation. Redirects
// targeting the vacated route stay in data/redirects.json, but
// docusaurus.config.ts drops any entry whose target doc is draft:true
// before the plugin's target-exists check runs - and restores it
// automatically when the article is republished.
app.post('/api/admin/authoring/unpublish', requireRole('superadmin'), (req, res) => {
  try {
    const { module: moduleSlug, subFolder, slug, path: relIn } = req.body || {};
    const target = relIn ? resolveAnyDocPath(relIn) : resolveDraftPath(moduleSlug, subFolder, slug);
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
    // A queued publish is only truly cancelable while no deploy is shipping
    // it. Once fireDeploy snapshotted the rel, the published version reaches
    // production regardless - so the re-draft must ship as a follow-up
    // instead of being silently dropped with the queue entry.
    const pendingPublish = deployQueue.get(relPath) === 'upsert'
      && !inFlightSnapshotRels.has(relPath.replace(/\\/g, '/'))
      && !inFlightSnapshotRels.has(relPath);
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
      journalRecordUpsert(relPath, req.user?.email);
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
    lastValidationError,
    // Articles the last deploy refused to ship. Only those still queued are
    // reported - once the author fixes one and it ships, it drops out.
    heldBack: lastHeldBack.filter((h) => deployQueue.has(h.path)),
    journal: {
      enabled: JOURNAL_ENABLED,
      branch: JOURNAL_BRANCH,
      lastCommitTs: journalStatus.lastCommitTs,
      lastCommitSha: journalStatus.lastCommitSha,
      pendingCount: journalDirty.size,
      lastError: journalStatus.lastError,
      bootRestored: journalStatus.bootRestored,
      conflicts: journalStatus.conflicts,
      tokenExpiresAt: ghTokenExpiresAt,
      tokenDaysLeft: ghTokenExpiresAt ? Math.floor((ghTokenExpiresAt - Date.now()) / 86400000) : null,
    },
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
  if (!result.ok) {
    // 422 = the queued content itself is the problem (author-fixable);
    // 500 = infrastructure (GitHub API, config).
    const authorFixable = result.reason === 'validation-failed' || result.reason === 'held-back';
    return res.status(authorFixable ? 422 : 500).json(result);
  }
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
    journalRecordDelete(norm);
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
    journalRecordUpsert(`static/img/helpscout/authored/${filename}`, req.user?.email);
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
    // Every section, not just modules - but never the role-routing landing
    // pages or internal docs (they can't be authored from here).
    for (const entry of fsSync.readdirSync(DOCS_ROOT, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (entry.name === 'internal' || entry.name === 'path') continue;
      walk(path.join(DOCS_ROOT, entry.name));
    }
    drafts.sort((a, b) => String(b.lastUpdate).localeCompare(String(a.lastUpdate)));
    res.json({ drafts });
  } catch (error) {
    console.error('❌ authoring/drafts failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/authoring/draft', requireRole('superadmin'), (req, res) => {
  try {
    const { module: moduleSlug, subFolder, slug, path: relIn } = req.query;
    const target = relIn ? resolveAnyDocPath(relIn) : resolveDraftPath(moduleSlug, subFolder, slug);
    if (!fsSync.existsSync(target)) return res.status(404).json({ error: 'Draft not found' });
    const markdown = fsSync.readFileSync(target, 'utf8');
    res.json({ markdown, path: path.relative(__dirname, target), hash: contentHash(markdown) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// Deletion trash. Published articles stay recoverable from the publish
// branch's immutable history, but a deleted DRAFT only ever existed on
// disk + the journal branch - and the journal's post-deploy force-rebase
// eventually erases that history. Copy files to the volume before unlink
// so any deletion is recoverable for 30 days.
// ─────────────────────────────────────────────────────────────────────────
const TRASH_DIR = path.join(__dirname, 'data', 'trash');
const TRASH_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

function trashOpDir(slug) {
  return `${new Date().toISOString().replace(/[:.]/g, '-')}__${slug}`;
}
/** Best-effort copy into data/trash/<opDir>/ before a delete. */
function trashFile(absPath, opDir) {
  try {
    if (!fsSync.existsSync(absPath)) return;
    const dst = path.join(TRASH_DIR, opDir, path.basename(absPath));
    fsSync.mkdirSync(path.dirname(dst), { recursive: true });
    fsSync.copyFileSync(absPath, dst);
  } catch (e) {
    console.warn(`[trash] failed to snapshot ${absPath} before delete:`, e.message);
  }
}
function pruneTrash() {
  try {
    if (!fsSync.existsSync(TRASH_DIR)) return;
    let pruned = 0;
    for (const entry of fsSync.readdirSync(TRASH_DIR, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const p = path.join(TRASH_DIR, entry.name);
      if (Date.now() - fsSync.statSync(p).mtimeMs > TRASH_RETENTION_MS) {
        fsSync.rmSync(p, { recursive: true, force: true });
        pruned += 1;
      }
    }
    if (pruned > 0) console.log(`[trash] pruned ${pruned} deletion snapshot(s) older than 30 days`);
  } catch (e) {
    console.warn('[trash] prune failed:', e.message);
  }
}
pruneTrash();

app.delete('/api/admin/authoring/draft', requireRole('superadmin'), (req, res) => {
  try {
    const { module: moduleSlug, subFolder, slug, path: relIn } = req.query;
    const target = relIn ? resolveAnyDocPath(relIn) : resolveDraftPath(moduleSlug, subFolder, slug);
    if (!fsSync.existsSync(target)) return res.status(404).json({ error: 'Draft not found' });
    const text = fsSync.readFileSync(target, 'utf8');
    if (!/^draft:\s*true\b/m.test(text)) {
      return res.status(400).json({ error: 'Refusing to delete - frontmatter is not marked draft:true' });
    }
    const imageRefs = imagesReferencedBy(text);
    const opDir = trashOpDir(path.basename(target).replace(/\.(md|mdx)$/, ''));
    trashFile(target, opDir);
    fsSync.unlinkSync(target);
    // Drafts never reach the publish branch, so cleanup skips the deploy
    // queue - but the journal must drop its copies or a restart resurrects
    // the deleted draft.
    journalRecordDelete(path.relative(__dirname, target), req.user?.email);
    let imagesRemoved = 0;
    for (const imgUrl of imageRefs) {
      if (isImageReferencedElsewhere(imgUrl, target)) continue;
      const imgAbs = path.join(__dirname, 'static' + imgUrl);
      if (fsSync.existsSync(imgAbs)) {
        trashFile(imgAbs, opDir);
        try { fsSync.unlinkSync(imgAbs); imagesRemoved++; journalRecordDelete('static' + imgUrl, req.user?.email); } catch {/* ignore */}
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

/** Content fingerprint for optimistic concurrency: GET /draft and
 *  GET /article return it, the save endpoints compare it. Two editors on
 *  the same article were previously silent last-write-wins. */
function contentHash(text) {
  return require('crypto').createHash('sha1').update(text, 'utf8').digest('hex');
}

function resolveArticlePath(relPath) {
  if (typeof relPath !== 'string' || !relPath) throw new Error('path required');
  const norm = relPath.replace(/\\/g, '/');
  const m = /^docs\/modules\/([^/]+)\/([^/]+)\/([^/]+)\.(md|mdx)$/.exec(norm);
  if (!m) throw new Error('Path must match docs/modules/<module>/<sub-folder>/<slug>.{md,mdx}');
  const [, moduleSlug, subFolder, slug] = m;
  if (!isValidSlug(moduleSlug) || !isValidSlug(slug)) throw new Error('Invalid slug in path');
  const target = path.resolve(__dirname, norm);
  if (!target.startsWith(MODULES_ROOT + path.sep)) throw new Error('Path escapes docs/modules/');
  // Canonical sub-folders always resolve; author-created custom folders
  // resolve once they exist on disk (created via POST /folders, which
  // guarantees a licensing-correct _category_.json).
  if (!CANONICAL_SUBFOLDERS.has(subFolder) && !fsSync.existsSync(path.dirname(target))) {
    throw new Error('Sub-folder not found');
  }
  return target;
}

// ─────────────────────────────────────────────────────────────────────────
// Section-general path resolution. The raw editor / queue / reorder work on
// EVERY docs section, not just modules. Modules paths delegate to
// resolveArticlePath (keeping the canonical-subfolder invariant and leaving
// module index.mdx landing pages uneditable). The role-routing landing pages
// (docs/path/) and docs/internal/ stay off-limits.
// ─────────────────────────────────────────────────────────────────────────
const AUTHORING_DENY_PREFIXES = ['docs/internal/', 'docs/path/'];

function resolveAnyDocPath(relPath) {
  if (typeof relPath !== 'string' || !relPath) throw new Error('path required');
  const norm = relPath.replace(/\\/g, '/');
  if (norm.startsWith('docs/modules/')) return resolveArticlePath(norm);
  if (AUTHORING_DENY_PREFIXES.some((p) => norm.startsWith(p))) {
    throw new Error('This area is not editable from the authoring tool');
  }
  const m = /^docs\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?\/([a-z0-9._-]+)\.(md|mdx)$/.exec(norm);
  if (!m) throw new Error('Path must match docs/<section>[/<sub-folder>]/<slug>.{md,mdx}');
  const [, section, sub, slug] = m;
  if (!isValidSlug(section) || (sub && !isValidSlug(sub))) throw new Error('Invalid folder in path');
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(slug)) throw new Error('Invalid slug in path');
  const target = path.resolve(__dirname, norm);
  if (!target.startsWith(DOCS_ROOT + path.sep)) throw new Error('Path escapes docs/');
  return target;
}

/** Resolve a folder authors may list/reorder/move into:
 *  docs/<section>[/<sub>] or docs/modules/<module>/<canonical-sub>.
 *  Must already exist on disk. */
/** A canonical module leaf that simply hasn't been started yet is a legitimate
 *  destination - the 8-leaf template defines it, and a leaf materializes when
 *  its first article lands. 46 of the 126 offered leaves are in that state, and
 *  resolveAnyDocDir's existence check turned every one of them into a 400
 *  ("Folder not found") *after* the author had written their brain dump.
 *  Scaffold the gate instead, which is what /save did a moment later anyway.
 *  Returns true when it created the folder. Write paths only. */
function ensureCanonicalModuleLeaf(dirRel) {
  const m = /^docs\/modules\/([a-z0-9-]+)\/([a-z0-9-]+)$/.exec(String(dirRel || '').replace(/\\/g, '/'));
  if (!m) return false;
  if (!CANONICAL_SUBFOLDERS.has(m[2])) return false;
  if (!fsSync.existsSync(path.join(MODULES_ROOT, m[1]))) return false;  // unknown module
  if (fsSync.existsSync(path.join(MODULES_ROOT, m[1], m[2]))) return false;
  return ensureSubfolderCategory(m[1], m[2]);
}

function resolveAnyDocDir(dir) {
  if (typeof dir !== 'string' || !dir) throw new Error('dir required');
  const norm = dir.replace(/\\/g, '/').replace(/\/+$/, '');
  if (AUTHORING_DENY_PREFIXES.some((p) => norm.startsWith(p) || norm + '/' === p)) {
    throw new Error('This area is not editable from the authoring tool');
  }
  let target;
  const modMatch = /^docs\/modules\/([a-z0-9-]+)\/([a-z0-9-]+)$/.exec(norm);
  if (norm === 'docs/modules' || norm.startsWith('docs/modules/')) {
    if (!modMatch) throw new Error('Module folders must be docs/modules/<module>/<sub-folder>');
    if (!isValidSlug(modMatch[1]) || !isValidSlug(modMatch[2])) throw new Error('Invalid folder name');
    target = path.resolve(__dirname, norm);
    if (!target.startsWith(MODULES_ROOT + path.sep)) throw new Error('Path escapes docs/modules/');
    // Modules only accept canonical sub-folders - reject custom names outright.
    const subErr = canonicalSubfolderError(modMatch[2]);
    if (subErr) throw new Error(subErr);
  } else {
    const m = /^docs\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?$/.exec(norm);
    if (!m) throw new Error('Folder must be docs/<section> or docs/<section>/<sub-folder>');
    if (!isValidSlug(m[1]) || (m[2] && !isValidSlug(m[2]))) throw new Error('Invalid folder name');
    target = path.resolve(__dirname, norm);
    if (!target.startsWith(DOCS_ROOT + path.sep)) throw new Error('Path escapes docs/');
  }
  if (!fsSync.existsSync(target) || !fsSync.statSync(target).isDirectory()) {
    throw new Error('Folder not found');
  }
  return target;
}

app.get('/api/admin/authoring/article', requireRole('superadmin'), (req, res) => {
  try {
    const target = resolveAnyDocPath(req.query.path);
    if (!fsSync.existsSync(target)) return res.status(404).json({ error: 'Article not found' });
    const markdown = fsSync.readFileSync(target, 'utf8');
    res.json({ markdown, path: path.relative(__dirname, target), hash: contentHash(markdown) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/admin/authoring/articles', requireRole('superadmin'), (req, res) => {
  try {
    const { dir: dirIn, module: moduleSlug, subFolder, filter = 'all' } = req.query;
    let dir;
    if (dirIn) {
      dir = resolveAnyDocDir(dirIn);
    } else {
      if (!isValidSlug(moduleSlug)) return res.status(400).json({ error: 'Invalid module' });
      if (!CANONICAL_SUBFOLDERS.has(subFolder)) return res.status(400).json({ error: 'Invalid sub-folder' });
      dir = path.join(MODULES_ROOT, moduleSlug, subFolder);
      if (!fsSync.existsSync(dir)) return res.json({ articles: [] });
    }
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
      const posMatch = /^sidebar_position:\s*(\d+)\s*$/m.exec(text);
      articles.push({
        path: path.relative(__dirname, p),
        slug: path.basename(p).replace(/\.(md|mdx)$/, ''),
        title: titleMatch ? titleMatch[1] : path.basename(p),
        lastUpdate: lastUpdMatch ? lastUpdMatch[1] : null,
        draft: isDraft,
        position: posMatch ? parseInt(posMatch[1], 10) : null,
      });
    }
    if (dirIn) {
      // Sidebar order - what reordering operates on.
      articles.sort((a, b) => {
        const pa = a.position ?? Infinity;
        const pb = b.position ?? Infinity;
        return pa !== pb ? pa - pb : String(a.title).localeCompare(String(b.title));
      });
    } else {
      articles.sort((a, b) => String(b.lastUpdate).localeCompare(String(a.lastUpdate)));
    }
    res.json({ articles });
  } catch (error) {
    console.error('❌ authoring/articles failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/** Persist a new article order for one folder. Stamps sidebar_position in
 *  10-step increments over exactly the paths the client sent (drafts are
 *  deliberately absent - they keep their old positions and land at the end
 *  of the folder when published). Re-reads every file from disk before the
 *  surgical frontmatter edit, so a body save that landed a moment ago is
 *  never clobbered. Published files queue for deploy; drafts just persist. */
app.post('/api/admin/authoring/reorder', requireRole('superadmin'), (req, res) => {
  try {
    const { dir: dirIn, orderedPaths } = req.body || {};
    const dirAbs = resolveAnyDocDir(dirIn);
    if (!Array.isArray(orderedPaths) || orderedPaths.length === 0) {
      return res.status(400).json({ error: 'orderedPaths must be a non-empty array' });
    }
    if (new Set(orderedPaths).size !== orderedPaths.length) {
      return res.status(400).json({ error: 'orderedPaths contains duplicates' });
    }
    const targets = orderedPaths.map((rel) => {
      const abs = resolveAnyDocPath(rel);
      if (path.dirname(abs) !== dirAbs) throw new Error(`${rel} is not in ${dirIn}`);
      if (!fsSync.existsSync(abs)) throw new Error(`${rel} not found`);
      return { rel: rel.replace(/\\/g, '/'), abs };
    });

    // Two phases so a bad file mid-list can never leave a half-stamped
    // folder: compute every new content first (any failure → 400 with
    // nothing written), then write.
    const stamped = targets.map(({ rel, abs }, i) => {
      const raw = fsSync.readFileSync(abs, 'utf8');
      const next = setSidebarPosition(raw, (i + 1) * 10);
      if (next === null) {
        const err = new Error(`${rel} has no frontmatter - cannot set its position`);
        err.statusCode = 400;
        throw err;
      }
      return { rel, abs, raw, next };
    });

    let changed = 0;
    let queued = 0;
    for (const { rel, abs, raw, next } of stamped) {
      if (next === raw) continue;
      fsSync.writeFileSync(abs, next, 'utf8');
      journalRecordUpsert(rel, req.user?.email);
      changed += 1;
      if (!/^draft:\s*true\b/m.test(next)) {
        enqueueUpsert(rel);
        queued += 1;
      }
    }
    if (queued > 0) {
      persistDeployState();
      scheduleDeploy();
    }
    res.json({ ok: true, changed, queuedForDeploy: queued > 0, queueSize: deployQueue.size });
  } catch (error) {
    console.error('❌ authoring/reorder failed:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/admin/authoring/save-raw', requireRole('superadmin'), async (req, res) => {
  try {
    const { path: relPath, markdown, baseHash } = req.body || {};
    if (!markdown) return res.status(400).json({ error: 'markdown required' });
    const target = resolveAnyDocPath(relPath);
    // Optimistic concurrency (see /save): refuse to clobber a copy that
    // changed after the client loaded it, unless the client omits baseHash.
    if (baseHash && fsSync.existsSync(target)) {
      const current = fsSync.readFileSync(target, 'utf8');
      const currentHash = contentHash(current);
      if (currentHash !== baseHash) {
        return res.status(409).json({
          error: 'stale-base',
          message: 'This article changed on the server after you loaded it (another editor saved). Reload it, or save again to overwrite their version.',
          currentHash,
          markdown: current,
        });
      }
    }
    // Defang decorative emojis before audit + write. The pre-commit hook
    // would reject them on the next deploy commit anyway; doing it here
    // keeps the saved file consistent with what /save produces and the
    // audit result reflects the on-disk state.
    const cleaned = stripDecorativeEmojis(markdown);
    // Audit runs advisory for STYLE - the raw editor surfaces those findings
    // as warnings, not blockers; the wizard's /save is the strict gate and
    // raw edits trust the superadmin's judgment for surgical fixes. Build-
    // physics findings (bad YAML, uncompilable MDX, unknown privilege keys)
    // are non-negotiable though: they hard-fail the Railway build.
    const audit = gradeMarkdown(cleaned, auditOpts());
    const buildBlockers = (audit.findings || []).filter((f) => f.buildBreaking);
    if (buildBlockers.length > 0) {
      return res.status(400).json({
        error: 'This content would break the production build - fix before saving',
        audit,
      });
    }

    const isDraft = /^draft:\s*true\b/m.test(cleaned);
    // Route-integrity guards for edits that land on production. The raw
    // editor can change frontmatter slug/id freely, which (a) may collide
    // with a sibling article and (b) vacates the article's previous URL -
    // both broke production builds before these guards existed.
    let oldRaw = null;
    try { oldRaw = fsSync.readFileSync(target, 'utf8'); } catch { /* new file */ }
    if (!isDraft) {
      const conflict = findSlugOrIdCollision(target, cleaned);
      if (conflict) {
        return res.status(409).json({
          error: `Cannot save: "${conflict}" in the same folder claims the same route slug or doc id, which would break the production build. Re-slug one of them first.`,
        });
      }
    }
    let redirectsUpdated = false;
    if (oldRaw && !isDraft && !/^draft:\s*true\b/m.test(oldRaw)) {
      const oldSlug = articleIdentity(oldRaw, path.basename(target)).slug;
      const newSlug = articleIdentity(cleaned, path.basename(target)).slug;
      if (oldSlug !== newSlug) {
        // A slug change is a rename: same folder, new route. Treat it like
        // a move so inbound links and existing redirects stay valid.
        const routeDir = '/' + path.relative(DOCS_ROOT, path.dirname(target)).split(path.sep).join('/');
        const abs = (s) => (s.startsWith('/') ? s : `${routeDir}/${s}`);
        redirectsUpdated = await updateRedirectsForMove(abs(oldSlug), abs(newSlug));
      }
    }
    fsSync.mkdirSync(path.dirname(target), { recursive: true });
    // Same gate-protection as /save: derive {module, subFolder} from the
    // validated path and write the sub-folder _category_.json if missing.
    let subfolderCreated = false;
    const m = /^docs\/modules\/([^/]+)\/([^/]+)\/[^/]+\.(md|mdx)$/.exec(
      path.relative(__dirname, target).replace(/\\/g, '/')
    );
    if (m) subfolderCreated = ensureSubfolderCategory(m[1], m[2]);
    fsSync.writeFileSync(target, cleaned, 'utf8');
    journalRecordUpsert(path.relative(__dirname, target), req.user?.email);
    if (subfolderCreated && m) {
      journalRecordUpsert(path.join('docs', 'modules', m[1], m[2], '_category_.json'), req.user?.email);
    }

    // If this is a published article (draft:false), the raw save needs to
    // reach production. Without enqueueing, the change sits on the
    // container's filesystem - Docusaurus serves the pre-built build/, and
    // the next Railway redeploy rebuilds from git, both of which see the
    // OLD content. Enqueue an upsert so fireDeploy commits the change on
    // the next debounced batch. Drafts skip the enqueue (they never reach
    // git until Publish flips them).
    const relTarget = path.relative(__dirname, target);
    let queuedForDeploy = false;
    if (!isDraft) {
      enqueueUpsert(relTarget);
      // Ship the folder's gate file in the same commit - the gate audit
      // hard-fails on an ungated module sub-folder, so a fresh
      // author-created folder's _category_.json must never miss its first
      // article's deploy. For long-shipped folders this is an
      // identical-content no-op.
      const rawCatAbs = path.join(path.dirname(target), '_category_.json');
      if (fsSync.existsSync(rawCatAbs)) {
        enqueueUpsert(path.relative(__dirname, rawCatAbs));
      }
      if (redirectsUpdated) {
        enqueueUpsert(path.relative(__dirname, REDIRECTS_PATH));
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
      redirectsUpdated,
      queuedForDeploy,
      queueSize: deployQueue.size,
      hash: contentHash(cleaned),
    });
  } catch (error) {
    console.error('❌ authoring/save-raw failed:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// setFrontmatterRoles / removeFrontmatterPrivilege now live in
// lib/frontmatter.js (imported at the top), shared with
// scripts/restamp-article-roles.js so article gating has one implementation.

const REDIRECTS_PATH = path.join(__dirname, 'data', 'redirects.json');

/** Load the redirects doc that edits should layer onto. DISK-FIRST: within
 *  a deploy batch the volume copy at REDIRECTS_PATH accumulates every edit
 *  (fireDeploy commits it and deletes it after a green push), so it is the
 *  only correct base while a batch is open - re-fetching GitHub here would
 *  clobber earlier edits in the same batch with the stale pre-batch state.
 *  GitHub is fetched only when no disk copy exists (fresh volume, or the
 *  post-push cleanup removed it), then written through to seed the batch.
 *  Returns {doc, source} or null when no base is readable anywhere. */
async function loadRedirectsBase() {
  try {
    return { doc: JSON.parse(fsSync.readFileSync(REDIRECTS_PATH, 'utf8')), source: 'disk' };
  } catch { /* absent or unreadable - fall through to GitHub */ }
  if (GIT_PUSH_ENABLED && GIT_PUSH_TOKEN && GITHUB_REPO) {
    try {
      const raw = await ghFetchFile('data/redirects.json');
      if (raw !== null) {
        fsSync.mkdirSync(path.dirname(REDIRECTS_PATH), { recursive: true });
        fsSync.writeFileSync(REDIRECTS_PATH, raw, 'utf8');
        return { doc: JSON.parse(raw), source: 'github' };
      }
    } catch (e) {
      console.error(`[redirects] could not fetch data/redirects.json from ${GIT_PUBLISH_BRANCH}: ${e.response?.status || e.message}`);
    }
  }
  return null;
}

/** Serialize every redirects.json read-modify-write. loadRedirectsBase can
 *  await a GitHub fetch, so two concurrent moves/deletes would otherwise
 *  interleave around that await and the second write would drop the first
 *  request's entry - a silently lost redirect that later breaks the build. */
let redirectsChain = Promise.resolve();
function withRedirectsLock(fn) {
  const run = redirectsChain.then(fn, fn);
  // Keep the chain alive regardless of fn's outcome; callers see the real result.
  redirectsChain = run.then(() => undefined, () => undefined);
  return run;
}

/** Keep data/redirects.json consistent when a move changes an article's
 *  route. The build hard-fails on redirects whose target no longer exists,
 *  so every entry still pointing at the vacated route is retargeted, any
 *  entry redirecting FROM the new route is dropped (it would shadow the
 *  real page), and an oldRoute→newRoute entry is added so inbound links
 *  keep working. Returns true when the file changed. */
async function updateRedirectsForMove(oldRoute, newRoute) {
  return withRedirectsLock(() => updateRedirectsForMoveUnlocked(oldRoute, newRoute));
}
async function updateRedirectsForMoveUnlocked(oldRoute, newRoute) {
  const base = await loadRedirectsBase();
  if (!base) {
    console.error(`[redirects] SKIPPING redirect maintenance for ${oldRoute} → ${newRoute}: no readable redirects.json on disk or GitHub. The next production build will fail on stale redirect targets - fix data/redirects.json manually.`);
    return false;
  }
  const { doc } = base;
  const before = JSON.stringify(doc.redirects || []);
  let list = Array.isArray(doc.redirects) ? doc.redirects : [];
  list = list.filter((r) => r.from !== newRoute);
  for (const r of list) {
    if (r.to === oldRoute) r.to = newRoute;
  }
  if (!list.some((r) => r.from === oldRoute)) {
    list.push({ from: oldRoute, to: newRoute });
  }
  const changed = JSON.stringify(list) !== before;
  if (changed) {
    doc.redirects = list;
    fsSync.mkdirSync(path.dirname(REDIRECTS_PATH), { recursive: true });
    fsSync.writeFileSync(REDIRECTS_PATH, JSON.stringify(doc, null, 2) + '\n', 'utf8');
    journalRecordUpsert('data/redirects.json');
    console.log(`[redirects] retargeted entries for ${oldRoute} → ${newRoute} (base: ${base.source})`);
  }
  return changed;
}

/** Routing identity of an article: frontmatter `slug` and `id`, each falling
 *  back to the filename (Docusaurus's own default). Within one directory,
 *  Docusaurus resolves the route from the slug and the doc id from the id -
 *  so two files in the same folder sharing either produces duplicate routes
 *  (non-deterministic routing) or a duplicate-id build failure. */
function articleIdentity(markdown, filename) {
  const base = filename.replace(/\.(md|mdx)$/, '');
  // Real YAML parse: frontmatter routinely uses block scalars (slug: >-)
  // that line-based regexes misread as the literal ">-". Malformed YAML
  // falls back to filename-derived identity.
  let fm = {};
  // Options arg bypasses gray-matter's content-keyed cache, which otherwise
  // returns `{data:{}}` on a re-parse of a string whose first parse threw -
  // silently turning broken frontmatter into "no frontmatter". See the same
  // note in lib/doc-routes.js.
  try { fm = matter(markdown, {}).data || {}; } catch { /* fall back below */ }
  return {
    slug: typeof fm.slug === 'string' && fm.slug.trim() ? fm.slug.trim() : base,
    id: fm.id != null && String(fm.id).trim() ? String(fm.id).trim() : base,
  };
}

/** Scan the directory that holds (or will hold) `targetAbs` for a different
 *  article claiming the same route slug or doc id as `markdown`. Returns the
 *  conflicting filename, or null when the target is safe to land. */
function findSlugOrIdCollision(targetAbs, markdown) {
  const dir = path.dirname(targetAbs);
  if (!fsSync.existsSync(dir)) return null;
  const mine = articleIdentity(markdown, path.basename(targetAbs));
  for (const entry of fsSync.readdirSync(dir)) {
    if (!/\.(md|mdx)$/.test(entry)) continue;
    const p = path.join(dir, entry);
    if (p === targetAbs) continue;
    let raw;
    try { raw = fsSync.readFileSync(p, 'utf8'); } catch { continue; }
    const theirs = articleIdentity(raw, entry);
    if (theirs.slug === mine.slug || theirs.id === mine.id) return entry;
  }
  return null;
}

/** Default audience for a move destination. Module sub-folders keep the
 *  SUBFOLDER_TEMPLATE behavior. Section folders read the destination's
 *  _category_.json roles, falling back to the parent section's; when neither
 *  declares roles, return null and the article keeps its own audience. */
function destinationRoles(toDirRel) {
  const norm = toDirRel.replace(/\\/g, '/');
  const modMatch = /^docs\/modules\/[a-z0-9-]+\/([a-z0-9-]+)$/.exec(norm);
  if (modMatch) {
    const tmpl = SUBFOLDER_TEMPLATE.find((s) => s.slug === modMatch[1]);
    return (tmpl && tmpl.roles) || ALL_ROLES;
  }
  const candidates = [norm];
  const parent = norm.split('/').slice(0, 2).join('/');
  if (parent !== norm) candidates.push(parent);
  for (const rel of candidates) {
    try {
      const cat = JSON.parse(fsSync.readFileSync(path.join(__dirname, rel, '_category_.json'), 'utf8'));
      const roles = cat?.customProps?.roles;
      if (Array.isArray(roles) && roles.length > 0) return roles;
    } catch { /* try the next candidate */ }
  }
  return null;
}

/** Give a new article a real place in the sidebar.
 *
 *  The generation prompt used to hardcode `sidebar_position: 999`, so every
 *  wizard-written article carried the same value; Docusaurus breaks ties
 *  alphabetically, which is why new articles landed in apparently random
 *  order. Assign max(siblings) + 10, matching the 10-step convention
 *  /reorder already uses so a later manual reorder has room to slot between.
 *
 *  An article that already carries a deliberate position keeps it - only the
 *  999 placeholder and a missing field are replaced. `selfAbs` is excluded
 *  from the sibling scan so re-saving doesn't leapfrog the article past itself.
 */
function ensureSidebarPosition(markdown, dirAbs, selfAbs) {
  const m = /^sidebar_position:\s*(\d+)\s*$/m.exec(markdown);
  if (m && Number(m[1]) !== 999) return markdown;

  let max = 0;
  try {
    for (const entry of fsSync.readdirSync(dirAbs, { withFileTypes: true })) {
      if (!entry.isFile() || !/\.mdx?$/i.test(entry.name)) continue;
      const abs = path.join(dirAbs, entry.name);
      if (selfAbs && path.resolve(abs) === path.resolve(selfAbs)) continue;
      const sib = /^sidebar_position:\s*(\d+)\s*$/m.exec(fsSync.readFileSync(abs, 'utf8'));
      const n = sib ? Number(sib[1]) : 0;
      if (Number.isFinite(n) && n !== 999 && n > max) max = n;
    }
  } catch { /* new folder - fall through to the first slot */ }

  const next = max + 10;
  return m
    ? markdown.replace(/^sidebar_position:\s*\d+\s*$/m, `sidebar_position: ${next}`)
    : markdown.replace(/^(---[\s\S]*?\n)(---)/, (all, fm, end) => `${fm}sidebar_position: ${next}\n${end}`);
}

// Relocate an article to a different folder (slug unchanged) - any module
// sub-folder or docs section. Writes the new file + unlinks the old; for
// published articles the rename ships as enqueueDelete(old) +
// enqueueUpsert(new) in one deploy. Images are root-relative + shared, so
// they are never moved or culled. The moved file's audience
// (customProps.roles) is rewritten to the destination folder's default (when
// the destination declares one) and any article-level privilege is dropped,
// so the destination _category_.json gate governs.
app.post('/api/admin/authoring/move', requireRole('superadmin'), async (req, res) => {
  try {
    const { fromPath, toDir: toDirIn, toModule, toSubFolder } = req.body || {};
    const toDirRel = (toDirIn || (toModule && toSubFolder ? `docs/modules/${toModule}/${toSubFolder}` : ''))
      .replace(/\\/g, '/').replace(/\/+$/, '');
    if (!toDirRel) return res.status(400).json({ error: 'toDir (or toModule + toSubFolder) required' });
    const isModuleDest = toDirRel.startsWith('docs/modules/');

    const fromAbs = resolveAnyDocPath(fromPath);
    const fromRel = path.relative(__dirname, fromAbs);
    const slug = path.basename(fromAbs).replace(/\.(md|mdx)$/, '');
    let toDirAbs;
    if (isModuleDest) {
      // Canonical module destinations may not exist yet (first article in a
      // sub-folder - the gate is scaffolded below); author-created custom
      // folders must already exist on disk.
      const m = /^docs\/modules\/([a-z0-9-]+)\/([a-z0-9-]+)$/.exec(toDirRel);
      if (!m || !isValidSlug(m[1]) || !isValidSlug(m[2])) {
        return res.status(400).json({ error: 'Destination must be docs/modules/<module>/<sub-folder>' });
      }
      if (!fsSync.existsSync(path.join(MODULES_ROOT, m[1]))) {
        return res.status(400).json({ error: `Unknown module: ${m[1]}` });
      }
      if (!CANONICAL_SUBFOLDERS.has(m[2]) && !fsSync.existsSync(path.join(__dirname, toDirRel))) {
        return res.status(400).json({ error: 'That folder does not exist in this module.' });
      }
      toDirAbs = path.join(__dirname, toDirRel);
    } else {
      toDirAbs = resolveAnyDocDir(toDirRel);
    }
    const toAbs = path.join(toDirAbs, path.basename(fromAbs));
    const toRel = path.relative(__dirname, toAbs);

    if (fromAbs === toAbs) {
      return res.status(400).json({ error: 'Article is already in that folder.' });
    }
    if (!fsSync.existsSync(fromAbs)) {
      return res.status(404).json({ error: 'Article not found' });
    }
    if (fsSync.existsSync(toAbs)) {
      return res.status(409).json({ error: `An article with slug "${slug}" already exists in that folder.` });
    }

    const raw = fsSync.readFileSync(fromAbs, 'utf8');
    const conflict = findSlugOrIdCollision(toAbs, raw);
    if (conflict) {
      return res.status(409).json({
        error: `Cannot move: "${conflict}" in the destination folder already claims the same route slug or doc id, which would break the production build.`,
      });
    }
    const wasPublished = !/^draft:\s*true\b/m.test(raw);

    // Re-home the audience to the destination folder's default roles (when it
    // declares one) and drop any article-level privilege.
    const destRoles = destinationRoles(toDirRel);
    let next = destRoles ? setFrontmatterRoles(raw, destRoles) : raw;
    next = removeFrontmatterPrivilege(next);
    next = stripDecorativeEmojis(next);

    // Gate a brand-new module sub-folder before the file lands there
    // (no-ops for section destinations, which must already exist).
    const destModMatch = /^docs\/modules\/([a-z0-9-]+)\/([a-z0-9-]+)$/.exec(toDirRel);
    const created = destModMatch ? ensureSubfolderCategory(destModMatch[1], destModMatch[2]) : false;

    fsSync.mkdirSync(path.dirname(toAbs), { recursive: true });
    fsSync.writeFileSync(toAbs, next, 'utf8');
    fsSync.unlinkSync(fromAbs);
    journalRecordUpsert(toRel, req.user?.email);
    journalRecordDelete(fromRel, req.user?.email);
    if (created && destModMatch) {
      journalRecordUpsert(path.join('docs', 'modules', destModMatch[1], destModMatch[2], '_category_.json'), req.user?.email);
    }

    let queuedForDeploy = false;
    let redirectsUpdated = false;
    if (wasPublished) {
      // The article's route changes with the folder (unless its frontmatter
      // slug is absolute) - retarget stale redirects and keep the old URL
      // alive. Draft moves skip this: drafts aren't routed in prod, so a
      // redirect to one would itself break the build.
      const routeSlug = articleIdentity(raw, path.basename(fromAbs)).slug;
      const routeDir = (abs) => '/' + path.relative(DOCS_ROOT, path.dirname(abs)).split(path.sep).join('/');
      if (!routeSlug.startsWith('/')) {
        redirectsUpdated = await updateRedirectsForMove(
          `${routeDir(fromAbs)}/${routeSlug}`,
          `${routeDir(toAbs)}/${routeSlug}`
        );
      }
      enqueueDelete(fromRel);
      // Route hint for the deploy pre-flight: the old path's file is gone,
      // so remember which route the queued delete vacates.
      deletedRouteHints.set(
        fromRel.replace(/\\/g, '/'),
        normRoute(routeSlug.startsWith('/') ? routeSlug : `${routeDir(fromAbs)}/${routeSlug}`)
      );
      enqueueUpsert(toRel);
      // Ship the destination folder's gate file with the move - required
      // for a fresh author-created module folder (ungated sub-folders fail
      // the gate audit); an identical-content no-op everywhere else.
      const destCatAbs = path.join(toDirAbs, '_category_.json');
      if (fsSync.existsSync(destCatAbs)) {
        enqueueUpsert(path.relative(__dirname, destCatAbs));
      }
      if (redirectsUpdated) {
        enqueueUpsert(path.relative(__dirname, REDIRECTS_PATH));
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
      redirectsUpdated,
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
  const re = /!\[[^\]]*\]\(\s*(\/img\/helpscout\/authored\/[^)\s]+)\s*\)/g;
  const out = new Set();
  for (const m of markdown.matchAll(re)) out.add(m[1]);
  return out;
}

/** Walk ALL of docs/ for any .md/.mdx article (other than `excludeAbs`)
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
  return fsSync.existsSync(DOCS_ROOT) ? walk(DOCS_ROOT) : false;
}

app.delete('/api/admin/authoring/article', requireRole('superadmin'), async (req, res) => {
  try {
    const target = resolveAnyDocPath(req.query.path);
    if (!fsSync.existsSync(target)) return res.status(404).json({ error: 'Article not found' });
    // Read frontmatter + image refs BEFORE unlinking. If the article was
    // non-draft (ever published to git) we need to enqueue a delete-commit
    // for the .md AND for the now-orphan images. Drafts never reached git,
    // so a local unlink is sufficient there.
    let wasPublished = false;
    let imageRefs = new Set();
    let deletedRoute = null;
    try {
      const raw = fsSync.readFileSync(target, 'utf8');
      wasPublished = !/^draft:\s*true\b/m.test(raw);
      imageRefs = imagesReferencedBy(raw);
      const slug = articleIdentity(raw, path.basename(target)).slug;
      const routeDir = '/' + path.relative(DOCS_ROOT, path.dirname(target)).split(path.sep).join('/');
      deletedRoute = normRoute(slug.startsWith('/') ? slug : `${routeDir}/${slug}`);
    } catch {/* if unreadable, assume published - safer to over-deploy */ wasPublished = true; }

    // Reconcile redirects BEFORE the route disappears: any entry still
    // targeting it would hard-fail the next production build. Retarget
    // those entries to the module landing (every module has an index.mdx)
    // and soft-land the vacated URL there too, so inbound links degrade
    // gracefully instead of 404ing.
    let redirectsUpdated = false;
    if (wasPublished && deletedRoute) {
      const modMatch = /^\/modules\/([^/]+)\//.exec(deletedRoute + '/');
      const landing = modMatch ? `/modules/${modMatch[1]}` : '/';
      redirectsUpdated = await withRedirectsLock(async () => {
        const base = await loadRedirectsBase();
        if (!base) {
          console.error(`[redirects] SKIPPING delete reconciliation for ${deletedRoute}: no readable redirects.json on disk or GitHub. The deploy pre-flight will abort if any redirect targets this route.`);
          return false;
        }
        const { doc } = base;
        const before = JSON.stringify(doc.redirects || []);
        let list = Array.isArray(doc.redirects) ? doc.redirects : [];
        list = list.map((r) => (r.to === deletedRoute ? { ...r, to: landing } : r))
                   .filter((r) => r.from !== r.to);
        if (!list.some((r) => r.from === deletedRoute)) {
          list.push({ from: deletedRoute, to: landing });
        }
        if (JSON.stringify(list) === before) return false;
        doc.redirects = list;
        fsSync.mkdirSync(path.dirname(REDIRECTS_PATH), { recursive: true });
        fsSync.writeFileSync(REDIRECTS_PATH, JSON.stringify(doc, null, 2) + '\n', 'utf8');
        journalRecordUpsert('data/redirects.json', req.user?.email);
        console.log(`[redirects] reconciled entries for deleted ${deletedRoute} → ${landing} (base: ${base.source})`);
        return true;
      });
    }

    const opDir = trashOpDir(path.basename(target).replace(/\.(md|mdx)$/, ''));
    trashFile(target, opDir);
    fsSync.unlinkSync(target);
    journalRecordDelete(path.relative(__dirname, target), req.user?.email);

    // Cull images this article referenced, but only if no other article
    // still needs them. Locally always; via deploy queue if was-published.
    const imagesRemovedRel = [];
    for (const imgUrl of imageRefs) {
      if (isImageReferencedElsewhere(imgUrl, target)) continue;
      const imgRel = 'static' + imgUrl;  // /img/helpscout/authored/X → static/img/helpscout/authored/X
      const imgAbs = path.join(__dirname, imgRel);
      if (fsSync.existsSync(imgAbs)) {
        trashFile(imgAbs, opDir);
        try { fsSync.unlinkSync(imgAbs); } catch {/* ignore */}
      }
      imagesRemovedRel.push(imgRel);
      journalRecordDelete(imgRel, req.user?.email);
    }

    let queued = false;
    if (wasPublished) {
      const relPath = path.relative(__dirname, target);
      enqueueDelete(relPath);
      // Route hint for the deploy pre-flight: the file is gone from disk,
      // so the vacated route (frontmatter-slug aware) must be remembered.
      if (deletedRoute) {
        deletedRouteHints.set(relPath.replace(/\\/g, '/'), deletedRoute);
      }
      for (const imgRel of imagesRemovedRel) enqueueDelete(imgRel);
      if (redirectsUpdated) {
        enqueueUpsert(path.relative(__dirname, REDIRECTS_PATH));
      }
      persistDeployState();
      scheduleDeploy();
      queued = true;
    }
    res.json({
      ok: true,
      queuedForDeploy: queued,
      queueSize: deployQueue.size,
      imagesRemoved: imagesRemovedRel.length,
      redirectsUpdated,
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
  journalRecordUpsert('static/module-overviews.json');
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
  journalRecordUpsert('data/known-privileges.json');
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

  for (const rel of written) journalRecordUpsert(rel);
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

/** Create a new sub-folder inside an existing docs SECTION or MODULE (not
 *  new top-level sections - those need a hand-authored sidebars.ts entry).
 *  - Section folders inherit the section's audience roles.
 *  - Module folders MUST carry the module's license privilege - the module
 *    root is deliberately ungated (upsell landing), so sub-folder gates are
 *    the only privilege carrier. Custom module folders get ALL_ROLES + the
 *    module's privilege/anyPrivilege (per-article roles narrow the audience);
 *    a CANONICAL name (e.g. "Features") uses the exact template gate instead,
 *    because the gate audit hard-fails on canonical-name mismatches.
 *  The gate file is journaled immediately for durability; it ships alongside
 *  the folder's first published article (see /publish), and shipping it alone
 *  is also build-safe (verified: article-less categories are omitted). */
app.post('/api/admin/authoring/folders', requireRole('superadmin'), (req, res) => {
  try {
    const { sectionDir, label, subFolder } = req.body || {};
    const cleanLabel = String(label || '').trim();
    if (!cleanLabel || cleanLabel.length > 60) {
      return res.status(400).json({ error: 'Give the folder a name (up to 60 characters).' });
    }
    const norm = String(sectionDir || '').replace(/\\/g, '/').replace(/\/+$/, '');
    const modMatch = /^docs\/modules\/([a-z0-9-]+)$/.exec(norm);
    const isSection = /^docs\/[a-z0-9-]+$/.test(norm) && norm !== 'docs/modules'
      && !AUTHORING_DENY_PREFIXES.some((p) => norm + '/' === p || norm.startsWith(p));
    if (!modMatch && !isSection) {
      return res.status(400).json({ error: 'New folders can only be created inside an existing section or module.' });
    }
    const parentAbs = path.resolve(__dirname, norm);
    if (!parentAbs.startsWith(DOCS_ROOT + path.sep) || !fsSync.existsSync(parentAbs) || !fsSync.statSync(parentAbs).isDirectory()) {
      return res.status(400).json({ error: "That section doesn't exist." });
    }
    // For a module, the canonical picker sends the exact canonical slug via
    // `subFolder`. Prefer it: display labels like "Settings & Permissions"
    // slugify to "settings-permissions", missing the canonical "-and-".
    const slug = (modMatch && subFolder && CANONICAL_SUBFOLDERS.has(subFolder))
      ? subFolder
      : cleanLabel.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
    if (!isValidSlug(slug)) {
      return res.status(400).json({ error: 'The folder name must contain at least one letter or number.' });
    }
    const dirAbs = path.join(parentAbs, slug);
    if (fsSync.existsSync(dirAbs)) {
      return res.status(409).json({ error: `A folder called "${cleanLabel}" already exists here.` });
    }

    const readCat = (abs) => {
      try { return JSON.parse(fsSync.readFileSync(path.join(abs, '_category_.json'), 'utf8')); } catch { return null; }
    };
    let maxPos = 0;
    for (const entry of fsSync.readdirSync(parentAbs, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const sib = readCat(path.join(parentAbs, entry.name));
      if (typeof sib?.position === 'number' && sib.position > maxPos) maxPos = sib.position;
    }

    let roles;
    let catRel;
    if (modMatch) {
      const moduleSlug = modMatch[1];
      // Modules use a fixed set of canonical folders - reject custom names so
      // the tree stays uniform and audit-gates.js stays clean. (Sections, the
      // isSection branch below, are unaffected and may have custom folders.)
      if (!CANONICAL_SUBFOLDERS.has(slug)) {
        return res.status(400).json({
          error: `Modules use a fixed set of folders and "${cleanLabel}" isn't one of them. Choose a standard folder: ${CANONICAL_SUBFOLDER_LIST}.`,
        });
      }
      // Canonical name: the gate audit demands the exact template gate -
      // reuse the canonical scaffolder (template roles + module privilege).
      if (!ensureSubfolderCategory(moduleSlug, slug)) {
        return res.status(400).json({ error: 'Could not create the standard folder - check the module setup.' });
      }
      roles = (SUBFOLDER_TEMPLATE.find((s) => s.slug === slug)?.roles) || ALL_ROLES;
      catRel = `docs/modules/${moduleSlug}/${slug}/_category_.json`;
      // ensureSubfolderCategory wrote + created; journal it for durability.
      journalRecordUpsert(catRel, req.user?.email);
    } else {
      // Section folder: inherit the section's audience.
      const sectionCat = readCat(parentAbs);
      roles = (Array.isArray(sectionCat?.customProps?.roles) && sectionCat.customProps.roles.length > 0)
        ? sectionCat.customProps.roles
        : ALL_ROLES;
      fsSync.mkdirSync(dirAbs, { recursive: true });
      const category = {
        label: cleanLabel,
        position: maxPos + 1,
        collapsible: true,
        collapsed: true,
        customProps: { roles },
      };
      catRel = `${norm}/${slug}/_category_.json`;
      fsSync.writeFileSync(path.join(dirAbs, '_category_.json'), JSON.stringify(category, null, 2) + '\n', 'utf8');
      journalRecordUpsert(catRel, req.user?.email);
    }

    console.log(`[authoring] created folder ${norm}/${slug} (roles: ${roles.join(',')})`);
    res.json({ ok: true, dir: `${norm}/${slug}`, label: cleanLabel, roles });
  } catch (error) {
    console.error('❌ authoring/folders failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/** The full location tree authors can browse / move into: every docs section
 *  (with its sub-folders) plus every module x canonical sub-folder. Labels
 *  come from _category_.json when present, else Title-Cased dirnames. */
app.get('/api/admin/authoring/sections', requireRole('superadmin'), (req, res) => {
  try {
    const titleCase = (s) => s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const categoryMeta = (dirAbs) => {
      try {
        const cat = JSON.parse(fsSync.readFileSync(path.join(dirAbs, '_category_.json'), 'utf8'));
        const roles = Array.isArray(cat?.customProps?.roles) && cat.customProps.roles.length > 0
          ? cat.customProps.roles
          : null;
        return { label: cat.label || null, position: typeof cat.position === 'number' ? cat.position : null, roles };
      } catch { return { label: null, position: null, roles: null }; }
    };

    const sections = [];
    for (const entry of fsSync.readdirSync(DOCS_ROOT, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (entry.name === 'internal' || entry.name === 'path' || entry.name === 'modules') continue;
      const secAbs = path.join(DOCS_ROOT, entry.name);
      const meta = categoryMeta(secAbs);
      // Audience defaults for the wizard: the folder's own gate roles, then
      // the section's, then everyone. Never empty.
      const sectionRoles = meta.roles || ALL_ROLES;
      const subs = [];
      let hasRootArticles = false;
      for (const child of fsSync.readdirSync(secAbs, { withFileTypes: true })) {
        if (child.isFile() && /\.(md|mdx)$/.test(child.name)) hasRootArticles = true;
        if (child.isDirectory()) {
          const subAbs = path.join(secAbs, child.name);
          const subMeta = categoryMeta(subAbs);
          subs.push({
            dir: `docs/${entry.name}/${child.name}`,
            label: subMeta.label || titleCase(child.name),
            roles: subMeta.roles || sectionRoles,
          });
        }
      }
      subs.sort((a, b) => a.label.localeCompare(b.label));
      sections.push({
        dir: `docs/${entry.name}`,
        label: meta.label || titleCase(entry.name),
        position: meta.position ?? 99,
        kind: 'section',
        allowRoot: hasRootArticles,
        roles: sectionRoles,
        subs,
      });
    }
    sections.sort((a, b) => (a.position - b.position) || a.label.localeCompare(b.label));

    const modules = modulesFromOverviews(loadOverviews())
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((m) => {
        // `exists` distinguishes a leaf that's really there from one this
        // module simply hasn't started yet. All nine are offered either way
        // (that's the canonical template), but the wizard has to know: picking
        // an absent one used to 400 with "Folder not found" at Generate, after
        // the author had already typed their brain dump, with no way back.
        const subs = SUBFOLDER_TEMPLATE.map((sf) => ({
          dir: `docs/modules/${m.slug}/${sf.slug}`,
          label: sf.label,
          roles: sf.roles,
          exists: fsSync.existsSync(path.join(MODULES_ROOT, m.slug, sf.slug)),
        }));
        // Author-created custom folders (non-canonical, on disk) join the
        // canonical nine, with their own gate's label and roles.
        const modAbs = path.join(MODULES_ROOT, m.slug);
        if (fsSync.existsSync(modAbs)) {
          for (const child of fsSync.readdirSync(modAbs, { withFileTypes: true })) {
            if (!child.isDirectory() || CANONICAL_SUBFOLDERS.has(child.name)) continue;
            const meta = categoryMeta(path.join(modAbs, child.name));
            subs.push({
              dir: `docs/modules/${m.slug}/${child.name}`,
              label: meta.label || titleCase(child.name),
              roles: meta.roles || ALL_ROLES,
            });
          }
        }
        return {
          dir: `docs/modules/${m.slug}`,
          label: m.label,
          position: 999,
          kind: 'module',
          allowRoot: false,
          roles: ALL_ROLES,
          subs,
        };
      });

    res.json({ sections: [...sections, ...modules] });
  } catch (error) {
    console.error('❌ authoring/sections failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// Authoring stats - activity dashboard for author managers.
// ─────────────────────────────────────────────────────────────────────────
// "How many articles were generated in the last 7 days?" and friends.
// Publish history comes from the publish branch's bot commits (message
// prefix "publish: ") - that survives container restarts and is the
// ground truth for what actually went live. Current-state numbers
// (drafts, totals) come from the docs/ tree on disk. GitHub results are
// cached for 10 minutes per window; a GitHub outage degrades to
// disk-only stats instead of failing the endpoint.
const STATS_CACHE_TTL_MS = 10 * 60 * 1000;
// GitHub-degraded payloads get a short TTL: still cached (so an outage can't
// trigger a disk-walk + 30s-timeout storm on every request), but retried soon.
const STATS_DEGRADED_TTL_MS = 60 * 1000;
const statsCache = new Map();    // days → {ts, payload}
const statsInFlight = new Map(); // days → Promise<payload>, dedupes concurrent recomputes
const statsTtl = (payload) => (payload.github ? STATS_CACHE_TTL_MS : STATS_DEGRADED_TTL_MS);

async function computeAuthoringStats(days) {
    const titleCase = (s) => s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const sinceIso = new Date(Date.now() - days * 86400000).toISOString();

    // ── Current state from disk ──
    let totalArticles = 0;
    let totalDrafts = 0;
    const draftsTouchedInWindow = [];
    const sinceDate = sinceIso.slice(0, 10);
    function walkDisk(dir) {
      for (const entry of fsSync.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) walkDisk(p);
        else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
          totalArticles += 1;
          const text = fsSync.readFileSync(p, 'utf8');
          if (/^draft:\s*true\b/m.test(text)) {
            totalDrafts += 1;
            const d = /^\s*date:\s*(\S+)/m.exec(text);
            if (d && d[1] >= sinceDate) {
              const t = /^title:\s*["']?(.+?)["']?\s*$/m.exec(text);
              const au = /^\s*author:\s*["']?(.+?)["']?\s*$/m.exec(text);
              draftsTouchedInWindow.push({
                path: path.relative(__dirname, p),
                title: t ? t[1] : entry.name,
                author: au ? au[1] : null,
                date: d[1],
              });
            }
          }
        }
      }
    }
    for (const entry of fsSync.readdirSync(DOCS_ROOT, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (entry.name === 'internal' || entry.name === 'path') continue;
      walkDisk(path.join(DOCS_ROOT, entry.name));
    }

    // ── Publish history from the publish branch ──
    let github = true;
    let githubError = null;
    const perDay = new Map();      // YYYY-MM-DD → {created, updated}
    const createdRels = new Map(); // rel → first commit date
    const updatedRels = new Map();
    const deletedRels = new Set();
    let imagesAdded = 0;
    const deployBatches = [];
    try {
      const listResp = await ghGet(
        `/commits?sha=${GIT_PUBLISH_BRANCH}&since=${encodeURIComponent(sinceIso)}&per_page=100`
      );
      const publishCommits = (listResp.data || [])
        .filter((c) => /^publish: /.test(c.commit?.message || ''))
        .slice(0, 60); // hard cap on per-commit detail fetches
      // Oldest first so "created then edited later" attributes correctly.
      publishCommits.reverse();
      // Fetch commit details in parallel batches - done sequentially this
      // was ~0.5s per commit and dominated first-load latency (20+ commits
      // in a busy week meant a 10-15s wait for the dashboard).
      const detailBySha = new Map();
      const DETAIL_BATCH = 6;
      for (let i = 0; i < publishCommits.length; i += DETAIL_BATCH) {
        const chunk = publishCommits.slice(i, i + DETAIL_BATCH);
        const resolved = await Promise.all(chunk.map((c) => ghGet(`/commits/${c.sha}`)));
        chunk.forEach((c, j) => detailBySha.set(c.sha, resolved[j]));
      }
      for (const c of publishCommits) {
        const detail = detailBySha.get(c.sha);
        const date = (c.commit.committer?.date || c.commit.author?.date || '').slice(0, 10);
        if (!perDay.has(date)) perDay.set(date, { created: 0, updated: 0 });
        const day = perDay.get(date);
        const batch = { sha: c.sha.slice(0, 7), date, created: 0, updated: 0, deleted: 0, images: 0 };
        for (const f of detail.data.files || []) {
          const rel = f.filename;
          if (/^static\/img\/helpscout\/authored\//.test(rel) && f.status === 'added') {
            imagesAdded += 1;
            batch.images += 1;
          }
          if (!/^docs\/.+\.(md|mdx)$/i.test(rel)) continue;
          if (f.status === 'added') {
            createdRels.set(rel, date);
            day.created += 1;
            batch.created += 1;
          } else if (f.status === 'removed') {
            deletedRels.add(rel);
            batch.deleted += 1;
          } else {
            // modified / renamed. A file created earlier in this window
            // counts as created, not double-counted as an update.
            if (!createdRels.has(rel)) {
              updatedRels.set(rel, date);
              day.updated += 1;
              batch.updated += 1;
            }
          }
        }
        deployBatches.push(batch);
      }
      deployBatches.reverse(); // newest first for display
    } catch (e) {
      github = false;
      githubError = e.response?.status ? `GitHub API error ${e.response.status}` : e.message;
      console.error('❌ authoring/stats GitHub fetch failed:', githubError);
    }

    // ── Attribution: author + title from current disk frontmatter ──
    const overviews = loadOverviews();
    const sectionLabel = (rel) => {
      const parts = rel.split('/');
      if (parts[1] === 'modules' && parts[2]) {
        return overviews.modules?.[parts[2]]?.label || titleCase(parts[2]);
      }
      const secAbs = path.join(DOCS_ROOT, parts[1] || '');
      try {
        const cat = JSON.parse(fsSync.readFileSync(path.join(secAbs, '_category_.json'), 'utf8'));
        if (cat.label) return cat.label;
      } catch {/* fall through */}
      return titleCase(parts[1] || 'unknown');
    };
    const describe = (rel, date) => {
      const abs = path.join(__dirname, rel);
      let title = path.basename(rel).replace(/\.(md|mdx)$/, '');
      let author = null;
      try {
        const text = fsSync.readFileSync(abs, 'utf8');
        const t = /^title:\s*["']?(.+?)["']?\s*$/m.exec(text);
        const au = /^\s*author:\s*["']?(.+?)["']?\s*$/m.exec(text);
        if (t) title = t[1];
        if (au) author = au[1];
      } catch {/* deleted or moved since - keep basename */}
      return { path: rel, title, author, section: sectionLabel(rel), date };
    };
    const createdList = [...createdRels].map(([rel, date]) => describe(rel, date));
    const updatedList = [...updatedRels].map(([rel, date]) => describe(rel, date));

    const perAuthor = new Map();
    for (const a of createdList) {
      const key = a.author || 'Unknown';
      if (!perAuthor.has(key)) perAuthor.set(key, { author: key, created: 0, updated: 0 });
      perAuthor.get(key).created += 1;
    }
    for (const a of updatedList) {
      const key = a.author || 'Unknown';
      if (!perAuthor.has(key)) perAuthor.set(key, { author: key, created: 0, updated: 0 });
      perAuthor.get(key).updated += 1;
    }
    const perSection = new Map();
    for (const a of createdList) {
      if (!perSection.has(a.section)) perSection.set(a.section, { section: a.section, created: 0, updated: 0 });
      perSection.get(a.section).created += 1;
    }
    for (const a of updatedList) {
      if (!perSection.has(a.section)) perSection.set(a.section, { section: a.section, created: 0, updated: 0 });
      perSection.get(a.section).updated += 1;
    }

    // Fill every day in the window so the chart has a continuous axis.
    const perDayFilled = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      const v = perDay.get(d) || { created: 0, updated: 0 };
      perDayFilled.push({ date: d, created: v.created, updated: v.updated });
    }

    const payload = {
      days,
      generatedAt: new Date().toISOString(),
      github,
      githubError,
      totals: {
        articles: totalArticles,
        published: totalArticles - totalDrafts,
        drafts: totalDrafts,
      },
      window: {
        created: createdRels.size,
        updated: updatedRels.size,
        deleted: deletedRels.size,
        imagesAdded,
        deploys: deployBatches.length,
        perDay: perDayFilled,
        perAuthor: [...perAuthor.values()].sort((a, b) => (b.created + b.updated) - (a.created + a.updated)),
        perSection: [...perSection.values()].sort((a, b) => (b.created + b.updated) - (a.created + a.updated)),
        createdArticles: createdList.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50),
        draftsInProgress: draftsTouchedInWindow.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50),
        deployBatches: deployBatches.slice(0, 30),
      },
      queue: {
        size: deployQueue.size,
        lastDeployTs,
      },
    };
    return payload;
}

app.get('/api/admin/authoring/stats', requireRole('superadmin'), async (req, res) => {
  try {
    const days = Math.min(90, Math.max(1, parseInt(req.query.days, 10) || 7));
    const cached = statsCache.get(days);
    if (cached && Date.now() - cached.ts < statsTtl(cached.payload)) {
      return res.json(cached.payload);
    }
    // One recompute per window at a time - a second visitor while a
    // recompute is running awaits the same promise instead of doubling
    // the GitHub traffic.
    const kick = () => {
      let p = statsInFlight.get(days);
      if (!p) {
        p = computeAuthoringStats(days)
          .then((payload) => {
            statsCache.set(days, { ts: Date.now(), payload });
            return payload;
          })
          .finally(() => statsInFlight.delete(days));
        statsInFlight.set(days, p);
      }
      return p;
    };
    if (cached) {
      // Stale-while-refresh: serve the expired copy instantly and rebuild
      // in the background, so only the very first visitor ever waits.
      kick().catch((e) => console.warn('[stats] background refresh failed:', e.message));
      return res.json({ ...cached.payload, stale: true });
    }
    res.json(await kick());
  } catch (error) {
    console.error('❌ authoring/stats failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/authoring/modules', requireRole('superadmin'), (req, res) => {
  try {
    const { slug, label, anyPrivilege, description } = req.body || {};
    let { privilege } = req.body || {};
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
    let privilegeCorrected = null;
    if (privilege && typeof privilege === 'string' && privilege.trim()) {
      const privDoc = loadKnownPrivileges();
      const list = privDoc.privileges || [];
      // LMS privilege keys are camelCase and authors type them by hand.
      // A case-insensitive match against the known list is a typo for the
      // canonical key, not a new privilege - "authoringtools" once minted
      // a novel key beside the real "authoringTools" and gated a whole
      // module on a privilege no org has.
      const canonical = list.find((k) => k.toLowerCase() === privilege.toLowerCase());
      if (canonical && canonical !== privilege) {
        privilegeCorrected = { from: privilege, to: canonical };
        privilege = canonical;
        console.log(`[authoring] privilege key auto-corrected: "${privilegeCorrected.from}" → "${canonical}"`);
      }
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

    // These two files must ship with the module's gates: the repo's
    // prebuild validates every _category_.json privilege key against
    // data/known-privileges.json, and the module landing reads
    // static/module-overviews.json. The journal alone made them durable
    // but never put them in the deploy queue, so the first publish from
    // a new module hard-failed CI on the unknown privilege key.
    if (privilegeAdded) enqueueUpsert('data/known-privileges.json');
    enqueueUpsert('static/module-overviews.json');
    // ...and so must the skeleton itself. writeModuleSkeleton journals the
    // module-root _category_.json + index.mdx, but journaling only makes them
    // survive a restart - it doesn't ship them. /publish carries the article
    // and its SUB-folder gate only, so the first publish from a new module
    // used to leave /modules/<slug> a 404 on the live site while the tile in
    // module-overviews.json (which did ship) advertised it.
    for (const rel of written) enqueueUpsert(rel);
    persistDeployState();

    res.json({ ok: true, slug, privilegeAdded, novelPrivilege, privilegeCorrected, paths: written });
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

/**
 * Last line of defense against linking a user to a 404.
 *
 * A URL stored in ChromaDB is only as good as the indexer run that wrote it:
 * an article re-slugged, moved, or deleted since then leaves a vector pointing
 * at a route that no longer exists (the original bug: the indexer derived URLs
 * from file paths, so every article whose frontmatter `slug` differed from its
 * filename was cited as a dead link). Rather than trust the stored value, we
 * re-resolve it against the live docs tree, repair it through
 * data/redirects.json when the article simply moved, and return null when
 * nothing resolves - callers then drop the link instead of shipping the 404.
 *
 * A non-empty warn log here means the vector index has drifted from docs/ and
 * `npm run index-internal` is overdue.
 */
function resolveCitationUrl(url, source) {
  if (!url) return null;
  try {
    const index = docRoutes.getRouteIndex(__dirname);
    const live = resolveLiveUrl(url, index);
    if (!live) {
      console.warn(`⚠️  [citations] dropping dead URL ${url}${source ? ` (from ${source})` : ''} - reindex docs/`);
      return null;
    }
    if (live !== url) {
      console.log(`↪️  [citations] repaired ${url} → ${live}`);
    }
    return live;
  } catch (e) {
    // Never let route resolution break search or chat - fall back to the
    // stored value, which is what shipped before this check existed.
    console.error('⚠️  [citations] route resolution failed:', e.message);
    return url;
  }
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

  // Post-boot indexing keeps ChromaDB in sync with the docs the deploy just
  // shipped. But the child process hashes every doc and hammers the shared
  // CPU/disk - launched at boot it starved the authoring endpoints (a
  // 0.3s drafts listing took 25s+ right after every deploy). So: wait out
  // the boot rush, then run the scan at the lowest CPU priority. Set
  // RUN_INDEXER=false to disable entirely (e.g. local dev with no Chroma).
  if (process.env.RUN_INDEXER === 'false') {
    console.log('🗂️  Internal indexer disabled (RUN_INDEXER=false)');
  } else {
    // Short head start only - the indexer is paced (INDEXER_EMBED_DELAY_MS)
    // so it's gentle from the first call; starting early means finishing
    // early. A long delay just moved the work into the minutes when authors
    // reopen the site to check their deploy.
    const INDEXER_DELAY_MS = parseInt(process.env.INDEXER_DELAY_MS, 10) || 15000;
    console.log(`🗂️  Internal indexer scheduled in ${Math.round(INDEXER_DELAY_MS / 1000)}s (incremental)`);
    // Boot runs are ALWAYS incremental: a FORCE_FULL_REINDEX=true left in the
    // service env would re-embed all ~316 docs on every deploy - minutes of
    // sequential OpenAI calls hammering this same process while authors use
    // the site. Manual `npm run index-internal` still honors the flag.
    const indexerEnv = { ...process.env };
    delete indexerEnv.FORCE_FULL_REINDEX;
    setTimeout(() => {
      const indexer = spawn('nice', ['-n', '19', 'node', 'scripts/internal-indexer.js'], {
        stdio: 'inherit',
        env: indexerEnv
      });
      indexer.on('error', (err) => {
        // `nice` missing (some minimal images) - fall back to a plain spawn.
        console.warn(`⚠️ nice unavailable (${err.message}), running indexer at normal priority`);
        spawn('node', ['scripts/internal-indexer.js'], { stdio: 'inherit', env: indexerEnv })
          .on('exit', (code) => {
            console.log(code === 0 ? '✅ Internal indexer completed successfully' : `❌ Internal indexer exited with code ${code}`);
          });
      });
      indexer.on('exit', (code) => {
        if (code === 0) {
          console.log('✅ Internal indexer completed successfully');
        } else if (code !== null) {
          console.error(`❌ Internal indexer exited with code ${code}`);
        }
      });
    }, INDEXER_DELAY_MS);
  }
});

// Graceful shutdown: Railway sends SIGTERM on every redeploy/restart. A save
// made inside the journal's debounce window would otherwise die with the
// container - flush it (best-effort, hard 8s cap so shutdown can't hang).
let shuttingDown = false;
async function gracefulShutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, shutting down`);
  try {
    persistDeployState();
    if (JOURNAL_ENABLED && (journalDirty.size > 0 || journalFlushTimer)) {
      if (journalFlushTimer) { clearTimeout(journalFlushTimer); journalFlushTimer = null; }
      console.log(`[journal] final flush before exit (${journalDirty.size} dirty file(s))`);
      await Promise.race([
        journalChain.then(() => journalFlushOnce()).catch((e) => console.error('[journal] final flush failed:', e.message)),
        new Promise((resolve) => setTimeout(resolve, 8000)),
      ]);
    }
  } catch (e) {
    console.error('shutdown cleanup failed:', e.message);
  }
  process.exit(0);
}
process.on('SIGTERM', () => { gracefulShutdown('SIGTERM'); });
process.on('SIGINT', () => { gracefulShutdown('SIGINT'); });