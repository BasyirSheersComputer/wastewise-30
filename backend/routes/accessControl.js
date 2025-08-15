// accessControl.js
import express from 'express';
import { authenticateUser, requireSubscription } from '../utils/authMiddleware.js';
import accessControlService from '../services/accessControlService.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * Get user's current access information
 */
router.get('/user-access', authenticateUser, requireSubscription, async (req, res) => {
  try {
    const userAccess = await accessControlService.getUserAccess(req.user.id);
    res.json(userAccess);
  } catch (error) {
    logger.error('Error getting user access', error);
    res.status(500).json({ error: 'Failed to get user access information' });
  }
});

/**
 * Check if user has access to a specific feature
 */
router.get('/feature-access/:featureName', authenticateUser, requireSubscription, async (req, res) => {
  try {
    const { featureName } = req.params;
    const accessCheck = await accessControlService.hasFeatureAccess(req.user.id, featureName);
    res.json(accessCheck);
  } catch (error) {
    logger.error('Error checking feature access', error);
    res.status(500).json({ error: 'Failed to check feature access' });
  }
});

/**
 * Check usage limits for a specific action
 */
router.post('/usage-limits', authenticateUser, requireSubscription, async (req, res) => {
  try {
    const { action, currentUsage } = req.body;
    
    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    const limitCheck = await accessControlService.checkUsageLimits(req.user.id, action, currentUsage);
    res.json(limitCheck);
  } catch (error) {
    logger.error('Error checking usage limits', error);
    res.status(500).json({ error: 'Failed to check usage limits' });
  }
});

/**
 * Get available plan upgrades
 */
router.get('/available-upgrades', authenticateUser, requireSubscription, async (req, res) => {
  try {
    const upgrades = await accessControlService.getAvailableUpgrades(req.user.id);
    res.json(upgrades);
  } catch (error) {
    logger.error('Error getting available upgrades', error);
    res.status(500).json({ error: 'Failed to get available upgrades' });
  }
});

/**
 * Get feature comparison between plans
 */
router.get('/feature-comparison', authenticateUser, async (req, res) => {
  try {
    const comparison = accessControlService.getFeatureComparison();
    res.json(comparison);
  } catch (error) {
    logger.error('Error getting feature comparison', error);
    res.status(500).json({ error: 'Failed to get feature comparison' });
  }
});

/**
 * Update user's subscription plan (admin only)
 */
router.put('/update-plan', authenticateUser, requireSubscription, async (req, res) => {
  try {
    const { newPlan } = req.body;
    
    if (!newPlan) {
      return res.status(400).json({ error: 'New plan is required' });
    }

    // Get current user access
    const currentAccess = await accessControlService.getUserAccess(req.user.id);
    
    // Validate plan transition
    const validation = accessControlService.validatePlanTransition(currentAccess.plan, newPlan);
    
    if (!validation.allowed) {
      return res.status(400).json({ 
        error: validation.message,
        reason: validation.reason
      });
    }

    // Update the plan
    const updatedAccess = await accessControlService.updateUserPlan(req.user.id, newPlan);
    
    res.json({
      message: 'Plan updated successfully',
      previousPlan: currentAccess.plan,
      newPlan: updatedAccess.plan,
      access: updatedAccess
    });
  } catch (error) {
    logger.error('Error updating user plan', error);
    res.status(500).json({ error: 'Failed to update user plan' });
  }
});

/**
 * Get user's current usage statistics
 */
router.get('/usage-stats', authenticateUser, requireSubscription, async (req, res) => {
  try {
    const userAccess = await accessControlService.getUserAccess(req.user.id);
    
    // Get current usage from database
    const { data: locations, error: locationError } = await req.supabase
      .from('locations')
      .select('id')
      .eq('user_id', req.user.id);

    const { data: users, error: userError } = await req.supabase
      .from('users')
      .select('id')
      .eq('organization_id', req.user.organization_id);

    if (locationError || userError) {
      logger.error('Error fetching usage stats', { locationError, userError });
      return res.status(500).json({ error: 'Failed to fetch usage statistics' });
    }

    const usageStats = {
      locations: {
        current: locations?.length || 0,
        limit: userAccess.maxLocations,
        unlimited: userAccess.maxLocations === -1
      },
      users: {
        current: users?.length || 0,
        limit: userAccess.maxUsers,
        unlimited: userAccess.maxUsers === -1
      },
      plan: userAccess.plan,
      planName: userAccess.planName
    };

    res.json(usageStats);
  } catch (error) {
    logger.error('Error getting usage stats', error);
    res.status(500).json({ error: 'Failed to get usage statistics' });
  }
});

/**
 * Check if user can access a specific module
 */
router.get('/module-access/:moduleName', authenticateUser, requireSubscription, async (req, res) => {
  try {
    const { moduleName } = req.params;
    
    // Map module names to feature names
    const moduleToFeatureMap = {
      'dashboard': 'operational_intelligence',
      'inventory': 'recipe_inventory',
      'forecasting': 'demand_forecasting',
      'waste': 'waste_tracking',
      'suppliers': 'suppliers',
      'menu': 'menu_optimization',
      'training': 'staff_training',
      'reports': 'reports_compliance',
      'csv': 'csv_upload',
      'issues': 'issue_reporting',
      'ai-training': 'custom_ai_training',
      'white-label': 'white_label',
      'integrations': 'custom_integrations',
      'support': 'dedicated_support',
      'implementation': 'custom_implementation',
      'ai-development': 'custom_ai_development',
      'engineering': 'dedicated_engineering',
      'consulting': 'strategic_consulting',
      'priority': 'priority_development',
      'international': 'international_expansion'
    };

    const featureName = moduleToFeatureMap[moduleName];
    
    if (!featureName) {
      return res.status(400).json({ error: 'Invalid module name' });
    }

    const accessCheck = await accessControlService.hasFeatureAccess(req.user.id, featureName);
    
    res.json({
      module: moduleName,
      feature: featureName,
      ...accessCheck
    });
  } catch (error) {
    logger.error('Error checking module access', error);
    res.status(500).json({ error: 'Failed to check module access' });
  }
});

export default router;
