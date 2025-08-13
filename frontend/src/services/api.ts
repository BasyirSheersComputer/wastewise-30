// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async createUserProfile(user: any): Promise<any> {
    return this.request('/api/auth/create-profile', {
      method: 'POST',
      body: JSON.stringify({ user })
    });
  }

  async googleOAuthCallback(user: any, isNewUser: boolean = false): Promise<any> {
    return this.request('/api/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ user, isNewUser })
    });
  }

  async checkUserProfile(userId: string): Promise<any> {
    return this.request(`/api/auth/profile/check/${userId}`, {
      method: 'GET'
    });
  }

  // Debug endpoints
  async getDebugUsers(): Promise<any> {
    return this.request('/api/debug/users', {
      method: 'GET'
    });
  }

  async createDebugProfile(userId: string, userData: any): Promise<any> {
    return this.request('/api/debug/create-profile', {
      method: 'POST',
      body: JSON.stringify({ userId, userData })
    });
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.request('/health', {
      method: 'GET'
    });
  }
}

export const apiService = new ApiService();
export default apiService;

