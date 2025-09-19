import express from 'express';
import dataLoader from '../services/dataLoader.js';
import { 
  DemandForecaster,
  EnsembleForecaster,
  FeatureEngine
} from '../ai/statisticalModels.js';
import { 
  EOQCalculator,
  ABCAnalyzer,
  InventoryOptimizer
} from '../ai/inventoryOptimization.js';
import { 
  ProductClusterer,
  CustomerSegmenter,
  AnomalyDetector
} from '../ai/analyticsModels.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * Demo endpoint - Demand Forecasting with Real Data
 */
router.get('/demand-forecast', async (req, res) => {
  try {
    logger.info('Demo: Testing demand forecasting with real coffee shop data');
    
    const salesData = dataLoader.getSalesData();
    const productData = dataLoader.getProductData();
    
    if (salesData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No sales data available for forecasting'
      });
    }

    // Get top 3 products by sales volume for demo
    const productSales = {};
    salesData.forEach(sale => {
      const productId = sale.productId;
      if (!productSales[productId]) {
        productSales[productId] = { quantity: 0, revenue: 0 };
      }
      productSales[productId].quantity += sale.quantity;
      productSales[productId].revenue += sale.revenue;
    });

    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b.quantity - a.quantity)
      .slice(0, 3)
      .map(([productId, sales]) => ({
        productId: parseInt(productId),
        totalQuantity: sales.quantity,
        totalRevenue: sales.revenue
      }));

    // Generate forecasts for top products
    const forecasts = [];
    for (const product of topProducts) {
      const productSalesHistory = salesData
        .filter(sale => sale.productId === product.productId)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-14); // Last 14 days for demo

      if (productSalesHistory.length >= 7) {
        const demandData = productSalesHistory.map(sale => sale.quantity);
        const productInfo = productData.find(p => p.id === product.productId);
        
        const forecaster = new DemandForecaster();
        const arimaForecast = forecaster.generateForecast(demandData, 'ARIMA', 7);
        const expSmoothForecast = forecaster.generateForecast(demandData, 'ExponentialSmoothing', 7);
        
        const ensembleForecaster = new EnsembleForecaster();
        const ensembleForecast = ensembleForecaster.generateEnsembleForecast(demandData, 7);

        forecasts.push({
          productId: product.productId,
          productName: productInfo?.name || `Product ${product.productId}`,
          category: productInfo?.category || 'Unknown',
          historicalData: {
            days: productSalesHistory.length,
            totalQuantity: product.totalQuantity,
            totalRevenue: product.totalRevenue,
            avgDailyQuantity: (product.totalQuantity / productSalesHistory.length).toFixed(2)
          },
          forecasts: {
            arima: arimaForecast,
            exponentialSmoothing: expSmoothForecast,
            ensemble: ensembleForecast
          },
          recommendations: {
            expectedDemand: Math.round(ensembleForecast.forecast[0]),
            confidence: ensembleForecast.confidence,
            trend: ensembleForecast.trend,
            seasonality: ensembleForecast.seasonality
          }
        });
      }
    }

    res.json({
      success: true,
      message: "Demand Forecasting Demo with Real Coffee Shop Data",
      data: {
        summary: {
          totalProductsAnalyzed: forecasts.length,
          dataPeriod: 'Last 14 days',
          forecastHorizon: '7 days',
          dataset: 'Coffee Shop Sales (April 2019)'
        },
        forecasts,
        insights: {
          topPerformingProduct: forecasts[0]?.productName || 'N/A',
          avgExpectedDemand: Math.round(forecasts.reduce((sum, f) => sum + f.recommendations.expectedDemand, 0) / forecasts.length),
          totalForecastedRevenue: forecasts.reduce((sum, f) => sum + (f.recommendations.expectedDemand * (f.historicalData.totalRevenue / f.historicalData.totalQuantity)), 0)
        }
      }
    });

  } catch (error) {
    logger.error('Error in demand forecast demo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate demand forecast',
      details: error.message
    });
  }
});

/**
 * Demo endpoint - Inventory Optimization with Real Data
 */
