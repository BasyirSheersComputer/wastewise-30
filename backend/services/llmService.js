// llmService.js
import { askAI, askAIWithMetadata } from '../ai-service.js';
import logger from '../utils/logger.js';

/**
 * Enhanced LLM service with logging and error handling
 */
export class LLMService {
  constructor() {
    this.defaultProvider = 'auto';
  }

  /**
   * Ask AI with comprehensive logging and error handling
   * @param {string} prompt - The prompt to send to AI
   * @param {string} provider - AI provider ('auto', 'gemini', 'chatgpt')
   * @param {object} options - Additional options
   * @returns {Promise<object>} Response with metadata
   */
  async ask(prompt, provider = this.defaultProvider, options = {}) {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    try {
      logger.aiRequest(provider, prompt, startTime);
      
      const result = await askAIWithMetadata(prompt, provider);
      
      logger.aiResponse(result.provider, result.response, startTime);
      
      return {
        ...result,
        requestId,
        promptLength: prompt.length,
        responseLength: result.response.length
      };
    } catch (error) {
      logger.aiError(provider, error);
      throw error;
    }
  }

  /**
   * Get recommendations for a specific section
   * @param {string} section - The section to get recommendations for
   * @param {string} provider - AI provider
   * @returns {Promise<object>} Recommendations with metadata
   */
  async getRecommendations(section, provider = this.defaultProvider) {
    const prompt = this.buildRecommendationPrompt(section);
    return await this.ask(prompt, provider, { section });
  }

  /**
   * Get multiple recommendations for different sections
   * @param {Array<string>} sections - Array of sections
   * @param {string} provider - AI provider
   * @returns {Promise<Array<object>>} Array of recommendations
   */
  async getMultiRecommendations(sections, provider = this.defaultProvider) {
    const promises = sections.map(section => 
      this.getRecommendations(section, provider)
    );
    
    return await Promise.allSettled(promises);
  }

  /**
   * Build recommendation prompt for a specific section
   * @param {string} section - The section
   * @returns {string} Formatted prompt
   */
  buildRecommendationPrompt(section) {
    const basePrompt = `You are a seasoned F&B cost-control analyst.
Context: We operate 12 outlets and aim to cut food waste by ≥30%.
Section: ${section}

Please provide 3-5 actionable recommendations for ${section} optimization.
Focus on:
1. Cost reduction opportunities
2. Efficiency improvements
3. Risk mitigation
4. Quick wins (7-day impact)

Format your response as a numbered list with specific actions and estimated impact.`;

    return basePrompt;
  }

  /**
   * Generate unique request ID
   * @returns {string} Request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate prompt before sending to AI
   * @param {string} prompt - The prompt to validate
   * @returns {boolean} Whether prompt is valid
   */
  validatePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      return false;
    }
    
    if (prompt.length < 10) {
      return false;
    }
    
    if (prompt.length > 10000) {
      return false;
    }
    
    return true;
  }

  /**
   * Sanitize prompt for AI consumption
   * @param {string} prompt - The prompt to sanitize
   * @returns {string} Sanitized prompt
   */
  sanitizePrompt(prompt) {
    return prompt
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s\-.,!?;:()]/g, ''); // Remove special characters except basic punctuation
  }

  /**
   * Rate limiting for AI requests
   * @param {string} userId - User ID for rate limiting
   * @returns {boolean} Whether request is allowed
   */
  isRateLimited(userId) {
    // Simple in-memory rate limiting
    // In production, use Redis or similar
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 10; // Max 10 requests per minute
    
    if (!this.requestCounts) {
      this.requestCounts = new Map();
    }
    
    if (!this.requestCounts.has(userId)) {
      this.requestCounts.set(userId, []);
    }
    
    const userRequests = this.requestCounts.get(userId);
    const recentRequests = userRequests.filter(timestamp => timestamp > now - windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return true;
    }
    
    recentRequests.push(now);
    this.requestCounts.set(userId, recentRequests);
    
    return false;
  }

  /**
   * Get AI service status
   * @returns {object} Status information
   */
  getStatus() {
    return {
      defaultProvider: this.defaultProvider,
      availableProviders: ['gemini', 'chatgpt', 'auto'],
      rateLimitEnabled: true,
      maxRequestsPerMinute: 10
    };
  }
}

// Export singleton instance
export const llmService = new LLMService();
export default llmService;
