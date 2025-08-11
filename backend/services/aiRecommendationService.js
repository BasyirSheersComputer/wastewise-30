// AI Recommendation Service with Rate Limiting and Idle Detection
import { logger } from '../utils/logger.js';

class AIRecommendationService {
  constructor() {
    this.cache = new Map();
    this.lastCallTime = new Map();
    this.activeConnections = new Set();
    this.idleTimer = null;
    this.isIdle = false;
    
    // Rate limiting configuration
    this.rateLimit = {
      maxCalls: 10, // Maximum calls per hour
      windowMs: 60 * 60 * 1000, // 1 hour window
      minIntervalMs: 5 * 60 * 1000, // Minimum 5 minutes between calls
    };
    
    // Idle detection configuration
    this.idleConfig = {
      idleTimeoutMs: 10 * 60 * 1000, // 10 minutes of inactivity
      checkIntervalMs: 60 * 1000, // Check every minute
    };
    
    this.startIdleDetection();
  }

  /**
   * Check if we can make an AI call based on rate limiting
   */
  canMakeAICall(section) {
    const now = Date.now();
    const lastCall = this.lastCallTime.get(section) || 0;
    const timeSinceLastCall = now - lastCall;
    
    // Check minimum interval
    if (timeSinceLastCall < this.rateLimit.minIntervalMs) {
      return false;
    }
    
    // Check hourly limit
    const callsThisHour = Array.from(this.lastCallTime.values())
      .filter(time => now - time < this.rateLimit.windowMs).length;
    
    return callsThisHour < this.rateLimit.maxCalls;
  }

  /**
   * Start idle detection
   */
  startIdleDetection() {
    this.idleTimer = setInterval(() => {
      const now = Date.now();
      const lastActivity = Math.max(...Array.from(this.lastCallTime.values()), 0);
      
      if (now - lastActivity > this.idleConfig.idleTimeoutMs) {
        this.isIdle = true;
        logger.info('AI Recommendation Service is now idle');
      } else {
        this.isIdle = false;
      }
    }, this.idleConfig.checkIntervalMs);
  }

  /**
   * Get cached recommendations or generate new ones
   */
  async getRecommendations(section, provider = 'auto', forceRefresh = false, enableFallback = true) {
    const cacheKey = `${section}_${provider}`;
    const now = Date.now();
    
    // Check cache first (unless force refresh)
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      const cacheAge = now - cached.timestamp;
      
      // Cache is valid for 15 minutes
      if (cacheAge < 15 * 60 * 1000) {
        logger.info(`Returning cached recommendations for ${section}`);
        return cached.data;
      }
    }
    
    // Check if we're idle
    if (this.isIdle) {
      logger.info(`AI service is idle, returning cached data for ${section}`);
      const cached = this.cache.get(cacheKey);
      return cached ? cached.data : this.getDefaultRecommendations(section);
    }
    
    // Check rate limiting
    if (!this.canMakeAICall(section)) {
      logger.info(`Rate limit reached for ${section}, returning cached data`);
      const cached = this.cache.get(cacheKey);
      return cached ? cached.data : this.getDefaultRecommendations(section);
    }
    
