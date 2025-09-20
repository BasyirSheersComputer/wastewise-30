/**
 * Analytics Routes for WasteWise
 * Handles statistical models, forecasting, and analytics endpoints
 */

import express from 'express';
import StatisticalModels from '../services/statisticalModels.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, query, param } from 'express-validator';

const router = express.Router();

// Initialize statistical models service
let statisticalModels;
const initializeStatisticalModels = async () => {
  try {
    const databaseService = (await import('../services/databaseService.js')).default;
    const cacheService = (await import('../services/cacheService.js')).default;
    statisticalModels = new StatisticalModels(databaseService, cacheService);
  } catch (error) {
    console.error('Failed to initialize statistical models:', error);
  }
};

// Initialize on module load
initializeStatisticalModels();

/**
 * @route GET /api/analytics/demand-forecast
 * @desc Get demand forecast for specific item
 * @access Private
 */
router.get('/demand-forecast', 
  authenticateToken,
  [
    query('outletId').isUUID().withMessage('Valid outlet ID required'),
    query('itemId').isUUID().withMessage('Valid item ID required'),
    query('days').optional().isInt({ min: 1, max: 90 }).withMessage('Days must be between 1 and 90')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { outletId, itemId } = req.query;
      const days = parseInt(req.query.days) || 30;
      const userId = req.user.id;

      if (!statisticalModels) {
        return res.status(503).json({
          success: false,
          message: 'Analytics service temporarily unavailable'
        });
      }

      const forecast = await statisticalModels.forecastDemand(userId, outletId, itemId, days);

      res.json({
        success: true,
        data: forecast,
        message: 'Demand forecast generated successfully'
      });
    } catch (error) {
      console.error('Demand forecast error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate demand forecast'
      });
    }
  }
);

/**
 * @route GET /api/analytics/waste-prediction
 * @desc Get waste prediction for outlet or category
 * @access Private
 */
router.get('/waste-prediction',
  authenticateToken,
  [
    query('outletId').isUUID().withMessage('Valid outlet ID required'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('days').optional().isInt({ min: 1, max: 90 }).withMessage('Days must be between 1 and 90')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { outletId, category } = req.query;
      const days = parseInt(req.query.days) || 30;
      const userId = req.user.id;

      if (!statisticalModels) {
        return res.status(503).json({
          success: false,
          message: 'Analytics service temporarily unavailable'
        });
      }

      const prediction = await statisticalModels.predictWaste(userId, outletId, category, days);

      res.json({
        success: true,
        data: prediction,
        message: 'Waste prediction generated successfully'
      });
    } catch (error) {
      console.error('Waste prediction error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate waste prediction'
      });
    }
  }
);

/**
 * @route GET /api/analytics/inventory-optimization
 * @desc Get inventory optimization recommendations
 * @access Private
 */
router.get('/inventory-optimization',
  authenticateToken,
  [
    query('outletId').isUUID().withMessage('Valid outlet ID required')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { outletId } = req.query;
      const userId = req.user.id;

      if (!statisticalModels) {
        return res.status(503).json({
          success: false,
          message: 'Analytics service temporarily unavailable'
        });
      }

      const optimization = await statisticalModels.optimizeInventory(userId, outletId);

      res.json({
        success: true,
        data: optimization,
        message: 'Inventory optimization completed successfully'
      });
    } catch (error) {
      console.error('Inventory optimization error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to optimize inventory'
      });
    }
  }
);

/**
 * @route GET /api/analytics/performance-metrics
 * @desc Get overall performance metrics and KPIs
 * @access Private
 */
router.get('/performance-metrics',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { outletId } = req.query;

      // Get comprehensive performance metrics
      const metrics = await getPerformanceMetrics(userId, outletId);

      res.json({
        success: true,
        data: metrics,
        message: 'Performance metrics retrieved successfully'
      });
    } catch (error) {
      console.error('Performance metrics error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve performance metrics'
      });
    }
  }
);

/**
 * @route GET /api/analytics/trend-analysis
 * @desc Get trend analysis for various metrics
 * @access Private
 */
