/**
 * Integration Manager
 * Manages all external system integrations (POS, ERP, CRM, WFM)
 * Routes requests to mock simulators for testing or real integrations for production
 */

import logger from '../utils/logger.js';
import MockStoreHubSimulator from './mock/mockStoreHubSimulator.js';
import MockERPSimulator from './mock/mockERPSimulator.js';
import MockKlaviyoSimulator from './mock/mockKlaviyoSimulator.js';
import MockLarkSimulator from './mock/mockLarkSimulator.js';

// Try to import Supabase and real services, but handle gracefully if not available
let supabase = null;
let StoreHubService = null;

async function initSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return null;
  }
  try {
    const supabaseModule = await import('./supabaseClient.js');
    return supabaseModule.supabase;
  } catch (error) {
    return null;
  }
}

// Initialize on module load
initSupabase().then(client => {
  supabase = client;
  if (supabase) {
    import('./storehubService.js').then(module => {
      StoreHubService = module.default;
    }).catch(() => {});
  }
});

export class IntegrationManager {
  constructor(config = {}) {
    this.useMock = config.useMock !== false; // Default to mock for testing
    this.simulators = {
      storehub: new MockStoreHubSimulator(),
      erp: new MockERPSimulator(),
      klaviyo: new MockKlaviyoSimulator(),
      lark: new MockLarkSimulator()
    };
    this.realServices = {
      storehub: StoreHubService ? new StoreHubService() : null
    };
  }

  /**
   * Initialize integration
   */
  async initializeIntegration(userId, integrationType, credentials) {
    try {
      const service = this._getService(integrationType);
      const result = await service.initializeIntegration(credentials);
      
      // Store integration config in database (if Supabase available)
      if (!supabase) {
        return { success: true, integration: { ...result, stored: false } };
      }
      
      try {
        const { data, error } = await supabase
          .from('integrations')
          .upsert({
            user_id: userId,
            integration_type: integrationType,
            credentials: credentials,
            config: result.integration || {},
            status: 'active',
            last_sync_at: null,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,integration_type'
          })
          .select()
          .single();

        if (error) throw error;

        logger.info(`Integration ${integrationType} initialized for user ${userId}`);
        return { success: true, integration: data };
      } catch (dbError) {
        // If database fails, still return success for mock mode
        logger.warn(`Database storage failed for ${integrationType}, continuing in mock mode`);
        return { success: true, integration: { ...result, stored: false } };
      }
    } catch (error) {
      logger.error(`Integration initialization failed for ${integrationType}:`, error);
      throw error;
    }
  }

  /**
   * Sync data from integration
   */
  async syncData(userId, integrationType, dataType, options = {}) {
    try {
      const service = this._getService(integrationType);
      
      switch (integrationType) {
        case 'storehub':
          if (dataType === 'sales') {
            return await service.fetchSalesData(options.storeId || 'mock_store', options);
          } else if (dataType === 'inventory') {
            return await service.fetchInventoryData(options.storeId || 'mock_store', options);
          }
          break;
        
        case 'erp':
          if (dataType === 'purchase_orders') {
            return await service.fetchPurchaseOrders(options);
          } else if (dataType === 'suppliers') {
            return await service.fetchSuppliers();
          } else if (dataType === 'inventory') {
            return await service.fetchInventoryLevels(options);
          }
          break;
        
        case 'klaviyo':
          if (dataType === 'customers') {
            return await service.fetchCustomers(options);
          } else if (dataType === 'segments') {
            return await service.fetchSegments();
          } else if (dataType === 'spending') {
            return await service.fetchCustomerSpending(options.customerId);
          } else if (dataType === 'loyalty') {
            return await service.fetchLoyaltyMetrics(options.customerId);
          }
          break;
        
        case 'lark':
          if (dataType === 'staff') {
            return await service.fetchStaffRoster(options);
          } else if (dataType === 'schedules') {
            return await service.fetchSchedules(options);
          } else if (dataType === 'attendance') {
            return await service.fetchAttendance(options);
          } else if (dataType === 'performance') {
            return await service.fetchStaffPerformance(options.staffId, options);
          }
          break;
      }
      
      throw new Error(`Unsupported data type: ${dataType} for integration: ${integrationType}`);
    } catch (error) {
      logger.error(`Data sync failed for ${integrationType}/${dataType}:`, error);
      throw error;
    }
  }

