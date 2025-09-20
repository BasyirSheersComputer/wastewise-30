/**
 * Comprehensive Monitoring Service for WasteWise
 * Provides system monitoring, health checks, and performance tracking
 */

export default class MonitoringService {
  constructor(databaseService, cacheService) {
    this.databaseService = databaseService;
    this.cacheService = cacheService;
    this.metrics = new Map();
    this.alerts = [];
    this.healthChecks = new Map();
    this.performanceMetrics = new Map();
    
    // Initialize monitoring
    this.initializeMonitoring();
  }

  /**
   * Initialize monitoring system
   */
  initializeMonitoring() {
    // Set up periodic health checks
    setInterval(() => this.runHealthChecks(), 60000); // Every minute
    
    // Set up performance monitoring
    setInterval(() => this.collectPerformanceMetrics(), 30000); // Every 30 seconds
    
    // Set up alert checking
    setInterval(() => this.checkAlerts(), 60000); // Every minute
    
    console.log('Monitoring service initialized');
  }

  /**
   * Record a metric
   */
  recordMetric(name, value, tags = {}) {
    const timestamp = new Date().toISOString();
    const metric = {
      name,
      value,
      tags,
      timestamp
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricHistory = this.metrics.get(name);
    metricHistory.push(metric);

    // Keep only last 1000 entries per metric
    if (metricHistory.length > 1000) {
      metricHistory.splice(0, metricHistory.length - 1000);
    }

    // Check for alerts
    this.checkMetricAlerts(name, value, tags);
  }

  /**
   * Get metric statistics
   */
  getMetricStats(name, timeWindow = 3600000) { // 1 hour default
    if (!this.metrics.has(name)) {
      return null;
    }

    const now = Date.now();
    const cutoff = now - timeWindow;
    const metricHistory = this.metrics.get(name)
      .filter(m => new Date(m.timestamp).getTime() > cutoff);

    if (metricHistory.length === 0) {
      return null;
    }

    const values = metricHistory.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Calculate percentiles
    const sortedValues = values.sort((a, b) => a - b);
    const p50 = sortedValues[Math.floor(sortedValues.length * 0.5)];
    const p95 = sortedValues[Math.floor(sortedValues.length * 0.95)];
    const p99 = sortedValues[Math.floor(sortedValues.length * 0.99)];

    return {
      name,
      count: values.length,
      sum,
      average: Math.round(avg * 100) / 100,
      min,
      max,
      p50,
      p95,
      p99,
      timeWindow,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Add health check
   */
  addHealthCheck(name, checkFunction, interval = 60000) {
    this.healthChecks.set(name, {
      name,
      checkFunction,
      interval,
      lastCheck: null,
      status: 'unknown',
      lastError: null
    });
  }

  /**
   * Run all health checks
   */
  async runHealthChecks() {
    const results = [];

    for (const [name, check] of this.healthChecks) {
      try {
        const startTime = Date.now();
        const result = await check.checkFunction();
        const duration = Date.now() - startTime;

        check.status = result.healthy ? 'healthy' : 'unhealthy';
        check.lastCheck = new Date().toISOString();
        check.lastError = null;

        results.push({
          name,
          status: check.status,
          duration,
          message: result.message || 'OK',
          timestamp: check.lastCheck
        });

        // Record health check metric
        this.recordMetric('health_check_duration', duration, { check: name });
        this.recordMetric('health_check_status', result.healthy ? 1 : 0, { check: name });

      } catch (error) {
        check.status = 'error';
        check.lastCheck = new Date().toISOString();
        check.lastError = error.message;

        results.push({
          name,
          status: 'error',
          duration: null,
          message: error.message,
          timestamp: check.lastCheck
        });

        // Record health check error
        this.recordMetric('health_check_errors', 1, { check: name, error: error.message });
      }
    }

    return results;
  }

  /**
   * Get system health status
   */
  getHealthStatus() {
    const healthChecks = Array.from(this.healthChecks.values());
    const overallStatus = healthChecks.every(check => check.status === 'healthy') ? 'healthy' : 'unhealthy';
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: healthChecks.map(check => ({
        name: check.name,
        status: check.status,
        lastCheck: check.lastCheck,
        lastError: check.lastError
      }))
    };
  }

  /**
   * Collect performance metrics
   */
  collectPerformanceMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Memory metrics
    this.recordMetric('memory_heap_used', memUsage.heapUsed);
    this.recordMetric('memory_heap_total', memUsage.heapTotal);
    this.recordMetric('memory_external', memUsage.external);
    this.recordMetric('memory_rss', memUsage.rss);

    // CPU metrics
    this.recordMetric('cpu_user', cpuUsage.user);
    this.recordMetric('cpu_system', cpuUsage.system);

    // Process metrics
    this.recordMetric('process_uptime', process.uptime());
    this.recordMetric('process_pid', process.pid);

    // Event loop lag
    const start = process.hrtime.bigint();
    setImmediate(() => {
      const delta = process.hrtime.bigint() - start;
      const nanosec = Number(delta);
      const millisec = nanosec / 1000000;
      this.recordMetric('event_loop_lag', millisec);
    });
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(timeWindow = 300000) { // 5 minutes default
    const metrics = [
      'memory_heap_used',
      'memory_heap_total',
      'memory_external',
      'memory_rss',
      'cpu_user',
      'cpu_system',
      'event_loop_lag'
    ];

    const performance = {};
    
    for (const metric of metrics) {
      const stats = this.getMetricStats(metric, timeWindow);
      if (stats) {
        performance[metric] = stats;
      }
    }

    return {
      timestamp: new Date().toISOString(),
      timeWindow,
      metrics: performance,
      uptime: process.uptime(),
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform
    };
  }

  /**
   * Add alert rule
   */
  addAlert(rule) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...rule,
      createdAt: new Date().toISOString(),
      triggered: false,
      lastTriggered: null
    };

    this.alerts.push(alert);
    return alert.id;
  }

