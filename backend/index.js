// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getRecommendations, getMultiSectionRecommendations } from './recommendations.js';
import { getAnalyticsData } from './analytics.js';
import { createClient } from '@supabase/supabase-js';
import { DateTime } from 'luxon';
import logger from './utils/logger.js';
import { authenticateUser, requireSubscription, rateLimit } from './utils/authMiddleware.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import dashboardRoutes from './routes/dashboard.js';
import billingRoutes from './routes/billing.js';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authenticateUser, userRoutes);
app.use('/api/dashboard', authenticateUser, requireSubscription, dashboardRoutes);
app.use('/api/billing', authenticateUser, billingRoutes);

// Enhanced analytics stream endpoint
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

  const sendData = async () => {
    try {
      // Use the new recommendations system
      const result = await getRecommendations(section, provider);
      
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

  // Send immediately, then every 30 seconds
  sendData();
  const interval = setInterval(sendData, 30000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
});

// New endpoint for getting recommendations for multiple sections
app.get('/api/recommendations', rateLimit(20, 60000), async (req, res) => {
  try {
    const { sections = ['dashboard'], provider = 'auto' } = req.query;
    const sectionArray = Array.isArray(sections) ? sections : [sections];
    
    const results = await getMultiSectionRecommendations(sectionArray);
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
    const { provider = 'auto' } = req.query;
    
    const result = await getRecommendations(section, provider);
    res.json(result);
    
  } catch (error) {
    logger.apiError('GET', `/api/recommendations/${req.params.section}`, error);
    res.status(500).json({ error: error.message });
  }
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