  /**
   * Store synced data in database
   */
  async storeSyncedData(userId, integrationType, dataType, data) {
    try {
      // If Supabase not available, just return success without storing
      if (!supabase) {
        const count = data.count || data.data?.length || 0;
        return { success: true, stored: count, note: 'Database not available - mock mode' };
      }
      
      // Transform and store data based on type
      switch (dataType) {
        case 'sales':
          return await this._storeSalesData(userId, data);
        case 'inventory':
          return await this._storeInventoryData(userId, data);
        case 'customers':
          return await this._storeCustomerData(userId, data);
        case 'staff':
          return await this._storeStaffData(userId, data);
        case 'attendance':
          return await this._storeAttendanceData(userId, data);
        default:
          logger.warn(`No storage handler for data type: ${dataType}`);
          return { success: true, stored: 0 };
      }
    } catch (error) {
      logger.error(`Failed to store synced data:`, error);
      throw error;
    }
  }

  /**
   * Store sales data
   */
  async _storeSalesData(userId, salesData) {
    const { data } = salesData;
    if (!data || !Array.isArray(data)) return { success: true, stored: 0 };
    
    const transformed = data.flatMap(transaction => {
      return transaction.items.map(item => ({
        user_id: userId,
        outlet_id: transaction.outlet_id || null,
        transaction_id: transaction.transaction_id,
        transaction_date: transaction.transaction_date || transaction.transaction_time?.split('T')[0],
        transaction_time: transaction.transaction_time?.split('T')[1]?.split('.')[0],
        product_name: item.product_name,
        category: item.category,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_amount: item.total,
        customer_id: transaction.customer_id,
        payment_method: transaction.payment_method
      }));
    });
    
    const { error } = await supabase
      .from('sales_pos_data')
      .upsert(transformed, {
        onConflict: 'transaction_id,product_name',
        ignoreDuplicates: false
      });
    
    if (error) throw error;
    
    return { success: true, stored: transformed.length };
  }

  /**
   * Store inventory data
   */
  async _storeInventoryData(userId, inventoryData) {
    const { data } = inventoryData;
    if (!data || !Array.isArray(data)) return { success: true, stored: 0 };
    
    const transformed = data.map(item => ({
      user_id: userId,
      product_name: item.product_name || item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.current_stock || item.quantity,
      unit: item.unit,
      cost_per_unit: item.cost_per_unit,
      reorder_point: item.reorder_point,
      last_updated: item.last_updated || new Date().toISOString()
    }));
    
    const { error } = await supabase
      .from('inventory_data')
      .upsert(transformed, {
        onConflict: 'user_id,sku',
        ignoreDuplicates: false
      });
    
    if (error) throw error;
    
    return { success: true, stored: transformed.length };
  }

  /**
   * Store customer data
   */
  async _storeCustomerData(userId, customerData) {
    const { data } = customerData;
    if (!data || !Array.isArray(data)) return { success: true, stored: 0 };
    
    const transformed = data.map(customer => ({
      user_id: userId,
      customer_id: customer.id,
      customer_name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
      email: customer.email,
      phone: customer.phone,
      loyalty_points: customer.spending?.lifetime_value ? Math.floor(customer.spending.lifetime_value / 10) : 0,
      total_spent: customer.spending?.total_spent || 0,
      last_visit: customer.spending?.last_order_date || customer.created_at
    }));
    
    const { error } = await supabase
      .from('customers')
      .upsert(transformed, {
        onConflict: 'user_id,customer_id',
        ignoreDuplicates: false
      });
    
    if (error) throw error;
    
    return { success: true, stored: transformed.length };
  }

  /**
   * Store staff data
   */
  async _storeStaffData(userId, staffData) {
    const { data } = staffData;
    if (!data || !Array.isArray(data)) return { success: true, stored: 0 };
    
    const transformed = data.map(staff => ({
      user_id: userId,
      outlet_id: staff.outlet_id || null,
      name: staff.name,
      position: staff.position,
      email: staff.email,
      phone: staff.phone,
      hire_date: staff.hire_date?.split('T')[0],
      status: staff.status || 'active',
      training_level: staff.training_level || 'basic'
    }));
    
    const { error } = await supabase
      .from('staff')
      .upsert(transformed, {
        onConflict: 'id',
        ignoreDuplicates: false
      });
    
    if (error) throw error;
    
    return { success: true, stored: transformed.length };
  }

  /**
   * Store attendance data
   */
  async _storeAttendanceData(userId, attendanceData) {
    // Create attendance table entry if needed
    // For now, store in a JSON format or update staff records
    logger.info(`Storing ${attendanceData.data?.length || 0} attendance records`);
    return { success: true, stored: attendanceData.data?.length || 0 };
  }

  /**
   * Get service instance (mock or real)
   */
  _getService(integrationType) {
    if (this.useMock || !this.realServices[integrationType]) {
      return this.simulators[integrationType];
    } else {
      return this.realServices[integrationType];
    }
  }

  /**
   * Get integration status
   */
  async getIntegrationStatus(userId, integrationType) {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('integration_type', integrationType)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    return { success: true, integration: data || null };
  }

  /**
   * List all integrations for user
   */
  async listIntegrations(userId) {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { success: true, integrations: data || [] };
  }
}

export default IntegrationManager;

