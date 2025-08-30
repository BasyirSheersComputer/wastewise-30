import express from 'express';
import { getRecommendations, getMultiSectionRecommendations } from '../ai/recommendations.js';
import { getAnalyticsData } from '../ai/analytics.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Get dashboard overview data
router.get('/overview', async (req, res) => {
  try {
    const analytics = await getAnalyticsData();
    const recommendations = await getRecommendations('dashboard');
    
    res.json({
      analytics,
      recommendations: recommendations.recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get section-specific data
router.get('/section/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const { provider = 'auto' } = req.query;
    
    const result = await getRecommendations(section, provider);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get multiple sections data
router.get('/sections', async (req, res) => {
  try {
    const { sections = ['dashboard', 'waste', 'supplier', 'menu'] } = req.query;
    const { provider = 'auto' } = req.query;
    
    const sectionArray = Array.isArray(sections) ? sections : sections.split(',');
    const results = await getMultiSectionRecommendations(sectionArray);
    
    res.json({
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get key performance indicators
router.get('/kpis', async (req, res) => {
  try {
    const analytics = await getAnalyticsData();
    
    // Calculate KPIs
    const kpis = {
      totalWaste: analytics.waste?.length || 0,
      totalSuppliers: analytics.supplierRisk?.length || 0,
      staffCompletionRate: analytics.staffTraining?.filter(s => s.completed).length / (analytics.staffTraining?.length || 1) * 100,
      complianceRate: analytics.compliance?.filter(c => c.risk === 'low').length / (analytics.compliance?.length || 1) * 100,
      topItems: analytics.topSellingItems?.length || 0
    };
    
    res.json({
      kpis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent activity
router.get('/activity', async (req, res) => {
  try {
    const analytics = await getAnalyticsData();
    
    const activity = {
      recentWaste: analytics.waste?.slice(0, 5) || [],
      recentOrders: analytics.topSellingItems?.slice(0, 5) || [],
      staffUpdates: analytics.staffTraining?.slice(0, 5) || [],
      complianceAlerts: analytics.compliance?.filter(c => c.risk === 'high').slice(0, 5) || []
    };
    
    res.json({
      activity,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
