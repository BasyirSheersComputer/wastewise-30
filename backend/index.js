// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getRecommendations, getMultiSectionRecommendations } from './ai/recommendations.js';
import { getAnalyticsData } from './ai/analytics.js';
import { createClient } from '@supabase/supabase-js';
import { DateTime } from 'luxon';
import logger from './utils/logger.js';
import { authenticateUser, requireSubscription, rateLimit } from './utils/authMiddleware.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import dashboardRoutes from './routes/dashboard.js';
import billingRoutes from './routes/billing.js';
import coffeeChainRoutes from './routes/coffeeChain.js';
import issuesRoutes from './routes/issues.js';
import csvUploadRoutes from './routes/csvUpload.js';
import accessControlRoutes from './routes/accessControl.js';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    version: '1.0.0'
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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authenticateUser, userRoutes);
app.use('/api/dashboard', authenticateUser, requireSubscription, dashboardRoutes);
app.use('/api/billing', authenticateUser, billingRoutes);
app.use('/api/coffee-chain', authenticateUser, requireSubscription, coffeeChainRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/csv', authenticateUser, csvUploadRoutes);
app.use('/api/access-control', accessControlRoutes);

import { aiRecommendationService } from './services/aiRecommendationService.js';

// Enhanced analytics stream endpoint with rate limiting and idle detection
app.get('/stream/analytics', rateLimit(50, 60000), (req, res) => {
  const section = req.query.section || 'dashboard';
  const provider = req.query.provider || 'auto';

  // Set up Server-Sent Events headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });

  // Send a comment to establish the stream
  res.write(': connected\n\n');

  // Track this connection
  const connectionId = Date.now().toString();
  aiRecommendationService.activeConnections.add(connectionId);

  const sendData = async () => {
    try {
      // Use the new AI recommendation service with rate limiting
      const result = await aiRecommendationService.getRecommendations(section, provider);
      
      // Send the structured response
      res.write(`data: ${JSON.stringify({
        section: result.section,
        analytics: result.analytics,
        recommendations: result.recommendations,
        timestamp: result.timestamp,
        provider: result.provider,
        error: result.error
      })}\n\n`);
      
    } catch (error) {
      logger.apiError('GET', '/stream/analytics', error);
      res.write(`event: error\ndata: ${JSON.stringify({
        type: 'recommendations_error',
        message: error.message,
        section
      })}\n\n`);
    }
  };

  // Send initial data immediately
  sendData();

  // Only send updates every 5 minutes (instead of 30 seconds) to reduce API calls
  const interval = setInterval(sendData, 5 * 60 * 1000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
    aiRecommendationService.activeConnections.delete(connectionId);
  });
});

// New endpoint for getting recommendations for multiple sections
app.get('/api/recommendations', rateLimit(20, 60000), async (req, res) => {
  try {
    const { sections = ['dashboard'], provider = 'auto' } = req.query;
    const sectionArray = Array.isArray(sections) ? sections : [sections];
    
    const results = await aiRecommendationService.getMultiSectionRecommendations(sectionArray, provider);
    res.json({ results, timestamp: new Date().toISOString() });
    
  } catch (error) {
    logger.apiError('GET', '/api/recommendations', error);
    res.status(500).json({ error: error.message });
  }
});

// New endpoint for getting recommendations for a specific section
app.get('/api/recommendations/:section', rateLimit(20, 60000), async (req, res) => {
  try {
    const { section } = req.params;
    const { provider = 'auto', enableFallback = 'true' } = req.query;
    
    // Get user settings for LLM preferences
    let userProvider = provider;
    let userEnableFallback = enableFallback === 'true';
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userSettings } = await supabase
          .from('user_settings')
          .select('preferred_llm, enable_llm_fallback')
          .eq('user_id', user.id)
          .single();
        
        if (userSettings) {
          if (provider === 'auto') {
            userProvider = userSettings.preferred_llm || 'auto';
          }
          userEnableFallback = userSettings.enable_llm_fallback !== false;
        }
      }
    } catch (settingsError) {
      logger.warn('Could not load user settings, using defaults:', settingsError.message);
    }
    
    const result = await aiRecommendationService.getRecommendations(
      section, 
      userProvider, 
      false, 
      userEnableFallback
    );
    
    res.json(result);
    
  } catch (error) {
    logger.apiError('GET', `/api/recommendations/${req.params.section}`, error);
    res.status(500).json({ error: error.message });
  }
});

