import { logger } from '../utils/logger.js';
import { DateTime } from 'luxon';

export class BusinessIntelligenceService {
  constructor(database, cache, analytics, aiAgent) {
    this.database = database;
    this.cache = cache;
    this.analytics = analytics;
    this.aiAgent = aiAgent;
    
    this.biCapabilities = {
      realTimeAnalytics: true,
      predictiveModeling: true,
      strategicPlanning: true,
      performanceMonitoring: true,
      trendAnalysis: true,
      costOptimization: true,
      wasteReduction: true,
      revenueOptimization: true
    };
  }

  async initialize() {
    logger.info('📊 Initializing Business Intelligence Service...');
    
    try {
      // Initialize BI components
      await this.initializeDataModels();
      await this.initializeKPIs();
      await this.initializeDashboards();
      
      logger.info('✅ Business Intelligence Service initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Business Intelligence Service:', error);
      throw error;
    }
  }

  async initializeDataModels() {
    logger.info('📈 Initializing data models...');
    
    // Define core BI data models
    this.dataModels = {
      wasteAnalytics: {
        dimensions: ['restaurant', 'item', 'category', 'date', 'reason'],
        metrics: ['quantity', 'cost', 'percentage', 'trend']
      },
      costAnalytics: {
        dimensions: ['restaurant', 'category', 'period', 'item'],
        metrics: ['total_cost', 'cost_percentage', 'variance', 'trend']
      },
      performanceAnalytics: {
        dimensions: ['restaurant', 'staff', 'shift', 'date'],
        metrics: ['efficiency', 'accuracy', 'productivity', 'quality']
      },
      revenueAnalytics: {
        dimensions: ['restaurant', 'item', 'category', 'date'],
        metrics: ['revenue', 'margin', 'growth', 'trend']
      }
    };
    
    logger.info('✅ Data models initialized');
  }

  async initializeKPIs() {
    logger.info('🎯 Initializing KPIs...');
    
    this.kpis = {
      wasteReduction: {
        name: 'Waste Reduction Rate',
        formula: '(Previous Waste - Current Waste) / Previous Waste * 100',
        target: 30,
        unit: '%',
        frequency: 'weekly'
      },
      costOptimization: {
        name: 'Cost Optimization Rate',
        formula: '(Previous Cost - Current Cost) / Previous Cost * 100',
        target: 15,
        unit: '%',
        frequency: 'monthly'
      },
      efficiencyImprovement: {
        name: 'Operational Efficiency',
        formula: 'Output / Input * 100',
        target: 85,
        unit: '%',
        frequency: 'daily'
      },
      revenueGrowth: {
        name: 'Revenue Growth Rate',
        formula: '(Current Revenue - Previous Revenue) / Previous Revenue * 100',
        target: 10,
        unit: '%',
        frequency: 'monthly'
      }
    };
    
    logger.info('✅ KPIs initialized');
  }

  async initializeDashboards() {
    logger.info('📊 Initializing dashboards...');
    
    this.dashboards = {
      executive: {
        name: 'Executive Dashboard',
        components: ['waste_overview', 'cost_summary', 'revenue_trends', 'strategic_insights'],
        refreshRate: 300 // 5 minutes
      },
      operational: {
        name: 'Operational Dashboard',
        components: ['real_time_waste', 'inventory_status', 'staff_performance', 'alerts'],
        refreshRate: 60 // 1 minute
      },
      analytical: {
        name: 'Analytical Dashboard',
        components: ['trend_analysis', 'predictive_models', 'comparative_analysis', 'drill_down'],
        refreshRate: 600 // 10 minutes
      }
    };
    
    logger.info('✅ Dashboards initialized');
  }

