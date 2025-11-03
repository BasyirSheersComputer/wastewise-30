// index.js - Complete backend implementation with all routes
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { getRecommendations, getMultiSectionRecommendations } from './ai/recommendations.js';
import { getAnalyticsData } from './ai/analytics.js';
import { createClient } from '@supabase/supabase-js';
import { DateTime } from 'luxon';
import logger from './utils/logger.js';
import { authenticateUser, requireSubscription } from './utils/authMiddleware.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import dashboardRoutes from './routes/dashboard.js';
import billingRoutes from './routes/billing.js';
import issuesRoutes from './routes/issues.js';
import csvUploadRoutes from './routes/csvUpload.js';
import accessControlRoutes from './routes/accessControl.js';
import coffeeChainRoutes from './routes/coffeeChain.js';
import statisticalModelsRoutes from './routes/statisticalModels.js';
import testStatisticalModelsRoutes from './routes/testStatisticalModels.js';
import demoStatisticalModelsRoutes from './routes/demoStatisticalModels.js';
import inventoryRoutes from './routes/inventory.js';
import wasteRoutes from './routes/waste.js';
import suppliersRoutes from './routes/suppliers.js';
import outletsRoutes from './routes/outlets.js';
import aiRoutes from './routes/ai.js';
import analyticsRoutes from './routes/analytics.js';
import integrationsRoutes from './routes/integrations.js';
import aiUfeRoutes from './routes/aiUfe.js';
import integrationTestRoutes from './routes/integrationTest.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

// Get environment variables directly
let supabaseUrl = process.env.SUPABASE_URL;
let supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Create Supabase client only if environment variables are available
let supabase = null;
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    logger.info('Supabase client created successfully');
  } else {
    logger.warn('Supabase environment variables not found, database features will be disabled');
  }
} catch (error) {
  logger.error('Failed to create Supabase client:', error.message);
}

const app = express();
// Cloud Run injects PORT env var, default to 8080 for consistency
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration for Cloud Run
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:3000',
      'https://wastewise-frontend-451983642521.asia-southeast1.run.app',
      'https://servora-ai.sheerssoft.com',
      'http://servora-ai.sheerssoft.com',
      process.env.CORS_ORIGIN
    ].filter(Boolean);
    
    // Check if origin is in allowed list or matches run.app pattern
    if (allowedOrigins.includes(origin) || origin.endsWith('.run.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.apiResponse(req.method, req.path, res.statusCode, duration);
  });
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.1.0',
    message: 'Backend is running successfully',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database connection test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    // Test 1: Basic connection by checking if we can connect to Supabase
    const { data: connectionTest, error: connectionError } = await supabase
      .from('_supabase_migrations')
      .select('*')
      .limit(1);
    
    // Test 2: Check if we can perform a simple query (this should work even if tables don't exist)
    const { data: rpcTest, error: rpcError } = await supabase
      .rpc('version');
    
    // Test 3: Check authentication service
    const { data: authTest, error: authError } = await supabase.auth.getSession();
    
    // Test 4: Try to get schema information
    let schemaInfo = null;
    try {
      const { data: schemaData, error: schemaError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(5);
      
      if (!schemaError) {
        schemaInfo = schemaData;
      }
    } catch (schemaErr) {
      // Schema query might not be available with anon key
    }
    
    const tests = {
      connection: !connectionError,
      rpc: !rpcError,
      auth: !authError,
      schema: schemaInfo !== null
    };
    
    const passedTests = Object.values(tests).filter(Boolean).length;
    const totalTests = Object.keys(tests).length;
    
    res.json({
      status: passedTests === totalTests ? 'success' : 'partial',
      message: passedTests === totalTests ? 'Database connection successful' : 'Database connection partially working',
      connection: {
        url: process.env.SUPABASE_URL ? 'configured' : 'missing',
        key: process.env.SUPABASE_ANON_KEY ? 'configured' : 'missing'
      },
      tests: {
        basic_connection: tests.connection,
        rpc_functions: tests.rpc,
        auth_service: tests.auth,
        schema_access: tests.schema
      },
      details: {
        connection_error: connectionError?.message || null,
        rpc_error: rpcError?.message || null,
        auth_error: authError?.message || null,
        available_tables: schemaInfo?.map(t => t.table_name) || []
      },
      summary: {
        passed: passedTests,
        total: totalTests,
        percentage: Math.round((passedTests / totalTests) * 100)
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.apiError('GET', '/api/test-db', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend API is working',
    timestamp: new Date().toISOString(),
    supabaseUrl: supabaseUrl ? 'Configured' : 'Not configured',
    geminiApiKey: process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured',
    openaiApiKey: process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/upload', csvUploadRoutes);
app.use('/api/access-control', accessControlRoutes);
app.use('/api/coffee-chain', coffeeChainRoutes);
app.use('/api/statistical-models', statisticalModelsRoutes);
app.use('/api/test-statistical', testStatisticalModelsRoutes);
app.use('/api/demo-statistical', demoStatisticalModelsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/outlets', outletsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/ai-ufe', aiUfeRoutes);
app.use('/api/integration-test', integrationTestRoutes);
app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  logger.apiError(req.method, req.path, error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});
