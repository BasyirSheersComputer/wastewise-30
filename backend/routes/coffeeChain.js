import express from 'express';
import coffeeChainService from '../services/coffeeChainService.js';
import { authenticateUser } from '../utils/authMiddleware.js';

const router = express.Router();

// Get operational dashboard data
router.get('/dashboard', authenticateUser, async (req, res) => {
  try {
    const result = await coffeeChainService.getOperationalDashboard();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recipe analysis
router.get('/recipes', authenticateUser, async (req, res) => {
  try {
    const result = await coffeeChainService.getRecipeAnalysis();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get waste analysis
router.get('/waste', authenticateUser, async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    const result = await coffeeChainService.getWasteAnalysis(timeRange);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get COGS analysis
router.get('/cogs', authenticateUser, async (req, res) => {
  try {
    const result = await coffeeChainService.getCogsAnalysis();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Log waste event
router.post('/waste/log', authenticateUser, async (req, res) => {
  try {
    const wasteData = req.body;
    const result = await coffeeChainService.logWasteEvent(wasteData);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update recipe
router.put('/recipes/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await coffeeChainService.updateRecipe(parseInt(id), updates);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get forecast recommendations
router.get('/recommendations', authenticateUser, async (req, res) => {
  try {
    const result = await coffeeChainService.getForecastRecommendations();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 