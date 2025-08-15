// useAccessControl.ts
import { useState, useEffect, useCallback } from 'react';
import accessControlService, { 
  UserAccess, 
  FeatureAccess, 
  UsageLimits, 
  AvailableUpgrades, 
  UsageStats 
} from '../services/accessControlService';

export const useAccessControl = () => {
  const [userAccess, setUserAccess] = useState<UserAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user access on mount
  useEffect(() => {
    loadUserAccess();
  }, []);

  const loadUserAccess = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const access = await accessControlService.getUserAccess();
      setUserAccess(access);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user access');
      console.error('Error loading user access:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkFeatureAccess = useCallback(async (featureName: string): Promise<FeatureAccess> => {
    try {
      return await accessControlService.hasFeatureAccess(featureName);
    } catch (err) {
      console.error('Error checking feature access:', err);
      return {
        hasAccess: false,
        reason: 'error',
        message: 'Failed to check feature access'
      };
    }
  }, []);

  const checkUsageLimits = useCallback(async (action: string, currentUsage: any = {}): Promise<UsageLimits> => {
    try {
      return await accessControlService.checkUsageLimits(action, currentUsage);
    } catch (err) {
      console.error('Error checking usage limits:', err);
      return {
        allowed: false,
        reason: 'error',
        message: 'Failed to check usage limits'
      };
    }
  }, []);

  const getAvailableUpgrades = useCallback(async (): Promise<AvailableUpgrades | null> => {
    try {
      return await accessControlService.getAvailableUpgrades();
    } catch (err) {
      console.error('Error getting available upgrades:', err);
      return null;
    }
  }, []);

  const getUsageStats = useCallback(async (): Promise<UsageStats | null> => {
    try {
      return await accessControlService.getUsageStats();
    } catch (err) {
      console.error('Error getting usage stats:', err);
      return null;
    }
  }, []);

  const checkModuleAccess = useCallback(async (moduleName: string) => {
    try {
      return await accessControlService.checkModuleAccess(moduleName);
    } catch (err) {
      console.error('Error checking module access:', err);
      return {
        hasAccess: false,
        reason: 'error',
        message: 'Failed to check module access',
        module: moduleName,
        feature: ''
      };
    }
  }, []);

  // Convenience methods
  const canAccessFeature = useCallback((featureName: string): boolean => {
    if (!userAccess) return false;
    return userAccess.features.includes(featureName);
  }, [userAccess]);

  const canAccessModule = useCallback((moduleName: string): boolean => {
    if (!userAccess) return false;
    
    // Map module names to feature names
    const moduleToFeatureMap: Record<string, string> = {
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
    if (!featureName) return false;

    return userAccess.features.includes(featureName);
  }, [userAccess]);

  const isOnTrial = useCallback((): boolean => {
    if (!userAccess) return false;
    return !userAccess.isTrialExpired && userAccess.status === 'trialing';
  }, [userAccess]);

  const hasActiveSubscription = useCallback((): boolean => {
    if (!userAccess) return false;
    return userAccess.hasActiveSubscription;
  }, [userAccess]);

  const getPlanName = useCallback((): string => {
    if (!userAccess) return 'Professional';
    return userAccess.planName;
  }, [userAccess]);

  const getPlan = useCallback((): string => {
    if (!userAccess) return 'professional';
    return userAccess.plan;
  }, [userAccess]);

  const getDaysLeft = useCallback((): number => {
    if (!userAccess) return 0;
    return userAccess.daysLeft;
  }, [userAccess]);

  const canAccess = useCallback((): boolean => {
    if (!userAccess) return false;
    return userAccess.canAccess;
  }, [userAccess]);

  const getMaxLocations = useCallback((): number => {
    if (!userAccess) return 25;
    return userAccess.maxLocations;
  }, [userAccess]);

  const getMaxUsers = useCallback((): number => {
    if (!userAccess) return 10;
    return userAccess.maxUsers;
  }, [userAccess]);

  const getFeatures = useCallback((): string[] => {
    if (!userAccess) return [];
    return userAccess.features;
  }, [userAccess]);

  const getLimitations = useCallback((): string[] => {
    if (!userAccess) return [];
    return userAccess.limitations;
  }, [userAccess]);

  return {
    // State
    userAccess,
    loading,
    error,
    
    // Actions
    loadUserAccess,
    checkFeatureAccess,
    checkUsageLimits,
    getAvailableUpgrades,
    getUsageStats,
    checkModuleAccess,
    
    // Convenience methods
    canAccessFeature,
    canAccessModule,
    isOnTrial,
    hasActiveSubscription,
    getPlanName,
    getPlan,
    getDaysLeft,
    canAccess,
    getMaxLocations,
    getMaxUsers,
    getFeatures,
    getLimitations
  };
};

// Hook for checking specific feature access
export const useFeatureAccess = (featureName: string) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        setError(null);
        const access = await accessControlService.hasFeatureAccess(featureName);
        setHasAccess(access.hasAccess);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check feature access');
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [featureName]);

  return { hasAccess, loading, error };
};

// Hook for checking specific module access
export const useModuleAccess = (moduleName: string) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        setError(null);
        const access = await accessControlService.checkModuleAccess(moduleName);
        setHasAccess(access.hasAccess);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check module access');
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [moduleName]);

  return { hasAccess, loading, error };
};

// Hook for usage statistics
export const useUsageStats = () => {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const stats = await accessControlService.getUsageStats();
        setUsageStats(stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load usage stats');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return { usageStats, loading, error };
};
