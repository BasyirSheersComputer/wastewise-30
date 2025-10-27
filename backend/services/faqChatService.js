/**
 * FAQ Chat Service
 * Handles keyword-based FAQ queries and natural chat flow
 * Escalates to customer rep when user is not satisfied
 */

import logger from '../utils/logger.js';
import llmService from './llmService.js';

export class FAQChatService {
  constructor(config = {}) {
    this.supabase = config.supabase || null;
    this.useLLM = config.useLLM !== false; // Use LLM for natural responses
    this.minConfidence = config.minConfidence || 0.3; // Minimum confidence for FAQ match
    this.escalationThreshold = config.escalationThreshold || 2; // Failed attempts before escalation
  }

  /**
   * Process user message and return FAQ response
   */
  async processMessage(sessionId, userId, message) {
    try {
      // Extract keywords from message
      const keywords = this._extractKeywords(message);
      
      // Search FAQ database
      const faqResults = await this._searchFAQ(keywords);
      
      // Select best match
      const bestMatch = this._selectBestMatch(faqResults, keywords);
      
      // Generate natural response
      const response = await this._generateResponse(message, bestMatch, faqResults);
      
      // Track conversation
      await this._trackMessage(sessionId, userId, message, 'user');
      await this._trackMessage(sessionId, userId, response.text, 'bot', {
        faq_article_id: bestMatch?.id,
        suggested_articles: faqResults.slice(0, 3).map(f => f.id)
      });
      
      return {
        success: true,
        response: response.text,
        faq_article: bestMatch ? {
          id: bestMatch.id,
          title: bestMatch.title,
          category: bestMatch.category
        } : null,
        suggested_articles: faqResults.slice(0, 3).map(f => ({
          id: f.id,
          title: f.title
        })),
        confidence: bestMatch?.confidence || 0,
        should_escalate: response.shouldEscalate || false
      };
    } catch (error) {
      logger.error('FAQ chat processing failed:', error);
      throw error;
    }
  }

  /**
   * Extract keywords from message
   */
  _extractKeywords(message) {
    // Convert to lowercase and split
    const words = message.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2); // Filter short words
    
