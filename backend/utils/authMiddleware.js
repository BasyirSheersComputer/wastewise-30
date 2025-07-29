// authMiddleware.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

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
      .select('subscription_status, trial_end')
      .eq('id', req.user.id)
      .single();

    if (error) {
      logger.dbError('users', 'select', error);
      return res.status(500).json({ error: 'Failed to check subscription' });
    }

    const now = new Date();
    const trialEnd = new Date(userData.trial_end);
    const isTrialExpired = now > trialEnd;
    const hasActiveSubscription = userData.subscription_status === 'active';

    if (isTrialExpired && !hasActiveSubscription) {
      return res.status(403).json({ 
        error: 'Subscription required',
        trialExpired: true
      });
    }

    next();
  } catch (error) {
    logger.apiError(req.method, req.path, error);
    res.status(500).json({ error: 'Subscription check failed' });
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

export default {
  authenticateUser,
  requireSubscription,
  requirePermission,
  rateLimit,
  validateBody
};
