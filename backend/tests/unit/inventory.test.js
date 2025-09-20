import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js');
jest.mock('../../utils/logger.js', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

// Mock the auth middleware
jest.mock('../../utils/authMiddleware.js', () => ({
  authenticateUser: (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  }
}));

describe('Inventory Routes', () => {
  let mockSupabase;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(),
      limit: jest.fn().mockReturnThis()
    };

    createClient.mockReturnValue(mockSupabase);

    // Mock request and response objects
    mockRequest = {
      user: { id: 'test-user-id' },
      params: {},
      query: {},
      body: {}
    };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /inventory', () => {
    test('should return inventory items with pagination', async () => {
      const mockInventoryData = [
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
        },
        {
          id: '2',
          item_name: 'Milk',
          category: 'Dairy',
          current_stock: 50,
          min_stock: 10,
          max_stock: 100,
          cost_per_unit: 3.20,
          unit: 'liters',
          is_active: true
        }
      ];

      const mockCount = 2;

      mockSupabase.single.mockResolvedValueOnce({ data: mockInventoryData, error: null });
      mockSupabase.single.mockResolvedValueOnce({ count: mockCount, error: null });

      // Import the route handler
      const inventoryRoutes = await import('../../routes/inventory.js');
      
      // Mock the router
      const router = {
        get: jest.fn((path, middleware, handler) => {
          if (typeof middleware === 'function') {
            return handler(mockRequest, mockResponse);
          }
          return middleware(mockRequest, mockResponse);
        })
      };

      // Test the route
      await inventoryRoutes.default.get('/', mockRequest, mockResponse);

      expect(mockSupabase.from).toHaveBeenCalledWith('inventory');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockInventoryData,
          pagination: expect.objectContaining({
            page: 1,
            limit: 50,
            total: mockCount
          })
        })
      );
    });

    test('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      mockSupabase.single.mockRejectedValue(mockError);

      // Import and test the route
      const inventoryRoutes = await import('../../routes/inventory.js');
      
      await inventoryRoutes.default.get('/', mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Internal server error'
        })
      );
    });
  });

  describe('POST /inventory', () => {
    test('should create new inventory item', async () => {
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
        user_id: 'test-user-id',
        ...newItem,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockRequest.body = newItem;
      mockSupabase.single.mockResolvedValueOnce({ data: createdItem, error: null });

      const inventoryRoutes = await import('../../routes/inventory.js');
      
      await inventoryRoutes.default.post('/', mockRequest, mockResponse);

      expect(mockSupabase.from).toHaveBeenCalledWith('inventory');
      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          user_id: 'test-user-id',
          item_name: newItem.item_name,
          category: newItem.category,
          current_stock: newItem.current_stock,
          min_stock: newItem.min_stock,
          max_stock: newItem.max_stock,
          cost_per_unit: newItem.cost_per_unit,
          is_active: true
        })
      ]);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: createdItem,
          message: 'Inventory item created successfully'
        })
      );
    });

    test('should validate required fields', async () => {
      mockRequest.body = {
        // Missing required fields
        category: 'Beverages',
        unit: 'kg'
      };

      const inventoryRoutes = await import('../../routes/inventory.js');
      
      await inventoryRoutes.default.post('/', mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Item name, category, and unit are required'
        })
      );
    });
  });

  describe('PUT /inventory/:id', () => {
    test('should update existing inventory item', async () => {
      const itemId = 'test-item-id';
      const updateData = {
        current_stock: 150,
        cost_per_unit: 30.00
      };

      const updatedItem = {
        id: itemId,
        item_name: 'Coffee Beans',
        category: 'Beverages',
        current_stock: 150,
        cost_per_unit: 30.00,
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockRequest.params = { id: itemId };
      mockRequest.body = updateData;
      mockSupabase.single.mockResolvedValueOnce({ data: updatedItem, error: null });

      const inventoryRoutes = await import('../../routes/inventory.js');
      
      await inventoryRoutes.default.put('/:id', mockRequest, mockResponse);

      expect(mockSupabase.from).toHaveBeenCalledWith('inventory');
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updateData,
          updated_at: expect.any(String)
        })
      );
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', itemId);
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: updatedItem,
          message: 'Inventory item updated successfully'
        })
      );
    });

    test('should handle item not found', async () => {
      const itemId = 'non-existent-id';
      mockRequest.params = { id: itemId };
      mockRequest.body = { current_stock: 100 };

      mockSupabase.single.mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116', message: 'No rows found' } 
      });

      const inventoryRoutes = await import('../../routes/inventory.js');
      
      await inventoryRoutes.default.put('/:id', mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'NOT_FOUND',
          message: 'Inventory item not found'
        })
      );
    });
  });

  describe('DELETE /inventory/:id', () => {
    test('should soft delete inventory item', async () => {
      const itemId = 'test-item-id';
      mockRequest.params = { id: itemId };

      mockSupabase.update.mockResolvedValueOnce({ error: null });

      const inventoryRoutes = await import('../../routes/inventory.js');
      
      await inventoryRoutes.default.delete('/:id', mockRequest, mockResponse);

      expect(mockSupabase.from).toHaveBeenCalledWith('inventory');
      expect(mockSupabase.update).toHaveBeenCalledWith({
        is_active: false,
        updated_at: expect.any(String)
      });
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', itemId);
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Inventory item deleted successfully'
        })
      );
    });
  });

  describe('GET /inventory/analytics', () => {
    test('should return inventory analytics', async () => {
      const mockInventoryData = [
        {
          id: '1',
          item_name: 'Coffee Beans',
          category: 'Beverages',
          current_stock: 5, // Low stock
          min_stock: 10,
          cost_per_unit: 25.50,
          expiry_date: '2024-01-15' // Expiring soon
        },
        {
          id: '2',
          item_name: 'Milk',
          category: 'Dairy',
          current_stock: 50,
          min_stock: 10,
          cost_per_unit: 3.20,
          expiry_date: '2024-02-15'
        }
      ];

      mockSupabase.single.mockResolvedValueOnce({ data: mockInventoryData, error: null });
      mockSupabase.single.mockResolvedValueOnce({ data: mockInventoryData, error: null });
      mockSupabase.single.mockResolvedValueOnce({ data: mockInventoryData, error: null });

      const inventoryRoutes = await import('../../routes/inventory.js');
      
      await inventoryRoutes.default.get('/analytics', mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            lowStock: expect.any(Array),
            expiringItems: expect.any(Array),
            categoryTotals: expect.any(Object),
            totalItems: expect.any(Number),
            totalValue: expect.any(Number)
          }),
          message: 'Inventory analytics fetched successfully'
        })
      );
    });
  });
});