    // Remove common stop words
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what',
      'how', 'when', 'where', 'why', 'who', 'which', 'who', 'my', 'your',
      'his', 'her', 'its', 'our', 'their', 'me', 'him', 'us', 'them'
    ]);
    
    return words.filter(w => !stopWords.has(w));
  }

  /**
   * Search FAQ database using keywords
   */
  async _searchFAQ(keywords) {
    if (!this.supabase || keywords.length === 0) {
      return [];
    }

    try {
      // Search in keywords array and title/content
      const keywordQuery = keywords.join(' | ');
      
      // Get articles matching keywords
      const { data: articles, error } = await this.supabase
        .from('faq_articles')
        .select(`
          *,
          faq_categories(name)
        `)
        .eq('is_active', true)
        .or(`keywords.cs.{${keywords.join(',')}},title.ilike.%${keywords[0]}%,content.ilike.%${keywords[0]}%`)
        .limit(10);

      if (error) throw error;

      // Calculate relevance scores
      const scoredArticles = articles.map(article => {
        const score = this._calculateRelevanceScore(article, keywords);
        return {
          ...article,
          confidence: score,
          category: article.faq_categories?.name || 'General'
        };
      });

      // Sort by confidence
      return scoredArticles.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      logger.error('FAQ search failed:', error);
      return [];
    }
  }

  /**
   * Calculate relevance score for FAQ article
   */
  _calculateRelevanceScore(article, keywords) {
    let score = 0;
    const articleKeywords = (article.keywords || []).map(k => k.toLowerCase());
    const articleText = `${article.title} ${article.content}`.toLowerCase();
    
    // Check keyword matches
    keywords.forEach(keyword => {
      if (articleKeywords.includes(keyword)) {
        score += 0.3; // Direct keyword match
      }
      if (articleText.includes(keyword)) {
        score += 0.1; // Text contains keyword
      }
    });
    
    // Boost by priority
    score += (article.priority || 0) * 0.1;
    
    // Normalize to 0-1
    return Math.min(score, 1.0);
  }

  /**
   * Select best FAQ match
   */
  _selectBestMatch(faqResults, keywords) {
    if (faqResults.length === 0) return null;
    
    const bestMatch = faqResults[0];
    
    // Only return if confidence is above threshold
    if (bestMatch.confidence >= this.minConfidence) {
      return bestMatch;
    }
    
    return null;
  }

  /**
   * Generate natural response
   */
  async _generateResponse(userMessage, bestMatch, allResults) {
    if (bestMatch) {
      // Use LLM to make response more natural
      if (this.useLLM) {
        try {
          const prompt = `User asked: "${userMessage}"
          
FAQ Article:
Title: ${bestMatch.title}
Content: ${bestMatch.content}

Generate a natural, conversational response that answers the user's question based on the FAQ article. Be helpful and friendly. Keep it concise (2-3 sentences).`;

          const llmResponse = await llmService.getRecommendation(prompt);
          return {
            text: llmResponse || bestMatch.content,
            shouldEscalate: false
          };
        } catch (error) {
          logger.warn('LLM response generation failed, using direct FAQ content');
        }
      }
      
      // Direct FAQ response
      return {
        text: bestMatch.content,
        shouldEscalate: false
      };
    }
    
    // No good match found
    if (allResults.length > 0) {
      return {
        text: `I found some related articles that might help:\n\n${allResults.slice(0, 3).map((r, i) => `${i + 1}. ${r.title}`).join('\n')}\n\nWould you like to know more about any of these? If not, I can connect you with a customer representative.`,
        shouldEscalate: true
      };
    }
    
    // No results at all
    return {
      text: `I'm sorry, I couldn't find a specific answer to your question. Would you like me to connect you with a customer representative who can help you further?`,
      shouldEscalate: true
    };
  }

  /**
   * Check if should escalate based on conversation history
   */
  async shouldEscalate(sessionId) {
    if (!this.supabase) return false;

    try {
      // Get recent messages in session
      const { data: messages, error } = await this.supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('sender', 'user')
        .order('created_at', { ascending: false })
        .limit(this.escalationThreshold + 1);

      if (error) throw error;

      // Count unsatisfied responses
      const recentUnsatisfied = messages.filter(m => 
        m.is_satisfied === false || m.message.toLowerCase().includes('not helpful') || 
        m.message.toLowerCase().includes('didn\'t help') || m.message.toLowerCase().includes('still have')
      ).length;

      return recentUnsatisfied >= this.escalationThreshold;
    } catch (error) {
      logger.error('Escalation check failed:', error);
      return false;
    }
  }

  /**
   * Escalate to customer rep
   */
  async escalateToRep(sessionId, userId, reason) {
    if (!this.supabase) {
      return {
        success: true,
        escalated: true,
        contact_info: {
          email: 'support@wastewise.ai',
          phone: '+60 3-XXXX XXXX',
          message: 'A customer representative will contact you shortly.'
        }
      };
    }

    try {
      // Create escalation record
      const { data: escalation, error } = await this.supabase
        .from('chat_escalations')
        .insert({
          session_id: sessionId,
          user_id: userId,
          reason: reason,
          priority: 'normal',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Update session status
      await this.supabase
        .from('chat_sessions')
        .update({
          status: 'escalated',
          escalated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      // Track escalation message
      await this._trackMessage(sessionId, userId, 
        'Your request has been escalated to our customer support team. They will contact you shortly.', 
        'bot', 
        { message_type: 'escalation' }
      );

      return {
        success: true,
        escalated: true,
        escalation_id: escalation.id,
        contact_info: {
          email: 'support@wastewise.ai',
          phone: '+60 3-XXXX XXXX',
          message: 'A customer representative will contact you within 24 hours.'
        }
      };
    } catch (error) {
      logger.error('Escalation failed:', error);
      throw error;
    }
  }

  /**
   * Track message in database
   */
  async _trackMessage(sessionId, userId, message, sender, metadata = {}) {
    if (!this.supabase) return;

    try {
      await this.supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          user_id: userId,
          message: message,
          sender: sender,
          message_type: metadata.message_type || (sender === 'bot' ? 'faq_response' : 'text'),
          faq_article_id: metadata.faq_article_id,
          suggested_articles: metadata.suggested_articles,
          metadata: metadata
        });
    } catch (error) {
      logger.error('Message tracking failed:', error);
    }
  }

  /**
   * Record user satisfaction
   */
  async recordSatisfaction(messageId, isSatisfied) {
    if (!this.supabase) return { success: true };

    try {
      await this.supabase
        .from('chat_messages')
        .update({ is_satisfied: isSatisfied })
        .eq('id', messageId);

      // Update FAQ article helpful count
      const { data: message } = await this.supabase
        .from('chat_messages')
        .select('faq_article_id')
        .eq('id', messageId)
        .single();

      if (message?.faq_article_id) {
        const field = isSatisfied ? 'helpful_count' : 'not_helpful_count';
        await this.supabase.rpc('increment', {
          table_name: 'faq_articles',
          id: message.faq_article_id,
          field: field
        });
      }

      return { success: true };
    } catch (error) {
      logger.error('Satisfaction recording failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default FAQChatService;

