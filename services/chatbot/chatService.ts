import OpenAI from 'openai';
import { VectorService, SearchResult } from './vectorService.js';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  citations?: Citation[];
}

export interface Citation {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface ChatResponse {
  message: string;
  citations: Citation[];
  relatedLinks: RelatedLink[];
  confidence: number;
}

export interface RelatedLink {
  title: string;
  url: string;
  description: string;
}

export interface UserContext {
  userId?: string;
  role?: 'admin' | 'manager' | 'user' | 'viewer';
  email?: string;
  name?: string;
}

export class ChatService {
  private openai: OpenAI;
  private vectorService: VectorService;

  constructor(openaiApiKey: string, vectorService: VectorService) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.vectorService = vectorService;
  }

  async generateResponse(
    question: string,
    userContext: UserContext = {},
    conversationHistory: ChatMessage[] = []
  ): Promise<ChatResponse> {
    try {
      // 1. Search for relevant documentation
      const searchResults = await this.vectorService.searchSimilar(
        question,
        5,
        this.buildSearchFilters(userContext)
      );

      // 2. Build context from search results
      const context = this.buildContextFromResults(searchResults);
      
      // 3. Create system prompt
      const systemPrompt = this.buildSystemPrompt(userContext);
      
      // 4. Build conversation messages
      const messages = this.buildConversationMessages(
        systemPrompt,
        question,
        context,
        conversationHistory
      );

      // 5. Get AI response
      const completion = await this.openai.chat.completions.create({
        model: process.env.CHAT_MODEL || 'gpt-4o-mini',
        messages,
        temperature: 0.3,
        max_tokens: 800,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const aiResponse = completion.choices[0]?.message?.content || 
        'I apologize, but I couldn\'t generate a response. Please try rephrasing your question.';

      // 6. Extract citations and build response
      const citations = this.buildCitations(searchResults);
      const relatedLinks = this.buildRelatedLinks(searchResults);
      const confidence = this.calculateConfidence(searchResults, aiResponse);

      return {
        message: aiResponse,
        citations,
        relatedLinks,
        confidence
      };

    } catch (error) {
      console.error('❌ Failed to generate chat response:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }

  private buildSearchFilters(userContext: UserContext): Record<string, any> | undefined {
    // For now, no role-based filtering since auth isn't implemented yet
    // This will be expanded when authentication is added
    return undefined;
  }

  private buildContextFromResults(results: SearchResult[]): string {
    if (results.length === 0) {
      return 'No specific documentation found for this query.';
    }

    let context = 'Here is the relevant documentation to help answer the user\'s question:\n\n';
    
    results.forEach((result, index) => {
      context += `[Document ${index + 1}: ${result.metadata.title}]\n`;
      context += `${result.content}\n`;
      context += `Source: ${result.metadata.url}\n\n`;
    });

    return context;
  }

  private buildSystemPrompt(userContext: UserContext): string {
    const role = userContext.role || 'user';
    const userName = userContext.name || 'there';

    return `You are the SmartWinnr Help Assistant, a knowledgeable and helpful AI assistant specialized in SmartWinnr documentation and features.

Your role:
- You help ${role} level users with SmartWinnr platform questions
- Always provide accurate, helpful information based on the documentation provided
- Include specific citations with links when referencing documentation
- Be concise but comprehensive in your responses
- If you don't know something, admit it rather than guessing

Guidelines:
1. Always base your answers on the provided documentation context
2. Include relevant citations with [links] for users to read more
3. Provide step-by-step instructions when appropriate
4. Suggest related features or documentation when helpful
5. Be friendly and professional in tone
6. If the question is outside SmartWinnr scope, politely redirect to SmartWinnr documentation

User context: You're helping ${userName} (${role} level access)`;
  }

  private buildConversationMessages(
    systemPrompt: string,
    question: string,
    context: string,
    history: ChatMessage[]
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Add recent conversation history (last 5 messages to keep context manageable)
    const recentHistory = history.slice(-5);
    recentHistory.forEach(msg => {
      if (msg.role !== 'system') {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        });
      }
    });

    // Add current question with context
    const userMessage = `Context:\n${context}\n\nUser Question: ${question}`;
    messages.push({ role: 'user', content: userMessage });

    return messages;
  }

  private buildCitations(searchResults: SearchResult[]): Citation[] {
    return searchResults
      .filter(result => result.similarity > 0.7) // Only include high-confidence results
      .slice(0, 3) // Limit to top 3 citations
      .map(result => ({
        title: result.metadata.title,
        url: result.metadata.url,
        snippet: this.extractSnippet(result.content),
        source: result.metadata.source
      }));
  }

  private buildRelatedLinks(searchResults: SearchResult[]): RelatedLink[] {
    const uniqueUrls = new Set<string>();
    const relatedLinks: RelatedLink[] = [];

    searchResults.forEach(result => {
      if (!uniqueUrls.has(result.metadata.url) && result.similarity > 0.6) {
        uniqueUrls.add(result.metadata.url);
        relatedLinks.push({
          title: result.metadata.title,
          url: result.metadata.url,
          description: this.extractSnippet(result.content, 100)
        });
      }
    });

    return relatedLinks.slice(0, 4);
  }

  private extractSnippet(content: string, maxLength: number = 150): string {
    // Remove markdown headers and formatting
    const cleaned = content
      .replace(/^#+\s*/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .trim();

    if (cleaned.length <= maxLength) {
      return cleaned;
    }

    // Find a good breaking point
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    const breakPoint = lastSpace > maxLength * 0.7 ? lastSpace : maxLength;

    return truncated.substring(0, breakPoint) + '...';
  }

  private calculateConfidence(searchResults: SearchResult[], response: string): number {
    if (searchResults.length === 0) return 0.1;

    // Base confidence on similarity scores of search results
    const avgSimilarity = searchResults.reduce((sum, result) => sum + result.similarity, 0) / searchResults.length;
    
    // Boost confidence if we have multiple good results
    const goodResults = searchResults.filter(r => r.similarity > 0.7).length;
    const confidenceBoost = Math.min(goodResults * 0.1, 0.3);

    // Reduce confidence if response seems generic
    const genericPhrases = ['I don\'t know', 'not sure', 'might be', 'possibly'];
    const hasGenericLanguage = genericPhrases.some(phrase => 
      response.toLowerCase().includes(phrase.toLowerCase())
    );

    let confidence = avgSimilarity + confidenceBoost;
    if (hasGenericLanguage) {
      confidence *= 0.7;
    }

    return Math.max(0.1, Math.min(0.95, confidence));
  }

  async getConversationSummary(messages: ChatMessage[]): Promise<string> {
    if (messages.length === 0) return 'No conversation history';

    const conversation = messages
      .filter(m => m.role !== 'system')
      .slice(-10) // Last 10 messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Summarize this SmartWinnr help conversation in 1-2 sentences, focusing on the main topics discussed.'
          },
          {
            role: 'user',
            content: `Conversation:\n${conversation}`
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      });

      return completion.choices[0]?.message?.content || 'Conversation about SmartWinnr features';
    } catch (error) {
      console.error('❌ Failed to generate conversation summary:', error);
      return 'Recent SmartWinnr discussion';
    }
  }
}