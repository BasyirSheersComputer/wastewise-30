// ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAccessControl } from '../../hooks/useAccessControl';
import { AlertTriangle, Crown, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredFeature?: string;
  requiredModule?: string;
  requiredPlan?: 'professional' | 'enterprise' | 'elite';
  showUpgradePrompt?: boolean;
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requiredFeature,
  requiredModule,
  requiredPlan,
  showUpgradePrompt = true,
  fallbackPath = '/dashboard'
}: ProtectedRouteProps) {
  const location = useLocation();
  const {
    userAccess,
    loading,
    error,
    canAccess,
    canAccessFeature,
    canAccessModule,
    getPlan,
    getPlanName,
    isOnTrial,
    hasActiveSubscription
  } = useAccessControl();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Error</h2>
          <p className="text-gray-600 mb-4">Unable to verify your access permissions.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check if user has basic access
  if (!canAccess()) {
    if (isOnTrial()) {
      return <Navigate to="/trial-expired" state={{ from: location }} replace />;
    } else {
      return <Navigate to="/subscription-required" state={{ from: location }} replace />;
    }
  }

  // Check required feature
  if (requiredFeature && !canAccessFeature(requiredFeature)) {
    if (showUpgradePrompt) {
      return <FeatureUpgradePrompt feature={requiredFeature} from={location.pathname} />;
    } else {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // Check required module
  if (requiredModule && !canAccessModule(requiredModule)) {
    if (showUpgradePrompt) {
      return <ModuleUpgradePrompt module={requiredModule} from={location.pathname} />;
    } else {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // Check required plan
  if (requiredPlan) {
    const planHierarchy = ['professional', 'enterprise', 'elite'];
    const userPlanIndex = planHierarchy.indexOf(getPlan());
    const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);

    if (userPlanIndex < requiredPlanIndex) {
      if (showUpgradePrompt) {
        return <PlanUpgradePrompt requiredPlan={requiredPlan} from={location.pathname} />;
      } else {
        return <Navigate to={fallbackPath} replace />;
      }
    }
  }

  // All checks passed, render children
  return <>{children}</>;
}

// Feature Upgrade Prompt Component
function FeatureUpgradePrompt({ feature, from }: { feature: string; from: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <Lock className="w-16 h-16 text-purple-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Feature Not Available</h2>
        <p className="text-gray-600 mb-6">
          The <span className="font-semibold">{feature.replace(/_/g, ' ')}</span> feature is not available in your current plan.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            View Plans
          </button>
        </div>
      </div>
    </div>
  );
}

// Module Upgrade Prompt Component
function ModuleUpgradePrompt({ module, from }: { module: string; from: string }) {
  const moduleNames: Record<string, string> = {
    'dashboard': 'Operational Intelligence',
    'inventory': 'Recipe & Inventory',
    'forecasting': 'Demand Forecasting',
    'waste': 'Waste Tracking',
    'suppliers': 'Suppliers',
    'menu': 'Menu Optimization',
    'training': 'Staff Training',
    'reports': 'Reports & Compliance',
    'csv': 'CSV Upload',
    'issues': 'Issue Reporting',
    'ai-training': 'Custom AI Training',
    'white-label': 'White Label',
    'integrations': 'Custom Integrations',
    'support': 'Dedicated Support',
    'implementation': 'Custom Implementation',
    'ai-development': 'Custom AI Development',
    'engineering': 'Dedicated Engineering',
    'consulting': 'Strategic Consulting',
    'priority': 'Priority Development',
    'international': 'International Expansion'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <Lock className="w-16 h-16 text-purple-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Module Not Available</h2>
        <p className="text-gray-600 mb-6">
          The <span className="font-semibold">{moduleNames[module] || module}</span> module is not available in your current plan.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            View Plans
          </button>
        </div>
      </div>
    </div>
  );
}

// Plan Upgrade Prompt Component
function PlanUpgradePrompt({ requiredPlan, from }: { requiredPlan: string; from: string }) {
  const planNames: Record<string, string> = {
    'professional': 'Professional',
    'enterprise': 'Enterprise',
    'elite': 'Elite'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <Crown className="w-16 h-16 text-purple-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Plan Upgrade Required</h2>
        <p className="text-gray-600 mb-6">
          This feature requires the <span className="font-semibold">{planNames[requiredPlan]}</span> plan or higher.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
}

// Higher-order component for protecting components
export function withAccessControl<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