  async generateStrategicInsights(restaurantId, timePeriod = '30d') {
    logger.info(`🎯 Generating strategic insights for restaurant ${restaurantId}`);
    
    try {
      // Gather comprehensive data
      const data = await this.gatherComprehensiveData(restaurantId, timePeriod);
      
      // Analyze trends and patterns
      const trends = await this.analyzeTrends(data);
      
      // Generate predictions
      const predictions = await this.generatePredictions(data);
      
      // Identify opportunities and risks
      const opportunities = await this.identifyOpportunities(data);
      const risks = await this.identifyRisks(data);
      
      // Generate strategic recommendations
      const recommendations = await this.generateRecommendations(data, trends, predictions);
      
      // Calculate ROI for recommendations
      const roiAnalysis = await this.calculateROI(recommendations, data);
      
      const insights = {
        restaurantId,
        timePeriod,
        timestamp: new Date().toISOString(),
        trends,
        predictions,
        opportunities,
        risks,
        recommendations,
        roiAnalysis,
        summary: await this.generateSummary(trends, opportunities, risks, recommendations)
      };
      
      // Cache insights
      await this.cache.set(`strategic_insights_${restaurantId}`, insights, 3600);
      
      logger.info('✅ Strategic insights generated successfully');
      return insights;
      
    } catch (error) {
      logger.error('❌ Failed to generate strategic insights:', error);
      throw error;
    }
  }

  async gatherComprehensiveData(restaurantId, timePeriod) {
    const endDate = DateTime.now();
    const startDate = endDate.minus({ days: parseInt(timePeriod) });
    
    const data = {
      waste: await this.getWasteData(restaurantId, startDate, endDate),
      sales: await this.getSalesData(restaurantId, startDate, endDate),
      inventory: await this.getInventoryData(restaurantId, startDate, endDate),
      costs: await this.getCostData(restaurantId, startDate, endDate),
      performance: await this.getPerformanceData(restaurantId, startDate, endDate)
    };
    
    return data;
  }

  async getWasteData(restaurantId, startDate, endDate) {
    const query = `
      SELECT 
        item_id,
        SUM(quantity) as total_waste,
        SUM(cost) as total_cost,
        reason,
        DATE(created_at) as date
      FROM waste_events 
      WHERE restaurant_id = $1 
        AND created_at BETWEEN $2 AND $3
      GROUP BY item_id, reason, DATE(created_at)
      ORDER BY date DESC
    `;
    
    const result = await this.database.query(query, [restaurantId, startDate.toISO(), endDate.toISO()]);
    return result.rows;
  }

  async getSalesData(restaurantId, startDate, endDate) {
    const query = `
      SELECT 
        item_id,
        SUM(quantity) as total_sales,
        SUM(revenue) as total_revenue,
        DATE(timestamp) as date
      FROM sales 
      WHERE restaurant_id = $1 
        AND timestamp BETWEEN $2 AND $3
      GROUP BY item_id, DATE(timestamp)
      ORDER BY date DESC
    `;
    
    const result = await this.database.query(query, [restaurantId, startDate.toISO(), endDate.toISO()]);
    return result.rows;
  }

  async getInventoryData(restaurantId, startDate, endDate) {
    const query = `
      SELECT 
        item_id,
        quantity,
        unit,
        expiry_date,
        created_at
      FROM inventory 
      WHERE restaurant_id = $1 
        AND created_at BETWEEN $2 AND $3
      ORDER BY created_at DESC
    `;
    
    const result = await this.database.query(query, [restaurantId, startDate.toISO(), endDate.toISO()]);
    return result.rows;
  }

  async getCostData(restaurantId, startDate, endDate) {
    // This would typically come from a costs table
    // For now, we'll estimate based on waste and sales data
    return [];
  }

  async getPerformanceData(restaurantId, startDate, endDate) {
    // This would typically come from a performance tracking system
    // For now, we'll return empty array
    return [];
  }

  async analyzeTrends(data) {
    logger.info('📈 Analyzing trends...');
    
    const trends = {
      wasteTrends: this.analyzeWasteTrends(data.waste),
      salesTrends: this.analyzeSalesTrends(data.sales),
      costTrends: this.analyzeCostTrends(data.costs),
      performanceTrends: this.analyzePerformanceTrends(data.performance)
    };
    
    return trends;
  }

