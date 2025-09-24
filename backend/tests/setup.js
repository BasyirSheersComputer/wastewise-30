import { jest } from '@jest/globals';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  // Create mock user data
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      first_name: 'Test',
      last_name: 'User',
      company_name: 'Test Company',
      ...overrides.user_metadata
    },
    ...overrides
  }),

  // Create mock inventory item
  createMockInventoryItem: (overrides = {}) => ({
    id: 'test-inventory-id',
    user_id: 'test-user-id',
    item_name: 'Test Item',
    category: 'Test Category',
    unit: 'kg',
    current_stock: 100,
    min_stock: 10,
    max_stock: 200,
    cost_per_unit: 25.50,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  }),

  // Create mock waste log
  createMockWasteLog: (overrides = {}) => ({
    id: 'test-waste-id',
    user_id: 'test-user-id',
    date: '2024-01-15',
    waste_type: 'Food Waste',
    quantity: 5.5,
    unit: 'kg',
    cost: 25.00,
    reason: 'Expired',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  }),

  // Create mock supplier
  createMockSupplier: (overrides = {}) => ({
    id: 'test-supplier-id',
    user_id: 'test-user-id',
    supplier_name: 'Test Supplier',
    contact_person: 'John Doe',
    email: 'john@testsupplier.com',
    phone: '+60123456789',
    address: '123 Test Street',
    city: 'Kuala Lumpur',
    state: 'Kuala Lumpur',
    country: 'Malaysia',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  }),

  // Create mock outlet
  createMockOutlet: (overrides = {}) => ({
    id: 'test-outlet-id',
    user_id: 'test-user-id',
    outlet_name: 'Test Outlet',
    address: '456 Test Avenue',
    city: 'Kuala Lumpur',
    state: 'Kuala Lumpur',
    country: 'Malaysia',
    phone: '+60123456789',
    email: 'outlet@test.com',
    manager_name: 'Jane Doe',
    capacity: 100,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  }),

  // Create mock AI recommendations
  createMockAIRecommendations: (overrides = {}) => ({
    recommendations: [
      {
        type: 'waste_reduction',
        priority: 'high',
        message: 'Reduce food waste by implementing portion control',
        impact: 'Save RM 2,500/month',
        confidence: 0.85
      }
    ],
    provider: 'gemini',
    timestamp: '2024-01-01T00:00:00Z',
    ...overrides
  }),

  // Create mock analytics data
  createMockAnalytics: (overrides = {}) => ({
    summary: {
      totalItems: 150,
      totalValue: 25000,
      lowStockItems: 5,
      expiringItems: 3
    },
    trends: {
      wasteReduction: 0.15,
      costSavings: 5000
    },
    recommendations: [
      'Implement portion control',
      'Optimize inventory levels'
    ],
    ...overrides
  }),

  // Wait for async operations
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock Supabase response
  mockSupabaseResponse: (data, error = null) => ({
    data,
    error,
    count: Array.isArray(data) ? data.length : null
  }),

  // Mock Supabase client
  mockSupabaseClient: () => ({
    auth: {
      getUser: jest.fn(),
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
  })
};

// Global test helpers
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in tests
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process in tests
});