router.get('/inventory-optimization', async (req, res) => {
  try {
    logger.info('Demo: Testing inventory optimization with real coffee shop data');
    
    const productData = dataLoader.getProductData();
    const salesData = dataLoader.getSalesData();
    
    if (productData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No product data available for optimization'
      });
    }

    // Calculate EOQ for first 5 products with sufficient data
    const eoqResults = [];
    const abcResults = [];

    for (const product of productData.slice(0, 5)) {
      const productSales = salesData.filter(sale => sale.productId === product.id);
      
      if (productSales.length > 0) {
        const totalQuantity = productSales.reduce((sum, sale) => sum + sale.quantity, 0);
        const avgDailyDemand = totalQuantity / 30; // Assuming 30-day period
        const annualDemand = avgDailyDemand * 365;
        
        const eoqCalculator = new EOQCalculator();
        const eoq = eoqCalculator.calculateEOQ(annualDemand, product.wholesalePrice);
        
        eoqResults.push({
          productId: product.id,
          productName: product.name,
          category: product.category,
          currentPrice: product.retailPrice,
          wholesalePrice: product.wholesalePrice,
          annualDemand: Math.round(annualDemand),
          eoq: Math.round(eoq.optimalQuantity),
          totalCost: Math.round(eoq.totalCost),
          orderFrequency: Math.round(eoq.orderFrequency),
          recommendations: {
            optimalOrderQuantity: Math.round(eoq.optimalQuantity),
            reorderPoint: Math.round(avgDailyDemand * 7), // 7-day lead time
            safetyStock: Math.round(avgDailyDemand * 3) // 3-day safety stock
          }
        });

        // ABC Analysis data
        abcResults.push({
          productId: product.id,
          productName: product.name,
          annualValue: annualDemand * product.wholesalePrice,
          annualQuantity: Math.round(annualDemand)
        });
      }
    }

    // Perform ABC Analysis
    const abcAnalyzer = new ABCAnalyzer();
    const abcAnalysis = abcAnalyzer.performABCAnalysis(abcResults);

    res.json({
      success: true,
      message: "Inventory Optimization Demo with Real Coffee Shop Data",
      data: {
        summary: {
          productsAnalyzed: eoqResults.length,
          totalAnnualValue: abcResults.reduce((sum, item) => sum + item.annualValue, 0),
          avgEOQ: Math.round(eoqResults.reduce((sum, item) => sum + item.eoq, 0) / eoqResults.length),
          dataset: 'Coffee Shop Products & Sales (April 2019)'
        },
        eoqAnalysis: eoqResults,
        abcAnalysis: {
          classifiedData: abcAnalysis.classified_data,
          analysisSummary: abcAnalysis.analysis_summary,
          recommendations: abcAnalysis.recommendations,
          totalValue: abcAnalysis.total_value
        },
        recommendations: {
          focusProducts: abcAnalysis.classified_data?.filter(item => item.abc_classification === 'A').map(item => item.productName) || [],
          costSavings: Math.round(eoqResults.reduce((sum, item) => sum + item.totalCost, 0) * 0.15), // 15% potential savings
          inventoryTurnover: Math.round(abcResults.reduce((sum, item) => sum + item.annualQuantity, 0) / eoqResults.length)
        }
      }
    });

  } catch (error) {
    logger.error('Error in inventory optimization demo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform inventory optimization',
      details: error.message
    });
  }
});

/**
 * Demo endpoint - Analytics with Real Data
 */
router.get('/analytics', async (req, res) => {
  try {
    logger.info('Demo: Testing analytics models with real coffee shop data');
    
    const customerData = dataLoader.getCustomerData();
    const salesData = dataLoader.getSalesData();
    const productData = dataLoader.getProductData();
    
    if (customerData.length === 0 || salesData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient data for analytics'
      });
    }

    // Customer Segmentation (RFM Analysis) - Sample of customers
    const customerMetrics = {};
    salesData.slice(0, 1000).forEach(sale => { // Use first 1000 sales for demo
      const customerId = sale.customerId;
      if (!customerMetrics[customerId]) {
        customerMetrics[customerId] = {
          totalSpent: 0,
          orderCount: 0,
          lastOrderDate: sale.date
        };
      }
      customerMetrics[customerId].totalSpent += sale.amount;
      customerMetrics[customerId].orderCount += 1;
      if (new Date(sale.date) > new Date(customerMetrics[customerId].lastOrderDate)) {
        customerMetrics[customerId].lastOrderDate = sale.date;
      }
    });

    const rfmData = Object.entries(customerMetrics).slice(0, 50).map(([customerId, metrics]) => {
      const customer = customerData.find(c => c.id === parseInt(customerId));
      const daysSinceLastOrder = Math.floor((new Date() - new Date(metrics.lastOrderDate)) / (1000 * 60 * 60 * 24));
      
      return {
        customerId: parseInt(customerId),
        customerName: customer?.name || `Customer ${customerId}`,
        recency: daysSinceLastOrder,
        frequency: metrics.orderCount,
        monetary: metrics.totalSpent
      };
    });

    const customerSegmenter = new CustomerSegmenter();
    const customerSegmentation = await customerSegmenter.segmentCustomers(rfmData);

    // Product Clustering - Sample of products
    const productMetrics = {};
    salesData.slice(0, 2000).forEach(sale => { // Use first 2000 sales for demo
      const productId = sale.productId;
      if (!productMetrics[productId]) {
        productMetrics[productId] = {
          totalQuantity: 0,
          totalRevenue: 0,
          orderCount: 0
        };
      }
      productMetrics[productId].totalQuantity += sale.quantity;
      productMetrics[productId].totalRevenue += sale.amount;
      productMetrics[productId].orderCount += 1;
    });

    const clusteringData = Object.entries(productMetrics).slice(0, 20).map(([productId, metrics]) => {
      const product = productData.find(p => p.id === parseInt(productId));
      return {
        productId: parseInt(productId),
        productName: product?.name || `Product ${productId}`,
        category: product?.category || 'Unknown',
        avgOrderValue: metrics.totalRevenue / metrics.orderCount,
        totalQuantity: metrics.totalQuantity,
        orderFrequency: metrics.orderCount
      };
    });

    const productClusterer = new ProductClusterer();
    const productClustering = await productClusterer.clusterProducts(clusteringData);

    // Anomaly Detection - Sample of sales
    const anomalyData = salesData.slice(0, 1000).map(sale => ({
      date: sale.date,
      productId: sale.productId,
      quantity: sale.quantity,
      amount: sale.amount,
      outletId: sale.outletId
    }));

    const anomalyDetector = new AnomalyDetector();
    const anomalies = await anomalyDetector.detectAnomalies(anomalyData);

    res.json({
      success: true,
      message: "Analytics Demo with Real Coffee Shop Data",
      data: {
        summary: {
          totalCustomers: customerData.length,
          totalProducts: productData.length,
          totalTransactions: salesData.length,
          anomaliesDetected: anomalies.length,
          dataset: 'Coffee Shop Sales & Customer Data (April 2019)'
        },
        customerSegmentation: {
          segments: customerSegmentation,
          summary: {
            champions: customerSegmentation.champions?.length || 0,
            loyalCustomers: customerSegmentation.loyalCustomers?.length || 0,
            potentialLoyalists: customerSegmentation.potentialLoyalists?.length || 0,
            newCustomers: customerSegmentation.newCustomers?.length || 0,
            atRisk: customerSegmentation.atRisk?.length || 0
          }
        },
        productClustering: {
          clusters: productClustering,
          summary: {
            totalClusters: productClustering.length,
            highValueProducts: productClustering.filter(c => c.avgValue > 100).length,
            lowValueProducts: productClustering.filter(c => c.avgValue < 50).length
          }
        },
        anomalies: {
          detected: anomalies,
          summary: {
            totalAnomalies: anomalies.length,
            highValueAnomalies: anomalies.filter(a => a.amount > 100).length,
            quantityAnomalies: anomalies.filter(a => a.quantity > 10).length
          }
        },
        insights: {
          topCustomerSegment: customerSegmentation.champions?.length > 0 ? 'Champions' : 'Loyal Customers',
          avgCustomerValue: Math.round(rfmData.reduce((sum, c) => sum + c.monetary, 0) / rfmData.length),
          productDiversity: productClustering.length,
          anomalyRate: ((anomalies.length / salesData.length) * 100).toFixed(2) + '%'
        }
      }
    });

  } catch (error) {
    logger.error('Error in analytics demo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform analytics',
      details: error.message
    });
  }
});

