/**
 * AI-UFE Routes
 * Prescriptive AI Unified Forecasting Engine endpoints
 */

import express from 'express';
import { authenticateUser } from '../utils/authMiddleware.js';
import AIUfeService from '../services/aiUfeService.js';
import logger from '../utils/logger.js';

const router = express.Router();
const aiUfeService = new AIUfeService();

/**
 * @route POST /api/ai-ufe/prescriptive-flow
 * @desc Execute Prescriptive Flow (Anomaly Detection → RCA → Mitigation)
 */
router.post('/prescriptive-flow', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const options = req.body;

    const result = await aiUfeService.executePrescriptiveFlow(userId, options);

    res.json(result);
  } catch (error) {
    logger.error('Prescriptive flow execution failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to execute prescriptive flow'
    });
  }
});

/**
 * @route POST /api/ai-ufe/forecast/demand
 * @desc Hyper-granular demand forecasting (15-minute, SKU-level)
 */
router.post('/forecast/demand', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { outletId, sku, interval = '15min', horizon = 7, includeExternalFactors = true } = req.body;

    if (!outletId || !sku) {
      return res.status(400).json({
        success: false,
        error: 'outletId and sku are required'
      });
    }

    const result = await aiUfeService.forecastDemand(userId, outletId, sku, {
      interval,
      horizon,
      includeExternalFactors
    });

    res.json(result);
  } catch (error) {
    logger.error('Demand forecasting failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate demand forecast'
    });
  }
});

/**
 * @route POST /api/ai-ufe/prescriptions/ordering
 * @desc Generate prescriptive ingredient ordering recommendations
 */
router.post('/prescriptions/ordering', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { outletId } = req.body;

    const result = await aiUfeService.generateOrderingPrescriptions(userId, outletId);

    res.json(result);
  } catch (error) {
    logger.error('Ordering prescription generation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate ordering prescriptions'
    });
  }
});

/**
 * @route POST /api/ai-ufe/schedule/labor
 * @desc Optimize labor scheduling
 */
router.post('/schedule/labor', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { outletId, weekStart, constraints } = req.body;

    if (!outletId) {
      return res.status(400).json({
        success: false,
        error: 'outletId is required'
      });
    }

    const result = await aiUfeService.optimizeLaborSchedule(userId, outletId, {
      weekStart,
      constraints
    });

    res.json(result);
  } catch (error) {
    logger.error('Labor schedule optimization failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to optimize labor schedule'
    });
  }
});

/**
 * @route GET /api/ai-ufe/competency/staff
 * @desc Measure staff competency
 */
router.get('/competency/staff', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { outletId } = req.query;

    const result = await aiUfeService.measureStaffCompetency(userId, outletId);

    res.json(result);
  } catch (error) {
    logger.error('Staff competency measurement failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to measure staff competency'
    });
  }
});

/**
 * @route GET /api/ai-ufe/suppliers/risk-index
 * @desc Calculate Supplier Risk Index (SRI)
 */
router.get('/suppliers/risk-index', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await aiUfeService.calculateSupplierRiskIndex(userId);

    res.json(result);
  } catch (error) {
    logger.error('SRI calculation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate supplier risk index'
    });
  }
});

/**
 * @route POST /api/ai-ufe/forecast/cash-flow
 * @desc Cash flow forecasting (<5% variance target)
 */
router.post('/forecast/cash-flow', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { horizon = 30 } = req.body;

    const result = await aiUfeService.forecastCashFlow(userId, { horizon });

    res.json(result);
  } catch (error) {
    logger.error('Cash flow forecasting failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to forecast cash flow'
    });
  }
});

/**
 * @route GET /api/ai-ufe/system/health
 * @desc System health monitoring
 */
router.get('/system/health', authenticateUser, async (req, res) => {
  try {
    const result = await aiUfeService.checkSystemHealth();

    res.json(result);
  } catch (error) {
    logger.error('System health check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check system health'
    });
  }
});

/**
 * @route GET /api/ai-ufe/system/health/recommendations
 * @desc Get recovery recommendations for system issues
 */
router.get('/system/health/recommendations', authenticateUser, async (req, res) => {
  try {
    const { module } = req.query;
    const result = await aiUfeService.getHealthRecommendations(module);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Health recommendations failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get health recommendations'
    });
  }
});

export default router;

