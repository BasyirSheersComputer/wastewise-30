// Statistical Models API Routes
// Based on PRD Implementation Methodology

import express from 'express';
import StatisticalModelsService from '../ai/statisticalModels.js';
import InventoryOptimizationService from '../ai/inventoryOptimization.js';
import AnalyticsModelsService from '../ai/analyticsModels.js';
import { authenticateUser } from '../utils/authMiddleware.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Initialize services
const statisticalModelsService = new StatisticalModelsService();
const inventoryOptimizationService = new InventoryOptimizationService();
const analyticsModelsService = new AnalyticsModelsService();

/**
 * @route GET /api/statistical-models/forecast
 * @desc Get demand forecasting using multiple models
 * @access Private
 */
router.get('/forecast', authenticateUser, async (req, res) => {
  try {
    const { timePeriod = '30d', horizon = 30 } = req.query;
    
    logger.info('Demand forecasting request', { 
      userId: req.user?.id, 
      timePeriod, 
      horizon 
    });
    
    const result = await statisticalModelsService.getDemandForecast(timePeriod);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        timestamp: result.timestamp
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        timestamp: result.timestamp
      });
    }
  } catch (error) {
    logger.error('Demand forecasting API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/statistical-models/inventory-optimization
 * @desc Get inventory optimization recommendations
 * @access Private
 */
router.get('/inventory-optimization', authenticateUser, async (req, res) => {
  try {
    const { timePeriod = '30d' } = req.query;
    
    logger.info('Inventory optimization request', { 
      userId: req.user?.id, 
      timePeriod 
    });
    
    const result = await inventoryOptimizationService.getInventoryOptimization(timePeriod);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        timestamp: result.timestamp
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        timestamp: result.timestamp
      });
    }
  } catch (error) {
    logger.error('Inventory optimization API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/statistical-models/analytics
 * @desc Get advanced analytics insights
 * @access Private
 */
router.get('/analytics', authenticateUser, async (req, res) => {
  try {
    const { timePeriod = '30d' } = req.query;
    
    logger.info('Analytics insights request', { 
      userId: req.user?.id, 
      timePeriod 
    });
    
    const result = await analyticsModelsService.getAnalyticsInsights(timePeriod);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        timestamp: result.timestamp
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        timestamp: result.timestamp
      });
    }
  } catch (error) {
    logger.error('Analytics API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/statistical-models/forecast/:productId
 * @desc Get demand forecast for specific product
 * @access Private
 */
router.get('/forecast/:productId', authenticateUser, async (req, res) => {
  try {
    const { productId } = req.params;
    const { timePeriod = '30d', horizon = 30 } = req.query;
    
    logger.info('Product-specific forecast request', { 
      userId: req.user?.id, 
      productId, 
      timePeriod, 
      horizon 
    });
    
    // Get general forecast and filter for specific product
    const result = await statisticalModelsService.getDemandForecast(timePeriod);
    
    if (result.success) {
      // Filter data for specific product
      const productData = result.data.historical_data.filter(
        item => item.inventory_id === productId
      );
      
      const productForecast = {
        product_id: productId,
        historical_data: productData,
        forecast_summary: result.data.summary,
        recommendations: result.data.summary.recommendations || []
      };
      
      res.json({
        success: true,
        data: productForecast,
        timestamp: result.timestamp
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        timestamp: result.timestamp
      });
    }
  } catch (error) {
    logger.error('Product forecast API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/statistical-models/abc-analysis
 * @desc Get ABC analysis for inventory classification
 * @access Private
 */
router.get('/abc-analysis', authenticateUser, async (req, res) => {
  try {
    const { timePeriod = '30d' } = req.query;
    
    logger.info('ABC analysis request', { 
      userId: req.user?.id, 
      timePeriod 
    });
    
    const result = await inventoryOptimizationService.getInventoryOptimization(timePeriod);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          abc_analysis: result.data.abc_analysis,
          recommendations: result.data.abc_analysis.recommendations,
          summary: result.data.summary
        },
        timestamp: result.timestamp
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        timestamp: result.timestamp
      });
    }
  } catch (error) {
    logger.error('ABC analysis API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/statistical-models/eoq/:productId
 * @desc Get EOQ calculation for specific product
 * @access Private
 */
router.get('/eoq/:productId', authenticateUser, async (req, res) => {
  try {
    const { productId } = req.params;
    const { annualDemand, unitCost, leadTime = 7 } = req.query;
    
    logger.info('EOQ calculation request', { 
      userId: req.user?.id, 
      productId, 
      annualDemand, 
      unitCost 
    });
    
    if (!annualDemand || !unitCost) {
      return res.status(400).json({
        success: false,
        error: 'annualDemand and unitCost are required parameters',
        timestamp: new Date().toISOString()
      });
    }
    
    // Import EOQ calculator
    const { EOQCalculator, DynamicEOQCalculator } = await import('../ai/inventoryOptimization.js');
    const eoqCalculator = new EOQCalculator();
    const dynamicEOQCalculator = new DynamicEOQCalculator();
    
    // Calculate basic EOQ
    const basicEOQ = eoqCalculator.calculateEOQ(
      parseFloat(annualDemand), 
      parseFloat(unitCost)
    );
    
    // Calculate reorder point
    const dailyDemand = parseFloat(annualDemand) / 365;
    const reorderPoint = eoqCalculator.calculateReorderPoint(
      parseInt(leadTime), 
      dailyDemand
    );
    
    // For dynamic EOQ, we need demand data - use basic EOQ as fallback
    const dynamicEOQ = {
      eoq: basicEOQ.eoq,
      safety_stock: 0,
      reorder_point: reorderPoint.reorder_point,
      mean_demand: dailyDemand,
      demand_std: dailyDemand * 0.2, // 20% variability estimate
      service_level: 0.95
    };
    
    res.json({
      success: true,
      data: {
        product_id: productId,
        basic_eoq: basicEOQ,
        dynamic_eoq: dynamicEOQ,
        reorder_point: reorderPoint,
        recommendations: [
          {
            type: 'ordering',
            message: `Order ${Math.round(basicEOQ.eoq)} units when inventory reaches ${Math.round(reorderPoint.reorder_point)}`,
            impact: `Annual cost savings: RM ${Math.round(basicEOQ.total_cost * 0.1)}`
          }
        ]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('EOQ calculation API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/statistical-models/anomalies
 * @desc Get anomaly detection results
 * @access Private
 */
router.get('/anomalies', authenticateUser, async (req, res) => {
  try {
    const { timePeriod = '30d', method = 'zscore' } = req.query;
    
    logger.info('Anomaly detection request', { 
      userId: req.user?.id, 
      timePeriod, 
      method 
    });
    
    const result = await analyticsModelsService.getAnalyticsInsights(timePeriod);
    
    if (result.success) {
      const anomalyData = result.data.anomaly_detection;
      
      res.json({
        success: true,
        data: {
          anomalies: anomalyData.anomalies || [],
          anomaly_count: anomalyData.anomaly_count || 0,
          method: method,
          summary: {
            total_items: anomalyData.anomalies?.length || 0,
            anomaly_rate: anomalyData.anomalies?.length > 0 ? 
              Math.round((anomalyData.anomaly_count / anomalyData.anomalies.length) * 10000) / 100 : 0,
            high_risk_items: anomalyData.anomalies?.filter(a => a.is_anomaly && a.anomaly_score > 0.8).length || 0
          }
        },
        timestamp: result.timestamp
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        timestamp: result.timestamp
      });
    }
  } catch (error) {
    logger.error('Anomaly detection API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/statistical-models/clustering
 * @desc Get product clustering results
 * @access Private
 */
router.get('/clustering', authenticateUser, async (req, res) => {
  try {
    const { timePeriod = '30d', method = 'kmeans' } = req.query;
    
    logger.info('Product clustering request', { 
      userId: req.user?.id, 
      timePeriod, 
      method 
    });
    
    const result = await analyticsModelsService.getAnalyticsInsights(timePeriod);
    
    if (result.success) {
      const clusteringData = result.data.product_clustering;
      
      res.json({
        success: true,
        data: {
          clustering_results: clusteringData,
          selected_method: method,
          summary: {
            best_method: clusteringData.kmeans?.silhouette_score > clusteringData.dbscan?.silhouette_score ? 'kmeans' : 'dbscan',
            cluster_count: clusteringData[method]?.cluster_count || 0,
            silhouette_score: clusteringData[method]?.silhouette_score || 0
          }
        },
        timestamp: result.timestamp
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        timestamp: result.timestamp
      });
    }
  } catch (error) {
    logger.error('Product clustering API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/statistical-models/customer-segmentation
 * @desc Get customer segmentation results
 * @access Private
 */
router.get('/customer-segmentation', authenticateUser, async (req, res) => {
  try {
    const { timePeriod = '30d', method = 'rfm' } = req.query;
    
    logger.info('Customer segmentation request', { 
      userId: req.user?.id, 
      timePeriod, 
      method 
    });
    
    const result = await analyticsModelsService.getAnalyticsInsights(timePeriod);
    
    if (result.success) {
      const segmentationData = result.data.customer_segmentation;
      
      res.json({
        success: true,
        data: {
          segmentation_results: segmentationData,
          selected_method: method,
          summary: {
            total_segments: Object.keys(segmentationData[method]?.segment_analysis || {}).length,
            largest_segment: Object.entries(segmentationData[method]?.segment_analysis || {}).reduce((a, b) => 
              a[1].size > b[1].size ? a : b, ['Unknown', { size: 0 }]
            )[0],
            high_value_customers: segmentationData[method]?.segment_analysis?.['Champions']?.size || 0
          }
        },
        timestamp: result.timestamp
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        timestamp: result.timestamp
      });
    }
  } catch (error) {
    logger.error('Customer segmentation API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/statistical-models/summary
 * @desc Get comprehensive statistical models summary
 * @access Private
 */
router.get('/summary', authenticateUser, async (req, res) => {
  try {
    const { timePeriod = '30d' } = req.query;
    
    logger.info('Statistical models summary request', { 
      userId: req.user?.id, 
      timePeriod 
    });
    
    // Get all insights in parallel
    const [forecastResult, inventoryResult, analyticsResult] = await Promise.allSettled([
      statisticalModelsService.getDemandForecast(timePeriod),
      inventoryOptimizationService.getInventoryOptimization(timePeriod),
      analyticsModelsService.getAnalyticsInsights(timePeriod)
    ]);
    
    const summary = {
      forecasting: forecastResult.status === 'fulfilled' ? {
        success: forecastResult.value.success,
        summary: forecastResult.value.data?.summary || {},
        error: forecastResult.value.error
      } : { success: false, error: forecastResult.reason?.message },
      
      inventory_optimization: inventoryResult.status === 'fulfilled' ? {
        success: inventoryResult.value.success,
        summary: inventoryResult.value.data?.summary || {},
        error: inventoryResult.value.error
      } : { success: false, error: inventoryResult.reason?.message },
      
      analytics: analyticsResult.status === 'fulfilled' ? {
        success: analyticsResult.value.success,
        summary: analyticsResult.value.data?.summary || {},
        error: analyticsResult.value.error
      } : { success: false, error: analyticsResult.reason?.message }
    };
    
    // Generate overall recommendations
    const overallRecommendations = [];
    
    if (summary.forecasting.success && summary.forecasting.summary.recommendations) {
      overallRecommendations.push(...summary.forecasting.summary.recommendations.slice(0, 2));
    }
    
    if (summary.inventory_optimization.success && summary.inventory_optimization.summary.key_recommendations) {
      overallRecommendations.push(...summary.inventory_optimization.summary.key_recommendations.slice(0, 2));
    }
    
    if (summary.analytics.success && summary.analytics.summary.recommendations) {
      overallRecommendations.push(...summary.analytics.summary.recommendations.slice(0, 2));
    }
    
    res.json({
      success: true,
      data: {
        summary,
        overall_recommendations: overallRecommendations,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Statistical models summary API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
