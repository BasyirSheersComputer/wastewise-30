/**
 * StoreHub Integration Service
 * Handles API communication with StoreHub POS system
 * Based on StoreHub's widely available API patterns
 */

import axios from 'axios';
import { supabase } from './supabaseClient.js';
import logger from '../utils/logger.js';

export class StoreHubService {
  constructor(config = {}) {
    this.apiBaseUrl = config.apiBaseUrl || 'https://api.storehub.com/v1';
    this.timeout = config.timeout || 30000;
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;
  }

  /**
   * Initialize StoreHub integration for a user
   * @param {string} userId - User ID
   * @param {object} credentials - StoreHub API credentials
   * @returns {Promise<object>} Integration configuration
   */
  async initializeIntegration(userId, credentials) {
    try {
      const { storeId, apiKey, apiSecret } = credentials;

      // Verify credentials by making a test API call
      const testResponse = await this._makeRequest('GET', '/stores/info', {
        storeId,
        apiKey
      });

      if (!testResponse.success) {
        throw new Error('Invalid StoreHub credentials');
      }

      // Store credentials securely
      const { data, error } = await supabase
        .from('integrations')
        .upsert({
          user_id: userId,
          integration_type: 'storehub',
          credentials: {
            storeId,
            apiKey,
            // Don't store secret in plain text in production - use encryption
            apiSecret: this._encryptSecret(apiSecret)
          },
          config: {
            syncSales: true,
            syncInventory: true,
            syncFrequency: 'realtime', // realtime, hourly, daily
            lastSyncAt: null
          },
          status: 'active',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,integration_type'
        })
        .select()
        .single();

      if (error) throw error;

      logger.info(`StoreHub integration initialized for user ${userId}`);
      return { success: true, integration: data };
    } catch (error) {
      logger.error('StoreHub integration initialization failed:', error);
      throw error;
    }
  }

  /**
   * Sync sales data from StoreHub
   * @param {string} userId - User ID
   * @param {object} options - Sync options (dateRange, outletId, etc.)
   * @returns {Promise<object>} Sync result
   */
  async syncSalesData(userId, options = {}) {
    try {
      const integration = await this._getIntegration(userId);
      if (!integration) {
        throw new Error('StoreHub integration not found');
      }

      const { storeId, apiKey } = integration.credentials;
      const { startDate, endDate, outletId } = options;

      // Fetch sales data from StoreHub API
      const salesData = await this._fetchSalesData(storeId, apiKey, {
        startDate: startDate || this._getDefaultDateRange().start,
        endDate: endDate || this._getDefaultDateRange().end,
        outletId
      });

      // Transform StoreHub data to WasteWise format
      const transformedData = this._transformSalesData(salesData, userId, outletId);

      // Bulk insert sales data
      const { data, error } = await supabase
        .from('sales_pos_data')
        .insert(transformedData)
        .select();

      if (error) {
        // Handle duplicate entries gracefully
        if (error.code === '23505') {
          logger.warn('Some sales transactions already exist, skipping duplicates');
        } else {
          throw error;
        }
      }

      // Update last sync time
      await this._updateLastSync(userId);

      logger.info(`Synced ${transformedData.length} sales transactions for user ${userId}`);
      return {
        success: true,
        synced: transformedData.length,
        data: data || []
      };
    } catch (error) {
      logger.error('StoreHub sales sync failed:', error);
      throw error;
    }
  }

  /**
   * Sync inventory data from StoreHub
   * @param {string} userId - User ID
   * @param {string} outletId - Outlet ID (optional)
   * @returns {Promise<object>} Sync result
   */
  async syncInventoryData(userId, outletId = null) {
    try {
      const integration = await this._getIntegration(userId);
      if (!integration) {
        throw new Error('StoreHub integration not found');
      }

      const { storeId, apiKey } = integration.credentials;

      // Fetch inventory from StoreHub
      const inventoryData = await this._fetchInventoryData(storeId, apiKey, outletId);

      // Transform and update inventory
      const transformedInventory = this._transformInventoryData(inventoryData, userId, outletId);

      // Upsert inventory items
      const results = [];
      for (const item of transformedInventory) {
        const { data, error } = await supabase
          .from('inventory_data')
          .upsert({
            ...item,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,item_name'
          })
          .select()
          .single();

        if (error) {
          logger.error(`Failed to upsert inventory item ${item.item_name}:`, error);
        } else {
          results.push(data);
        }
      }

      logger.info(`Synced ${results.length} inventory items for user ${userId}`);
      return {
        success: true,
        synced: results.length,
        data: results
      };
    } catch (error) {
      logger.error('StoreHub inventory sync failed:', error);
      throw error;
    }
  }

  /**
   * Handle webhook from StoreHub
   * @param {object} webhookData - Webhook payload
   * @returns {Promise<object>} Processing result
   */
  async handleWebhook(webhookData) {
    try {
      const { event, data } = webhookData;

      // Find user by store ID
      const { data: integrations } = await supabase
        .from('integrations')
        .select('user_id, credentials')
        .eq('integration_type', 'storehub')
        .eq('credentials->>storeId', data.storeId);

      if (!integrations || integrations.length === 0) {
        throw new Error('Integration not found for webhook');
      }

      const userId = integrations[0].user_id;

      switch (event) {
        case 'sale.created':
        case 'sale.updated':
          return await this._processSaleWebhook(data, userId);
        
        case 'inventory.updated':
          return await this._processInventoryWebhook(data, userId);
        
        case 'stock.updated':
          return await this._processStockWebhook(data, userId);
        
        default:
          logger.warn(`Unknown webhook event: ${event}`);
          return { success: false, message: 'Unknown event type' };
      }
    } catch (error) {
      logger.error('StoreHub webhook processing failed:', error);
      throw error;
    }
  }

