/**
 * Comprehensive Logging Service for WasteWise
 * Provides structured logging, log aggregation, and log analysis
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

export default class LoggingService {
  constructor(options = {}) {
    this.options = {
      level: process.env.LOG_LEVEL || 'info',
      logDir: process.env.LOG_DIR || './logs',
      maxSize: process.env.LOG_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_MAX_FILES || '14d',
      enableConsole: process.env.LOG_ENABLE_CONSOLE !== 'false',
      enableFile: process.env.LOG_ENABLE_FILE !== 'false',
      enableDatabase: process.env.LOG_ENABLE_DATABASE === 'true',
      ...options
    };

    this.logger = null;
    this.databaseService = null;
    this.logBuffer = [];
    this.bufferSize = 100;
    this.flushInterval = 5000; // 5 seconds

    this.initializeLogger();
    this.setupLogRotation();
    this.setupBufferFlush();
  }

  /**
   * Initialize Winston logger
   */
  initializeLogger() {
    const transports = [];

    // Console transport
    if (this.options.enableConsole) {
      transports.push(new winston.transports.Console({
        level: this.options.level,
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            let logMessage = `${timestamp} [${level}]: ${message}`;
            if (Object.keys(meta).length > 0) {
              logMessage += ` ${JSON.stringify(meta)}`;
            }
            return logMessage;
          })
        )
      }));
    }

    // File transports
    if (this.options.enableFile) {
      // Ensure log directory exists
      if (!fs.existsSync(this.options.logDir)) {
        fs.mkdirSync(this.options.logDir, { recursive: true });
      }

      // Application logs
      transports.push(new winston.transports.File({
        filename: path.join(this.options.logDir, 'app.log'),
        level: this.options.level,
        maxsize: this.parseSize(this.options.maxSize),
        maxFiles: this.parseMaxFiles(this.options.maxFiles),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      }));

      // Error logs
      transports.push(new winston.transports.File({
        filename: path.join(this.options.logDir, 'error.log'),
        level: 'error',
        maxsize: this.parseSize(this.options.maxSize),
        maxFiles: this.parseMaxFiles(this.options.maxFiles),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      }));

      // Access logs
      transports.push(new winston.transports.File({
        filename: path.join(this.options.logDir, 'access.log'),
        level: 'http',
        maxsize: this.parseSize(this.options.maxSize),
        maxFiles: this.parseMaxFiles(this.options.maxFiles),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      }));

      // Audit logs
      transports.push(new winston.transports.File({
        filename: path.join(this.options.logDir, 'audit.log'),
        level: 'audit',
        maxsize: this.parseSize(this.options.maxSize),
        maxFiles: this.parseMaxFiles(this.options.maxFiles),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      }));
    }

    this.logger = winston.createLogger({
      level: this.options.level,
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6,
        audit: 7
      },
      transports,
      exitOnError: false
    });
  }

  /**
   * Set database service for log storage
   */
  setDatabaseService(databaseService) {
    this.databaseService = databaseService;
  }

  /**
   * Log error message
   */
  error(message, meta = {}) {
    const logEntry = this.createLogEntry('error', message, meta);
    this.logger.error(message, logEntry.meta);
    this.bufferLog(logEntry);
  }

  /**
   * Log warning message
   */
  warn(message, meta = {}) {
    const logEntry = this.createLogEntry('warn', message, meta);
    this.logger.warn(message, logEntry.meta);
    this.bufferLog(logEntry);
  }

  /**
   * Log info message
   */
  info(message, meta = {}) {
    const logEntry = this.createLogEntry('info', message, meta);
    this.logger.info(message, logEntry.meta);
    this.bufferLog(logEntry);
  }

  /**
   * Log HTTP request
   */
  http(message, meta = {}) {
    const logEntry = this.createLogEntry('http', message, meta);
    this.logger.http(message, logEntry.meta);
    this.bufferLog(logEntry);
  }

  /**
   * Log debug message
   */
  debug(message, meta = {}) {
    const logEntry = this.createLogEntry('debug', message, meta);
    this.logger.debug(message, logEntry.meta);
    this.bufferLog(logEntry);
  }

  /**
   * Log audit event
   */
  audit(message, meta = {}) {
    const logEntry = this.createLogEntry('audit', message, meta);
    this.logger.audit(message, logEntry.meta);
    this.bufferLog(logEntry);
  }

  /**
   * Log API request
   */
  apiRequest(method, path, userId = null, meta = {}) {
    const requestMeta = {
      type: 'api_request',
      method,
      path,
      userId,
      userAgent: meta.userAgent,
      ip: meta.ip,
      ...meta
    };

    this.http(`${method} ${path}`, requestMeta);
  }

  /**
   * Log API response
   */
  apiResponse(method, path, statusCode, duration, meta = {}) {
    const responseMeta = {
      type: 'api_response',
      method,
      path,
      statusCode,
      duration,
      ...meta
    };

    const level = statusCode >= 500 ? 'error' : 
                  statusCode >= 400 ? 'warn' : 'http';
    
    this[level](`${method} ${path} ${statusCode} - ${duration}ms`, responseMeta);
  }

  /**
   * Log API error
   */
  apiError(method, path, error, meta = {}) {
    const errorMeta = {
      type: 'api_error',
      method,
      path,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      ...meta
    };

    this.error(`API Error: ${method} ${path} - ${error.message}`, errorMeta);
  }

  /**
   * Log authentication event
   */
  authEvent(event, userId = null, meta = {}) {
    const authMeta = {
      type: 'auth_event',
      event,
      userId,
      ...meta
    };

    this.audit(`Auth: ${event}`, authMeta);
  }

  /**
   * Log business event
   */
  businessEvent(event, userId = null, meta = {}) {
    const businessMeta = {
      type: 'business_event',
      event,
      userId,
      ...meta
    };

    this.info(`Business: ${event}`, businessMeta);
  }

  /**
   * Log security event
   */
  securityEvent(event, severity = 'warn', meta = {}) {
    const securityMeta = {
      type: 'security_event',
      event,
      severity,
      ...meta
    };

    this[severity](`Security: ${event}`, securityMeta);
  }

  /**
   * Log performance metric
   */
  performanceMetric(metric, value, meta = {}) {
    const perfMeta = {
      type: 'performance_metric',
      metric,
      value,
      ...meta
    };

    this.info(`Performance: ${metric} = ${value}`, perfMeta);
  }

  /**
   * Create structured log entry
   */
  createLogEntry(level, message, meta = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta: {
        ...meta,
        pid: process.pid,
        hostname: process.env.HOSTNAME || 'localhost',
        service: 'wastewise-backend',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    };
  }

  /**
   * Buffer log entry for batch processing
   */
  bufferLog(logEntry) {
    this.logBuffer.push(logEntry);

    if (this.logBuffer.length >= this.bufferSize) {
      this.flushBuffer();
    }
  }

  /**
   * Flush log buffer to database
   */
  async flushBuffer() {
    if (this.logBuffer.length === 0 || !this.databaseService) {
      return;
    }

    try {
      const logsToFlush = [...this.logBuffer];
      this.logBuffer = [];

      // Insert logs in batches
      const batchSize = 50;
      for (let i = 0; i < logsToFlush.length; i += batchSize) {
        const batch = logsToFlush.slice(i, i + batchSize);
        
        const { error } = await this.databaseService
          .from('system_logs')
          .insert(batch.map(log => ({
            timestamp: log.timestamp,
            level: log.level,
            message: log.message,
            meta: log.meta,
            created_at: new Date().toISOString()
          })));

        if (error) {
          console.error('Failed to flush logs to database:', error);
          // Re-add failed logs to buffer
          this.logBuffer.unshift(...batch);
          break;
        }
      }
    } catch (error) {
      console.error('Error flushing log buffer:', error);
    }
  }

  /**
   * Setup periodic buffer flush
   */
  setupBufferFlush() {
    setInterval(() => {
      this.flushBuffer();
    }, this.flushInterval);
  }

  /**
   * Setup log rotation
   */
  setupLogRotation() {
    // Winston handles rotation automatically with maxsize and maxFiles
    // This method can be extended for custom rotation logic
  }

  /**
   * Parse size string (e.g., "20m" -> 20971520)
   */
  parseSize(sizeStr) {
    const units = {
      b: 1,
      k: 1024,
      m: 1024 * 1024,
      g: 1024 * 1024 * 1024
    };

    const match = sizeStr.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|k|m|g)?$/);
    if (!match) return 20 * 1024 * 1024; // Default 20MB

    const value = parseFloat(match[1]);
    const unit = match[2] || 'm';

    return Math.floor(value * (units[unit] || units.m));
  }

  /**
   * Parse max files string (e.g., "14d" -> 14)
   */
  parseMaxFiles(maxFilesStr) {
    const match = maxFilesStr.match(/^(\d+)(d|h|m)?$/);
    if (!match) return 14; // Default 14 days

    return parseInt(match[1]);
  }

  /**
   * Query logs from database
   */
  async queryLogs(filters = {}, options = {}) {
    if (!this.databaseService) {
      throw new Error('Database service not configured');
    }

    const {
      level,
      type,
      userId,
      startDate,
      endDate,
      message,
      limit = 100,
      offset = 0,
      orderBy = 'timestamp',
      orderDirection = 'desc'
    } = { ...filters, ...options };

    let query = this.databaseService
      .from('system_logs')
      .select('*');

    // Apply filters
    if (level) {
      query = query.eq('level', level);
    }

    if (type) {
      query = query.eq('meta->type', type);
    }

    if (userId) {
      query = query.eq('meta->userId', userId);
    }

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }

    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    if (message) {
      query = query.ilike('message', `%${message}%`);
    }

    // Apply ordering and pagination
    query = query
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to query logs: ${error.message}`);
    }

    return data;
  }

  /**
   * Get log statistics
   */
  async getLogStats(timeWindow = 3600000) { // 1 hour default
    if (!this.databaseService) {
      throw new Error('Database service not configured');
    }

    const startTime = new Date(Date.now() - timeWindow).toISOString();

    const { data, error } = await this.databaseService
      .from('system_logs')
      .select('level, meta')
      .gte('timestamp', startTime);

    if (error) {
      throw new Error(`Failed to get log stats: ${error.message}`);
    }

    const stats = {
      total: data.length,
      byLevel: {},
      byType: {},
      byUser: {},
      timeWindow: timeWindow,
      startTime,
      endTime: new Date().toISOString()
    };

    for (const log of data) {
      // Count by level
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;

      // Count by type
      if (log.meta && log.meta.type) {
        stats.byType[log.meta.type] = (stats.byType[log.meta.type] || 0) + 1;
      }

      // Count by user
      if (log.meta && log.meta.userId) {
        stats.byUser[log.meta.userId] = (stats.byUser[log.meta.userId] || 0) + 1;
      }
    }

    return stats;
  }

  /**
   * Search logs
   */
  async searchLogs(searchTerm, filters = {}, options = {}) {
    if (!this.databaseService) {
      throw new Error('Database service not configured');
    }

    const {
      level,
      type,
      userId,
      startDate,
      endDate,
      limit = 100,
      offset = 0
    } = { ...filters, ...options };

    let query = this.databaseService
      .from('system_logs')
      .select('*')
      .or(`message.ilike.%${searchTerm}%,meta.cs.{"search": "${searchTerm}"}`);

    // Apply additional filters
    if (level) {
      query = query.eq('level', level);
    }

    if (type) {
      query = query.eq('meta->type', type);
    }

    if (userId) {
      query = query.eq('meta->userId', userId);
    }

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }

    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    query = query
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to search logs: ${error.message}`);
    }

    return data;
  }

  /**
   * Cleanup old logs
   */
  async cleanupLogs(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days default
    if (!this.databaseService) {
      throw new Error('Database service not configured');
    }

    const cutoffDate = new Date(Date.now() - maxAge).toISOString();

    const { error } = await this.databaseService
      .from('system_logs')
      .delete()
      .lt('timestamp', cutoffDate);

    if (error) {
      throw new Error(`Failed to cleanup logs: ${error.message}`);
    }

    this.info(`Cleaned up logs older than ${cutoffDate}`);
  }

  /**
   * Export logs
   */
  async exportLogs(filters = {}, format = 'json') {
    const logs = await this.queryLogs(filters, { limit: 10000 });

    switch (format.toLowerCase()) {
      case 'csv':
        return this.exportToCSV(logs);
      case 'json':
      default:
        return JSON.stringify(logs, null, 2);
    }
  }

  /**
   * Export logs to CSV format
   */
  exportToCSV(logs) {
    if (logs.length === 0) {
      return 'timestamp,level,message,type,userId\n';
    }

    const headers = ['timestamp', 'level', 'message', 'type', 'userId'];
    const csvRows = [headers.join(',')];

    for (const log of logs) {
      const row = [
        log.timestamp,
        log.level,
        `"${log.message.replace(/"/g, '""')}"`,
        log.meta?.type || '',
        log.meta?.userId || ''
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Create log alert
   */
  createLogAlert(condition, action) {
    // Implementation for log-based alerts
    // Could monitor log patterns and trigger alerts
  }

  /**
   * Get logger instance
   */
  getLogger() {
    return this.logger;
  }

  /**
   * Close logger and cleanup
   */
  async close() {
    // Flush remaining logs
    await this.flushBuffer();

    // Close Winston logger
    if (this.logger) {
      this.logger.close();
    }

    this.info('Logging service closed');
  }
}