  analyzeWasteTrends(wasteData) {
    if (!wasteData || wasteData.length === 0) {
      return { trend: 'stable', change: 0, items: [] };
    }
    
    // Group by date and calculate daily waste
    const dailyWaste = {};
    wasteData.forEach(record => {
      const date = record.date;
      if (!dailyWaste[date]) {
        dailyWaste[date] = { total_waste: 0, total_cost: 0 };
      }
      dailyWaste[date].total_waste += parseFloat(record.total_waste);
      dailyWaste[date].total_cost += parseFloat(record.total_cost);
    });
    
    // Calculate trend
    const dates = Object.keys(dailyWaste).sort();
    if (dates.length < 2) {
      return { trend: 'insufficient_data', change: 0, items: [] };
    }
    
    const firstWeek = dates.slice(0, Math.ceil(dates.length / 2));
    const secondWeek = dates.slice(Math.ceil(dates.length / 2));
    
    const firstWeekAvg = firstWeek.reduce((sum, date) => sum + dailyWaste[date].total_waste, 0) / firstWeek.length;
    const secondWeekAvg = secondWeek.reduce((sum, date) => sum + dailyWaste[date].total_waste, 0) / secondWeek.length;
    
    const change = ((secondWeekAvg - firstWeekAvg) / firstWeekAvg) * 100;
    
    return {
      trend: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
      change: change,
      items: this.getTopWasteItems(wasteData)
    };
  }

  analyzeSalesTrends(salesData) {
    if (!salesData || salesData.length === 0) {
      return { trend: 'stable', change: 0, items: [] };
    }
    
    // Similar analysis for sales
    const dailySales = {};
    salesData.forEach(record => {
      const date = record.date;
      if (!dailySales[date]) {
        dailySales[date] = { total_sales: 0, total_revenue: 0 };
      }
      dailySales[date].total_sales += parseInt(record.total_sales);
      dailySales[date].total_revenue += parseFloat(record.total_revenue);
    });
    
    const dates = Object.keys(dailySales).sort();
    if (dates.length < 2) {
      return { trend: 'insufficient_data', change: 0, items: [] };
    }
    
    const firstWeek = dates.slice(0, Math.ceil(dates.length / 2));
    const secondWeek = dates.slice(Math.ceil(dates.length / 2));
    
    const firstWeekAvg = firstWeek.reduce((sum, date) => sum + dailySales[date].total_revenue, 0) / firstWeek.length;
    const secondWeekAvg = secondWeek.reduce((sum, date) => sum + dailySales[date].total_revenue, 0) / secondWeek.length;
    
    const change = ((secondWeekAvg - firstWeekAvg) / firstWeekAvg) * 100;
    
    return {
      trend: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
      change: change,
      items: this.getTopSalesItems(salesData)
    };
  }

  analyzeCostTrends(costData) {
    // Placeholder for cost trend analysis
    return { trend: 'stable', change: 0, items: [] };
  }

  analyzePerformanceTrends(performanceData) {
    // Placeholder for performance trend analysis
    return { trend: 'stable', change: 0, items: [] };
  }

  getTopWasteItems(wasteData) {
    const itemWaste = {};
    wasteData.forEach(record => {
      if (!itemWaste[record.item_id]) {
        itemWaste[record.item_id] = { total_waste: 0, total_cost: 0 };
      }
      itemWaste[record.item_id].total_waste += parseFloat(record.total_waste);
      itemWaste[record.item_id].total_cost += parseFloat(record.total_cost);
    });
    
    return Object.entries(itemWaste)
      .sort(([,a], [,b]) => b.total_cost - a.total_cost)
      .slice(0, 5)
      .map(([itemId, data]) => ({
        item_id: itemId,
        total_waste: data.total_waste,
        total_cost: data.total_cost
      }));
  }