// New endpoint for force refreshing recommendations (bypasses cache and rate limits)
app.post('/api/recommendations/:section/refresh', rateLimit(5, 60000), async (req, res) => {
  try {
    const { section } = req.params;
    const { provider = 'auto' } = req.body;
    
    const result = await aiRecommendationService.forceRefreshRecommendations(section, provider);
    res.json(result);
    
  } catch (error) {
    logger.apiError('POST', `/api/recommendations/${req.params.section}/refresh`, error);
    res.status(500).json({ error: error.message });
  }
});

// AI service status endpoint
app.get('/api/ai/status', (req, res) => {
  const status = aiRecommendationService.getStatus();
  res.json({
    ...status,
    providers: ['gemini', 'chatgpt'],
    defaultProvider: 'auto',
    timestamp: new Date().toISOString()
  });
});

// AI service status endpoint
app.get('/api/ai/status', (req, res) => {
  res.json({
    status: 'operational',
    providers: ['gemini', 'chatgpt'],
    defaultProvider: 'auto',
    timestamp: new Date().toISOString()
  });
});

// Test AI endpoint
app.post('/api/ai/test', rateLimit(5, 60000), async (req, res) => {
  try {
    const { prompt, provider = 'auto' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const { askAI } = await import('./ai-service.js');
    const response = await askAI(prompt, provider);
    
    res.json({ 
      response,
      provider: provider === 'auto' ? 'auto' : provider,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.apiError('POST', '/api/ai/test', error);
    res.status(500).json({ error: error.message });
  }
});

// User onboarding endpoint (existing)
app.post('/api/user/onboard', async (req, res) => {
  try {
    const { user_id, email, company, size, pain, name } = req.body;
    
    if (!user_id || !email || !company || !size || !pain || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const now = DateTime.now();
    const trial_start = now.toISO();
    const trial_end = now.plus({ days: 30 }).toISO();
    
    const { error } = await supabase.from('users').insert([
      {
        id: user_id,
        email,
        company,
        size,
        pain,
        name,
        trial_start,
        trial_end,
      },
    ]);
    
    if (error) {
      logger.dbError('users', 'insert', error);
      return res.status(400).json({ error: error.message });
    }
    
    logger.info('User onboarded successfully', { user_id, email });
    return res.status(200).json({ success: true });
    
  } catch (error) {
    logger.apiError('POST', '/api/user/onboard', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug endpoint for monitoring user activities
app.get('/api/debug/users', async (req, res) => {
  try {
    // Get recent auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    // Get recent user profiles
    const { data: profiles, error: profileError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Get recent auth activities
    const { data: authLogs, error: logError } = await supabase
      .from('auth.users')
      .select('id, email, created_at, email_confirmed_at, last_sign_in_at')
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      timestamp: new Date().toISOString(),
      auth_users_count: authUsers?.users?.length || 0,
      profiles_count: profiles?.length || 0,
      recent_auth_users: authUsers?.users?.slice(0, 5) || [],
      recent_profiles: profiles || [],
      recent_auth_logs: authLogs || [],
      errors: {
        auth: authError?.message || null,
        profiles: profileError?.message || null,
        logs: logError?.message || null
      }
    });
  } catch (error) {
    logger.apiError('GET', '/api/debug/users', error);
    res.status(500).json({ error: error.message });
  }
});

// Test profile creation endpoint
app.post('/api/debug/create-profile', async (req, res) => {
  try {
    const { userId, userData } = req.body;
    
    if (!userId || !userData) {
      return res.status(400).json({ error: 'User ID and user data required' });
    }

    logger.info('Debug: Creating test profile', { userId, userData });

    const { error } = await supabase.from('users').insert([{
      id: userId,
      email: userData.email,
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      company_name: userData.company_name || 'Test Company',
      company_size: userData.company_size || 'small',
      primary_pain: userData.primary_pain || 'waste_reduction',
      phone_number: userData.phone_number || '',
      business_type: 'restaurant',
      locations: 1,
      annual_revenue: 'under_100k',
      primary_goals: [],
      data_sources: [],
      team_size: '1-10',
      timezone: 'Asia/Kuala_Lumpur',
      trial_start: new Date().toISOString(),
      trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      subscription_status: 'trial',
      subscription_plan: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }]);

    if (error) {
      logger.error('Debug: Profile creation failed', error);
      return res.status(400).json({ error: error.message });
    }

    logger.info('Debug: Profile created successfully', { userId });
    res.json({ success: true, message: 'Test profile created' });
  } catch (error) {
    logger.apiError('POST', '/api/debug/create-profile', error);
    res.status(500).json({ error: error.message });
  }
});

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
