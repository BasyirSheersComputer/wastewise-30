// SubscriptionContext.tsx - Subscription state management
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  SubscriptionInfo,
  SubscriptionTier,
  SubscriptionStatus,
  hasFeatureAccess,
  hasModuleAccess,
  canAccessRoute,
  getTierConfig,
  getUpgradeMessage
} from '../utils/subscriptionUtils';

interface SubscriptionContextType {
  subscription: SubscriptionInfo | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  hasFeature: (feature: string) => boolean;
  hasModule: (module: string) => boolean;
  canAccess: (route: string) => { allowed: boolean; reason?: string; upgradeRequired?: SubscriptionTier };
  getTierInfo: () => any;
  getUpgradeInfo: (feature: string) => { title: string; message: string; suggestedTier: SubscriptionTier };
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/billing/subscription`, {
        headers: {
          'Authorization': `Bearer ${user.session?.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      
      const subscriptionInfo: SubscriptionInfo = {
        tier: (data.subscriptionPlan || 'quick-win') as SubscriptionTier,
        status: (data.subscriptionStatus || 'trial') as SubscriptionStatus,
        trialEnd: data.trialEnd,
        isTrialExpired: data.isTrialExpired || false,
        hasActiveSubscription: ['active', 'trialing'].includes(data.subscriptionStatus),
        daysLeft: data.daysLeft || 0
      };

      setSubscription(subscriptionInfo);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Set default trial subscription on error
      setSubscription({
        tier: 'quick-win',
        status: 'trial',
        isTrialExpired: false,
        hasActiveSubscription: true,
        daysLeft: 30
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const hasFeature = (feature: string): boolean => {
    if (!subscription) return false;
    return hasFeatureAccess(subscription, feature);
  };

  const hasModule = (module: string): boolean => {
    if (!subscription) return false;
    return hasModuleAccess(subscription, module);
  };

  const canAccess = (route: string) => {
    if (!subscription) {
      return { allowed: false, reason: 'no_subscription' };
    }
    return canAccessRoute(subscription, route);
  };

  const getTierInfo = () => {
    if (!subscription) return null;
    return getTierConfig(subscription.tier);
  };

  const getUpgradeInfo = (feature: string) => {
    const currentTier = subscription?.tier || 'quick-win';
    return getUpgradeMessage(currentTier, feature);
  };

  const value: SubscriptionContextType = {
    subscription,
    loading,
    error,
    refreshSubscription: fetchSubscription,
    hasFeature,
    hasModule,
    canAccess,
    getTierInfo,
    getUpgradeInfo
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

export default SubscriptionContext;

