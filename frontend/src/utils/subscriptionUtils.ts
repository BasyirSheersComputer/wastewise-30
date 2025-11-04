// subscriptionUtils.ts - Feature Access Control for Frontend
import { User } from '@supabase/supabase-js';

export type SubscriptionTier = 'free' | 'quick-win' | 'growth' | 'enterprise';
export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'past_due' | 'unpaid';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  trialEnd?: string;
  isTrialExpired: boolean;
  hasActiveSubscription: boolean;
  daysLeft: number;
}

// Feature mapping by tier (aligned with system prompts)
export const TIER_FEATURES = {
  'quick-win': {
    name: 'Quick Win Solution',
    price: 2997,
    features: [
      'ai_forecasting',       // AI Forecasting OR
      'waste_logging',        // Waste Logging OR
      'compliance'            // Compliance (choose ONE)
    ],
    modules: [
      'dashboard',            // Basic dashboard access
      'inventory',            // Basic inventory (read-only advanced features)
      'reports'               // Basic reports
    ],
    limits: {
      outlets: 5,
      users: 10,
      aiForecasting: 'basic',        // Basic AI
      wasteTracking: 'basic',        // Basic tracking
      complianceReports: 'basic',    // Basic compliance
      staffTraining: false,          // No staff training
      supplierIntegration: false,    // No supplier automation
      customIntegrations: false,     // No custom integrations
      dedicatedSupport: false        // Email/phone support only
    },
    outcomes: {
      wasteReduction: '20-30%',
      timeSaved: '10-15 hours/week',
      monthlySavings: 'RM 15,000-25,000',
      roi: '500-800%'
    }
  },
  'growth': {
    name: 'Growth System',
    price: 5997,
    setupFee: 4997,
    features: [
      'ai_forecasting',        // Full AI Forecasting
      'waste_logging',         // Full Waste Logging
      'compliance',            // Full Compliance
      'inventory_tracking',    // Real-time inventory
      'supplier_integration',  // Supplier integration
      'staff_training',        // Staff training included
      'menu_optimization',     // Menu optimization
      'demand_forecasting'     // Demand forecasting
    ],
    modules: [
      'dashboard',             // Full dashboard
      'waste',                 // Full waste analytics
      'inventory',             // Full inventory
      'forecast',              // Full forecasting
      'suppliers',             // Full supplier management
      'staff',                 // Full staff training
      'reports'                // Full reports
    ],
    limits: {
      outlets: 20,
      users: -1,  // Unlimited
      aiForecasting: 'advanced',
      wasteTracking: 'advanced',
      complianceReports: 'advanced',
      staffTraining: true,
      supplierIntegration: true,
      customIntegrations: false,
      dedicatedSupport: true,           // Dedicated success manager
      prioritySupport: '4-hour response'
    },
    outcomes: {
      wasteReduction: '35-45%',
      timeSaved: '20-30 hours/week',
      monthlySavings: 'RM 35,000-50,000',
      roi: '600-1000%',
      profitMarginIncrease: '10-15%'
    }
  },
  'enterprise': {
    name: 'Enterprise Transformation',
    price: 'Custom',
    features: [
      'ai_forecasting',
      'waste_logging',
      'compliance',
      'inventory_tracking',
      'supplier_integration',
      'staff_training',
      'menu_optimization',
      'demand_forecasting',
      'custom_integrations',       // Custom integrations
      'multi_location_dashboard',  // Multi-location dashboard
      'advanced_analytics',        // Advanced analytics
      'strategic_planning',        // Quarterly strategic planning
      'onsite_training',          // On-site training
      'white_label'               // White-label options
    ],
    modules: [
      'dashboard',
      'waste',
      'inventory',
      'forecast',
      'suppliers',
      'staff',
      'reports',
      'custom'  // Custom modules
    ],
    limits: {
      outlets: -1,  // Unlimited
      users: -1,    // Unlimited
      aiForecasting: 'enterprise',
      wasteTracking: 'enterprise',
      complianceReports: 'enterprise',
      staffTraining: true,
      supplierIntegration: true,
      customIntegrations: true,
      dedicatedSupport: true,
      prioritySupport: '24/7',
      technicalAccountManager: true
    },
    outcomes: {
      wasteReduction: '40-50%',
      operationalEfficiency: '50-70% improvement',
      monthlySavings: 'RM 100,000-300,000+',
      roi: '10-20x at scale',
      profitMarginIncrease: '12-18%'
    }
  }
};

