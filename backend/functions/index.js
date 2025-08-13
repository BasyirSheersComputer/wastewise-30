const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Initialize Firebase Admin
admin.initializeApp();

// Import your existing Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://*.supabase.co", "https://api.openai.com", "https://generativelanguage.googleapis.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(compression());

// CORS configuration for Firebase Functions
app.use(cors({
  origin: [
    'https://wastewise-30.web.app',
    'https://wastewise-30.firebaseapp.com',
    'https://wastewise-30.web.app',
    'http://localhost:5000', // For local development
    'http://localhost:5173'  // For Vite dev server
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: 'firebase-functions',
    version: '1.0.0',
    region: functions.config().region || 'us-central1'
  });
});

// Import your existing routes
const authRoutes = require('./routes/auth.js');
const dashboardRoutes = require('./routes/dashboard.js');
const userRoutes = require('./routes/user.js');
const billingRoutes = require('./routes/billing.js');
const coffeeChainRoutes = require('./routes/coffeeChain.js');

// Mount your existing routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/user', userRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/coffee-chain', coffeeChainRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Log error details for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      body: req.body
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Export the Express app as a Firebase Function
exports.api = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutes
    memory: '1GB',
    minInstances: 0,
    maxInstances: 10
  })
  .https.onRequest(app);

// Optional: Export individual functions for better performance
exports.health = functions.https.onRequest((req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: 'firebase-functions',
    version: '1.0.0',
    region: functions.config().region || 'us-central1'
  });
});

// Scheduled function for cleanup tasks (optional)
exports.scheduledCleanup = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    console.log('Running scheduled cleanup task');
    
    try {
      // Add your cleanup logic here
      // e.g., cleanup old sessions, expired data, etc.
      
      console.log('Cleanup task completed successfully');
      return null;
    } catch (error) {
      console.error('Cleanup task failed:', error);
      throw error;
    }
  });