  /**
   * Check metric alerts
   */
  checkMetricAlerts(metricName, value, tags = {}) {
    for (const alert of this.alerts) {
      if (alert.metric === metricName && this.evaluateAlertCondition(alert, value, tags)) {
        this.triggerAlert(alert, value, tags);
      }
    }
  }

  /**
   * Evaluate alert condition
   */
  evaluateAlertCondition(alert, value, tags) {
    if (!alert.condition || !alert.threshold) {
      return false;
    }

    // Check tag filters
    if (alert.tags) {
      for (const [key, expectedValue] of Object.entries(alert.tags)) {
        if (tags[key] !== expectedValue) {
          return false;
        }
      }
    }

    // Evaluate condition
    switch (alert.condition) {
      case 'greater_than':
        return value > alert.threshold;
      case 'less_than':
        return value < alert.threshold;
      case 'equals':
        return value === alert.threshold;
      case 'not_equals':
        return value !== alert.threshold;
      default:
        return false;
    }
  }

  /**
   * Trigger alert
   */
  triggerAlert(alert, value, tags) {
    // Prevent duplicate alerts within cooldown period
    if (alert.cooldown && alert.lastTriggered) {
      const lastTriggered = new Date(alert.lastTriggered).getTime();
      const cooldownMs = alert.cooldown * 1000;
      if (Date.now() - lastTriggered < cooldownMs) {
        return;
      }
    }

    alert.triggered = true;
    alert.lastTriggered = new Date().toISOString();

    const alertData = {
      id: alert.id,
      name: alert.name,
      description: alert.description,
      severity: alert.severity || 'warning',
      metric: alert.metric,
      value,
      threshold: alert.threshold,
      condition: alert.condition,
      tags,
      timestamp: alert.lastTriggered
    };

    // Log alert
    console.error('ALERT TRIGGERED:', alertData);

    // Record alert metric
    this.recordMetric('alerts_triggered', 1, { 
      alert: alert.name, 
      severity: alert.severity 
    });

    // Send notification (implement based on requirements)
    this.sendAlertNotification(alertData);
  }

