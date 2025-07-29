// Enhanced Business Intelligence Service
import { DataPlatformBridge } from './dataPlatformBridge.js';

export class EnhancedBusinessIntelligenceService {
  constructor() {
    this.dataPlatformBridge = new DataPlatformBridge();
  }

  async getComprehensiveAnalytics(restaurantId) {
    try {
      const analytics = await this.dataPlatformBridge.getAnalytics(restaurantId);
      const bi = await this.dataPlatformBridge.getBusinessIntelligence(restaurantId);
      
      return {
        analytics,
        businessIntelligence: bi,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Comprehensive analytics failed:', error);
      return null;
    }
  }

  async getStrategicInsights(restaurantId) {
    try {
      const bi = await this.dataPlatformBridge.getBusinessIntelligence(restaurantId);
      return {
        insights: bi?.insights || [],
        recommendations: bi?.recommendations || [],
        trends: bi?.trends || {},
        predictions: bi?.predictions || {},
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Strategic insights failed:', error);
      return null;
    }
  }

  async getRealTimeMetrics(restaurantId) {
    try {
      const health = await this.dataPlatformBridge.getHealth();
      const analytics = await this.dataPlatformBridge.getAnalytics(restaurantId, '1d');
      
      return {
        platformHealth: health,
        realTimeAnalytics: analytics,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Real-time metrics failed:', error);
      return null;
    }
  }
}