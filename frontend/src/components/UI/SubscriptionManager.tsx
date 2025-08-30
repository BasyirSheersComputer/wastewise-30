import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  Building, 
  Wallet,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Crown,
  Shield,
  Zap,
  Users,
  TrendingUp,
  FileText,
  Download,
  Settings,
  HelpCircle
} from 'lucide-react';
import PaymentModal from './PaymentModal';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  company_name: string;
  company_size: string;
  business_type: string;
  locations: number;
  annual_revenue?: string;
  primary_goals: string[];
  team_size: number;
  timezone: string;
  created_at: string;
  last_login?: string;
}

interface SubscriptionData {
  trialStart: string;
  trialEnd: string;
  isTrialExpired: boolean;
  subscriptionStatus: string;
  subscriptionPlan: string;
  daysLeft: number;
  stripeCustomerId?: string;
  stripeSubscription?: {
    id: string;
    status: string;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
  };
}

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  stripePriceId: string;
}

interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  invoiceUrl?: string;
}

const SubscriptionManager: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [customerPortalUrl, setCustomerPortalUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
    fetchSubscriptionData();
    fetchPlans();
    fetchBillingHistory();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
      }
    } catch (error) {
      }
  };

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/billing/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/billing/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      }
    } catch (error) {
      }
  };

  const fetchBillingHistory = async () => {
    try {
      const response = await fetch('/api/billing/history');
      if (response.ok) {
        const data = await response.json();
        setBillingHistory(data.billingHistory);
      }
    } catch (error) {
      }
  };

  const handleUpgradePlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (_subscription: unknown) => {
    toast.success('Subscription upgraded successfully!');
    await fetchSubscriptionData();
    setShowPaymentModal(false);
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch('/api/billing/subscription', {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Subscription cancelled successfully');
        await fetchSubscriptionData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const openCustomerPortal = async () => {
    try {
      const response = await fetch('/api/billing/customer-portal', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        window.open(data.url, '_blank');
      } else {
        toast.error('Failed to open customer portal');
      }
    } catch (error) {
      toast.error('Failed to open customer portal');
    }
  };

  const extendTrial = async () => {
    try {
      const response = await fetch('/api/auth/extend-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days: 7 }),
      });

      if (response.ok) {
        toast.success('Trial extended by 7 days!');
        await fetchSubscriptionData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to extend trial');
      }
    } catch (error) {
      toast.error('Failed to extend trial');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscriptionData || !userProfile) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">Failed to load subscription data</span>
          </div>
        </div>
      </div>
    );
  }

  const currentPlan = plans.find(plan => plan.id === subscriptionData.subscriptionPlan);
  const planFeatures = currentPlan?.features || [];

  return (
    <div className="space-y-6">
      {/* Header with User Info */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {userProfile.first_name} {userProfile.last_name}
              </h1>
              <p className="text-blue-100">{userProfile.email}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5" />
              <span className="font-semibold">{currentPlan?.name || 'Free Plan'}</span>
            </div>
            <p className="text-blue-100 text-sm">
              {subscriptionData.subscriptionStatus === 'active' ? 'Active Subscription' : 'Trial Period'}
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4" />
            <span>{userProfile.company_name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>{userProfile.company_size} • {userProfile.team_size} team members</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>{userProfile.locations} location{userProfile.locations !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Subscription Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Subscription Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Subscription</h2>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Secure & Encrypted</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Trial Status */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Trial Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      subscriptionData.isTrialExpired 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {subscriptionData.isTrialExpired ? 'Expired' : 'Active'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Days Remaining</span>
                    <span className="font-semibold text-gray-900">{subscriptionData.daysLeft}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trial End Date</span>
                    <span className="text-sm text-gray-900">
                      {new Date(subscriptionData.trialEnd).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <Crown className="w-4 h-4 mr-2" />
                  Plan Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Plan</span>
                    <span className="font-semibold text-gray-900">
                      {currentPlan?.name || subscriptionData.subscriptionPlan}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      subscriptionData.subscriptionStatus === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : subscriptionData.subscriptionStatus === 'trial'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subscriptionData.subscriptionStatus}
                    </span>
                  </div>
                  
                  {subscriptionData.stripeSubscription && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Next Billing</span>
                      <span className="text-sm text-gray-900">
                        {new Date(subscriptionData.stripeSubscription.currentPeriodEnd * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              {subscriptionData.subscriptionStatus === 'trial' && !subscriptionData.isTrialExpired && (
                <button
                  onClick={extendTrial}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Extend Trial
                </button>
              )}
              
              {subscriptionData.stripeCustomerId && (
                <button
                  onClick={openCustomerPortal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium flex items-center"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Billing
                </button>
              )}
              
              {subscriptionData.subscriptionStatus === 'active' && (
                <button
                  onClick={handleCancelSubscription}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>

          {/* Plan Features */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Your Plan Features
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {planFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Billing History */}
          {billingHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Billing History
              </h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {billingHistory.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.currency} {item.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'paid' 
                              ? 'bg-green-100 text-green-800'
                              : item.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.invoiceUrl && (
                            <a
                              href={item.invoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Invoice
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Account Details
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{userProfile.email}</span>
              </div>
              
              {userProfile.phone_number && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{userProfile.phone_number}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Building className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{userProfile.company_name}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{userProfile.business_type}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{userProfile.locations} location{userProfile.locations !== 1 ? 's' : ''}</span>
              </div>
              
              {userProfile.annual_revenue && (
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Revenue: {userProfile.annual_revenue}</span>
                </div>
              )}
            </div>
          </div>

          {/* Available Plans */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h3>
            
            <div className="space-y-4">
              {plans.map((plan) => (
                <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{plan.name}</h4>
                    <span className="text-sm font-semibold text-gray-900">
                      {plan.currency} {plan.price}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-600">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handleUpgradePlan(plan)}
                    disabled={plan.id === subscriptionData.subscriptionPlan}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-medium ${
                      plan.id === subscriptionData.subscriptionPlan
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {plan.id === subscriptionData.subscriptionPlan ? 'Current Plan' : 'Upgrade'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Payment Methods
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm">Credit/Debit Cards</h4>
                <div className="flex space-x-2">
                  <div className="flex items-center space-x-1">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-600">Visa</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-600">Mastercard</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-600">AmEx</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm">Malaysian Methods</h4>
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <Building className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-gray-600">FPX Banking</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Wallet className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-gray-600">GrabPay</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Wallet className="w-4 h-4 text-orange-600" />
                    <span className="text-xs text-gray-600">Boost</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Need Help?</h4>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              Our support team is here to help with any questions about your subscription.
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          plan={selectedPlan}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default SubscriptionManager; 