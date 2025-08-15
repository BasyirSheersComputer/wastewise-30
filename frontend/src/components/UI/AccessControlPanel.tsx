// AccessControlPanel.tsx
import React, { useState } from 'react';
import { useAccessControl } from '../../hooks/useAccessControl';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Shield, 
  Users, 
  MapPin, 
  Check, 
  X, 
  AlertTriangle, 
  ArrowUpRight,
  Calendar,
  Star
} from 'lucide-react';

interface AccessControlPanelProps {
  showUpgradeOptions?: boolean;
  showUsageStats?: boolean;
  showFeatureList?: boolean;
}

export default function AccessControlPanel({ 
  showUpgradeOptions = true, 
  showUsageStats = true, 
  showFeatureList = true 
}: AccessControlPanelProps) {
  const navigate = useNavigate();
  const { 
    userAccess, 
    loading, 
    error, 
    getAvailableUpgrades,
    getUsageStats,
    canAccess,
    getPlanName,
    getPlan,
    getDaysLeft,
    isOnTrial,
    hasActiveSubscription,
    getMaxLocations,
    getMaxUsers,
    getFeatures,
    getLimitations
  } = useAccessControl();

  const [upgrades, setUpgrades] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [loadingUpgrades, setLoadingUpgrades] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  React.useEffect(() => {
    if (showUpgradeOptions) {
      loadUpgrades();
    }
    if (showUsageStats) {
      loadUsageStats();
    }
  }, [showUpgradeOptions, showUsageStats]);

  const loadUpgrades = async () => {
    setLoadingUpgrades(true);
    try {
      const availableUpgrades = await getAvailableUpgrades();
      setUpgrades(availableUpgrades);
    } catch (error) {
      console.error('Error loading upgrades:', error);
    } finally {
      setLoadingUpgrades(false);
    }
  };

  const loadUsageStats = async () => {
    setLoadingStats(true);
    try {
      const stats = await getUsageStats();
      setUsageStats(stats);
    } catch (error) {
      console.error('Error loading usage stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">Error loading access information: {error}</span>
        </div>
      </div>
    );
  }

  if (!userAccess) {
    return null;
  }

  const planIcon = getPlan() === 'elite' ? Crown : getPlan() === 'enterprise' ? Star : Shield;

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              getPlan() === 'elite' ? 'bg-purple-100 text-purple-600' :
              getPlan() === 'enterprise' ? 'bg-blue-100 text-blue-600' :
              'bg-green-100 text-green-600'
            }`}>
              <planIcon className="w-5 h-5" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">{getPlanName()} Plan</h3>
              <p className="text-sm text-gray-500">
                {isOnTrial() ? 'Trial Period' : hasActiveSubscription() ? 'Active Subscription' : 'Inactive'}
              </p>
            </div>
          </div>
          {isOnTrial() && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Trial ends in</div>
              <div className="text-lg font-semibold text-orange-600">{getDaysLeft()} days</div>
            </div>
          )}
        </div>

        {!canAccess() && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">
                {isOnTrial() ? 'Trial has expired. Please upgrade to continue.' : 'Subscription required to access features.'}
              </span>
            </div>
          </div>
        )}

        {/* Usage Limits */}
        {showUsageStats && usageStats && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <MapPin className="w-4 h-4 mr-1" />
                Locations
              </div>
              <div className="text-lg font-semibold">
                {usageStats.locations.current}
                {!usageStats.locations.unlimited && ` / ${usageStats.locations.limit}`}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Users className="w-4 h-4 mr-1" />
                Users
              </div>
              <div className="text-lg font-semibold">
                {usageStats.users.current}
                {!usageStats.users.unlimited && ` / ${usageStats.users.limit}`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Available Features */}
      {showFeatureList && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {getFeatures().map((feature) => (
              <div key={feature} className="flex items-center text-sm">
                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700 capitalize">
                  {feature.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
          
          {getLimitations().length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Limitations</h4>
              <div className="space-y-1">
                {getLimitations().map((limitation) => (
                  <div key={limitation} className="flex items-center text-sm">
                    <X className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 capitalize">
                      {limitation.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upgrade Options */}
      {showUpgradeOptions && upgrades && upgrades.availableUpgrades.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Upgrades</h3>
          <div className="space-y-4">
            {upgrades.availableUpgrades.map((upgrade: any) => (
              <div key={upgrade.plan} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{upgrade.name}</h4>
                    <p className="text-sm text-gray-600">
                      Upgrade from {upgrades.currentPlanName}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <span>Upgrade</span>
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Locations:</span>
                    <span className="ml-1 font-medium">
                      {upgrade.maxLocations === -1 ? 'Unlimited' : upgrade.maxLocations}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Users:</span>
                    <span className="ml-1 font-medium">
                      {upgrade.maxUsers === -1 ? 'Unlimited' : upgrade.maxUsers}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">New Features:</h5>
                  <div className="flex flex-wrap gap-1">
                    {upgrade.features
                      .filter((feature: string) => !getFeatures().includes(feature))
                      .slice(0, 3)
                      .map((feature: string) => (
                        <span
                          key={feature}
                          className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          {feature.replace(/_/g, ' ')}
                        </span>
                      ))}
                    {upgrade.features.filter((feature: string) => !getFeatures().includes(feature)).length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{upgrade.features.filter((feature: string) => !getFeatures().includes(feature)).length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trial Warning */}
      {isOnTrial() && getDaysLeft() <= 7 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-orange-500 mr-2" />
            <div>
              <div className="text-orange-800 font-medium">Trial Ending Soon</div>
              <div className="text-orange-700 text-sm">
                Your trial ends in {getDaysLeft()} days. Upgrade now to continue using all features.
              </div>
            </div>
          </div>
          <div className="mt-3">
            <button
              onClick={() => navigate('/pricing')}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              View Plans
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
