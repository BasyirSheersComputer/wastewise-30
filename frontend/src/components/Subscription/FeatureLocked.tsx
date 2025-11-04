// FeatureLocked.tsx - Component shown when feature is locked by subscription tier
import React from 'react';
import { Lock, TrendingUp, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { formatTierName, calculateROI } from '../../utils/subscriptionUtils';

interface FeatureLockedProps {
  feature: string;
  title?: string;
  message?: string;
  showInline?: boolean;  // Show inline vs modal
  onClose?: () => void;
}

export default function FeatureLocked({
  feature,
  title: customTitle,
  message: customMessage,
  showInline = false,
  onClose
}: FeatureLockedProps) {
  const navigate = useNavigate();
  const { subscription, getUpgradeInfo } = useSubscription();

  const upgradeInfo = getUpgradeInfo(feature);
  const title = customTitle || upgradeInfo.title;
  const message = customMessage || upgradeInfo.message;
  const suggestedTier = upgradeInfo.suggestedTier;
  const roi = calculateROI(suggestedTier);

  const handleUpgrade = () => {
    navigate(`/dashboard/billing?upgrade=${suggestedTier}`);
    if (onClose) onClose();
  };

  if (showInline) {
    // Inline locked feature display
    return (
      <div className="p-8 bg-gradient-to-br from-primary-50 to-white rounded-xl border-2 border-primary-200">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">{title}</h2>
          <p className="text-neutral-600 mb-6">{message}</p>
          
          {/* ROI Showcase */}
          <div className="bg-white rounded-lg border border-primary-200 p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Investment</p>
                <p className="text-lg font-bold text-neutral-900">{roi.cost}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Savings</p>
                <p className="text-lg font-bold text-success-600">{roi.savings}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">ROI</p>
                <p className="text-lg font-bold text-primary-600">{roi.roi}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard/billing')}
              className="px-6 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors font-medium text-neutral-700"
            >
              View All Plans
            </button>
            <button
              onClick={handleUpgrade}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium flex items-center gap-2"
            >
              <span>Upgrade to {formatTierName(suggestedTier)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Current Plan Info */}
          {subscription && (
            <p className="mt-4 text-sm text-neutral-500">
              Current Plan: {formatTierName(subscription.tier)}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Modal version
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <p className="text-neutral-600">{message}</p>
          </div>

          {/* ROI Showcase */}
          <div className="bg-gradient-to-br from-primary-50 to-white rounded-lg border border-primary-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h3 className="font-bold text-neutral-900">Return on Investment</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-neutral-600 mb-1">Investment</p>
                <p className="text-sm font-bold text-neutral-900">{roi.cost}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-600 mb-1">Savings</p>
                <p className="text-sm font-bold text-success-600">{roi.savings}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-600 mb-1">ROI</p>
                <p className="text-sm font-bold text-primary-600">{roi.roi}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-600 mb-1">Payback</p>
                <p className="text-sm font-bold text-neutral-900">{roi.payback}</p>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="mb-6">
            <h3 className="font-bold text-neutral-900 mb-3">What You'll Get:</h3>
            <div className="space-y-2">
              {feature === 'supplier_integration' && (
                <>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-success-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    </div>
                    <span className="text-neutral-700"><strong>Save 15-20 hours weekly</strong> on supplier coordination (RM 3,000-5,000 labor value)</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-success-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    </div>
                    <span className="text-neutral-700"><strong>Prevent RM 5-10k in stockout losses</strong> monthly through automated reordering</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-success-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    </div>
                    <span className="text-neutral-700"><strong>Automated ordering workflow</strong> - System generates purchase orders automatically</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-success-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    </div>
                    <span className="text-neutral-700"><strong>Zero stockouts guarantee</strong> - Never run out of critical ingredients</span>
                  </div>
                </>
              )}
              {feature === 'staff_training' && (
                <>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-success-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    </div>
                    <span className="text-neutral-700"><strong>Complete training for unlimited staff</strong> - No per-user fees</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-success-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    </div>
                    <span className="text-neutral-700"><strong>Waste reduction best practices</strong> - Proven methods to reduce waste by 35-45%</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-success-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    </div>
                    <span className="text-neutral-700"><strong>Progress tracking & certification</strong> - Track completion and issue certificates</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-success-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    </div>
                    <span className="text-neutral-700"><strong>Ongoing training updates</strong> - New content and improvements included</span>
                  </div>
                </>
              )}
              {(feature === 'custom_integrations' || feature === 'multi_location_dashboard') && (
                <>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-success-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    </div>
                    <span className="text-neutral-700"><strong>Custom POS/ERP integrations</strong> - Seamlessly connect existing systems</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-success-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    </div>
                    <span className="text-neutral-700"><strong>Multi-location centralized dashboard</strong> - Manage unlimited outlets from one place</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-success-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    </div>
                    <span className="text-neutral-700"><strong>Dedicated technical account manager</strong> - Direct access to technical experts</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-success-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    </div>
                    <span className="text-neutral-700"><strong>24/7 priority support</strong> - Response within minutes, not hours</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-success-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    </div>
                    <span className="text-neutral-700"><strong>40-50% waste reduction</strong> - Highest tier results with custom optimization</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Guarantee Badge */}
          <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-success-800 text-center">
              {suggestedTier === 'quick-win' && '✓ 30-Day Money-Back Guarantee - See measurable improvement or full refund'}
              {suggestedTier === 'growth' && '✓ 60-Day Savings Guarantee - Save minimum RM 30,000 monthly or pay nothing'}
              {suggestedTier === 'enterprise' && '✓ 90-Day Transformation Guarantee - Complete transformation or work for free until achieved'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                navigate('/dashboard/billing');
                if (onClose) onClose();
              }}
              className="w-full sm:flex-1 px-6 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors font-medium text-neutral-700"
            >
              View All Plans
            </button>
            <button
              onClick={handleUpgrade}
              className="w-full sm:flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <span>Upgrade Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Current Plan Info */}
          {subscription && (
            <p className="mt-4 text-center text-sm text-neutral-500">
              Current Plan: <span className="font-medium">{formatTierName(subscription.tier)}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