/**
 * Demo endpoint - Comprehensive Overview
 */
router.get('/overview', async (req, res) => {
  try {
    logger.info('Demo: Comprehensive statistical models overview');
    
    const comprehensiveData = dataLoader.getComprehensiveData();
    
    if (!comprehensiveData) {
      return res.status(400).json({
        success: false,
        error: 'Failed to load comprehensive data'
      });
    }

    res.json({
      success: true,
      message: "Statistical Models Demo - Comprehensive Overview",
      data: {
        datasetInfo: comprehensiveData.summary,
        dataQuality: {
          salesDataCompleteness: (comprehensiveData.sales.length / 50000 * 100).toFixed(1) + '%',
          productDataCompleteness: (comprehensiveData.products.length / 100 * 100).toFixed(1) + '%',
          customerDataCompleteness: (comprehensiveData.customers.length / 2500 * 100).toFixed(1) + '%',
          dataFreshness: 'April 2019',
          totalRecords: comprehensiveData.sales.length + comprehensiveData.products.length + comprehensiveData.customers.length
        },
        availableModels: {
          demandForecasting: ['ARIMA', 'Exponential Smoothing', 'Ensemble Forecasting'],
          inventoryOptimization: ['EOQ Calculator', 'ABC Analysis', 'Multi-objective Optimization'],
          analytics: ['Product Clustering', 'Customer Segmentation (RFM)', 'Anomaly Detection']
        },
        demoEndpoints: {
          demandForecast: '/api/demo-statistical/demand-forecast',
          inventoryOptimization: '/api/demo-statistical/inventory-optimization',
          analytics: '/api/demo-statistical/analytics'
        },
        recommendations: {
          dataEnhancement: [
            'Add more recent sales data for better trend analysis',
            'Include seasonal patterns in demand forecasting',
            'Add supplier lead time data for EOQ calculations',
            'Include customer demographic data for better segmentation'
          ],
          modelImprovements: [
            'Implement LSTM for time series forecasting',
            'Add external factors (weather, events) to demand models',
            'Include competitor pricing in optimization models',
            'Add real-time anomaly detection alerts'
          ]
        },
        nextSteps: [
          'Deploy models to production environment',
          'Set up automated data pipeline',
          'Create dashboard for real-time monitoring',
          'Implement alert system for anomalies'
        ]
      }
    });

  } catch (error) {
    logger.error('Error in comprehensive demo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run comprehensive demo',
      details: error.message
    });
  }
});

export default router;
