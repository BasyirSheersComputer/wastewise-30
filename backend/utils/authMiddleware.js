// authMiddleware.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

/**
 * Plan definitions with features and limitations
 */
const PLAN_FEATURES = {
  professional: {
    name: 'Professional',
    maxLocations: 25,
    maxUsers: 10,
    features: [
      'operational_intelligence',
      'recipe_inventory',
      'demand_forecasting',
      'waste_tracking',
      'suppliers',
      'menu_optimization',
      'staff_training',
      'reports_compliance',
      'csv_upload',
      'issue_reporting'
    ],
    limitations: [
      'no_custom_ai_training',
      'no_white_label',
      'standard_implementation'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    maxLocations: -1, // unlimited
    maxUsers: -1, // unlimited
    features: [
      'operational_intelligence',
      'recipe_inventory',
      'demand_forecasting',
      'waste_tracking',
      'suppliers',
      'menu_optimization',
      'staff_training',
      'reports_compliance',
      'csv_upload',
      'issue_reporting',
      'custom_ai_training',
      'white_label',
      'custom_integrations',
      'dedicated_support',
      'custom_implementation'
    ],
    limitations: []
  },
  elite: {
    name: 'Elite',
    maxLocations: -1, // unlimited
    maxUsers: -1, // unlimited
    features: [
      'operational_intelligence',
      'recipe_inventory',
      'demand_forecasting',
      'waste_tracking',
      'suppliers',
      'menu_optimization',
      'staff_training',
      'reports_compliance',
      'csv_upload',
      'issue_reporting',
      'custom_ai_training',
      'white_label',
      'custom_integrations',
      'dedicated_support',
      'custom_implementation',
      'custom_ai_development',
      'dedicated_engineering',
      'strategic_consulting',
      'priority_development',
      'international_expansion'
    ],
    limitations: []
  }
};

/**
 * Middleware to authenticate requests
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Set the auth token for Supabase
    supabase.auth.setSession({ access_token: token, refresh_token: null });
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      logger.apiError('GET', req.path, error);
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Add user to request object
    req.user = user;
    
    logger.apiRequest(req.method, req.path, user.id);
    next();
  } catch (error) {
    logger.apiError(req.method, req.path, error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware to check if user has active subscription
 */
export const requireSubscription = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('subscription_status, trial_end, subscription_plan')
      .eq('id', req.user.id)
      .single();

    if (error) {
      logger.dbError('users', 'select', error);
      return res.status(500).json({ error: 'Failed to check subscription' });
    }

    const now = new Date();
    const trialEnd = new Date(userData.trial_end);
    const isTrialExpired = now > trialEnd;
    const hasActiveSubscription = userData.subscription_status === 'active' || userData.subscription_status === 'trialing';

    if (isTrialExpired && !hasActiveSubscription) {
      return res.status(403).json({ 
        error: 'Subscription required',
        trialExpired: true
      });
    }

    // Add subscription info to request
    req.userSubscription = {
      status: userData.subscription_status,
      plan: userData.subscription_plan,
      isTrialExpired,
      hasActiveSubscription
    };

    next();
  } catch (error) {
    logger.apiError(req.method, req.path, error);
    res.status(500).json({ error: 'Subscription check failed' });
  }
};

/**
 * Middleware to check if user has specific plan access
 */
export const requirePlan = (requiredPlan) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get user subscription data
      const { data: userData, error } = await supabase
        .from('users')
        .select('subscription_status, subscription_plan, trial_end')
        .eq('id', req.user.id)
        .single();

      if (error) {
        logger.dbError('users', 'select', error);
        return res.status(500).json({ error: 'Failed to check subscription' });
      }

      const now = new Date();
      const trialEnd = new Date(userData.trial_end);
      const isTrialExpired = now > trialEnd;
      const hasActiveSubscription = userData.subscription_status === 'active' || userData.subscription_status === 'trialing';

      // Check if trial is expired and no active subscription
      if (isTrialExpired && !hasActiveSubscription) {
        return res.status(403).json({ 
          error: 'Subscription required',
          trialExpired: true
        });
      }

      const userPlan = userData.subscription_plan || 'professional'; // Default to professional for trial users
      
      // Define plan hierarchy (higher plans include lower plan features)
      const planHierarchy = ['professional', 'enterprise', 'elite'];
      const userPlanIndex = planHierarchy.indexOf(userPlan);
      const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);

      if (userPlanIndex < requiredPlanIndex) {
        return res.status(403).json({ 
          error: 'Plan upgrade required',
          currentPlan: userPlan,
          requiredPlan: requiredPlan,
          upgradeRequired: true
        });
      }

      // Add plan info to request
      req.userPlan = {
        current: userPlan,
        status: userData.subscription_status,
        features: PLAN_FEATURES[userPlan]?.features || [],
        limitations: PLAN_FEATURES[userPlan]?.limitations || [],
        maxLocations: PLAN_FEATURES[userPlan]?.maxLocations || 25,
        maxUsers: PLAN_FEATURES[userPlan]?.maxUsers || 10
      };

      next();
    } catch (error) {
      logger.apiError(req.method, req.path, error);
      res.status(500).json({ error: 'Plan check failed' });
    }
  };
};

