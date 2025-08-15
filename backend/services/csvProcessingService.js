import { createClient } from '@supabase/supabase-js';
import { getRecommendations } from '../recommendations.js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

export class CSVProcessingService {
  constructor() {
    this.supabase = supabase;
  }

  /**
   * Process uploaded CSV data and generate AI insights
   */
  async processUploadedData(userId, dataType, recordCount) {
    try {
      console.log(`Processing ${recordCount} ${dataType} records for user ${userId}`);

      // Generate immediate insights based on the uploaded data
      const insights = await this.generateImmediateInsights(userId, dataType);
      
      // Store insights in the database
      await this.storeInsights(userId, dataType, insights);
      
      // Trigger AI recommendations
      await this.triggerAIRecommendations(userId, dataType);
      
      return {
        success: true,
        insights: insights,
        message: `Successfully processed ${recordCount} ${dataType} records and generated insights`
      };
    } catch (error) {
      console.error('Error processing uploaded data:', error);
      throw error;
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
