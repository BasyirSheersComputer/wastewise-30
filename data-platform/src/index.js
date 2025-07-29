#!/usr/bin/env node

/**
 * WasteWise Data Platform
 * World-class data platform with AI agent capabilities
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import platform modules
import { DataIngestionService } from './services/data-ingestion.js';
import { DataProcessingService } from './services/data-processing.js';
import { AnalyticsEngine } from './services/analytics-engine.js';
import { AIAgentService } from './services/ai-agent.js';
import { BusinessIntelligenceService } from './services/business-intelligence.js';
import { MonitoringService } from './services/monitoring.js';
import { DatabaseService } from './services/database.js';
import { CacheService } from './services/cache.js';

// Import routes
import dataRoutes from './routes/data.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes from './routes/ai.js';
import biRoutes from './routes/business-intelligence.js';
import monitoringRoutes from './routes/monitoring.js';

// Import middleware
import { errorHandler } from './middleware/error-handler.js';
import { rateLimiter } from './middleware/rate-limiter.js';
import { authMiddleware } from './middleware/auth.js';
import { validationMiddleware } from './middleware/validation.js';

// Import utilities
import { logger } from './utils/logger.js';
import { config } from './config/index.js';

dotenv.config();

class DataPlatform {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST']
      }
    });
    
    this.services = {};
    this.isInitialized = false;
  }

  async initialize() {
    try {
      logger.info('🚀 Initializing WasteWise Data Platform...');

      // Initialize core services
      await this.initializeServices();
      
      // Setup middleware
      this.setupMiddleware();
      
      // Setup routes
      this.setupRoutes();
      
      // Setup WebSocket handlers
      this.setupWebSockets();
      
      // Setup error handling
      this.setupErrorHandling();
      
      // Start monitoring
      await this.startMonitoring();
      
      this.isInitialized = true;
      logger.info('✅ Data Platform initialized successfully');
      
    } catch (error) {
      logger.error('❌ Failed to initialize Data Platform:', error);
      throw error;
    }
  }

  async initializeServices() {
    logger.info('🔧 Initializing services...');

    // Initialize database
    this.services.database = new DatabaseService();
    await this.services.database.connect();

    // Initialize cache
    this.services.cache = new CacheService();
    await this.services.cache.connect();

    // Initialize data ingestion
    this.services.dataIngestion = new DataIngestionService(
      this.services.database,
      this.services.cache
    );

    // Initialize data processing
    this.services.dataProcessing = new DataProcessingService(
      this.services.database,
      this.services.cache
    );

    // Initialize analytics engine
    this.services.analytics = new AnalyticsEngine(
      this.services.database,
      this.services.cache
    );

    // Initialize AI agent
    this.services.aiAgent = new AIAgentService(
      this.services.database,
      this.services.cache,
      this.services.analytics
    );

    // Initialize business intelligence
    this.services.businessIntelligence = new BusinessIntelligenceService(
      this.services.database,
      this.services.cache,
      this.services.analytics,
      this.services.aiAgent
    );

    // Initialize monitoring
    this.services.monitoring = new MonitoringService(
      this.services.database,
      this.services.cache
    );

    logger.info('✅ All services initialized');
  }

  setupMiddleware() {
    logger.info('🔧 Setting up middleware...');

    // Security middleware
    this.app.use(helmet());
    this.app.use(cors(config.cors));
    
    // Compression
    this.app.use(compression());
    
    // Logging
    this.app.use(morgan('combined', {
      stream: { write: message => logger.info(message.trim()) }
    }));
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Rate limiting
    this.app.use(rateLimiter);
    
    // Validation
    this.app.use(validationMiddleware);
    
    logger.info('✅ Middleware setup complete');
  }

  setupRoutes() {
    logger.info('🔧 Setting up routes...');

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: config.version,
        services: Object.keys(this.services)
      });
    });

    // API routes
    this.app.use('/api/v1/data', authMiddleware, dataRoutes);
    this.app.use('/api/v1/analytics', authMiddleware, analyticsRoutes);
    this.app.use('/api/v1/ai', authMiddleware, aiRoutes);
    this.app.use('/api/v1/bi', authMiddleware, biRoutes);
    this.app.use('/api/v1/monitoring', authMiddleware, monitoringRoutes);

    logger.info('✅ Routes setup complete');
  }

  setupWebSockets() {
    logger.info('🔧 Setting up WebSocket handlers...');

    this.io.on('connection', (socket) => {
      logger.info(`🔌 Client connected: ${socket.id}`);

      // Handle real-time data updates
      socket.on('subscribe', (channel) => {
        socket.join(channel);
        logger.info(`📡 Client ${socket.id} subscribed to ${channel}`);
      });

      // Handle AI agent interactions
      socket.on('ai-query', async (data) => {
        try {
          const response = await this.services.aiAgent.processQuery(data);
          socket.emit('ai-response', response);
        } catch (error) {
          socket.emit('ai-error', { error: error.message });
        }
      });

      socket.on('disconnect', () => {
        logger.info(`🔌 Client disconnected: ${socket.id}`);
      });
    });

    logger.info('✅ WebSocket handlers setup complete');
  }

  setupErrorHandling() {
    this.app.use(errorHandler);
  }

  async startMonitoring() {
    await this.services.monitoring.start();
    
    // Start periodic health checks
    setInterval(async () => {
      await this.services.monitoring.healthCheck();
    }, 30000); // Every 30 seconds
  }

  async start() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const port = config.server.port || 4000;
    
    this.server.listen(port, () => {
      logger.info(`🚀 Data Platform running on port ${port}`);
      logger.info(`📊 Health check: http://localhost:${port}/health`);
      logger.info(`🔗 API docs: http://localhost:${port}/api/v1/docs`);
    });
  }

  async stop() {
    logger.info('🛑 Shutting down Data Platform...');
    
    // Stop all services
    for (const [name, service] of Object.entries(this.services)) {
      if (service.stop) {
        await service.stop();
      }
    }
    
    // Close server
    this.server.close(() => {
      logger.info('✅ Data Platform stopped');
      process.exit(0);
    });
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await platform.stop();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await platform.stop();
});

// Start the platform
const platform = new DataPlatform();

if (import.meta.url === `file://${process.argv[1]}`) {
  platform.start().catch(error => {
    logger.error('❌ Failed to start Data Platform:', error);
    process.exit(1);
  });
}

export default platform; 