  getTopSalesItems(salesData) {
    const itemSales = {};
    salesData.forEach(record => {
      if (!itemSales[record.item_id]) {
        itemSales[record.item_id] = { total_sales: 0, total_revenue: 0 };
      }
      itemSales[record.item_id].total_sales += parseInt(record.total_sales);
      itemSales[record.item_id].total_revenue += parseFloat(record.total_revenue);
    });
    
    return Object.entries(itemSales)
      .sort(([,a], [,b]) => b.total_revenue - a.total_revenue)
      .slice(0, 5)
      .map(([itemId, data]) => ({
        item_id: itemId,
        total_sales: data.total_sales,
        total_revenue: data.total_revenue
      }));
  }

  async generatePredictions(data) {
    logger.info('🔮 Generating predictions...');
    
    // Use AI agent to generate predictions
    const predictionQuery = `
      Based on the following data:
      - Waste trends: ${JSON.stringify(data.waste.slice(0, 10))}
      - Sales trends: ${JSON.stringify(data.sales.slice(0, 10))}
      
      Predict:
      1. Waste patterns for the next 30 days
      2. Sales projections
      3. Cost implications
      4. Recommended actions
    `;
    
    try {
      const aiResponse = await this.aiAgent.processQuery(predictionQuery);
      return {
        wastePredictions: this.extractWastePredictions(aiResponse.response),
        salesPredictions: this.extractSalesPredictions(aiResponse.response),
        costPredictions: this.extractCostPredictions(aiResponse.response),
        confidence: aiResponse.confidence
      };
    } catch (error) {
      logger.error('❌ Failed to generate predictions:', error);
      return {
        wastePredictions: [],
        salesPredictions: [],
        costPredictions: [],
        confidence: 0.5
      };
    }
  }

  async identifyOpportunities(data) {
    logger.info('💡 Identifying opportunities...');
    
    const opportunities = [];
    
    // Analyze waste vs sales patterns
    const wasteItems = new Set(data.waste.map(w => w.item_id));
    const salesItems = new Set(data.sales.map(s => s.item_id));
    
    // Items with high sales but low waste (good opportunities)
    salesItems.forEach(itemId => {
      if (!wasteItems.has(itemId)) {
        opportunities.push({
          type: 'low_waste_high_sales',
          item_id: itemId,
          description: 'Item has good sales with minimal waste',
          potential: 'high'
        });
      }
    });
    
    // Items with high waste but low sales (optimization opportunities)
    wasteItems.forEach(itemId => {
      const wasteAmount = data.waste.filter(w => w.item_id === itemId)
        .reduce((sum, w) => sum + parseFloat(w.total_waste), 0);
      const salesAmount = data.sales.filter(s => s.item_id === itemId)
        .reduce((sum, s) => sum + parseInt(s.total_sales), 0);
      
      if (wasteAmount > salesAmount * 0.1) { // More than 10% waste
        opportunities.push({
          type: 'high_waste_low_sales',
          item_id: itemId,
          description: 'Item has high waste relative to sales',
          potential: 'medium',
          waste_amount: wasteAmount,
          sales_amount: salesAmount
        });
      }
    });
    
    return opportunities;
  }

