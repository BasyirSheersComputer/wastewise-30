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

dotenv.config();

// Initialize Supabase client with error handling
let supabase;
try {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not found. Some features will be disabled.');
    supabase = null;
  } else {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error.message);
  supabase = null;
}

const app = express();
const PORT = process.env.PORT || 3000;

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
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:5173',
    'https://wastewise-frontend-*.run.app',
    'https://*.run.app'
  ],
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
    version: '1.0.0',
    message: 'Backend is running successfully',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database connection test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    if (!supabase) {
      return res.json({
        status: 'error',
        message: 'Supabase client not initialized',
        connection: {
          url: process.env.SUPABASE_URL ? 'configured' : 'missing',
          key: process.env.SUPABASE_ANON_KEY ? 'configured' : 'missing'
        },
        tests: {
          basic_connection: false,
          rpc_functions: false,
          auth_service: false,
          schema_access: false
        },
        details: {
          connection_error: 'Supabase client not initialized',
          rpc_error: 'Supabase client not initialized',
          auth_error: 'Supabase client not initialized',
          available_tables: []
        },
        summary: {
          passed: 0,
          total: 4,
          percentage: 0
        },
        timestamp: new Date().toISOString()
      });
    }

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
    supabaseUrl: process.env.SUPABASE_URL ? 'Configured' : 'Not configured'
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
  logger.info(`Supabase configured: ${supabase ? 'Yes' : 'No'}`);
  logger.info(`Supabase URL: ${process.env.SUPABASE_URL ? 'Configured' : 'Not configured'}`);
});