// Check if user has access to a specific feature
export function hasFeatureAccess(
  subscriptionInfo: SubscriptionInfo,
  feature: string
): boolean {
  // Always deny if trial expired and no active subscription
  if (subscriptionInfo.isTrialExpired && !subscriptionInfo.hasActiveSubscription) {
    return false;
  }

  // Free tier has no feature access
  if (subscriptionInfo.tier === 'free') {
    return false;
  }

  const tierConfig = TIER_FEATURES[subscriptionInfo.tier];
  if (!tierConfig) {
    return false;
  }

  return tierConfig.features.includes(feature);
}

// Check if user has access to a specific module/page
export function hasModuleAccess(
  subscriptionInfo: SubscriptionInfo,
  module: string
): boolean {
  // Always deny if trial expired and no active subscription
  if (subscriptionInfo.isTrialExpired && !subscriptionInfo.hasActiveSubscription) {
    return false;
  }

  // Free tier has no module access
  if (subscriptionInfo.tier === 'free') {
    return false;
  }

  const tierConfig = TIER_FEATURES[subscriptionInfo.tier];
  if (!tierConfig) {
    return false;
  }

  return tierConfig.modules.includes(module);
}

// Get tier configuration
export function getTierConfig(tier: SubscriptionTier) {
  return TIER_FEATURES[tier] || null;
}

// Check if feature is limited in current tier
export function getFeatureLimit(
  subscriptionInfo: SubscriptionInfo,
  featureName: string
): any {
  const tierConfig = TIER_FEATURES[subscriptionInfo.tier];
  if (!tierConfig) {
    return null;
  }

  return tierConfig.limits[featureName as keyof typeof tierConfig.limits];
}

// Get upgrade message for locked feature
export function getUpgradeMessage(
  currentTier: SubscriptionTier,
  feature: string
): { title: string; message: string; suggestedTier: SubscriptionTier } {
  const messages: Record<string, any> = {
    supplier_integration: {
      title: 'Upgrade to Growth System',
      message: 'Automated supplier ordering saves 15-20 hours weekly and prevents RM 5-10k in stockout losses. Available in Growth System plan.',
      suggestedTier: 'growth'
    },
    staff_training: {
      title: 'Upgrade to Growth System',
      message: 'Staff training and certification programs included in Growth System plan.',
      suggestedTier: 'growth'
    },
    advanced_analytics: {
      title: 'Upgrade to Enterprise',
      message: 'Advanced analytics and custom reporting available in Enterprise plan.',
      suggestedTier: 'enterprise'
    },
    custom_integrations: {
      title: 'Upgrade to Enterprise',
      message: 'Custom integrations with existing POS/ERP systems available in Enterprise plan.',
      suggestedTier: 'enterprise'
    },
    multi_location_dashboard: {
      title: 'Upgrade to Enterprise',
      message: 'Multi-location centralized dashboard available in Enterprise plan.',
      suggestedTier: 'enterprise'
    }
  };

  return messages[feature] || {
    title: 'Upgrade Required',
    message: 'This feature is not available in your current plan.',
    suggestedTier: currentTier === 'quick-win' ? 'growth' : 'enterprise'
  };
}

// Module to tier mapping (which tier is required for each module)
export const MODULE_TIER_REQUIREMENTS: Record<string, SubscriptionTier> = {
  'dashboard': 'quick-win',       // Basic dashboard in all tiers
  'waste': 'growth',              // Full waste analytics requires Growth
  'inventory': 'quick-win',       // Basic in Quick Win, full in Growth
  'forecast': 'growth',           // AI forecasting available in Quick Win (limited) & Growth (full)
  'suppliers': 'growth',          // Supplier integration requires Growth
  'staff': 'growth',              // Staff training requires Growth
  'reports': 'quick-win',         // Basic reports in all tiers
  'settings': 'quick-win',        // Settings available to all
  'billing': 'quick-win'          // Billing available to all
};

