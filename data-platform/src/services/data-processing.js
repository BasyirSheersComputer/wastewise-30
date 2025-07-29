import { logger } from '../utils/logger.js';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

export class DataProcessingService {
  constructor(database, cache) {
    this.database = database;
    this.cache = cache;
    
    this.processingPipelines = {
      realTime: new Map(),
      batch: new Map(),
      streaming: new Map()
    };
    
    this.dataTransformers = {
      waste: this.transformWasteData.bind(this),
      sales: this.transformSalesData.bind(this),
      inventory: this.transformInventoryData.bind(this),
      performance: this.transformPerformanceData.bind(this)
    };
    
    this.dataValidators = {
      waste: this.validateWasteData.bind(this),
      sales: this.validateSalesData.bind(this),
      inventory: this.validateInventoryData.bind(this),
      performance: this.validatePerformanceData.bind(this)
    };
  }

  async initialize() {
    logger.info('⚙️ Initializing Data Processing Service...');
    
    try {
      // Initialize processing pipelines
      await this.initializePipelines();
      
      // Start background processors
      await this.startBackgroundProcessors();
      
      // Initialize data quality monitoring
      await this.initializeDataQualityMonitoring();
      
      logger.info('✅ Data Processing Service initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Data Processing Service:', error);
      throw error;
    }
  }

  async initializePipelines() {
    logger.info('🔧 Initializing processing pipelines...');
    
    // Real-time processing pipeline
    this.processingPipelines.realTime.set('waste', {
      name: 'Real-time Waste Processing',
      status: 'active',
      processor: this.processRealTimeWaste.bind(this),
      transformer: this.dataTransformers.waste,
      validator: this.dataValidators.waste
    });
    
    this.processingPipelines.realTime.set('sales', {
      name: 'Real-time Sales Processing',
      status: 'active',
      processor: this.processRealTimeSales.bind(this),
      transformer: this.dataTransformers.sales,
      validator: this.dataValidators.sales
    });
    
    // Batch processing pipeline
    this.processingPipelines.batch.set('daily_analytics', {
      name: 'Daily Analytics Processing',
      status: 'active',
      processor: this.processDailyAnalytics.bind(this),
      schedule: '0 1 * * *', // Daily at 1 AM
      transformer: this.transformAnalyticsData.bind(this),
      validator: this.validateAnalyticsData.bind(this)
    });
    
    this.processingPipelines.batch.set('weekly_reports', {
      name: 'Weekly Reports Processing',
      status: 'active',
      processor: this.processWeeklyReports.bind(this),
      schedule: '0 2 * * 0', // Weekly on Sunday at 2 AM
      transformer: this.transformReportData.bind(this),
      validator: this.validateReportData.bind(this)
    });
    
    // Streaming processing pipeline
    this.processingPipelines.streaming.set('inventory_stream', {
      name: 'Inventory Stream Processing',
      status: 'active',
      processor: this.processInventoryStream.bind(this),
      transformer: this.dataTransformers.inventory,
      validator: this.dataValidators.inventory
    });
    
    logger.info('✅ Processing pipelines initialized');
  }

  async startBackgroundProcessors() {
    logger.info('🔄 Starting background processors...');
    
    // Start real-time processors
    for (const [key, pipeline] of this.processingPipelines.realTime) {
      if (pipeline.status === 'active') {
        await this.startRealTimeProcessor(key, pipeline);
      }
    }
    
    // Start batch processors
    for (const [key, pipeline] of this.processingPipelines.batch) {
      if (pipeline.status === 'active') {
        await this.startBatchProcessor(key, pipeline);
      }
    }
    
    // Start streaming processors
    for (const [key, pipeline] of this.processingPipelines.streaming) {
      if (pipeline.status === 'active') {
        await this.startStreamingProcessor(key, pipeline);
      }
    }
    
    logger.info('✅ Background processors started');
  }