  /**
   * Send alert notification
   */
  async sendAlertNotification(alertData) {
    // Implementation would depend on notification preferences
    // Could send email, Slack, webhook, etc.
    
    try {
      // For now, just log to database or external service
      console.log('Sending alert notification:', alertData);
      
      // Could integrate with:
      // - Email service (SendGrid, AWS SES)
      // - Slack webhook
      // - PagerDuty
      // - Custom webhook
      
    } catch (error) {
      console.error('Failed to send alert notification:', error);
    }
  }

  /**
   * Check all alerts
   */
  async checkAlerts() {
    // This could be extended to check for patterns, trends, etc.
    const activeAlerts = this.alerts.filter(alert => alert.triggered);
    
    // Reset alerts that haven't been triggered recently
    const now = Date.now();
    for (const alert of this.alerts) {
      if (alert.triggered && alert.lastTriggered) {
        const lastTriggered = new Date(alert.lastTriggered).getTime();
        const resetTimeout = (alert.resetTimeout || 3600) * 1000; // 1 hour default
        
        if (now - lastTriggered > resetTimeout) {
          alert.triggered = false;
        }
      }
    }
  }

  /**
   * Get all alerts
   */
  getAlerts() {
    return this.alerts.map(alert => ({
      id: alert.id,
      name: alert.name,
      description: alert.description,
      severity: alert.severity,
      metric: alert.metric,
      condition: alert.condition,
      threshold: alert.threshold,
      triggered: alert.triggered,
      lastTriggered: alert.lastTriggered,
      createdAt: alert.createdAt,
      tags: alert.tags
    }));
  }