/**
 * Middleware to check if user has access to specific feature
 */
export const requireFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get user subscription data
      const { data: userData, error } = await supabase
        .from('users')
        .select('subscription_status, subscription_plan, trial_end')
        .eq('id', req.user.id)
        .single();

      if (error) {
        logger.dbError('users', 'select', error);
        return res.status(500).json({ error: 'Failed to check subscription' });
      }

      const now = new Date();
      const trialEnd = new Date(userData.trial_end);
      const isTrialExpired = now > trialEnd;
      const hasActiveSubscription = userData.subscription_status === 'active' || userData.subscription_status === 'trialing';

      // Check if trial is expired and no active subscription
      if (isTrialExpired && !hasActiveSubscription) {
        return res.status(403).json({ 
          error: 'Subscription required',
          trialExpired: true
        });
      }

      const userPlan = userData.subscription_plan || 'professional';
      const userFeatures = PLAN_FEATURES[userPlan]?.features || [];

      if (!userFeatures.includes(featureName)) {
        return res.status(403).json({ 
          error: 'Feature not available in current plan',
          currentPlan: userPlan,
          requiredFeature: featureName,
          upgradeRequired: true
        });
      }

      next();
    } catch (error) {
      logger.apiError(req.method, req.path, error);
      res.status(500).json({ error: 'Feature check failed' });
    }
  };
};

/**
 * Middleware to check usage limits
 */
export const checkUsageLimits = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user subscription data
    const { data: userData, error } = await supabase
      .from('users')
      .select('subscription_status, subscription_plan, trial_end')
      .eq('id', req.user.id)
      .single();

    if (error) {
      logger.dbError('users', 'select', error);
      return res.status(500).json({ error: 'Failed to check subscription' });
    }

    const userPlan = userData.subscription_plan || 'professional';
    const planLimits = PLAN_FEATURES[userPlan];

    if (!planLimits) {
      return res.status(500).json({ error: 'Invalid plan configuration' });
    }

    // Add usage limits to request
    req.usageLimits = {
      maxLocations: planLimits.maxLocations,
      maxUsers: planLimits.maxUsers,
      features: planLimits.features,
      limitations: planLimits.limitations
    };

    next();
  } catch (error) {
    logger.apiError(req.method, req.path, error);
    res.status(500).json({ error: 'Usage limits check failed' });
  }
};

/**
 * Middleware to check user permissions
 */
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // For now, we'll use a simple permission system
      // In a real app, you'd have a more sophisticated role-based system
      const userPermissions = req.user.user_metadata?.permissions || [];
      
      if (!userPermissions.includes(permission)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permission
        });
      }

      next();
    } catch (error) {
      logger.apiError(req.method, req.path, error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

/**
 * Middleware to rate limit requests
 */
export const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.user?.id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    recentRequests.push(now);
    requests.set(key, recentRequests);
    
    next();
  };
};

/**
 * Middleware to validate request body
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: error.details 
        });
      }
      next();
    } catch (error) {
      logger.apiError(req.method, req.path, error);
      res.status(500).json({ error: 'Validation failed' });
    }
  };
};

/**
 * Helper function to get user plan features
 */
export const getUserPlanFeatures = (plan) => {
  return PLAN_FEATURES[plan] || PLAN_FEATURES.professional;
};

/**
 * Helper function to check if user has feature access
 */
export const hasFeatureAccess = (userPlan, featureName) => {
  const planFeatures = PLAN_FEATURES[userPlan]?.features || [];
  return planFeatures.includes(featureName);
};

export default {
  authenticateUser,
  requireSubscription,
  requirePlan,
  requireFeature,
  checkUsageLimits,
  requirePermission,
  rateLimit,
  validateBody,
  getUserPlanFeatures,
  hasFeatureAccess
};