    // Make AI call with fallback
    try {
      logger.info(`Making AI call for ${section} with provider: ${provider}`);
      this.lastCallTime.set(section, now);
      
      // Import the recommendations function
      const { getRecommendations } = await import('../recommendations.js');
      
      let result;
      let quotaExceeded = false;
      
      try {
        // Always try to get real AI recommendations first
        result = await getRecommendations(section, provider);
        
        // Check if the response indicates quota exceeded or error
        if (result.error && (
          result.error.includes('quota') || 
          result.error.includes('rate limit') || 
          result.error.includes('billing') ||
          result.error.includes('quota exceeded') ||
          result.error.includes('API_KEY') ||
          result.error.includes('not set')
        )) {
          quotaExceeded = true;
          logger.warn(`Quota exceeded or API key issue for ${provider}, attempting fallback`);
        }
        
        // Check if recommendations are actually AI-generated (not default)
        if (result.recommendations && (
          result.recommendations.includes('Unable to generate') ||
          result.recommendations.includes('temporarily unavailable') ||
          result.recommendations.includes('default')
        )) {
          quotaExceeded = true;
          logger.warn(`Default recommendations returned for ${provider}, attempting fallback`);
        }
        
      } catch (error) {
        // Check if error is quota-related or API key related
        if (error.message && (
          error.message.includes('quota') || 
          error.message.includes('rate limit') || 
          error.message.includes('billing') ||
          error.message.includes('quota exceeded') ||
          error.message.includes('API_KEY') ||
          error.message.includes('not set')
        )) {
          quotaExceeded = true;
          logger.warn(`Quota exceeded or API key issue for ${provider}, attempting fallback`);
        } else {
          throw error;
        }
      }
      
      // If quota exceeded and fallback is enabled, try alternative provider
      if (quotaExceeded && enableFallback) {
        const fallbackProvider = provider === 'gemini' ? 'chatgpt' : 'gemini';
        logger.info(`Attempting fallback to ${fallbackProvider}`);
        
        try {
          result = await getRecommendations(section, fallbackProvider);
          result.provider = fallbackProvider;
          result.fallbackUsed = true;
          result.originalProvider = provider;
          logger.info(`Successfully used fallback provider: ${fallbackProvider}`);
        } catch (fallbackError) {
          logger.error(`Fallback provider ${fallbackProvider} also failed:`, fallbackError);
          result = this.getDefaultRecommendations(section);
          result.quotaExceeded = true;
          result.fallbackFailed = true;
        }
      }
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: now
      });
      
      return result;
    } catch (error) {
      logger.error(`AI call failed for ${section}:`, error);
      
      // Return cached data if available, otherwise default
      const cached = this.cache.get(cacheKey);
      return cached ? cached.data : this.getDefaultRecommendations(section);
    }
  }

  /**
   * Get default recommendations when AI is not available
   */
  getDefaultRecommendations(section) {
    const defaults = {
      dashboard: {
        section: 'dashboard',
        analytics: {},
        recommendations: '📊 **Dashboard Insights**\n\n1. **Recipe Yield Accuracy**: Monitor your 87.5% yield rate\n2. **Waste Reduction**: Focus on reducing 12.3% waste rate\n3. **Staff Training**: Continue 94.2% efficiency training\n4. **COGS Optimization**: Target $2.45 per cup cost\n\n*AI recommendations temporarily unavailable*',
        timestamp: new Date().toISOString(),
        provider: 'default'
      },
      inventory: {
        section: 'inventory',
        analytics: {},
        recommendations: '📦 **Inventory Management**\n\n1. **Stock Levels**: Monitor Arabica beans and milk levels\n2. **Waste Tracking**: Log all waste events with reasons\n3. **Reorder Points**: Set up automated reorder alerts\n4. **Supplier Management**: Review supplier performance\n\n*AI recommendations temporarily unavailable*',
        timestamp: new Date().toISOString(),
        provider: 'default'
      },
      waste: {
        section: 'waste',
        analytics: {},
        recommendations: '🗑️ **Waste Management**\n\n1. **Waste Categories**: Track coffee beans, milk, syrups\n2. **Staff Attribution**: Link waste to specific baristas\n3. **Reason Codes**: Use standardized waste reasons\n4. **Cost Analysis**: Monitor $84.05 weekly waste cost\n\n*AI recommendations temporarily unavailable*',
        timestamp: new Date().toISOString(),
        provider: 'default'
      }
    };
    
    return defaults[section] || defaults.dashboard;
  }

  /**
   * Get recommendations for multiple sections with rate limiting
   */
  async getMultiSectionRecommendations(sections, provider = 'auto') {
    const results = [];
    
    for (const section of sections) {
      const result = await this.getRecommendations(section, provider);
      results.push(result);
      
      // Add small delay between calls to respect rate limits
      if (sections.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Force refresh recommendations (bypasses cache and rate limits)
   */
  async forceRefreshRecommendations(section, provider = 'auto') {
    logger.info(`Force refreshing recommendations for ${section}`);
    return await this.getRecommendations(section, provider, true);
  }

  /**
   * Get service status
   */
  getStatus() {
    const now = Date.now();
    const callsThisHour = Array.from(this.lastCallTime.values())
      .filter(time => now - time < this.rateLimit.windowMs).length;
    
    return {
      isIdle: this.isIdle,
      callsThisHour,
      maxCallsPerHour: this.rateLimit.maxCalls,
      activeConnections: this.activeConnections.size,
      cacheSize: this.cache.size,
      lastCallTimes: Object.fromEntries(this.lastCallTime)
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    logger.info('AI recommendation cache cleared');
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.idleTimer) {
      clearInterval(this.idleTimer);
    }
    this.cache.clear();
    this.activeConnections.clear();
  }
}

// Export singleton instance
export const aiRecommendationService = new AIRecommendationService(); 