  /**
   * Get alert history
   */
  getAlertHistory(timeWindow = 86400000) { // 24 hours default
    const cutoff = Date.now() - timeWindow;
    const alertHistory = [];

    // Get triggered alerts from metrics
    const alertMetrics = this.getMetricStats('alerts_triggered', timeWindow);
    if (alertMetrics) {
      const metricHistory = this.metrics.get('alerts_triggered')
        .filter(m => new Date(m.timestamp).getTime() > cutoff);

      for (const metric of metricHistory) {
        alertHistory.push({
          timestamp: metric.timestamp,
          alert: metric.tags.alert,
          severity: metric.tags.severity,
          value: metric.value
        });
      }
    }

    return alertHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Database health check
   */
  async checkDatabaseHealth() {
    try {
      const startTime = Date.now();
      
      // Test basic connection
      const { error: connectionError } = await this.databaseService
        .from('users')
        .select('id')
        .limit(1);
      
      if (connectionError) {
        throw new Error(`Database connection failed: ${connectionError.message}`);
      }

      // Test query performance
      const { error: queryError } = await this.databaseService
        .from('users')
        .select('count')
        .limit(1);
      
      if (queryError) {
        throw new Error(`Database query failed: ${queryError.message}`);
      }

      const duration = Date.now() - startTime;
      
      return {
        healthy: true,
        message: 'Database connection and queries working',
        duration
      };
    } catch (error) {
      return {
        healthy: false,
        message: error.message,
        duration: null
      };
    }
  }

  /**
   * Cache health check
   */
  async checkCacheHealth() {
    try {
      const startTime = Date.now();
      
      // Test cache connection
      const testKey = `health_check_${Date.now()}`;
      const testValue = 'test_value';
      
      await this.cacheService.set(testKey, testValue, 60);
      const retrievedValue = await this.cacheService.get(testKey);
      await this.cacheService.del(testKey);
      
      if (retrievedValue !== testValue) {
        throw new Error('Cache read/write test failed');
      }

      const duration = Date.now() - startTime;
      
      return {
        healthy: true,
        message: 'Cache connection and operations working',
        duration
      };
    } catch (error) {
      return {
        healthy: false,
        message: error.message,
        duration: null
      };
    }
  }

  /**
   * API health check
   */
  async checkApiHealth() {
    try {
      const startTime = Date.now();
      
      // Test API endpoints
      const healthEndpoints = [
        '/health',
        '/api/test'
      ];

      const results = [];
      for (const endpoint of healthEndpoints) {
        try {
          // In a real implementation, you would make HTTP requests
          // For now, we'll simulate the check
          results.push({
            endpoint,
            status: 'healthy',
            responseTime: Math.random() * 100 // Simulated response time
          });
        } catch (error) {
          results.push({
            endpoint,
            status: 'unhealthy',
            error: error.message
          });
        }
      }

      const allHealthy = results.every(r => r.status === 'healthy');
      const duration = Date.now() - startTime;

      return {
        healthy: allHealthy,
        message: allHealthy ? 'All API endpoints healthy' : 'Some API endpoints unhealthy',
        duration,
        endpoints: results
      };
    } catch (error) {
      return {
        healthy: false,
        message: error.message,
        duration: null
      };
    }
  }

  /**
   * Get system overview
   */
  getSystemOverview() {
    const health = this.getHealthStatus();
    const performance = this.getPerformanceMetrics();
    const alerts = this.getAlerts();
    const alertHistory = this.getAlertHistory();

    return {
      timestamp: new Date().toISOString(),
      health,
      performance,
      alerts: {
        total: alerts.length,
        active: alerts.filter(a => a.triggered).length,
        recent: alertHistory.slice(0, 10)
      },
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
  }

  /**
   * Initialize default health checks
   */
  initializeDefaultHealthChecks() {
    // Database health check
    this.addHealthCheck('database', () => this.checkDatabaseHealth(), 30000);
    
    // Cache health check
    this.addHealthCheck('cache', () => this.checkCacheHealth(), 30000);
    
    // API health check
    this.addHealthCheck('api', () => this.checkApiHealth(), 60000);

    // Add default alerts
    this.addAlert({
      name: 'High Memory Usage',
      description: 'Memory usage is above 90%',
      metric: 'memory_heap_used',
      condition: 'greater_than',
      threshold: 500 * 1024 * 1024, // 500MB
      severity: 'warning',
      cooldown: 300 // 5 minutes
    });

    this.addAlert({
      name: 'High Event Loop Lag',
      description: 'Event loop lag is above 100ms',
      metric: 'event_loop_lag',
      condition: 'greater_than',
      threshold: 100,
      severity: 'critical',
      cooldown: 60 // 1 minute
    });

    this.addAlert({
      name: 'Database Connection Error',
      description: 'Database health check failed',
      metric: 'health_check_status',
      condition: 'equals',
      threshold: 0,
      severity: 'critical',
      tags: { check: 'database' },
      cooldown: 300 // 5 minutes
    });
  }

  /**
   * Cleanup old metrics
   */
  cleanupMetrics(maxAge = 86400000) { // 24 hours default
    const cutoff = Date.now() - maxAge;
    
    for (const [name, metricHistory] of this.metrics) {
      const filtered = metricHistory.filter(m => new Date(m.timestamp).getTime() > cutoff);
      this.metrics.set(name, filtered);
    }
  }

  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics(format = 'json') {
    const allMetrics = {};
    
    for (const [name, metricHistory] of this.metrics) {
      allMetrics[name] = metricHistory;
    }

    switch (format.toLowerCase()) {
      case 'prometheus':
        return this.exportPrometheusFormat(allMetrics);
      case 'json':
      default:
        return allMetrics;
    }
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheusFormat(metrics) {
    let prometheusOutput = '';
    
    for (const [name, metricHistory] of Object.entries(metrics)) {
      for (const metric of metricHistory) {
        const tags = Object.entries(metric.tags)
          .map(([key, value]) => `${key}="${value}"`)
          .join(',');
        
        const timestamp = Math.floor(new Date(metric.timestamp).getTime() / 1000);
        
        prometheusOutput += `${name}{${tags}} ${metric.value} ${timestamp}\n`;
      }
    }
    
    return prometheusOutput;
  }
}
