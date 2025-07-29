// API Bridge for Data Platform Integration
import axios from 'axios';

const DATA_PLATFORM_URL = 'http://localhost:4000';

export class DataPlatformBridge {
  constructor() {
    this.baseURL = DATA_PLATFORM_URL;
  }

  async getHealth() {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      return response.data;
    } catch (error) {
      console.error('Data platform health check failed:', error);
      return null;
    }
  }

  async getAnalytics(restaurantId, timePeriod = '30d') {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/analytics`, {
        params: { restaurantId, timePeriod }
      });
      return response.data;
    } catch (error) {
      console.error('Analytics request failed:', error);
      return null;
    }
  }

  async getAIRecommendations(query, context = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/api/v1/ai`, {
        query,
        context
      });
      return response.data;
    } catch (error) {
      console.error('AI recommendation request failed:', error);
      return null;
    }
  }

  async getBusinessIntelligence(restaurantId) {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/bi`, {
        params: { restaurantId }
      });
      return response.data;
    } catch (error) {
      console.error('Business intelligence request failed:', error);
      return null;
    }
  }
}

export default DataPlatformBridge;