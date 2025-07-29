// Enhanced AI Service with Data Platform Integration
import { DataPlatformBridge } from './dataPlatformBridge.js';

export class EnhancedAIService {
  constructor() {
    this.dataPlatformBridge = new DataPlatformBridge();
  }

  async getEnhancedRecommendations(section, provider) {
    try {
      // Get existing recommendations
      const existingRecommendations = await this.getExistingRecommendations(section, provider);
      
      // Enhance with data platform AI
      const enhancedQuery = `
        Section: ${section}
        Provider: ${provider}
        Context: Restaurant waste management optimization
        Data: ${JSON.stringify(existingRecommendations)}
        
        Please provide strategic insights and actionable recommendations.
      `;
      
      const aiResponse = await this.dataPlatformBridge.getAIRecommendations(enhancedQuery, {
        section,
        provider,
        timestamp: new Date().toISOString()
      });
      
      return {
        ...existingRecommendations,
        enhancedInsights: aiResponse?.insights || [],
        strategicRecommendations: aiResponse?.recommendations || [],
        confidence: aiResponse?.confidence || 0.5
      };
    } catch (error) {
      console.error('Enhanced AI recommendations failed:', error);
      return await this.getExistingRecommendations(section, provider);
    }
  }

  async getStrategicAnalysis(restaurantId) {
    try {
      const biData = await this.dataPlatformBridge.getBusinessIntelligence(restaurantId);
      return biData;
    } catch (error) {
      console.error('Strategic analysis failed:', error);
      return null;
    }
  }

  async getExistingRecommendations(section, provider) {
    // Existing recommendation logic
    return {
      section,
      provider,
      recommendations: [],
      analytics: {},
      timestamp: new Date().toISOString()
    };
  }
}