router.get('/trend-analysis',
  authenticateToken,
  [
    query('metric').isIn(['waste', 'sales', 'inventory', 'cost']).withMessage('Valid metric required'),
    query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Valid period required'),
    query('outletId').optional().isUUID().withMessage('Valid outlet ID required')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { metric, period = '30d', outletId } = req.query;
      const userId = req.user.id;

      const trendData = await getTrendAnalysis(userId, outletId, metric, period);

      res.json({
        success: true,
        data: trendData,
        message: 'Trend analysis completed successfully'
      });
    } catch (error) {
      console.error('Trend analysis error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to perform trend analysis'
      });
    }
  }
);

/**
 * @route GET /api/analytics/comparative-analysis
 * @desc Get comparative analysis between outlets or time periods
 * @access Private
 */
router.get('/comparative-analysis',
  authenticateToken,
  [
    query('type').isIn(['outlets', 'periods']).withMessage('Valid comparison type required'),
    query('metric').isIn(['waste', 'sales', 'efficiency', 'cost']).withMessage('Valid metric required')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { type, metric } = req.query;
      const userId = req.user.id;

      const comparisonData = await getComparativeAnalysis(userId, type, metric);

      res.json({
        success: true,
        data: comparisonData,
        message: 'Comparative analysis completed successfully'
      });
    } catch (error) {
      console.error('Comparative analysis error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to perform comparative analysis'
      });
    }
  }
);

/**
 * @route POST /api/analytics/custom-report
 * @desc Generate custom analytics report
 * @access Private
 */
router.post('/custom-report',
  authenticateToken,
  [
    body('name').isString().isLength({ min: 1, max: 100 }).withMessage('Report name required'),
    body('metrics').isArray({ min: 1 }).withMessage('At least one metric required'),
    body('filters').optional().isObject().withMessage('Filters must be an object'),
    body('format').optional().isIn(['json', 'csv', 'pdf']).withMessage('Valid format required')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { name, metrics, filters = {}, format = 'json' } = req.body;
      const userId = req.user.id;

      const report = await generateCustomReport(userId, name, metrics, filters, format);

      res.json({
        success: true,
        data: report,
        message: 'Custom report generated successfully'
      });
    } catch (error) {
      console.error('Custom report error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate custom report'
      });
    }
  }
);

/**
 * @route GET /api/analytics/health-check
 * @desc Check analytics service health
 * @access Private
 */
router.get('/health-check',
  authenticateToken,
  async (req, res) => {
    try {
      const health = await checkAnalyticsHealth();

      res.json({
        success: true,
        data: health,
        message: 'Analytics health check completed'
      });
    } catch (error) {
      console.error('Analytics health check error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Analytics health check failed'
      });
    }
  }
);

// Helper functions