  async identifyRisks(data) {
    logger.info('⚠️ Identifying risks...');
    
    const risks = [];
    
    // High waste items
    const highWasteItems = data.waste
      .reduce((acc, record) => {
        if (!acc[record.item_id]) {
          acc[record.item_id] = { total_waste: 0, total_cost: 0 };
        }
        acc[record.item_id].total_waste += parseFloat(record.total_waste);
        acc[record.item_id].total_cost += parseFloat(record.total_cost);
        return acc;
      }, {});
    
    Object.entries(highWasteItems)
      .filter(([, data]) => data.total_cost > 100) // High cost threshold
      .forEach(([itemId, data]) => {
        risks.push({
          type: 'high_waste_cost',
          item_id: itemId,
          description: `High waste cost: $${data.total_cost}`,
          severity: 'high',
          cost: data.total_cost
        });
      });
    
    // Expiring inventory
    const today = DateTime.now();
    const expiringItems = data.inventory.filter(item => {
      const expiryDate = DateTime.fromISO(item.expiry_date);
      const daysUntilExpiry = expiryDate.diff(today, 'days').days;
      return daysUntilExpiry <= 3 && daysUntilExpiry > 0;
    });
    
    expiringItems.forEach(item => {
      risks.push({
        type: 'expiring_inventory',
        item_id: item.item_id,
        description: `Item expires in ${Math.ceil(DateTime.fromISO(item.expiry_date).diff(today, 'days').days)} days`,
        severity: 'medium',
        expiry_date: item.expiry_date
      });
    });
    
    return risks;
  }

  async generateRecommendations(data, trends, predictions) {
    logger.info('💡 Generating recommendations...');
    
    const recommendations = [];
    
    // Based on waste trends
    if (trends.wasteTrends.trend === 'increasing') {
      recommendations.push({
        type: 'waste_reduction',
        priority: 'high',
        description: 'Implement waste reduction strategies',
        actions: [
          'Review portion sizes',
          'Improve inventory management',
          'Train staff on waste prevention'
        ],
        expectedImpact: 'Reduce waste by 20-30%',
        timeline: '2-4 weeks'
      });
    }
    
    // Based on opportunities
    const opportunities = await this.identifyOpportunities(data);
    opportunities.forEach(opp => {
      if (opp.type === 'high_waste_low_sales') {
        recommendations.push({
          type: 'menu_optimization',
          priority: 'medium',
          description: `Optimize menu item ${opp.item_id}`,
          actions: [
            'Review pricing strategy',
            'Consider removing from menu',
            'Improve preparation methods'
          ],
          expectedImpact: 'Reduce waste cost by 15-25%',
          timeline: '1-2 weeks'
        });
      }
    });
    
    // Based on risks
    const risks = await this.identifyRisks(data);
    risks.forEach(risk => {
      if (risk.type === 'expiring_inventory') {
        recommendations.push({
          type: 'inventory_management',
          priority: 'high',
          description: `Handle expiring inventory for item ${risk.item_id}`,
          actions: [
            'Use in special promotions',
            'Transfer to other locations',
            'Donate to food banks'
          ],
          expectedImpact: 'Prevent $100-500 in waste',
          timeline: 'Immediate'
        });
      }
    });
    
    return recommendations;
  }

  async calculateROI(recommendations, data) {
    logger.info('💰 Calculating ROI...');
    
    const roiAnalysis = recommendations.map(rec => {
      let estimatedCost = 0;
      let estimatedSavings = 0;
      
      switch (rec.type) {
        case 'waste_reduction':
          estimatedCost = 5000; // Training, process changes
          estimatedSavings = 15000; // 30% waste reduction
          break;
        case 'menu_optimization':
          estimatedCost = 1000; // Menu redesign
          estimatedSavings = 3000; // Reduced waste
          break;
        case 'inventory_management':
          estimatedCost = 500; // System improvements
          estimatedSavings = 2000; // Prevented waste
          break;
        default:
          estimatedCost = 1000;
          estimatedSavings = 2000;
      }
      
      const roi = ((estimatedSavings - estimatedCost) / estimatedCost) * 100;
      
      return {
        recommendation: rec,
        estimatedCost,
        estimatedSavings,
        roi,
        paybackPeriod: estimatedCost / (estimatedSavings / 12), // months
        risk: roi > 200 ? 'low' : roi > 100 ? 'medium' : 'high'
      };
    });
    
    return roiAnalysis;
  }