  async initializeDataQualityMonitoring() {
    logger.info('🔍 Initializing data quality monitoring...');
    
    // Set up data quality rules
    this.dataQualityRules = {
      waste: {
        requiredFields: ['restaurant_id', 'item_id', 'quantity', 'reason'],
        validReasons: ['spoilage', 'overcooking', 'customer_return', 'expiry', 'other'],
        quantityRange: { min: 0, max: 1000 },
        costRange: { min: 0, max: 10000 }
      },
      sales: {
        requiredFields: ['restaurant_id', 'item_id', 'quantity', 'revenue'],
        quantityRange: { min: 1, max: 1000 },
        revenueRange: { min: 0, max: 10000 }
      },
      inventory: {
        requiredFields: ['restaurant_id', 'item_id', 'quantity', 'unit'],
        quantityRange: { min: 0, max: 10000 },
        validUnits: ['kg', 'g', 'l', 'ml', 'pcs', 'boxes']
      }
    };
    
    logger.info('✅ Data quality monitoring initialized');
  }

  async processData(data, type, options = {}) {
    logger.info(`📊 Processing ${type} data...`);
    
    try {
      const pipeline = this.getPipeline(type);
      if (!pipeline) {
        throw new Error(`No pipeline found for data type: ${type}`);
      }
      
      // Validate data
      const validationResult = await pipeline.validator(data);
      if (!validationResult.isValid) {
        throw new Error(`Data validation failed: ${validationResult.errors.join(', ')}`);
      }
      
      // Transform data
      const transformedData = await pipeline.transformer(data);
      
      // Process data
      const result = await pipeline.processor(transformedData, options);
      
      // Cache result
      await this.cache.set(`processed_${type}_${Date.now()}`, result, 3600);
      
      logger.info(`✅ ${type} data processed successfully`);
      return result;
      
    } catch (error) {
      logger.error(`❌ Failed to process ${type} data:`, error);
      throw error;
    }
  }

  getPipeline(type) {
    // Check real-time pipelines first
    if (this.processingPipelines.realTime.has(type)) {
      return this.processingPipelines.realTime.get(type);
    }
    
    // Check batch pipelines
    if (this.processingPipelines.batch.has(type)) {
      return this.processingPipelines.batch.get(type);
    }
    
    // Check streaming pipelines
    if (this.processingPipelines.streaming.has(type)) {
      return this.processingPipelines.streaming.get(type);
    }
    
    return null;
  }