async function getPerformanceMetrics(userId, outletId) {
  const databaseService = (await import('../services/databaseService.js')).default;
  
  try {
    // Get basic metrics
    const [wasteData, salesData, inventoryData] = await Promise.all([
      getWasteMetrics(databaseService, userId, outletId),
      getSalesMetrics(databaseService, userId, outletId),
      getInventoryMetrics(databaseService, userId, outletId)
    ]);

    // Calculate derived metrics
    const efficiency = calculateEfficiency(wasteData, salesData);
    const costSavings = calculateCostSavings(wasteData);
    const trends = calculateTrends(wasteData, salesData);

    return {
      waste: wasteData,
      sales: salesData,
      inventory: inventoryData,
      efficiency,
      costSavings,
      trends,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    throw error;
  }
}

async function getWasteMetrics(databaseService, userId, outletId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let query = databaseService
    .from('waste_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('waste_date', thirtyDaysAgo.toISOString());

  if (outletId) {
    query = query.eq('outlet_id', outletId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const totalWaste = data.reduce((sum, item) => sum + item.quantity, 0);
  const dailyAverage = totalWaste / 30;
  const categories = {};

  data.forEach(item => {
    categories[item.category] = (categories[item.category] || 0) + item.quantity;
  });

  return {
    total: totalWaste,
    dailyAverage: Math.round(dailyAverage * 100) / 100,
    categories,
    trend: calculateWasteTrend(data)
  };
}

async function getSalesMetrics(databaseService, userId, outletId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let query = databaseService
    .from('sales_transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('transaction_date', thirtyDaysAgo.toISOString());

  if (outletId) {
    query = query.eq('outlet_id', outletId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const totalSales = data.reduce((sum, item) => sum + item.quantity, 0);
  const totalRevenue = data.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const dailyAverage = totalSales / 30;

  return {
    totalQuantity: totalSales,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    dailyAverage: Math.round(dailyAverage * 100) / 100,
    trend: calculateSalesTrend(data)
  };
}

async function getInventoryMetrics(databaseService, userId, outletId) {
  let query = databaseService
    .from('inventory')
    .select('*')
    .eq('user_id', userId);

  if (outletId) {
    query = query.eq('outlet_id', outletId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const totalItems = data.length;
  const totalValue = data.reduce((sum, item) => sum + (item.current_stock * item.cost_per_unit), 0);
  const lowStockItems = data.filter(item => item.current_stock <= item.min_stock).length;
  const overstockItems = data.filter(item => item.current_stock > item.max_stock).length;

  return {
    totalItems,
    totalValue: Math.round(totalValue * 100) / 100,
    lowStockItems,
    overstockItems,
    stockHealth: calculateStockHealth(lowStockItems, overstockItems, totalItems)
  };
}

function calculateEfficiency(wasteData, salesData) {
  const wasteRatio = wasteData.total / (wasteData.total + salesData.totalQuantity);
  const efficiency = Math.max(0, (1 - wasteRatio) * 100);
  
  return {
    overall: Math.round(efficiency * 100) / 100,
    wasteRatio: Math.round(wasteRatio * 10000) / 100, // Percentage with 2 decimals
    grade: getEfficiencyGrade(efficiency)
  };
}

function calculateCostSavings(wasteData) {
  const costPerUnit = 2.5; // Estimated cost per unit of waste
  const currentWasteCost = wasteData.total * costPerUnit;
  const potentialSavings = currentWasteCost * 0.3; // Assume 30% reduction possible
  
  return {
    currentCost: Math.round(currentWasteCost * 100) / 100,
    potentialSavings: Math.round(potentialSavings * 100) / 100,
    monthlySavings: Math.round(potentialSavings * 100) / 100,
    annualSavings: Math.round(potentialSavings * 12 * 100) / 100
  };
}

function calculateTrends(wasteData, salesData) {
  return {
    waste: wasteData.trend,
    sales: salesData.trend,
    overall: calculateOverallTrend(wasteData.trend, salesData.trend)
  };
}

function calculateWasteTrend(data) {
  if (data.length < 14) return 'insufficient_data';
  
  const recent = data.slice(0, 7);
  const older = data.slice(7, 14);
  
  const recentAvg = recent.reduce((sum, item) => sum + item.quantity, 0) / recent.length;
  const olderAvg = older.reduce((sum, item) => sum + item.quantity, 0) / older.length;
  
  const change = (recentAvg - olderAvg) / olderAvg;
  
  if (change > 0.1) return 'increasing';
  if (change < -0.1) return 'decreasing';
  return 'stable';
}

function calculateSalesTrend(data) {
  if (data.length < 14) return 'insufficient_data';
  
  const recent = data.slice(0, 7);
  const older = data.slice(7, 14);
  
  const recentAvg = recent.reduce((sum, item) => sum + item.quantity, 0) / recent.length;
  const olderAvg = older.reduce((sum, item) => sum + item.quantity, 0) / older.length;
  
  const change = (recentAvg - olderAvg) / olderAvg;
  
  if (change > 0.1) return 'increasing';
  if (change < -0.1) return 'decreasing';
  return 'stable';
}

function calculateOverallTrend(wasteTrend, salesTrend) {
  if (wasteTrend === 'decreasing' && salesTrend === 'increasing') return 'excellent';
  if (wasteTrend === 'stable' && salesTrend === 'increasing') return 'good';
  if (wasteTrend === 'increasing' && salesTrend === 'decreasing') return 'poor';
  return 'moderate';
}

function calculateStockHealth(lowStock, overstock, total) {
  const healthScore = ((total - lowStock - overstock) / total) * 100;
  return {
    score: Math.round(healthScore),
    grade: getHealthGrade(healthScore),
    issues: {
      lowStock,
      overstock,
      healthy: total - lowStock - overstock
    }
  };
}

function getEfficiencyGrade(efficiency) {
  if (efficiency >= 90) return 'A';
  if (efficiency >= 80) return 'B';
  if (efficiency >= 70) return 'C';
  if (efficiency >= 60) return 'D';
  return 'F';
}

function getHealthGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

async function getTrendAnalysis(userId, outletId, metric, period) {
  const databaseService = (await import('../services/databaseService.js')).default;
  
  const days = getDaysFromPeriod(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let data;
  switch (metric) {
    case 'waste':
      data = await getWasteTrendData(databaseService, userId, outletId, startDate);
      break;
    case 'sales':
      data = await getSalesTrendData(databaseService, userId, outletId, startDate);
      break;
    case 'inventory':
      data = await getInventoryTrendData(databaseService, userId, outletId, startDate);
      break;
    case 'cost':
      data = await getCostTrendData(databaseService, userId, outletId, startDate);
      break;
    default:
      throw new Error('Invalid metric');
  }

  return {
    metric,
    period,
    data,
    summary: calculateTrendSummary(data),
    timestamp: new Date().toISOString()
  };
}

function getDaysFromPeriod(period) {
  const periodMap = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
  };
  return periodMap[period] || 30;
}

async function getWasteTrendData(databaseService, userId, outletId, startDate) {
  let query = databaseService
    .from('waste_logs')
    .select('waste_date, quantity, category')
    .eq('user_id', userId)
    .gte('waste_date', startDate.toISOString())
    .order('waste_date', { ascending: true });

  if (outletId) {
    query = query.eq('outlet_id', outletId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data;
}

async function getSalesTrendData(databaseService, userId, outletId, startDate) {
  let query = databaseService
    .from('sales_transactions')
    .select('transaction_date, quantity, price')
    .eq('user_id', userId)
    .gte('transaction_date', startDate.toISOString())
    .order('transaction_date', { ascending: true });

  if (outletId) {
    query = query.eq('outlet_id', outletId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data;
}

async function getInventoryTrendData(databaseService, userId, outletId, startDate) {
  // For inventory trends, we'll get current state and calculate changes
  let query = databaseService
    .from('inventory')
    .select('*')
    .eq('user_id', userId);

  if (outletId) {
    query = query.eq('outlet_id', outletId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data;
}

async function getCostTrendData(databaseService, userId, outletId, startDate) {
  // Combine waste and inventory data to calculate cost trends
  const [wasteData, inventoryData] = await Promise.all([
    getWasteTrendData(databaseService, userId, outletId, startDate),
    getInventoryTrendData(databaseService, userId, outletId, startDate)
  ]);

  // Calculate costs
  const wasteCost = wasteData.reduce((sum, item) => sum + item.quantity * 2.5, 0);
  const inventoryValue = inventoryData.reduce((sum, item) => sum + item.current_stock * item.cost_per_unit, 0);

  return {
    wasteCost,
    inventoryValue,
    totalCost: wasteCost + inventoryValue,
    trends: {
      waste: wasteData,
      inventory: inventoryData
    }
  };
}

function calculateTrendSummary(data) {
  if (!data || data.length === 0) {
    return { trend: 'no_data', change: 0 };
  }

  const values = Array.isArray(data) ? data.map(item => item.quantity || item.value || 0) : [data.totalCost];
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  const change = ((secondAvg - firstAvg) / firstAvg) * 100;

  let trend = 'stable';
  if (change > 5) trend = 'increasing';
  else if (change < -5) trend = 'decreasing';

  return {
    trend,
    change: Math.round(change * 100) / 100,
    firstPeriod: Math.round(firstAvg * 100) / 100,
    secondPeriod: Math.round(secondAvg * 100) / 100
  };
}

async function getComparativeAnalysis(userId, type, metric) {
  const databaseService = (await import('../services/databaseService.js')).default;
  
  if (type === 'outlets') {
    return await compareOutlets(databaseService, userId, metric);
  } else if (type === 'periods') {
    return await comparePeriods(databaseService, userId, metric);
  }
}

async function compareOutlets(databaseService, userId, metric) {
  // Get all outlets for user
  const { data: outlets, error: outletsError } = await databaseService
    .from('outlets')
    .select('id, name, location')
    .eq('user_id', userId);

  if (outletsError) throw outletsError;

  // Get metric data for each outlet
  const comparisons = await Promise.all(
    outlets.map(async outlet => {
      const metricData = await getMetricForOutlet(databaseService, userId, outlet.id, metric);
      return {
        outletId: outlet.id,
        outletName: outlet.name,
        location: outlet.location,
        metric: metricData
      };
    })
  );

  // Calculate rankings and insights
  const sorted = comparisons.sort((a, b) => b.metric.value - a.metric.value);
  
  return {
    type: 'outlets',
    metric,
    comparisons,
    rankings: sorted,
    insights: generateComparisonInsights(sorted, metric),
    timestamp: new Date().toISOString()
  };
}

async function comparePeriods(databaseService, userId, metric) {
  const currentPeriod = await getMetricForPeriod(databaseService, userId, 30, metric);
  const previousPeriod = await getMetricForPeriod(databaseService, userId, 30, metric, 30);

  const change = ((currentPeriod.value - previousPeriod.value) / previousPeriod.value) * 100;

  return {
    type: 'periods',
    metric,
    current: currentPeriod,
    previous: previousPeriod,
    change: Math.round(change * 100) / 100,
    trend: change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
    insights: generatePeriodInsights(currentPeriod, previousPeriod, metric),
    timestamp: new Date().toISOString()
  };
}

async function getMetricForOutlet(databaseService, userId, outletId, metric) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  switch (metric) {
    case 'waste':
      const { data: wasteData } = await databaseService
        .from('waste_logs')
        .select('quantity')
        .eq('user_id', userId)
        .eq('outlet_id', outletId)
        .gte('waste_date', thirtyDaysAgo.toISOString());
      
      return {
        value: wasteData.reduce((sum, item) => sum + item.quantity, 0),
        unit: 'units',
        period: '30 days'
      };

    case 'sales':
      const { data: salesData } = await databaseService
        .from('sales_transactions')
        .select('quantity, price')
        .eq('user_id', userId)
        .eq('outlet_id', outletId)
        .gte('transaction_date', thirtyDaysAgo.toISOString());
      
      const revenue = salesData.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      return {
        value: revenue,
        unit: 'USD',
        period: '30 days'
      };

    case 'efficiency':
      // Calculate efficiency based on waste vs sales ratio
      const wasteTotal = wasteData.reduce((sum, item) => sum + item.quantity, 0);
      const salesTotal = salesData.reduce((sum, item) => sum + item.quantity, 0);
      const efficiency = salesTotal > 0 ? ((salesTotal - wasteTotal) / salesTotal) * 100 : 0;
      
      return {
        value: Math.round(efficiency * 100) / 100,
        unit: '%',
        period: '30 days'
      };

    case 'cost':
      const wasteCost = wasteTotal * 2.5;
      return {
        value: wasteCost,
        unit: 'USD',
        period: '30 days'
      };

    default:
      throw new Error('Invalid metric');
  }
}

async function getMetricForPeriod(databaseService, userId, days, metric, offset = 0) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - offset);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days - offset);

  switch (metric) {
    case 'waste':
      const { data: wasteData } = await databaseService
        .from('waste_logs')
        .select('quantity')
        .eq('user_id', userId)
        .gte('waste_date', startDate.toISOString())
        .lte('waste_date', endDate.toISOString());
      
      return {
        value: wasteData.reduce((sum, item) => sum + item.quantity, 0),
        unit: 'units',
        period: `${days} days`
      };

    case 'sales':
      const { data: salesData } = await databaseService
        .from('sales_transactions')
        .select('quantity, price')
        .eq('user_id', userId)
        .gte('transaction_date', startDate.toISOString())
        .lte('transaction_date', endDate.toISOString());
      
      const revenue = salesData.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      return {
        value: revenue,
        unit: 'USD',
        period: `${days} days`
      };

    case 'efficiency':
      const wasteTotal = wasteData.reduce((sum, item) => sum + item.quantity, 0);
      const salesTotal = salesData.reduce((sum, item) => sum + item.quantity, 0);
      const efficiency = salesTotal > 0 ? ((salesTotal - wasteTotal) / salesTotal) * 100 : 0;
      
      return {
        value: Math.round(efficiency * 100) / 100,
        unit: '%',
        period: `${days} days`
      };

    case 'cost':
      const wasteCost = wasteTotal * 2.5;
      return {
        value: wasteCost,
        unit: 'USD',
        period: `${days} days`
      };

    default:
      throw new Error('Invalid metric');
  }
}

function generateComparisonInsights(rankings, metric) {
  const insights = [];
  
  if (rankings.length > 1) {
    const best = rankings[0];
    const worst = rankings[rankings.length - 1];
    
    insights.push({
      type: 'best_performer',
      outlet: best.outletName,
      value: best.metric.value,
      unit: best.metric.unit
    });
    
    insights.push({
      type: 'improvement_opportunity',
      outlet: worst.outletName,
      value: worst.metric.value,
      unit: worst.metric.unit
    });
    
    const performanceGap = ((best.metric.value - worst.metric.value) / worst.metric.value) * 100;
    insights.push({
      type: 'performance_gap',
      gap: Math.round(performanceGap * 100) / 100,
      message: `Top performer is ${Math.round(performanceGap)}% better than lowest performer`
    });
  }
  
  return insights;
}

function generatePeriodInsights(current, previous, metric) {
  const insights = [];
  const change = ((current.value - previous.value) / previous.value) * 100;
  
  if (Math.abs(change) > 5) {
    insights.push({
      type: 'significant_change',
      direction: change > 0 ? 'increase' : 'decrease',
      percentage: Math.round(Math.abs(change) * 100) / 100,
      message: `${metric} has ${change > 0 ? 'increased' : 'decreased'} by ${Math.round(Math.abs(change))}%`
    });
  }
  
  return insights;
}

async function generateCustomReport(userId, name, metrics, filters, format) {
  const databaseService = (await import('../services/databaseService.js')).default;
  
  // Generate report data based on requested metrics
  const reportData = {};
  
  for (const metric of metrics) {
    reportData[metric] = await getMetricData(databaseService, userId, metric, filters);
  }
  
  const report = {
    name,
    metrics: reportData,
    filters,
    format,
    generatedAt: new Date().toISOString(),
    generatedBy: userId
  };
  
  // In a real implementation, you would format the data based on the requested format
  // For now, we'll return the structured data
  
  return report;
}

async function getMetricData(databaseService, userId, metric, filters) {
  // Implementation would depend on the specific metric requested
  // This is a simplified version
  switch (metric) {
    case 'waste_summary':
      return await getWasteMetrics(databaseService, userId, filters.outletId);
    case 'sales_summary':
      return await getSalesMetrics(databaseService, userId, filters.outletId);
    case 'inventory_summary':
      return await getInventoryMetrics(databaseService, userId, filters.outletId);
    default:
      throw new Error(`Unknown metric: ${metric}`);
  }
}

async function checkAnalyticsHealth() {
  const health = {
    service: 'analytics',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    components: {}
  };
  
  try {
    // Check database connection
    const databaseService = (await import('../services/databaseService.js')).default;
    const { error: dbError } = await databaseService
      .from('users')
      .select('id')
      .limit(1);
    
    health.components.database = dbError ? 'unhealthy' : 'healthy';
    
    // Check cache service
    const cacheService = (await import('../services/cacheService.js')).default;
    try {
      await cacheService.set('health_check', 'ok', 60);
      const testValue = await cacheService.get('health_check');
      health.components.cache = testValue === 'ok' ? 'healthy' : 'unhealthy';
    } catch (cacheError) {
      health.components.cache = 'unhealthy';
    }
    
    // Check statistical models
    health.components.statisticalModels = statisticalModels ? 'healthy' : 'unhealthy';
    
    // Overall status
    const allHealthy = Object.values(health.components).every(status => status === 'healthy');
    health.status = allHealthy ? 'healthy' : 'degraded';
    
  } catch (error) {
    health.status = 'unhealthy';
    health.error = error.message;
  }
  
  return health;
}

export default router;