  async generateSummary(trends, opportunities, risks, recommendations) {
    const summary = {
      overallStatus: this.determineOverallStatus(trends, risks),
      keyInsights: [
        `Waste trend: ${trends.wasteTrends.trend} (${trends.wasteTrends.change.toFixed(1)}%)`,
        `Sales trend: ${trends.salesTrends.trend} (${trends.salesTrends.change.toFixed(1)}%)`,
        `Opportunities identified: ${opportunities.length}`,
        `Risks identified: ${risks.length}`,
        `Recommendations generated: ${recommendations.length}`
      ],
      priorityActions: recommendations
        .filter(rec => rec.priority === 'high')
        .map(rec => rec.description),
      expectedImpact: this.calculateExpectedImpact(recommendations)
    };
    
    return summary;
  }

  determineOverallStatus(trends, risks) {
    const highRiskCount = risks.filter(r => r.severity === 'high').length;
    const wasteTrend = trends.wasteTrends.trend;
    
    if (highRiskCount > 3 || wasteTrend === 'increasing') {
      return 'critical';
    } else if (highRiskCount > 1 || wasteTrend === 'stable') {
      return 'warning';
    } else {
      return 'healthy';
    }
  }

  calculateExpectedImpact(recommendations) {
    const totalSavings = recommendations.reduce((sum, rec) => {
      const savings = rec.expectedImpact.match(/\d+/);
      return sum + (savings ? parseInt(savings[0]) : 0);
    }, 0);
    
    return {
      totalSavings,
      implementationTime: recommendations.reduce((max, rec) => {
        const time = rec.timeline.match(/\d+/);
        return Math.max(max, time ? parseInt(time[0]) : 0);
      }, 0),
      priorityCount: recommendations.filter(r => r.priority === 'high').length
    };
  }