  async processRealTimeWaste(data, options = {}) {
    logger.info('🗑️ Processing real-time waste data...');
    
    try {
      // Add processing metadata
      const processedData = {
        ...data,
        processed_at: new Date().toISOString(),
        processor_id: uuidv4(),
        processing_version: '1.0'
      };
      
      // Store in database
      const query = `
        INSERT INTO waste_events (
          id, restaurant_id, item_id, quantity, reason, cost, recorded_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      
      await this.database.query(query, [
        processedData.id || uuidv4(),
        processedData.restaurant_id,
        processedData.item_id,
        processedData.quantity,
        processedData.reason,
        processedData.cost,
        processedData.recorded_by,
        processedData.created_at || new Date().toISOString()
      ]);
      
      // Update real-time analytics
      await this.updateRealTimeAnalytics('waste', processedData);
      
      // Trigger alerts if needed
      await this.checkWasteAlerts(processedData);
      
      logger.info('✅ Real-time waste data processed');
      return processedData;
      
    } catch (error) {
      logger.error('❌ Failed to process real-time waste data:', error);
      throw error;
    }
  }

  async processRealTimeSales(data, options = {}) {
    logger.info('💰 Processing real-time sales data...');
    
    try {
      // Add processing metadata
      const processedData = {
        ...data,
        processed_at: new Date().toISOString(),
        processor_id: uuidv4(),
        processing_version: '1.0'
      };
      
      // Store in database
      const query = `
        INSERT INTO sales (
          id, restaurant_id, item_id, quantity, revenue, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;
      
      await this.database.query(query, [
        processedData.id || uuidv4(),
        processedData.restaurant_id,
        processedData.item_id,
        processedData.quantity,
        processedData.revenue,
        processedData.timestamp || new Date().toISOString()
      ]);
      
      // Update real-time analytics
      await this.updateRealTimeAnalytics('sales', processedData);
      
      // Update inventory
      await this.updateInventoryFromSales(processedData);
      
      logger.info('✅ Real-time sales data processed');
      return processedData;
      
    } catch (error) {
      logger.error('❌ Failed to process real-time sales data:', error);
      throw error;
    }
  }

  async processDailyAnalytics(data, options = {}) {
    logger.info('📈 Processing daily analytics...');
    
    try {
      const date = options.date || DateTime.now().minus({ days: 1 }).toISODate();
      
      // Calculate daily metrics
      const dailyMetrics = await this.calculateDailyMetrics(date);
      
      // Store analytics
      await this.storeAnalytics('daily', date, dailyMetrics);
      
      // Generate insights
      const insights = await this.generateDailyInsights(dailyMetrics);
      
      // Update dashboards
      await this.updateDashboards('daily', insights);
      
      logger.info('✅ Daily analytics processed');
      return { metrics: dailyMetrics, insights };
      
    } catch (error) {
      logger.error('❌ Failed to process daily analytics:', error);
      throw error;
    }
  }

  async processWeeklyReports(data, options = {}) {
    logger.info('📊 Processing weekly reports...');
    
    try {
      const weekStart = options.weekStart || DateTime.now().startOf('week').toISODate();
      const weekEnd = options.weekEnd || DateTime.now().endOf('week').toISODate();
      
      // Calculate weekly metrics
      const weeklyMetrics = await this.calculateWeeklyMetrics(weekStart, weekEnd);
      
      // Generate reports
      const reports = await this.generateWeeklyReports(weeklyMetrics);
      
      // Store reports
      await this.storeReports('weekly', weekStart, reports);
      
      // Send notifications
      await this.sendReportNotifications(reports);
      
      logger.info('✅ Weekly reports processed');
      return reports;
      
    } catch (error) {
      logger.error('❌ Failed to process weekly reports:', error);
      throw error;
    }
  }

  async processInventoryStream(data, options = {}) {
    logger.info('📦 Processing inventory stream...');
    
    try {
      // Add processing metadata
      const processedData = {
        ...data,
        processed_at: new Date().toISOString(),
        processor_id: uuidv4(),
        processing_version: '1.0'
      };
      
      // Update inventory
      await this.updateInventory(processedData);
      
      // Check for low stock alerts
      await this.checkLowStockAlerts(processedData);
      
      // Update demand forecasting
      await this.updateDemandForecasting(processedData);
      
      logger.info('✅ Inventory stream processed');
      return processedData;
      
    } catch (error) {
      logger.error('❌ Failed to process inventory stream:', error);
      throw error;
    }
  }

  async startRealTimeProcessor(key, pipeline) {
    logger.info(`🔄 Starting real-time processor: ${pipeline.name}`);
    
    // In a real implementation, this would set up event listeners
    // for real-time data streams (Kafka, WebSocket, etc.)
    
    setInterval(async () => {
      try {
        // Check for new data in cache/queue
        const newData = await this.getNewRealTimeData(key);
        if (newData) {
          await pipeline.processor(newData);
        }
      } catch (error) {
        logger.error(`❌ Error in real-time processor ${key}:`, error);
      }
    }, 1000); // Check every second
  }

  async startBatchProcessor(key, pipeline) {
    logger.info(`🔄 Starting batch processor: ${pipeline.name}`);
    
    // Schedule batch processing
    setInterval(async () => {
      try {
        await pipeline.processor({}, { scheduled: true });
      } catch (error) {
        logger.error(`❌ Error in batch processor ${key}:`, error);
      }
    }, this.parseSchedule(pipeline.schedule));
  }

  async startStreamingProcessor(key, pipeline) {
    logger.info(`🔄 Starting streaming processor: ${pipeline.name}`);
    
    // In a real implementation, this would connect to streaming services
    // like Apache Kafka, AWS Kinesis, etc.
    
    setInterval(async () => {
      try {
        // Check for new streaming data
        const newData = await this.getNewStreamingData(key);
        if (newData) {
          await pipeline.processor(newData);
        }
      } catch (error) {
        logger.error(`❌ Error in streaming processor ${key}:`, error);
      }
    }, 5000); // Check every 5 seconds
  }

  parseSchedule(schedule) {
    // Simple schedule parser (cron-like)
    // In production, use a proper cron parser
    if (schedule === '0 1 * * *') {
      return 24 * 60 * 60 * 1000; // Daily
    } else if (schedule === '0 2 * * 0') {
      return 7 * 24 * 60 * 60 * 1000; // Weekly
    }
    return 60 * 60 * 1000; // Default: hourly
  }

  async getNewRealTimeData(key) {
    // Check cache for new data
    const cacheKey = `realtime_${key}_queue`;
    const data = await this.cache.get(cacheKey);
    
    if (data) {
      await this.cache.del(cacheKey);
      return data;
    }
    
    return null;
  }

  async getNewStreamingData(key) {
    // Check cache for new streaming data
    const cacheKey = `streaming_${key}_queue`;
    const data = await this.cache.get(cacheKey);
    
    if (data) {
      await this.cache.del(cacheKey);
      return data;
    }
    
    return null;
  }

  // Data Transformers
  async transformWasteData(data) {
    return {
      ...data,
      quantity: parseFloat(data.quantity) || 0,
      cost: parseFloat(data.cost) || 0,
      reason: data.reason?.toLowerCase() || 'other',
      created_at: data.created_at || new Date().toISOString()
    };
  }

  async transformSalesData(data) {
    return {
      ...data,
      quantity: parseInt(data.quantity) || 0,
      revenue: parseFloat(data.revenue) || 0,
      timestamp: data.timestamp || new Date().toISOString()
    };
  }

  async transformInventoryData(data) {
    return {
      ...data,
      quantity: parseFloat(data.quantity) || 0,
      expiry_date: data.expiry_date || null,
      created_at: data.created_at || new Date().toISOString()
    };
  }

  async transformPerformanceData(data) {
    return {
      ...data,
      efficiency: parseFloat(data.efficiency) || 0,
      accuracy: parseFloat(data.accuracy) || 0,
      productivity: parseFloat(data.productivity) || 0,
      timestamp: data.timestamp || new Date().toISOString()
    };
  }

  async transformAnalyticsData(data) {
    return {
      ...data,
      processed_at: new Date().toISOString(),
      version: '1.0'
    };
  }

  async transformReportData(data) {
    return {
      ...data,
      generated_at: new Date().toISOString(),
      version: '1.0'
    };
  }

  // Data Validators
  async validateWasteData(data) {
    const rules = this.dataQualityRules.waste;
    const errors = [];
    
    // Check required fields
    for (const field of rules.requiredFields) {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Check valid reasons
    if (data.reason && !rules.validReasons.includes(data.reason.toLowerCase())) {
      errors.push(`Invalid reason: ${data.reason}`);
    }
    
    // Check quantity range
    const quantity = parseFloat(data.quantity);
    if (quantity < rules.quantityRange.min || quantity > rules.quantityRange.max) {
      errors.push(`Quantity out of range: ${quantity}`);
    }
    
    // Check cost range
    const cost = parseFloat(data.cost);
    if (cost < rules.costRange.min || cost > rules.costRange.max) {
      errors.push(`Cost out of range: ${cost}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async validateSalesData(data) {
    const rules = this.dataQualityRules.sales;
    const errors = [];
    
    // Check required fields
    for (const field of rules.requiredFields) {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Check quantity range
    const quantity = parseInt(data.quantity);
    if (quantity < rules.quantityRange.min || quantity > rules.quantityRange.max) {
      errors.push(`Quantity out of range: ${quantity}`);
    }
    
    // Check revenue range
    const revenue = parseFloat(data.revenue);
    if (revenue < rules.revenueRange.min || revenue > rules.revenueRange.max) {
      errors.push(`Revenue out of range: ${revenue}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async validateInventoryData(data) {
    const rules = this.dataQualityRules.inventory;
    const errors = [];
    
    // Check required fields
    for (const field of rules.requiredFields) {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Check quantity range
    const quantity = parseFloat(data.quantity);
    if (quantity < rules.quantityRange.min || quantity > rules.quantityRange.max) {
      errors.push(`Quantity out of range: ${quantity}`);
    }
    
    // Check valid units
    if (data.unit && !rules.validUnits.includes(data.unit.toLowerCase())) {
      errors.push(`Invalid unit: ${data.unit}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async validatePerformanceData(data) {
    const errors = [];
    
    // Basic validation for performance data
    if (data.efficiency && (data.efficiency < 0 || data.efficiency > 100)) {
      errors.push('Efficiency must be between 0 and 100');
    }
    
    if (data.accuracy && (data.accuracy < 0 || data.accuracy > 100)) {
      errors.push('Accuracy must be between 0 and 100');
    }
    
    if (data.productivity && (data.productivity < 0 || data.productivity > 100)) {
      errors.push('Productivity must be between 0 and 100');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async validateAnalyticsData(data) {
    // Basic validation for analytics data
    return {
      isValid: true,
      errors: []
    };
  }

  async validateReportData(data) {
    // Basic validation for report data
    return {
      isValid: true,
      errors: []
    };
  }

  // Helper methods for data processing
  async updateRealTimeAnalytics(type, data) {
    const cacheKey = `realtime_analytics_${type}`;
    const analytics = await this.cache.get(cacheKey) || {};
    
    // Update analytics based on type
    switch (type) {
      case 'waste':
        analytics.totalWaste = (analytics.totalWaste || 0) + parseFloat(data.quantity);
        analytics.totalWasteCost = (analytics.totalWasteCost || 0) + parseFloat(data.cost);
        analytics.wasteEvents = (analytics.wasteEvents || 0) + 1;
        break;
      case 'sales':
        analytics.totalSales = (analytics.totalSales || 0) + parseInt(data.quantity);
        analytics.totalRevenue = (analytics.totalRevenue || 0) + parseFloat(data.revenue);
        analytics.salesEvents = (analytics.salesEvents || 0) + 1;
        break;
    }
    
    analytics.lastUpdated = new Date().toISOString();
    await this.cache.set(cacheKey, analytics, 3600);
  }

  async checkWasteAlerts(data) {
    const wasteThreshold = 100; // $100 waste threshold
    
    if (parseFloat(data.cost) > wasteThreshold) {
      const alert = {
        type: 'high_waste',
        severity: 'high',
        message: `High waste cost: $${data.cost}`,
        data: data,
        timestamp: new Date().toISOString()
      };
      
      await this.cache.set(`alert_${Date.now()}`, alert, 86400); // 24 hours
    }
  }

  async updateInventoryFromSales(data) {
    // Update inventory quantities based on sales
    const query = `
      UPDATE inventory 
      SET quantity = quantity - $1
      WHERE restaurant_id = $2 AND item_id = $3
    `;
    
    await this.database.query(query, [
      data.quantity,
      data.restaurant_id,
      data.item_id
    ]);
  }

  async updateInventory(data) {
    const query = `
      INSERT INTO inventory (id, restaurant_id, item_id, quantity, unit, expiry_date, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (restaurant_id, item_id) 
      DO UPDATE SET 
        quantity = inventory.quantity + $4,
        updated_at = $7
    `;
    
    await this.database.query(query, [
      data.id || uuidv4(),
      data.restaurant_id,
      data.item_id,
      data.quantity,
      data.unit,
      data.expiry_date,
      new Date().toISOString()
    ]);
  }

  async checkLowStockAlerts(data) {
    const lowStockThreshold = 10; // 10 units threshold
    
    if (parseFloat(data.quantity) < lowStockThreshold) {
      const alert = {
        type: 'low_stock',
        severity: 'medium',
        message: `Low stock for item ${data.item_id}: ${data.quantity} ${data.unit}`,
        data: data,
        timestamp: new Date().toISOString()
      };
      
      await this.cache.set(`alert_${Date.now()}`, alert, 86400); // 24 hours
    }
  }

  async updateDemandForecasting(data) {
    // Update demand forecasting models
    // This would integrate with ML models for demand prediction
    logger.info('📊 Updating demand forecasting models...');
  }

  async calculateDailyMetrics(date) {
    // Calculate daily metrics for all restaurants
    const query = `
      SELECT 
        restaurant_id,
        COUNT(*) as waste_events,
        SUM(quantity) as total_waste,
        SUM(cost) as total_waste_cost
      FROM waste_events 
      WHERE DATE(created_at) = $1
      GROUP BY restaurant_id
    `;
    
    const result = await this.database.query(query, [date]);
    return result.rows;
  }

  async storeAnalytics(type, date, metrics) {
    // Store analytics in database
    const query = `
      INSERT INTO analytics (type, date, metrics, created_at)
      VALUES ($1, $2, $3, $4)
    `;
    
    await this.database.query(query, [
      type,
      date,
      JSON.stringify(metrics),
      new Date().toISOString()
    ]);
  }

  async generateDailyInsights(metrics) {
    // Generate insights from daily metrics
    const insights = {
      totalWasteEvents: metrics.reduce((sum, m) => sum + parseInt(m.waste_events), 0),
      totalWasteCost: metrics.reduce((sum, m) => sum + parseFloat(m.total_waste_cost), 0),
      averageWastePerRestaurant: metrics.length > 0 ? 
        metrics.reduce((sum, m) => sum + parseFloat(m.total_waste_cost), 0) / metrics.length : 0
    };
    
    return insights;
  }

  async updateDashboards(type, insights) {
    // Update dashboard data
    await this.cache.set(`dashboard_${type}`, insights, 86400); // 24 hours
  }

  async calculateWeeklyMetrics(weekStart, weekEnd) {
    // Calculate weekly metrics
    const query = `
      SELECT 
        restaurant_id,
        COUNT(*) as waste_events,
        SUM(quantity) as total_waste,
        SUM(cost) as total_waste_cost,
        AVG(cost) as avg_waste_cost
      FROM waste_events 
      WHERE DATE(created_at) BETWEEN $1 AND $2
      GROUP BY restaurant_id
    `;
    
    const result = await this.database.query(query, [weekStart, weekEnd]);
    return result.rows;
  }

  async generateWeeklyReports(metrics) {
    // Generate weekly reports
    const reports = {
      summary: {
        totalRestaurants: metrics.length,
        totalWasteEvents: metrics.reduce((sum, m) => sum + parseInt(m.waste_events), 0),
        totalWasteCost: metrics.reduce((sum, m) => sum + parseFloat(m.total_waste_cost), 0),
        averageWasteCost: metrics.reduce((sum, m) => sum + parseFloat(m.avg_waste_cost), 0) / metrics.length
      },
      details: metrics
    };
    
    return reports;
  }

  async storeReports(type, date, reports) {
    // Store reports in database
    const query = `
      INSERT INTO reports (type, date, content, created_at)
      VALUES ($1, $2, $3, $4)
    `;
    
    await this.database.query(query, [
      type,
      date,
      JSON.stringify(reports),
      new Date().toISOString()
    ]);
  }

  async sendReportNotifications(reports) {
    // Send notifications for reports
    logger.info('📧 Sending report notifications...');
  }

  async stop() {
    logger.info('🛑 Stopping Data Processing Service...');
    
    // Stop all processors
    for (const [key, pipeline] of this.processingPipelines.realTime) {
      pipeline.status = 'stopped';
    }
    
    for (const [key, pipeline] of this.processingPipelines.batch) {
      pipeline.status = 'stopped';
    }
    
    for (const [key, pipeline] of this.processingPipelines.streaming) {
      pipeline.status = 'stopped';
    }
  }
} 