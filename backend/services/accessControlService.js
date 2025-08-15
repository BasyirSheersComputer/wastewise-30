// accessControlService.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

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

class AccessControlService {
  constructor() {
    this.supabase = supabase;
  }

  /**
   * Get user's current plan and access information
   */
  async getUserAccess(userId) {
    try {
      const { data: userData, error } = await this.supabase
        .from('users')
        .select('subscription_status, subscription_plan, trial_end, trial_start')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('Error fetching user access data', error);
        throw error;
      }

      const now = new Date();
      const trialEnd = new Date(userData.trial_end);
      const trialStart = new Date(userData.trial_start);
      const isTrialExpired = now > trialEnd;
      const hasActiveSubscription = userData.subscription_status === 'active' || userData.subscription_status === 'trialing';

      const userPlan = userData.subscription_plan || 'professional';
      const planFeatures = PLAN_FEATURES[userPlan] || PLAN_FEATURES.professional;

      return {
        userId,
        plan: userPlan,
        planName: planFeatures.name,
        status: userData.subscription_status,
        isTrialExpired,
        hasActiveSubscription,
        trialStart: trialStart.toISOString(),
        trialEnd: trialEnd.toISOString(),
        daysLeft: Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24))),
        features: planFeatures.features,
        limitations: planFeatures.limitations,
        maxLocations: planFeatures.maxLocations,
        maxUsers: planFeatures.maxUsers,
        canAccess: !isTrialExpired || hasActiveSubscription
      };
    } catch (error) {
      logger.error('Error in getUserAccess', error);
      throw error;
    }
  }

  /**
   * Check if user has access to a specific feature
   */
  async hasFeatureAccess(userId, featureName) {
    try {
      const userAccess = await this.getUserAccess(userId);
      
      if (!userAccess.canAccess) {
        return {
          hasAccess: false,
          reason: 'subscription_required',
          message: 'Active subscription required'
        };
      }

      const hasFeature = userAccess.features.includes(featureName);
      
      return {
        hasAccess: hasFeature,
        reason: hasFeature ? 'granted' : 'plan_upgrade_required',
        message: hasFeature ? 'Access granted' : `Feature requires ${userAccess.planName} plan or higher`,
        currentPlan: userAccess.plan,
        requiredFeature: featureName
      };
    } catch (error) {
      logger.error('Error in hasFeatureAccess', error);
      throw error;
    }
  }

  /**
   * Check if user can perform an action based on usage limits
   */
  async checkUsageLimits(userId, action, currentUsage = {}) {
    try {
      const userAccess = await this.getUserAccess(userId);
      
      if (!userAccess.canAccess) {
        return {
          allowed: false,
          reason: 'subscription_required',
          message: 'Active subscription required'
        };
      }

      switch (action) {
        case 'add_location':
          if (userAccess.maxLocations === -1) {
            return { allowed: true, reason: 'unlimited' };
          }
          const locationCount = currentUsage.locations || 0;
          if (locationCount >= userAccess.maxLocations) {
            return {
              allowed: false,
              reason: 'limit_reached',
              message: `Maximum ${userAccess.maxLocations} locations reached`,
              current: locationCount,
              limit: userAccess.maxLocations
            };
          }
          return { allowed: true, reason: 'within_limit' };

        case 'add_user':
          if (userAccess.maxUsers === -1) {
            return { allowed: true, reason: 'unlimited' };
          }
          const userCount = currentUsage.users || 0;
          if (userCount >= userAccess.maxUsers) {
            return {
              allowed: false,
              reason: 'limit_reached',
              message: `Maximum ${userAccess.maxUsers} users reached`,
              current: userCount,
              limit: userAccess.maxUsers
            };
          }
          return { allowed: true, reason: 'within_limit' };

        default:
          return { allowed: true, reason: 'no_limit' };
      }
    } catch (error) {
      logger.error('Error in checkUsageLimits', error);
      throw error;
    }
  }

  /**
   * Get available plans for upgrade
   */
  async getAvailableUpgrades(userId) {
    try {
      const userAccess = await this.getUserAccess(userId);
      const planHierarchy = ['professional', 'enterprise', 'elite'];
      const currentPlanIndex = planHierarchy.indexOf(userAccess.plan);
      
      const availableUpgrades = planHierarchy
        .slice(currentPlanIndex + 1)
        .map(plan => ({
          plan,
          name: PLAN_FEATURES[plan].name,
          features: PLAN_FEATURES[plan].features,
          maxLocations: PLAN_FEATURES[plan].maxLocations,
          maxUsers: PLAN_FEATURES[plan].maxUsers
        }));

      return {
        currentPlan: userAccess.plan,
        currentPlanName: userAccess.planName,
        availableUpgrades
      };
    } catch (error) {
      logger.error('Error in getAvailableUpgrades', error);
      throw error;
    }
  }

  /**
   * Update user's subscription plan
   */
  async updateUserPlan(userId, newPlan) {
    try {
      if (!PLAN_FEATURES[newPlan]) {
        throw new Error(`Invalid plan: ${newPlan}`);
      }

      const { error } = await this.supabase
        .from('users')
        .update({
          subscription_plan: newPlan,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        logger.error('Error updating user plan', error);
        throw error;
      }

      logger.info('User plan updated', { userId, newPlan });
      
      // Return updated access information
      return await this.getUserAccess(userId);
    } catch (error) {
      logger.error('Error in updateUserPlan', error);
      throw error;
    }
  }

  /**
   * Get feature comparison between plans
   */
  getFeatureComparison() {
    const plans = Object.keys(PLAN_FEATURES);
    const allFeatures = new Set();
    
    plans.forEach(plan => {
      PLAN_FEATURES[plan].features.forEach(feature => allFeatures.add(feature));
    });

    const comparison = {};
    Array.from(allFeatures).forEach(feature => {
      comparison[feature] = {};
      plans.forEach(plan => {
        comparison[feature][plan] = PLAN_FEATURES[plan].features.includes(feature);
      });
    });

    return {
      plans: plans.map(plan => ({
        id: plan,
        name: PLAN_FEATURES[plan].name,
        maxLocations: PLAN_FEATURES[plan].maxLocations,
        maxUsers: PLAN_FEATURES[plan].maxUsers
      })),
      features: comparison
    };
  }

  /**
   * Validate if a plan transition is allowed
   */
  validatePlanTransition(fromPlan, toPlan) {
    const planHierarchy = ['professional', 'enterprise', 'elite'];
    const fromIndex = planHierarchy.indexOf(fromPlan);
    const toIndex = planHierarchy.indexOf(toPlan);

    if (fromIndex === -1 || toIndex === -1) {
      return {
        allowed: false,
        reason: 'invalid_plan',
        message: 'Invalid plan specified'
      };
    }

    // Allow upgrades and same plan, but not downgrades
    if (toIndex < fromIndex) {
      return {
        allowed: false,
        reason: 'downgrade_not_allowed',
        message: 'Plan downgrades are not allowed'
      };
    }

    return {
      allowed: true,
      reason: toIndex > fromIndex ? 'upgrade' : 'same_plan',
      message: toIndex > fromIndex ? 'Plan upgrade allowed' : 'Same plan'
    };
  }
}

export default new AccessControlService();