// Check if user can access a route
export function canAccessRoute(
  subscriptionInfo: SubscriptionInfo,
  route: string
): { allowed: boolean; reason?: string; upgradeRequired?: SubscriptionTier } {
  // Extract module from route (e.g., /dashboard/suppliers -> suppliers)
  const moduleMatch = route.match(/\/dashboard\/(\w+)/);
  const module = moduleMatch ? moduleMatch[1] : 'dashboard';

  // Check if trial expired
  if (subscriptionInfo.isTrialExpired && !subscriptionInfo.hasActiveSubscription) {
    return {
      allowed: false,
      reason: 'subscription_required'
    };
  }

  // Check module access
  const requiredTier = MODULE_TIER_REQUIREMENTS[module];
  if (!requiredTier) {
    return { allowed: true };  // No restriction
  }

  // Check if user's tier is sufficient
  const tierHierarchy: SubscriptionTier[] = ['free', 'quick-win', 'growth', 'enterprise'];
  const userTierIndex = tierHierarchy.indexOf(subscriptionInfo.tier);
  const requiredTierIndex = tierHierarchy.indexOf(requiredTier);

  if (userTierIndex < requiredTierIndex) {
    return {
      allowed: false,
      reason: 'tier_upgrade_required',
      upgradeRequired: requiredTier
    };
  }

  return { allowed: true };
}

// Format tier name for display
export function formatTierName(tier: SubscriptionTier): string {
  const names: Record<SubscriptionTier, string> = {
    'free': 'Free Trial',
    'quick-win': 'Quick Win Solution',
    'growth': 'Growth System',
    'enterprise': 'Enterprise Transformation'
  };
  return names[tier] || 'Unknown';
}

// Get tier badge color
export function getTierBadgeColor(tier: SubscriptionTier): string {
  const colors: Record<SubscriptionTier, string> = {
    'free': 'bg-neutral-100 text-neutral-700',
    'quick-win': 'bg-primary-50 text-primary-700 border border-primary-200',
    'growth': 'bg-success-50 text-success-700 border border-success-200',
    'enterprise': 'bg-warning/10 text-warning border border-warning/20'
  };
  return colors[tier] || 'bg-neutral-100 text-neutral-700';
}

// Calculate ROI
export function calculateROI(tier: SubscriptionTier): {
  cost: string;
  savings: string;
  roi: string;
  payback: string;
} {
  if (tier === 'quick-win') {
    return {
      cost: 'RM 2,997/month',
      savings: 'RM 15,000-25,000/month',
      roi: '5-8x return',
      payback: 'First month'
    };
  } else if (tier === 'growth') {
    return {
      cost: 'RM 5,997/month + RM 4,997 setup',
      savings: 'RM 35,000-50,000/month',
      roi: '6-10x return',
      payback: 'Setup recovered in first month'
    };
  } else if (tier === 'enterprise') {
    return {
      cost: 'Custom pricing',
      savings: 'RM 100,000-300,000+/month',
      roi: '10-20x return at scale',
      payback: 'Custom timeline'
    };
  }
  
  return {
    cost: 'N/A',
    savings: 'N/A',
    roi: 'N/A',
    payback: 'N/A'
  };
}

// Get features comparison for upgrade modal
export function getFeaturesComparison(currentTier: SubscriptionTier, targetTier: SubscriptionTier) {
  const currentFeatures = TIER_FEATURES[currentTier]?.features || [];
  const targetFeatures = TIER_FEATURES[targetTier]?.features || [];
  
  const newFeatures = targetFeatures.filter(f => !currentFeatures.includes(f));
  
  return {
    current: currentFeatures,
    target: targetFeatures,
    new: newFeatures,
    currentLimits: TIER_FEATURES[currentTier]?.limits,
    targetLimits: TIER_FEATURES[targetTier]?.limits
  };
}

export default {
  hasFeatureAccess,
  hasModuleAccess,
  getTierConfig,
  getFeatureLimit,
  getUpgradeMessage,
  canAccessRoute,
  formatTierName,
  getTierBadgeColor,
  calculateROI,
  getFeaturesComparison,
  TIER_FEATURES,
  MODULE_TIER_REQUIREMENTS
};

