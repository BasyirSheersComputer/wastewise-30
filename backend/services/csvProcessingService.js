import { createClient } from '@supabase/supabase-js';
import { getRecommendations } from '../ai/recommendations.js';
import logger from '../utils/logger.js';
import cacheService from './cacheService.js';

// Create Supabase client only if environment variables are available
let supabase = null;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    logger.info('CSV processing service: Supabase client created successfully');
  } else {
    logger.warn('CSV processing service: Supabase environment variables not found, database features will be disabled');
  }
} catch (error) {
  logger.error('CSV processing service: Failed to create Supabase client:', error.message);
}

export class CSVProcessingService {
  constructor() {
    this.supabase = supabase;
    this.cacheService = cacheService;
    
    // Define CSV schemas for validation
    this.schemas = {
      inventory: {
        required: ['item_name', 'category', 'unit', 'current_stock'],
        optional: ['outlet_id', 'supplier_id', 'min_stock', 'max_stock', 'cost_per_unit', 'expiry_date'],
        types: {
          current_stock: 'number',
          min_stock: 'number',
          max_stock: 'number',
          cost_per_unit: 'number'
        }
      },
      waste: {
        required: ['date', 'waste_type', 'quantity', 'unit'],
        optional: ['outlet_id', 'cost', 'reason', 'notes'],
        types: {
          quantity: 'number',
          cost: 'number'
        }
      },
      suppliers: {
        required: ['supplier_name'],
        optional: ['contact_person', 'email', 'phone', 'address', 'city', 'state', 'country', 'postal_code', 'payment_terms'],
        types: {}
      },
      outlets: {
        required: ['outlet_name'],
        optional: ['address', 'city', 'state', 'country', 'postal_code', 'phone', 'email', 'manager_name', 'capacity'],
        types: {
          capacity: 'number'
        }
      },
      sales: {
        required: ['transaction_date', 'product_name', 'quantity', 'unit_price', 'total_amount'],
        optional: ['outlet_id', 'transaction_time', 'category', 'customer_id', 'payment_method'],
        types: {
          quantity: 'number',
          unit_price: 'number',
          total_amount: 'number'
        }
      }
    };
  }

  /**
   * Validate CSV data against schema
   */
  validateCSVData(data, dataType) {
    const schema = this.schemas[dataType];
    if (!schema) {
      throw new Error(`Unknown data type: ${dataType}`);
    }

    const errors = [];
    const warnings = [];
    const validRecords = [];

    data.forEach((record, index) => {
      const recordErrors = [];
      const recordWarnings = [];
      const processedRecord = {};

      // Check required fields
      for (const field of schema.required) {
        if (!record[field] || record[field].toString().trim() === '') {
          recordErrors.push(`Missing required field: ${field}`);
        } else {
          processedRecord[field] = record[field];
        }
      }

      // Process optional fields
      for (const field of schema.optional) {
        if (record[field] !== undefined && record[field] !== null && record[field].toString().trim() !== '') {
          processedRecord[field] = record[field];
        }
      }

      // Type validation and conversion
      for (const [field, expectedType] of Object.entries(schema.types)) {
        if (processedRecord[field] !== undefined) {
          try {
            if (expectedType === 'number') {
              const numValue = parseFloat(processedRecord[field]);
              if (isNaN(numValue)) {
                recordErrors.push(`Invalid number format for ${field}: ${processedRecord[field]}`);
              } else {
                processedRecord[field] = numValue;
              }
            }
          } catch (error) {
            recordErrors.push(`Type conversion error for ${field}: ${error.message}`);
          }
        }
      }

      // Additional validations based on data type
      this.performDataSpecificValidations(processedRecord, dataType, recordErrors, recordWarnings);

      if (recordErrors.length > 0) {
        errors.push({
          row: index + 1,
          errors: recordErrors,
          record: record
        });
      } else {
        validRecords.push(processedRecord);
        if (recordWarnings.length > 0) {
          warnings.push({
            row: index + 1,
            warnings: recordWarnings,
            record: record
          });
        }
      }
    });

    return {
      valid: errors.length === 0,
      validRecords,
      errors,
      warnings,
      summary: {
        total: data.length,
        valid: validRecords.length,
        errors: errors.length,
        warnings: warnings.length
      }
    };
  }