  /**
   * Fetch sales data from StoreHub API
   * @private
   */
  async _fetchSalesData(storeId, apiKey, options) {
    try {
      const response = await this._makeRequest('GET', '/sales', {
        storeId,
        apiKey,
        startDate: options.startDate,
        endDate: options.endDate,
        outletId: options.outletId,
        limit: 1000 // Adjust based on API limits
      });

      return response.data || [];
    } catch (error) {
      logger.error('Failed to fetch StoreHub sales data:', error);
      throw error;
    }
  }

  /**
   * Fetch inventory data from StoreHub API
   * @private
   */
  async _fetchInventoryData(storeId, apiKey, outletId) {
    try {
      const response = await this._makeRequest('GET', '/inventory', {
        storeId,
        apiKey,
        outletId
      });

      return response.data || [];
    } catch (error) {
      logger.error('Failed to fetch StoreHub inventory data:', error);
      throw error;
    }
  }

  /**
   * Transform StoreHub sales data to WasteWise format
   * @private
   */
  _transformSalesData(salesData, userId, outletId) {
    return salesData.map(sale => ({
      user_id: userId,
      outlet_id: outletId || null,
      transaction_id: sale.transactionId || sale.id,
      transaction_date: sale.date || sale.createdAt,
      transaction_time: sale.time || null,
      product_name: sale.productName || sale.itemName,
      category: sale.category || sale.productCategory || 'Other',
      quantity: parseFloat(sale.quantity || 0),
      unit_price: parseFloat(sale.unitPrice || sale.price || 0),
      total_amount: parseFloat(sale.totalAmount || sale.total || 0),
      customer_id: sale.customerId || null,
      payment_method: sale.paymentMethod || sale.paymentType || 'Unknown'
    }));
  }

  /**
   * Transform StoreHub inventory data to WasteWise format
   * @private
   */
  _transformInventoryData(inventoryData, userId, outletId) {
    return inventoryData.map(item => ({
      user_id: userId,
      outlet_id: outletId || null,
      item_name: item.name || item.productName,
      category: item.category || 'Other',
      current_stock: parseFloat(item.stock || item.quantity || 0),
      unit: item.unit || 'units',
      cost_per_unit: parseFloat(item.costPrice || item.cost || 0),
      min_stock: parseFloat(item.minStock || item.reorderPoint || 0),
      max_stock: parseFloat(item.maxStock || item.maxQuantity || 0),
      supplier: item.supplier || null
    }));
  }

  /**
   * Process sale webhook event
   * @private
   */
  async _processSaleWebhook(saleData, userId) {
    const transformed = this._transformSalesData([saleData], userId, saleData.outletId);
    
    const { data, error } = await supabase
      .from('sales_pos_data')
      .upsert(transformed[0], {
        onConflict: 'transaction_id,user_id'
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  }

  /**
   * Process inventory webhook event
   * @private
   */
  async _processInventoryWebhook(inventoryData, userId) {
    const transformed = this._transformInventoryData([inventoryData], userId, inventoryData.outletId);
    
    const { data, error } = await supabase
      .from('inventory_data')
      .upsert(transformed[0], {
        onConflict: 'user_id,item_name'
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  }

  /**
   * Process stock webhook event
   * @private
   */
  async _processStockWebhook(stockData, userId) {
    const { data, error } = await supabase
      .from('inventory_data')
      .update({
        current_stock: parseFloat(stockData.quantity || stockData.stock),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('item_name', stockData.productName || stockData.itemName)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  }

  /**
   * Make HTTP request to StoreHub API with retry logic
   * @private
   */
  async _makeRequest(method, endpoint, params = {}, data = null) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const config = {
          method,
          url: `${this.apiBaseUrl}${endpoint}`,
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': params.apiKey || ''
          },
          params: { ...params, apiKey: undefined }, // Remove from params
          data
        };

        const response = await axios(config);
        return { success: true, data: response.data };
      } catch (error) {
        lastError = error;
        
        // Don't retry on 4xx errors (client errors)
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          throw error;
        }

        // Wait before retry
        if (attempt < this.retryAttempts) {
          await this._sleep(this.retryDelay * attempt);
        }
      }
    }

    throw lastError;
  }

  /**
   * Get integration configuration for user
   * @private
   */
  async _getIntegration(userId) {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('integration_type', 'storehub')
      .eq('status', 'active')
      .single();

    if (error || !data) return null;

    // Decrypt API secret
    if (data.credentials?.apiSecret) {
      data.credentials.apiSecret = this._decryptSecret(data.credentials.apiSecret);
    }

    return data;
  }

  /**
   * Update last sync timestamp
   * @private
   */
  async _updateLastSync(userId) {
    await supabase
      .from('integrations')
      .update({
        config: {
          lastSyncAt: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('integration_type', 'storehub');
  }

  /**
   * Get default date range for sync (last 30 days)
   * @private
   */
  _getDefaultDateRange() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };
  }

  /**
   * Encrypt API secret (simplified - use proper encryption in production)
   * @private
   */
  _encryptSecret(secret) {
    // TODO: Implement proper encryption (e.g., AES-256)
    // For now, return base64 encoded (NOT secure for production)
    return Buffer.from(secret).toString('base64');
  }

  /**
   * Decrypt API secret
   * @private
   */
  _decryptSecret(encryptedSecret) {
    // TODO: Implement proper decryption
    return Buffer.from(encryptedSecret, 'base64').toString();
  }

  /**
   * Sleep utility for retry delays
   * @private
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default StoreHubService;