  extractWastePredictions(aiResponse) {
    // Extract waste predictions from AI response
    const predictions = [];
    const lines = aiResponse.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('waste') && line.toLowerCase().includes('predict')) {
        predictions.push(line.trim());
      }
    });
    
    return predictions;
  }

  extractSalesPredictions(aiResponse) {
    // Extract sales predictions from AI response
    const predictions = [];
    const lines = aiResponse.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('sales') && line.toLowerCase().includes('predict')) {
        predictions.push(line.trim());
      }
    });
    
    return predictions;
  }

  extractCostPredictions(aiResponse) {
    // Extract cost predictions from AI response
    const predictions = [];
    const lines = aiResponse.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('cost') && line.toLowerCase().includes('predict')) {
        predictions.push(line.trim());
      }
    });
    
    return predictions;
  }

  async getDashboardData(dashboardType, restaurantId) {
    logger.info(`📊 Getting dashboard data for ${dashboardType}`);
    
    const cacheKey = `dashboard_${dashboardType}_${restaurantId}`;
    const cached = await this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    let dashboardData;
    
    switch (dashboardType) {
      case 'executive':
        dashboardData = await this.getExecutiveDashboard(restaurantId);
        break;
      case 'operational':
        dashboardData = await this.getOperationalDashboard(restaurantId);
        break;
      case 'analytical':
        dashboardData = await this.getAnalyticalDashboard(restaurantId);
        break;
      default:
        throw new Error(`Unknown dashboard type: ${dashboardType}`);
    }
    
    // Cache for 5 minutes
    await this.cache.set(cacheKey, dashboardData, 300);
    
    return dashboardData;
  }

  async getExecutiveDashboard(restaurantId) {
    const insights = await this.generateStrategicInsights(restaurantId, '30d');
    
    return {
      type: 'executive',
      restaurantId,
      timestamp: new Date().toISOString(),
      overview: {
        status: insights.summary.overallStatus,
        wasteTrend: insights.trends.wasteTrends,
        salesTrend: insights.trends.salesTrends,
        opportunities: insights.opportunities.length,
        risks: insights.risks.length
      },
      kpis: await this.calculateKPIs(restaurantId),
      insights: insights.summary.keyInsights,
      recommendations: insights.recommendations.slice(0, 5)
    };
  }

  async getOperationalDashboard(restaurantId) {
    const realTimeData = await this.getRealTimeData(restaurantId);
    
    return {
      type: 'operational',
      restaurantId,
      timestamp: new Date().toISOString(),
      realTime: realTimeData,
      alerts: await this.getAlerts(restaurantId),
      performance: await this.getPerformanceMetrics(restaurantId)
    };
  }

  async getAnalyticalDashboard(restaurantId) {
    const insights = await this.generateStrategicInsights(restaurantId, '90d');
    
    return {
      type: 'analytical',
      restaurantId,
      timestamp: new Date().toISOString(),
      trends: insights.trends,
      predictions: insights.predictions,
      comparative: await this.getComparativeAnalysis(restaurantId),
      drillDown: await this.getDrillDownData(restaurantId)
    };
  }

  async calculateKPIs(restaurantId) {
    const kpis = {};
    
    for (const [key, kpi] of Object.entries(this.kpis)) {
      try {
        const value = await this.calculateKPIValue(kpi, restaurantId);
        kpis[key] = {
          ...kpi,
          currentValue: value,
          status: this.getKPIStatus(kpi, value)
        };
      } catch (error) {
        logger.error(`Failed to calculate KPI ${key}:`, error);
        kpis[key] = {
          ...kpi,
          currentValue: null,
          status: 'error'
        };
      }
    }
    
    return kpis;
  }

  async calculateKPIValue(kpi, restaurantId) {
    // This would implement the actual KPI calculation logic
    // For now, return placeholder values
    switch (kpi.name) {
      case 'Waste Reduction Rate':
        return Math.random() * 40; // 0-40%
      case 'Cost Optimization Rate':
        return Math.random() * 20; // 0-20%
      case 'Operational Efficiency':
        return 70 + Math.random() * 20; // 70-90%
      case 'Revenue Growth Rate':
        return (Math.random() - 0.5) * 20; // -10% to +10%
      default:
        return 0;
    }
  }

  getKPIStatus(kpi, value) {
    if (value === null) return 'error';
    
    const target = kpi.target;
    const tolerance = target * 0.1; // 10% tolerance
    
    if (value >= target - tolerance) return 'on_target';
    if (value >= target - tolerance * 2) return 'warning';
    return 'critical';
  }

  async getRealTimeData(restaurantId) {
    // Get real-time data from cache or database
    return {
      currentWaste: await this.getCurrentWaste(restaurantId),
      currentInventory: await this.getCurrentInventory(restaurantId),
      currentSales: await this.getCurrentSales(restaurantId),
      activeAlerts: await this.getActiveAlerts(restaurantId)
    };
  }

  async getCurrentWaste(restaurantId) {
    const query = `
      SELECT SUM(quantity) as total_waste, SUM(cost) as total_cost
      FROM waste_events 
      WHERE restaurant_id = $1 
        AND created_at >= NOW() - INTERVAL '24 hours'
    `;
    
    const result = await this.database.query(query, [restaurantId]);
    return result.rows[0] || { total_waste: 0, total_cost: 0 };
  }

  async getCurrentInventory(restaurantId) {
    const query = `
      SELECT COUNT(*) as total_items, SUM(quantity) as total_quantity
      FROM inventory 
      WHERE restaurant_id = $1 
        AND expiry_date >= NOW()
    `;
    
    const result = await this.database.query(query, [restaurantId]);
    return result.rows[0] || { total_items: 0, total_quantity: 0 };
  }

  async getCurrentSales(restaurantId) {
    const query = `
      SELECT SUM(quantity) as total_sales, SUM(revenue) as total_revenue
      FROM sales 
      WHERE restaurant_id = $1 
        AND timestamp >= NOW() - INTERVAL '24 hours'
    `;
    
    const result = await this.database.query(query, [restaurantId]);
    return result.rows[0] || { total_sales: 0, total_revenue: 0 };
  }

  async getAlerts(restaurantId) {
    const alerts = [];
    
    // Check for high waste
    const wasteData = await this.getCurrentWaste(restaurantId);
    if (wasteData.total_cost > 1000) {
      alerts.push({
        type: 'high_waste',
        severity: 'high',
        message: `High waste cost: $${wasteData.total_cost}`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check for expiring inventory
    const expiringQuery = `
      SELECT COUNT(*) as expiring_count
      FROM inventory 
      WHERE restaurant_id = $1 
        AND expiry_date BETWEEN NOW() AND NOW() + INTERVAL '3 days'
    `;
    
    const expiringResult = await this.database.query(expiringQuery, [restaurantId]);
    const expiringCount = expiringResult.rows[0]?.expiring_count || 0;
    
    if (expiringCount > 0) {
      alerts.push({
        type: 'expiring_inventory',
        severity: 'medium',
        message: `${expiringCount} items expiring soon`,
        timestamp: new Date().toISOString()
      });
    }
    
    return alerts;
  }

  async getActiveAlerts(restaurantId) {
    return await this.getAlerts(restaurantId);
  }

  async getPerformanceMetrics(restaurantId) {
    // Placeholder for performance metrics
    return {
      efficiency: 85 + Math.random() * 10,
      accuracy: 90 + Math.random() * 8,
      productivity: 80 + Math.random() * 15
    };
  }

  async getComparativeAnalysis(restaurantId) {
    // Compare with other restaurants or historical data
    return {
      wasteComparison: {
        current: 15,
        average: 12,
        benchmark: 10
      },
      costComparison: {
        current: 25,
        average: 23,
        benchmark: 20
      },
      efficiencyComparison: {
        current: 85,
        average: 82,
        benchmark: 90
      }
    };
  }

  async getDrillDownData(restaurantId) {
    // Detailed breakdown data
    return {
      wasteByCategory: await this.getWasteByCategory(restaurantId),
      wasteByReason: await this.getWasteByReason(restaurantId),
      salesByItem: await this.getSalesByItem(restaurantId),
      costBreakdown: await this.getCostBreakdown(restaurantId)
    };
  }

  async getWasteByCategory(restaurantId) {
    const query = `
      SELECT 
        mi.category,
        SUM(we.quantity) as total_waste,
        SUM(we.cost) as total_cost
      FROM waste_events we
      JOIN menu_items mi ON we.item_id = mi.id
      WHERE we.restaurant_id = $1
        AND we.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY mi.category
      ORDER BY total_cost DESC
    `;
    
    const result = await this.database.query(query, [restaurantId]);
    return result.rows;
  }

  async getWasteByReason(restaurantId) {
    const query = `
      SELECT 
        reason,
        SUM(quantity) as total_waste,
        SUM(cost) as total_cost,
        COUNT(*) as event_count
      FROM waste_events 
      WHERE restaurant_id = $1
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY reason
      ORDER BY total_cost DESC
    `;
    
    const result = await this.database.query(query, [restaurantId]);
    return result.rows;
  }

  async getSalesByItem(restaurantId) {
    const query = `
      SELECT 
        item_id,
        SUM(quantity) as total_sales,
        SUM(revenue) as total_revenue
      FROM sales 
      WHERE restaurant_id = $1
        AND timestamp >= NOW() - INTERVAL '30 days'
      GROUP BY item_id
      ORDER BY total_revenue DESC
      LIMIT 10
    `;
    
    const result = await this.database.query(query, [restaurantId]);
    return result.rows;
  }

  async getCostBreakdown(restaurantId) {
    // Placeholder for cost breakdown
    return {
      food: 60,
      labor: 25,
      waste: 10,
      other: 5
    };
  }

  async stop() {
    logger.info('🛑 Stopping Business Intelligence Service...');
    // Cleanup resources if needed
  }
} 