  /**
   * Perform data-specific validations
   */
  performDataSpecificValidations(record, dataType, errors, warnings) {
    switch (dataType) {
      case 'inventory':
        if (record.current_stock < 0) {
          errors.push('Current stock cannot be negative');
        }
        if (record.min_stock && record.min_stock < 0) {
          errors.push('Minimum stock cannot be negative');
        }
        if (record.max_stock && record.max_stock < 0) {
          errors.push('Maximum stock cannot be negative');
        }
        if (record.min_stock && record.max_stock && record.min_stock > record.max_stock) {
          errors.push('Minimum stock cannot be greater than maximum stock');
        }
        if (record.expiry_date) {
          const expiryDate = new Date(record.expiry_date);
          if (isNaN(expiryDate.getTime())) {
            errors.push('Invalid expiry date format');
          } else if (expiryDate < new Date()) {
            warnings.push('Item has already expired');
          }
        }
        break;

      case 'waste':
        if (record.quantity <= 0) {
          errors.push('Waste quantity must be greater than 0');
        }
        if (record.cost && record.cost < 0) {
          errors.push('Waste cost cannot be negative');
        }
        if (record.date) {
          const wasteDate = new Date(record.date);
          if (isNaN(wasteDate.getTime())) {
            errors.push('Invalid date format');
          } else if (wasteDate > new Date()) {
            warnings.push('Waste date is in the future');
          }
        }
        break;

      case 'sales':
        if (record.quantity <= 0) {
          errors.push('Sale quantity must be greater than 0');
        }
        if (record.unit_price <= 0) {
          errors.push('Unit price must be greater than 0');
        }
        if (record.total_amount <= 0) {
          errors.push('Total amount must be greater than 0');
        }
        if (record.unit_price && record.quantity && record.total_amount) {
          const expectedTotal = record.unit_price * record.quantity;
          const difference = Math.abs(expectedTotal - record.total_amount);
          if (difference > 0.01) { // Allow for small rounding differences
            warnings.push(`Total amount (${record.total_amount}) doesn't match calculated total (${expectedTotal})`);
          }
        }
        break;

      case 'suppliers':
        if (record.email && !this.isValidEmail(record.email)) {
          errors.push('Invalid email format');
        }
        break;

      case 'outlets':
        if (record.email && !this.isValidEmail(record.email)) {
          errors.push('Invalid email format');
        }
        if (record.capacity && record.capacity <= 0) {
          errors.push('Capacity must be greater than 0');
        }
        break;
    }
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Transform and enrich CSV data
   */
  async transformCSVData(records, dataType, userId) {
    const transformedRecords = [];

    for (const record of records) {
      const transformedRecord = { ...record };
      transformedRecord.user_id = userId;

      // Add timestamps
      transformedRecord.created_at = new Date().toISOString();
      transformedRecord.updated_at = new Date().toISOString();

      // Data-specific transformations
      switch (dataType) {
        case 'inventory':
          transformedRecord.is_active = true;
          if (!transformedRecord.min_stock) {
            transformedRecord.min_stock = 0;
          }
          if (!transformedRecord.max_stock) {
            transformedRecord.max_stock = transformedRecord.current_stock * 2;
          }
          break;

        case 'waste':
          // Ensure date is properly formatted
          if (transformedRecord.date) {
            transformedRecord.date = new Date(transformedRecord.date).toISOString().split('T')[0];
          }
          break;

        case 'sales':
          transformedRecord.transaction_date = new Date(transformedRecord.transaction_date).toISOString().split('T')[0];
          if (transformedRecord.transaction_time) {
            // Ensure time is properly formatted
            transformedRecord.transaction_time = transformedRecord.transaction_time.toString();
          }
          break;

        case 'suppliers':
        case 'outlets':
          transformedRecord.is_active = true;
          if (!transformedRecord.country) {
            transformedRecord.country = 'Malaysia';
          }
          break;
      }

      transformedRecords.push(transformedRecord);
    }

    return transformedRecords;
  }

  /**
   * Process uploaded CSV data and generate AI insights
   */
  async processUploadedData(userId, dataType, csvData) {
    try {
      logger.info(`Processing ${csvData.length} ${dataType} records for user ${userId}`);

      // Validate CSV data
      const validation = this.validateCSVData(csvData, dataType);
      
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings,
          summary: validation.summary,
          message: `Validation failed: ${validation.errors.length} errors found`
        };
      }

      // Transform data
      const transformedData = await this.transformCSVData(validation.validRecords, dataType, userId);

      // Insert data into database
      const insertResult = await this.insertDataToDatabase(transformedData, dataType);
      
      if (!insertResult.success) {
        return insertResult;
      }

      // Invalidate relevant cache
      await this.invalidateRelevantCache(userId, dataType);

      // Generate immediate insights based on the uploaded data
      const insights = await this.generateImmediateInsights(userId, dataType);
      
      // Store insights in cache
      await this.cacheService.cacheAnalytics(userId, dataType, insights);
      
      // Trigger AI recommendations
      await this.triggerAIRecommendations(userId, dataType);
      
      return {
        success: true,
        insights: insights,
        summary: validation.summary,
        warnings: validation.warnings,
        message: `Successfully processed ${validation.summary.valid} ${dataType} records and generated insights`
      };
    } catch (error) {
      logger.error('Error processing uploaded data:', error);
      throw error;
    }
  }

  /**
   * Insert transformed data into database
   */
  async insertDataToDatabase(data, dataType) {
    try {
      if (!this.supabase) {
        throw new Error('Database connection not available');
      }

      const tableMap = {
        inventory: 'inventory',
        waste: 'waste_logs',
        suppliers: 'suppliers',
        outlets: 'outlets',
        sales: 'sales_pos_data'
      };

      const tableName = tableMap[dataType];
      if (!tableName) {
        throw new Error(`Unknown table for data type: ${dataType}`);
      }

      const { data: insertedData, error } = await this.supabase
        .from(tableName)
        .insert(data)
        .select();

      if (error) {
        logger.error(`Error inserting ${dataType} data:`, error);
        return {
          success: false,
          error: error.message,
          message: `Failed to insert ${dataType} data into database`
        };
      }

      logger.info(`Successfully inserted ${insertedData.length} ${dataType} records`);
      return {
        success: true,
        data: insertedData,
        message: `Successfully inserted ${insertedData.length} records`
      };
    } catch (error) {
      logger.error(`Error inserting ${dataType} data:`, error);
      return {
        success: false,
        error: error.message,
        message: `Failed to insert ${dataType} data`
      };
    }
  }

  /**
   * Invalidate relevant cache entries
   */
  async invalidateRelevantCache(userId, dataType) {
    try {
      const cacheKeys = [];
      
      switch (dataType) {
        case 'inventory':
          cacheKeys.push(`inventory:${userId}`, `analytics:${userId}:inventory`);
          break;
        case 'waste':
          cacheKeys.push(`waste:${userId}`, `analytics:${userId}:waste`);
          break;
        case 'suppliers':
          cacheKeys.push(`suppliers:${userId}`, `analytics:${userId}:suppliers`);
          break;
        case 'outlets':
          cacheKeys.push(`outlets:${userId}`, `analytics:${userId}:outlets`);
          break;
        case 'sales':
          cacheKeys.push(`analytics:${userId}:sales`);
          break;
      }

      // Also invalidate AI recommendations cache
      cacheKeys.push(`ai:${userId}:*`);

      for (const key of cacheKeys) {
        await this.cacheService.del(key);
      }

      logger.info(`Invalidated cache for user ${userId} and data type ${dataType}`);
    } catch (error) {
      logger.error('Error invalidating cache:', error);
    }
  }

  /**
   * Generate immediate insights from uploaded data
   */
  async generateImmediateInsights(userId, dataType) {
    const insights = {
      summary: {},
      trends: {},
      recommendations: [],
      timestamp: new Date().toISOString()
    };

    try {
      switch (dataType) {
        case 'inventory':
          insights.summary = await this.analyzeInventoryData(userId);
          insights.trends = await this.analyzeInventoryTrends(userId);
          insights.recommendations = await this.generateInventoryRecommendations(userId);
          break;
        
        case 'sales':
          insights.summary = await this.analyzeSalesData(userId);
          insights.trends = await this.analyzeSalesTrends(userId);
          insights.recommendations = await this.generateSalesRecommendations(userId);
          break;
        
        case 'waste':
          insights.summary = await this.analyzeWasteData(userId);
          insights.trends = await this.analyzeWasteTrends(userId);
          insights.recommendations = await this.generateWasteRecommendations(userId);
          break;
        
        case 'supplier':
          insights.summary = await this.analyzeSupplierData(userId);
          insights.trends = await this.analyzeSupplierTrends(userId);
          insights.recommendations = await this.generateSupplierRecommendations(userId);
          break;
      }

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return insights;
    }
  }

  /**
   * Analyze inventory data
   */
  async analyzeInventoryData(userId) {
    try {
      const { data, error } = await this.supabase
        .from('inventory_data')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { message: 'No inventory data found' };
      }

      const totalItems = data.length;
      const totalValue = data.reduce((sum, item) => sum + (item.current_stock * item.unit_cost), 0);
      const lowStockItems = data.filter(item => item.current_stock <= item.reorder_point).length;
      const expiringItems = data.filter(item => {
        const expiryDate = new Date(item.expiry_date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow;
      }).length;

      return {
        totalItems,
        totalValue: totalValue.toFixed(2),
        lowStockItems,
        expiringItems,
        averageStockLevel: (data.reduce((sum, item) => sum + item.current_stock, 0) / totalItems).toFixed(2)
      };
    } catch (error) {
      console.error('Error analyzing inventory data:', error);
      return { error: 'Failed to analyze inventory data' };
    }
  }

  /**
   * Analyze sales data
   */
  async analyzeSalesData(userId) {
    try {
      const { data, error } = await this.supabase
        .from('sales_pos_data')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { message: 'No sales data found' };
      }

      const totalTransactions = data.length;
      const totalRevenue = data.reduce((sum, sale) => sum + parseFloat(sale.total_revenue), 0);
      const averageOrderValue = totalRevenue / totalTransactions;
      const topItems = this.getTopItems(data, 'item_name', 5);

      return {
        totalTransactions,
        totalRevenue: totalRevenue.toFixed(2),
        averageOrderValue: averageOrderValue.toFixed(2),
        topItems
      };
    } catch (error) {
      console.error('Error analyzing sales data:', error);
      return { error: 'Failed to analyze sales data' };
    }
  }

  /**
   * Analyze waste data
   */
  async analyzeWasteData(userId) {
    try {
      const { data, error } = await this.supabase
        .from('waste_logs')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { message: 'No waste data found' };
      }

      const totalWasteRecords = data.length;
      const totalWasteCost = data.reduce((sum, waste) => sum + parseFloat(waste.total_cost), 0);
      const wasteByType = this.groupBy(data, 'waste_type');
      const topWasteReasons = this.getTopItems(data, 'reason', 5);

      return {
        totalWasteRecords,
        totalWasteCost: totalWasteCost.toFixed(2),
        wasteByType,
        topWasteReasons
      };
    } catch (error) {
      console.error('Error analyzing waste data:', error);
      return { error: 'Failed to analyze waste data' };
    }
  }

  /**
   * Analyze supplier data
   */
  async analyzeSupplierData(userId) {
    try {
      const { data, error } = await this.supabase
        .from('supplier_data')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { message: 'No supplier data found' };
      }

      const totalSuppliers = data.length;
      const averageRating = data.reduce((sum, supplier) => sum + (supplier.rating || 0), 0) / totalSuppliers;
      const topRatedSuppliers = data
        .filter(supplier => supplier.rating)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
        .map(supplier => supplier.supplier_name);

      return {
        totalSuppliers,
        averageRating: averageRating.toFixed(1),
        topRatedSuppliers
      };
    } catch (error) {
      console.error('Error analyzing supplier data:', error);
      return { error: 'Failed to analyze supplier data' };
    }
  }

  /**
   * Generate inventory recommendations
   */
  async generateInventoryRecommendations(userId) {
    try {
      const { data, error } = await this.supabase
        .from('inventory_data')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const recommendations = [];

      // Check for low stock items
      const lowStockItems = data.filter(item => item.current_stock <= item.reorder_point);
      if (lowStockItems.length > 0) {
        recommendations.push({
          type: 'low_stock',
          priority: 'high',
          message: `${lowStockItems.length} items are running low on stock`,
          items: lowStockItems.map(item => item.item_name)
        });
      }

      // Check for expiring items
      const expiringItems = data.filter(item => {
        const expiryDate = new Date(item.expiry_date);
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        return expiryDate <= sevenDaysFromNow;
      });

      if (expiringItems.length > 0) {
        recommendations.push({
          type: 'expiring',
          priority: 'critical',
          message: `${expiringItems.length} items are expiring soon`,
          items: expiringItems.map(item => item.item_name)
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating inventory recommendations:', error);
      return [];
    }
  }

  /**
   * Generate sales recommendations
   */
  async generateSalesRecommendations(userId) {
    try {
      const { data, error } = await this.supabase
        .from('sales_pos_data')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const recommendations = [];

      // Analyze sales patterns
      const salesByItem = this.groupBy(data, 'item_name');
      const topSellers = Object.entries(salesByItem)
        .map(([item, sales]) => ({
          item,
          totalSales: sales.reduce((sum, sale) => sum + parseFloat(sale.total_revenue), 0)
        }))
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 3);

      if (topSellers.length > 0) {
        recommendations.push({
          type: 'top_sellers',
          priority: 'medium',
          message: 'Your top performing items',
          items: topSellers.map(seller => seller.item)
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating sales recommendations:', error);
      return [];
    }
  }

  /**
   * Generate waste recommendations
   */
  async generateWasteRecommendations(userId) {
    try {
      const { data, error } = await this.supabase
        .from('waste_logs')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const recommendations = [];

      // Analyze waste patterns
      const wasteByType = this.groupBy(data, 'waste_type');
      const highWasteTypes = Object.entries(wasteByType)
        .map(([type, wastes]) => ({
          type,
          totalCost: wastes.reduce((sum, waste) => sum + parseFloat(waste.total_cost), 0)
        }))
        .sort((a, b) => b.totalCost - a.totalCost)
        .slice(0, 3);

      if (highWasteTypes.length > 0) {
        recommendations.push({
          type: 'high_waste',
          priority: 'high',
          message: 'Areas with highest waste costs',
          items: highWasteTypes.map(waste => waste.type)
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating waste recommendations:', error);
      return [];
    }
  }

  /**
   * Generate supplier recommendations
   */
  async generateSupplierRecommendations(userId) {
    try {
      const { data, error } = await this.supabase
        .from('supplier_data')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const recommendations = [];

      // Check for suppliers with low ratings
      const lowRatedSuppliers = data.filter(supplier => supplier.rating && supplier.rating < 3);
      if (lowRatedSuppliers.length > 0) {
        recommendations.push({
          type: 'low_rated_suppliers',
          priority: 'medium',
          message: 'Suppliers with low ratings',
          items: lowRatedSuppliers.map(supplier => supplier.supplier_name)
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating supplier recommendations:', error);
      return [];
    }
  }

  /**
   * Store insights in the database
   */
  async storeInsights(userId, dataType, insights) {
    try {
      const { error } = await this.supabase
        .from('analytics')
        .insert([{
          user_id: userId,
          data_type: dataType,
          data: insights,
          period_start: new Date().toISOString(),
          period_end: new Date().toISOString()
        }]);

      if (error) throw error;
      console.log(`Stored insights for ${dataType} data`);
    } catch (error) {
      console.error('Error storing insights:', error);
    }
  }

  /**
   * Trigger AI recommendations
   */
  async triggerAIRecommendations(userId, dataType) {
    try {
      // Get AI recommendations for the relevant sections
      const sections = this.getRelevantSections(dataType);
      
      for (const section of sections) {
        await getRecommendations(userId, section);
      }
      
      console.log(`Triggered AI recommendations for ${dataType} data`);
    } catch (error) {
      console.error('Error triggering AI recommendations:', error);
    }
  }

  /**
   * Get relevant sections for data type
   */
  getRelevantSections(dataType) {
    const sectionMap = {
      'inventory': ['inventory', 'dashboard'],
      'sales': ['demand', 'menu', 'dashboard'],
      'waste': ['waste', 'dashboard'],
      'supplier': ['supplier', 'dashboard']
    };
    
    return sectionMap[dataType] || ['dashboard'];
  }

  /**
   * Helper method to group data by a field
   */
  groupBy(data, field) {
    return data.reduce((groups, item) => {
      const value = item[field];
      if (!groups[value]) {
        groups[value] = [];
      }
      groups[value].push(item);
      return groups;
    }, {});
  }

  /**
   * Helper method to get top items by count
   */
  getTopItems(data, field, limit = 5) {
    const counts = {};
    data.forEach(item => {
      const value = item[field];
      counts[value] = (counts[value] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([item, count]) => ({ item, count }));
  }

  /**
   * Analyze trends (placeholder for future implementation)
   */
  async analyzeInventoryTrends(userId) {
    // Placeholder for trend analysis
    return { message: 'Trend analysis will be implemented in future updates' };
  }

  async analyzeSalesTrends(userId) {
    return { message: 'Trend analysis will be implemented in future updates' };
  }

  async analyzeWasteTrends(userId) {
    return { message: 'Trend analysis will be implemented in future updates' };
  }

  async analyzeSupplierTrends(userId) {
    return { message: 'Trend analysis will be implemented in future updates' };
  }
}

export default CSVProcessingService;
