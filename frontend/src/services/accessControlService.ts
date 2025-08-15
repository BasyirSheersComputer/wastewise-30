// accessControlService.ts
import { supabase } from '../supabaseClient';

export interface UserAccess {
  userId: string;
  plan: string;
  planName: string;
  status: string;
  isTrialExpired: boolean;
  hasActiveSubscription: boolean;
  trialStart: string;
  trialEnd: string;
  daysLeft: number;
  features: string[];
  limitations: string[];
  maxLocations: number;
  maxUsers: number;
  canAccess: boolean;
}

export interface FeatureAccess {
  hasAccess: boolean;
  reason: string;
  message: string;
  currentPlan?: string;
  requiredFeature?: string;
}

export interface UsageLimits {
  allowed: boolean;
  reason: string;
  message: string;
  current?: number;
  limit?: number;
}

export interface PlanUpgrade {
  plan: string;
  name: string;
  features: string[];
  maxLocations: number;
  maxUsers: number;
}

export interface AvailableUpgrades {
  currentPlan: string;
  currentPlanName: string;
  availableUpgrades: PlanUpgrade[];
}

export interface UsageStats {
  locations: {
    current: number;
    limit: number;
    unlimited: boolean;
  };
  users: {
    current: number;
    limit: number;
    unlimited: boolean;
  };
  plan: string;
  planName: string;
}

class AccessControlService {
  private baseUrl = '/api/access-control';

  /**
   * Get user's current access information
   */
  async getUserAccess(): Promise<UserAccess> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${this.baseUrl}/user-access`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get user access');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user access:', error);
      throw error;
    }
  }

  /**
   * Check if user has access to a specific feature
   */
  async hasFeatureAccess(featureName: string): Promise<FeatureAccess> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${this.baseUrl}/feature-access/${featureName}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check feature access');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking feature access:', error);
      throw error;
    }
  }

  /**
   * Check usage limits for a specific action
   */
  async checkUsageLimits(action: string, currentUsage: any = {}): Promise<UsageLimits> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${this.baseUrl}/usage-limits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, currentUsage })
      });

      if (!response.ok) {
        throw new Error('Failed to check usage limits');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking usage limits:', error);
      throw error;
    }
  }

  /**
   * Get available plan upgrades
   */
  async getAvailableUpgrades(): Promise<AvailableUpgrades> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${this.baseUrl}/available-upgrades`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get available upgrades');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting available upgrades:', error);
      throw error;
    }
  }

  /**
   * Get feature comparison between plans
   */
  async getFeatureComparison(): Promise<any> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${this.baseUrl}/feature-comparison`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get feature comparison');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting feature comparison:', error);
      throw error;
    }
  }

  /**
   * Get user's current usage statistics
   */
  async getUsageStats(): Promise<UsageStats> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${this.baseUrl}/usage-stats`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get usage stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting usage stats:', error);
      throw error;
    }
  }

  /**
   * Check if user can access a specific module
   */
  async checkModuleAccess(moduleName: string): Promise<FeatureAccess & { module: string; feature: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${this.baseUrl}/module-access/${moduleName}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check module access');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking module access:', error);
      throw error;
    }
  }

  /**
   * Check if user can access a feature (cached version)
   */
  async canAccessFeature(featureName: string): Promise<boolean> {
    try {
      const access = await this.hasFeatureAccess(featureName);
      return access.hasAccess;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  /**
   * Check if user can access a module (cached version)
   */
  async canAccessModule(moduleName: string): Promise<boolean> {
    try {
      const access = await this.checkModuleAccess(moduleName);
      return access.hasAccess;
    } catch (error) {
      console.error('Error checking module access:', error);
      return false;
    }
  }

  /**
   * Get user's plan name
   */
  async getUserPlan(): Promise<string> {
    try {
      const access = await this.getUserAccess();
      return access.plan;
    } catch (error) {
      console.error('Error getting user plan:', error);
      return 'professional'; // Default fallback
    }
  }

  /**
   * Check if user is on trial
   */
  async isOnTrial(): Promise<boolean> {
    try {
      const access = await this.getUserAccess();
      return !access.isTrialExpired && access.status === 'trialing';
    } catch (error) {
      console.error('Error checking trial status:', error);
      return false;
    }
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const access = await this.getUserAccess();
      return access.hasActiveSubscription;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }
}

export default new AccessControlService();
