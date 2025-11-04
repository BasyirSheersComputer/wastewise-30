// fileUpload.js - File upload and AI analysis routes
import express from 'express';
import multer from 'multer';
import { authenticateUser } from '../utils/authMiddleware.js';
import fileParsingService from '../services/fileParsingService.js';
import aiAgentService from '../services/aiAgentService.js';
import prophetForecastService from '../services/prophetForecastService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/pdf', 'application/vnd.ms-excel'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and PDF files are allowed.'));
    }
  }
});

/**
 * Upload and analyze file with AI
 * POST /api/upload/analyze
 */
router.post('/analyze', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { feature } = req.body;
    if (!feature) {
      return res.status(400).json({
        success: false,
        error: 'Feature parameter is required'
      });
    }

    const userId = req.user.id;
    const file = req.file;

    logger.info(`File upload received`, {
      userId,
      feature,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype
    });

    // Parse and analyze file
    const result = await fileParsingService.parseAndAnalyze(
      file.buffer,
      file.mimetype,
      feature,
      userId
    );

    res.json({
      success: true,
      message: 'File processed successfully',
      ...result
    });
  } catch (error) {
    logger.error('File upload and analysis failed', {
      error: error.message,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: error.message || 'File processing failed'
    });
  }
});

/**
 * Get AI recommendations for feature
 * POST /api/upload/recommendations
 */
router.post('/recommendations', authenticateUser, async (req, res) => {
  try {
    const { feature, context } = req.body;
    const userId = req.user.id;

    if (!feature) {
      return res.status(400).json({
        success: false,
        error: 'Feature parameter is required'
      });
    }

    const recommendations = await aiAgentService.getContextualRecommendations(
      feature,
      userId,
      context || {}
    );

    res.json({
      success: true,
      ...recommendations
    });
  } catch (error) {
    logger.error('Get recommendations failed', {
      error: error.message,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get recommendations'
    });
  }
});

/**
 * Generate forecast using Prophet + AI
 * POST /api/upload/forecast
 */
router.post('/forecast', authenticateUser, async (req, res) => {
  try {
    const { historicalData, periods, frequency, context } = req.body;
    const userId = req.user.id;

    if (!historicalData || !Array.isArray(historicalData)) {
      return res.status(400).json({
        success: false,
        error: 'Historical data is required (array of {date, value} objects)'
      });
    }

    const forecast = await prophetForecastService.generateForecast(
      historicalData,
      periods || 30,
      frequency || 'D',
      { context: { userId, ...context } }
    );

    res.json({
      success: true,
      ...forecast
    });
  } catch (error) {
    logger.error('Forecast generation failed', {
      error: error.message,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Forecast generation failed'
    });
  }
});

/**
 * Get feature-specific system prompt (for debugging/testing)
 * GET /api/upload/system-prompt/:feature
 */
router.get('/system-prompt/:feature', authenticateUser, async (req, res) => {
  try {
    const { feature } = req.params;
    const userId = req.user.id;

    const systemPrompt = aiAgentService.getFeatureSystemPrompt(feature, {
      userId,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      feature,
      systemPrompt,
      length: systemPrompt.length
    });
  } catch (error) {
    logger.error('Get system prompt failed', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get AI agent memory stats
 * GET /api/upload/memory-stats
 */
router.get('/memory-stats', authenticateUser, async (req, res) => {
  try {
    const stats = aiAgentService.getMemoryStats();

    res.json({
      success: true,
      ...stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

