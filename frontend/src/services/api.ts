// Comprehensive API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Types for API responses
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  cost_per_unit: number;
  selling_price: number;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  supplier?: string;
  expiry_date?: string;
  batch_number?: string;
  is_active: boolean;
  outlet_id: string;
  created_at: string;
  updated_at: string;
}

interface WasteLog {
  id: string;
  category: string;
  reason: string;
  quantity: number;
  unit: string;
  cost: number;
  outlet_id: string;
  item_id?: string;
  waste_date: string;
  notes?: string;
  is_tracked: boolean;
  created_at: string;
  updated_at: string;
}

interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone?: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  payment_terms?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Outlet {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  opening_hours?: Record<string, any>;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface DemandForecast {
  forecasts: Record<string, number[]>;
  finalForecast: number[];
  confidenceIntervals: Array<{
    value: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
  }>;
  accuracy: {
    mae: number;
    mape: number;
  };
  recommendations: Array<{
    type: string;
    message: string;
    priority: string;
    suggestedIncrease?: number;
    suggestedReduction?: number;
  }>;
  metadata: {
    userId: string;
    outletId: string;
    itemId: string;
    forecastDays: number;
    dataPoints: number;
    generatedAt: string;
  };
}

interface WastePrediction {
  predictions: Record<string, number[]>;
  finalPrediction: number[];
  riskFactors: Array<{
    factor: string;
    severity: string;
    description: string;
  }>;
  wasteReductionOpportunities: Array<{
    type: string;
    description: string;
    potentialSavings: number;
  }>;
  costImpact: {
    daily: number;
    weekly: number;
    monthly: number;
    annual: number;
  };
  recommendations: Array<{
    type: string;
    priority: string;
    message: string;
    action?: string;
  }>;
  metadata: {
    userId: string;
    outletId: string;
    category?: string;
    predictionDays: number;
    dataPoints: number;
    generatedAt: string;
  };
}

interface InventoryOptimization {
  optimizations: Record<string, any>;
  recommendations: Array<{
    type: string;
    priority: string;
    message: string;
    items?: string[];
  }>;
  costSavings: {
    monthly: number;
    annual: number;
  };
  riskAssessment: Array<{
    item: string;
    risk: string;
    severity: string;
    description: string;
  }>;
  summary: {
    totalItems: number;
    highPriorityItems: number;
    mediumPriorityItems: number;
    lowPriorityItems: number;
    estimatedMonthlySavings: number;
    estimatedAnnualSavings: number;
  };
  metadata: {
    userId: string;
    outletId: string;
    generatedAt: string;
  };
}

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.loadAuthToken();
  }

  private loadAuthToken() {
    // Load auth token from localStorage or secure storage
    this.authToken = localStorage.getItem('auth_token');
  }

  private setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  private clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    
    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Auth endpoints
  async createUserProfile(user: unknown): Promise<any> {
    return this.request('/api/auth/create-profile', {
      method: 'POST',
      body: JSON.stringify({ user })
    });
  }

  async googleOAuthCallback(user: unknown, isNewUser: boolean = false): Promise<any> {
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

  async createDebugProfile(userId: string, userData: unknown): Promise<any> {
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

  // ===========================================
  // INVENTORY MANAGEMENT ENDPOINTS
  // ===========================================

  async getInventoryItems(params: {
    outlet_id?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  } = {}): Promise<PaginatedResponse<InventoryItem>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return this.request(`/api/inventory/items?${queryParams.toString()}`);
  }

  async createInventoryItem(itemData: {
    name: string;
    category: string;
    description?: string;
    cost_per_unit: number;
    selling_price: number;
    current_stock: number;
    min_stock: number;
    max_stock: number;
    unit: string;
    supplier?: string;
    outlet_id: string;
    expiry_date?: string;
    batch_number?: string;
    is_active?: boolean;
  }): Promise<ApiResponse<InventoryItem>> {
    return this.request('/api/inventory/items', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  }

  async updateInventoryItem(id: string, itemData: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> {
    return this.request(`/api/inventory/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData)
    });
  }

  async deleteInventoryItem(id: string): Promise<ApiResponse> {
    return this.request(`/api/inventory/items/${id}`, {
      method: 'DELETE'
    });
  }

  // ===========================================
  // WASTE TRACKING ENDPOINTS
  // ===========================================

  async getWasteLogs(params: {
    outlet_id?: string;
    category?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  } = {}): Promise<PaginatedResponse<WasteLog>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return this.request(`/api/waste/logs?${queryParams.toString()}`);
  }

  async createWasteLog(wasteData: {
    category: string;
    reason: string;
    quantity: number;
    unit: string;
    cost: number;
    outlet_id: string;
    item_id?: string;
    waste_date?: string;
    notes?: string;
    is_tracked?: boolean;
  }): Promise<ApiResponse<WasteLog>> {
    return this.request('/api/waste/logs', {
      method: 'POST',
      body: JSON.stringify(wasteData)
    });
  }

  // ===========================================
  // ANALYTICS ENDPOINTS
  // ===========================================

  async getDemandForecast(params: {
    outlet_id: string;
    item_id: string;
    days?: number;
  }): Promise<ApiResponse<DemandForecast>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return this.request(`/api/analytics/demand-forecast?${queryParams.toString()}`);
  }

  async getWastePrediction(params: {
    outlet_id: string;
    category?: string;
    days?: number;
  }): Promise<ApiResponse<WastePrediction>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return this.request(`/api/analytics/waste-prediction?${queryParams.toString()}`);
  }

  async getInventoryOptimization(outletId: string): Promise<ApiResponse<InventoryOptimization>> {
    return this.request(`/api/analytics/inventory-optimization?outlet_id=${outletId}`);
  }

  // ===========================================
  // GENERIC HTTP METHODS (for backward compatibility)
  // ===========================================

  async get(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const queryParams = Object.keys(params).length > 0 ? 
      '?' + new URLSearchParams(params).toString() : '';
    return this.request(`${endpoint}${queryParams}`);
  }

  async post(endpoint: string, data: any = {}): Promise<any> {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint: string, data: any = {}): Promise<any> {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint: string): Promise<any> {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

export const apiService = new ApiService();
export default apiService;

