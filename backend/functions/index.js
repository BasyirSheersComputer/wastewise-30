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
app.use(helmet());
app.use(compression());

// CORS configuration for Firebase Functions
app.use(cors({
  origin: [
    'https://wastewise-30.web.app',
    'https://wastewise-30.firebaseapp.com',
    'http://localhost:5000', // For local development
    'http://localhost:5173'  // For Vite dev server
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Import your existing routes
const authRoutes = require('./routes/auth.js');
const dashboardRoutes = require('./routes/dashboard.js');
const userRoutes = require('./routes/user.js');
const billingRoutes = require('./routes/billing.js');
const coffeeChainRoutes = require('./routes/coffeeChain.js');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: 'firebase-functions',
    version: '1.0.0'
  });
});

// Mount your existing routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/user', userRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/coffee-chain', coffeeChainRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);

// Optional: Export individual functions for better performance
exports.health = functions.https.onRequest((req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: 'firebase-functions',
    version: '1.0.0'
  });
});
