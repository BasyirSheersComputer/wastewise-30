import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { createClient } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('@supabase/supabase-js');
jest.mock('../services/cacheService.js', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  cacheUserData: jest.fn(),
  getUserData: jest.fn(),
  cacheAnalytics: jest.fn(),
  getAnalytics: jest.fn()
}));

jest.mock('../ai/recommendations.js', () => ({
  getRecommendations: jest.fn(),
  getMultiSectionRecommendations: jest.fn()
}));

jest.mock('../ai/analytics.js', () => ({
  getAnalyticsData: jest.fn()
}));

// Import the main app
import app from '../index.js';

describe('API Integration Tests', () => {
  let mockSupabase;
  let testUser;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock user data
    testUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: {
        first_name: 'Test',
        last_name: 'User',
        company_name: 'Test Company'
      }
    };

    // Mock Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: testUser }, error: null }),
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn()
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(),
      limit: jest.fn().mockReturnThis(),
      count: jest.fn().mockReturnThis()
    };

    createClient.mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Health Check', () => {
    test('GET /health should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        version: '1.0.0',
        message: 'Backend is running successfully',
        environment: expect.any(String)
      });
    });
  });

  describe('Database Connection Test', () => {
    test('GET /api/test-db should test database connection', async () => {
      // Mock successful database operations
      mockSupabase.single.mockResolvedValue({ data: [{ version: 'PostgreSQL 15.0' }], error: null });
      mockSupabase.rpc.mockResolvedValue({ data: 'PostgreSQL 15.0', error: null });
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });

      const response = await request(app)
        .get('/api/test-db')
        .expect(200);

      expect(response.body).toEqual({
        status: expect.stringMatching(/success|partial/),
        message: expect.any(String),
        connection: {
          url: expect.any(String),
          key: expect.any(String)
        },
        tests: {
          basic_connection: expect.any(Boolean),
          rpc_functions: expect.any(Boolean),
          auth_service: expect.any(Boolean),
          schema_access: expect.any(Boolean)
        },
        details: expect.any(Object),
        summary: expect.any(Object),
        timestamp: expect.any(String)
      });
    });
  });

  describe('Authentication Flow', () => {
    test('POST /api/auth/register should create new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        company_name: 'New Company',
        first_name: 'New',
        last_name: 'User'
      };

      // Mock successful user creation
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'new-user-id', email: userData.email },
          session: { access_token: 'mock-token' }
        },
        error: null
      });

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: { id: 'new-user-id', ...userData },
          error: null
        })
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'User registered successfully',
        user: expect.any(Object),
        session: expect.any(Object),
        trialEnd: expect.any(String),
        daysLeft: expect.any(Number)
      });
    });

    test('POST /api/auth/login should authenticate user', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock successful login
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: testUser,
          session: { access_token: 'mock-token' }
        },
        error: null
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: testUser.id,
            email: testUser.email,
            trial_start: '2024-01-01',
            trial_end: '2024-01-31'
          },
          error: null
        })
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Login successful',
        user: expect.any(Object),
        session: expect.any(Object),
        profile: expect.any(Object),
        trialStatus: expect.any(Object)
      });
    });
  });

  describe('Inventory Management', () => {
    beforeEach(() => {
      // Mock authenticated user for protected routes
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: testUser },
        error: null
      });
    });

    test('GET /api/inventory should return inventory items', async () => {
      const mockInventory = [
        {
          id: '1',
          item_name: 'Coffee Beans',
          category: 'Beverages',
          current_stock: 100,
          min_stock: 20,
          max_stock: 200,
          cost_per_unit: 25.50,
          unit: 'kg',
          is_active: true
        }
      ];

      mockSupabase.single.mockResolvedValueOnce({ data: mockInventory, error: null });
      mockSupabase.single.mockResolvedValueOnce({ count: 1, error: null });

      const response = await request(app)
        .get('/api/inventory')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockInventory,
        pagination: expect.objectContaining({
          page: 1,
          limit: 50,
          total: 1
        }),
        message: 'Inventory fetched successfully',
        timestamp: expect.any(String)
      });
    });

    test('POST /api/inventory should create new inventory item', async () => {
      const newItem = {
        item_name: 'Sugar',
        category: 'Sweeteners',
        unit: 'kg',
        current_stock: 25,
        min_stock: 5,
        max_stock: 50,
        cost_per_unit: 2.50
      };

      const createdItem = {
        id: 'new-id',
        user_id: testUser.id,
        ...newItem,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockSupabase.single.mockResolvedValueOnce({ data: createdItem, error: null });

      const response = await request(app)
        .post('/api/inventory')
        .set('Authorization', 'Bearer mock-token')
        .send(newItem)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: createdItem,
        message: 'Inventory item created successfully',
        timestamp: expect.any(String)
      });
    });
  });

  describe('Waste Tracking', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: testUser },
        error: null
      });
    });

    test('GET /api/waste should return waste logs', async () => {
      const mockWasteLogs = [
        {
          id: '1',
          date: '2024-01-15',
          waste_type: 'Food Waste',
          quantity: 5.5,
          unit: 'kg',
          cost: 25.00,
          reason: 'Expired'
        }
      ];

      mockSupabase.single.mockResolvedValueOnce({ data: mockWasteLogs, error: null });
      mockSupabase.single.mockResolvedValueOnce({ count: 1, error: null });

      const response = await request(app)
        .get('/api/waste')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockWasteLogs,
        pagination: expect.objectContaining({
          page: 1,
          limit: 50,
          total: 1
        }),
        message: 'Waste logs fetched successfully',
        timestamp: expect.any(String)
      });
    });

    test('POST /api/waste should create new waste log', async () => {
      const newWasteLog = {
        date: '2024-01-15',
        waste_type: 'Food Waste',
        quantity: 3.2,
        unit: 'kg',
        cost: 15.50,
        reason: 'Overproduction'
      };

      const createdWasteLog = {
        id: 'new-waste-id',
        user_id: testUser.id,
        ...newWasteLog,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockSupabase.single.mockResolvedValueOnce({ data: createdWasteLog, error: null });

      const response = await request(app)
        .post('/api/waste')
        .set('Authorization', 'Bearer mock-token')
        .send(newWasteLog)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: createdWasteLog,
        message: 'Waste log created successfully',
        timestamp: expect.any(String)
      });
    });
  });

  describe('AI Recommendations', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: testUser },
        error: null
      });
    });

    test('GET /api/ai/recommendations should return AI insights', async () => {
      const mockRecommendations = {
        recommendations: [
          {
            type: 'waste_reduction',
            priority: 'high',
            message: 'Reduce food waste by implementing portion control',
            impact: 'Save RM 2,500/month'
          }
        ],
        provider: 'gemini',
        timestamp: '2024-01-01T00:00:00Z'
      };

      // Mock AI service
      const { getRecommendations } = await import('../ai/recommendations.js');
      getRecommendations.mockResolvedValue(mockRecommendations);

      const response = await request(app)
        .get('/api/ai/recommendations?section=dashboard')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockRecommendations,
        message: 'AI recommendations fetched successfully',
        timestamp: expect.any(String)
      });
    });

    test('POST /api/ai/chat should handle chat requests', async () => {
      const chatRequest = {
        message: 'How can I reduce food waste?',
        context: 'general'
      };

      const mockChatResponse = {
        recommendations: 'Focus on portion control and inventory management...',
        provider: 'gemini',
        timestamp: '2024-01-01T00:00:00Z'
      };

      const { getRecommendations } = await import('../ai/recommendations.js');
      getRecommendations.mockResolvedValue(mockChatResponse);

      const response = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', 'Bearer mock-token')
        .send(chatRequest)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          message: chatRequest.message,
          response: expect.any(String),
          context: chatRequest.context,
          provider: expect.any(String),
          timestamp: expect.any(String)
        }),
        message: 'AI chat response generated successfully',
        timestamp: expect.any(String)
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-route')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Route not found'
      });
    });

    test('should handle authentication errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });

      const response = await request(app)
        .get('/api/inventory')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toEqual({
        error: 'Not authenticated'
      });
    });

    test('should handle database errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: testUser },
        error: null
      });

      mockSupabase.single.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/inventory')
        .set('Authorization', 'Bearer mock-token')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch inventory'
      });
    });
  });

  describe('Rate Limiting', () => {
    test('should apply rate limiting to API endpoints', async () => {
      // Make multiple requests quickly
      const requests = Array(10).fill().map(() =>
        request(app)
          .get('/api/test')
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited (429 status)
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('CORS Configuration', () => {
    test('should include proper CORS headers', async () => {
      const response = await request(app)
        .options('/api/test')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
      expect(response.headers['access-control-allow-headers']).toBeDefined();
    });
  });
});
